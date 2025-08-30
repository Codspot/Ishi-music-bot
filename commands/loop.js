const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set loop mode for the queue")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Track", value: "track" },
          { name: "Queue", value: "queue" },
          { name: "Autoplay", value: "autoplay" }
        )
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const mode = interaction.options.getString("mode");

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
      let repeatMode;
      let modeText;

      switch (mode) {
        case "off":
          repeatMode = 0;
          modeText = "Off";
          break;
        case "track":
          repeatMode = 1;
          modeText = "Track";
          break;
        case "queue":
          repeatMode = 2;
          modeText = "Queue";
          break;
        case "autoplay":
          // Distube uses autoplay separately
          interaction.client.distube.toggleAutoplay(interaction.guildId);
          return interaction.reply({
            embeds: [
              Utils.createInfoEmbed(
                "🔀 Autoplay Toggled",
                `Autoplay is now **${queue.autoplay ? "Off" : "On"}**`
              ),
            ],
          });
        default:
          return interaction.reply({
            embeds: [
              Utils.createErrorEmbed(
                "Invalid Mode",
                "Please select a valid loop mode!"
              ),
            ],
            ephemeral: true,
          });
      }

      interaction.client.distube.setRepeatMode(interaction.guildId, repeatMode);

      return interaction.reply({
        embeds: [
          Utils.createInfoEmbed(
            "🔁 Loop Mode Changed",
            `Loop mode set to **${modeText}**`
          ),
        ],
      });
    } catch (error) {
      console.error("Loop command error:", error);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Loop Failed",
            "Failed to change loop mode. Please try again."
          ),
        ],
        ephemeral: true,
      });
    }
  },

  cooldown: 3,
};
