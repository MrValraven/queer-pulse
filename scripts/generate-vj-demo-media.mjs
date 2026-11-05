#!/usr/bin/env node
/**
 * VJ demo clips: eight tiny looping GIFs and one WebP still each.
 *
 * OUTPUT is public/vj-demo/<slug>.gif, public/vj-demo/<slug>.webp and
 * src/features/vj/demo/vjDemoMedia.data.ts, all generated in full and never
 * hand-edited. Re-run with `node scripts/generate-vj-demo-media.mjs` from the
 * repo root after touching anything here, then run `npx eslint --fix` on the
 * data file. Like scripts/generate-chat-wallpapers.mjs and
 * scripts/generate-icons.mjs, the result is committed and never built on
 * demand: the art changes roughly never, and a build-time step for eight small
 * files would be a poor trade. A fresh checkout has demo media with no setup.
 *
 * WHY GIFS AND NO DEMO VIDEO. The repo has no ffmpeg, and a canvas
 * MediaRecorder WebM carries no duration, which breaks `loop`. The video path
 * (playback rate, canplaythrough) is exercised in live only.
 *
 * LICENCE. Every frame is drawn here from maths and seeded noise, so nothing in
 * the output comes from a third party and the files need no credit line.
 *
 * DETERMINISM. Every random choice comes from mulberry32 seeded per slug, and
 * sharp encodes the same bytes for the same pixels, so two runs produce
 * identical files and a diff after a re-run is a real change.
 *
 * LOOPING. Each look is a function of `phase`, a number from 0 up to (not
 * including) 1 that advances by 1/FRAME_COUNT per frame. Every motion is
 * periodic in phase, so frame 23 flows into frame 0 with no jump.
 *
 * Colours below are artwork, so raw values are fine in this file. Nothing in
 * src/ carries one.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PUBLIC_DIRECTORY = fileURLToPath(
  new URL("../public/vj-demo/", import.meta.url),
);
const DATA_DIRECTORY = fileURLToPath(
  new URL("../src/features/vj/demo/", import.meta.url),
);
const DATA_PATH = `${DATA_DIRECTORY}vjDemoMedia.data.ts`;

const FRAME_COUNT = 24;
const FRAME_DELAY_MS = 80;
const GIF_COLOURS = 32;
const THUMBNAIL_LONG_EDGE = 480;
const THUMBNAIL_QUALITY = 70;
const MEDIA_URL_PREFIX = "/vj-demo/";

/* Size budgets. The script fails with a named message when one is passed. */
const MAX_GIF_BYTES = 220 * 1024;
const MAX_THUMBNAIL_BYTES = 60 * 1024;
const MAX_TOTAL_BYTES = 1_500_000;

/* Grain is drawn per block with three levels (darker, same, lighter): the look
   of film grain at a size a 32 colour GIF can still compress. A clip can ask
   for coarser blocks through `grainBlock`. */
const DEFAULT_GRAIN_BLOCK = 2;
/* The share of blocks that go darker, and the same share that go lighter. */
const GRAIN_SHARE = 0.03;

const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ random */

/* mulberry32: 32 bits of state, one multiply-xorshift round. Small, fast and
   seedable, which is all that scattering grain asks of a random source. */
function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/* FNV-1a, so a slug becomes a stable seed. */
function seedOf(text) {
  let hash = 2166136261;
  for (
    let characterIndex = 0;
    characterIndex < text.length;
    characterIndex += 1
  ) {
    hash ^= text.charCodeAt(characterIndex);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/* ------------------------------------------------------------------- maths */

function clamp(value, low = 0, high = 1) {
  return Math.min(high, Math.max(low, value));
}

function mix(from, to, amount) {
  return from + (to - from) * amount;
}

function mixColour(from, to, amount) {
  return [
    mix(from[0], to[0], amount),
    mix(from[1], to[1], amount),
    mix(from[2], to[2], amount),
  ];
}

function smoothstep(edgeLow, edgeHigh, value) {
  const amount = clamp((value - edgeLow) / (edgeHigh - edgeLow));
  return amount * amount * (3 - 2 * amount);
}

function fraction(value) {
  return value - Math.floor(value);
}

function scaleColour(colour, factor) {
  return [colour[0] * factor, colour[1] * factor, colour[2] * factor];
}

/* hue 0..1, saturation and lightness 0..1, returns [r, g, b] in 0..255. */
function hslToRgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = fraction(hue) * 6;
  const secondary = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = lightness - chroma / 2;
  const channels =
    sector < 1
      ? [chroma, secondary, 0]
      : sector < 2
        ? [secondary, chroma, 0]
        : sector < 3
          ? [0, chroma, secondary]
          : sector < 4
            ? [0, secondary, chroma]
            : sector < 5
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary];
  return channels.map((channel) => (channel + offset) * 255);
}

