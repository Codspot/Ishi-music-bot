console.log("🔍 Testing bot components...");

try {
  console.log("1. Testing dotenv...");
  require("dotenv").config();
  console.log("✅ dotenv loaded");

  console.log("2. Testing Discord.js...");
  const { Client, GatewayIntentBits } = require("discord.js");
  console.log("✅ discord.js imported");

  console.log("3. Testing discord-player...");
  const { Player } = require("discord-player");
  console.log("✅ discord-player imported");

  console.log("4. Testing environment variables...");
  console.log("Token exists:", !!process.env.DISCORD_TOKEN);
  console.log("Client ID exists:", !!process.env.CLIENT_ID);

  console.log("5. Testing client creation...");
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
  console.log("✅ Discord client created");

  console.log("6. Testing player creation...");
  const player = new Player(client);
  console.log("✅ Player created");

  console.log("🎉 All components working!");
} catch (error) {
  console.error("❌ Error:", error.message);
  console.error("Stack:", error.stack);
}
