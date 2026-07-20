/**
 * One-off PWA icon generation from public/favicon.svg.
 *
 * Output is committed to public/icons/ rather than generated at build time: the
 * source mark changes roughly never, and a build-time dependency on sharp (with
 * its platform-specific binaries) would be a poor trade for that. Re-run with
 * `pnpm icons` if favicon.svg ever changes.
 */
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "public/favicon.svg";
const OUTPUT_DIRECTORY = "public/icons";
/* --plum, matching theme_color. Kept in sync with src/styles/tokens/colors.css
   by hand — this script runs outside the app's token pipeline. */
const PLUM = "#2d1b3d";
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

/**
 * Render the mark centred on a square canvas.
 *
 * `insetRatio` is the fraction of the canvas the mark occupies: 1 fills it,
 * 0.8 leaves the 10%-per-side margin Android's maskable safe zone requires so
 * a circle or squircle crop never clips the mark.
 */
async function renderSquare({ size, outputName, insetRatio, background }) {
  const markSize = Math.round(size * insetRatio);
  const offset = Math.round((size - markSize) / 2);

  // High density so the SVG rasterises crisply before it is downscaled.
  const mark = await sharp(SOURCE, { density: 384 })
    .resize(markSize, markSize, { fit: "contain", background: TRANSPARENT })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: mark, top: offset, left: offset }])
    .png()
    .toFile(`${OUTPUT_DIRECTORY}/${outputName}`);
}

await renderSquare({
  size: 192,
  outputName: "icon-192.png",
  insetRatio: 1,
  background: TRANSPARENT,
});
await renderSquare({
  size: 512,
  outputName: "icon-512.png",
  insetRatio: 1,
  background: TRANSPARENT,
});
await renderSquare({
  size: 512,
  outputName: "icon-512-maskable.png",
  insetRatio: 0.8,
  background: PLUM,
});
// iOS composites the touch icon onto the home screen with no transparency
// handling, so this one needs an opaque field.
await renderSquare({
  size: 180,
  outputName: "apple-touch-icon-180.png",
  insetRatio: 1,
  background: PLUM,
});

console.log(`Wrote 4 icons to ${OUTPUT_DIRECTORY}/`);