/* ------------------------------------------------------------------- looks */

/* Each look is `(context) => [r, g, b]` for one pixel. The context carries
   x, y, width, height, phase (0..1 around the loop) and random (the slug's
   seeded generator, for per-pixel work such as static). */

const NEON_CYAN = [30, 235, 245];
const NEON_BACKGROUND = [4, 8, 16];

function neonGrid({ x, y, width, height, phase }) {
  const horizonY = height * 0.42;
  const centreX = width / 2;
  if (y <= horizonY) {
    const glow = smoothstep(horizonY - 34, horizonY, y);
    return mixColour(NEON_BACKGROUND, [14, 70, 96], glow * 0.75);
  }
  const depth = 22 / (y - horizonY + 0.6);
  const rowLine = Math.abs(fraction(depth - phase) - 0.5);
  const sideways = ((x - centreX) / width) * depth * 9;
  const columnLine = Math.abs(fraction(sideways) - 0.5);
  const fade = smoothstep(0, 0.5, (y - horizonY) / (height - horizonY));
  const rowStrength = smoothstep(
    0.44,
    0.5,
    0.5 - Math.abs(rowLine - 0.5) + 0.0,
  );
  const columnStrength = smoothstep(
    0.44,
    0.5,
    0.5 - Math.abs(columnLine - 0.5) + 0.0,
  );
  const lineStrength = clamp(
    Math.max(rowStrength, columnStrength) * (0.35 + 0.65 * fade),
  );
  return mixColour(NEON_BACKGROUND, NEON_CYAN, lineStrength);
}

const AMBER = [244, 162, 48];
const ROSE = [226, 92, 130];
const DEEP_ROSE = [120, 40, 78];

function warmHaze({ x, y, width, height, phase }) {
  const horizontal = x / width;
  const vertical = y / height;
  const wave =
    Math.sin(
      vertical * TAU * 1.5 + phase * TAU + Math.sin(horizontal * TAU) * 0.9,
    ) *
      0.5 +
    0.5;
  const second =
    Math.sin(vertical * TAU * 2.5 - phase * TAU * 2 + horizontal * 3) * 0.5 +
    0.5;
  const base = mixColour(DEEP_ROSE, ROSE, wave);
  return mixColour(base, AMBER, second * 0.55 * smoothstep(0.1, 0.9, wave));
}

function discoDots({ x, y, width, height, phase }) {
  const spacing = 20;
  const columnIndex = Math.floor(x / spacing);
  const rowIndex = Math.floor(y / spacing);
  const centreX = columnIndex * spacing + spacing / 2;
  const centreY = rowIndex * spacing + spacing / 2;
  const distance = Math.hypot(x - centreX, y - centreY);
  const beat =
    Math.sin(phase * TAU * 2 + (columnIndex + rowIndex) * 0.55) * 0.5 + 0.5;
  const radius = 2.5 + beat * 6.5;
  const hue = fraction(
    phase + (columnIndex / (width / spacing)) * 0.5 + rowIndex * 0.03,
  );
  const dot = 1 - smoothstep(radius - 1, radius + 0.5, distance);
  const background = [14, 10, 26];
  return mixColour(background, hslToRgb(hue, 0.85, 0.58), dot);
}

