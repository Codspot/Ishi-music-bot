const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Play a playlist from various sources")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Playlist URL (YouTube, Spotify, etc.)")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("shuffle")
        .setDescription("Shuffle the playlist after adding")
        .setRequired(false)
    ),

  async execute(interaction) {
    const playlistUrl = interaction.options.getString("url");
    const shouldShuffle = interaction.options.getBoolean("shuffle") || false;

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
      // Use Distube to play the playlist
      await interaction.client.distube.play(
        interaction.member.voice.channel,
        playlistUrl,
        {
          textChannel: interaction.channel,
          member: interaction.member,
        }
      );

      const queue = interaction.client.distube.getQueue(interaction.guildId);

      if (shouldShuffle && queue && queue.songs.length > 1) {
        await interaction.client.distube.shuffle(interaction.guildId);
      }

      // Since Distube handles playlists automatically, we'll show a general success message
      const embed = Utils.createSuccessEmbed(
        "Playlist Processing",
        `🎵 Processing playlist from URL...\n\nSongs will be added to the queue automatically.`
      ).addFields(
        {
          name: "Shuffled",
          value: shouldShuffle ? "Yes" : "No",
          inline: true,
        },
        {
          name: "Requested by",
          value: interaction.user.toString(),
          inline: true,
        }
      );

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Playlist command error:", error);
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Playlist Error",
            "Failed to load the playlist. Please check the URL and try again."
          ),
        ],
      });
    }
  },

  cooldown: 5,
};
