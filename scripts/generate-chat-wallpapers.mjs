#!/usr/bin/env node
/**
 * Chat wallpaper tiles: the six seamless pattern masks behind the message log.
 *
 * OUTPUT is src/features/messages/chat-wallpaper.css, which is generated in
 * full and never hand-edited. Re-run with
 * `node scripts/generate-chat-wallpapers.mjs` from the repo root after touching
 * anything here. Like scripts/generate-icons.mjs, the result is committed
 * rather than built on demand: the art changes roughly never, and a build-time
 * dependency for six static tiles would be a poor trade.
 *
 * WHY A GENERATOR AND NOT SIX HAND-WRITTEN DATA URIS. A tile is ~50 SVG paths,
 * two thirds of which are wrap copies of the other third (see the torus note
 * below). Keeping that by hand is how a seam ends up shipping. Here a pattern
 * is DATA: `{ name, seed, tile, layout, groups, alpha? }`. Adding a seventh
 * pattern means adding one entry to PATTERNS plus its mark shapes, then adding
 * the name to WALLPAPER_PATTERNS in src/features/messages/wallpaper.ts and the
 * two copy keys in the messages catalogs.
 *
 * WHY THE TILE IS A MASK AND NOT A BACKGROUND IMAGE. A data-URI SVG cannot
 * read CSS custom properties, so a baked-in stroke colour would need a second
 * copy of the whole tile for dark mode. Masking one white-on-transparent tile
 * and painting it with `rgba(var(--line-rgb), …)` gets plum ink on cream and
 * cream ink on near-black from a single asset, because --line-rgb is one of the
 * tokens that flips. That is also why every mark is a drawn path rather than a
 * glyph: `local/no-emoji` bans the emoji range, the icons-not-glyphs convention
 * holds for decorative art too, and a font would not mask the same way twice.
 *
 * WHY THE TILE IS A TORUS. The mask repeats, so a mark that runs off the right
 * edge has to continue at the left or the repeat shows a grid of gaps. Every
 * placement within MARK_BOUND of an edge is therefore emitted again shifted by
 * ±tile on that axis (and twice more in a corner), so the four tile borders
 * carry matching ink. The rhythmic pattern (waves) closes its own horizontal
 * seam instead: each row is sampled on a cyclic ring of points, so its end
 * point at x=tile matches its start at x=0 in both height and slope.
 *
 * DETERMINISM. Every random choice comes from mulberry32 seeded per pattern, so
 * two runs produce identical bytes and a diff after a re-run is a real change.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const OUTPUT_PATH = fileURLToPath(
  new URL("../src/features/messages/chat-wallpaper.css", import.meta.url),
);

/* Half-width of a mark's local drawing box, before its scale is applied. The
   doodle marks reach about ±10.4, so 26 leaves room for the corners a rotation
   swings out and decides when a placement needs its wrap copies. */
const MARK_BOUND = 26;

/* Ink opacity, low on purpose: the log's bubbles carry text at documented
   contrast ratios and no pattern may eat into them. */
const BASE_ALPHA = { light: 0.055, dark: 0.075 };

/* ------------------------------------------------------------------ random */

/* mulberry32: 32 bits of state, one multiply-xorshift round. Not a good PRNG
   for anything that matters, an excellent one for scattering leaves. */
function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createRandom(seed) {
  const next = mulberry32(seed);
  const between = (low, high) => low + next() * (high - low);
  return {
    next,
    between,
    /* Even pixels only: the doodle tile places every mark on a 2px grid, and
       matching it keeps the six tiles reading as one set under a scaled-down
       swatch miniature. */
    evenBetween: (low, high) => Math.round(between(low, high) / 2) * 2,
    intBetween: (low, high) => Math.round(between(low, high)),
    /* Rotation never sits at zero and never passes a quarter turn: enough tilt
       to read as hand-placed, not enough to read as fallen over. */
    tilt: (low = 6, high = 24) =>
      Math.round(between(low, high)) * (next() < 0.5 ? -1 : 1),
    pick: (items) => items[Math.floor(next() * items.length)],
    pickWeighted: (items) => {
      const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
      let target = next() * total;
      for (const item of items) {
        target -= item.weight ?? 1;
        if (target <= 0) return item;
      }
      return items[items.length - 1];
    },
  };
}

/* ------------------------------------------------------------ path writing */

/* Path data is the bulk of the shipped bytes, so numbers are rounded to three
   decimals (invisible at 400px, and it drops the 2.6100000000000003 that
   floating point hands back) and printed without a leading or trailing zero. */
function formatNumber(value, decimals = 3) {
  const rounded = Number(value.toFixed(decimals));
  if (Object.is(rounded, -0)) return "0";
  const text = String(rounded);
  return text.startsWith("0.")
    ? text.slice(1)
    : text.startsWith("-0.")
      ? `-${text.slice(2)}`
      : text;
}

const PATH_TOKEN = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+))/g;