function pinkTunnel({ x, y, width, height, phase }) {
  const distance = Math.hypot(x - width / 2, (y - height / 2) * 1.1);
  const ring = Math.abs(fraction(distance / 26 - phase) - 0.5) * 2;
  const brightness = Math.round(smoothstep(0.1, 0.95, ring) * 5) / 5;
  const depthShade = Math.round(smoothstep(0, 70, distance) * 3) / 3;
  const ringColour = mixColour([255, 70, 160], [255, 190, 224], brightness);
  const base = mixColour([34, 6, 40], ringColour, brightness * 0.9);
  return scaleColour(base, 0.35 + 0.65 * depthShade);
}

const BAR_COLOURS = [
  [255, 196, 64],
  [255, 150, 56],
  [250, 104, 74],
  [226, 72, 112],
  [170, 56, 140],
  [104, 48, 150],
];

function sunsetBars({ x, y, width, height, phase }) {
  const barHeight = 16;
  const barIndex = Math.floor(y / barHeight);
  const offset =
    Math.sin(phase * TAU + barIndex * 0.62) * width * 0.35 + phase * 0;
  const segment = fraction((x + offset) / 96);
  const isInsideBar = segment < 0.62 && y % barHeight < barHeight - 3;
  const colourIndex =
    clamp(barIndex / (height / barHeight), 0, 0.999) * (BAR_COLOURS.length - 1);
  const lower = BAR_COLOURS[Math.floor(colourIndex)];
  const upper = BAR_COLOURS[Math.ceil(colourIndex)];
  const barColour = mixColour(lower, upper, fraction(colourIndex));
  const colour = isInsideBar ? barColour : [30, 14, 44];
  return scaleColour(colour, y % 3 === 0 ? 0.78 : 1);
}

function pixelHeart({ x, y, width, height, phase }) {
  const pulse = 1 + 0.16 * Math.sin(phase * TAU);
  const scaledX = (x - width / 2 + 0.5) / (width * 0.27) / pulse;
  const scaledY = (height * 0.5 - y - 1.5) / (width * 0.27) / pulse;
  const heartValue =
    Math.pow(scaledX * scaledX + scaledY * scaledY - 1, 3) -
    scaledX * scaledX * Math.pow(scaledY, 3);
  const isHeart = heartValue <= 0;
  const checker = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0;
  if (!isHeart) {
    return checker ? [26, 14, 44] : [34, 20, 56];
  }
  const isHighlight =
    scaledX < -0.28 && scaledX > -0.62 && scaledY > 0.35 && scaledY < 0.8;
  return isHighlight
    ? [255, 188, 206]
    : mixColour([236, 40, 92], [172, 22, 74], clamp((-scaledY + 1) / 2));
}

function tallRibbon({ x, y, width, height, phase }) {
  const centreX =
    width / 2 + Math.sin((y / height) * TAU * 1.6 + phase * TAU) * width * 0.22;
  const twist = Math.cos((y / height) * TAU * 2.2 - phase * TAU);
  const halfWidth = 4 + Math.abs(twist) * width * 0.2;
  const distance = Math.abs(x - centreX);
  const background = mixColour([18, 12, 34], [30, 18, 56], y / height);
  if (distance > halfWidth) return background;
  const edge = 1 - smoothstep(halfWidth - 3, halfWidth, distance);
  const faceColour = twist >= 0 ? [255, 120, 176] : [120, 196, 255];
  const shade = 0.55 + 0.45 * Math.abs(twist);
  return mixColour(background, scaleColour(faceColour, shade), edge);
}

function staticBloomShape({ x, y, width, height, phase }) {
  const bloom = 0.5 - 0.5 * Math.cos(phase * TAU);
  const dx = x - width / 2;
  const dy = y - height / 2;
  const radius = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const petalReach =
    height *
    0.4 *
    (0.55 + 0.45 * Math.cos(angle * 6 + phase * TAU)) *
    smoothstep(0, 0.6, bloom);
  const petal = 1 - smoothstep(petalReach - 4, petalReach, radius);
  const core = 1 - smoothstep(height * 0.07, height * 0.09, radius);
  const flower = mixColour(
    mixColour([238, 96, 168], [255, 170, 120], radius / (height * 0.4)),
    [255, 226, 120],
    core,
  );
  return { flower, petal: petal * smoothstep(0.1, 0.5, bloom), bloom };
}

/* The static look fills its noise per 3x3 block, so it renders through its own
   loop and skips the per-pixel dispatcher. */
