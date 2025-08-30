const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
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

      // Render-optimized search strategies (prioritize reliable sources)
      const isRender =
        process.env.RENDER === "true" || process.env.NODE_ENV === "production";

      const searchStrategies = isRender
        ? [
            // For Render: Prioritize SoundCloud heavily to avoid YouTube bot detection
            `scsearch:${query}`, // SoundCloud first (most reliable on cloud)
            `scsearch:${query} official`, // SoundCloud with "official" keyword
            query, // Original query as fallback
          ]
        : [
            // For local development: Try all sources
            `scsearch:${query}`, // SoundCloud first
            query, // Original query (tries all sources)
            `ytsearch:${query}`, // YouTube search as fallback
          ];

      let lastError = null;

      for (const searchQuery of searchStrategies) {
        try {
          console.log(`[DEBUG] Trying search strategy: ${searchQuery}`);

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
