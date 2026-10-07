/**
 * QueerPulse film, "Vouched": the picture.
 *
 * Builds vouch.html's scenes and exposes the render contract the CLI
 * (scripts/launch-video/render.mjs) and the admin renderer both drive:
 * window.seek(t), window.ready(), window.DURATION and window.CUES, plus the
 * optional window.CAPTURE / window.SHUTTER hints. Kept out of the HTML because
 * the site's Content-Security-Policy allows no inline scripts.
 */
/* ── Timing: 120 BPM, a beat is 0.5s and a bar 2s; cuts fall on bar lines. */
const BEAT = 0.5,
  BAR = 2;
const DURATION = 28 * BAR; // 56s
const AV = "./avatars/";
const S = {
  open: [0, 6],
  invite: [6, 12],
  portal: [12, 18],
  welcome: [18, 22],
  profile: [22, 30],
  weight: [30, 34],
  forward: [34, 42],
  network: [42, 48],
  end: [48, 56],
};
const ORDER = Object.keys(S);
// Two layers outlive a cut: Inês's profile (profile into weight) and the
// vouch tree (forward into network).
const LAYERS = { "profile-layer": [22, 34], "tree-layer": [38, 48] };

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
/* A soft settle with the smallest overshoot: confident, never bouncy. */
const settle = (x) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c = 0.9;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
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
// A face that fills its box: the open's ring and the tree's people.
const face = (id) => `<img class="av" src="${AV}${id}.svg" alt="">`;
const hit = (t, at, k = 7) => (t < at ? 0 : Math.exp(-(t - at) * k));
const bump = (t, a, b) => Math.sin(Math.PI * prog(t, a, b));
const TICK =
  '<span class="tick"><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17 19 7.5"/></svg></span>';
const PERSON =
  '<svg class="ic18" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
const ring = () => "box-shadow: 0 0 0 4px #fff";
const CAST = {
  ines: "Inês",
  bilal: "Bilal",
  kai: "Kai",
  amara: "Amara",
  daniel: "Daniel",
  priya: "Priya",
  jordan: "Jordan",
  monica: "Mónica",
  harjit: "Harjit",
  sofia: "Sofia",
  tomas: "Tomás",
  yuki: "Yuki",
  chidi: "Chidi",
  philippine: "Philippine",
  noor: "Noor",
  rafael: "Rafael",
  lucia: "Lucía",
  anika: "Anika",
  sam: "Sam",
  joana: "Joana",
  leo: "Leo",
  grace: "Grace",
  mateo: "Mateo",
  eva: "Eva",
};
const CAST_IDS = Object.keys(CAST);

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
        } else if (n.tagName === "EM") walk(n);
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
for (let x = 160; x < 1920; x += 160)
  gridLines.push(
    svgEl(
      "line",
      {
        x1: x,
        x2: x,
        y1: 0,
        y2: 1080,
        stroke: "#f7f3ee",
        "stroke-opacity": 0.045,
        "stroke-width": 1,
      },
      GRID,
    ),
  );
const crosses = [];
for (let x = 160; x < 1920; x += 320)
  [120, 960].forEach((y) =>
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
  // Fixed, never moving: it dithers the dark gradients against banding and
  // the encoder can reuse it frame to frame.
  $("#grain").style.backgroundImage = `url(${c.toDataURL()})`;
}
// The HUD rides along while the product is on screen.
const HUD_IN = 6.2,
  HUD_OUT = 47.3;
function stage(t) {
  const g = eOut(prog(t, 0, 1.6));
  gridLines.forEach((l, i) => {
    const d = clamp(g * 1.6 - (Math.abs(i - 5.5) / 6) * 0.6);
    l.setAttribute("y1", 540 - 540 * d);
    l.setAttribute("y2", 540 + 540 * d);
  });
  crosses.forEach((c, i) =>
    c.setAttribute("opacity", eOut(prog(t, 0.8 + i * 0.04, 1.4 + i * 0.04))),
  );
  $("#glow-a").style.transform =
    `translate(${1050 + Math.sin(t * 0.21) * 160}px, ${-380 + Math.cos(t * 0.17) * 90}px)`;
  $("#glow-b").style.transform =
    `translate(${-560 + Math.cos(t * 0.15) * 140}px, ${380 + Math.sin(t * 0.19) * 80}px)`;
  // The centre glow swells for the name.
  $("#glow-c").style.transform = `translate(260px, 90px)`;
  $("#glow-c").style.opacity = eOut(prog(t, 48.0, 49.2));
  $("#glow-a").style.opacity = 0.6 + 0.4 * g;
  const hud =
    eOut(prog(t, HUD_IN, HUD_IN + 0.7)) * (1 - eIn(prog(t, HUD_OUT, HUD_OUT + 0.5)));
  $("#hud").style.opacity = hud;
  $("#hud-fill").style.transform = `scaleX(${t / DURATION})`;
}

/* ── Headlines: in at the scene's start, gone just before its cut ──────── */
const headline = (id, scene, size) => {
  const node = $(`#${id}`),
    words = masked(node),
    [start, end] = S[scene];
  if (size) {
    const lineCount = $$(".ln", node).length;
    node.style.fontSize = size + "px";
    node.style.top = 540 - (lineCount * size * 1.02) / 2 + "px";
  }
  return {
    node,
    words,
    inAt: start + 0.1,
    outAt: end - 0.1 - 0.42 - (words.length - 1) * 0.03,
  };
};
// 128px as on the pro board; the two long lines need 104px to clear their
// cards by more than 60px.
const HEADS = {
  open: headline("open-type", "open"),
  invite: headline("invite-type", "invite", 128),
  portal: headline("portal-type", "portal", 128),
  welcome: headline("welcome-type", "welcome", 128),
  profile: headline("profile-type", "profile", 104),
  weight: headline("weight-type", "weight", 104),
  forward: headline("forward-type", "forward", 128),
  network: headline("network-type", "network"),
};
// The open lets the grid draw first, as the pro cut does.
HEADS.open.inAt = 0.5;
HEADS.open.outAt = 5.2;
const typeHead = (head, t, st = 0.06, dur = 0.8) =>
  type(head.words, t, head.inAt, head.outAt, st, dur);

/* ── Cards on the stage: enter from below, breathe, leave ─────────────── */
// The visual column: cards centre here, right of the headlines.
const CARD_X = 1460;
function shot(node, t, { cx, cy = 540, inAt, outAt, scale = 1, rx = 2, ry = -7 }) {
  const enter = eOut5(prog(t, inAt, inAt + 0.9)),
    leave = outAt == null ? 0 : eIn(prog(t, outAt, outAt + 0.4));
  const width = node.offsetWidth,
    height = node.offsetHeight;
  node.style.left = cx - width / 2 + "px";
  node.style.top = cy - height / 2 + "px";
  // Holding: the card breathes, so a still card never looks frozen.
  const tiltX = rx + Math.cos(t * 0.7) * 0.9,
    tiltY = ry + Math.sin(t * 0.9) * 1.4;
  node.style.transform = `translateY(${(1 - enter) * 120 + leave * 24}px) perspective(2600px) rotateX(${tiltX.toFixed(3)}deg) rotateY(${tiltY.toFixed(3)}deg) scale(${(scale * (1 - leave * 0.04)).toFixed(4)})`;
  node.style.opacity = enter * (1 - leave);
}

