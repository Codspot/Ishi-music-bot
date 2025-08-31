const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music from various sources")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Song name, Spotify URL, SoundCloud URL, or search query")
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

    // Defer reply IMMEDIATELY to prevent timeout - do this before any other operations
    await interaction.deferReply();

    // Clean the query string - remove any potential prefixes
    let query = rawQuery;
    if (rawQuery.startsWith("song: ")) {
      query = rawQuery.substring(6).trim();
    }

    // Validate query
    if (!query || query.length === 0) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Invalid Query",
            "Please provide a valid song name, URL, or search query!"
          ),
        ],
      });
    }

    // Check if user is in a voice channel
    if (!interaction.member.voice?.channel) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Voice Channel Required",
            "You need to join a voice channel first!"
          ),
        ],
      });
    }

    // Check bot permissions
    const permissions = interaction.member.voice.channel.permissionsFor(
      interaction.guild.members.me
    );
    if (
      !permissions.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])
    ) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Missing Permissions",
            "I need permission to join and speak in your voice channel!"
          ),
        ],
      });
    }

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

      // Enhanced search strategies with Spotify metadata and SoundCloud audio
      const isProduction = process.env.NODE_ENV === "production";

      // Check if it's already a Spotify URL
      const isSpotifyUrl =
        query.includes("spotify.com") || query.includes("spotify:");

      // Check if it's a SoundCloud URL
      const isSoundCloudUrl =
        query.includes("soundcloud.com") || query.includes("scsearch:");

      const searchStrategies = isSpotifyUrl
        ? [
            query, // Direct Spotify URL - will use Spotify metadata and find alternative audio
          ]
        : isSoundCloudUrl
        ? [
            query, // Direct SoundCloud URL or search
          ]
        : [
            // For any search query: try Spotify first for metadata, then SoundCloud
            query, // Original query (Spotify plugin will search first for metadata)
            `scsearch:${query}`, // SoundCloud search
            `scsearch:${query} official`, // SoundCloud with "official" keyword
            `scsearch:${query} audio`, // SoundCloud with "audio" keyword
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

          // Start DisTube operation with timeout protection
          const playPromise = skip
            ? interaction.client.distube.play(
                interaction.member.voice.channel,
                searchQuery,
                {
                  textChannel: interaction.channel,
                  member: interaction.member,
                  skip: true,
                }
              )
            : interaction.client.distube.play(
                interaction.member.voice.channel,
                searchQuery,
                {
                  textChannel: interaction.channel,
                  member: interaction.member,
                }
              );

          // Set a timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Operation timeout")), 10000); // 10 second timeout
          });

          try {
            // Race between the play operation and timeout
            await Promise.race([playPromise, timeoutPromise]);
          } catch (timeoutError) {
            if (timeoutError.message === "Operation timeout") {
              // If it times out, just continue - DisTube will handle it asynchronously
              console.log(
                `⏰ Play operation timed out for: ${query}, continuing in background`
              );
            } else {
              throw timeoutError; // Re-throw other errors
            }
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

          // If it's a rate limiting error, add delay before next attempt
          if (
            searchError.message?.includes("rate limit") ||
            searchError.message?.includes("too many requests")
          ) {
            console.log(
              "⏱️ Rate limit encountered, adding delay before next attempt..."
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
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
        errorMessage = `No tracks found for: **${query}**\n\nTry:\n• Different search terms\n• A direct Spotify/SoundCloud URL\n• Artist + Song name format`;
      } else if (error.message.includes("Permissions")) {
        errorMessage = "I don't have permission to join your voice channel.";
      } else if (
        error.message.includes("age") ||
        error.message.includes("restricted")
      ) {
        errorMessage =
          "This content is age-restricted or not available. Try a different source.";
      } else if (
        error.message.includes("region") ||
        error.message.includes("blocked")
      ) {
        errorMessage = "This content is not available in your region.";
      } else if (
        error.message.includes("rate limit") ||
        error.message.includes("too many requests")
      ) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
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
