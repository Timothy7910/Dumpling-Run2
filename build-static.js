const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const dist = path.join(root, "dist");

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
};

try {
  fs.mkdirSync(dist, { recursive: true });

  for (const file of ["index.html", "styles.css", "track-data.js", "game.js", "map-editor.html"]) {
    const source = path.join(root, file);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(dist, file));
  }

  copyDir(path.join(root, "public"), path.join(dist, "public"));

  console.log("Static game copied to dist/");
} catch (error) {
  console.error(error);
  process.exit(1);
}
