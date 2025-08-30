const { Events } = require("discord.js");
const Utils = require("../utils");

module.exports = {
  name: Events.GuildCreate,
  execute(guild) {
    console.log(
      `✅ Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`
    );

    // Try to send a welcome message to the system channel
    if (
      guild.systemChannel &&
      guild.systemChannel
        .permissionsFor(guild.members.me)
        .has(["SendMessages", "EmbedLinks"])
    ) {
      const welcomeEmbed = Utils.createInfoEmbed(
        "Thanks for adding Ishi Music Bot!",
        `🎵 I'm ready to bring high-quality music to **${guild.name}**!\n\n` +
          `📋 Use \`/help\` to see all available commands\n` +
          `🎶 Start with \`/play <song>\` to begin your music experience\n` +
          `⚙️ Make sure I have permissions to join voice channels!\n\n` +
          `🔗 Need help? Check out our documentation or support server.`
      );

      guild.systemChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    }
  },
};
