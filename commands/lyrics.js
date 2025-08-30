const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription(
      "Get lyrics for the current song or search for a specific song"
    )
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription(
          "Song to search lyrics for (leave empty for current song)"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const songQuery = interaction.options.getString("song");

    let trackTitle, trackArtist;

    if (songQuery) {
      // User provided a specific song to search
      const parts = songQuery.split(" - ");
      if (parts.length >= 2) {
        trackArtist = parts[0].trim();
        trackTitle = parts[1].trim();
      } else {
        trackTitle = songQuery;
        trackArtist = "";
      }
    } else {
      // Use current playing song
      if (!queue || !queue.songs.length) {
        return interaction.reply({
          embeds: [
            Utils.createErrorEmbed(
              "Nothing Playing",
              "There is no music currently playing! Use `/lyrics <song>` to search for specific lyrics."
            ),
          ],
          ephemeral: true,
        });
      }

      const currentSong = queue.songs[0];
      trackTitle = currentSong.name;
      trackArtist = currentSong.uploader?.name || "";
    }

    await interaction.deferReply();

    try {
      // Since we don't have built-in lyrics support with Distube,
      // we'll provide helpful search links
      const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle(`🎵 Lyrics Search`)
        .setDescription(
          `Search for lyrics: **${trackTitle}** ${
            trackArtist ? `by **${trackArtist}**` : ""
          }`
        )
        .addFields({
          name: "Search Manually",
          value: `🔍 [Search on Genius](https://genius.com/search?q=${encodeURIComponent(
            `${trackArtist} ${trackTitle}`
          )})
            📱 [Search on Google](https://www.google.com/search?q=${encodeURIComponent(
              `${trackArtist} ${trackTitle} lyrics`
            )})
            🎤 [Search on AZLyrics](https://search.azlyrics.com/search.php?q=${encodeURIComponent(
              `${trackArtist} ${trackTitle}`
            )})`,
        })
        .setFooter({
          text: "Lyrics feature is not yet implemented with the new music engine",
        })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Lyrics command error:", error);
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Lyrics Error",
            "Failed to process lyrics request. Please try again later."
          ),
        ],
      });
    }
  },

  cooldown: 5,
};
