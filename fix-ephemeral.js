#!/usr/bin/env node

// Script to fix deprecated ephemeral usage in Discord.js v14
const fs = require("fs");
const path = require("path");

const commandsDir = path.join(__dirname, "commands");
const files = fs
  .readdirSync(commandsDir)
  .filter((file) => file.endsWith(".js"));

console.log("🔧 Fixing deprecated ephemeral usage...");
console.log(`Found ${files.length} command files:`, files);

files.forEach((file) => {
  const filePath = path.join(commandsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Check if file needs MessageFlags import
  const needsMessageFlags = content.includes("ephemeral: true");

  if (needsMessageFlags) {
    console.log(`📝 Updating ${file}...`);

    // Add MessageFlags to imports if not already present
    if (!content.includes("MessageFlags")) {
      // Find the require statement for discord.js
      const discordRequireRegex =
        /const\s*{\s*([^}]*)\s*}\s*=\s*require\(['"`]discord\.js['"`]\);?/;
      const match = content.match(discordRequireRegex);

      if (match) {
        const currentImports = match[1].trim();
        const newImports = currentImports.includes("MessageFlags")
          ? currentImports
          : currentImports + ", MessageFlags";

        const newRequire = `const { ${newImports} } = require("discord.js");`;
        content = content.replace(discordRequireRegex, newRequire);
      }
    }

    // Replace ephemeral: true with flags: MessageFlags.Ephemeral
    content = content.replace(
      /ephemeral:\s*true/g,
      "flags: MessageFlags.Ephemeral"
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
  }
});

console.log("🎉 All files updated!");
