const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle("🎵 Ishi Music Bot - Commands")
      .setDescription("Here are all the available commands:")
      .addFields(
        {
          name: "🎶 Music Commands",
          value: [
            "`/play` - Play music from YouTube, Spotify, or search",
            "`/playlist` - Play an entire playlist with shuffle option",
            "`/search` - Search and select from multiple results",
            "`/pause` - Pause the current song",
            "`/resume` - Resume the paused song",
            "`/skip` - Skip the current song",
            "`/previous` - Play the previous song",
            "`/stop` - Stop music and clear queue",
            "`/nowplaying` - Show current song info",
          ].join("\n"),
          inline: false,
        },
        {
          name: "📝 Queue Commands",
          value: [
            "`/queue` - Show the music queue",
            "`/shuffle` - Shuffle the queue",
            "`/clear` - Clear the entire queue",
            "`/remove` - Remove a song from queue",
            "`/loop` - Set loop mode (off/track/queue/autoplay)",
          ].join("\n"),
          inline: false,
        },
        {
          name: "🎛️ Audio Enhancement",
          value: [
            "`/volume` - Adjust music volume (0-100)",
            "`/filter` - Apply audio filters (bass, nightcore, etc.)",
            "`/lyrics` - Get lyrics for current or specified song",
          ].join("\n"),
          inline: false,
        },
        {
          name: "🔧 Utility Commands",
          value: [
            "`/stats` - Show bot statistics and performance",
            "`/help` - Show this help message",
          ].join("\n"),
          inline: false,
        }
      )
      .setFooter({
        text: "Ishi Music Bot - High Quality Music Experience",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