/**
 * Re-emit path data with every separator the SVG grammar does not need.
 *
 * Two joins are safe and worth roughly a fifth of the file: a command letter
 * never needs a space after it, and a minus sign is its own separator. A dot
 * only separates when the number before it ALREADY carries one, because "3"
 * followed by ".8" would otherwise read back as the single number 3.8.
 */
function compactPath(pathData) {
  const parts = [];
  let previous = "";
  for (const [, command, number] of pathData.matchAll(PATH_TOKEN)) {
    if (command !== undefined) {
      parts.push(command);
      previous = command;
      continue;
    }
    const text = formatNumber(Number.parseFloat(number));
    const needsSeparator =
      previous !== "" &&
      !/[A-Za-z]$/.test(previous) &&
      !text.startsWith("-") &&
      !(text.startsWith(".") && previous.includes("."));
    parts.push(needsSeparator ? ` ${text}` : text);
    previous = text;
  }
  return parts.join("");
}

/* A circle as path data, because the emitter speaks one shape language. Two
   half-turn arcs: the form the doodle tile's blossom and note already use. */
function circlePath(centreX, centreY, radius) {
  const left = formatNumber(centreX - radius);
  const top = formatNumber(centreY);
  const diameter = formatNumber(radius * 2);
  const size = formatNumber(radius);
  return `M${left} ${top}a${size} ${size} 0 1 0 ${diameter} 0a${size} ${size} 0 1 0 -${diameter} 0`;
}

/**
 * A closed blob through `points`, smoothed with quadratic curves.
 *
 * The on-curve points are the edge midpoints and each original vertex becomes
 * the control point of the curve that rounds it, which turns a jagged polygon
 * into a pebble without any tangent bookkeeping.
 */
function smoothPolygonPath(points, decimals = 1) {
  const midpoint = (index) => {
    const current = points[index];
    const nextPoint = points[(index + 1) % points.length];
    return [(current[0] + nextPoint[0]) / 2, (current[1] + nextPoint[1]) / 2];
  };
  const [startX, startY] = midpoint(points.length - 1);
  const segments = points.map((vertex, index) => {
    const [endX, endY] = midpoint(index);
    return `Q${formatNumber(vertex[0], decimals)} ${formatNumber(vertex[1], decimals)} ${formatNumber(endX, decimals)} ${formatNumber(endY, decimals)}`;
  });
  return `M${formatNumber(startX, decimals)} ${formatNumber(startY, decimals)}${segments.join("")}Z`;
}

/* --------------------------------------------------------------- the marks */

/* Every mark is drawn in its own local box around the origin, roughly 20px
   across, and placed by the layout with translate/rotate/scale. Keeping the
   marks origin-centred is what lets one shape appear at five sizes and angles
   without a second copy of its geometry. Line weight and box size are shared
   across all six patterns on purpose: switching pattern must not change how
   heavy the page feels. */

/* The doodle marks, decoded from the tile this file replaced. They are the
   reference voice for the other five sets: one continuous stroke, an open
   rather than a solid shape, no shape smaller than about 12px across. */
const DOODLE_SHAPES = {
  heart:
    "M0 8C-9 1.5-9-5.5-4-7.6-1.4-8.7 0-6.8 0-5 0-6.8 1.4-8.7 4-7.6 9-5.5 9 1.5 0 8Z",
  sparkle:
    "M0-9C.8-3.2 3.2-.8 9 0 3.2.8.8 3.2 0 9-.8 3.2-3.2.8-9 0-3.2-.8-.8-3.2 0-9Z",
  sprig:
    "M0-7.4V6.2M0-4.2C-3.4-9.8-10-9.4-10.4-4.4-10.8.4-5 1.8-.4-1.2M0-4.2C3.4-9.8 10-9.4 10.4-4.4 10.8.4 5 1.8.4-1.2M0 .6C-2.8-2.2-8.2-1.4-8.2 2.8-8.2 6.6-3.4 8 0 4.4M0 .6C2.8-2.2 8.2-1.4 8.2 2.8 8.2 6.6 3.4 8 0 4.4",
  star: "M0-9 2.6-3.1 9-2.4 4.2 1.9 5.6 8.2 0 5 -5.6 8.2-4.2 1.9-9-2.4-2.6-3.1Z",
  cross: "M0-8V8M-8 0H8",
  blossom:
    "M-3 -5.9a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M2.61 -1.82a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M0.47 4.77a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M-6.47 4.77a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M-8.61 -1.82a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0",
  speechBubble:
    "M-8-7.2h16a2.4 2.4 0 0 1 2.4 2.4v7.6a2.4 2.4 0 0 1-2.4 2.4H-1.6L-6 8.4V5.2h-2a2.4 2.4 0 0 1-2.4-2.4v-7.6A2.4 2.4 0 0 1-8-7.2Z",
  moon: "M3.4-7.8A8 8 0 1 0 3.4 7.8 6.6 6.6 0 1 1 3.4-7.8Z",
  leaf: "M-6.6 6.6C-9-1 -3.6-8.6 6.6-9 7-1 -.4 5.6-6.6 6.6ZM-2.6 2.6 6.6-9",
  note: "M0.6 5.6V-8.6C4.4-7.7 7.6-5.4 7.6-1.4M-5.8 5.6a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0",
  ring: "M0-9A9 9 0 1 1 0 9 9 9 0 1 1 0-9ZM0-2.4A2.4 2.4 0 1 1 0 2.4 2.4 2.4 0 1 1 0-2.4Z",
  ripple:
    "M-9 6A9 9 0 0 1 9 6M-5.4 6A5.4 5.4 0 0 1 5.4 6M-1.8 6A1.8 1.8 0 0 1 1.8 6",
  cup: "M-6.4-4.4h11v8a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4ZM4.6-2.4h2.6a2.6 2.6 0 0 1 0 5.2H4.6M-3-7.4c0-1.6 1.6-1.6 1.6-3.2M1-7.4c0-1.6 1.6-1.6 1.6-3.2",
  triangle: "M0-8 8.4 7H-8.4Z",
  pennant: "M-4.6 9V-8.6M-4.6-8C-1-10.4 2.6-5.6 6.2-8v8.6C2.6 2 -1-2.8-4.6-.4",
  book: "M0-6.4C-2.4-8.6-6-8.6-8.4-7.6V6C-6 5 -2.4 5 0 7.2 2.4 5 6 5 8.4 6V-7.6C6-8.6 2.4-8.6 0-6.4ZM0-6.4V7.2",
  squiggle: "M-9-1.6C-6-6-3 2.6 0-1.6 3-6 6 2.6 9-1.6",
  circle: "M0-6.4A6.4 6.4 0 1 1 0 6.4 6.4 6.4 0 1 1 0-6.4Z",
};

