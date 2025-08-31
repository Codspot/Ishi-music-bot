const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused song"),

  async execute(interaction) {
    // Defer reply immediately to prevent timeout
    await interaction.deferReply();

    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs.length) {
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

    if (!queue.paused) {
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed("Not Paused", "The music is not paused!"),
        ],
      });
    }

    try {
      interaction.client.distube.resume(interaction.guildId);

      return interaction.editReply({
        embeds: [
          Utils.createInfoEmbed(
            "▶️ Music Resumed",
            `**${queue.songs[0].name}** has been resumed.`
          ),
        ],
      });
    } catch (error) {
      console.error("Resume command error:", error);
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Resume Failed",
            "Failed to resume the music. Please try again."
          ),
        ],
      });
    }
  },

  cooldown: config.cooldowns.resume,
};