function renderStaticBloomFrame({ width, height, phase, random }) {
  const pixels = Buffer.alloc(width * height * 4);
  const blockSize = 3;
  const blocksAcross = Math.ceil(width / blockSize);
  const blocksDown = Math.ceil(height / blockSize);
  const levels = new Float32Array(blocksAcross * blocksDown);
  for (let blockIndex = 0; blockIndex < levels.length; blockIndex += 1) {
    levels[blockIndex] = Math.floor(random() * 5) / 4;
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const level =
        levels[
          Math.floor(y / blockSize) * blocksAcross + Math.floor(x / blockSize)
        ];
      const result = staticBloomShape({ x, y, width, height, phase });
      const staticColour = [
        50 + level * 160,
        50 + level * 160,
        60 + level * 160,
      ];
      const fadeStatic = 1 - smoothstep(0.15, 0.7, result.bloom) * 0.85;
      const base = mixColour([24, 14, 44], staticColour, fadeStatic);
      const colour = mixColour(base, result.flower, result.petal);
      const offset = (y * width + x) * 4;
      pixels[offset] = clamp(colour[0], 0, 255);
      pixels[offset + 1] = clamp(colour[1], 0, 255);
      pixels[offset + 2] = clamp(colour[2], 0, 255);
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}

/* ------------------------------------------------------------------ clips */

/* grain is the peak per-pixel brightness wobble (0..255 scale), applied with
   the slug's seeded generator so the film look is identical on every run. */
const CLIPS = [
  {
    slug: "neon-grid",
    title: "Neon grid",
    width: 320,
    height: 180,
    look: neonGrid,
    grain: 5,
  },
  {
    slug: "warm-haze",
    title: "Warm haze",
    width: 320,
    height: 180,
    look: warmHaze,
    grain: 7,
  },
  {
    slug: "disco-dots",
    title: "Disco dots",
    width: 320,
    height: 180,
    look: discoDots,
    grain: 3,
  },
  {
    slug: "pink-tunnel",
    title: "Pink tunnel",
    width: 320,
    height: 180,
    look: pinkTunnel,
    grain: 2,
  },
  {
    slug: "sunset-bars",
    title: "Sunset bars",
    width: 320,
    height: 180,
    look: sunsetBars,
    grain: 3,
  },
  {
    slug: "pixel-heart",
    title: "Pixel heart",
    width: 64,
    height: 48,
    look: pixelHeart,
    grain: 0,
  },
  {
    slug: "tall-ribbon",
    title: "Tall ribbon",
    width: 180,
    height: 320,
    look: tallRibbon,
    grain: 4,
  },
  {
    slug: "static-bloom",
    title: "Static bloom",
    width: 240,
    height: 180,
    renderFrame: renderStaticBloomFrame,
    grain: 0,
  },
];

function renderFrame(clip, phase, random) {
  if (clip.renderFrame) {
    return clip.renderFrame({
      width: clip.width,
      height: clip.height,
      phase,
      random,
    });
  }
  const pixels = Buffer.alloc(clip.width * clip.height * 4);
  const grainBlock = clip.grainBlock ?? DEFAULT_GRAIN_BLOCK;
  const grainBlocksAcross = Math.ceil(clip.width / grainBlock);
  const grainBlocksDown = Math.ceil(clip.height / grainBlock);
  const grainLevels = new Int8Array(grainBlocksAcross * grainBlocksDown);
  for (let blockIndex = 0; blockIndex < grainLevels.length; blockIndex += 1) {
    const draw = random();
    grainLevels[blockIndex] =
      draw < GRAIN_SHARE ? -1 : draw > 1 - GRAIN_SHARE ? 1 : 0;
  }
  for (let y = 0; y < clip.height; y += 1) {
    for (let x = 0; x < clip.width; x += 1) {
      const colour = clip.look({
        x,
        y,
        width: clip.width,
        height: clip.height,
        phase,
        random,
      });
      const grainLevel =
        grainLevels[
          Math.floor(y / grainBlock) * grainBlocksAcross +
            Math.floor(x / grainBlock)
        ];
      const wobble = grainLevel * clip.grain * 1;
      const offset = (y * clip.width + x) * 4;
      pixels[offset] = clamp(colour[0] + wobble, 0, 255);
      pixels[offset + 1] = clamp(colour[1] + wobble, 0, 255);
      pixels[offset + 2] = clamp(colour[2] + wobble, 0, 255);
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}

async function buildClip(clip) {
  const random = mulberry32(seedOf(clip.slug));
  const frames = [];
  for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
    frames.push(renderFrame(clip, frameIndex / FRAME_COUNT, random));
  }
  const gifBytes = await sharp(Buffer.concat(frames), {
    raw: {
      width: clip.width,
      height: clip.height * FRAME_COUNT,
      channels: 4,
      pageHeight: clip.height,
    },
  })
    .gif({
      loop: 0,
      delay: new Array(FRAME_COUNT).fill(FRAME_DELAY_MS),
      colours: GIF_COLOURS,
      dither: 0,
      effort: 10,
    })
    .toBuffer();

  const longEdge = Math.max(clip.width, clip.height);
  const scale = THUMBNAIL_LONG_EDGE / longEdge;
  const thumbnailBytes = await sharp(frames[0], {
    raw: { width: clip.width, height: clip.height, channels: 4 },
  })
    .resize({
      width: Math.round(clip.width * scale),
      height: Math.round(clip.height * scale),
      kernel: scale >= 2 ? "nearest" : "lanczos3",
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();

  if (gifBytes.length > MAX_GIF_BYTES) {
    throw new Error(
      `VJ demo GIF "${clip.slug}" is ${gifBytes.length} bytes, over the ${MAX_GIF_BYTES} byte cap. Lower its grain or detail.`,
    );
  }
  if (thumbnailBytes.length > MAX_THUMBNAIL_BYTES) {
    throw new Error(
      `VJ demo thumbnail "${clip.slug}" is ${thumbnailBytes.length} bytes, over the ${MAX_THUMBNAIL_BYTES} byte cap. Lower the WebP quality.`,
    );
  }
  return { clip, gifBytes, thumbnailBytes };
}

function dataFileSource(builtClips) {
  const entries = builtClips.map(({ clip, gifBytes }) => ({
    slug: clip.slug,
    title: clip.title,
    mediaPath: `${MEDIA_URL_PREFIX}${clip.slug}.gif`,
    thumbnailPath: `${MEDIA_URL_PREFIX}${clip.slug}.webp`,
    width: clip.width,
    height: clip.height,
    byteSize: gifBytes.length,
    frameCount: FRAME_COUNT,
    frameDelayMs: FRAME_DELAY_MS,
  }));
  return `/* Generated by scripts/generate-vj-demo-media.mjs, do not edit. */

export interface VjDemoMediaFile {
  slug: string;
  title: string;
  mediaPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  byteSize: number;
  frameCount: number;
  frameDelayMs: number;
}

export const VJ_DEMO_MEDIA: readonly VjDemoMediaFile[] = ${JSON.stringify(entries, null, 2)};
`;
}

async function main() {
  await mkdir(PUBLIC_DIRECTORY, { recursive: true });
  await mkdir(DATA_DIRECTORY, { recursive: true });
  const builtClips = [];
  for (const clip of CLIPS) {
    builtClips.push(await buildClip(clip));
  }
  const totalBytes = builtClips.reduce(
    (sum, built) => sum + built.gifBytes.length + built.thumbnailBytes.length,
    0,
  );
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error(
      `VJ demo media totals ${totalBytes} bytes, over the ${MAX_TOTAL_BYTES} byte cap. Lower the detail of the largest GIFs.`,
    );
  }
  for (const { clip, gifBytes, thumbnailBytes } of builtClips) {
    await writeFile(`${PUBLIC_DIRECTORY}${clip.slug}.gif`, gifBytes);
    await writeFile(`${PUBLIC_DIRECTORY}${clip.slug}.webp`, thumbnailBytes);
    console.log(
      `${clip.slug}: gif ${gifBytes.length} bytes, webp ${thumbnailBytes.length} bytes`,
    );
  }
  await writeFile(DATA_PATH, dataFileSource(builtClips));
  console.log(`total ${totalBytes} bytes`);
}

await main();
