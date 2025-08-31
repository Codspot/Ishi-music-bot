const { EmbedBuilder } = require("discord.js");
const config = require("./config");

class Utils {
  // Format duration from milliseconds to readable format
  static formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  // Create success embed
  static createSuccessEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle(`${config.emojis.success} ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  // Create error embed
  static createErrorEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(config.colors.error)
      .setTitle(`${config.emojis.error} ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  // Create info embed
  static createInfoEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`${config.emojis.music} ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  // Create music embed for now playing
  static createMusicEmbed(song, requestedBy) {
    // Handle undefined song data
    if (!song) {
      return new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle(`${config.emojis.error} Playback Error`)
        .setDescription("Song data is undefined or invalid")
        .setTimestamp();
    }

    return new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${config.emojis.play} Now Playing`)
      .setDescription(
        `**[${song.name || "Unknown Title"}](${song.url || "#"})**`
      )
      .addFields(
        {
          name: "Duration",
          value: song.formattedDuration || "Unknown",
          inline: true,
        },
        {
          name: "Requested by",
          value: requestedBy ? requestedBy.toString() : "Unknown",
          inline: true,
        },
        {
          name: "Source",
          value: song.source || song.uploader?.name || "Unknown",
          inline: true,
        }
      )
      .setThumbnail(song.thumbnail || null)
      .setTimestamp();
  }

  // Create queue embed
  static createQueueEmbed(queue, currentPage = 1, tracksPerPage = 10) {
    const songs = queue.songs || [];
    const totalPages = Math.ceil((songs.length - 1) / tracksPerPage); // Exclude current song
    const start = (currentPage - 1) * tracksPerPage;
    const end = start + tracksPerPage;
    const currentSongs = songs.slice(1, end + 1); // Skip first song (currently playing)

    let description = "";

    // Show currently playing song
    if (songs.length > 0 && songs[0]) {
      description += `**Now Playing:**\n[${songs[0].name}](${songs[0].url})\n\n`;
    }

    // Show upcoming songs
    if (currentSongs.length > 0) {
      description += "**Up Next:**\n";
      currentSongs.forEach((song, i) => {
        const position = start + i + 1;
        description += `${position}. [${song.name}](${song.url}) - ${song.formattedDuration}\n`;
      });
    } else if (songs.length <= 1) {
      description += "*No songs in queue*";
    }

    return new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${config.emojis.queue} Music Queue`)
      .setDescription(description)
      .setFooter({
        text: `Page ${currentPage}/${totalPages || 1} • ${
          songs.length
        } songs in queue`,
      })
      .setTimestamp();
  }

  // Validate YouTube URL
  static isValidURL(string) {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  // Progress bar for current track
  static createProgressBar(current, total, size = 20) {
    const percentage = current / total;
    const progress = Math.round(size * percentage);
    const emptyProgress = size - progress;

    const progressText = "▰".repeat(progress);
    const emptyProgressText = "▱".repeat(emptyProgress);

    return progressText + emptyProgressText;
  }

  // Create advanced now playing embed with progress bar
  static createAdvancedNowPlayingEmbed(track, queue, requestedBy) {
    const progress = queue.node.createProgressBar();
    const timestamp = queue.node.getTimestamp();

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${config.emojis.play} Now Playing`)
      .setDescription(`**[${track.title}](${track.url})**`)
      .addFields(
        {
          name: "Progress",
          value: `\`${timestamp.current.label}\` ${progress} \`${timestamp.total.label}\``,
          inline: false,
        },
        { name: "Artist", value: track.author || "Unknown", inline: true },
        { name: "Requested by", value: requestedBy.toString(), inline: true },
        { name: "Volume", value: `${queue.node.volume}%`, inline: true },
        {
          name: "Loop",
          value: queue.repeatMode ? "Enabled" : "Disabled",
          inline: true,
        },
        {
          name: "Queue Length",
          value: `${queue.tracks.size} songs`,
          inline: true,
        },
        { name: "Source", value: track.source || "Unknown", inline: true }
      )
      .setThumbnail(track.thumbnail)
      .setFooter({ text: `Powered by Ishi Music Bot` })
      .setTimestamp();

    return embed;
  }

  // Generate random color
  static getRandomColor() {
    const colors = Object.values(config.colors);
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Format file size
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  // Create warning embed
  static createWarningEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle(`${config.emojis.warning} ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  // Create loading embed
  static createLoadingEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`${config.emojis.loading} ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  // Escape markdown characters
  static escapeMarkdown(text) {
    return text.replace(/[*_`~|\\]/g, "\\$&");
  }

  // Truncate text with ellipsis
  static truncate(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length - 3) + "...";
  }

  // Get queue duration
  static getTotalQueueDuration(queue) {
    let totalDuration = 0;

    if (queue.currentTrack) {
      totalDuration += queue.currentTrack.durationMS;
    }

    queue.tracks.toArray().forEach((track) => {
      totalDuration += track.durationMS;
    });

    return this.formatDuration(totalDuration);
  }
}

module.exports = Utils;
