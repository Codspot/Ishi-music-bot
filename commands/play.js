const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Utils = require("../utils");
con          // Add progressive delay between attempts for rate limiting
          if (attemptCount > 1 && isProduction) {
            const delay = Math.min(attemptCount * 500, 2000); // Progressive delay, max 2 seconds
            await new Promise(resolve => setTimeout(resolve, delay));
          }nfig = require("../config");

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

    console.log(`[DEBUG] Raw query: "${rawQuery}"`);
    console.log(`[DEBUG] Cleaned query: "${query}"`);

    // Validate query
    if (!query || query.length === 0) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Invalid Query",
            "Please provide a valid song name, URL, or search query!"
          ),
        ],
        ephemeral: true,
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
        ephemeral: true,
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
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      console.log(`[DEBUG] Playing with Distube: "${query}"`);

      // Spotify-priority search strategies for better metadata and quality
      const isProduction = process.env.NODE_ENV === "production";
      
      const searchStrategies = isProduction ? [
        // For Production: Spotify-first with comprehensive fallbacks
        query, // Original query (tries Spotify first, then resolves to YouTube/SoundCloud)
        `spsearch:${query}`, // Explicit Spotify search
        `spsearch:${query} official`, // Spotify with "official" keyword
        `ytsearch:${query}`, // YouTube search
        `ytsearch:${query} official`, // YouTube with "official" keyword
        `ytsearch:${query} music video`, // YouTube with "music video"
        `scsearch:${query}`, // SoundCloud as final fallback
      ] : [
        // For local development: Spotify priority with fewer attempts
        query, // Original query (tries Spotify first)
        `spsearch:${query}`, // Spotify search
        `ytsearch:${query}`, // YouTube search
        `ytsearch:${query} official`, // YouTube with keywords
        `scsearch:${query}`, // SoundCloud fallback
      ];

      let lastError = null;
      let attemptCount = 0;

      for (const searchQuery of searchStrategies) {
        try {
          attemptCount++;
          console.log(
            `[DEBUG] Attempt ${attemptCount}: Trying search strategy: ${searchQuery}`
          );

          // Add progressive delay between attempts to avoid rate limiting
          if (attemptCount > 1 && isRender) {
            const delay = Math.min(attemptCount * 500, 2000); // Progressive delay, max 2 seconds
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          if (skip) {
            // Skip current song and play new one
            await interaction.client.distube.play(
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
            await interaction.client.distube.play(
              interaction.member.voice.channel,
              searchQuery,
              {
                textChannel: interaction.channel,
                member: interaction.member,
              }
            );
          }

          // If we get here, the search was successful
          return interaction.editReply({
            embeds: [
              Utils.createInfoEmbed(
                "🎵 Processing Request",
                `Searching and processing: **${query}**\n\n${
                  skip ? "⏭️ Will skip current song" : "📝 Will add to queue"
                }`
              ),
            ],
          });
        } catch (searchError) {
          console.log(
            `[DEBUG] Search strategy "${searchQuery}" failed:`,
            searchError.message
          );
          lastError = searchError;
          continue; // Try next strategy
        }
      }

      // If all strategies failed, throw the last error
      throw lastError;
    } catch (error) {
      console.error("Play command error:", error);

      let errorMessage = "Failed to play the requested track.";
      if (
        error.message.includes("No result") ||
        error.message.includes("not found")
      ) {
        errorMessage = `No tracks found for: **${query}**\n\nTry:\n• Different search terms\n• A direct YouTube/Spotify URL\n• Artist + Song name format`;
      } else if (error.message.includes("Permissions")) {
        errorMessage = "I don't have permission to join your voice channel.";
      } else if (error.message.includes("age")) {
        errorMessage = "This video is age-restricted and cannot be played.";
      }

      return interaction.editReply({
        embeds: [Utils.createErrorEmbed("Playback Error", errorMessage)],
      });
    }
  },
  cooldown: config.cooldowns.play,
};
