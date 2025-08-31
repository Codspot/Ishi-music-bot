const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue")
    .addIntegerOption((option) =>
      option
        .setName("page")
        .setDescription("Page number to display")
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs.length) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Empty Queue",
            "There are no songs in the queue!"
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const page = interaction.options.getInteger("page") || 1;
    const songsPerPage = 10;
    const totalPages = Math.ceil(queue.songs.length / songsPerPage);

    if (page > totalPages && totalPages > 0) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Invalid Page",
            `Page ${page} doesn't exist! Maximum page is ${totalPages}.`
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const startIndex = (page - 1) * songsPerPage;
    const endIndex = Math.min(startIndex + songsPerPage, queue.songs.length);

    let queueDescription = "";

    // Current song
    const currentSong = queue.songs[0];
    queueDescription += `**🎵 Now Playing:**\n`;
    queueDescription += `**${currentSong.name}** - \`${currentSong.formattedDuration}\`\n`;
    queueDescription += `Requested by: ${currentSong.user}\n\n`;

    // Queue songs
    if (queue.songs.length > 1) {
      queueDescription += `**📋 Queue (${queue.songs.length - 1} songs):**\n`;

      for (let i = Math.max(1, startIndex); i < endIndex; i++) {
        const song = queue.songs[i];
        queueDescription += `\`${i}\`. **${song.name}** - \`${song.formattedDuration}\`\n`;
        queueDescription += `   Requested by: ${song.user}\n`;
      }
    }

    const embed = Utils.createInfoEmbed("🎵 Music Queue", queueDescription);

    if (totalPages > 1) {
      embed.setFooter({
        text: `Page ${page}/${totalPages} • ${queue.songs.length} total songs`,
      });
    } else {
      embed.setFooter({ text: `${queue.songs.length} total songs` });
    }

    // Add queue info
    embed.addFields(
      {
        name: "🔀 Settings",
        value: `Repeat: ${
          queue.repeatMode ? (queue.repeatMode === 2 ? "Queue" : "Song") : "Off"
        }\nAutoplay: ${queue.autoplay ? "On" : "Off"}`,
        inline: true,
      },
      {
        name: "🎚️ Volume",
        value: `${queue.volume}%`,
        inline: true,
      }
    );

    return interaction.reply({ embeds: [embed] });
  },

  cooldown: config.cooldowns.queue,
};
