require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} = require("discord.js");
const { DisTube } = require("distube");
const { YouTubePlugin } = require("@distube/youtube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const Utils = require("./utils");

// Function to load YouTube cookies
function loadYouTubeCookies() {
  try {
    const cookiesPath = process.env.YOUTUBE_COOKIES_PATH || "./cookies.txt";
    if (fs.existsSync(cookiesPath)) {
      const cookiesContent = fs.readFileSync(cookiesPath, "utf8");

      // Parse Netscape cookie format
      const youtubeCookies = [];
      const lines = cookiesContent.split("\n");

      for (const line of lines) {
        // Skip comments and empty lines
        if (line.startsWith("#") || line.trim() === "") continue;

        const parts = line.split("\t");
        if (parts.length >= 7 && parts[0].includes("youtube.com")) {
          const domain = parts[0];
          const flag = parts[1];
          const path = parts[2];
          const secure = parts[3];
          const expiration = parts[4];
          const name = parts[5];
          const value = parts[6];

          youtubeCookies.push({
            name: name,
            value: value,
            domain: domain.startsWith(".") ? domain : "." + domain,
            path: path,
            secure: secure === "TRUE",
            httpOnly: false,
          });
        }
      }

      if (youtubeCookies.length > 0) {
        console.log(
          `✅ Loaded ${youtubeCookies.length} YouTube cookies from cookies.txt`
        );
        return youtubeCookies;
      } else {
        console.log("⚠️ No YouTube cookies found in cookies.txt");
        return [];
      }
    } else {
      console.log("ℹ️ No cookies.txt file found. Using free tier.");
      return [];
    }
  } catch (error) {
    console.error("⚠️ Error loading YouTube cookies:", error.message);
    return [];
  }
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Create Distube instance with plugins (Render-optimized)
const youtubeCookies = loadYouTubeCookies();

const distube = new DisTube(client, {
  emitNewSongOnly: false,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  nsfw: false,
  plugins: [
    // YouTube first - more content available (user preference)
    new YouTubePlugin({
      cookies: youtubeCookies,
      ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25,
        filter: "audioonly",
        format: "audioonly",
        // Render-friendly headers
        requestOptions: {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        },
      },
    }),
    // SoundCloud as fallback
    new SoundCloudPlugin(),
    new SpotifyPlugin(),
    // YtDlp as fallback
    new YtDlpPlugin({
      update: false,
    }),
  ],
});

// Make distube available globally
client.distube = distube;

// Distube Events
distube
  .on("playSong", (queue, song) => {
    console.log("=== PLAY SONG DEBUG ===");
    console.log("Queue ID:", queue?.id);
    console.log("Song object:", song);
    console.log("Song name:", song?.name);
    console.log("Song user:", song?.user);
    console.log("Song duration:", song?.formattedDuration);
    console.log("======================");

    if (!song || !song.name) {
      console.error("⚠️ Invalid song data received in playSong event");
      const embed = Utils.createErrorEmbed(
        "Playback Error",
        "Song data is invalid or undefined"
      );
      queue.textChannel?.send({ embeds: [embed] });
      return;
    }

    const embed = Utils.createMusicEmbed(song, song.user);
    queue.textChannel?.send({ embeds: [embed] });
  })
  .on("addSong", (queue, song) => {
    console.log("=== ADD SONG DEBUG ===");
    console.log("Song object:", song);
    console.log("Song name:", song?.name);
    console.log("Song user:", song?.user);
    console.log("======================");

    if (!song || !song.name) {
      console.error("⚠️ Invalid song data received in addSong event");
      return;
    }

    const embed = Utils.createInfoEmbed(
      "Song Added to Queue",
      `**${song.name}** - \`${song.formattedDuration}\`\nRequested by: ${song.user}`
    );
    queue.textChannel?.send({ embeds: [embed] });
  })
  .on("addList", (queue, playlist) => {
    const embed = Utils.createInfoEmbed(
      "Playlist Added",
      `**${playlist.name}** (${playlist.songs.length} songs)\nRequested by: ${playlist.user}`
    );
    queue.textChannel?.send({ embeds: [embed] });
  })
  .on("error", (error, queue) => {
    console.error("=== DISTUBE ERROR DEBUG ===");
    console.error("Error:", error);
    console.error("Error type:", typeof error);
    console.error("Queue ID:", queue?.id);
    console.error("Queue songs length:", queue?.songs?.length);
    console.error("========================");

    let errorMessage = "An error occurred while playing music.";

    // Handle different error types
    if (typeof error === "string") {
      // Error is a string (like "PlayingError")
      if (error.includes("Playing")) {
        errorMessage =
          "Failed to play the requested song. No songs found or source unavailable.";
      } else if (error.includes("Search")) {
        errorMessage =
          "No songs found for your search. Try different keywords.";
      } else {
        errorMessage = `Playback error: ${error}`;
      }
    } else if (error && typeof error === "object") {
      // Error is an object with message
      if (error.message?.includes("Video unavailable")) {
        errorMessage = "This video is unavailable or region-blocked.";
      } else if (error.message?.includes("Sign in to confirm your age")) {
        errorMessage =
          "This video requires age verification and cannot be played.";
      } else if (error.message?.includes("Private video")) {
        errorMessage = "This video is private and cannot be accessed.";
      } else if (error.message?.includes("This video is not available")) {
        errorMessage = "This video is not available in your region.";
      } else if (error.message?.includes("No result found")) {
        errorMessage =
          "No songs found for your search. Try different keywords.";
      } else if (error.name === "PlayError") {
        errorMessage =
          "Failed to play the requested song. Try another song or source.";
      } else if (error.message?.includes("ytdl")) {
        errorMessage = "YouTube access issue. Trying alternative sources...";
      } else if (error.message) {
        errorMessage = `Playback error: ${error.message}`;
      }
    }

    const embed = Utils.createErrorEmbed("Playback Error", errorMessage);

    if (queue?.textChannel && typeof queue.textChannel.send === "function") {
      queue.textChannel.send({ embeds: [embed] }).catch(console.error);
    }
  })
  .on("empty", (queue) => {
    const embed = Utils.createInfoEmbed(
      "Channel Empty",
      "Voice channel is empty! Leaving the channel..."
    );
    queue.textChannel?.send({ embeds: [embed] });
  })
  .on("finish", (queue) => {
    const embed = Utils.createInfoEmbed(
      "Queue Finished",
      "Queue finished! No more songs to play."
    );
    queue.textChannel?.send({ embeds: [embed] });
  })
  .on("disconnect", (queue) => {
    const embed = Utils.createInfoEmbed(
      "Disconnected",
      "Disconnected from the voice channel!"
    );
    queue.textChannel?.send({ embeds: [embed] });
  });

console.log(
  "✅ Distube initialized with YouTube, SoundCloud, and Spotify support"
);

// Collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    console.log(`📝 Loaded command: ${command.data.name}`);
  } else {
    console.log(
      `⚠️  Command at ${filePath} is missing required "data" or "execute" property.`
    );
  }
}

