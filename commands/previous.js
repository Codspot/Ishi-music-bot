const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play the previous song"),

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

    if (!queue.previousSongs || queue.previousSongs.length === 0) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "No Previous Track",
            "There is no previous track to play!"
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await interaction.client.distube.previous(interaction.guildId);

      return interaction.reply({
        embeds: [
          Utils.createSuccessEmbed(
            "Playing Previous",
            `⏮️ Playing previous track: **${queue.songs[0].name}**`
          ),
        ],
      });
    } catch (error) {
      console.error("Previous command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Previous Failed",
            "Failed to play previous track. No previous track available."
          ),
        ],
        ephemeral: true,
      });
    }
  },

  cooldown: 3,
};
