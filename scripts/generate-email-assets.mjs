#!/usr/bin/env node
/**
 * Hosted images for the admin email designs, written to public/email/.
 *
 * Staff copy a rendered email from the template editor and paste it into
 * Gmail, Outlook or Apple Mail. Those clients load no web fonts and render no
 * SVG, so anything that has to look like QueerPulse (the Fraunces wordmark,
 * the pulse dot, the Feather icons) travels as a PNG or GIF served from the
 * site origin. The manifest that names these files and their 1x sizes is
 * src/features/admin/emailTemplates/design/emailAssets.ts; keep it in step
 * with the sizes printed at the end of a run.
 *
 * What it makes, every file drawn at 2x its 1x display size:
 *   - logo-on-dark.png, logo-on-light.png: the horizontal lockup (coral dot,
 *     "Queer" roman plus "Pulse" italic in Fraunces 600) in cream for plum
 *     grounds and in plum for cream or paper. Transparent, trimmed to the ink
 *     horizontally, a fixed 32px (1x) tall so both sit on the same line box.
 *     The plum one carries a 2px white ring so it stays legible when a
 *     dark-mode client darkens the ground behind it.
 *   - hero-pulse.gif: a 600x160 band of solid plum-deep with coral and jade
 *     rings flowing out of the dot: 70 frames at 40 ms (25 fps), a 2.8 s
 *     loop that sends three evenly spaced rings (coral, coral, jade, the
 *     same order every loop so it joins seamlessly). Each ring travels at a
 *     near-constant speed for the whole loop and does its dissolving in the
 *     opacity, while the dot and its halos breathe on one slow sine. GIF has
 *     no partial alpha, so the ground is baked in, and the rings fade out by
 *     distance from the centre well before the edges: every edge pixel is
 *     exactly plum-deep, so the band meets the plum-deep masthead above it
 *     and the strip below it without a seam.
 *   - pulse-mark.gif: a 72x72 cream square with the dot and two rings.
 *   - icon-<name>.png: the six feature icons, a Feather stroke icon in the
 *     deep coral on a soft coral disc, transparent outside the disc.
 *
 * Outlook for Windows shows only the first frame of a GIF, so both loops are
 * phased to open with rings already mid-expansion: frame one is a finished
 * still. The loops close on themselves (every ring's phase wraps), so the
 * seam is invisible.
 *
 * Text and icons are rendered by Chromium from the app's self-hosted woff2
 * files, like scripts/generate-og-image.mjs; the GIF frames are drawn on a
 * canvas in the same page and joined into an animation by sharp. No random
 * input is used anywhere, so a re-run writes the same art.
 *
 * Re-run with `node scripts/generate-email-assets.mjs` from the repo root.
 * Requires the Chromium binary: `pnpm prerender:browser` installs it.
 */
import { mkdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FiBookOpen,
  FiCalendar,
  FiMapPin,
  FiMessageCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import sharp from "sharp";

const OUTPUT_DIRECTORY = fileURLToPath(
  new URL("../public/email/", import.meta.url),
);
const FONT_DIRECTORY = fileURLToPath(
  new URL(
    "../node_modules/@fontsource-variable/fraunces/files/",
    import.meta.url,
  ),
);
const CAPTURE_SCALE = 2;

// Kept in sync with src/styles/tokens/colors.css by hand: this script runs
// outside the app's token pipeline.
const COLORS = {
  plum: "#2d1b3d",
  plumDeep: "#241430",
  accent: "#e8775a",
  accentFill: "#d5431e",
  accentSoft: "#ffc4af",
  jade: "#4a8c6f",
  cream: "#f7f3ee",
  paper: "#ffffff",
};

/* The icon disc: the coral accent laid over paper at 14%, the same tint the
   app uses behind accent icons. Computed so it follows the accent. */
const ICON_DISC_ACCENT_SHARE = 0.14;

const LOGO_HEIGHT = 32;
const LOGO_FONT_SIZE = 25;
const LOGO_SIDE_PADDING = 2;
const LOGO_HALO_WIDTH = 2;
/* Room round the lockup in the capture so nothing is clipped before the trim
   measures the ink; the trim then sets the real padding. */
const LOGO_CAPTURE_MARGIN = 8;

const HERO = {
  fileName: "hero-pulse.gif",
  width: 600,
  height: 160,
  frameCount: 70,
  /* 25 fps. Slower frame rates make slow motion look stepped, and some
     clients clamp delays under 40 ms up to 100 ms. */
  frameDelayMs: 40,
  colours: 128,
  dither: 0,
  /* Frames differ only in the rings and the breathing dot, so the encoder
     keeps one palette and leaves pixels within 12 levels of the previous
     frame transparent. Against a lossless encode that moves fewer than 60
     of the 384,000 pixels in any frame by more than 20 levels. */
  interFrameMaxError: 12,
  shouldReusePalette: true,
};

const MARK = {
  fileName: "pulse-mark.gif",
  width: 72,
  height: 72,
  frameCount: 30,
  frameDelayMs: 60,
  colours: 48,
  dither: 0,
};

const ICON_SIZE = 48;
const ICON_GLYPH_SIZE = 24;
const FEATURE_ICONS = {
  communities: FiUsers,
  gatherings: FiCalendar,
  directory: FiMapPin,
  messages: FiMessageCircle,
  magazine: FiBookOpen,
  safety: FiShield,
};

/* ------------------------------------------------------------------ helpers */

function hexToChannels(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function channelsToHex(channels) {
  return `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixOverPaper(hex, share) {
  const paperChannels = hexToChannels(COLORS.paper);
  return channelsToHex(
    hexToChannels(hex).map(
      (channel, index) => channel * share + paperChannels[index] * (1 - share),
    ),
  );
}

async function fontDataUri(fileName) {
  const buffer = await readFile(`${FONT_DIRECTORY}${fileName}`);
  return `data:font/woff2;base64,${buffer.toString("base64")}`;
}

function outputPath(fileName) {
  return `${OUTPUT_DIRECTORY}${fileName}`;
}

async function reportFile(fileName) {
  const { size } = await stat(outputPath(fileName));
  const metadata = await sharp(outputPath(fileName), {
    animated: true,
  }).metadata();
  const frameHeight = metadata.pageHeight ?? metadata.height;
  const frames = metadata.pages ?? 1;
  console.log(
    `${fileName}: ${metadata.width}x${frameHeight} file, ` +
      `${metadata.width / CAPTURE_SCALE}x${frameHeight / CAPTURE_SCALE} at 1x, ` +
      `${frames} frame${frames === 1 ? "" : "s"}, ${(size / 1024).toFixed(1)} KB`,
  );
}

/* ------------------------------------------------------------------- logos */

function logoHtml(fontFaces, inkColor, haloColor) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${fontFaces}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: transparent; }
  /* The horizontal lockup from the brand guide: the coral dot at 0.4em with
     a one-dot gap, Fraunces semibold, "Pulse" in the italic. */
  .wordmark {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    height: ${LOGO_HEIGHT}px;
    padding: 0 ${LOGO_CAPTURE_MARGIN}px;
    font-family: "Fraunces", serif;
    font-weight: 600;
    font-optical-sizing: auto;
    font-size: ${LOGO_FONT_SIZE}px;
    line-height: 1;
    letter-spacing: -0.012em;
    color: ${inkColor};
    white-space: nowrap;
  }
  .wordmark .dot {
    width: 0.4em;
    height: 0.4em;
    border-radius: 50%;
    background: ${COLORS.accent};
    flex: none;
  }
  .wordmark i { font-style: italic; }
  ${haloColor ? logoHaloCss(haloColor) : ""}
</style>
</head>
<body><div class="wordmark"><span class="dot"></span><span>Queer<i>Pulse</i></span></div></body>
</html>`;
}

/* A thin light ring round the dot and every glyph, for the lockup that sits
   on cream or paper. Gmail for iOS and Outlook dark modes darken the ground
   behind an image but leave the image alone, and a plum wordmark on
   transparent would vanish into it. The ring is paper white, so on the
   letter's white sheet it cannot be seen at all and on cream it is a
   near-invisible hairline. Sixteen hard text shadows round a circle make a
   round-cornered outline; -webkit-text-stroke would put mitred spikes on the
   serifs. */
function logoHaloCss(haloColor) {
  const directionCount = 16;
  const shadows = Array.from({ length: directionCount }, (_, index) => {
    const angle = (index / directionCount) * Math.PI * 2;
    const offsetX = (Math.cos(angle) * LOGO_HALO_WIDTH).toFixed(3);
    const offsetY = (Math.sin(angle) * LOGO_HALO_WIDTH).toFixed(3);
    return `${offsetX}px ${offsetY}px 0 ${haloColor}`;
  });
  return `
  .wordmark { text-shadow: ${shadows.join(", ")}; }
  .wordmark .dot { box-shadow: 0 0 0 ${LOGO_HALO_WIDTH}px ${haloColor}; }`;
}

/* Crops a transparent capture to its ink horizontally, keeps the full line
   box vertically, then pads each side and rounds the width up to an even
   pixel count so the 1x width is a whole number. */
async function trimLogoCapture(capture) {
  const { data, info } = await sharp(capture)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let leftmostInk = info.width;
  let rightmostInk = -1;
  for (let row = 0; row < info.height; row += 1) {
    for (let column = 0; column < info.width; column += 1) {
      const alpha = data[(row * info.width + column) * 4 + 3];
      if (alpha > 0) {
        leftmostInk = Math.min(leftmostInk, column);
        rightmostInk = Math.max(rightmostInk, column);
      }
    }
  }
  const padding = LOGO_SIDE_PADDING * CAPTURE_SCALE;
  const inkWidth = rightmostInk - leftmostInk + 1;
  let targetWidth = inkWidth + padding * 2;
  targetWidth += targetWidth % 2;
  const left = Math.max(0, leftmostInk - padding);
  const width = Math.min(targetWidth, info.width - left);
  const cropped = await sharp(capture)
    .extract({ left, top: 0, width, height: info.height })
    .extend({
      right: targetWidth - width,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  return { buffer: cropped, width: targetWidth, height: info.height };
}

async function renderLogos(page, fontFaces) {
  const variants = [
    { fileName: "logo-on-dark.png", inkColor: COLORS.cream },
    {
      fileName: "logo-on-light.png",
      inkColor: COLORS.plum,
      haloColor: COLORS.paper,
    },
  ];
  const sizes = [];
  for (const variant of variants) {
    await page.setViewportSize({ width: 400, height: LOGO_HEIGHT });
    await page.setContent(
      logoHtml(fontFaces, variant.inkColor, variant.haloColor),
      {
        waitUntil: "networkidle",
      },
    );
    await page.evaluate(() => document.fonts.ready);
    const capture = await page
      .locator(".wordmark")
      .screenshot({ omitBackground: true, type: "png" });
    const trimmed = await trimLogoCapture(capture);
    await sharp(trimmed.buffer).toFile(outputPath(variant.fileName));
    sizes.push(trimmed);
  }
  return sizes;
}

/* ------------------------------------------------------------ pulse frames */

/* Runs inside the page: draws one frame of a pulse loop on a canvas and
   returns it as a PNG data URL. Self-contained because Playwright serialises
   it into the browser. Every size in `scene` is in 1x pixels. */
function drawPulseFrame(scene) {
  const scale = scene.captureScale;
  let canvas = document.querySelector("canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
  }
  canvas.width = scene.width * scale;
  canvas.height = scene.height * scale;
  const context = canvas.getContext("2d");
  context.setTransform(scale, 0, 0, scale, 0, 0);

  context.fillStyle = scene.background;
  context.fillRect(0, 0, scene.width, scene.height);

  /* With `edgeFade` the art goes on its own layer, which is faded to nothing
     near every edge before it lands on the flat background. That keeps each
     edge pixel exactly the background colour, so the band sits flush against
     a table cell of the same colour above and below it. */
  const layer = scene.edgeFade ? document.createElement("canvas") : canvas;
  if (layer !== canvas) {
    layer.width = canvas.width;
    layer.height = canvas.height;
  }
  const art = layer === canvas ? context : layer.getContext("2d");
  art.setTransform(scale, 0, 0, scale, 0, 0);

  const time = scene.frameIndex / scene.frameCount;
  const ringCount = scene.ringColors.length;
  /* Two motions share this drawing. "beat" (the pulse mark) swells the dot
     sharply as each ring leaves it. "breath" (the hero) is the calm one:
     rings travel at a near-constant speed and dissolve in their opacity, and
     the dot and halos breathe on one sine across the whole loop. */
  const isBreathing = scene.motion === "breath";
  const breath = isBreathing
    ? 0.5 - 0.5 * Math.cos((time + scene.breathOffset) * Math.PI * 2)
    : 0;

  for (const guideRadius of scene.guideRadii ?? []) {
    art.beginPath();
    art.arc(scene.centerX, scene.centerY, guideRadius, 0, Math.PI * 2);
    art.strokeStyle = scene.guideColor;
    art.lineWidth = 1;
    art.stroke();
  }

  /* Flat halo discs round the dot. A radial gradient would band into
     visible steps in a GIF palette; flat discs are steps on purpose. */
  const haloScale = 1 + (scene.haloBreathAmount ?? 0) * breath;
  for (const halo of scene.halos ?? []) {
    art.beginPath();
    art.arc(
      scene.centerX,
      scene.centerY,
      halo.radius * haloScale,
      0,
      Math.PI * 2,
    );
    art.fillStyle = halo.color;
    art.fill();
  }

  /* Each ring slot is offset by 1/ringCount of the loop and wraps back to
     the dot, so frame zero already shows rings at more than one stage and
     the loop closes on itself. Rings are drawn outermost first so the fresh
     ones sit on top. */
  const rings = scene.ringColors.map((color, slot) => ({
    color,
    phase: (time + scene.phaseOffset + slot / ringCount) % 1,
  }));
  rings.sort((first, second) => second.phase - first.phase);
  for (const ring of rings) {
    const radius =
      scene.dotRadius +
      (scene.ringMaxRadius - scene.dotRadius) * ringReach(ring.phase);
    const opacity = scene.ringOpacity * ringStrength(ring.phase);
    art.beginPath();
    art.arc(scene.centerX, scene.centerY, radius, 0, Math.PI * 2);
    art.globalAlpha = opacity;
    art.strokeStyle = ring.color;
    art.lineWidth =
      scene.ringStartWidth +
      (scene.ringEndWidth - scene.ringStartWidth) * ring.phase;
    art.stroke();
    art.globalAlpha = 1;
  }

  /* A very light ease-out: the speed only drops from 1.3x to about 0.5x the
     average by the time a ring has faded, so nothing crawls. */
  function ringReach(phase) {
    return 1 - (1 - phase) ** (isBreathing ? 1.3 : 1.7);
  }

  function smoothstep(progress) {
    const clamped = Math.min(1, Math.max(0, progress));
    return clamped * clamped * (3 - 2 * clamped);
  }

  /* Breathing rings: a quick fade-in over the first 6% of the travel, full
     strength to 20%, then a smoothstep down that is nearly gone by 85% and
     reaches zero at 92%. */
  function ringStrength(phase) {
    if (!isBreathing) {
      return Math.min(1, phase / 0.06) * (1 - phase) ** 1.3;
    }
    return smoothstep(phase / 0.06) * (1 - smoothstep((phase - 0.2) / 0.72));
  }

  let dotScale = 1 + (scene.dotBreathAmount ?? 0) * breath;
  if (!isBreathing) {
    /* The dot swells slightly as each ring leaves it: a heartbeat per ring. */
    const beatPhase = ((time + scene.phaseOffset) * ringCount) % 1;
    const beat = (0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2)) ** 6;
    dotScale = 1 + scene.beatAmount * beat;
  }
  art.beginPath();
  art.arc(
    scene.centerX,
    scene.centerY,
    scene.dotRadius * dotScale,
    0,
    Math.PI * 2,
  );
  art.fillStyle = scene.dotColor;
  art.fill();

  if (layer !== canvas) {
    /* Two linear masks, one per axis, multiply the layer's alpha by distance
       from the centre line: full strength out to `solid` px, a smoothstep
       down to nothing at `clear` px, and nothing beyond. Each axis's `clear`
       sits inside the band, so rings dissolve before they meet an edge. */
    const fadeStepCount = 12;
    art.globalCompositeOperation = "destination-in";
    for (const isVertical of [true, false]) {
      const length = isVertical ? scene.height : scene.width;
      const fade = isVertical
        ? scene.edgeFade.vertical
        : scene.edgeFade.horizontal;
      const gradient = isVertical
        ? art.createLinearGradient(0, 0, 0, length)
        : art.createLinearGradient(0, 0, length, 0);
      const middle = length / 2;
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      for (let step = 0; step <= fadeStepCount; step += 1) {
        const progress = step / fadeStepCount;
        const distance = fade.solid + (fade.clear - fade.solid) * progress;
        const strength = 1 - progress * progress * (3 - 2 * progress);
        const color = `rgba(0, 0, 0, ${strength.toFixed(4)})`;
        gradient.addColorStop((middle - distance) / length, color);
        gradient.addColorStop((middle + distance) / length, color);
      }
      art.fillStyle = gradient;
      art.fillRect(0, 0, scene.width, scene.height);
    }
    art.globalCompositeOperation = "source-over";
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.drawImage(layer, 0, 0);
  }

  return canvas.toDataURL("image/png");
}

async function renderPulseGif(page, config, scene) {
  await page.setViewportSize({ width: config.width, height: config.height });
  await page.setContent(
    "<!doctype html><html><body style='margin:0'></body></html>",
  );
  const frames = [];
  for (let frameIndex = 0; frameIndex < config.frameCount; frameIndex += 1) {
    const dataUrl = await page.evaluate(drawPulseFrame, {
      ...scene,
      width: config.width,
      height: config.height,
      captureScale: CAPTURE_SCALE,
      frameIndex,
      frameCount: config.frameCount,
    });
    frames.push(Buffer.from(dataUrl.split(",")[1], "base64"));
  }
  await sharp(frames, { join: { animated: true } })
    .gif({
      loop: 0,
      delay: frames.map(() => config.frameDelayMs),
      colours: config.colours,
      effort: 10,
      dither: config.dither,
      interFrameMaxError: config.interFrameMaxError ?? 2,
      interPaletteMaxError: config.interPaletteMaxError ?? 3,
      reuse: config.shouldReusePalette ?? true,
    })
    .toFile(outputPath(config.fileName));
}

function renderHero(page) {
  return renderPulseGif(page, HERO, {
    background: COLORS.plumDeep,
    edgeFade: {
      vertical: { solid: 36, clear: 72 },
      horizontal: { solid: 230, clear: 292 },
    },
    centerX: HERO.width / 2,
    centerY: HERO.height / 2,
    motion: "breath",
    breathOffset: 0,
    dotRadius: 12,
    dotBreathAmount: 0.06,
    dotColor: COLORS.accent,
    halos: [
      { radius: 34, color: "rgba(232, 119, 90, 0.08)" },
      { radius: 22, color: "rgba(232, 119, 90, 0.14)" },
    ],
    haloBreathAmount: 0.08,
    guideRadii: [48, 96, 150],
    guideColor: "rgba(247, 243, 238, 0.05)",
    ringColors: [COLORS.accent, COLORS.accent, COLORS.jade],
    ringMaxRadius: 210,
    ringOpacity: 0.95,
    ringStartWidth: 2.5,
    ringEndWidth: 1.5,
    phaseOffset: 0.13,
  });
}

function renderMark(page) {
  return renderPulseGif(page, MARK, {
    background: COLORS.cream,
    centerX: MARK.width / 2,
    centerY: MARK.height / 2,
    dotRadius: 8,
    dotColor: COLORS.accent,
    ringColors: [COLORS.accent, COLORS.accent],
    ringMaxRadius: 34,
    ringOpacity: 1,
    ringStartWidth: 2.5,
    ringEndWidth: 1.25,
    beatAmount: 0.1,
    phaseOffset: 0.2,
  });
}

/* ------------------------------------------------------------------- icons */

function iconHtml(Icon) {
  const glyph = renderToStaticMarkup(
    createElement(Icon, { size: ICON_GLYPH_SIZE, color: COLORS.accentFill }),
  );
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; }
  html, body { background: transparent; }
  .disc {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${ICON_SIZE}px;
    height: ${ICON_SIZE}px;
    border-radius: 50%;
    background: ${mixOverPaper(COLORS.accent, ICON_DISC_ACCENT_SHARE)};
  }
  svg { display: block; }
</style>
</head>
<body><div class="disc">${glyph}</div></body>
</html>`;
}

async function renderIcons(page) {
  await page.setViewportSize({ width: ICON_SIZE, height: ICON_SIZE });
  for (const [name, Icon] of Object.entries(FEATURE_ICONS)) {
    await page.setContent(iconHtml(Icon));
    const capture = await page
      .locator(".disc")
      .screenshot({ omitBackground: true, type: "png" });
    await sharp(capture)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(outputPath(`icon-${name}.png`));
  }
}

/* -------------------------------------------------------------------- main */

const [frauncesRoman, frauncesItalic] = await Promise.all([
  fontDataUri("fraunces-latin-opsz-normal.woff2"),
  fontDataUri("fraunces-latin-opsz-italic.woff2"),
]);
const fontFaces = `
  @font-face {
    font-family: "Fraunces";
    src: url(${frauncesRoman}) format("woff2");
    font-weight: 300 900;
    font-style: normal;
  }
  @font-face {
    font-family: "Fraunces";
    src: url(${frauncesItalic}) format("woff2");
    font-weight: 300 900;
    font-style: italic;
  }`;

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

const browser = await chromium.launch();
let logoSizes;
try {
  const page = await browser.newPage({ deviceScaleFactor: CAPTURE_SCALE });
  logoSizes = await renderLogos(page, fontFaces);
  await renderIcons(page);
  await renderHero(page);
  await renderMark(page);
} finally {
  await browser.close();
}

const outputFiles = [
  "logo-on-dark.png",
  "logo-on-light.png",
  HERO.fileName,
  MARK.fileName,
  ...Object.keys(FEATURE_ICONS).map((name) => `icon-${name}.png`),
];
for (const fileName of outputFiles) {
  await reportFile(fileName);
}
const [darkLogo, lightLogo] = logoSizes;
console.log(
  `Manifest logo sizes (1x): on-dark ${darkLogo.width / CAPTURE_SCALE}x${darkLogo.height / CAPTURE_SCALE}, ` +
    `on-light ${lightLogo.width / CAPTURE_SCALE}x${lightLogo.height / CAPTURE_SCALE}`,
);
