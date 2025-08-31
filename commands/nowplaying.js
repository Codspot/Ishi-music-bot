const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show information about the currently playing song"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs.length) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Nothing Playing",
            "There is no music currently playing!"
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const song = queue.songs[0];
    const status = queue.playing
      ? "Playing"
      : queue.paused
      ? "Paused"
      : "Loading";

    // Create progress bar
    const currentTime = queue.currentTime;
    const totalTime = song.duration;
    const progress = Math.round((currentTime / totalTime) * 20);
    const progressBar = "▰".repeat(progress) + "▱".repeat(20 - progress);

    // Format times
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${config.emojis.music} Now Playing`)
      .setDescription(`**[${song.name}](${song.url})**`)
      .addFields(
        {
          name: "Duration",
          value: `\`${formatTime(currentTime)}\` ${progressBar} \`${
            song.formattedDuration
          }\``,
          inline: false,
        },
        {
          name: "Artist",
          value: song.uploader?.name || "Unknown",
          inline: true,
        },
        { name: "Requested by", value: song.user.toString(), inline: true },
        { name: "Status", value: status, inline: true },
        { name: "Volume", value: `${queue.volume}%`, inline: true },
        {
          name: "Loop",
          value: queue.repeatMode
            ? queue.repeatMode === 2
              ? "Queue"
              : "Song"
            : "Off",
          inline: true,
        },
        { name: "Autoplay", value: queue.autoplay ? "On" : "Off", inline: true }
      );

    if (song.thumbnail) {
      embed.setThumbnail(song.thumbnail);
    }

    // Add queue info if there are more songs
    if (queue.songs.length > 1) {
      embed.addFields({
        name: "Up Next",
        value: `**${queue.songs[1].name}** - \`${queue.songs[1].formattedDuration}\``,
        inline: false,
      });
    }

    embed.setFooter({
      text: `Queue: ${queue.songs.length} song${
        queue.songs.length !== 1 ? "s" : ""
      }`,
    });

    return interaction.reply({ embeds: [embed] });
  },

  cooldown: config.cooldowns.nowplaying,
};