/* The doodle tile's own placements, decoded rather than re-scattered: this
   pattern is the one users already have on their chats, so it has to come back
   out of the generator looking exactly as it went in. A jittered 5x5 grid of 24
   marks with 6 smaller ones dropped into the gaps, which is the rhythm the
   other scattered patterns reproduce from parameters. */
const DOODLE_PLACEMENTS = [
  ["heart", 34, 30, -12, 1.47],
  ["sparkle", 122, 58, 14, 1.26],
  ["sprig", 206, 26, -6, 1.4],
  ["star", 300, 52, 18, 1.33],
  ["cross", 374, 22, -20, 1.19],
  ["blossom", 70, 118, 8, 1.4],
  ["speechBubble", 158, 140, -16, 1.33],
  ["moon", 250, 112, 10, 1.26],
  ["leaf", 340, 138, -8, 1.4],
  ["note", 24, 200, 16, 1.26],
  ["ring", 112, 226, -10, 1.4],
  ["ripple", 196, 200, 6, 1.33],
  ["cup", 286, 232, -14, 1.26],
  ["heart", 368, 206, 12, 1.4],
  ["triangle", 58, 300, -18, 1.33],
  ["sparkle", 146, 322, 10, 1.26],
  ["pennant", 232, 296, -6, 1.4],
  ["book", 318, 330, 16, 1.33],
  ["blossom", 396, 300, -12, 1.26],
  ["squiggle", 8, 372, 12, 1.33],
  ["star", 96, 388, -8, 1.26],
  ["circle", 182, 366, 14, 1.4],
  ["sprig", 270, 392, -16, 1.26],
  ["moon", 356, 372, 8, 1.33],
  ["cross", 178, 74, 22, 0.98],
  ["circle", 42, 160, -24, 0.98],
  ["sparkle", 312, 176, 20, 0.98],
  ["cross", 130, 262, -22, 0.98],
  ["circle", 222, 352, 24, 0.98],
  ["sparkle", 388, 258, -20, 0.98],
];

/* A stem topped by a fan of seeds, spokes and all. Written as geometry rather
   than as a literal so the seed count is one number to change. */
function seedHeadPath() {
  const crown = [0, -4.4];
  const spokeLength = 5.2;
  const parts = ["M0 9C-.8 4-.6-1 0-4.4"];
  for (const degrees of [-72, -44, -15, 15, 44, 72]) {
    const radians = (degrees * Math.PI) / 180;
    const tipX = crown[0] + Math.sin(radians) * spokeLength;
    const tipY = crown[1] - Math.cos(radians) * spokeLength;
    parts.push(
      `M${formatNumber(crown[0])} ${formatNumber(crown[1])}L${formatNumber(tipX)} ${formatNumber(tipY)}`,
      circlePath(
        crown[0] + Math.sin(radians) * (spokeLength + 1.3),
        crown[1] - Math.cos(radians) * (spokeLength + 1.3),
        1.25,
      ),
    );
  }
  return parts.join("");
}

/* Dots joined by lines that stop short of them, so the join reads as a
   sightline between stars rather than as a skewer through them. */
