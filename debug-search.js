// Debug script to test discord-player search functionality
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { Player } = require("discord-player");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

async function testSearch() {
  try {
    console.log("🔍 Testing discord-player search capabilities...");

    // Load extractors
    try {
      const { DefaultExtractors } = require("@discord-player/extractor");
      await player.extractors.loadMulti(DefaultExtractors);
      console.log("✅ Extractors loaded successfully");
    } catch (error) {
      console.log("⚠️  Using fallback extractor loading method");
      await player.extractors.loadDefault();
      console.log("✅ Fallback extractors loaded successfully");
    }

    // Test different search queries
    const testQueries = [
      "Never Gonna Give You Up",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "Imagine Dragons - Believer",
      "spotify:track:1KQi8dRQ0tPB0IQAK8JTrq",
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      try {
        const results = await player.search(query, {
          requestedBy: { id: "test" },
        });
        console.log(`✅ Found ${results.tracks.length} tracks`);
        if (results.tracks.length > 0) {
          console.log(
            `   First result: "${results.tracks[0].title}" by ${results.tracks[0].author}`
          );
          console.log(`   Source: ${results.tracks[0].source}`);
        }
      } catch (error) {
        console.log(`❌ Search failed: ${error.message}`);
      }
    }

    // List available extractors
    console.log("\n📋 Loaded extractors:");
    const extractors = player.extractors.store;
    for (const [name, extractor] of extractors) {
      console.log(`   - ${name}: ${extractor.identifier || "No identifier"}`);
    }
  } catch (error) {
    console.error("❌ Debug test failed:", error);
  }

  process.exit(0);
}

client.once("ready", () => {
  console.log("🤖 Debug client ready");
  testSearch();
});

client.login(process.env.DISCORD_TOKEN);
