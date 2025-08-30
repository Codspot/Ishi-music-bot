#!/usr/bin/env node
require("dotenv").config();
const fs = require("fs");

// Same function as in index.js
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

console.log("🔍 Testing YouTube cookie loading...");
const cookies = loadYouTubeCookies();

if (cookies.length > 0) {
  console.log("\n📊 Cookie Summary:");
  console.log(`   Total: ${cookies.length} cookies`);
  console.log(
    `   Domains: ${[...new Set(cookies.map((c) => c.domain))].join(", ")}`
  );
  console.log(
    `   Sample names: ${cookies
      .slice(0, 5)
      .map((c) => c.name)
      .join(", ")}`
  );

  // Check for important authentication cookies
  const authCookies = cookies.filter((c) =>
    ["SID", "HSID", "SSID", "APISID", "SAPISID", "LOGIN_INFO"].includes(c.name)
  );
  console.log(`   Auth cookies: ${authCookies.length} found`);

  if (authCookies.length > 0) {
    console.log("\n✅ SUCCESS: YouTube Premium cookies loaded and ready!");
    console.log("🎵 Bot should have enhanced YouTube access");
  } else {
    console.log("\n⚠️  WARNING: No authentication cookies found");
    console.log("🔍 May not have premium access");
  }
} else {
  console.log("\n❌ FAILED: No YouTube cookies loaded");
}
