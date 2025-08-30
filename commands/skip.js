const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),

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
            "You need to be in a voice channel to skip songs!"
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
      const currentSong = queue.songs[0];

      if (queue.songs.length === 1) {
        interaction.client.distube.stop(interaction.guildId);
        return interaction.reply({
          embeds: [
            Utils.createInfoEmbed(
              "⏹️ Queue Ended",
              `Skipped **${currentSong.name}** - No more songs in queue.`
            ),
          ],
        });
      } else {
        interaction.client.distube.skip(interaction.guildId);
        return interaction.reply({
          embeds: [
            Utils.createInfoEmbed(
              "⏭️ Song Skipped",
              `Skipped **${currentSong.name}**`
            ),
          ],
        });
      }
    } catch (error) {
      console.error("Skip command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Skip Failed",
            "Failed to skip the song. Please try again."
          ),
        ],
        ephemeral: true,
      });
    }
  },

  cooldown: config.cooldowns.skip,
};
