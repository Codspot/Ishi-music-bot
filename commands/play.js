const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music from various sources")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Song name, YouTube URL, Spotify URL, or search query")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("skip")
        .setDescription("Skip the current song and play this one immediately")
        .setRequired(false)
    ),

  async execute(interaction) {
    const rawQuery = interaction.options.getString("song");
    const skip = interaction.options.getBoolean("skip") || false;

    // Clean the query string - remove any potential prefixes
    let query = rawQuery;
    if (rawQuery.startsWith("song: ")) {
      query = rawQuery.substring(6).trim();
    }

    // Validate query
    if (!query || query.length === 0) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Invalid Query",
            "Please provide a valid song name, URL, or search query!"
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if user is in a voice channel
    if (!interaction.member.voice?.channel) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Voice Channel Required",
            "You need to join a voice channel first!"
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check bot permissions
    const permissions = interaction.member.voice.channel.permissionsFor(
      interaction.guild.members.me
    );
    if (
      !permissions.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])
    ) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Missing Permissions",
            "I need permission to join and speak in your voice channel!"
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Defer reply immediately to prevent timeout
    await interaction.deferReply();

    try {
      // Show immediate feedback
      await interaction.editReply({
        embeds: [
          Utils.createInfoEmbed(
            "🔍 Processing Request",
            `Searching for: **${query}**\n\n${
              skip ? "⏭️ Will skip current song" : "📝 Will add to queue"
            }`
          ),
        ],
      });

      // Enhanced search strategies with better fallbacks
      const isProduction = process.env.NODE_ENV === "production";

      // Check if it's already a Spotify URL
      const isSpotifyUrl =
        query.includes("spotify.com") || query.includes("spotify:");

      // Check if it's a YouTube URL
      const isYouTubeUrl =
        query.includes("youtube.com") || query.includes("youtu.be");

      const searchStrategies = isSpotifyUrl
        ? [
            query, // Direct Spotify URL - will use Spotify metadata
          ]
        : isYouTubeUrl
        ? [
            query, // Direct YouTube URL
            `ytsearch:${query.split("&")[0]}`, // Clean YouTube search as fallback
            `scsearch:${query}`, // SoundCloud fallback
          ]
        : isProduction
        ? [
            // For Production: Spotify first, then multiple YouTube strategies, then SoundCloud
            query, // Original query (Spotify plugin will search first due to plugin order)
            `scsearch:${query}`, // SoundCloud first as it's more reliable
            `ytsearch:${query} official`, // YouTube with "official" keyword
            `ytsearch:${query} audio`, // YouTube with "audio" keyword
            `ytsearch:${query}`, // Basic YouTube search
          ]
        : [
            // For local development: Multiple strategies
            query, // Original query (tries Spotify first due to plugin order)
            `scsearch:${query}`, // SoundCloud fallback
            `ytsearch:${query}`, // YouTube fallback
          ];

      let lastError = null;
      let attemptCount = 0;
      let hasResponded = false;

      for (const searchQuery of searchStrategies) {
        try {
          attemptCount++;
          console.log(
            `🔍 Attempt ${attemptCount}: Trying ${searchQuery.substring(
              0,
              50
            )}...`
          );

          // Add progressive delay between attempts for rate limiting
          if (attemptCount > 1 && isProduction) {
            const delay = Math.min(attemptCount * 1000, 3000); // Progressive delay, max 3 seconds
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          if (skip) {
            // Skip current song and play new one
            interaction.client.distube.play(
              interaction.member.voice.channel,
              searchQuery,
              {
                textChannel: interaction.channel,
                member: interaction.member,
                skip: true,
              }
            );
          } else {
            // Add to queue
            interaction.client.distube.play(
              interaction.member.voice.channel,
              searchQuery,
              {
                textChannel: interaction.channel,
                member: interaction.member,
              }
            );
          }

          // If we get here, the search was successful
          console.log(`✅ Successfully processed: ${query}`);
          hasResponded = true;
          
          // Respond immediately to prevent interaction timeout
          // DisTube will handle the detailed success message through events
          return await interaction.editReply({
            embeds: [
              Utils.createSuccessEmbed(
                "✅ Request Processed",
                `Processing: **${query}**\n\n${
                  skip ? "⏭️ Will skip current song" : "📝 Will add to queue"
                }\n\n*Loading...*`
              ),
            ],
          });
        } catch (searchError) {
          console.log(
            `❌ Attempt ${attemptCount} failed: ${searchError.message}`
          );
          lastError = searchError;

          // If it's a YouTube bot detection error, skip remaining YouTube strategies
          if (
            searchError.message?.includes("Sign in to confirm") ||
            searchError.message?.includes("bot")
          ) {
            console.log(
              "🤖 Bot detection encountered, skipping to SoundCloud..."
            );
            // Skip to SoundCloud strategies
            const scIndex = searchStrategies.findIndex((s) =>
              s.startsWith("scsearch:")
            );
            if (scIndex > -1 && attemptCount < scIndex + 1) {
              attemptCount = scIndex;
            }
          }

          continue; // Try next strategy
        }
      }

      // If all strategies failed, throw the last error
      throw lastError;
    } catch (error) {
      console.error(`❌ Play command error for "${query}":`, error.message);

      let errorMessage = "Failed to play the requested track.";
      if (
        error.message.includes("No result") ||
        error.message.includes("not found")
      ) {
        errorMessage = `No tracks found for: **${query}**\n\nTry:\n• Different search terms\n• A direct YouTube/Spotify URL\n• Artist + Song name format`;
      } else if (error.message.includes("Permissions")) {
        errorMessage = "I don't have permission to join your voice channel.";
      } else if (
        error.message.includes("age") ||
        error.message.includes("Sign in to confirm")
      ) {
        errorMessage =
          "This content is age-restricted or requires sign-in. Try a different source.";
      } else if (
        error.message.includes("bot") ||
        error.message.includes("Bot")
      ) {
        errorMessage =
          "YouTube access is currently limited. Try using a Spotify URL or different search terms.";
      } else if (
        error.message.includes("region") ||
        error.message.includes("blocked")
      ) {
        errorMessage = "This content is not available in your region.";
      }

      try {
        return await interaction.editReply({
          embeds: [Utils.createErrorEmbed("Playback Error", errorMessage)],
        });
      } catch (replyError) {
        console.error("Failed to send error reply:", replyError);
        // If interaction has expired, try to send a new message to the channel
        try {
          const embed = Utils.createErrorEmbed("Playback Error", errorMessage);
          await interaction.channel.send({ embeds: [embed] });
        } catch (channelError) {
          console.error("Failed to send message to channel:", channelError);
        }
      }
    }
  },
  cooldown: config.cooldowns.play,
};
