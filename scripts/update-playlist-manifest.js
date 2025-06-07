const fs = require("fs");
const path = require("path");

// Path to the youtube-playlists directory
const playlistsDir = path.join(
  __dirname,
  "..",
  "public",
  "data",
  "youtube-playlists",
);

// Read all JSON files in the directory (excluding manifest.json)
const files = fs
  .readdirSync(playlistsDir)
  .filter((file) => file.endsWith(".json") && file !== "manifest.json")
  .sort(); // Sort alphabetically for consistency

// Create manifest object
const manifest = {
  files: files,
};

// Write manifest file
const manifestPath = path.join(playlistsDir, "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log("✅ Manifest updated successfully!");
console.log(`📁 Found ${files.length} playlist files:`);
files.forEach((file) => console.log(`   - ${file}`));