// Load events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`🎯 Loaded event: ${event.name}`);
}

// Interaction handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Cooldown handling
  const { cooldowns } = client;
  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Cooldown Active",
            `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`
          ),
        ],
        ephemeral: true,
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("Command execution error:", error);
    const errorEmbed = Utils.createErrorEmbed(
      "Command Error",
      "There was an error while executing this command!"
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// Deploy slash commands
async function deployCommands() {
  if (
    !process.env.CLIENT_ID ||
    process.env.CLIENT_ID === "your_client_id_here"
  ) {
    console.log(
      "⚠️  CLIENT_ID not set in .env file. Skipping command deployment."
    );
    return;
  }

  const commands = [];

  for (const [name, command] of client.commands) {
    commands.push(command.data.toJSON());
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("🔄 Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("✅ Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
  }
}

// Initialize bot
async function main() {
  try {
    console.log("🚀 Starting Ishi Music Bot...");

    // Check if token exists
    if (!process.env.DISCORD_TOKEN) {
      console.error("❌ DISCORD_TOKEN not found in environment variables!");
      console.error(
        "💡 Make sure you have a .env file with DISCORD_TOKEN=your_token_here"
      );
      process.exit(1);
    }

    if (
      process.env.DISCORD_TOKEN.includes("your_new_token_here") ||
      process.env.DISCORD_TOKEN.includes("your_bot_token_here")
    ) {
      console.error(
        "❌ You need to replace the placeholder token in .env file!"
      );
      console.error(
        "💡 Go to https://discord.com/developers/applications and get your real bot token"
      );
      process.exit(1);
    }

    console.log("🔐 Logging in to Discord...");
    await client.login(process.env.DISCORD_TOKEN);

    console.log("📡 Deploying slash commands...");
    await deployCommands();

    console.log("✅ Bot initialization complete!");
  } catch (error) {
    console.error("❌ Failed to start bot:", error.message);

    if (error.code === "TOKEN_INVALID") {
      console.error(
        "🚨 INVALID TOKEN! The Discord token is invalid or has been reset."
      );
      console.error("📋 To fix this:");
      console.error("   1. Go to https://discord.com/developers/applications");
      console.error("   2. Select your bot application");
      console.error("   3. Go to Bot section");
      console.error('   4. Click "Reset Token"');
      console.error("   5. Copy the new token to your .env file");
    } else if (error.code === "DISALLOWED_INTENTS") {
      console.error(
        "🚨 DISALLOWED INTENTS! Enable the required intents in Discord Developer Portal:"
      );
      console.error("   1. Go to your bot settings");
      console.error('   2. Enable "Message Content Intent"');
      console.error("   3. Save changes");
    }

    process.exit(1);
  }
}

main();
