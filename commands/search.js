const {
  SlashCommandBuilder,
    // Clean the query string - remove any potential prefixes
    let query = rawQuery;
    if (rawQuery.startsWith("song: ")) {
      query = rawQuery.substring(6).trim();
    }uilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for music and choose from results")
    .addStringOption((option) =>
      option.setName("query").setDescription("Search query").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("source")
        .setDescription("Search source")
        .setRequired(false)
        .addChoices(
          { name: "YouTube", value: "youtube" },
          { name: "SoundCloud", value: "soundcloud" }
        )
    ),

  async execute(interaction) {
    const rawQuery = interaction.options.getString("query");
    const source = interaction.options.getString("source") || "youtube";

    // Clean the query string - remove any potential prefixes
    let query = rawQuery;
    if (rawQuery.startsWith("query: ")) {
      query = rawQuery.substring(7).trim();
    }

    console.log(`[DEBUG] Search - Raw query: "${rawQuery}"`);
    console.log(`[DEBUG] Search - Cleaned query: "${query}"`);

    // Validate query
    if (!query || query.length === 0) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Invalid Query",
            "Please provide a valid search query!"
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

    await interaction.deferReply();

    try {
      // Use Distube's search functionality
      const searchResults = await interaction.client.distube.search(query, {
        limit: 10,
        type: "video",
        safeSearch: false,
      });

      if (!searchResults || !searchResults.length) {
        return interaction.editReply({
          embeds: [
            Utils.createErrorEmbed(
              "No Results",
              "No tracks found for your search query."
            ),
          ],
        });
      }

      const tracks = searchResults.slice(0, 10); // Limit to 10 results

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`🎵 Search Results`)
        .setDescription(`Found ${tracks.length} results for: **${query}**`)
        .setFooter({ text: "Select a track from the dropdown menu below" })
        .setTimestamp();

      // Create select menu options
      const options = tracks.map((track, index) => ({
        label:
          track.name && track.name.length > 100
            ? track.name.substring(0, 97) + "..."
            : track.name || "Unknown Title",
        description: `${
          track.uploader?.name || "Unknown"
        } • ${Utils.formatDuration(track.duration || 0)}`,
        value: index.toString(),
        emoji: "🎵",
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("track_select")
        .setPlaceholder("Choose a track to play...")
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const response = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      // Create collector for select menu interaction
      const filter = (i) =>
        i.customId === "track_select" && i.user.id === interaction.user.id;
      const collector = response.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (selectInteraction) => {
        const selectedIndex = parseInt(selectInteraction.values[0]);
        const selectedTrack = tracks[selectedIndex];

        await selectInteraction.deferUpdate();

        try {
          await interaction.client.distube.play(
            interaction.member.voice.channel,
            selectedTrack.url,
            {
              textChannel: interaction.channel,
              member: interaction.member,
            }
          );

          const playEmbed = Utils.createSuccessEmbed(
            "Track Selected",
            `🎵 **${selectedTrack.name}**\nBy: ${
              selectedTrack.uploader?.name || "Unknown"
            }\nDuration: ${Utils.formatDuration(selectedTrack.duration || 0)}`
          );

          if (selectedTrack.thumbnail) {
            playEmbed.setThumbnail(selectedTrack.thumbnail);
          }

          playEmbed.setFooter({ text: "Track selected from search results" });

          await selectInteraction.editReply({
            embeds: [playEmbed],
            components: [],
          });
        } catch (error) {
          console.error("Search play error:", error);
          await selectInteraction.editReply({
            embeds: [
              Utils.createErrorEmbed(
                "Playback Error",
                "Failed to play the selected track."
              ),
            ],
            components: [],
          });
        }
      });

      collector.on("end", async (collected) => {
        if (collected.size === 0) {
          await interaction.editReply({
            embeds: [
              Utils.createErrorEmbed(
                "Search Timeout",
                "Search selection timed out. Please try again."
              ),
            ],
            components: [],
          });
        }
      });
    } catch (error) {
      console.error("Search command error:", error);
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Search Error",
            "Failed to search for tracks. Please try again."
          ),
        ],
      });
    }
  },

  cooldown: 3,
};