function constellationPath(stars) {
  const parts = stars.map(([x, y]) => circlePath(x, y, 1.3));
  for (let index = 0; index < stars.length - 1; index += 1) {
    const [fromX, fromY] = stars[index];
    const [toX, toY] = stars[index + 1];
    const length = Math.hypot(toX - fromX, toY - fromY);
    const gap = 2.6 / length;
    parts.push(
      `M${formatNumber(fromX + (toX - fromX) * gap)} ${formatNumber(fromY + (toY - fromY) * gap)}L${formatNumber(toX - (toX - fromX) * gap)} ${formatNumber(toY - (toY - fromY) * gap)}`,
    );
  }
  return parts.join("");
}

/* A twig with three berries. Botanical's other marks are all pointed or
   elongated, and without one round mark the tile reads as spikes rather than
   as a garden. */
function berryTwigPath() {
  const berries = [
    [-4, -3.4],
    [1.4, -8],
    [4.4, -3],
  ];
  return [
    "M-5 9C-3.6 3.6-2.2-.4.4-4.2",
    "M-1.2-1.6L-2.6-2.6",
    "M.4-4.2L1-6.2",
    "M-.2-2.6L2.6-2.8",
    ...berries.map(([x, y]) => circlePath(x, y, 2.2)),
  ].join("");
}

const BOTANICAL_SHAPES = {
  leaf: "M 0 -9 C 5.2 -4.4 5.2 4.4 0 9 C -5.2 4.4 -5.2 -4.4 0 -9 Z M 0 -8 C 1.2 -3.6 1 2 0 7.6",
  smallLeaf:
    "M -0.8 9 C -1.8 5.4 -1.2 2.6 0.4 0.6 M 0.4 0.6 C -3.4 -1.8 -4.4 -7 -1 -9.8 C 3.4 -7.8 4.4 -2.4 0.4 0.6 Z",
  sprigOfLeaflets:
    "M -0.6 9 C -1.2 3.4 -0.8 -3 0.6 -8.8 M -1 6.4 C -3.2 5.6 -4.6 3.6 -5 1 M -0.9 5 C 1.6 4.2 3.6 2.2 4.2 -0.6 M -0.6 1.4 C -3 0.8 -4.6 -1.4 -4.8 -4 M -0.2 -0.6 C 2.2 -1.6 3.6 -3.8 3.6 -6.2 M 0.2 -3.6 C -1.8 -4.8 -2.8 -6.8 -2.8 -8.8",
  seedHead: seedHeadPath(),
  fernTip:
    "M -6.6 9 C -6.8 2.6 -4.6 -3.6 0 -6.8 C 4 -9.6 8.2 -7.4 7.8 -3.6 C 7.5 -0.6 4 0.6 2.4 -1.4 C 1.4 -2.6 2 -4.4 3.4 -4.4",
  bud: "M 0 0 C -3.6 -1.8 -4.6 -5.2 -3 -8 C -0.8 -6.2 -0.2 -3 0 0 Z M 0 0 C 3.6 -1.8 4.6 -5.2 3 -8 C 0.8 -6.2 0.2 -3 0 0 Z M 0 0 C -1.8 -3 -1.8 -6.4 0 -8.6 C 1.8 -6.4 1.8 -3 0 0 Z M 0 0 C 0.6 3.2 0.4 6 0 8.6",
  berryTwig: berryTwigPath(),
};

const SKY_SHAPES = {
  crescent: "M 3 -8.2 A 8.4 8.4 0 1 0 3 8.2 A 6.8 6.8 0 1 1 3 -8.2 Z",
  sparkle: DOODLE_SHAPES.sparkle,
  star: DOODLE_SHAPES.star,
  constellationPlough: constellationPath([
    [-7.4, 3.6],
    [-1.6, -1.4],
    [3.4, -6.6],
    [6.8, 1.2],
  ]),
  constellationTriangle: constellationPath([
    [-6.6, -4],
    [0.4, -6.4],
    [2.6, 0.6],
    [-3.4, 5.6],
  ]),
  cloud:
    "M -8.8 3.8 C -11.6 1.4 -10 -2.8 -6 -2.6 C -6.2 -7 -0.6 -9.2 2 -5.4 C 4.4 -8 9.2 -6 9.4 -2 C 11.6 -1 11 3 8 3.8 Z",
  shootingStar:
    "M 3 -8.4 C 3.5 -4.8 4.6 -3.9 8 -3.4 C 4.6 -2.9 3.5 -2 3 1.6 C 2.5 -2 1.4 -2.9 -2 -3.4 C 1.4 -3.9 2.5 -4.8 3 -8.4 Z M -1.6 0.4 C -3.6 2.2 -5.4 4 -7.2 6.2 M 1.8 2.6 C 0.4 4.2 -0.8 5.6 -2 7.4",
};

