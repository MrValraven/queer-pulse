/**
 * QueerPulse launch film (pro): the picture.
 *
 * Builds pro.html's scenes and exposes the render contract the CLI
 * (scripts/launch-video/render.mjs) and the admin renderer both drive:
 * window.seek(t), window.ready(), window.DURATION and window.CUES, plus the
 * optional window.CAPTURE / window.SHUTTER hints. Kept out of the HTML because
 * the site's Content-Security-Policy allows no inline scripts.
 */
/* ── Format: the 16:9 film (1920x1080) by default, or the 4:5 portrait cut
   (1080x1350) for feed posts with ?format=portrait. Same timing, same score;
   only the layout changes, and every per-format number lives in LAYOUT. */
const FILM_FORMAT =
  new URLSearchParams(location.search).get("format") === "portrait"
    ? "portrait"
    : "landscape";
const IS_PORTRAIT = FILM_FORMAT === "portrait";
const FILM_WIDTH = IS_PORTRAIT ? 1080 : 1920;
const FILM_HEIGHT = IS_PORTRAIT ? 1350 : 1080;
document.documentElement.dataset.format = FILM_FORMAT;
// The admin renderer reads this to confirm the film honoured the format.
window.FORMAT = { id: FILM_FORMAT, width: FILM_WIDTH, height: FILM_HEIGHT };
const LANDSCAPE_LAYOUT = {
  stage: {
    gridStart: 160,
    // Kept at 5.5 (the grid has 11 lines) so the 16:9 film stays as it was.
    gridCentreIndex: 5.5,
    gridHalfSpan: 6,
    crossStart: 160,
    crossRows: [120, 960],
    glowA: { x: 1050, y: -380, swingX: 160, swingY: 90 },
    glowB: { x: -560, y: 380, swingX: 140, swingY: 80 },
    glowC: { x: 260, y: 90 },
  },
  open: {
    gather: { x: 960, y: 540 },
    // Where each fragment chip floats, in FRAGS order: [x, y] of its centre.
    fragmentSpots: [
      [300, 200],
      [1500, 180],
      [250, 880],
      [1560, 890],
      [900, 112],
      [900, 968],
    ],
  },
  reveal: { ringReach: 900 },
  promise: { chipRows: [0, 0, 0, 1, 1] },
  board: {
    // Three cards a row in a snake, 840 apart across and 720 down.
    columns: 3,
    pitchX: 840,
    pitchY: 720,
    cardWidth: 760,
    cardHeight: 640,
    // The eyebrow and headline sit as one block centred on headCentreY.
    headSize: 128,
    eyebrowGap: 64,
    headCentreY: 540,
    // Camera shots. The wide shot frames the board's centre on (sx, sy).
    wide: { sx: 960, sy: 590, s: 0.52, rx: 30, ry: 0, rz: -10 },
    far: { s: 0.4, rx: 40, rz: -15, sy: 610 },
    last: { sy: 660, s: 0.46, rx: 34 },
    focus: { sx: 1410, sy: 540, s: 1, rx: 2, ry: -8 },
    // The last card's headline starts to leave at lastHeadOut and its
    // eyebrow is gone at lastHeadGone, as the camera pulls back at 37.55.
    lastHeadOut: 37.4,
    lastHeadGone: 37.6,
  },
  net: {
    // The root's place on screen; the camera scales and turns around it.
    centre: { cx: 1360, cy: 560 },
    // Distance from the root and face size, per generation (root first).
    genRadius: [0, 180, 322, 448],
    genSize: [0, 92, 72, 58],
    rootSize: 50,
    // The "vouched in N people" chip's top-left corner.
    chip: { x: 130, y: 716 },
  },
  city: {
    // Where lon -9.135, lat 38.725 lands on screen.
    anchor: { x: 1380, y: 520 },
    // The dot grid's first column and row, and the side it fades in from
    // so no dots sit behind the headline.
    dots: {
      startX: 850,
      startY: 9,
      fadeAxis: "x",
      fadeFrom: 850,
      fadeLength: 300,
    },
    // The dots light up in a ring spreading from here.
    ripple: { x: 1380, y: 560, reach: 900 },
    // Pin label sides that differ from HOODS, by neighbourhood name.
    labelSides: {},
    // The pin pills' height in px, as .chip.pin sets it in pro.html.
    pillHeight: 48,
    // People crossing the city to meet: [from pin, to pin], one arc for
    // each time in ARC_TIMES.
    arcs: [
      ["Arroios", "Cais do Sodré"],
      ["Marvila", "Alfama"],
      ["Campo de Ourique", "Mouraria"],
      ["Anjos", "Príncipe Real"],
    ],
  },
};
// The portrait tree is the 16:9 one at this size, radii and faces together.
const PORTRAIT_TREE_SCALE = 0.9;
const PORTRAIT_LAYOUT = {
  stage: {
    // Seven lines from x 60 to 1020, one through the centre (x 540).
    gridStart: 60,
    gridCentreIndex: 3,
    gridHalfSpan: 3.3,
    crossStart: 220,
    crossRows: [120, FILM_HEIGHT - 120],
    glowA: { x: 310, y: -380, swingX: 110, swingY: 90 },
    glowB: { x: -630, y: 650, swingX: 110, swingY: 80 },
    glowC: { x: -160, y: 225 },
  },
  open: {
    gather: { x: 540, y: 675 },
    // Two bands, three chips above the headlines and three below.
    fragmentSpots: [
      [320, 185],
      [580, 315],
      [500, 1035],
      [330, 1165],
      [790, 185],
      [780, 1165],
    ],
  },
  reveal: { ringReach: 870 },
  // Rows of two, two and one.
  promise: { chipRows: [0, 0, 1, 1, 2] },
  board: {
    // Two cards a row, three rows: 0 1 / 3 2 / 4 5.
    columns: 2,
    pitchX: 840,
    pitchY: 720,
    cardWidth: 760,
    cardHeight: 640,
    // Text in the top of the frame, the card below it.
    headSize: 108,
    eyebrowGap: 68,
    headCentreY: 330,
    wide: { sx: 503, sy: 640, s: 0.47, rx: 30, ry: 0, rz: -10 },
    far: { s: 0.36, rx: 40, rz: -15, sy: 660 },
    last: { sy: 795, s: 0.4, rx: 34 },
    focus: { sx: 540, sy: 905, s: 1, rx: 2, ry: -8 },
    // The last headline has left before the cards rise into its space.
    lastHeadOut: 37.0,
    lastHeadGone: 37.3,
  },
  // Text in the top of the frame, the tree centred below it.
  net: {
    centre: { cx: 540, cy: 880 },
    genRadius: LANDSCAPE_LAYOUT.net.genRadius.map(
      (radius) => radius * PORTRAIT_TREE_SCALE,
    ),
    genSize: LANDSCAPE_LAYOUT.net.genSize.map(
      (size) => size * PORTRAIT_TREE_SCALE,
    ),
    rootSize: LANDSCAPE_LAYOUT.net.rootSize * PORTRAIT_TREE_SCALE,
    // Bottom left, in the space under the tree's lower-left branch.
    chip: { x: 80, y: 1160 },
  },
  // Text on top, the pins centred across the lower part of the frame.
  city: {
    anchor: { x: 662, y: 840 },
    dots: {
      startX: 9,
      startY: 369,
      fadeAxis: "y",
      fadeFrom: 369,
      fadeLength: 240,
    },
    // From the tree's root, where the faces set off.
    ripple: { x: 540, y: 880, reach: 900 },
    // Marvila's label drops under its pin so it stays in frame.
    labelSides: { Marvila: "d" },
    pillHeight: 52,
    // Pairs whose curves pass every pill: one long arc over the map, then
    // short hops that all end up at Cais do Sodré. Marvila keeps no arc,
    // since every curve from it crosses the labels stacked beside Anjos.
    arcs: [
      ["Arroios", "Campo de Ourique"],
      ["Mouraria", "Cais do Sodré"],
      ["Campo de Ourique", "Estrela"],
      ["Estrela", "Cais do Sodré"],
    ],
  },
};
const LAYOUT = IS_PORTRAIT ? PORTRAIT_LAYOUT : LANDSCAPE_LAYOUT;
// Sizes CSS cannot reach: the SVG viewBoxes and the city canvas.
document
  .querySelectorAll("#grid, #net-lines")
  .forEach((svg) =>
    svg.setAttribute("viewBox", `0 0 ${FILM_WIDTH} ${FILM_HEIGHT}`),
  );
{
  const cityCanvas = document.getElementById("city-canvas");
  cityCanvas.width = FILM_WIDTH;
  cityCanvas.height = FILM_HEIGHT;
}

