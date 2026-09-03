/**
 * Brand-mark asset generation: favicon (SVG + ICO), PWA icons, the push badge
 * and the iOS launch (splash) screens.
 *
 * Everything is drawn from one source, src/shared/components/ui/
 * brandMark.geometry.json, through scripts/brand-mark-svg.mjs, which is the
 * same geometry the BrandMark React component renders. public/favicon.svg is
 * an OUTPUT of this script, never edited by hand.
 *
 * Output is committed to public/ rather than generated at build time: the mark
 * changes roughly never, and a build-time dependency on sharp and Chromium
 * would be a poor trade for that. Re-run with `pnpm icons` when the geometry
 * or the palette changes, then bump ICON_VERSION so installed apps and
 * browser caches pick the new files up (the manifest, index.html and sw.ts
 * reference the versioned names).
 *
 * Chromium (Playwright) renders the splash screens so the wordmark is set in
 * the app's real self-hosted Fraunces; librsvg would silently substitute a
 * system serif. `pnpm prerender:browser` installs the binary if missing.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { geometry, markSvg } from "./brand-mark-svg.mjs";

const OUTPUT_DIRECTORY = "public/icons";
const SPLASH_DIRECTORY = "public/splash";
/* Bump when the artwork changes; every referenced filename carries it. */
const ICON_VERSION = "v3";

/* --plum, --accent, --cream. Kept in sync with src/styles/tokens/colors.css by
   hand: this script runs outside the app's token pipeline. */
const PLUM = "#2d1b3d";
const CORAL = "#e8775a";
const CREAM = "#f7f3ee";
const WHITE = "#ffffff";
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const versioned = (name) => name.replace(/\.png$/, `-${ICON_VERSION}.png`);

async function rasterise(svg, size) {
  return sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .png()
    .toBuffer();
}

