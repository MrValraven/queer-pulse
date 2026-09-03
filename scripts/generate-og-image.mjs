/**
 * One-off Open Graph image generation, rendered from HTML with Chromium.
 *
 * Social scrapers (Slack, WhatsApp, iMessage, Signal, X) and Google all refuse
 * to render SVG in link unfurls, so the shared social image must be a raster
 * PNG. Output is committed to public/ rather than generated at build time, for
 * the same reason as the PWA icons: the artwork changes roughly never and a
 * build-time dependency on a browser binary would be a poor trade.
 *
 * This used to rasterise a hand-authored SVG with sharp/librsvg, but librsvg
 * substitutes system fonts for anything not installed on the machine doing the
 * rasterising — so the wordmark rendered in Georgia instead of the app's real
 * Fraunces, and the substitution silently went stale the next time the SVG's
 * copy changed without a re-render. Chromium (already a devDependency for
 * prerendering and Playwright e2e) renders the app's actual self-hosted
 * Fraunces/DM Sans woff2 files and gives proper subpixel-antialiased text, so
 * this generates real HTML/CSS instead and screenshots it. The screenshot is
 * taken at 2x and downscaled to the 1200x630 OG target, which supersamples the
 * text edges for a crisper result than a 1x capture.
 *
 * Re-run with `pnpm og` if the copy or design below changes. Requires the
 * Chromium binary: `pnpm prerender:browser` installs it if missing.
 */
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const OUTPUT_PATH = "public/og-default.png";
const OPEN_GRAPH_WIDTH = 1200;
const OPEN_GRAPH_HEIGHT = 630;
const CAPTURE_SCALE = 2;

// Kept in sync with src/styles/tokens/colors.css by hand — this script runs
// outside the app's token pipeline.
const COLORS = {
  plum: "#2d1b3d",
  plumDeep: "#241430",
  accent: "#e8775a",
  amber: "#e8b44a",
  jadeSoft: "#7cd7ad",
  cream: "#f7f3ee",
};

const TITLE = "A queer network, rooted in Lisbon";
const SUBTITLE =
  "A place to discover what's happening across Lisbon's queer community and find the people, communities, events, and opportunities shaping queer life in the city.";
const FOOTER = "No ads. No algorithm. queerpulse.com";

async function fontDataUri(path) {
  const buffer = await readFile(path);
  return `data:font/woff2;base64,${buffer.toString("base64")}`;
}

const [fraunces, frauncesItalic, dmSans] = await Promise.all([
  fontDataUri(
    "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2",
  ),
  fontDataUri(
    "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2",
  ),
  fontDataUri(
    "node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-opsz-normal.woff2",
  ),
]);

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: "Fraunces";
    src: url(${fraunces}) format("woff2");
    font-weight: 300 900;
    font-style: normal;
  }
  @font-face {
    font-family: "Fraunces";
    src: url(${frauncesItalic}) format("woff2");
    font-weight: 300 900;
    font-style: italic;
  }
  @font-face {
    font-family: "DM Sans";
    src: url(${dmSans}) format("woff2");
    font-weight: 300 700;
    font-style: normal;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${OPEN_GRAPH_WIDTH}px;
    height: ${OPEN_GRAPH_HEIGHT}px;
    overflow: hidden;
  }
  body {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 22px;
    padding: 90px 100px;
    background: linear-gradient(135deg, ${COLORS.plum}, ${COLORS.plumDeep});
    font-family: "DM Sans", sans-serif;
  }
  .stripe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10px;
    background: linear-gradient(90deg, ${COLORS.accent}, ${COLORS.amber}, ${COLORS.jadeSoft});
  }
  /* The horizontal lockup from the brand guide: the coral dot at 0.4em with
     a one-dot gap, Fraunces semibold, "Pulse" in the italic. */
  .wordmark {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    font-family: "Fraunces", serif;
    font-weight: 600;
    font-optical-sizing: auto;
    font-size: 100px;
    line-height: 1;
    letter-spacing: -0.012em;
    color: ${COLORS.cream};
  }
  .wordmark .dot {
    width: 0.4em;
    height: 0.4em;
    border-radius: 50%;
    background: ${COLORS.accent};
    flex: none;
  }
  .wordmark i {
    font-style: italic;
  }
  .title {
    font-family: "Fraunces", serif;
    font-style: italic;
    font-weight: 500;
    font-optical-sizing: auto;
    font-size: 48px;
    line-height: 1.15;
    color: ${COLORS.accent};
    max-width: 900px;
  }
  .subtitle {
    font-size: 29px;
    line-height: 1.48;
    color: rgba(247, 243, 238, 0.82);
    max-width: 880px;
  }
  .footer {
    font-size: 25px;
    color: rgba(247, 243, 238, 0.62);
  }
</style>
</head>
<body>
  <div class="stripe"></div>
  <div class="wordmark"><span class="dot"></span><span>Queer<i>Pulse</i></span></div>
  <div class="title">${TITLE}</div>
  <div class="subtitle">${SUBTITLE}</div>
  <div class="footer">${FOOTER}</div>
</body>
</html>`;

const browser = await chromium.launch();
let screenshot;
try {
  const page = await browser.newPage({
    viewport: { width: OPEN_GRAPH_WIDTH, height: OPEN_GRAPH_HEIGHT },
    deviceScaleFactor: CAPTURE_SCALE,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  screenshot = await page.screenshot({ type: "png" });
} finally {
  await browser.close();
}

await sharp(screenshot)
  .resize(OPEN_GRAPH_WIDTH, OPEN_GRAPH_HEIGHT)
  .png()
  .toFile(OUTPUT_PATH);

console.log(
  `Wrote ${OPEN_GRAPH_WIDTH}x${OPEN_GRAPH_HEIGHT} Open Graph image to ${OUTPUT_PATH}`,
);
