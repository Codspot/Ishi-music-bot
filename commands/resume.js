const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused song"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs.length) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Nothing Playing",
            "There is no music currently playing!"
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

    if (!queue.paused) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed("Not Paused", "The music is not paused!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      interaction.client.distube.resume(interaction.guildId);

      return interaction.reply({
        embeds: [
          Utils.createInfoEmbed(
            "▶️ Music Resumed",
            `**${queue.songs[0].name}** has been resumed.`
          ),
        ],
      });
    } catch (error) {
      console.error("Resume command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Resume Failed",
            "Failed to resume the music. Please try again."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },

  cooldown: config.cooldowns.resume,
};