const CONFETTI_SHAPES = {
  openCircle: "M 0 -5.6 A 5.6 5.6 0 1 1 0 5.6 A 5.6 5.6 0 1 1 0 -5.6 Z",
  triangle: "M 0 -6 L 5.6 4.6 L -5.6 4.6 Z",
  dash: "M -5.6 1 C -2 -0.6 2 -0.6 5.6 1",
  squiggle: DOODLE_SHAPES.squiggle,
  chevron: "M -5 2.8 L 0 -3 L 5 2.8",
  cross: DOODLE_SHAPES.cross,
  arc: "M -6 2.6 A 7 7 0 0 1 6 2.6",
};

const WAVE_SHAPES = {
  ripple: DOODLE_SHAPES.ripple,
  arc: "M -7.4 2.4 A 8 8 0 0 1 7.4 2.4",
};

/* ------------------------------------------------------------- the layouts */

/* Mark sizes come off one ladder, 0.7 to 1.47 in steps of 0.07, shared by all
   six patterns. Quantising instead of taking the raw float is what stops a
   tile looking like a slider was dragged: sizes recur, so the eye reads a set. */
const SCALE_FLOOR = 0.7;
const SCALE_STEP = 0.07;

function quantiseScale(value) {
  const steps = Math.round((value - SCALE_FLOOR) / SCALE_STEP);
  return (SCALE_FLOOR + steps * SCALE_STEP).toFixed(2);
}

/* Distance on a torus: the shortest way round, not the way across. Placement
   checks have to use it or marks pile up along the tile's own edges. */
function torusDistance(ax, ay, bx, by, tile) {
  const wrap = (delta) => Math.min(Math.abs(delta), tile - Math.abs(delta));
  return Math.hypot(wrap(ax - bx), wrap(ay - by));
}

function shuffle(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random.next() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

/* The quota is a bag of shape names, one entry per mark, shuffled. Exact counts
   rather than weights because "one or two clouds" has to MEAN one or two: a
   weighted draw over 25 marks can hand back zero or five. */
function quotaBag(quota, random) {
  const bag = [];
  for (const [shapeName, count] of Object.entries(quota)) {
    for (let index = 0; index < count; index += 1) bag.push(shapeName);
  }
  return shuffle(bag, random);
}

/**
 * Jittered grid plus infill: the doodle tile's rhythm, expressed as numbers.
 *
 * A grid guarantees even coverage, the jitter takes the grid back out of it,
 * and the smaller infill marks fill the holes the jitter opens. Each infill
 * candidate is dart-thrown and rejected until it clears `minDistance` from
 * every mark already down, which is the Poisson part: no clumps, no overlaps.
 */
function scatterLayout(pattern, random) {
  const { name, tile, shapes, grid, quota, infill } = pattern;
  const bag = quotaBag(quota, random);
  const gridCount = grid.rows * grid.columns;
  const infillCount = infill?.count ?? 0;
  const expectedCount = gridCount + infillCount;
  if (bag.length !== expectedCount) {
    throw new Error(
      `scatterLayout: pattern "${name}" has a quota totalling ${bag.length} ` +
        `marks, but the grid needs ${gridCount} (${grid.rows} rows by ` +
        `${grid.columns} columns) plus ${infillCount} infill, ${expectedCount} ` +
        "total. Adjust the quota counts so they sum to the grid plus infill, " +
        "or a future placement reads past the bag as undefined and crashes " +
        "later in compactPath.",
    );
  }
  const cellWidth = tile / grid.columns;
  const cellHeight = tile / grid.rows;
  const placements = [];

  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const centreX = cellWidth * (column + 0.5);
      const centreY = cellHeight * (row + 0.5);
      placements.push({
        d: shapes[bag[placements.length]],
        x: random.evenBetween(centreX - grid.jitter, centreX + grid.jitter),
        y: random.evenBetween(centreY - grid.jitter, centreY + grid.jitter),
        rotate: random.tilt(...grid.tilt),
        scale: grid.scaleChoices
          ? random.pick(grid.scaleChoices).toFixed(2)
          : quantiseScale(random.between(...grid.scale)),
      });
    }
  }

  for (let placed = 0; placed < (infill?.count ?? 0); placed += 1) {
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const x = random.evenBetween(0, tile);
      const y = random.evenBetween(0, tile);
      const isClear = placements.every(
        (mark) =>
          torusDistance(x, y, mark.x, mark.y, tile) >= infill.minDistance,
      );
      if (!isClear && attempt < 399) continue;
      placements.push({
        d: shapes[bag[placements.length]],
        x,
        y,
        rotate: random.tilt(...infill.tilt),
        scale: quantiseScale(random.between(...infill.scale)),
      });
      break;
    }
  }

  return [{ style: "stroke", placements }];
}

/* Filled specks: the one place a pattern paints solid rather than drawing. Kept
   to 1 to 2.5px so they read as grain between the marks, never as a mark. */