/* ── Timing: 120 BPM, a beat is 0.5s and a bar 2s; cuts fall on bar lines. */
const BEAT = 0.5,
  BAR = 2;
const DURATION = 31 * BAR; // 62s
// Each board card holds the screen for two bars, its headline the whole time.
const CARD_TIME = 2 * BAR;
const AV = "./avatars/";
const S = {
  open: [0, 8],
  reveal: [8, 12],
  "board-scene": [12, 40],
  net: [40, 46],
  city: [46, 50],
  promise: [50, 54],
  belong: [54, 56],
  end: [56, DURATION],
};
const ORDER = Object.keys(S);

/* ── Maths ── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, x) => a + (b - a) * x;
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eOut5 = (x) => 1 - Math.pow(1 - x, 5);
const eIn = (x) => x * x * x;
const eInOut = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eBack = (x) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
/* A springy settle: overshoots, wobbles once, lands. */
const spring = (x) =>
  x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6.5 * x) * Math.cos(11 * x);
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, parent, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
};
const svgEl = (tag, attrs, parent) => {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const av = (id, size, extra = "") =>
  `<img class="av" src="${AV}${id}.svg" alt="" style="width:${size}px;height:${size}px;${extra}">`;
// A face that fills its box: the tree's people and the city's flyers.
const face = (id) => `<img class="av" src="${AV}${id}.svg" alt="">`;
const hit = (t, at, k = 7) => (t < at ? 0 : Math.exp(-(t - at) * k));
const TICK =
  '<span class="tick"><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17 19 7.5"/></svg></span>';
const CAST = {
  ines: "Inês",
  bilal: "Duarte",
  kai: "Mar",
  amara: "Djamila",
  daniel: "Gonçalo",
  priya: "Priya",
  jordan: "Sasha",
  monica: "Mónica",
  harjit: "Harjit",
  sofia: "Sofia",
  tomas: "Tomás",
  yuki: "Céu",
  chidi: "Mauro",
  philippine: "Philippine",
  noor: "Noor",
  rafael: "Rafael",
  lucia: "Leonor",
  anika: "Ioana",
  sam: "Ary",
  joana: "Joana",
  leo: "Vasco",
  grace: "Graça",
  mateo: "Caio",
  eva: "Giulia",
};
const CAST_IDS = Object.keys(CAST);
/* A soft settle with the smallest overshoot: confident, not bouncy. */
const settle = (x) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c = 0.9;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

const ICON = {
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  poster:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/>',
  person:
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  clock:
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  eyeOff:
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  checkSquare:
    '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  award:
    '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"/>',
};
const chip = (ic, text, parent, cls = "chip") =>
  el(
    "div",
    cls,
    parent,
    `<span class="ic"><svg viewBox="0 0 24 24">${ICON[ic]}</svg></span>${text}`,
  );

/* The QueerPulse wordmark, letter by letter, always centred on its own. */
function wordmark(node) {
  node.innerHTML =
    [..."Queer"].map((c) => `<span class="ch">${c}</span>`).join("") +
    '<span class="p">' +
    [..."Pulse"].map((c) => `<span class="ch">${c}</span>`).join("") +
    "</span>";
  $$(".ch", node).forEach((c) => (c.style.display = "inline-block"));
  return $$(".ch", node);
}
/* ── Masked type ── Split every .ln into words; each word rises into its
   line's mask, and leaves the same way, upwards. */
function masked(root) {
  $$(".ln", root).forEach((ln) => {
    const walk = (node) =>
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part))
              frag.appendChild(document.createTextNode(" "));
            else el("span", "wd", frag, part);
          });
          n.replaceWith(frag);
        } else if (n.tagName === "EM" || n.classList?.contains("ln-part"))
          walk(n);
      });
    walk(ln);
  });
  return $$(".wd", root);
}
function type(words, t, inAt, outAt, st = 0.05, dur = 0.85) {
  words.forEach((w, k) => {
    const p = eOut5(prog(t, inAt + k * st, inAt + k * st + dur));
    const q =
      outAt == null
        ? 0
        : eIn(prog(t, outAt + k * 0.03, outAt + k * 0.03 + 0.42));
    w.style.transform = `translateY(${(1 - p) * 115 - q * 115}%)`;
    w.style.opacity = p <= 0 || q >= 1 ? 0 : 1;
  });
}

/* ── The stage ─────────────────────────────────────────────────────────── */
const GRID = $("#grid"),
  gridLines = [];
for (let x = LAYOUT.stage.gridStart; x < FILM_WIDTH; x += 160)
  gridLines.push(
    svgEl(
      "line",
      {
        x1: x,
        x2: x,
        y1: 0,
        y2: FILM_HEIGHT,
        stroke: "#f7f3ee",
        "stroke-opacity": 0.045,
        "stroke-width": 1,
      },
      GRID,
    ),
  );
const crosses = [];
for (let x = LAYOUT.stage.crossStart; x < FILM_WIDTH; x += 320)
  LAYOUT.stage.crossRows.forEach((y) =>
    crosses.push(
      svgEl(
        "path",
        {
          d: `M${x - 7} ${y}h14M${x} ${y - 7}v14`,
          stroke: "#f7f3ee",
          "stroke-opacity": 0.22,
          "stroke-width": 1.2,
        },
        GRID,
      ),
    ),
  );
// The centre glow swells for the name, both times it lands.
const lockGlow = (t) =>
  Math.max(
    eOut(prog(t, 8.0, 9.2)) * (1 - eIn(prog(t, 11.4, 12.2))),
    eOut(prog(t, 56.0, 57.2)),
  );
{
  // One 256px tile of seeded grey noise, drawn once and repeated.
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d"),
    img = g.createImageData(256, 256),
    r = rng(2026);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // Fixed, not moving: it still dithers the dark gradients against
  // banding, and the encoder can reuse it frame to frame. Moving grain
  // made the MP4 six times larger.
  $("#grain").style.backgroundImage = `url(${c.toDataURL()})`;
}
function stage(t) {
  const g = eOut(prog(t, 0, 1.6));
  const { gridCentreIndex, gridHalfSpan, glowA, glowB, glowC } = LAYOUT.stage;
  const halfHeight = FILM_HEIGHT / 2;
  gridLines.forEach((l, i) => {
    const d = clamp(
      g * 1.6 - (Math.abs(i - gridCentreIndex) / gridHalfSpan) * 0.6,
    );
    l.setAttribute("y1", halfHeight - halfHeight * d);
    l.setAttribute("y2", halfHeight + halfHeight * d);
  });
  crosses.forEach((c, i) =>
    c.setAttribute("opacity", eOut(prog(t, 0.8 + i * 0.04, 1.4 + i * 0.04))),
  );
  $("#glow-a").style.transform =
    `translate(${glowA.x + Math.sin(t * 0.21) * glowA.swingX}px, ${glowA.y + Math.cos(t * 0.17) * glowA.swingY}px)`;
  $("#glow-b").style.transform =
    `translate(${glowB.x + Math.cos(t * 0.15) * glowB.swingX}px, ${glowB.y + Math.sin(t * 0.19) * glowB.swingY}px)`;
  $("#glow-c").style.transform = `translate(${glowC.x}px, ${glowC.y}px)`;
  $("#glow-c").style.opacity = lockGlow(t);
  $("#glow-a").style.opacity = 0.6 + 0.4 * g;
  // The HUD rides along while the product is on screen.
  const hud = eOut(prog(t, 12.4, 13.2)) * (1 - eIn(prog(t, 53.4, 53.9)));
  $("#hud").style.opacity = hud;
  $("#hud-fill").style.transform = `scaleX(${t / DURATION})`;
}

