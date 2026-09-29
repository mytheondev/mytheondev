// Rasterizes public/favicon.svg into the PNG icons that cannot be SVG:
// apple-touch-icon (iOS ignores SVG) and the manifest's 192/512 icons.
// Run with `pnpm icons` after changing the SVG, then commit the PNGs.
//
// The favicon is transparent and switches colors with prefers-color-scheme.
// PNGs cannot do either, so they get the dark variant on an opaque tile.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const svg = await readFile(`${publicDir}favicon.svg`, "utf8");

const background = "#0b0d12";

// Light stop-color (inline attribute) → dark stop-color (from the <style> block).
const darkStops = {
  "slash-a": "#AAB6FF",
  "slash-b": "#6272F0",
  "pill-a": "#6272F0",
  "pill-b": "#8B9CFF",
};

const toDarkTile = (radius) => {
  let out = svg.replace(/<style>[\s\S]*?<\/style>\n?/, "");
  for (const [name, color] of Object.entries(darkStops)) {
    out = out.replace(
      new RegExp(`class="${name}"([^>]*?)stop-color="#[0-9A-Fa-f]{6}"`, "g"),
      `class="${name}"$1stop-color="${color}"`,
    );
  }
  // Wider canvas than the favicon's tight viewBox: platforms mask icon corners.
  return out
    .replace('viewBox="16 16 168 168"', 'viewBox="0 0 200 200"')
    .replace(
      /(<svg[^>]*>\n?)/,
      `$1<rect width="200" height="200" rx="${radius}" fill="${background}"/>\n`,
    );
};

// iOS masks the icon itself and fills transparency with black, so the
// apple-touch-icon is full-bleed: square corners, opaque background.
const targets = [
  { file: "apple-touch-icon.png", size: 180, source: toDarkTile(0), flatten: true },
  { file: "icon-192.png", size: 192, source: toDarkTile(30), flatten: false },
  { file: "icon-512.png", size: 512, source: toDarkTile(30), flatten: false },
];

for (const { file, size, source, flatten } of targets) {
  let image = sharp(Buffer.from(source), { density: 72 * (size / 200) * 4 }).resize(size, size);
  if (flatten) image = image.flatten({ background });
  await image.png({ compressionLevel: 9 }).toFile(`${publicDir}${file}`);
  console.log(`✓ public/${file} (${size}×${size})`);
}
