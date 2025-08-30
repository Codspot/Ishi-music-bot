const { SlashCommandBuilder } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Apply audio filters to enhance your music experience")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Filter type to apply")
        .setRequired(true)
        .addChoices(
          { name: "Bass Boost", value: "bassboost" },
          { name: "Nightcore", value: "nightcore" },
          { name: "Vaporwave", value: "vaporwave" },
          { name: "8D Audio", value: "8d" },
          { name: "Karaoke", value: "karaoke" },
          { name: "Treble", value: "treble" },
          { name: "Vibrato", value: "vibrato" },
          { name: "Clear (Remove all)", value: "clear" }
        )
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const filterType = interaction.options.getString("type");

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

    // Distube doesn't have the same filter system as discord-player
    // For now, we'll show that the feature is not yet implemented
    return interaction.reply({
      embeds: [
        Utils.createErrorEmbed(
          "🎛️ Filters Not Available",
          `Audio filters are not yet implemented with the new music engine.\n\nThis feature will be added in a future update.`
        ),
      ],
      ephemeral: true,
    });
  },

  cooldown: 3,
};
