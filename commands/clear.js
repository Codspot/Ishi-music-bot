const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear the entire queue"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Empty Queue",
            "There are no songs in the queue to clear!"
          ),
        ],
        flags: MessageFlags.Ephemeral,
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
        flags: MessageFlags.Ephemeral,
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
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const clearedCount = queue.songs.length - 1; // Don't count currently playing song

      // Clear all songs except the currently playing one
      queue.songs = [queue.songs[0]];

      return interaction.reply({
        embeds: [
          Utils.createInfoEmbed(
            "🗑️ Queue Cleared",
            `Removed **${clearedCount}** song${
              clearedCount !== 1 ? "s" : ""
            } from the queue.`
          ),
        ],
      });
    } catch (error) {
      console.error("Clear command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Clear Failed",
            "Failed to clear the queue. Please try again."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },

  cooldown: config.cooldowns.clear,
};