function speckGroup(tile, speck, existing, random) {
  const placements = [];
  const centres = existing.map((mark) => [mark.x, mark.y]);
  for (let placed = 0; placed < speck.count; placed += 1) {
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const x = random.evenBetween(0, tile);
      const y = random.evenBetween(0, tile);
      const isClear = centres.every(
        ([otherX, otherY]) =>
          torusDistance(x, y, otherX, otherY, tile) >= speck.minDistance,
      );
      if (!isClear && attempt < 399) continue;
      const radius = random.between(...speck.radius);
      centres.push([x, y]);
      /* No rotate and no scale: a dot has neither, and leaving them off the
         transform is ~20 bytes a speck across four wrap copies. */
      placements.push({
        d: circlePath(0, 0, radius),
        x,
        y,
        rotate: null,
        scale: null,
        bound: radius + 2,
      });
      break;
    }
  }
  return { style: "fill", placements };
}

/* Irregular chips, drawn once into a small library and then reused at three
   sizes. Six outlines is enough that the tile never shows the same pebble
   twice side by side, and far fewer bytes than a unique outline per mark. */
function buildPebbleShapes(random) {
  const shapes = {};
  for (let index = 0; index < 6; index += 1) {
    const vertexCount = 5 + Math.floor(random.next() * 3);
    const vertices = [];
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const angle =
        (vertex / vertexCount) * Math.PI * 2 +
        random.between(-0.34, 0.34) -
        Math.PI / 2;
      const radius = 7.4 * random.between(0.6, 1.32);
      vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    shapes[`pebble${index}`] = smoothPolygonPath(vertices);
  }
  return shapes;
}

/**
 * Wavy rows, the one pattern that is not scattered.
 *
 * Each row is a ring of sample points whose heights come from a sine plus a
 * little jitter. Reading the ring cyclically is what closes the horizontal
 * seam for free: the point at x=tile IS the point at x=0, and the Catmull-Rom
 * tangent there is built from the same two neighbours, so height AND slope
 * match across the repeat. Rows sit at cell centres rather than on the grid
 * lines, so the vertical seam falls in a gap and no row needs a wrap copy.
 */
function waveLayout(pattern, random) {
  const { tile, rows, samples, shapes, extras } = pattern;
  const step = tile / samples;
  const placements = [];
  const rowHeights = [];

  for (let row = 0; row < rows; row += 1) {
    const baseline = Math.round((tile / rows) * (row + 0.5) * 0.5) * 2;
    rowHeights.push(baseline);
    const amplitude = random.between(3.4, 7.2);
    const cycles = random.next() < 0.5 ? 3 : 4;
    const phase = random.between(0, Math.PI * 2);
    const heights = [];
    for (let sample = 0; sample < samples; sample += 1) {
      heights.push(
        baseline +
          amplitude *
            Math.sin((sample / samples) * cycles * Math.PI * 2 + phase) +
          random.between(-1.3, 1.3),
      );
    }
    const at = (index) => heights[((index % samples) + samples) % samples];
    const segments = [`M0 ${formatNumber(at(0), 1)}`];
    for (let sample = 0; sample < samples; sample += 1) {
      const startX = sample * step;
      const firstX = startX + step / 3;
      const secondX = startX + (step * 2) / 3;
      const endX = startX + step;
      const firstY = at(sample) + (at(sample + 1) - at(sample - 1)) / 6;
      const secondY = at(sample + 1) - (at(sample + 2) - at(sample)) / 6;
      segments.push(
        `C${formatNumber(firstX, 1)} ${formatNumber(firstY, 1)} ${formatNumber(secondX, 1)} ${formatNumber(secondY, 1)} ${formatNumber(endX, 1)} ${formatNumber(at(sample + 1), 1)}`,
      );
    }
    placements.push({ d: segments.join(""), x: null, y: null });
  }

  /* A handful of ripples and arcs dropped into the troughs between rows, so
     the eye has something to land on other than the rhythm itself. */
  const gaps = shuffle(
    rowHeights
      .slice(0, -1)
      .map((height, index) => (height + rowHeights[index + 1]) / 2),
    random,
  ).slice(0, extras.count);
  const extraNames = Object.keys(shapes);
  for (const gapCentre of gaps) {
    placements.push({
      d: shapes[random.pick(extraNames)],
      x: random.evenBetween(20, tile - 20),
      y: Math.round(gapCentre / 2) * 2,
      rotate: random.tilt(4, 12),
      scale: quantiseScale(random.between(0.77, 1.05)),
      bound: 20,
    });
  }

  return [{ style: "stroke", placements }];
}

/* The doodle tile, replayed from its decoded placements rather than scattered
   again: it is the pattern people already have on their chats. */
function fixedLayout(pattern) {
  const placements = pattern.placements.map(
    ([shapeName, x, y, rotate, scale]) => ({
      d: pattern.shapes[shapeName],
      x,
      y,
      rotate,
      scale: scale.toFixed(2),
    }),
  );
  return [{ style: "stroke", placements }];
}

/* ------------------------------------------------------------ the emitting */

const GROUP_ATTRIBUTES = {
  stroke:
    "fill='none' stroke='#fff' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'",
  fill: "fill='#fff' stroke='none'",
};