/* ── Open: everyone here came in through a friend ─────────────────────── */
// A loose ring of the cast around the line; z is depth (nearer drifts more).
const OPEN_FACES = [
  ["noor", 330, 250, 104, 1.1],
  ["daniel", 650, 172, 84, 0.8],
  ["kai", 962, 140, 96, 0.95],
  ["amara", 1278, 178, 88, 0.85],
  ["jordan", 1598, 258, 108, 1.15],
  ["yuki", 1786, 488, 80, 0.75],
  ["chidi", 1690, 770, 100, 1.05],
  ["priya", 1372, 892, 86, 0.85],
  ["tomas", 1000, 930, 104, 1.1],
  ["lucia", 640, 878, 92, 0.9],
  ["rafael", 304, 792, 100, 1.0],
  ["sofia", 160, 520, 82, 0.8],
];
const OPEN_POP = 0.9,
  OPEN_STAGGER = 0.16;
const openFaces = OPEN_FACES.map(([id, x, y, size, z], i) => {
  const node = el("div", "face", $("#open-faces"), face(id));
  node.style.width = node.style.height = size + "px";
  return { node, x, y, size, z, at: OPEN_POP + i * OPEN_STAGGER };
});
function open(t) {
  typeHead(HEADS.open, t, 0.06, 0.9);
  openFaces.forEach((f, i) => {
    const p = settle(prog(t, f.at, f.at + 0.6)),
      fade = eOut(prog(t, f.at, f.at + 0.3)),
      leave = eIn(prog(t, 5.2 + i * 0.025, 5.7 + i * 0.025));
    // A slow spread outwards, with each face drifting on its own.
    const spread = 1 + 0.012 * t + leave * 0.06;
    const x = 960 + (f.x - 960) * spread + Math.sin(t * 0.4 + i * 1.7) * 10 * f.z,
      y =
        540 +
        (f.y - 540) * spread +
        Math.cos(t * 0.33 + i * 1.3) * 8 * f.z +
        (1 - p) * 26;
    f.node.style.opacity = fade * (1 - leave);
    f.node.style.transform = `translate(${(x - f.size / 2).toFixed(2)}px, ${(y - f.size / 2).toFixed(2)}px) scale(${(0.6 + 0.4 * p) * (1 - leave * 0.1)})`;
  });
}

/* ── The invite card (Bilal for Inês, then Inês for Sam) ──────────────── */
const inviteHtml = ({ from, fromName, fromMeta, to, toName }) => `<div class="card auto invite">
    <div class="row" style="gap: 20px">${av(from, 72)}<div class="col"><div class="name">${fromName}</div><div class="meta s">${fromMeta}</div></div></div>
    <div class="hr" style="margin: 30px 0"></div>
    <div class="label">Invite to QueerPulse</div>
    <div class="row" style="gap: 18px; margin-top: 16px">${av(to, 60)}<div class="ttl">${toName}</div></div>
    <div class="label" style="margin-top: 34px">Your vouch</div>
    <div class="note"><span class="note-ring" data-focus></span><p><span data-typed></span><i class="caret" data-caret></i></p></div>
    <div class="sendwrap"><span class="tap" data-tap></span><span class="btn coral" data-send>Send invite</span><span class="btn jadeb" data-sent>${TICK}Invite sent</span></div>
  </div>`;
