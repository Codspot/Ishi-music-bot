const { Events, ActivityType } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    console.log(`🎵 Serving ${client.guilds.cache.size} servers`);

    // Set bot activity
    client.user.setActivity("🎵 High Quality Music", {
      type: ActivityType.Listening,
    });
  },
};
