require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  MessageFlags,
} = require("discord.js");
const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const Utils = require("./utils");

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Create Distube instance with Spotify and SoundCloud plugins only
const distube = new DisTube(client, {
  emitNewSongOnly: false,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  nsfw: false,
  plugins: [
    // Spotify first - provides metadata and searches for tracks
    new SpotifyPlugin(),
    // SoundCloud for audio streaming
    new SoundCloudPlugin(),
  ],
});

// Make distube available globally
client.distube = distube;

// Distube Events
distube
  .on("playSong", (queue, song) => {
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
    let errorMessage = "An error occurred while playing music.";

    // Handle different error types
    if (typeof error === "string") {
      // Error is a string (like "PlayingError")
      if (error.includes("Playing")) {
        errorMessage =
          "Failed to play the requested song. Trying alternative sources...";
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
      } else if (error.message?.includes("Sign in to confirm")) {
        errorMessage =
          "YouTube access restricted. Trying alternative sources...";
        // Auto-retry with SoundCloud if available
        if (queue && queue.songs.length > 0) {
          const currentSong = queue.songs[0];
          if (currentSong && currentSong.name) {
            console.log(`🔄 Retrying with SoundCloud: ${currentSong.name}`);
            setTimeout(() => {
              try {
                client.distube.play(
                  queue.voiceChannel,
                  `scsearch:${currentSong.name}`,
                  {
                    textChannel: queue.textChannel,
                    member: currentSong.user,
                    skip: true,
                  }
                );
              } catch (retryError) {
                console.error("Retry failed:", retryError);
              }
            }, 2000);
          }
        }
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
      } else if (
        error.message?.includes("ytdl") ||
        error.message?.includes("YouTube")
      ) {
        errorMessage = "YouTube access issue. Trying alternative sources...";
      } else if (error.message) {
        errorMessage = `Playback error: ${error.message}`;
      }
    }

    // Only log errors, not debug info
    console.error(`❌ DisTube Error: ${errorMessage}`);

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
        flags: MessageFlags.Ephemeral,
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

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      console.error("❌ Discord client error:", replyError);
    }
  }
});

// Deploy slash commands
async function deployCommands() {
  if (
    !process.env.CLIENT_ID ||
    process.env.CLIENT_ID === "your_client_id_here"
  ) {
    return;
  }

  const commands = [];

  for (const [name, command] of client.commands) {
    commands.push(command.data.toJSON());
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
  }
}

// Initialize bot
async function main() {
  try {
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

    await client.login(process.env.DISCORD_TOKEN);
    await deployCommands();
    console.log("✅ Ishi Music Bot is online!");
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