/* One axis of the torus: a mark close to an edge is redrawn a tile away on the
   other side. Both axes at once in a corner, which is why a corner mark shows
   up four times. */
function wrapOffsets(value, tile, bound) {
  if (value < bound) return [0, tile];
  if (value > tile - bound) return [0, -tile];
  return [0];
}

function renderPlacement(placement, tile) {
  const pathData = compactPath(placement.d);
  if (placement.x === null) return [`<path d='${pathData}'/>`];
  const bound = placement.bound ?? MARK_BOUND * Number(placement.scale ?? 1);
  const transformTail =
    placement.rotate === null || placement.rotate === undefined
      ? ""
      : ` rotate(${placement.rotate}) scale(${placement.scale})`;
  const paths = [];
  for (const offsetX of wrapOffsets(placement.x, tile, bound)) {
    for (const offsetY of wrapOffsets(placement.y, tile, bound)) {
      paths.push(
        `<path d='${pathData}' transform='translate(${placement.x + offsetX} ${placement.y + offsetY})${transformTail}'/>`,
      );
    }
  }
  return paths;
}

function renderTile(pattern) {
  const random = createRandom(pattern.seed);
  const shapes = pattern.buildShapes
    ? pattern.buildShapes(random)
    : pattern.shapes;
  const groups = pattern.layout({ ...pattern, shapes }, random);
  if (pattern.speck) {
    groups.push(
      speckGroup(pattern.tile, pattern.speck, groups[0].placements, random),
    );
  }
  const { tile } = pattern;
  const body = groups
    .map(
      (group) =>
        `<g ${GROUP_ATTRIBUTES[group.style]}>${group.placements
          .flatMap((placement) => renderPlacement(placement, tile))
          .join("")}</g>`,
    )
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}' viewBox='0 0 ${tile} ${tile}'>${body}</svg>`;
  /* Only the three characters a CSS url() cannot take raw. Single quotes inside
     the SVG and the double quotes around the url() then never collide, which is
     why the markup above is written with single quotes throughout. */
  return svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23");
}

/* ---------------------------------------------------------- the six tiles */

/* Seeds are arbitrary and fixed. Changing one reshuffles that tile and nothing
   else, which is the point: a pattern can be re-rolled until it looks right
   without disturbing the other five. */
const PATTERNS = [
  {
    name: "doodles",
    note: "Hearts, stars, cups and speech bubbles: the tile every existing chat already wears.",
    seed: 1,
    tile: 400,
    layout: fixedLayout,
    shapes: DOODLE_SHAPES,
    placements: DOODLE_PLACEMENTS,
  },
  {
    name: "botanical",
    note: "Leaves, sprigs, seed heads and a fern tip, at the doodle tile's density.",
    seed: 20260915,
    tile: 400,
    layout: scatterLayout,
    shapes: BOTANICAL_SHAPES,
    grid: {
      columns: 5,
      rows: 5,
      jitter: 26,
      scale: [1.12, 1.47],
      tilt: [6, 24],
    },
    quota: {
      leaf: 6,
      smallLeaf: 5,
      sprigOfLeaflets: 4,
      berryTwig: 4,
      bud: 4,
      seedHead: 4,
      fernTip: 3,
    },
    infill: { count: 5, minDistance: 46, scale: [0.84, 0.98], tilt: [14, 26] },
  },
  {
    name: "sky",
    note: "Moons, sparkles and small constellations, a touch sparser so the gaps read as night.",
    seed: 815207,
    tile: 400,
    layout: scatterLayout,
    shapes: SKY_SHAPES,
    grid: {
      columns: 5,
      rows: 5,
      jitter: 24,
      scale: [1.12, 1.47],
      tilt: [6, 22],
    },
    quota: {
      sparkle: 8,
      star: 6,
      crescent: 3,
      constellationPlough: 2,
      constellationTriangle: 2,
      cloud: 2,
      shootingStar: 2,
    },
  },
  {
    name: "confetti",
    note: "Smaller marks, tighter grid and a scatter of specks: the only busy tile of the six.",
    seed: 44119,
    tile: 400,
    layout: scatterLayout,
    shapes: CONFETTI_SHAPES,
    grid: {
      columns: 7,
      rows: 6,
      jitter: 16,
      scale: [0.91, 1.26],
      tilt: [8, 52],
    },
    quota: {
      openCircle: 11,
      dash: 10,
      triangle: 10,
      squiggle: 9,
      chevron: 7,
      cross: 7,
      arc: 6,
    },
    infill: { count: 18, minDistance: 26, scale: [0.77, 1.05], tilt: [8, 52] },
    speck: { count: 24, minDistance: 20, radius: [0.9, 1.3] },
    /* Measured ink coverage is a third of the doodle tile's even at this count:
       the marks are deliberately small, and small marks at a fixed 1.7px stroke
       simply cover less. The alpha carries the difference. */
    alpha: { light: 0.07, dark: 0.095 },
  },
  {
    name: "waves",
    note: "Fourteen hand-drawn rows about 34px apart, each closing its own horizontal seam.",
    seed: 730044,
    tile: 480,
    rows: 14,
    samples: 16,
    layout: waveLayout,
    shapes: WAVE_SHAPES,
    extras: { count: 6 },
    /* 14 unbroken rows measure 1.8x the doodle tile's ink coverage. Left at the
       base alpha this tile shouts; scaled down it sits with the other five. */
    alpha: { light: 0.036, dark: 0.05 },
  },
  {
    name: "terrazzo",
    note: "Outlined chips at three sizes with grain between them. Same weight as the doodles, none of the motifs.",
    seed: 90211,
    tile: 400,
    layout: scatterLayout,
    buildShapes: buildPebbleShapes,
    grid: {
      columns: 6,
      rows: 6,
      jitter: 20,
      scaleChoices: [0.98, 0.98, 1.33, 1.33, 1.33, 1.68],
      tilt: [6, 30],
    },
    quota: {
      pebble0: 6,
      pebble1: 6,
      pebble2: 6,
      pebble3: 6,
      pebble4: 6,
      pebble5: 6,
    },
    /* The grain was measured, not guessed: 26 dots under 2.5px add well under a
       tenth of this tile's ink, so it keeps the base alpha. */
    speck: { count: 26, minDistance: 18, radius: [0.75, 1.25] },
  },
];

