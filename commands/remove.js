const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the queue")
    .addIntegerOption((option) =>
      option
        .setName("position")
        .setDescription("Position of the song to remove (1-based)")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const position = interaction.options.getInteger("position");

    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Empty Queue",
            "There are no songs in the queue to remove!"
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

    // Position 1 is the currently playing song, we can't remove it
    if (position === 1) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Cannot Remove Current Song",
            "Use `/skip` to skip the currently playing song instead!"
          ),
        ],
        ephemeral: true,
      });
    }

    // Check if position is valid (remember position 1 is current song)
    if (position > queue.songs.length) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Invalid Position",
            `There are only ${queue.songs.length} songs in the queue!`
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      // Distube uses 0-based indexing, and position 1 is current song
      const songToRemove = queue.songs[position - 1];

      // Remove the song from queue
      queue.songs.splice(position - 1, 1);

      return interaction.reply({
        embeds: [
          Utils.createSuccessEmbed(
            "Song Removed",
            `🗑️ Removed **${songToRemove.name}** from position ${position}`
          ),
        ],
      });
    } catch (error) {
      console.error("Remove command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Remove Failed",
            "Failed to remove the song. Please try again."
          ),
        ],
        ephemeral: true,
      });
    }
  },

  cooldown: 3,
};
