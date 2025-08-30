const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the current queue"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Empty Queue",
            "There are no songs in the queue to shuffle!"
          ),
        ],
        ephemeral: true,
      });
    }

    if (!interaction.member.voice?.channel) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Voice Channel Required",
            "You need to be in a voice channel!"
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      interaction.guild.members.me.voice.channelId !==
      interaction.member.voice.channelId
    ) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Different Voice Channel",
            "You need to be in the same voice channel as the bot!"
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await interaction.client.distube.shuffle(interaction.guildId);

      return interaction.reply({
        embeds: [
          Utils.createSuccessEmbed(
            "Queue Shuffled",
            `🔀 Successfully shuffled **${queue.songs.length - 1}** songs!`
          ),
        ],
      });
    } catch (error) {
      console.error("Shuffle command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Shuffle Failed",
            "Failed to shuffle the queue. Please try again."
          ),
        ],
        ephemeral: true,
      });
    }
  },

  cooldown: 3,
};
