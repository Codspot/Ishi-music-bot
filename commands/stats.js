const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show bot statistics and performance information"),

  async execute(interaction) {
    const client = interaction.client;

    await interaction.deferReply();

    try {
      // Bot uptime
      const uptime = process.uptime();
      const uptimeString = Utils.formatDuration(uptime * 1000);

      // Memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const memoryTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);

      // System info
      const cpuUsage = os.loadavg()[0].toFixed(2);
      const totalMemory = Math.round(os.totalmem() / 1024 / 1024 / 1024);
      const freeMemory = Math.round(os.freemem() / 1024 / 1024 / 1024);

      // Music statistics with Distube
      const distube = interaction.client.distube;
      const activeQueues = distube.voices.size;
      let totalTracks = 0;
      let totalListeners = 0;

      // Count total tracks across all queues
      for (const [guildId, voice] of distube.voices) {
        const queue = distube.getQueue(guildId);
        if (queue) {
          totalTracks += queue.songs.length;
          if (voice.connection) {
            const channel = client.channels.cache.get(voice.id);
            if (channel) {
              totalListeners += channel.members.size - 1; // -1 to exclude bot
            }
          }
        }
      }

      // Guild statistics
      const totalGuilds = client.guilds.cache.size;
      const totalUsers = client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );

      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`${config.emojis.info} Bot Statistics`)
        .setDescription("Comprehensive bot performance and usage statistics")
        .addFields(
          {
            name: "🤖 Bot Information",
            value: [
              `**Uptime:** ${uptimeString}`,
              `**Servers:** ${totalGuilds}`,
              `**Users:** ${totalUsers.toLocaleString()}`,
              `**Node.js:** ${process.version}`,
            ].join("\n"),
            inline: true,
          },
          {
            name: "🎵 Music Statistics",
            value: [
              `**Active Queues:** ${activeQueues}`,
              `**Queued Tracks:** ${totalTracks}`,
              `**Current Listeners:** ${totalListeners}`,
              `**Music Engine:** Distube`,
            ].join("\n"),
            inline: true,
          },
          {
            name: "⚡ Performance",
            value: [
              `**Memory Usage:** ${memoryUsed}MB / ${memoryTotal}MB`,
              `**CPU Load:** ${cpuUsage}%`,
              `**System Memory:** ${
                totalMemory - freeMemory
              }GB / ${totalMemory}GB`,
              `**Platform:** ${os.platform()} ${os.arch()}`,
            ].join("\n"),
            inline: true,
          },
          {
            name: "📊 API Latency",
            value: [
              `**WebSocket Ping:** ${client.ws.ping}ms`,
              `**Bot Response Time:** ${
                Date.now() - interaction.createdTimestamp
              }ms`,
            ].join("\n"),
            inline: false,
          }
        )
        .setFooter({
          text: `Ishi Music Bot v${require("../package.json").version}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Add thumbnail if bot has avatar
      if (client.user.displayAvatarURL()) {
        embed.setThumbnail(client.user.displayAvatarURL());
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Stats command error:", error);
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Stats Error",
            "Failed to retrieve bot statistics."
          ),
        ],
      });
    }
  },

  cooldown: 10,
};