/* ------------------------------------------------------------------- write */

const FILE_HEADER = `/* Chat wallpaper tokens: the six seamless pattern tiles behind the message
   log. Consumed by the pattern layer on \`.convoPanel::after\` in
   MessagesPage.module.css, the modal preview and the picker swatches; the pick
   itself lives in \`wallpaper.ts\`.

   GENERATED FILE. Do not hand-edit it: run \`node scripts/generate-chat-wallpapers.mjs\`
   from the repo root, which rewrites it whole. To add a seventh pattern, add an
   entry to PATTERNS in that script (a name, a seed, a tile size, a layout and
   its mark shapes), re-run it, then add the name to WALLPAPER_PATTERNS in
   \`wallpaper.ts\` and the two copy keys to the messages catalogs.

   NOT imported from styles/index.css. Like persona-skins.css, this is a
   route-local sheet imported from its lazy consumer (MessagesPage) so Vite
   folds the tiles into the Messages chunk instead of shipping them on every
   one of the app's other routes.

   Why each tile is a MASK and not a background-image: a data-URI SVG cannot
   read CSS custom properties, so a baked-in stroke colour would need a second
   copy of every tile for dark mode. Masking one tile and painting it with
   \`rgba(var(--line-rgb), …)\` gets plum ink on cream and cream ink on
   near-black from a single asset, because --line-rgb is one of the tokens that
   flips.

   Each tile is a square torus: every mark that crosses an edge is drawn again
   on the opposite side, so the repeat has no visible seam. The marks are drawn
   paths rather than emoji on purpose, \`local/no-emoji\` bans the glyph range and
   the icons-not-glyphs convention holds for decorative art too.

   "plain" is deliberately absent below. Nothing sets --chat-pattern-on for it,
   so the layer falls back to 0 and the panel shows bare ground. */`;

function renderCss() {
  const blocks = [
    FILE_HEADER,
    "",
    ":root {",
    "  /* Pattern ink opacity. Deliberately low: the log's bubbles carry text at",
    "     documented contrast ratios and the pattern must not eat into them. */",
    `  --chat-pattern-alpha: ${BASE_ALPHA.light};`,
    "}",
    "",
    '[data-theme="dark"] {',
    `  --chat-pattern-alpha: ${BASE_ALPHA.dark};`,
    "}",
  ];

  for (const pattern of PATTERNS) {
    const mask = renderTile(pattern);
    blocks.push(
      "",
      `/* ${pattern.note} */`,
      `[data-wallpaper-pattern="${pattern.name}"] {`,
    );
    blocks.push(
      "  --chat-pattern-on: 1;",
      `  --chat-pattern-tile: ${pattern.tile}px;`,
    );
    if (pattern.alpha)
      blocks.push(`  --chat-pattern-alpha: ${pattern.alpha.light};`);
    blocks.push(
      `  --chat-pattern-mask: url("data:image/svg+xml,${mask}");`,
      "}",
    );
    if (pattern.alpha) {
      blocks.push(
        "",
        "/* Two selectors deep so it beats the :root dark value, which the panel",
        "   would otherwise lose to its own single-selector override above. */",
        `[data-theme="dark"] [data-wallpaper-pattern="${pattern.name}"] {`,
        `  --chat-pattern-alpha: ${pattern.alpha.dark};`,
        "}",
      );
    }
  }

  return `${blocks.join("\n")}\n`;
}

const css = renderCss();
await writeFile(OUTPUT_PATH, css, "utf8");
const kilobytes = (css.length / 1024).toFixed(1);
console.log(
  `chat-wallpaper.css: ${PATTERNS.length} patterns, ${kilobytes} KB -> ${OUTPUT_PATH}`,
);
