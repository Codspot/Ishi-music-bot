module.exports = {
  // Bot Configuration
  prefix: process.env.PREFIX || "!",
  defaultVolume: parseInt(process.env.DEFAULT_VOLUME) || 50,
  maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE) || 100,

  // Audio Quality Settings - Optimized for Discord Voice
  audioQuality: "highestaudio",
  audioFilter: "audioonly",
  audioBitrate: 128, // Discord optimal bitrate
  audioSampleRate: 48000, // Discord's sample rate
  audioChannels: 2, // Stereo

  // Voice Connection Settings
  voiceSettings: {
    bitrate: "auto", // Let Discord optimize
    fec: true, // Forward Error Correction
    plp: 0, // Packet Loss Percentage
    useInlineVolume: false, // Better performance
  },

  // Colors for embeds
  colors: {
    primary: "#9b59b6",
    success: "#2ecc71",
    error: "#e74c3c",
    warning: "#f39c12",
    info: "#3498db",
  },

  // Emojis
  emojis: {
    play: "▶️",
    pause: "⏸️",
    stop: "⏹️",
    skip: "⏭️",
    previous: "⏮️",
    shuffle: "🔀",
    repeat: "🔁",
    volume: "🔊",
    queue: "📝",
    music: "🎵",
    loading: "⏳",
    success: "✅",
    error: "❌",
    warning: "⚠️",
  },

  // Command cooldowns (in seconds)
  cooldowns: {
    play: 3,
    skip: 2,
    queue: 1,
    volume: 2,
  },
};