// Typing keeps a human rhythm: a breath after each sentence.
const SENTENCE_PAUSE = 7;
function noteSchedule(text, start, end) {
  const weights = [...text].map((char, k) =>
    char === " " && text[k - 1] === "." ? SENTENCE_PAUSE : 1,
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let running = 0;
  return weights.map((weight) => {
    running += weight;
    return start + ((end - start) * running) / total;
  });
}
function makeInvite(container, people, note, times) {
  container.innerHTML = inviteHtml(people);
  return {
    container,
    note,
    times,
    charTimes: noteSchedule(note, times.typeStart, times.typeEnd),
    typed: $("[data-typed]", container),
    caret: $("[data-caret]", container),
    focus: $("[data-focus]", container),
    tap: $("[data-tap]", container),
    send: $("[data-send]", container),
    sent: $("[data-sent]", container),
    sentTick: $("[data-sent] .tick", container),
  };
}
function inviteMoments(invite, t) {
  const { typeStart, typeEnd, send, sent } = invite.times;
  const count = invite.charTimes.filter((at) => t >= at).length;
  invite.typed.textContent = invite.note.slice(0, count);
  // The field takes focus a beat before typing; the caret blinks while it
  // waits and holds steady while it types.
  const focused = t >= typeStart - 0.45 && t < sent;
  const typing = t >= typeStart && t < typeEnd + 0.1;
  invite.caret.style.opacity =
    focused && (typing || Math.floor(t * 2.2) % 2 === 0) ? 1 : 0;
  invite.focus.style.opacity =
    0.55 *
    eOut(prog(t, typeStart - 0.45, typeStart - 0.2)) *
    (1 - eOut(prog(t, sent - 0.1, sent + 0.2)));
  // The tap: the button gives under the press, a ring spreads from it.
  const press = bump(t, send - 0.08, send + 0.2);
  invite.send.style.transform = `scale(${1 - 0.05 * press})`;
  invite.send.style.opacity = t >= sent ? 0 : 1;
  const ringSpread = eOut(prog(t, send, send + 0.55));
  invite.tap.style.opacity = t >= send ? (0.8 * (1 - ringSpread)).toFixed(3) : 0;
  invite.tap.style.transform = `scale(${1 + ringSpread * 0.06}, ${1 + ringSpread * 0.5})`;
  const flip = settle(prog(t, sent, sent + 0.4));
  invite.sent.style.opacity = t >= sent ? 1 : 0;
  invite.sent.style.transform = `scale(${0.9 + 0.1 * flip})`;
  invite.sentTick.style.transform = `scale(${settle(prog(t, sent + 0.08, sent + 0.45)) + hit(t, sent + 0.45, 6) * 0.2})`;
}

/* ── Invite: Bilal vouches for Inês ───────────────────────────────────── */
const INVITE = {
  inAt: 6.25,
  typeStart: 7.3,
  typeEnd: 9.75,
  send: 10.2,
  sent: 10.45,
  outAt: 11.55,
};
const inviteCard = makeInvite(
  $("#invite-card"),
  {
    from: "bilal",
    fromName: "Bilal Kaya",
    fromMeta: "Sound designer · he/him",
    to: "ines",
    toName: "Inês Fonseca",
  },
  "She ran the movement workshop at the Pride picnic. Everyone left calmer.",
  INVITE,
);
function invite(t) {
  typeHead(HEADS.invite, t);
  shot(inviteCard.container, t, { cx: CARD_X, inAt: INVITE.inAt, outAt: INVITE.outAt });
  inviteMoments(inviteCard, t);
}

/* ── Portal: Bilal walks Inês in ──────────────────────────────────────── */
const P0 = { x: 615, y: 367, rx: 74, ry: 175, ground: 540 };
// The friends are drawn at 120%, scaled from their feet; the whole card at
// 108%, as a full scene.
const FIG_SCALE = 1.2,
  PORTAL_SCALE = 1.08,
  PORTAL_X = 1430;
// Bilal walks in and turns; their hands meet; they walk on together and
// step through, Bilal first; the portal pulses.
const WALK_IN = [12.5, 13.3],
  TURN_BACK = [13.22, 13.36],
  INES_STEP = [13.28, 13.58],
  HANDS = 13.6,
  TURN_ON = [14.1, 14.24],
  TOGETHER = [14.3, 16.1],
  THROUGH = 15.5,
  PULSE = 16.1;
const FIGURE = {
  bilal: { torso: "#2d1b3d", legs: ["#356b53", "#4a8c6f"], skin: "#a9694a" },
  ines: { torso: "#e8775a", legs: ["#241430", "#3a2553"], skin: "#c68863" },
};
const SHOULDER_Y = -122,
  HIP_Y = -64,
  LEG = 60,
  ARM = 54,
  STEP = 44;
const figureHtml = (id) => {
  const { torso, legs, skin } = FIGURE[id];
  const leg = (color) =>
    `<line data-leg stroke="${color}" stroke-width="16" stroke-linecap="round"/><line data-shoe stroke="#1f1a1c" stroke-width="11" stroke-linecap="round"/>`;
  // A swinging arm goes behind the body; a reaching one comes in front.
  const arm = `<g data-arm-group><line data-arm stroke="${torso}" stroke-width="13" stroke-linecap="round"/><circle data-hand r="8" fill="${skin}"/></g>`;
  return `<div class="p0-fig">
    <svg width="160" height="270" viewBox="-80 -260 160 270">
      <ellipse data-shadow cx="0" cy="0" rx="36" ry="7" fill="rgba(45,27,61,0.14)"/>
      <g data-arms-back>${arm}${arm}</g>
      <g data-body>${leg(legs[0])}${leg(legs[1])}<rect x="-26" y="-140" width="52" height="84" rx="24" fill="${torso}"/></g>
      <g data-arms-front></g>
    </svg>${face(id)}
  </div>`;
};
// Back to front: glow and doorway, the friends, then the ring and its
// shimmer.
$("#portal-card").innerHTML = `<div class="card auto flush p0">
    <svg class="p0-svg" viewBox="0 0 760 640">
      <defs>
        <radialGradient id="p0-glow"><stop offset="0" stop-color="#e8775a" stop-opacity="0.5"/><stop offset="0.55" stop-color="#e8775a" stop-opacity="0.16"/><stop offset="1" stop-color="#e8775a" stop-opacity="0"/></radialGradient>
        <radialGradient id="p0-inner" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#fffaf4"/><stop offset="0.55" stop-color="#fbd9c9"/><stop offset="1" stop-color="#f19a80"/></radialGradient>
      </defs>
      <line x1="44" x2="716" y1="${P0.ground}" y2="${P0.ground}" stroke="rgba(45,27,61,0.12)" stroke-width="2" stroke-linecap="round"/>
      <ellipse data-pool cx="${P0.x}" cy="${P0.ground}" rx="120" ry="14" fill="#e8775a"/>
      <g data-portal>
        <ellipse data-glow cx="${P0.x}" cy="${P0.y}" rx="${P0.rx * 2.4}" ry="${P0.ry * 1.6}" fill="url(#p0-glow)"/>
        <ellipse cx="${P0.x}" cy="${P0.y}" rx="${P0.rx}" ry="${P0.ry}" fill="url(#p0-inner)"/>
      </g>
    </svg>
    <div class="p0-figs">${figureHtml("bilal")}${figureHtml("ines")}</div>
    <svg class="p0-svg" viewBox="0 0 760 640">
      <ellipse data-ripple cx="${P0.x}" cy="${P0.y}" fill="none" stroke="#e8775a"/>
      <g data-portal>
        ${'<ellipse data-shimmer cx="' + P0.x + '" cy="' + P0.y + '" fill="none" stroke="#fff" stroke-width="2.5"/>'.repeat(3)}
        <ellipse cx="${P0.x}" cy="${P0.y}" rx="${P0.rx}" ry="${P0.ry}" fill="none" stroke="#e8775a" stroke-width="12"/>
        <ellipse cx="${P0.x}" cy="${P0.y}" rx="${P0.rx - 7}" ry="${P0.ry - 7}" fill="none" stroke="#ffe4d8" stroke-width="2.5" opacity="0.8"/>
      </g>
      <g data-spark fill="none" stroke="#e8775a" stroke-linecap="round">
        <circle data-spark-ring stroke-width="3"/>
        ${[0, 1, 2, 3, 4, 5].map(() => '<line data-ray stroke-width="3"/>').join("")}
      </g>
    </svg>
    <div class="wm serif p0-mark">Queer<i>Pulse</i></div>
  </div>`;
const p0Root = $(".p0");
const p0Figure = (node) => ({
  node,
  shadow: $("[data-shadow]", node),
  body: $("[data-body]", node),
  legs: $$("[data-leg]", node),
  shoes: $$("[data-shoe]", node),
  arms: $$("[data-arm]", node),
  hands: $$("[data-hand]", node),
  armGroups: $$("[data-arm-group]", node),
  armsBack: $("[data-arms-back]", node),
  armsFront: $("[data-arms-front]", node),
  head: $(".av", node),
});
const [bilalFigure, inesFigure] = $$(".p0-fig", p0Root).map(p0Figure);
const p0Portals = $$("[data-portal]", p0Root);
const p0Shimmers = $$("[data-shimmer]", p0Root);
const p0Rays = $$("[data-ray]", p0Root);
// The friends fade into the light as they reach the portal's middle, and
// are gone past it: they go into it.
{
  const fadeMask = `linear-gradient(90deg, #000 ${P0.x - 46}px, transparent ${P0.x + 2}px)`;
  const figs = $(".p0-figs", p0Root);
  figs.style.webkitMaskImage = figs.style.maskImage = fadeMask;
}
const p0Mark = $(".p0-mark", p0Root);
p0Mark.style.left = P0.x + "px";
p0Mark.style.top = P0.y - P0.ry - 74 + "px";
// Distance along a walk that speeds up over kIn and slows down over kOut.
const glide = (p, kIn, kOut) => {
  p = clamp(p);
  const total = 1 - kIn / 2 - kOut / 2;
  let d;
  if (p < kIn) d = (p * p) / (2 * kIn);
  else if (p <= 1 - kOut) d = p - kIn / 2;
  else d = total - ((1 - p) * (1 - p)) / (2 * kOut);
  return d / total;
};
// Bilal walks in past Inês and stops; she steps up to take his hand; then
// they walk on together, Bilal a step ahead.
const bilalX = (t) =>
  t < TOGETHER[0]
    ? lerp(-80, 335, glide(prog(t, ...WALK_IN), 0.12, 0.4))
    : 335 + 435 * glide(prog(t, ...TOGETHER), 0.3, 0);
const inesX = (t) =>
  t < TOGETHER[0]
    ? lerp(160, 228, glide(prog(t, ...INES_STEP), 0.45, 0.45))
    : 228 + 435 * glide(prog(t, ...TOGETHER), 0.3, 0);
const speedOf = (position, t) =>
  Math.abs(position(t + 0.02) - position(t - 0.02)) / 0.04;
// Legs swing with the distance walked; the body drops as they open, so the
// feet stay on the ground.
function gait(distance, speed) {
  const stride = clamp(speed / 160),
    swing = Math.sin((distance / (STEP * FIG_SCALE)) * Math.PI) * 0.44 * stride;
  return { swing, drop: LEG * (1 - Math.cos(swing)) };
}
const shoulderOf = (x, gaitNow, facing, side) => ({
  x: x + side * 19 * Math.max(0.45, Math.abs(facing)) * FIG_SCALE,
  y: P0.ground + (gaitNow.drop + SHOULDER_Y) * FIG_SCALE,
});
function poseFigure(figure, x, facing, gaitNow, reaches, tilt, breathe = 0) {
  const { swing, drop } = gaitNow;
  const originY = P0.ground + drop * FIG_SCALE;
  figure.node.style.transform = `translate(${x - 80}px, ${originY - 260}px) scale(${FIG_SCALE})`;
  figure.shadow.setAttribute("cy", (-drop).toFixed(2));
  figure.body.setAttribute("transform", `scale(${facing.toFixed(3)} 1)`);
  figure.legs.forEach((leg, k) => {
    const angle = (k ? 1 : -1) * swing,
      hipX = k ? 8 : -8,
      footX = hipX + Math.sin(angle) * LEG,
      footY = HIP_Y + Math.cos(angle) * LEG;
    leg.setAttribute("x1", hipX);
    leg.setAttribute("y1", HIP_Y);
    leg.setAttribute("x2", footX.toFixed(2));
    leg.setAttribute("y2", footY.toFixed(2));
    const shoe = figure.shoes[k];
    shoe.setAttribute("x1", footX.toFixed(2));
    shoe.setAttribute("y1", (footY + 2).toFixed(2));
    shoe.setAttribute("x2", (footX + 9).toFixed(2));
    shoe.setAttribute("y2", (footY + 2).toFixed(2));
  });
  // Arms are drawn in screen space: left arm first, then right.
  const heading = facing >= 0 ? 1 : -1;
  figure.arms.forEach((arm, k) => {
    const side = k ? 1 : -1;
    const shoulderX = side * 19 * Math.max(0.45, Math.abs(facing)),
      angle = side * 0.14 - side * 0.9 * swing * heading;
    let handX = shoulderX + Math.sin(angle) * ARM,
      handY = SHOULDER_Y + Math.cos(angle) * ARM;
    const reach = reaches[k];
    if (reach && reach.amount > 0) {
      let targetX = (reach.x - x) / FIG_SCALE,
        targetY = (reach.y - originY) / FIG_SCALE;
      const dx = targetX - shoulderX,
        dy = targetY - SHOULDER_Y,
        length = Math.hypot(dx, dy),
        most = ARM + 4;
      if (length > most) {
        targetX = shoulderX + (dx / length) * most;
        targetY = SHOULDER_Y + (dy / length) * most;
      }
      handX = lerp(handX, targetX, reach.amount);
      handY = lerp(handY, targetY, reach.amount);
    }
    arm.setAttribute("x1", shoulderX.toFixed(2));
    arm.setAttribute("y1", SHOULDER_Y);
    arm.setAttribute("x2", handX.toFixed(2));
    arm.setAttribute("y2", handY.toFixed(2));
    figure.hands[k].setAttribute("cx", handX.toFixed(2));
    figure.hands[k].setAttribute("cy", handY.toFixed(2));
    const layer =
      reach && reach.amount > 0 ? figure.armsFront : figure.armsBack;
    if (figure.armGroups[k].parentNode !== layer)
      layer.appendChild(figure.armGroups[k]);
  });
  figure.head.style.transform = `translateY(${breathe.toFixed(2)}px) rotate(${tilt.toFixed(2)}deg) scaleX(${heading})`;
}
function portalScene(t) {
  const bilalAt = bilalX(t),
    inesAt = inesX(t);
  // Bilal turns back to Inês, then turns to lead her in.
  const bilalFacing =
    t < HANDS
      ? Math.cos(Math.PI * eInOut(prog(t, ...TURN_BACK)))
      : Math.cos(Math.PI * (1 - eInOut(prog(t, ...TURN_ON))));
  const bilalGait = gait(bilalAt + 80, speedOf(bilalX, t)),
    inesGait = gait(inesAt - 160 + STEP * 0.6, speedOf(inesX, t));
  // Where their hands meet: between Bilal's left and Inês's right shoulder.
  const bilalShoulder = shoulderOf(bilalAt, bilalGait, bilalFacing, -1),
    inesShoulder = shoulderOf(inesAt, inesGait, 1, 1);
  const handX = (bilalShoulder.x + inesShoulder.x) / 2,
    handY = (bilalShoulder.y + inesShoulder.y) / 2 + 30 * FIG_SCALE;
  const bilalReach = eOut(prog(t, HANDS - 0.26, HANDS - 0.04)),
    inesReach = eOut(prog(t, HANDS - 0.22, HANDS));
  const lean =
    eInOut(prog(t, HANDS - 0.27, HANDS - 0.07)) *
    (1 - eInOut(prog(t, TURN_ON[0], TURN_ON[0] + 0.2)));
  poseFigure(
    bilalFigure,
    bilalAt,
    bilalFacing,
    bilalGait,
    [{ x: handX, y: handY, amount: bilalReach }, null],
    -7 * lean,
  );
  poseFigure(
    inesFigure,
    inesAt,
    1,
    inesGait,
    [null, { x: handX, y: handY, amount: inesReach }],
    6 * lean,
    t < INES_STEP[0] ? Math.sin(t * 2.6) * 1.2 : 0,
  );
  // A small coral spark where the hands join.
  const sparkP = prog(t, HANDS, HANDS + 0.42),
    sparkOn = t >= HANDS && sparkP < 1,
    sparkR = 6 + 26 * eOut(sparkP);
  const sparkRing = $("[data-spark-ring]", p0Root);
  sparkRing.setAttribute("cx", handX.toFixed(2));
  sparkRing.setAttribute("cy", handY.toFixed(2));
  sparkRing.setAttribute("r", sparkR.toFixed(2));
  sparkRing.setAttribute("opacity", sparkOn ? (1 - sparkP).toFixed(3) : 0);
  p0Rays.forEach((ray, k) => {
    const angle = (k / p0Rays.length) * Math.PI * 2 - Math.PI / 2,
      inner = sparkR + 6,
      outer = sparkR + 6 + 12 * (1 - sparkP);
    ray.setAttribute("x1", (handX + Math.cos(angle) * inner).toFixed(2));
    ray.setAttribute("y1", (handY + Math.sin(angle) * inner).toFixed(2));
    ray.setAttribute("x2", (handX + Math.cos(angle) * outer).toFixed(2));
    ray.setAttribute("y2", (handY + Math.sin(angle) * outer).toFixed(2));
    ray.setAttribute("opacity", sparkOn ? (1 - sparkP).toFixed(3) : 0);
  });
  // The portal brightens as each of them steps in, then pulses and settles.
  const pulse = bump(t, PULSE, PULSE + 0.3);
  const flare =
    0.3 * bump(t, THROUGH - 0.15, THROUGH + 0.2) +
    0.3 * bump(t, THROUGH + 0.22, THROUGH + 0.55) +
    0.7 * pulse;
  const portalScale = 1 + 0.07 * pulse;
  p0Portals.forEach((g) =>
    g.setAttribute(
      "transform",
      `translate(${P0.x} ${P0.y}) scale(${portalScale.toFixed(4)}) translate(${-P0.x} ${-P0.y})`,
    ),
  );
  $("[data-glow]", p0Root).setAttribute(
    "opacity",
    (0.75 + 0.08 * Math.sin(t * 2.2) + flare).toFixed(3),
  );
  $("[data-pool]", p0Root).setAttribute(
    "opacity",
    (0.16 + 0.2 * flare).toFixed(3),
  );
  // Light drifts inwards through the doorway.
  p0Shimmers.forEach((shimmer, k) => {
    const life = (((t * 0.45 + k / 3) % 1) + 1) % 1,
      size = 1 - life * 0.8;
    shimmer.setAttribute("rx", (P0.rx * 0.86 * size).toFixed(2));
    shimmer.setAttribute("ry", (P0.ry * 0.9 * size).toFixed(2));
    shimmer.setAttribute(
      "opacity",
      (Math.sin(Math.PI * life) * 0.4).toFixed(3),
    );
  });
  const rippleP = eOut(prog(t, PULSE, PULSE + 0.75)),
    ripple = $("[data-ripple]", p0Root);
  ripple.setAttribute("rx", (P0.rx * (1 + 1.1 * rippleP)).toFixed(2));
  ripple.setAttribute("ry", (P0.ry * (1 + 0.45 * rippleP)).toFixed(2));
  ripple.setAttribute("stroke-width", (1 + 5 * (1 - rippleP)).toFixed(2));
  ripple.setAttribute(
    "opacity",
    t >= PULSE ? (0.85 * (1 - rippleP)).toFixed(3) : 0,
  );
  p0Mark.style.transform = `translateX(-50%) scale(${1 + 0.05 * pulse})`;
}
function portal(t) {
  typeHead(HEADS.portal, t);
  shot($("#portal-card"), t, {
    cx: PORTAL_X,
    inAt: 12.15,
    outAt: 17.55,
    scale: PORTAL_SCALE,
  });
  portalScene(t);
}

/* ── Welcome: a quick hello from the team ─────────────────────────────── */
const CHECK_TICK =
  '<svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17 19 7.5" stroke-dasharray="22" /></svg>';
$("#welcome-card").innerHTML = `<div class="card auto welcome">
    <div class="row" style="gap: 24px">${av("ines", 88)}<div class="ttl">Welcome, Inês</div></div>
    <div class="hr"></div>
    <div class="check" data-check><span class="box"><i></i>${CHECK_TICK}</span><span class="txt">A short check-in with the moderation team</span></div>
    <div class="check" data-check><span class="box"><i></i>${CHECK_TICK}</span><span class="txt">The Code of Conduct, read and accepted</span></div>
  </div>`;
const WELCOME = { inAt: 18.25, checks: [19.5, 20.2], outAt: 21.55 };
const checks = $$("[data-check]", $("#welcome-card")).map((row, i) => ({
  row,
  fill: $(".box i", row),
  mark: $(".box polyline", row),
  at: WELCOME.checks[i],
}));
// Cream, warming to the jade tint once the row is done.
const CREAM_RGB = [247, 243, 238],
  JADE_TINT_RGB = [220, 239, 229],
  CORAL_RGB = [232, 119, 90];
const mixRgb = (from, to, amount) =>
  `rgb(${from.map((channel, k) => Math.round(lerp(channel, to[k], amount))).join(",")})`;
function welcome(t) {
  typeHead(HEADS.welcome, t);
  shot($("#welcome-card"), t, { cx: CARD_X, inAt: WELCOME.inAt, outAt: WELCOME.outAt });
  checks.forEach(({ row, fill, mark, at }) => {
    fill.style.opacity = t >= at ? 1 : 0;
    fill.style.transform = `scale(${settle(prog(t, at, at + 0.35)) + hit(t, at + 0.35, 6) * 0.12})`;
    mark.setAttribute(
      "stroke-dashoffset",
      (22 * (1 - eOut(prog(t, at + 0.08, at + 0.36)))).toFixed(2),
    );
    row.style.background = mixRgb(
      CREAM_RGB,
      JADE_TINT_RGB,
      eOut(prog(t, at, at + 0.5)),
    );
  });
}

/* ── Profile: the portal opens into Inês's profile ────────────────────── */
$("#profile-card").innerHTML = `<div class="card auto profile">
    <div class="row" style="gap: 26px" data-part="0">${av("ines", 104)}<div class="col"><div class="ttl">Inês Fonseca</div><div class="meta">she/they · Choreographer</div></div></div>
    <div class="hr" data-part="0.05"></div>
    <div class="label" data-part="0.15">Vouched in by</div>
    <div class="tile" data-tile style="margin-top: 16px; padding: 22px 24px"><span class="hl-ring" data-ring></span><div class="row">${av("bilal", 56)}<div class="col" style="flex: 1"><div class="name">Bilal Kaya</div><div class="meta s">Sound designer · he/him</div></div>${TICK}</div><p class="sub" style="margin-top: 16px; font-size: 24px; line-height: 1.38; color: var(--ink)">“She ran the movement workshop at the Pride picnic. Everyone left calmer.”</p></div>
    <div class="vline" data-vline>${PERSON}Bilal’s name stays on your profile</div>
    <div class="foot">
      <div class="label" data-part="1.3">You both know</div>
      <div class="row" style="margin-top: 16px"><span class="stack">${["kai", "priya", "yuki"].map((id, i) => `<span data-mutual style="margin-left: ${i ? -12 : 0}px">${av(id, 52, ring())}</span>`).join("")}</span><span class="meta" data-names>Kai, Priya and Yuki</span></div>
    </div>
    <div class="bloom" data-bloom></div>
  </div><div class="bloom-rim" data-rim></div>`;
const PROFILE = {
  portalAt: 22.05,
  bloom: 22.45,
  bloomEnd: 23.0,
  build: 23.0,
  tick: 23.9,
  mutuals: [24.6, 24.85, 25.1],
  names: 25.35,
};
const WEIGHT = { push: [30.0, 31.0], ring: 31.0, line: 31.45, outAt: 33.55 };
const PROFILE_X = 1500,
  // The push: a closer, straighter look at the vouch, still clear of the
  // headline on the left.
  PUSH_SCALE = 1.1,
  PUSH_LEFT = 1244;
const profileWrap = $("#profile-card"),
  profileCard = $(".profile", profileWrap),
  profileTile = $("[data-tile]", profileWrap),
  profileTick = $("[data-tile] .tick", profileWrap),
  profileRing = $("[data-ring]", profileWrap),
  profileLine = $("[data-vline]", profileWrap),
  profileBloom = $("[data-bloom]", profileWrap),
  profileRim = $("[data-rim]", profileWrap),
  profileNames = $("[data-names]", profileWrap),
  profileMutuals = $$("[data-mutual]", profileWrap),
  profileParts = $$("[data-part]", profileWrap).map((node) => ({
    node,
    at: PROFILE.build + parseFloat(node.dataset.part) * 0.8,
  }));
// The doorway is the card itself, clipped to a portal, with the portal's
// glow on the stage behind it.
const BLOOM_PORTAL = { rx: 66, ry: 156 };
$("#bloom-portal").innerHTML = `<defs>
    <radialGradient id="bp-glow"><stop offset="0" stop-color="#e8775a" stop-opacity="0.55"/><stop offset="0.5" stop-color="#e8775a" stop-opacity="0.18"/><stop offset="1" stop-color="#e8775a" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse data-bp rx="${BLOOM_PORTAL.rx * 2.6}" ry="${BLOOM_PORTAL.ry * 1.7}" fill="url(#bp-glow)"/>`;
const CARD_SHADOW = (amount) =>
  `0 80px 140px -40px rgba(0, 0, 0, ${(0.75 * amount).toFixed(3)}), 0 0 0 1px rgba(45, 27, 61, ${(0.06 * amount).toFixed(3)})`;
function profileLayer(t) {
  const width = profileWrap.offsetWidth,
    height = profileWrap.offsetHeight;
  // Where the push lands: the tile centred on the frame's middle line.
  const tileCentreY = profileTile.offsetTop + profileTile.offsetHeight / 2;
  const push = eInOut(prog(t, ...WEIGHT.push));
  const pushCx = PUSH_LEFT + (width * PUSH_SCALE) / 2,
    pushCy = 540 - (tileCentreY - height / 2) * PUSH_SCALE;
  const creep = 1 + 0.008 * Math.max(0, t - WEIGHT.push[1]);
  shot(profileWrap, t, {
    cx: lerp(PROFILE_X, pushCx, push),
    cy: lerp(540, pushCy, push),
    inAt: -10,
    outAt: WEIGHT.outAt,
    scale: lerp(1, PUSH_SCALE, push) * creep,
    rx: lerp(2, 1, push),
    ry: lerp(-7, -3, push),
  });
  // A portal opens, then widens into the card: its rim eases from an
  // ellipse to the card's rounded corners and thins away as it lands.
  const open = settle(prog(t, PROFILE.portalAt, PROFILE.portalAt + 0.4)),
    widen = eInOut(prog(t, PROFILE.bloom, PROFILE.bloomEnd));
  const doorWidth = 2 * BLOOM_PORTAL.rx * open,
    doorHeight = 2 * BLOOM_PORTAL.ry * open;
  const boxWidth = lerp(doorWidth, width, widen),
    boxHeight = lerp(doorHeight, height, widen),
    radiusX = lerp(doorWidth / 2, 32, widen),
    radiusY = lerp(doorHeight / 2, 32, widen),
    insetX = (width - boxWidth) / 2,
    insetY = (height - boxHeight) / 2;
  const radius = `${radiusX.toFixed(2)}px / ${radiusY.toFixed(2)}px`;
  profileCard.style.clipPath =
    widen >= 1
      ? "none"
      : `inset(${insetY.toFixed(2)}px ${insetX.toFixed(2)}px round ${radius})`;
  profileCard.style.boxShadow = CARD_SHADOW(
    eOut(prog(t, PROFILE.bloomEnd, PROFILE.bloomEnd + 0.5)),
  );
  profileRim.style.left = insetX.toFixed(2) + "px";
  profileRim.style.top = insetY.toFixed(2) + "px";
  profileRim.style.width = boxWidth.toFixed(2) + "px";
  profileRim.style.height = boxHeight.toFixed(2) + "px";
  profileRim.style.borderRadius = radius;
  profileRim.style.borderWidth = lerp(11, 2, widen).toFixed(2) + "px";
  profileRim.style.opacity =
    (open > 0 ? 1 : 0) * (1 - eOut(prog(widen, 0.45, 1)));
  // Inside, the portal's light, sized to the doorway; it clears to the card.
  const lightSize = lerp(0.62, 0.95, widen);
  profileBloom.style.background = `radial-gradient(${(boxWidth * lightSize).toFixed(1)}px ${(boxHeight * lightSize).toFixed(1)}px at 50% 54%, #fffaf4 0%, #fbd9c9 60%, #f19a80 100%)`;
  profileBloom.style.opacity = 1 - eInOut(prog(t, 22.85, 23.3));
  const glow = $("[data-bp]", $("#bloom-portal"));
  glow.setAttribute(
    "transform",
    `translate(${PROFILE_X} 540) scale(${(open * (1 + widen * 1.5)).toFixed(4)})`,
  );
  glow.setAttribute(
    "opacity",
    ((0.85 + 0.15 * Math.sin(t * 6)) * open * (1 - eInOut(prog(widen, 0.3, 1)))).toFixed(3),
  );
  // The profile builds out of the light.
  const dim = lerp(1, 0.3, push);
  profileParts.forEach(({ node, at }) => {
    const p = eOut5(prog(t, at, at + 0.5));
    node.style.opacity = (t >= at ? Math.min(1, (t - at) / 0.12) : 0) * dim;
    node.style.transform = `translateY(${(1 - p) * 18}px)`;
  });
  const tileAt = PROFILE.build + 0.25,
    tileIn = eOut5(prog(t, tileAt, tileAt + 0.5)),
    ringIn = settle(prog(t, WEIGHT.ring, WEIGHT.ring + 0.45));
  profileTile.style.opacity = t >= tileAt ? Math.min(1, (t - tileAt) / 0.12) : 0;
  profileTile.style.transform = `translateY(${(1 - tileIn) * 18}px) scale(${1 + 0.03 * ringIn})`;
  profileTile.style.boxShadow = `0 ${24 * ringIn}px ${50 * ringIn}px ${-20 * ringIn}px rgba(200, 90, 64, ${(0.4 * ringIn).toFixed(3)})`;
  profileTick.style.opacity = t >= PROFILE.tick ? 1 : 0;
  profileTick.style.transform = `scale(${0.3 + 0.7 * settle(prog(t, PROFILE.tick, PROFILE.tick + 0.4)) + hit(t, PROFILE.tick + 0.4, 6) * 0.25})`;
  // The highlight ring tightens onto the tile as the camera arrives.
  const ringGap = lerp(14, 0, ringIn);
  profileRing.style.inset = `${-ringGap}px`;
  profileRing.style.borderRadius = `${22 + ringGap}px`;
  profileRing.style.boxShadow = `0 0 0 3px rgba(232, 119, 90, ${clamp(ringIn).toFixed(3)}), 0 0 36px rgba(232, 119, 90, ${(0.35 * clamp(ringIn)).toFixed(3)})`;
  const lineIn = eOut5(prog(t, WEIGHT.line, WEIGHT.line + 0.6));
  profileLine.style.opacity = t >= WEIGHT.line ? lineIn : 0;
  profileLine.style.transform = `translateY(${(1 - lineIn) * -10}px)`;
  profileMutuals.forEach((node, i) => {
    const at = PROFILE.mutuals[i];
    node.style.opacity = (t >= at ? Math.min(1, (t - at) / 0.1) : 0) * dim;
    node.style.transform = `scale(${0.5 + 0.5 * settle(prog(t, at, at + 0.4))})`;
  });
  const namesIn = eOut5(prog(t, PROFILE.names, PROFILE.names + 0.5));
  profileNames.style.opacity = (t >= PROFILE.names ? namesIn : 0) * dim;
  profileNames.style.transform = `translateX(${(1 - namesIn) * -12}px)`;
}
function profile(t) {
  typeHead(HEADS.profile, t);
}
function weight(t) {
  typeHead(HEADS.weight, t);
}

/* ── Forward: Inês vouches for Sam ────────────────────────────────────── */
const FORWARD = {
  inAt: 34.25,
  typeStart: 35.2,
  typeEnd: 36.8,
  send: 37.25,
  sent: 37.5,
  shrink: [38.0, 38.45],
};
const forwardCard = makeInvite(
  $("#forward-card"),
  {
    from: "ines",
    fromName: "Inês Fonseca",
    fromMeta: "Choreographer · she/they",
    to: "sam",
    toName: "Sam",
  },
  "Sam has hosted the queer book swap for two years.",
  FORWARD,
);
function forward(t) {
  typeHead(HEADS.forward, t);
  const shrink = eInOut(prog(t, ...FORWARD.shrink));
  shot(forwardCard.container, t, {
    cx: lerp(CARD_X, SMALL_TREE.x, shrink),
    inAt: FORWARD.inAt,
    scale: lerp(1, 0.18, shrink),
  });
  forwardCard.container.style.opacity *= 1 - eIn(prog(t, FORWARD.shrink[0] + 0.1, FORWARD.shrink[1]));
  inviteMoments(forwardCard, t);
}

/* ── The vouch tree: who vouched for whom, branching out from one point ── */
const NET = { x: 1360, y: 560 };
const treeRng = rng(42);
const treeNodes = [{ x: 0, y: 0, gen: 0, parent: null }];
const genRadius = [0, 180, 322, 448],
  genSize = [50, 92, 72, 58];
// Pro's four branches, turned so Bilal's runs out to the right, where the
// small tree already sits.
const BRANCH_ANGLES = [-150, -64, 16, 112],
  CHAIN_BRANCH = 2;
BRANCH_ANGLES.forEach((angle, branchIndex) => {
  treeNodes.push({ gen: 1, angle, parent: 0 });
  const gen1Index = treeNodes.length - 1,
    kids = 2 + (branchIndex % 2);
  for (let kid = 0; kid < kids; kid++) {
    const kidAngle =
      angle + (kid - (kids - 1) / 2) * 34 + (treeRng() - 0.5) * 8;
    treeNodes.push({ gen: 2, angle: kidAngle, parent: gen1Index });
    const gen2Index = treeNodes.length - 1,
      grandkids = branchIndex === CHAIN_BRANCH ? 2 : treeRng() < 0.6 ? 1 : 0;
    for (let grandkid = 0; grandkid < grandkids; grandkid++)
      treeNodes.push({
        gen: 3,
        angle:
          kidAngle +
          (grandkid - (grandkids - 1) / 2) * 17 +
          (treeRng() - 0.5) * 6,
        parent: gen2Index,
      });
  }
});
treeNodes.forEach((node) => {
  if (node.gen === 0) return;
  const radians = (node.angle * Math.PI) / 180,
    jitter = 1 + (treeRng() - 0.5) * 0.1;
  node.x = Math.cos(radians) * genRadius[node.gen] * jitter;
  node.y = Math.sin(radians) * genRadius[node.gen] * 0.82 * jitter;
});
// The chain: Bilal, the first of his people (Inês), the last of hers (Sam),
// placed by hand so the small tree reads left to right.
const chainBilal = treeNodes.findIndex(
  (node) => node.gen === 1 && node.angle === BRANCH_ANGLES[CHAIN_BRANCH],
);
const chainInes = treeNodes.findIndex((node) => node.parent === chainBilal);
const chainSam = treeNodes
  .map((node, index) => (node.parent === chainInes ? index : -1))
  .filter((index) => index >= 0)
  .pop();
const CHAIN = [chainBilal, chainInes, chainSam];
const CHAIN_AT = { x: [172, 318, 446], y: [52, -2, 58] };
CHAIN.forEach((index, k) => {
  treeNodes[index].x = CHAIN_AT.x[k];
  treeNodes[index].y = CHAIN_AT.y[k];
});
// When each person appears: the chain in the forward scene, the rest
// growing out from Bilal's branch once the camera pulls back.
const TREE_TIMES = [38.5, 38.95, 39.45];
const ROOT_AT = 42.55;
const angleFrom = (angle, to) => Math.abs(((angle - to + 540) % 360) - 180);
const others = CAST_IDS.filter((id) => !["bilal", "ines", "sam"].includes(id));
let castIndex = 0;
treeNodes.forEach((node, index) => {
  const chainSlot = CHAIN.indexOf(index);
  node.chain = chainSlot >= 0 || index === 0;
  if (node.gen === 0) node.at = ROOT_AT;
  else if (chainSlot >= 0) node.at = TREE_TIMES[chainSlot];
  else
    node.at =
      42.85 +
      (node.gen - 1) * 0.3 +
      (angleFrom(node.angle, BRANCH_ANGLES[CHAIN_BRANCH]) / 180) * 0.95;
  node.person =
    node.gen === 0
      ? null
      : chainSlot >= 0
        ? ["bilal", "ines", "sam"][chainSlot]
        : others[castIndex++ % others.length];
  node.size = genSize[node.gen];
  node.el = el("div", node.gen === 0 ? "node root" : "node", $("#tree-nodes"));
  if (node.person) node.el.innerHTML = face(node.person);
  if (node.chain && node.gen > 0) {
    node.halo = el("span", "halo", node.el);
    node.label = el("div", "node-name", $("#tree-nodes"), CAST[node.person]);
  }
  if (node.parent != null) {
    node.line = svgEl("line", { "stroke-linecap": "round" }, $("#tree-lines"));
    node.spark = svgEl("circle", { r: 5, fill: "#e8775a" }, $("#tree-lines"));
    // Bilal's line from the root draws once the root is there.
    node.drawAt =
      index === chainBilal ? [ROOT_AT + 0.05, ROOT_AT + 0.4] : [node.at - 0.3, node.at + 0.05];
  }
});
// Sam's arrival rings out once.
const samRing = svgEl("circle", { fill: "none", stroke: "#e8775a" }, $("#tree-lines"));
// The two shots of the same tree: three people close up, then everyone.
const SMALL_TREE = { x: 1450, y: 540, zoom: 2.3, size: 120 };
const chainCentre = {
  x: (CHAIN_AT.x[0] + CHAIN_AT.x[2]) / 2,
  y: (Math.min(...CHAIN_AT.y) + Math.max(...CHAIN_AT.y)) / 2,
};
const PULL_BACK = [42.0, 43.7],
  NET_ZOOM = 0.98,
  VOUCH_HIGHLIGHT = 42.9,
  TREE_OUT = 47.3;
// Close up, the camera creeps in; wide, it settles back.
const smallZoomAt = (t) =>
  SMALL_TREE.zoom *
  (1 + 0.012 * clamp(t - TREE_TIMES[0], 0, PULL_BACK[0] - TREE_TIMES[0]));
const PULL_FROM = smallZoomAt(PULL_BACK[0]);
// The pull-back is a pure zoom about the one point both framings put in the
// same place on screen, so every face travels in a straight line.
const PIVOT = {
  x:
    (NET.x - SMALL_TREE.x + chainCentre.x * PULL_FROM) / (PULL_FROM - NET_ZOOM),
  y:
    (NET.y - SMALL_TREE.y + chainCentre.y * PULL_FROM) / (PULL_FROM - NET_ZOOM),
};
function treeCam(t) {
  const smallZoom = smallZoomAt(t);
  if (t < PULL_BACK[0])
    return {
      e: 0,
      zoom: smallZoom,
      smallZoom,
      focusX: chainCentre.x,
      focusY: chainCentre.y,
      anchorX: SMALL_TREE.x,
      anchorY: SMALL_TREE.y,
    };
  if (t >= PULL_BACK[1]) {
    const zoom = NET_ZOOM * (1 - 0.006 * (t - PULL_BACK[1]));
    return { e: 1, zoom, smallZoom, focusX: 0, focusY: 0, anchorX: NET.x, anchorY: NET.y };
  }
  const e = eInOut(prog(t, ...PULL_BACK));
  return {
    e,
    zoom: Math.exp(lerp(Math.log(PULL_FROM), Math.log(NET_ZOOM), e)),
    smallZoom,
    focusX: PIVOT.x,
    focusY: PIVOT.y,
    anchorX: NET.x + PIVOT.x * NET_ZOOM,
    anchorY: NET.y + PIVOT.y * NET_ZOOM,
  };
}
function treeLayer(t) {
  const cam = treeCam(t);
  const screenOf = (node) => ({
    x: cam.anchorX + (node.x - cam.focusX) * cam.zoom,
    y: cam.anchorY + (node.y - cam.focusY) * cam.zoom,
  });
  const out = eIn(prog(t, TREE_OUT, TREE_OUT + 0.5));
  const highlight = eInOut(prog(t, VOUCH_HIGHLIGHT, VOUCH_HIGHLIGHT + 0.6));
  // Once everyone is in, the rest steps back a little so the branch reads.
  const quiet = eInOut(prog(t, 45.0, 45.6));
  let rootBeat = 0;
  for (let beatAt = 43; beatAt < TREE_OUT; beatAt += BEAT * 2)
    rootBeat = Math.max(rootBeat, hit(t, beatAt, 8));
  treeNodes.forEach((node) => {
    const at = screenOf(node);
    const pop = eBack(prog(t, node.at, node.at + 0.45));
    // Close up, the three are the same size; wide, sizes follow generation.
    const size =
      node.chain && node.gen > 0
        ? lerp(SMALL_TREE.size * (cam.smallZoom / SMALL_TREE.zoom), node.size * cam.zoom, cam.e)
        : node.size * cam.zoom;
    const scale =
      pop *
      (node.gen === 0 ? 1 + rootBeat * 0.14 : 1) *
      (node.chain && node.gen > 0 ? 1 + highlight * 0.08 : 1);
    node.el.style.width = node.el.style.height = size.toFixed(2) + "px";
    node.el.style.transform = `translate(${(at.x - size / 2).toFixed(2)}px, ${(at.y - size / 2).toFixed(2)}px) scale(${Math.max(0, scale).toFixed(4)})`;
    node.el.style.opacity =
      (t >= node.at ? 1 : 0) * (node.chain ? 1 : lerp(1, 0.45, quiet)) * (1 - out);
    if (node.halo) node.halo.style.opacity = highlight;
    if (node.label) {
      const labelIn = eOut5(prog(t, node.at + 0.15, node.at + 0.6));
      const fontSize = lerp(26, 18, cam.e);
      node.label.style.fontSize = fontSize.toFixed(2) + "px";
      const labelWidth = node.label.offsetWidth;
      node.label.style.transform = `translate(${(at.x - labelWidth / 2).toFixed(2)}px, ${(at.y + (size / 2) * scale + lerp(14, 8, cam.e) + (1 - labelIn) * 10).toFixed(2)}px)`;
      node.label.style.opacity = labelIn * (1 - out) * lerp(1, 0.85, cam.e);
    }
    if (node.line) {
      const parent = treeNodes[node.parent],
        from = screenOf(parent),
        draw = eInOut(prog(t, ...node.drawAt));
      const tipX = lerp(from.x, at.x, draw),
        tipY = lerp(from.y, at.y, draw);
      node.line.setAttribute("x1", from.x.toFixed(2));
      node.line.setAttribute("y1", from.y.toFixed(2));
      node.line.setAttribute("x2", tipX.toFixed(2));
      node.line.setAttribute("y2", tipY.toFixed(2));
      const tint = node.chain ? highlight : 0;
      node.line.setAttribute("stroke", mixRgb(CREAM_RGB, CORAL_RGB, tint));
      node.line.setAttribute(
        "stroke-width",
        node.chain ? lerp(lerp(3, 1.6, cam.e), 3.5, highlight) : 1.6,
      );
      node.line.setAttribute(
        "opacity",
        ((node.chain
          ? lerp(lerp(0.5, 0.3, cam.e), 0.9, highlight)
          : lerp(0.18, 0.1, quiet)) *
          (draw > 0 ? 1 : 0) *
          (1 - out)).toFixed(3),
      );
      node.spark.setAttribute("cx", tipX.toFixed(2));
      node.spark.setAttribute("cy", tipY.toFixed(2));
      node.spark.setAttribute("r", lerp(7, 5, cam.e).toFixed(2));
      node.spark.setAttribute("opacity", draw > 0 && draw < 1 ? 0.9 : 0);
    }
  });
  const sam = screenOf(treeNodes[chainSam]),
    ringP = eOut(prog(t, TREE_TIMES[2], TREE_TIMES[2] + 0.8));
  samRing.setAttribute("cx", sam.x.toFixed(2));
  samRing.setAttribute("cy", sam.y.toFixed(2));
  samRing.setAttribute("r", (SMALL_TREE.size / 2 + 6 + 40 * ringP).toFixed(2));
  samRing.setAttribute("stroke-width", (1 + 4 * (1 - ringP)).toFixed(2));
  samRing.setAttribute(
    "opacity",
    t >= TREE_TIMES[2] && ringP < 1 ? (0.8 * (1 - ringP)).toFixed(3) : 0,
  );
}
function network(t) {
  type(HEADS.network.words, t, HEADS.network.inAt, 47.25 - 0.42, 0.15, 0.85);
}

/* ── End: the name, the slogan, how to get in ─────────────────────────── */
function lockup(t, at, word, chars, sloganWords) {
  const track = eOut5(prog(t, at, at + 2.2));
  word.style.letterSpacing = `${lerp(0.09, -0.012, track)}em`;
  const w = word.offsetWidth || 1100;
  word.style.left = (1920 - w) / 2 + "px";
  chars.forEach((c, i) => {
    const s = at + 0.05 + i * 0.045;
    const p = eOut5(prog(t, s, s + 1.0));
    c.style.transform = `translateY(${(1 - p) * 110}%)`;
    c.style.opacity = p <= 0 ? 0 : 1;
  });
  type(sloganWords, t, at + 0.9, null, 0.05, 0.8);
}
const END = { name: 48.2, cta: 50.4, url: 51.3, credit: 52.0 };
const endChars = wordmark($("#end-word")),
  endSlogan = masked($("#end-slogan")),
  endCta = masked($("#end-cta"));
function end(t) {
  lockup(t, END.name, $("#end-word"), endChars, endSlogan);
  type(endCta, t, END.cta, null, 0.05, 0.8);
  const url = eOut5(prog(t, END.url, END.url + 0.8));
  $("#end-url").style.opacity = url;
  $("#end-url").style.transform = `translateY(${(1 - url) * 14}px)`;
  $("#credit").style.opacity = eOut(prog(t, END.credit, END.credit + 0.8));
}

const RENDER = {
  open,
  invite,
  portal,
  welcome,
  profile,
  weight,
  forward,
  network,
  end,
};
const LAYER_RENDER = { "profile-layer": profileLayer, "tree-layer": treeLayer };

/* Moments the score plays to, read by vouch.score.js. */
window.CUES = {
  duration: DURATION,
  lines: [...ORDER.slice(0, -1).map((scene) => HEADS[scene].inAt), END.cta],
  pops: openFaces.map((f) => +f.at.toFixed(3)),
  note: [INVITE.typeStart, INVITE.typeEnd],
  send: INVITE.send,
  sent: INVITE.sent,
  hands: HANDS,
  portal: [THROUGH, PULSE],
  checks: WELCOME.checks,
  bloom: PROFILE.bloom,
  tick: PROFILE.tick,
  mutuals: PROFILE.mutuals,
  weight: WEIGHT.ring,
  forwardNote: [FORWARD.typeStart, FORWARD.typeEnd],
  forwardSend: FORWARD.send,
  forwardSent: FORWARD.sent,
  treeNodes: TREE_TIMES,
  handoff: S.network[0],
  netPops: treeNodes
    .filter((node) => !node.chain || node.gen === 0)
    .map((node) => +node.at.toFixed(3))
    .sort((earlier, later) => earlier - later),
  vouchHighlight: VOUCH_HIGHLIGHT,
  names: [END.name],
  cta: END.cta,
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
  Object.entries(LAYERS).forEach(([id, [a, b]]) => {
    const on = t >= a && t < b;
    document.getElementById(id).style.display = on ? "block" : "none";
    if (on) LAYER_RENDER[id](t);
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