async function writePng(svg, size, outputName) {
  await writeFile(
    `${OUTPUT_DIRECTORY}/${outputName}`,
    await rasterise(svg, size),
  );
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

/* -------------------------------------------------------------------------- */
/* Favicon: SVG for modern browsers, ICO for Google Search and legacy         */
/* -------------------------------------------------------------------------- */

/* The compact drawing on the plum tile. The tile carries its own ground so the
   icon reads on light and dark tab strips alike, and stays plum in both. */
const faviconSvg = markSvg({
  state: "compact",
  core: CORAL,
  ring: CREAM,
  tile: { fill: PLUM, radius: geometry.tileRadius },
});
await writeFile("public/favicon.svg", faviconSvg);

/**
 * An ICO container holding PNG entries (supported by every current browser
 * and by Google's favicon crawler, which ignores SVG). 16 px gets the dot
 * alone, 32 px the compact drawing: the guide's size ladder, hand-fitted
 * rather than one master scaled down into anti-aliased mud.
 */
function icoContainer(entries) {
  const HEADER = 6;
  const DIRECTORY_ENTRY = 16;
  const header = Buffer.alloc(HEADER);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  const directory = Buffer.alloc(DIRECTORY_ENTRY * entries.length);
  let offset = HEADER + directory.length;
  entries.forEach(({ size, png }, index) => {
    const at = index * DIRECTORY_ENTRY;
    directory.writeUInt8(size === 256 ? 0 : size, at);
    directory.writeUInt8(size === 256 ? 0 : size, at + 1);
    directory.writeUInt8(0, at + 2); // palette
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(png.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });
  return Buffer.concat([header, directory, ...entries.map((e) => e.png)]);
}

const tile = { fill: PLUM, radius: geometry.tileRadius };
await writeFile(
  "public/favicon.ico",
  icoContainer([
    {
      size: 16,
      png: await rasterise(
        markSvg({ state: "dot", core: CORAL, ring: null, tile }),
        16,
      ),
    },
    { size: 32, png: await rasterise(faviconSvg, 32) },
  ]),
);
console.log("Wrote public/favicon.svg and public/favicon.ico");

/* -------------------------------------------------------------------------- */
/* PWA / home-screen icons                                                    */
/* -------------------------------------------------------------------------- */

/* The mark at rest (core, hairline ring, open outer ring) in cream on plum:
   the icon composition from the brand guide, section 10. The outer ring's
   radius is 21 of 64, so the visible mark is 66% of the tile. */
const iconOnTile = markSvg({ state: "rest", core: CORAL, ring: CREAM, tile });

/* `any`: the rounded plum tile with transparent corners, like a favicon, so it
   reads on any launcher or install dialog that does not mask. */
await writePng(iconOnTile, 192, versioned("icon-192.png"));
await writePng(iconOnTile, 512, versioned("icon-512.png"));

/* `maskable`: full-bleed opaque plum, shapes inset to 80% so everything sits
   inside the safe circle of radius 40% (W3C appmanifest) under any mask. */
await writePng(
  markSvg({
    state: "rest",
    core: CORAL,
    ring: CREAM,
    tile: { fill: PLUM, radius: 0 },
    inset: 0.8,
  }),
  512,
  versioned("icon-512-maskable.png"),
);

/* iOS composites the touch icon with no transparency handling and applies its
   own squircle: opaque, square, never pre-rounded. */
await writePng(
  markSvg({
    state: "rest",
    core: CORAL,
    ring: CREAM,
    tile: { fill: PLUM, radius: 0 },
  }),
  180,
  versioned("apple-touch-icon-180.png"),
);

/* `monochrome`: Android themed icons keep only the alpha channel, so this is
   the mark as a white silhouette on transparent, rings and core alike. */
const silhouette = (inset) =>
  markSvg({ state: "rest", core: WHITE, ring: WHITE, inset });
await writePng(silhouette(1), 512, versioned("icon-monochrome-512.png"));

/* Android/Chrome hard-masks a notification `badge` to a single colour, so it
   gets the same silhouette with breathing room. Referenced by src/sw.ts. */
await writePng(silhouette(0.72), 96, "badge-monochrome-96.png");

console.log(`Wrote 6 icons to ${OUTPUT_DIRECTORY}/ (${ICON_VERSION})`);

/* -------------------------------------------------------------------------- */
/* iOS launch (splash) images                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The exact device splash sizes iOS matches against the apple-touch-startup-image
 * media queries in index.html (pixel size = css-width×ratio by css-height×ratio),
 * plus the landscape swap noted in that file's manifest comment. There is no
 * wildcard: each device needs its own PNG at its exact pixel dimensions.
 */
const SPLASH_SIZES = [
  { outputName: "iphone-1320x2868.png", width: 1320, height: 2868 }, // 17 Pro Max/16 Pro Max
  { outputName: "iphone-1206x2622.png", width: 1206, height: 2622 }, // 17/17 Pro/16 Pro
  { outputName: "iphone-2796x1290.png", width: 2796, height: 1290 }, // 16 Plus/15 Plus/15 Pro Max/14 Pro Max, landscape
  { outputName: "iphone-1290x2796.png", width: 1290, height: 2796 }, // 16 Plus/15 Plus/15 Pro Max/14 Pro Max
  { outputName: "iphone-1284x2778.png", width: 1284, height: 2778 }, // 14 Plus/13 Pro Max/12 Pro Max
  { outputName: "iphone-1179x2556.png", width: 1179, height: 2556 }, // 16/16e/15/15 Pro/14 Pro
  { outputName: "iphone-1170x2532.png", width: 1170, height: 2532 }, // 14/13/13 Pro/12/12 Pro
  { outputName: "iphone-1125x2436.png", width: 1125, height: 2436 }, // 13 mini/12 mini/11 Pro/X/XS
  { outputName: "iphone-1242x2688.png", width: 1242, height: 2688 }, // 11 Pro Max/XS Max
  { outputName: "iphone-828x1792.png", width: 828, height: 1792 }, // 11/XR
  { outputName: "iphone-750x1334.png", width: 750, height: 1334 }, // SE/8/7/6s
  { outputName: "ipad-2048x2732.png", width: 2048, height: 2732 }, // iPad Pro 13"/12.9"
  { outputName: "ipad-1668x2388.png", width: 1668, height: 2388 }, // iPad Pro 11"
  { outputName: "ipad-1640x2360.png", width: 1640, height: 2360 }, // iPad Air 11"/10.9"
  { outputName: "ipad-1668x2224.png", width: 1668, height: 2224 }, // iPad Air 10.5"/Pro 10.5"
  { outputName: "ipad-1620x2160.png", width: 1620, height: 2160 }, // iPad 10.2"
  { outputName: "ipad-1536x2048.png", width: 1536, height: 2048 }, // iPad 9.7"
  { outputName: "ipad-1488x2266.png", width: 1488, height: 2266 }, // iPad mini 8.3"
];

async function fontDataUri(path) {
  const buffer = await readFile(path);
  return `data:font/woff2;base64,${buffer.toString("base64")}`;
}
const [fraunces, frauncesItalic] = await Promise.all([
  fontDataUri(
    "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2",
  ),
  fontDataUri(
    "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2",
  ),
]);

/* The mark in cream on plum, without a tile: the splash ground is the tile. */
const splashMark = markSvg({ state: "rest", core: CORAL, ring: CREAM });

/**
 * The stacked lockup from the brand guide (section 04), scaled off the short
 * edge so portrait and landscape read identically: wordmark at 9% of the
 * short edge, the symbol 1.3em above it with a 0.5em gap, Fraunces semibold
 * with "Pulse" in the italic. The plum ground is what the OS already painted
 * from the manifest's background_color, so the first app frame continues it.
 */
function splashHtml({ width, height }) {
  const wordmarkSize = Math.round(Math.min(width, height) * 0.09);
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: "Fraunces"; src: url(${fraunces}) format("woff2"); font-weight: 300 900; font-style: normal; }
  @font-face { font-family: "Fraunces"; src: url(${frauncesItalic}) format("woff2"); font-weight: 300 900; font-style: italic; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: ${PLUM}; }
  body { display: flex; align-items: center; justify-content: center; }
  .lockup { display: flex; flex-direction: column; align-items: center; gap: 0.5em; font-size: ${wordmarkSize}px; }
  .lockup svg { width: 1.3em; height: 1.3em; display: block; }
  .word { font-family: "Fraunces", serif; font-weight: 600; font-optical-sizing: auto; letter-spacing: -0.012em; line-height: 1; color: ${CREAM}; white-space: nowrap; }
  .word i { font-style: italic; }
</style></head>
<body><div class="lockup">${splashMark}<div class="word">Queer<i>Pulse</i></div></div></body></html>`;
}

await mkdir(SPLASH_DIRECTORY, { recursive: true });
const browser = await chromium.launch();
try {
  for (const splash of SPLASH_SIZES) {
    const page = await browser.newPage({
      viewport: { width: splash.width, height: splash.height },
      deviceScaleFactor: 1,
    });
    await page.setContent(splashHtml(splash), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      type: "png",
      path: `${SPLASH_DIRECTORY}/${splash.outputName}`,
    });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(
  `Wrote ${SPLASH_SIZES.length} splash images to ${SPLASH_DIRECTORY}/`,
);