/* ── Open: queer life all over Lisbon, wanting more, now you can ───────── */
const openA = masked($("#open-a")),
  openB = masked($("#open-b")),
  openC = masked($("#open-c"));
// Icon, text and depth; each chip's spot comes from LAYOUT.open.fragmentSpots.
const FRAGS = [
  ["chat", "Group chat · 214 unread", 1.1],
  ["poster", "A poster on Rua dos Anjos", 0.8],
  ["person", "A friend of a friend", 0.9],
  ["clock", "A story, gone in 24 hours", 1.15],
  ["pin", "“Someone said Thursday?”", 0.7],
  ["chat", "Three group chats deep", 1.0],
];
const frags = FRAGS.map(([ic, text, z], i) => {
  const [x, y] = LAYOUT.open.fragmentSpots[i];
  return {
    x,
    y,
    z,
    at: 1.5 + i * 0.22,
    node: chip(ic, text, $("#open-chips")),
  };
});
function open(t) {
  type(openA, t, 0.5, 3.6);
  type(openB, t, 4.0, 5.7);
  type(openC, t, 6.0, 6.95);
  const gather = eInOut(prog(t, 6.4, 7.5));
  const { x: gatherX, y: gatherY } = LAYOUT.open.gather;
  frags.forEach((f) => {
    const w = f.node.offsetWidth || 380,
      h = 68;
    const p = eOut5(prog(t, f.at, f.at + 0.9));
    // Parallax: nearer chips drift faster and spread wider on "never".
    const spread = 1 + eInOut(prog(t, 4.0, 6.0)) * 0.08 * f.z;
    const dx = (f.x - gatherX) * spread + Math.sin(t * 0.4 + f.at) * 14 * f.z,
      dy =
        (f.y - gatherY) * spread +
        (1 - p) * 40 +
        Math.cos(t * 0.35 + f.at) * 8 * f.z;
    const x = gatherX + dx * (1 - gather),
      y = gatherY + dy * (1 - gather);
    f.node.style.opacity = p * (1 - prog(t, 7.2, 7.5));
    f.node.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) scale(${(0.9 + 0.1 * p) * (0.75 + 0.25 * f.z) * (1 - gather * 0.6)})`;
  });
  // Everything collapses to one point, which opens the name.
  const ping = $("#ping"),
    r = 14 * settle(prog(t, 7.55, 7.85));
  ping.style.width = ping.style.height = r * 2 + "px";
  ping.style.margin = `${-r}px 0 0 ${-r}px`;
  ping.style.background = "var(--coral)";
  ping.style.boxShadow = `0 0 ${40 + 30 * Math.sin(t * 8)}px rgba(232,119,90,.6)`;
  ping.style.opacity = t >= 7.55 ? 1 : 0;
}

/* ── The name, tracked in from wide ───────────────────────────────────── */
function lockup(t, at, word, chars, slogan, sloganWords, outAt) {
  const track = eOut5(prog(t, at, at + 2.2));
  word.style.letterSpacing = `${lerp(0.09, -0.012, track)}em`;
  const w = word.offsetWidth || 1100;
  word.style.left = (FILM_WIDTH - w) / 2 + "px";
  chars.forEach((c, i) => {
    const s = at + 0.05 + i * 0.045;
    const p = eOut5(prog(t, s, s + 1.0));
    const q =
      outAt == null
        ? 0
        : eIn(prog(t, outAt + i * 0.02, outAt + i * 0.02 + 0.4));
    c.style.transform = `translateY(${(1 - p) * 110 - q * 110}%)`;
    c.style.opacity = p <= 0 || q >= 1 ? 0 : 1;
  });
  type(
    sloganWords,
    t,
    at + 0.9,
    outAt == null ? null : outAt + 0.05,
    0.05,
    0.8,
  );
}
const revealChars = wordmark($("#reveal-word")),
  revealSlogan = masked($("#reveal-slogan"));
function reveal(t) {
  // The point opens into a ring that leaves the frame before the name lands.
  const rp = eOut(prog(t, 8.0, 8.9)),
    rr = 14 + rp * LAYOUT.reveal.ringReach;
  const ring = $("#ring");
  ring.style.width = ring.style.height = rr * 2 + "px";
  ring.style.margin = `${-rr}px 0 0 ${-rr}px`;
  ring.style.opacity = (1 - rp) * (t >= 8 ? 1 : 0);
  ring.style.borderWidth = 2 + 10 * (1 - rp) + "px";
  // "Introducing" rises in over the name and leaves with it.
  const eyebrowIn = eOut(prog(t, 8.0, 8.5)),
    eyebrowOut = eIn(prog(t, 11.45, 11.85));
  const eyebrow = $("#reveal-eyebrow");
  eyebrow.style.opacity = eyebrowIn * (1 - eyebrowOut);
  eyebrow.style.transform = `translateY(${(1 - eyebrowIn) * 16 - eyebrowOut * 16}px)`;
  lockup(
    t,
    8.3,
    $("#reveal-word"),
    revealChars,
    $("#reveal-slogan"),
    revealSlogan,
    11.45,
  );
}

/* ── Board: six cards, one camera ─────────────────────────────────────── */
const stackOf = (ids, size, t0) =>
  ids
    .map(
      (id, i) =>
        `<span data-a="${t0 + i * 0.1}" data-pop style="margin-left: ${i ? -14 : 0}px">${av(id, size, "box-shadow: 0 0 0 4px #fff")}</span>`,
    )
    .join("");
const PIN =
  '<svg class="ic18" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const SEND =
  '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
const ring = () => "box-shadow: 0 0 0 4px #fff";
const VIG = [
  // Vouch: a profile, the person who vouched them in, and who you share.
  () => `<div class="card">
    <div class="row" style="gap: 28px">${av("ines", 112)}<div class="col"><div class="ttl">Inês Fonseca</div><div class="meta">she/they · Choreographer</div></div></div>
    <div class="hr"></div>
    <div class="label">Vouched in by</div>
    <div class="tile" style="margin-top: 16px; padding: 22px 24px" data-a="0.5"><div class="row">${av("bilal", 56)}<div class="col" style="flex: 1"><div class="name">Duarte Lobo</div><div class="meta s">Sound designer · he/him</div></div>${TICK}</div><p class="sub" style="margin-top: 16px; font-size: 25px; line-height: 1.35; color: var(--ink)">“I met Inês at the Pride picnic, she ran the movement workshop and honestly half of us still do her stretches”</p></div>
    <div class="foot">
      <div class="label" data-a="1.0">You both know</div>
      <div class="row" style="margin-top: 16px" data-a="1.1"><span class="stack">${av("kai", 48, ring())}${av("priya", 48, ring() + "; margin-left: -12px")}${av("yuki", 48, ring() + "; margin-left: -12px")}</span><span class="meta">Mar, Priya and Céu</span></div>
    </div>
  </div>`,
  // Gathering: who is going fills in, then you join them.
  () => `<div class="card">
    <div class="row" style="gap: 24px; align-items: flex-start"><div class="date"><b>THU</b><span>19:00</span></div><div class="col" style="gap: 8px; padding-top: 6px"><div class="ttl">Queer Book Club</div><div class="sub">“Stone Butch Blues”</div></div></div>
    <div class="row meta" style="margin-top: 28px; gap: 10px">${PIN}Mouraria Community Centre</div>
    <p class="txt" style="margin-top: 16px; font-size: 22px; color: rgba(26, 26, 31, 0.72)">This edition we’ll be going over chapter 10 to the end and if you haven’t finished it come anyway, we’ll catch you up over tea</p>
    <div class="row" style="margin-top: 20px; gap: 10px"><span class="tag">Step-free</span><span class="tag">Sober</span><span class="tag">Tea from 18:45</span></div>
    <div class="foot">
      <div class="hr" style="margin-top: 0"></div>
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div class="col" style="gap: 12px"><span class="stack">${stackOf(["priya", "kai", "amara", "tomas", "grace", "leo", "noor"], 52, 0.35)}<span class="more" data-a="1.05" data-pop style="margin-left: -14px">+12</span></span><span class="meta s" data-a="1.15">Priya, Mar and 17 others are going</span></div>
        <div style="position: relative; height: 60px; width: 196px"><span class="btn coral" data-btn-a style="position: absolute; right: 0; top: 0">Join them</span><span class="btn jadeb" data-btn-b style="position: absolute; right: 0; top: 0">You’re going</span></div>
      </div>
    </div>
  </div>`,
  // Messages: the book club group chat, three friends and you.
  () => `<div class="card flush">
    <div class="row" style="padding: 28px 40px; border-bottom: 1px solid var(--line)"><span class="stack">${av("priya", 52, ring())}${av("kai", 52, ring() + "; margin-left: -14px")}${av("bilal", 52, ring() + "; margin-left: -14px")}</span><div class="col" style="gap: 4px"><div class="name">Book club</div><div class="meta s">Priya, Mar, Duarte and you</div></div></div>
    <div class="thread">
      <div class="bubble them"><span class="from" style="color: var(--coral-ink)">Priya</span>book club is at Mouraria at 7</div>
      <div class="bubble them" data-a="0.25"><span class="from" style="color: var(--jade-ink)">Mar</span>you coming?</div>
      <div class="bubble me" data-a="0.8">obviously and save me a seat pls</div>
      <div style="position: relative; justify-self: start"><div class="bubble them" data-a="1.7"><span class="from">Duarte</span>I got you!</div><span class="dots" data-typing style="position: absolute; left: 0; top: 0"><i></i><i></i><i></i></span></div>
    </div>
    <div class="composer"><div class="field">Message Book club</div><span class="send">${SEND}</span></div>
  </div>`,
  // Directory: queer-owned businesses across the city, each one a pin.
  () => `<div class="card flush">
    <svg class="art" viewBox="0 0 760 220" style="background: var(--map)">
      <path d="M-10 168 C 140 132, 250 190, 380 146 S 640 78, 780 110" stroke="#fff" stroke-width="18" fill="none"/>
      <path d="M230 -10 L 300 230 M 540 -10 C 505 90, 575 150, 520 230" stroke="#fff" stroke-width="11" fill="none"/>
      <path d="M-10 64 L 780 30" stroke="#fff" stroke-width="8" fill="none"/>
      <circle cx="150" cy="112" r="11" fill="#e8775a"/><circle cx="150" cy="112" r="4" fill="#fff"/>
      <circle cx="620" cy="64" r="11" fill="#e8775a"/><circle cx="620" cy="64" r="4" fill="#fff"/>
      <circle cx="380" cy="104" r="42" fill="rgba(232,119,90,.2)"/><circle cx="380" cy="104" r="15" fill="#e8775a"/><circle cx="380" cy="104" r="5.5" fill="#fff"/>
    </svg>
    <div class="body">
      <div class="ttl">Queer-owned in Lisbon</div><div class="meta" style="margin-top: 6px">Food, craft, care and more</div>
      <div style="display: grid; gap: 14px; margin-top: 28px">
        <div class="row" data-a="0.4">${PIN}<span class="txt"><b style="font-weight: 650; color: var(--plum)">Livraria Bertha</b> · bookshop, Príncipe Real</span></div>
        <div class="row" data-a="0.55">${PIN}<span class="txt"><b style="font-weight: 650; color: var(--plum)">Queer Supper Club</b> · dinners, Mouraria</span></div>
        <div class="row" data-a="0.7">${PIN}<span class="txt"><b style="font-weight: 650; color: var(--plum)">Atelier Pulso</b> · design studio, Príncipe Real</span></div>
      </div>
      <div class="foot row meta s" style="gap: 12px" data-a="1.2"><span class="stack">${av("noor", 40, ring())}${av("sam", 40, ring() + "; margin-left: -10px")}</span>Noor and Ary found Bertha here and now book club buys every book there</div>
    </div>
    <div class="stamp" data-stamp><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17 19 7.5"/></svg><span>Queer<br />owned</span></div>
  </div>`,
  // Forum: a hard question, answered by people who have done it.
  () => `<div class="card">
    <div class="row" style="justify-content: space-between"><span class="tag">Legal &amp; documents</span><span class="meta s"><span data-count>0</span> replies</span></div>
    <div class="ttl sm" style="margin-top: 24px">Has anyone here done the legal name change and how long did it take you?</div>
    <div class="row meta s" style="margin-top: 16px; gap: 12px">${av("yuki", 36)}Asked by Céu</div>
    <div class="hr"></div>
    <div style="display: grid; gap: 30px">
      <div class="reply" data-a="0.4">${av("noor", 48)}<div><div class="who">Noor</div><p>I did mine last spring and there’s an order that makes it so much easier, I’ll write it out for you</p></div></div>
      <div class="reply" data-a="0.85">${av("sam", 48)}<div><div class="who">Ary</div><p>bring two copies of everything, trust me</p></div></div>
      <div class="reply" data-a="1.3">${av("mateo", 48)}<div><div class="who">Caio</div><p>and I can go with you to the Conservatória if you want</p></div></div>
    </div>
  </div>`,
  // Housing: a room, and the household you would be living with.
  () => `<div class="card flush">
    <svg class="art" viewBox="0 0 760 220" style="background: #f3e6dc">
      <rect x="290" y="34" width="180" height="152" rx="12" fill="#fff"/><line x1="380" y1="34" x2="380" y2="186" stroke="#f3e6dc" stroke-width="8"/><line x1="290" y1="110" x2="470" y2="110" stroke="#f3e6dc" stroke-width="8"/>
      <circle cx="430" cy="70" r="22" fill="rgba(232,119,90,.55)"/>
      <path d="M150 220 C 138 142, 206 130, 194 72 C 238 128, 226 172, 214 220 Z" fill="#4a8c6f" opacity=".75"/><rect x="156" y="186" width="66" height="34" rx="7" fill="#c85a40"/>
      <rect x="540" y="140" width="150" height="80" rx="16" fill="#e8b44a" opacity=".7"/>
    </svg>
    <div class="body">
      <div class="ttl sm">Room free in our flat and we’d love someone queer and chill</div>
      <div class="meta" style="margin-top: 6px">Arroios</div>
      <div class="tile row" style="margin-top: 24px; gap: 18px"><span class="stack">${stackOf(["lucia", "tomas", "eva"], 52, 0.35)}</span><div class="col" data-a="0.8"><div class="name" style="font-size: 22px">Leonor, Tomás and Giulia</div><div class="meta s">You know Giulia through Mar</div></div></div>
      <div class="foot row" style="justify-content: space-between" data-a="1.2"><span class="tag jade">${TICK}LGBTQ+-affirming household</span><span class="btn coral">Message them</span></div>
    </div>
  </div>`,
];
const FEATS = [
  ["Vouches", "A friend", "<em>gets you in</em>"],
  ["Gatherings", "Your people", "<em>come with you</em>"],
  ["Messages", "Your friends", "<em>keep you posted</em>"],
  ["Queer businesses", "Queer owners", "<em>welcome you</em>"],
  ["Forum", "Someone here", "<em>shows you how</em>"],
  ["Housing", "A household", "<em>takes you in</em>"],
];
// Every headline is LAYOUT.board.headSize (128px in 16:9). The eyebrow and
// headline sit as one block, centred on headCentreY (the card's y in 16:9).
const BOARD = LAYOUT.board;
const HEAD_SIZE = BOARD.headSize;
const EYEBROW_GAP = BOARD.eyebrowGap;
const headLayout = (lineCount) => {
  const eyebrowTop =
    BOARD.headCentreY - (EYEBROW_GAP + lineCount * HEAD_SIZE * 1.02) / 2;
  return { eyebrowTop, headTop: eyebrowTop + EYEBROW_GAP };
};
const GX = BOARD.pitchX,
  GY = BOARD.pitchY;
const BOARD_ROWS = Math.ceil(FEATS.length / BOARD.columns);
const BOARD_WIDTH = (BOARD.columns - 1) * GX + BOARD.cardWidth;
const BOARD_HEIGHT = (BOARD_ROWS - 1) * GY + BOARD.cardHeight;
$("#board").style.width = BOARD_WIDTH + "px";
$("#board").style.height = BOARD_HEIGHT + "px";
// A snake: along the first row, back along the next, so every camera move
// goes to a neighbouring card (0 1 2 / 5 4 3 in 16:9, 0 1 / 3 2 / 4 5 tall).
const cardAt = (i) => {
  const row = Math.floor(i / BOARD.columns),
    col = row % 2 ? BOARD.columns - 1 - (i % BOARD.columns) : i % BOARD.columns;
  return {
    cx: col * GX + BOARD.cardWidth / 2,
    cy: row * GY + BOARD.cardHeight / 2,
  };
};
const cards = FEATS.map(([label, ...lines], i) => {
  const node = el("div", "bc", $("#board"), VIG[i]());
  const { cx, cy } = cardAt(i);
  node.style.left = cx - BOARD.cardWidth / 2 + "px";
  node.style.top = cy - BOARD.cardHeight / 2 + "px";
  const head = el(
    "div",
    "hl fh",
    $("#board-heads"),
    lines.map((line) => `<span class="ln">${line}</span>`).join(""),
  );
  const { eyebrowTop, headTop } = headLayout(lines.length);
  head.style.top = headTop + "px";
  head.style.fontSize = HEAD_SIZE + "px";
  // Moments saved for the close-up: the last message, the third reply.
  $$("[data-a]", node).forEach((n) => {
    if (
      (i === 2 && n.dataset.a === "1.7") ||
      (i === 4 && n.dataset.a === "1.3")
    ) {
      n.dataset.f = "0";
      delete n.dataset.a;
    }
  });
  return {
    node,
    cx,
    cy,
    label,
    head,
    eyebrowTop,
    words: masked(head),
    focus: 14 + i * CARD_TIME,
    build: $$("[data-a]", node).map((n) => ({
      n,
      at: 12.5 + i * 0.12 + parseFloat(n.dataset.a) * 0.4,
      pop: n.hasAttribute("data-pop"),
    })),
    later: $$("[data-f]", node),
  };
});
const boardAll = masked($("#board-all"));
// The wide shots aim at the board's centre.
const WIDE = {
  cx: BOARD_WIDTH / 2,
  cy: BOARD_HEIGHT / 2,
  ...BOARD.wide,
  w: 1, // how much the shot shows the whole board, separate from zoom
};
const FAR = { ...WIDE, ...BOARD.far };
const LAST = { ...WIDE, ...BOARD.last };
const FOCUS = (i) => ({
  ...cardAt(i),
  ...BOARD.focus,
  rz: 0,
  w: 0,
});
const mix = (a, b, p) => {
  const o = {};
  for (const k in a) o[k] = lerp(a[k], b[k], p);
  return o;
};
const MOVES = [[13.5, 14.3, WIDE, FOCUS(0), false]];
for (let i = 1; i < 6; i++)
  MOVES.push([
    cards[i].focus - 0.55,
    cards[i].focus + 0.45,
    FOCUS(i - 1),
    FOCUS(i),
    true,
  ]);
MOVES.push([37.55, 38.5, FOCUS(5), LAST, false]);
// Text leads the card: a headline types in as the camera starts towards its
// card, and is gone just before the camera leaves for the next one. Card 0
// waits until the wide board has slid clear of where its lines sit.
const CARD0_HEAD_IN = 13.92;
cards.forEach((k, i) => {
  k.headIn = i === 0 ? CARD0_HEAD_IN : MOVES[i][0];
  k.headGone = i < 5 ? MOVES[i + 1][0] - 0.05 : BOARD.lastHeadGone;
  k.headOut =
    i < 5 ? k.headGone - 0.42 - (k.words.length - 1) * 0.03 : BOARD.lastHeadOut;
});
function camAt(t) {
  if (t < MOVES[0][0]) return mix(FAR, WIDE, eOut(prog(t, 12, 13.5)));
  let c = null;
  for (const [a, b, from, to, dip] of MOVES) {
    if (t >= a && t < b) {
      const p = eInOut(prog(t, a, b));
      c = mix(from, to, p);
      if (dip) c.s *= 1 - 0.16 * Math.sin(Math.PI * p);
      return c;
    }
    if (t >= b) c = { ...to };
  }
  // Holding: the camera breathes, so a still card never looks frozen.
  c.ry += Math.sin(t * 0.9) * 1.4;
  c.rx += Math.cos(t * 0.7) * 0.9;
  if (t > 38.5) c.s *= 1 + (t - 38.5) * 0.025;
  return c;
}
function boardScene(t) {
  const c = camAt(t);
  $("#cam").style.perspectiveOrigin = `${c.sx}px ${c.sy}px`;
  const b = $("#board");
  b.style.transformOrigin = `${c.cx}px ${c.cy}px`;
  b.style.transform = `translate(${c.sx - c.cx}px, ${c.sy - c.cy}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg) scale(${c.s})`;
  // Brightness follows the shot, not the zoom: the dip in the middle of a
  // move must not light the whole board up (that read as a flash).
  const wide = c.w;
  $("#scrim").style.opacity = 1 - wide;
  $("#cam").style.opacity = 1 - eIn(prog(t, 39.55, 40.0));
  cards.forEach((k, i) => {
    // Tall boards have neighbours below as well as beside, so each axis is
    // measured in its own pitch there.
    const d = IS_PORTRAIT
      ? Math.hypot((c.cx - k.cx) / GX, (c.cy - k.cy) / GY)
      : Math.hypot(c.cx - k.cx, c.cy - k.cy) / GX;
    // Neighbours are a card apart (d = 1): the card you leave and the card
    // you reach cross-fade through the move instead of both going dark.
    // Tall frames put the headline over the row above, so cards a row up
    // fade out completely there and leave no ghost behind the text.
    const restingOpacity = IS_PORTRAIT
      ? lerp(0.06, 0, clamp((c.cy - k.cy) / GY))
      : 0.06;
    const op = lerp(restingOpacity, 1, Math.max(wide, clamp(1 - d * 1.1)));
    const enter = eOut5(prog(t, 12.05 + i * 0.1, 12.95 + i * 0.1));
    k.node.style.opacity = op * enter;
    k.node.style.transform = `translateY(${(1 - enter) * 120}px)`;
    k.build.forEach(({ n, at, pop }) => {
      const p = pop
        ? settle(prog(t, at, at + 0.4))
        : eOut5(prog(t, at, at + 0.5));
      n.style.opacity = t >= at ? Math.min(1, (t - at) / 0.12) : 0;
      n.style.transform = pop
        ? `scale(${0.5 + 0.5 * p})`
        : `translateY(${(1 - p) * 18}px)`;
    });
    // Headline and label for the card in focus, held for its whole window.
    type(k.words, t, k.headIn, k.headOut, 0.06, 0.8);
  });
  let cur = 0;
  cards.forEach((k, i) => {
    if (t >= k.headIn) cur = i;
  });
  const shown = cards[cur];
  const eb = $("#board-eyebrow");
  eb.innerHTML = `<b>0${cur + 1}</b> / 06 &nbsp;·&nbsp; ${shown.label}`;
  eb.style.top = shown.eyebrowTop + "px";
  const ebIn = eOut(prog(t, shown.headIn, shown.headIn + 0.4));
  const ebOut = eIn(prog(t, shown.headGone - 0.3, shown.headGone));
  eb.style.opacity = t < cards[0].headIn ? 0 : ebIn * (1 - ebOut);
  eb.style.transform = `translateY(${(1 - ebIn) * 12}px)`;
  type(boardAll, t, 38.35, 39.5, 0.06, 0.9);

  // Close-ups: each card does its one thing while it holds the screen.
  const f = (i) => t - cards[i].focus;
  {
    const tk = $(".tile .tick", cards[0].node);
    tk.style.transform = `scale(${0.4 + 0.6 * settle(prog(f(0), 1.6, 2.0)) + hit(f(0), 2.0, 6) * 0.25})`;
  }
  {
    const flip = f(1) > 1.95;
    $("[data-btn-a]", cards[1].node).style.opacity = flip ? 0 : 1;
    const bb = $("[data-btn-b]", cards[1].node);
    bb.style.opacity = flip ? 1 : 0;
    bb.style.transform = `scale(${0.88 + 0.12 * settle(prog(f(1), 1.95, 2.35))})`;
  }
  {
    const ty = $("[data-typing]", cards[2].node),
      done = cards[2].later[0],
      lx = f(2);
    ty.style.opacity = lx > 1.35 && lx < 2.0 ? 1 : 0;
    $$(".dots i", ty).forEach((d, k) => {
      d.style.transform = `translateY(${-Math.max(0, Math.sin(lx * 11 - k * 0.9)) * 6}px)`;
    });
    const p = eOut5(prog(lx, 2.0, 2.4));
    done.style.opacity = lx >= 2.0 ? 1 : 0;
    done.style.transform = `translateY(${(1 - p) * 16}px)`;
  }
  {
    const st = $("[data-stamp]", cards[3].node),
      lx = f(3);
    st.style.opacity = lx > 1.55 ? 1 : 0;
    st.style.transform = `scale(${settle(prog(lx, 1.55, 2.0))}) rotate(${(1 - eOut5(prog(lx, 1.55, 2.0))) * -14}deg)`;
  }
  {
    const lx = f(4),
      third = cards[4].later[0],
      p = eOut5(prog(lx, 1.7, 2.1));
    third.style.opacity = lx >= 1.7 ? 1 : 0;
    third.style.transform = `translateY(${(1 - p) * 16}px)`;
    $("[data-count]", cards[4].node).textContent = lx >= 1.7 ? "3" : "2";
  }
}

/* ── Network: who vouched for whom, branching out from one point ──────── */
const NET = LAYOUT.net.centre;
// The tree's lines scale and turn around the root, like its faces.
$("#net-tree").style.transformOrigin = `${NET.cx}px ${NET.cy}px`;
// The tree's slow settle ends here; the city starts from these positions.
const NET_SETTLE = 0.98;
const treeRng = rng(42);
const treeNodes = [{ x: 0, y: 0, gen: 0, at: 40.3, parent: null }];
const genRadius = LAYOUT.net.genRadius,
  genSize = LAYOUT.net.genSize;
// Cinematic's branches, the two on the left opened 5° so no faces overlap.
[-145, -40, 60, 145].forEach((angle, branchIndex) => {
  treeNodes.push({ gen: 1, angle, parent: 0, at: 40.6 + branchIndex * 0.25 });
  const gen1Index = treeNodes.length - 1,
    kids = 2 + (branchIndex % 2);
  for (let kid = 0; kid < kids; kid++) {
    const kidAngle =
      angle + (kid - (kids - 1) / 2) * 34 + (treeRng() - 0.5) * 8;
    treeNodes.push({
      gen: 2,
      angle: kidAngle,
      parent: gen1Index,
      at: 41.4 + branchIndex * 0.2 + kid * 0.1,
    });
    const gen2Index = treeNodes.length - 1,
      grandkids = branchIndex === 2 ? 2 : treeRng() < 0.6 ? 1 : 0;
    for (let grandkid = 0; grandkid < grandkids; grandkid++)
      treeNodes.push({
        gen: 3,
        angle:
          kidAngle +
          (grandkid - (grandkids - 1) / 2) * 17 +
          (treeRng() - 0.5) * 6,
        parent: gen2Index,
        at: 42.15 + branchIndex * 0.18 + kid * 0.1 + grandkid * 0.08,
      });
  }
});
let castIndex = 0;
treeNodes.forEach((node, index) => {
  if (node.gen > 0) {
    const radians = (node.angle * Math.PI) / 180,
      jitter = 1 + (treeRng() - 0.5) * 0.1;
    node.x = Math.cos(radians) * genRadius[node.gen] * jitter;
    node.y = Math.sin(radians) * genRadius[node.gen] * 0.82 * jitter;
  }
  node.branch =
    node.gen === 0
      ? -1
      : node.gen === 1
        ? index
        : treeNodes[node.parent].branch;
  node.size = node.gen === 0 ? LAYOUT.net.rootSize : genSize[node.gen];
  node.el = el("div", node.gen === 0 ? "node root" : "node", $("#net-nodes"));
  if (node.gen > 0) {
    node.person = CAST_IDS[castIndex++ % CAST_IDS.length];
    node.el.innerHTML = face(node.person);
  }
  if (node.parent != null) {
    const parent = treeNodes[node.parent];
    node.len = Math.hypot(node.x - parent.x, node.y - parent.y);
    node.line = svgEl(
      "line",
      {
        x1: NET.cx + parent.x,
        y1: NET.cy + parent.y,
        x2: NET.cx + node.x,
        y2: NET.cy + node.y,
        "stroke-linecap": "round",
        "stroke-dasharray": `${node.len} ${node.len}`,
      },
      $("#net-lines"),
    );
    node.spark = svgEl("circle", { r: 5, fill: "#e8775a" }, $("#net-lines"));
  }
});
// One friend's branch lights up: everyone they vouched in, and onwards.
const HL = treeNodes.findIndex((node) => node.gen === 1 && node.angle === 60);
const hlCount = treeNodes.filter(
  (node) => node.branch === HL && node.gen > 1,
).length;
const hlPerson = treeNodes[HL].person;
const netChip = el(
  "div",
  "chip vouch",
  $("#net"),
  `${av(hlPerson, 40)}${CAST[hlPerson]} vouched in ${hlCount} people`,
);
const netType = masked($("#net-type"));
const CREAM_RGB = [247, 243, 238],
  CORAL_RGB = [232, 119, 90];
function net(t) {
  type(netType, t, 40.1, 45.25, 0.15, 0.85);
  const highlight = eInOut(prog(t, 43.4, 44.0));
  // The handoff: the faces the city needs stay, everything else leaves.
  const release = eInOut(prog(t, 45.3, 45.9)),
    leave = eIn(prog(t, 45.3, 45.75)),
    retract = eInOut(prog(t, 45.3, 45.8));
  // Carried faces come back to full strength; the rest stay dimmed as they go.
  const lit = highlight * (1 - release);
  // The camera settles by 45.3, so the carried faces are still at the cut.
  // The faces take the same move by hand, sized in pixels like the city's
  // flyers, so both sides of the cut draw them the same way.
  const cam = eOut(prog(t, 40.0, 45.3)),
    camScale = cam >= 1 ? NET_SETTLE : lerp(1.18, NET_SETTLE, cam),
    camTurn = lerp(3, 0, cam),
    turnSin = Math.sin((camTurn * Math.PI) / 180),
    turnCos = Math.cos((camTurn * Math.PI) / 180);
  $("#net-tree").style.transform = `scale(${camScale}) rotate(${camTurn}deg)`;
  let rootBeat = 0;
  for (let beatAt = 41; beatAt < 45.3; beatAt += BAR / 2)
    rootBeat = Math.max(rootBeat, hit(t, beatAt, 8));
  treeNodes.forEach((node) => {
    const pop = eBack(prog(t, node.at, node.at + 0.45));
    const inBranch = node.gen === 0 || node.branch === HL;
    const stays = node.carried ? 1 : 1 - leave;
    const dim = node.carried ? lit : highlight;
    const scale =
      pop *
      (node.gen === 0 ? 1 + rootBeat * 0.14 : 1) *
      (inBranch && node.gen > 0 ? 1 + dim * 0.1 : 1) *
      (node.carried ? 1 : 1 - leave * 0.3);
    const screenX = NET.cx + (node.x * turnCos - node.y * turnSin) * camScale,
      screenY = NET.cy + (node.x * turnSin + node.y * turnCos) * camScale,
      screenSize = node.size * camScale;
    node.el.style.width = node.el.style.height = screenSize + "px";
    node.el.style.transform = `translate(${screenX - screenSize / 2}px, ${screenY - screenSize / 2}px) rotate(${camTurn}deg) scale(${Math.max(0, scale)})`;
    node.el.style.opacity =
      (t >= node.at ? 1 : 0) * (inBranch ? 1 : lerp(1, 0.3, dim)) * stays;
    if (node.line) {
      const parent = treeNodes[node.parent],
        draw = eInOut(prog(t, node.at - 0.3, node.at + 0.05)),
        shown = draw * (1 - retract);
      const tint = inBranch ? highlight : 0;
      const [red, green, blue] = CREAM_RGB.map((channel, channelIndex) =>
        Math.round(lerp(channel, CORAL_RGB[channelIndex], tint)),
      );
      node.line.setAttribute("stroke", `rgb(${red},${green},${blue})`);
      node.line.setAttribute(
        "stroke-width",
        inBranch ? lerp(1.6, 3.5, highlight) : 1.6,
      );
      node.line.setAttribute(
        "stroke-dashoffset",
        (node.len * (1 - shown)).toFixed(2),
      );
      node.line.setAttribute(
        "opacity",
        (inBranch ? lerp(0.18, 0.9, highlight) : lerp(0.18, 0.09, highlight)) *
          (1 - leave),
      );
      node.spark.setAttribute(
        "cx",
        lerp(NET.cx + parent.x, NET.cx + node.x, draw),
      );
      node.spark.setAttribute(
        "cy",
        lerp(NET.cy + parent.y, NET.cy + node.y, draw),
      );
      node.spark.setAttribute("opacity", draw > 0 && draw < 1 ? 0.9 : 0);
    }
  });
  const chipIn = eOut5(prog(t, 43.7, 44.2)),
    chipOut = eIn(prog(t, 45.3, 45.6));
  netChip.style.opacity = chipIn * (1 - chipOut);
  netChip.style.transform = `translate(${LAYOUT.net.chip.x}px, ${LAYOUT.net.chip.y + (1 - chipIn) * 16 - chipOut * 10}px)`;
}

/* ── City: a dot-matrix Lisbon, real neighbourhood positions ──────────── */
const geo = (lon, lat) => [
  LAYOUT.city.anchor.x + (lon + 9.135) * 9000,
  LAYOUT.city.anchor.y - (lat - 38.725) * 11520,
];
// Land north of the Tejo, traced from the riverfront (lon, lat).
const SHORE = [
  [-9.25, 38.69],
  [-9.19, 38.697],
  [-9.17, 38.7],
  [-9.16, 38.702],
  [-9.15, 38.705],
  [-9.14, 38.706],
  [-9.133, 38.7075],
  [-9.125, 38.708],
  [-9.118, 38.711],
  [-9.112, 38.716],
  [-9.106, 38.722],
  [-9.1, 38.73],
  [-9.096, 38.742],
  [-9.093, 38.75],
  [-9.09, 38.77],
  [-9.088, 38.8],
  [-9.25, 38.8],
].map(([a, b]) => geo(a, b));
const inside = (x, y) => {
  let c = false;
  for (let i = 0, j = SHORE.length - 1; i < SHORE.length; j = i++) {
    const [xi, yi] = SHORE[i],
      [xj, yj] = SHORE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      c = !c;
  }
  return c;
};
const [mx, my] = geo(-9.185, 38.728); // Monsanto, the city's forest
const DOTS = [];
const { dots: dotGrid, ripple } = LAYOUT.city;
for (let y = dotGrid.startY; y < FILM_HEIGHT; y += 18)
  for (let x = dotGrid.startX; x < FILM_WIDTH; x += 18)
    if (inside(x, y)) {
      const park = Math.hypot((x - mx) / 1.2, y - my) < 150;
      DOTS.push({
        x,
        y,
        park,
        fade: clamp(
          ((dotGrid.fadeAxis === "x" ? x : y) - dotGrid.fadeFrom) /
            dotGrid.fadeLength,
        ),
        at:
          46.05 + (Math.hypot(x - ripple.x, y - ripple.y) / ripple.reach) * 0.8,
      });
    }
// Each pin is someone from the vouch tree, picked from all four branches
// (Tomás and Céu from the lit one) for a short flight to their pin.
const HOODS = [
  ["Campo de Ourique", -9.166, 38.717, "l", "mateo"],
  ["Estrela", -9.159, 38.711, "d", "joana"],
  ["Príncipe Real", -9.149, 38.717, "u", "ines"],
  ["Cais do Sodré", -9.144, 38.706, "d", "sam"],
  ["Mouraria", -9.136, 38.716, "r", "tomas"],
  ["Alfama", -9.128, 38.711, "r", "yuki"],
  ["Anjos", -9.134, 38.726, "r", "priya"],
  ["Arroios", -9.134, 38.735, "r", "jordan"],
  ["Marvila", -9.104, 38.743, "r", "harjit"],
];
const FLIGHT = 0.55;
const pins = HOODS.map(([name, lon, lat, hoodSide, who], i) => {
  const [x, y] = geo(lon, lat);
  const dir = LAYOUT.city.labelSides[name] ?? hoodSide;
  // The pin's own avatar only holds the space: the flyer is the face.
  const node = el(
    "div",
    "chip pin pinchip",
    $("#city-pins"),
    `${av(who, 36, "visibility: hidden")}${name}`,
  );
  const from = treeNodes.find((treeNode) => treeNode.person === who);
  from.carried = true;
  const flyer = el("div", "node", $("#city-faces"), face(who));
  const flyAt = 46.0 + i * 0.06;
  return {
    name,
    x,
    y,
    dir,
    node,
    flyer,
    flyAt,
    at: flyAt + FLIGHT,
    // Where the face sits on screen when the tree hands over.
    fromX: NET.cx + from.x * NET_SETTLE,
    fromY: NET.cy + from.y * NET_SETTLE,
    fromSize: from.size * NET_SETTLE,
  };
});
// The arcs' moments are the same in both formats (the score plays to them);
// LAYOUT.city.arcs picks the pins for each, and a null slot draws nothing.
const ARC_TIMES = [47.9, 48.15, 48.4, 48.65];
const ARCS = ARC_TIMES.map((at, arcIndex) => {
  const pair = LAYOUT.city.arcs[arcIndex];
  return {
    a: pair && pins.find((p) => p.name === pair[0]),
    b: pair && pins.find((p) => p.name === pair[1]),
    at,
  };
});
const cityType = masked($("#city-type"));
const cctx = $("#city-canvas").getContext("2d");
function city(t) {
  type(cityType, t, 46.1, 49.4);
  const out = eIn(prog(t, 49.5, 50.0));
  const ctx = cctx;
  ctx.clearRect(0, 0, FILM_WIDTH, FILM_HEIGHT);
  ctx.globalAlpha = 1 - out;
  DOTS.forEach((d) => {
    const p = prog(t, d.at, d.at + 0.35);
    if (p <= 0) return;
    ctx.fillStyle = d.park
      ? `rgba(155,224,189,${0.42 * p * d.fade})`
      : `rgba(247,243,238,${0.3 * p * d.fade})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 2.6 + (1 - p) * 2, 0, Math.PI * 2);
    ctx.fill();
  });
  // People crossing the city to meet: arcs drawn from one pin to another.
  ARCS.forEach(({ a, b, at }) => {
    const p = eInOut(prog(t, at, at + 0.9));
    if (p <= 0 || !a || !b) return;
    const cx = (a.x + b.x) / 2,
      cy = Math.min(a.y, b.y) - Math.hypot(a.x - b.x, a.y - b.y) * 0.45;
    const q = (s) => [
      (1 - s) * (1 - s) * a.x + 2 * (1 - s) * s * cx + s * s * b.x,
      (1 - s) * (1 - s) * a.y + 2 * (1 - s) * s * cy + s * s * b.y,
    ];
    ctx.strokeStyle = "rgba(232,119,90,.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let s = 0; s <= p + 1e-6; s += 0.02) {
      const [x, y] = q(Math.min(s, p));
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    const [hx, hy] = q(p);
    ctx.fillStyle = "#f7f3ee";
    ctx.beginPath();
    ctx.arc(hx, hy, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  pins.forEach((pn) => {
    const w = pn.node.offsetWidth || 160,
      h = LAYOUT.city.pillHeight;
    const [ox, oy] = {
      r: [18, -h / 2],
      l: [-18 - w, -h / 2],
      u: [-w / 2, -18 - h],
      d: [-w / 2, 18],
    }[pn.dir];
    // The face flies from its place in the tree to its seat in the pill.
    const fly = eInOut(prog(t, pn.flyAt, pn.at));
    const toX = pn.x + ox + h / 2,
      toY = pn.y + oy + h / 2;
    const bend = Math.sin(Math.PI * fly) * 0.25;
    const faceX = lerp(pn.fromX, toX, fly) - (toY - pn.fromY) * bend,
      faceY = lerp(pn.fromY, toY, fly) + (toX - pn.fromX) * bend,
      faceSize = lerp(pn.fromSize, 36, fly);
    pn.flyer.style.width = pn.flyer.style.height = faceSize + "px";
    pn.flyer.style.transform = `translate(${faceX - faceSize / 2}px, ${faceY - faceSize / 2}px)`;
    pn.flyer.style.opacity = 1 - out;
    // On landing, the pill opens out from the face to its name.
    const open = eOut5(prog(t, pn.at, pn.at + 0.45));
    pn.node.style.opacity =
      eOut(prog(t, pn.at - 0.05, pn.at + 0.1)) * (1 - out);
    pn.node.style.clipPath = `inset(0 ${(1 - open) * (w - h)}px 0 0 round ${h / 2}px)`;
    pn.node.style.transform = `translate(${pn.x + ox}px, ${pn.y + oy}px)`;
    if (t < pn.at - 0.15) return;
    const p = settle(prog(t, pn.at - 0.15, pn.at + 0.3));
    const pulse = (Math.max(0, t - pn.at) % 2) / 2;
    ctx.strokeStyle = `rgba(232,119,90,${0.5 * (1 - pulse) * p})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pn.x, pn.y, 8 + pulse * 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e8775a";
    ctx.beginPath();
    ctx.arc(pn.x, pn.y, 7 * p, 0, Math.PI * 2);
    ctx.fill();
  });
  $("#tejo").style.opacity = eOut(prog(t, 47.0, 47.8)) * (1 - out);
}

/* ── Promise: no ads, no algorithm, just your people ──────────────────── */
const promiseA = masked($("#promise-a")),
  promiseB = masked($("#promise-b"));
const PROMISES = [
  ["users", "Communities and collectives"],
  ["checkSquare", "Run by its members"],
  ["eyeOff", "You choose who sees what"],
  ["image", "Queer art front and center"],
  ["award", "Stories of queer changemakers"],
];
// Centred rows under the headline (three then two, or two, two and one in
// portrait); LAYOUT.promise.chipRows says which row each chip joins.
const promiseBox = $("#promise-chips");
const promiseRowCount = Math.max(...LAYOUT.promise.chipRows) + 1;
while ($$(".promise-row", promiseBox).length < promiseRowCount)
  el("div", "promise-row", promiseBox);
const promiseRows = $$(".promise-row", promiseBox);
const promiseChips = PROMISES.map(([ic, h], i) => ({
  node: chip(
    ic,
    h,
    promiseRows[LAYOUT.promise.chipRows[i]],
    "chip jade inline",
  ),
  at: 52.55 + i * 0.06,
}));
function promise(t) {
  // "No" stays; the word after it rolls from ads to algorithm.
  type(promiseA.slice(0, 1), t, 50.05, 51.75);
  const slot = $("#promise-a .slot");
  const roll = eInOut(prog(t, 50.9, 51.3));
  const sp = eOut5(prog(t, 50.1, 50.95)),
    sq = eIn(prog(t, 51.78, 52.2));
  slot.style.transform = `translateY(${(1 - sp) * 115 - sq * 115}%)`;
  slot.style.opacity = t < 50.1 || sq >= 1 ? 0 : 1;
  const [wa, wb] = $$("span", slot).map((s) => {
    s.style.transform = `translateY(${-roll * 100}%)`;
    return s.offsetWidth;
  });
  // The slot narrows to its word, so "No ads." stays centred as it rolls.
  slot.style.width = lerp(wa, wb, roll) + "px";
  type(promiseB, t, 52.0, 53.5);
  promiseChips.forEach((c) => {
    const p = eOut5(prog(t, c.at, c.at + 0.6)),
      q = eIn(prog(t, 53.5, 53.85));
    c.node.style.opacity = (t >= c.at ? p : 0) * (1 - q);
    c.node.style.transform = `translateY(${(1 - p) * 24 - q * 16}px)`;
  });
}

/* ── Belong and the end ───────────────────────────────────────────────── */
const belongType = masked($("#belong-type"));
function belong(t) {
  type(belongType, t, 54.05, 55.5, 0.06, 0.9);
}
const endChars = wordmark($("#end-word")),
  endSlogan = masked($("#end-slogan"));
function end(t) {
  lockup(t, 56.0, $("#end-word"), endChars, $("#end-slogan"), endSlogan, null);
  const c = eOut5(prog(t, 57.4, 58.2));
  $("#end-cta").style.opacity = c;
  $("#end-cta").style.transform = `translateY(${(1 - c) * 20}px)`;
  $("#credit").style.opacity = eOut(prog(t, 58.2, 59.0));
}

const RENDER = {
  open,
  reveal,
  "board-scene": boardScene,
  net,
  promise,
  city,
  belong,
  end,
};

/* Moments the score plays to, read by pro.score.js. */
window.CUES = {
  duration: DURATION,
  lines: [0.5, 4.0, 6.0, 40.1, 46.1, 50.05, 52.0, 54.05],
  frags: frags.map((f) => f.at),
  ping: 7.55,
  names: [8.3, 56.0],
  build: [12.05, 12.5],
  moves: MOVES.map(([a]) => a),
  focus: cards.map((c) => c.focus),
  closeUps: [
    cards[0].focus + 1.6,
    cards[1].focus + 1.95,
    cards[2].focus + 1.35,
    cards[2].focus + 2.0,
    cards[3].focus + 1.55,
    cards[4].focus + 1.7,
    cards[5].focus + 1.6,
  ],
  all: 38.35,
  netPops: treeNodes
    .map((node) => node.at)
    .sort((earlier, later) => earlier - later),
  vouch: 43.4,
  handoff: 46.0,
  roll: 50.9,
  promiseChips: promiseChips.map((c) => c.at),
  dots: 46.05,
  pins: pins.map((p) => p.at),
  arcs: ARCS.map((a) => a.at),
};

window.seek = function seek(t) {
  stage(t);
  ORDER.forEach((id) => {
    const [a, b] = S[id];
    const on = t >= a && t < (id === "end" ? b + 1 : b);
    const node = document.getElementById(id);
    node.style.display = on ? "block" : "none";
    if (on) RENDER[id](t);
  });
  $("#stage").style.opacity = 1 - eInOut(prog(t, DURATION - 0.8, DURATION));
};

window.ready = async function ready() {
  await document.fonts.load('400 40px "Fraunces"');
  await document.fonts.load('italic 400 40px "Fraunces"');
  await document.fonts.load('600 40px "DM Sans"');
  await document.fonts.ready;
  await Promise.all(
    $$("img").map((i) =>
      i.decode().catch(() => console.warn("missing", i.src)),
    ),
  );
  return { duration: DURATION };
};
window.DURATION = DURATION;
window.SHUTTER = 4; // render.mjs averages 4 sub-frames: motion blur for the camera
window.CAPTURE = "jpeg"; // grain and glows make PNG frames slow to encode

const q = new URLSearchParams(location.search);
window.ready().then(() => {
  if (q.has("play")) {
    const t0 = performance.now();
    const loop = () => {
      window.seek(((performance.now() - t0) / 1000) % DURATION);
      requestAnimationFrame(loop);
    };
    loop();
  } else window.seek(parseFloat(q.get("t") || "0"));
});
