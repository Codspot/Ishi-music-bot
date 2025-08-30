const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music and clear the queue"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Nothing Playing",
            "There is no music currently playing!"
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
      const songCount = queue.songs.length;
      interaction.client.distube.stop(interaction.guildId);

      return interaction.reply({
        embeds: [
          Utils.createInfoEmbed(
            "⏹️ Music Stopped",
            `Stopped playing music and cleared ${songCount} song${
              songCount !== 1 ? "s" : ""
            } from the queue.`
          ),
        ],
      });
    } catch (error) {
      console.error("Stop command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Stop Failed",
            "Failed to stop the music. Please try again."
          ),
        ],
        ephemeral: true,
      });
    }
  },

  cooldown: config.cooldowns.stop,
};
