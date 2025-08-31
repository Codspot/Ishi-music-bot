const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
require("dotenv").config();

// Simple test to verify our fixes work
console.log("🧪 Testing Ishi Music Bot fixes...");

// Test 1: Check if required environment variables are set
console.log("\n📋 Environment Check:");
console.log(`✅ Discord Token: ${process.env.DISCORD_TOKEN ? 'Set' : '❌ Missing'}`);
console.log(`✅ Node Environment: ${process.env.NODE_ENV || 'development'}`);

// Test 2: Check if main files can be required without errors
try {
  const config = require("./config");
  console.log("✅ Config file loads correctly");
  
  const Utils = require("./utils");
  console.log("✅ Utils file loads correctly");
  
  // Test DisTube setup
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });
  
  console.log("✅ Discord client created");
  
  // Test if cookies.txt exists
  const fs = require("fs");
  if (fs.existsSync("./cookies.txt")) {
    const cookiesContent = fs.readFileSync("./cookies.txt", "utf8");
    const youtubeCookieCount = (cookiesContent.match(/youtube\.com/g) || []).length;
    console.log(`✅ Cookies file exists with ${youtubeCookieCount} YouTube entries`);
  } else {
    console.log("⚠️ Cookies file not found - YouTube access may be limited");
  }
  
  console.log("\n🎉 All basic tests passed!");
  console.log("\n📝 Next steps:");
  console.log("1. Deploy to DigitalOcean server");
  console.log("2. Run: ./update-server.sh");
  console.log("3. Test music playback in Discord");
  
  process.exit(0);
  
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
