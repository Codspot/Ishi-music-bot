const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // Log command usage
    console.log(
      `🎯 ${interaction.user.tag} used /${interaction.commandName} in ${
        interaction.guild?.name || "DM"
      }`
    );
  },
};
