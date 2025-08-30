const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildDelete,
  execute(guild) {
    console.log(`❌ Left guild: ${guild.name} (${guild.id})`);
  },
};
