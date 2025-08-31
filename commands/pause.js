const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song"),

  async execute(interaction) {
    // Defer reply immediately to prevent timeout
    await interaction.deferReply();

    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.playing) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Nothing Playing",
            "There is no music currently playing!"
          ),
        ],
      });
    }

    if (!interaction.member.voice?.channel) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Voice Channel Required",
            "You need to be in a voice channel!"
          ),
        ],
      });
    }

    if (
      interaction.guild.members.me.voice.channelId !==
      interaction.member.voice.channelId
    ) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Different Voice Channel",
            "You need to be in the same voice channel as the bot!"
          ),
        ],
      });
    }

    if (queue.paused) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Already Paused",
            "The music is already paused!"
          ),
        ],
      });
    }

    try {
      interaction.client.distube.pause(interaction.guildId);

      return interaction.editReply({
        embeds: [
          Utils.createInfoEmbed(
            "⏸️ Music Paused",
            `**${queue.songs[0].name}** has been paused.`
          ),
        ],
      });
    } catch (error) {
      console.error("Pause command error:", error);
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Pause Failed",
            "Failed to pause the music. Please try again."
          ),
        ],
      });
    }
  },

  cooldown: config.cooldowns.pause,
};
