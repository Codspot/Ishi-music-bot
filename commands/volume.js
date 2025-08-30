const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Adjust the music volume")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Volume level (0-100)")
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const volume = interaction.options.getInteger("level");

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

    try {
      const oldVolume = queue.volume;
      interaction.client.distube.setVolume(interaction.guildId, volume);

      let volumeEmoji = "🔊";
      if (volume === 0) volumeEmoji = "🔇";
      else if (volume < 30) volumeEmoji = "🔉";
      else if (volume < 70) volumeEmoji = "🔊";
      else volumeEmoji = "📢";

      return interaction.reply({
        embeds: [
          Utils.createInfoEmbed(
            `${volumeEmoji} Volume Changed`,
            `Volume changed from **${oldVolume}%** to **${volume}%**`
          ),
        ],
      });
    } catch (error) {
      console.error("Volume command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Volume Change Failed",
            "Failed to change the volume. Please try again."
          ),
        ],
        ephemeral: true,
      });
    }
  },

  cooldown: config.cooldowns.volume,
};
