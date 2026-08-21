/**
 * One-off PWA icon generation from public/favicon.svg.
 *
 * Output is committed to public/icons/ rather than generated at build time: the
 * source mark changes roughly never, and a build-time dependency on sharp (with
 * its platform-specific binaries) would be a poor trade for that. Re-run with
 * `pnpm icons` if favicon.svg ever changes.
 */
import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "public/favicon.svg";
const OUTPUT_DIRECTORY = "public/icons";
const SPLASH_DIRECTORY = "public/splash";
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

/* -------------------------------------------------------------------------- */
/* iOS launch (splash) images                                                 */
/* -------------------------------------------------------------------------- */

/* Cream wordmark ink, matching the OG image's text fill on the same plum
   field (see generate-og-image.mjs). Kept in sync with
   src/styles/tokens/colors.css by hand. */
const CREAM = "#f7f3ee";

await mkdir(SPLASH_DIRECTORY, { recursive: true });

/* The favicon mark, inlined so the splash SVG stays self-contained (librsvg
   resolves data: URIs but not external file refs). Read once. */
const markSvg = await readFile(SOURCE);
const markDataUri = `data:image/svg+xml;base64,${markSvg.toString("base64")}`;

/**
 * The exact device splash sizes iOS matches against the apple-touch-startup-image
 * media queries in index.html (pixel size = css-width×ratio by css-height×ratio),
 * plus the landscape swap noted in that file's manifest comment. There is no
 * wildcard: each device needs its own PNG at its exact pixel dimensions.
 */
const SPLASH_SIZES = [
  { outputName: "iphone-2796x1290.png", width: 2796, height: 1290 }, // 15/14 Pro Max, landscape
  { outputName: "iphone-1290x2796.png", width: 1290, height: 2796 }, // 15/14 Pro Max
  { outputName: "iphone-1179x2556.png", width: 1179, height: 2556 }, // 15/15 Pro/14 Pro
  { outputName: "iphone-1170x2532.png", width: 1170, height: 2532 }, // 14/13/12
  { outputName: "iphone-1125x2436.png", width: 1125, height: 2436 }, // 13 mini/12 mini/11 Pro/X/XS
  { outputName: "iphone-1242x2688.png", width: 1242, height: 2688 }, // 11 Pro Max/XS Max
  { outputName: "iphone-828x1792.png", width: 828, height: 1792 }, // 11/XR
  { outputName: "iphone-750x1334.png", width: 750, height: 1334 }, // SE/8/7/6s
  { outputName: "ipad-1536x2048.png", width: 1536, height: 2048 }, // common iPad
];

/**
 * Render a full-bleed plum splash with the mark + "QueerPulse" wordmark stacked
 * and optically centred. Everything is scaled off the shorter edge so portrait
 * and landscape canvases read identically.
 */
async function renderSplash({ width, height, outputName }) {
  const shortEdge = Math.min(width, height);
  const markSize = Math.round(shortEdge * 0.2);
  const wordmarkFontSize = Math.round(shortEdge * 0.08);
  const gap = Math.round(markSize * 0.4);

  const blockHeight = markSize + gap + wordmarkFontSize;
  const blockTop = Math.round((height - blockHeight) / 2);
  const markLeft = Math.round((width - markSize) / 2);
  const wordmarkBaseline = blockTop + markSize + gap + Math.round(wordmarkFontSize * 0.78);

  const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${PLUM}"/>
  <image href="${markDataUri}" x="${markLeft}" y="${blockTop}" width="${markSize}" height="${markSize}"/>
  <text x="${width / 2}" y="${wordmarkBaseline}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${wordmarkFontSize}" font-weight="700" fill="${CREAM}">QueerPulse</text>
</svg>`;

  await sharp(Buffer.from(splashSvg), { density: 384 })
    .resize(width, height)
    .png()
    .toFile(`${SPLASH_DIRECTORY}/${outputName}`);
}

for (const splash of SPLASH_SIZES) {
  await renderSplash(splash);
}

console.log(`Wrote ${SPLASH_SIZES.length} splash images to ${SPLASH_DIRECTORY}/`);

/* -------------------------------------------------------------------------- */
/* Monochrome push badge                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Android/Chrome hard-masks a notification `badge` to a single colour, so a
 * full-colour app icon renders as a grey blob. Derive a white-on-transparent
 * silhouette from the app mark by taking its alpha channel and painting it
 * solid white, then centre it in a 96×96 field with breathing room.
 */
async function renderMonochromeBadge() {
  const canvasSize = 96;
  const glyphSize = Math.round(canvasSize * 0.72);
  const offset = Math.round((canvasSize - glyphSize) / 2);

  // The favicon's mark is opaque, its surround transparent — so its alpha
  // channel is a clean silhouette of the mark.
  const silhouetteAlpha = await sharp(SOURCE, { density: 384 })
    .resize(glyphSize, glyphSize, { fit: "contain", background: TRANSPARENT })
    .ensureAlpha()
    .extractChannel("alpha")
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  // Paint that silhouette solid white by using it as the alpha of a white field.
  const whiteSilhouette = await sharp({
    create: {
      width: glyphSize,
      height: glyphSize,
      channels: 3,
      background: "#ffffff",
    },
  })
    .joinChannel(silhouetteAlpha, {
      raw: { width: glyphSize, height: glyphSize, channels: 1 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: TRANSPARENT,
    },
  })
    .composite([{ input: whiteSilhouette, top: offset, left: offset }])
    .png()
    .toFile(`${OUTPUT_DIRECTORY}/badge-monochrome-96.png`);
}

await renderMonochromeBadge();

console.log(`Wrote badge-monochrome-96.png to ${OUTPUT_DIRECTORY}/`);
