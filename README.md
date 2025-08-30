# 🎵 Ishi Music Bot - High Quality Discord Music Bot

A professional, feature-rich Discord music bot built with discord.js v14 and discord-player v7. Supports multiple music sources including YouTube, Spotify, SoundCloud, and more.

## 🚨 IMPORTANT SECURITY NOTICE

**Your Discord bot token was exposed in the code!** Please:

1. **Immediately regenerate your bot token** at https://discord.com/developers/applications
2. Update your `.env` file with the new token
3. Never commit tokens to version control!

## ✨ **NEW: Next-Level Features Added!**

### 🎵 **Enhanced Music Commands**

- **Advanced Search**: Interactive song selection with dropdown menus
- **Playlist Support**: Load entire playlists from YouTube/Spotify with shuffle
- **Audio Filters**: Bass boost, nightcore, 8D audio, karaoke, and more
- **Lyrics Integration**: Get lyrics for current or any song
- **Smart Queue Manager**: Interactive queue control with buttons

### 🎛️ **Professional Controls**

- **Progress Tracking**: Real-time progress bars and timestamps
- **Multi-Source Support**: YouTube, Spotify, SoundCloud, Apple Music
- **Advanced Loop Modes**: Track, queue, and autoplay options
- **Volume Control**: Precise 0-100% volume adjustment
- **Smart Navigation**: Previous track support with history

### 📊 **Enterprise Features**

- **Performance Stats**: Real-time bot performance monitoring
- **Interactive UI**: Button-based controls and dropdown selections
- **Error Recovery**: Comprehensive error handling and fallbacks
- **Security**: Permission validation and cooldown systems
- **Scalability**: Optimized for multiple servers and high usage

## ✨ Features

### 🎶 Music Playback

- **Multi-source support**: YouTube, Spotify, SoundCloud, Apple Music, and more
- **High-quality audio**: Optimized for best audio quality
- **Smart search**: Automatically detects URLs or searches by song name
- **Queue management**: Advanced queue system with history tracking

### 🎛️ Control Features

- **Pause/Resume**: Full playback control
- **Skip/Previous**: Navigate through your playlist
- **Volume Control**: Adjust volume from 0-100%
- **Loop Modes**: Off, Track, Queue, and Autoplay modes
- **Shuffle**: Randomize your queue

### 📝 Queue Management

- **View Queue**: Beautiful paginated queue display
- **Add/Remove**: Add songs or remove specific tracks
- **Clear Queue**: Clear all queued songs
- **Position Management**: Remove songs by position

### 🎯 Advanced Features

- **Slash Commands**: Modern Discord slash command interface
- **Rich Embeds**: Beautiful, informative message embeds
- **Progress Bars**: Visual progress tracking for current song
- **Cooldown System**: Prevents command spam
- **Error Handling**: Comprehensive error management
- **Voice Channel Validation**: Smart voice channel checking

## 🚀 Setup Instructions

### Prerequisites

- Node.js v16.9.0 or higher
- A Discord application and bot token
- FFmpeg installed on your system

### Installation

1. **Clone and install dependencies**

   ```bash
   cd ishi-music-bot
   npm install
   ```

2. **Configure environment variables**

   - Copy `.env.example` to `.env`
   - Add your Discord bot token and client ID:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

3. **Set up Discord Application**

   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application or select existing one
   - Go to Bot section and copy the token
   - Enable the following intents:
     - `Guilds`
     - `Guild Voice States`
     - `Guild Messages`
     - `Message Content` (if using message commands)

4. **Invite the bot to your server**

   - Go to OAuth2 > URL Generator
   - Select `bot` and `applications.commands` scopes
   - Select necessary permissions:
     - `Connect`
     - `Speak`
     - `Use Slash Commands`
     - `Send Messages`
     - `Embed Links`
   - Use the generated URL to invite your bot

5. **Start the bot**
   ```bash
   npm start
   ```

## 🎵 Commands

### Music Commands

- `/play <query>` - Play music from various sources
- `/pause` - Pause the current song
- `/resume` - Resume the paused song
- `/skip` - Skip the current song
- `/previous` - Play the previous song
- `/stop` - Stop music and clear queue
- `/nowplaying` - Show current song information

### Queue Commands

- `/queue [page]` - Show the music queue
- `/shuffle` - Shuffle the current queue
- `/clear` - Clear the entire queue
- `/remove <position>` - Remove a song from queue by position
- `/loop <mode>` - Set loop mode (off/track/queue/autoplay)

### Control Commands

- `/volume <level>` - Adjust music volume (0-100)
- `/help` - Show all available commands

## 🔧 Configuration

### Environment Variables

```env
# Required
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Optional
PREFIX=!
DEFAULT_VOLUME=50
MAX_QUEUE_SIZE=100
```

### Config.js Options

- **Audio Quality**: Configurable audio quality settings
- **Colors**: Customizable embed colors
- **Emojis**: Custom emoji configuration
- **Cooldowns**: Command cooldown settings

## 🎨 Customization

### Adding New Commands

1. Create a new file in the `commands/` directory
2. Use the command template structure
3. Restart the bot to load the new command

### Modifying Embeds

- Edit colors in `config.js`
- Modify embed templates in `utils.js`
- Customize emojis and styling

### Adding Extractors

```javascript
// In index.js
await player.extractors.register(NewExtractor, {
  // extractor options
});
```

## 🛡️ Error Handling

The bot includes comprehensive error handling:

- **Command errors**: Graceful error messages
- **Music playback errors**: Automatic retry and fallback
- **Network errors**: Connection error management
- **Permission errors**: Clear permission requirement messages

## 📊 Monitoring & Logging

- Command usage logging
- Error logging with timestamps
- Player event tracking
- Performance monitoring

## 🔒 Security Features

- Environment variable protection
- Command cooldowns
- Permission validation
- Voice channel verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your bot permissions
3. Ensure FFmpeg is properly installed
4. Check Discord API status

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org/) - Discord API library
- [discord-player](https://discord-player.js.org/) - Music framework
- [ytdl-core](https://github.com/fent/node-ytdl-core) - YouTube downloader

---

**Ishi Music Bot** - Bringing high-quality music to your Discord server! 🎵
# Ishi-music-bot
