const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("audiotest")
    .setDescription("Test audio quality with optimized settings")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of audio test")
        .setRequired(false)
        .addChoices(
          { name: "High Quality Music", value: "music" },
          { name: "Speech Test", value: "speech" },
          { name: "Bass Test", value: "bass" },
          { name: "Random Popular Song", value: "random" }
        )
    ),

  async execute(interaction) {
    const testType = interaction.options.getString("type") || "music";

    // Check if user is in a voice channel
    if (!interaction.member.voice?.channel) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Voice Channel Required",
            "You need to join a voice channel first to test audio quality!"
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    // Test songs optimized for different audio aspects
    const testSongs = {
      music: "scsearch:Daft Punk - Get Lucky", // High quality electronic
      speech: "scsearch:podcast test audio quality", // Speech clarity
      bass: "scsearch:Hans Zimmer - Time", // Bass and orchestral
      random: "never gonna give you up rick astley", // Classic test
    };

    const testDescriptions = {
      music:
        "🎵 **High Quality Music Test**\nTesting with electronic music for clarity and range",
      speech:
        "🎤 **Speech Clarity Test**\nTesting voice clarity and speech intelligibility",
      bass: "🎼 **Bass & Orchestral Test**\nTesting low frequencies and dynamic range",
      random: "🎲 **Random Popular Song**\nTesting with a well-known track",
    };

    try {
      const searchQuery = testSongs[testType];

      await interaction.client.distube.play(
        interaction.member.voice.channel,
        searchQuery,
        {
          textChannel: interaction.channel,
          member: interaction.member,
        }
      );

      const embed = Utils.createSuccessEmbed(
        "🔊 Audio Quality Test Started",
        `${testDescriptions[testType]}\n\n**Listen for:**\n✅ Clear, crisp audio\n✅ No slowdown or speedup\n✅ Consistent volume\n✅ No stuttering or choppy playback\n\n**Audio Optimizations Active:**\n🎵 Opus hardware acceleration\n🔊 48kHz sample rate\n📡 128kbps bitrate\n⚡ Large audio buffer`
      );

      embed.addFields({
        name: "💡 Pro Tip",
        value:
          "If audio quality is poor, try:\n• `/play scsearch:song name` for SoundCloud\n• Check your internet connection\n• Use `/stats` to monitor bot performance",
        inline: false,
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Audio test error:", error);
      return interaction.editReply({
        embeds: [
          Utils.createErrorEmbed(
            "Audio Test Failed",
            `Failed to start audio test: ${error.message}\n\nTry using a direct song name instead.`
          ),
        ],
      });
    }
  },

  cooldown: 5,
};
