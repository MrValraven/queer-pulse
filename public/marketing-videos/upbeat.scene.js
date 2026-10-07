/**
 * QueerPulse launch film (upbeat): the picture.
 *
 * Builds upbeat.html's scenes and exposes the render contract the CLI
 * (scripts/launch-video/render.mjs) and the admin renderer both drive:
 * window.seek(t), window.ready(), window.DURATION and window.CUES, plus the
 * optional window.CAPTURE / window.SHUTTER hints. Kept out of the HTML because
 * the site's Content-Security-Policy allows no inline scripts.
 */
/* ── Timing: 120 BPM, a beat is 0.5s and a bar 2s; every cut is on a downbeat. */
const BEAT = 0.5,
  BAR = 2;
const DURATION = 24 * BAR; // 48s
const AV = "./avatars/";
const S = {
  hook: [0, 4],
  gap: [4, 8],
  drop: [8, 12],
  feat: [12, 24],
  net: [24, 28],
  promise: [28, 32],
  city: [32, 36],
  belong: [36, 40],
  end: [40, DURATION],
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
const hit = (t, at, k = 7) => (t < at ? 0 : Math.exp(-(t - at) * k));
const TICK =
  '<span class="tick"><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17 19 7.5"/></svg></span>';
const CAST = [
  "ines",
  "bilal",
  "kai",
  "amara",
  "daniel",
  "priya",
  "jordan",
  "monica",
  "harjit",
  "sofia",
  "tomas",
  "yuki",
  "chidi",
  "philippine",
  "noor",
  "rafael",
  "lucia",
  "anika",
  "sam",
  "joana",
  "leo",
  "grace",
  "mateo",
  "eva",
];

/* A word slams in on its beat: big, then springs to size. */
function slam(node, t, at, from = 1.45, rot = 0) {
  const x = prog(t, at, at + 0.4);
  node.style.opacity = t < at ? 0 : Math.min(1, (t - at) / 0.05);
  node.style.transform = `scale(${lerp(from, 1, spring(x))}) rotate(${rot * (1 - spring(x))}deg)`;
}
/* Something pops out of nothing with a springy overshoot. */
function popScale(t, at, dur = 0.45) {
  return spring(prog(t, at, at + dur));
}
/* A short scale punch on a beat. */
const punch = (t, beats, k = 9, amt = 0.04) =>
  1 + beats.reduce((m, b) => Math.max(m, hit(t, b, k)), 0) * amt;
const beatsIn = (a, b, step = BEAT) => {
  const r = [];
  for (let x = a; x < b - 1e-6; x += step) r.push(x);
  return r;
};

/* Scene entrance punch: content starts slightly large and settles. */
function enter(node, t, at) {
  node.style.transform = `scale(${1 + 0.06 * (1 - eOut5(prog(t, at, at + 0.3)))})`;
}

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
const sticker = (ic, text, parent, cls = "sticker") =>
  el(
    "div",
    cls,
    parent,
    `<span class="dot"><svg viewBox="0 0 24 24">${ICON[ic]}</svg></span>${text}`,
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

/* Confetti in brand shapes: dots, pills and rings, with simple gravity. */
function makeConfetti(parent, seed, n = 46) {
  const r = rng(seed),
    COLS = ["#e8775a", "#9be0bd", "#e8b44a", "#cdbdf2", "#f7f3ee"];
  return Array.from({ length: n }, (_, i) => {
    const kind = i % 3,
      size = 14 + r() * 22,
      col = COLS[i % COLS.length];
    const node = el("div", "confetti", parent);
    node.style.width = (kind === 1 ? size * 2.2 : size) + "px";
    node.style.height = size + "px";
    node.style.borderRadius = "999px";
    if (kind === 2) {
      node.style.border = `5px solid ${col}`;
    } else node.style.background = col;
    const ang = r() * Math.PI * 2,
      sp = 700 + r() * 900;
    return {
      node,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 500,
      spin: (r() - 0.5) * 900,
      delay: r() * 0.08,
      size,
    };
  });
}
function drawConfetti(list, t, at) {
  list.forEach((c) => {
    const lt = t - at - c.delay;
    if (lt < 0) {
      c.node.style.opacity = 0;
      return;
    }
    const drag = 1 - Math.exp(-lt * 2.2); // air resistance: fast burst, slow fall
    const x = 960 + (c.vx / 2.2) * drag;
    const y = 540 + (c.vy / 2.2) * drag + 260 * lt * lt;
    c.node.style.opacity = 1 - prog(lt, 3.2, 4.2);
    c.node.style.transform = `translate(${x}px, ${y}px) rotate(${c.spin * lt}deg)`;
  });
}

/* ── Hook ──────────────────────────────────────────────────────────────── */
const hookWords = $$("#hook .w");
const HOOK_AT = [0.0, 0.5, 1.0, 1.25];
const r1 = rng(11);
// Faces pop up all around the words, "everywhere" made literal: in a band
// above the type, a band below it, and down both sides. Never on the words.
const HOOK_SPOTS = [
  [230, 170],
  [1690, 190],
  [560, 120],
  [1360, 130],
  [130, 520],
  [1790, 540],
  [880, 140],
  [420, 930],
  [1500, 920],
  [1100, 960],
  [240, 800],
  [1680, 820],
  [760, 950],
  [1180, 110],
  [110, 330],
  [1810, 330],
];
const hookAvs = HOOK_SPOTS.map(([x, y], i) => {
  const size = 84 + r1() * 40;
  const node = el("div", "pop-av", $("#hook-avs"), av(CAST[i], size));
  node.style.width = node.style.height = size + "px";
  return {
    node,
    size,
    x,
    y,
    at: 2.0 + i * 0.125,
    rot: (r1() - 0.5) * 24,
  };
});
function hook(t) {
  const flip = t >= 2.0;
  $("#hook").style.background = flip ? "var(--coral)" : "var(--plum)";
  $("#hook-type").style.color = flip ? "var(--plum)" : "var(--cream)";
  $("#hook-type em").style.color = flip ? "var(--cream)" : "var(--coral)";
  hookWords.forEach((w, i) => slam(w, t, HOOK_AT[i], 1.5, i % 2 ? 4 : -4));
  const type = $("#hook-type");
  type.style.transform = `scale(${punch(t, [2.0, 2.5, 3.0, 3.5], 10, 0.035) * (1 - eIn(prog(t, 3.75, 4.0)) * 0.12)})`;
  type.style.opacity = 1 - prog(t, 3.85, 4.0);
  hookAvs.forEach((a) => {
    const s = popScale(t, a.at, 0.5);
    a.node.style.opacity = t >= a.at ? 1 - prog(t, 3.85, 4.0) : 0;
    a.node.style.transform = `translate(${a.x - a.size / 2}px, ${a.y - a.size / 2 + Math.sin(t * 3 + a.at * 7) * 8}px) scale(${s}) rotate(${a.rot}deg)`;
  });
}

/* ── Gap ───────────────────────────────────────────────────────────────── */
const gapA = $$("#gap-a .w"),
  gapB = $$("#gap-b .w");
const FRAGS = [
  ["chat", "Group chat · 214 unread", 150, 140, -6, "l"],
  ["poster", "A poster on Rua dos Anjos", 1180, 120, 5, "r"],
  ["person", "A friend of a friend", 120, 820, 4, "l"],
  ["clock", "A story, gone in 24 hours", 1230, 830, -5, "r"],
  ["pin", "“Someone said Thursday?”", 680, 60, -3, "t"],
  ["chat", "Three group chats deep", 700, 920, 6, "b"],
];
const pills = FRAGS.map(([ic, text, x, y, rot, from], i) => ({
  x,
  y,
  rot,
  from,
  at: 5.0 + i * 0.25,
  node: sticker(ic, text, $("#gap-pills")),
}));
function gap(t) {
  enter($("#gap"), t, 4.0);
  [4.0, 4.25, 4.5].forEach((at, i) =>
    slam(gapA[i], t, at, 1.5, i % 2 ? 3 : -3),
  );
  const aOut = eIn(prog(t, 6.1, 6.3));
  $("#gap-a").style.opacity = 1 - aOut;
  $("#gap-a").style.transform = `scale(${1 - aOut * 0.2})`;
  [6.25, 6.375, 6.5, 6.625, 6.75].forEach((at, i) =>
    slam(gapB[i], t, at, 1.4, i % 2 ? 3 : -3),
  );
  // Everything is pulled into the middle, then a plum circle opens the drop.
  const suck = eIn(prog(t, 7.0, 7.75));
  $("#gap-b").style.transform = `scale(${1 - suck * 0.85})`;
  $("#gap-b").style.opacity = 1 - prog(t, 7.55, 7.75);
  pills.forEach((p) => {
    const s = popScale(t, p.at, 0.55);
    const off = { l: [-700, 0], r: [700, 0], t: [0, -400], b: [0, 400] }[
      p.from
    ];
    const w = p.node.offsetWidth || 380;
    const bx = p.x + off[0] * (1 - eOut5(prog(t, p.at, p.at + 0.4))),
      by = p.y + off[1] * (1 - eOut5(prog(t, p.at, p.at + 0.4)));
    const x = lerp(bx, 960 - w / 2, suck),
      y = lerp(by + Math.sin(t * 2.6 + p.at) * 6, 510, suck);
    p.node.style.opacity = t >= p.at ? 1 - prog(t, 7.5, 7.75) : 0;
    p.node.style.transform = `translate(${x}px, ${y}px) rotate(${p.rot * (1 - suck)}deg) scale(${(0.6 + 0.4 * s) * (1 - suck * 0.8)})`;
  });
  const iris = $("#gap-iris"),
    rad = eIn(prog(t, 7.7, 8.0)) * 1200;
  iris.style.width = iris.style.height = rad * 2 + "px";
  iris.style.margin = `${-rad}px 0 0 ${-rad}px`;
}

/* ── Drop: the name lands on the first drop ───────────────────────────── */
const dropChars = wordmark($("#drop-word")),
  dropConf = makeConfetti($("#drop-confetti"), 5);
function lockup(t, at, word, chars, ring, slogan, conf) {
  const w = word.offsetWidth || 1100;
  word.style.left = (1920 - w) / 2 + "px";
  chars.forEach((c, i) => {
    const s = popScale(t, at + 0.1 + i * 0.035, 0.5);
    c.style.opacity = t >= at + 0.1 + i * 0.035 ? 1 : 0;
    c.style.transform = `translateY(${(1 - s) * 60}px) scale(${0.5 + 0.5 * s})`;
  });
  word.style.transform = `scale(${punch(t, beatsIn(at + 1, at + 4), 9, 0.018)})`;
  const rx = eOut(prog(t, at, at + 0.9)),
    rr = 40 + rx * 1000;
  ring.style.width = ring.style.height = rr * 2 + "px";
  ring.style.margin = `${-rr}px 0 0 ${-rr}px`;
  ring.style.opacity = 1 - rx;
  ring.style.borderWidth = 26 * (1 - rx) + 2 + "px";
  const sl = popScale(t, at + 0.6, 0.5);
  slogan.style.opacity = t >= at + 0.6 ? 1 : 0;
  slogan.style.transform = `translateY(${(1 - sl) * 30}px)`;
  drawConfetti(conf, t, at);
}
function drop(t) {
  lockup(
    t,
    8.0,
    $("#drop-word"),
    dropChars,
    $("#drop-ring"),
    $("#drop-slogan"),
    dropConf,
  );
  const out = eIn(prog(t, 11.75, 12.0));
  $("#drop .lock").style.opacity = 1 - out;
  $("#drop-slogan").style.opacity = (t >= 8.6 ? 1 : 0) * (1 - out);
  $("#drop").style.transform = `scale(${1 - out * 0.08})`;
}

/* ── Features: one bar each, a colour per feature ─────────────────────── */
const LOCK =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
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
    <div class="tile" style="margin-top: 16px; padding: 22px 24px" data-a="0.5"><div class="row">${av("bilal", 56)}<div class="col" style="flex: 1"><div class="name">Bilal Kaya</div><div class="meta s">Sound designer · he/him</div></div>${TICK}</div><p class="sub" style="margin-top: 16px; font-size: 25px; line-height: 1.35; color: var(--ink)">“Inês ran the movement workshop at the Pride picnic. Everyone left calmer.”</p></div>
    <div class="foot">
      <div class="label" data-a="1.0">You both know</div>
      <div class="row" style="margin-top: 16px" data-a="1.1"><span class="stack">${av("kai", 48, ring())}${av("priya", 48, ring() + "; margin-left: -12px")}${av("yuki", 48, ring() + "; margin-left: -12px")}</span><span class="meta">Kai, Priya and Yuki</span></div>
    </div>
  </div>`,
  // Gathering: who is going fills in, then you join them.
  () => `<div class="card">
    <div class="row" style="gap: 24px; align-items: flex-start"><div class="date"><b>THU</b><span>19:00</span></div><div class="col" style="gap: 8px; padding-top: 6px"><div class="ttl">Queer Book Club</div><div class="sub">“Stone Butch Blues”</div></div></div>
    <div class="row meta" style="margin-top: 28px; gap: 10px">${PIN}Mouraria Community Centre</div>
    <p class="txt" style="margin-top: 16px; font-size: 22px; color: rgba(26, 26, 31, 0.72)">Chapter ten to the end. Come whether you’ve finished or fallen behind.</p>
    <div class="row" style="margin-top: 20px; gap: 10px"><span class="tag">Step-free</span><span class="tag">Sober</span><span class="tag">Tea from 18:45</span></div>
    <div class="foot">
      <div class="hr" style="margin-top: 0"></div>
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div class="col" style="gap: 12px"><span class="stack">${stackOf(["priya", "kai", "amara", "tomas", "grace", "leo", "noor"], 52, 0.35)}<span class="more" data-a="1.05" data-pop style="margin-left: -14px">+12</span></span><span class="meta s" data-a="1.15">Priya, Kai and 17 others are going</span></div>
        <div style="position: relative; height: 60px; width: 196px"><span class="btn coral" data-btn-a style="position: absolute; right: 0; top: 0">Join them</span><span class="btn jadeb" data-btn-b style="position: absolute; right: 0; top: 0">You’re going</span></div>
      </div>
    </div>
  </div>`,
  // Messages: a private conversation, end-to-end encrypted.
  () => `<div class="card flush">
    <div class="row" style="padding: 28px 40px; border-bottom: 1px solid var(--line)">${av("chidi", 60)}<div class="col" style="gap: 4px"><div class="name">Chidi Okafor</div><div class="row" style="gap: 6px; font-size: 17px; font-weight: 650; color: var(--jade-ink)">${LOCK}End-to-end encrypted</div></div></div>
    <div class="thread">
      <div class="bubble them">The book club moved to Mouraria this month.</div>
      <div class="bubble them" data-a="0.25">Are you coming on Thursday?</div>
      <div class="bubble me" data-a="0.8">Wouldn’t miss it. Save me a seat?</div>
      <div style="position: relative; justify-self: start"><div class="bubble them" data-a="1.7">Already did.</div><span class="dots" data-typing style="position: absolute; left: 0; top: 0"><i></i><i></i><i></i></span></div>
    </div>
    <div class="composer"><div class="field">Message Chidi</div><span class="send">${SEND}</span></div>
  </div>`,
  // Safe space: a venue our team has visited, with the details that matter.
  () => `<div class="card flush">
    <svg class="art" viewBox="0 0 760 220" style="background: var(--map)">
      <path d="M-10 168 C 140 132, 250 190, 380 146 S 640 78, 780 110" stroke="#fff" stroke-width="18" fill="none"/>
      <path d="M230 -10 L 300 230 M 540 -10 C 505 90, 575 150, 520 230" stroke="#fff" stroke-width="11" fill="none"/>
      <path d="M-10 64 L 780 30" stroke="#fff" stroke-width="8" fill="none"/>
      <circle cx="380" cy="104" r="42" fill="rgba(232,119,90,.2)"/><circle cx="380" cy="104" r="15" fill="#e8775a"/><circle cx="380" cy="104" r="5.5" fill="#fff"/>
    </svg>
    <div class="body">
      <div class="ttl">Café Norte</div><div class="meta" style="margin-top: 6px">Intendente · café and bar</div>
      <div style="display: grid; gap: 14px; margin-top: 28px">
        <div class="row" data-a="0.4">${TICK}<span class="txt">Step-free entrance</span></div>
        <div class="row" data-a="0.55">${TICK}<span class="txt">All-gender toilets</span></div>
        <div class="row" data-a="0.7">${TICK}<span class="txt">Staff who get pronouns right</span></div>
      </div>
      <div class="foot row meta s" style="gap: 12px" data-a="1.2"><span class="stack">${av("noor", 40, ring())}${av("sam", 40, ring() + "; margin-left: -10px")}</span>Checked in person by Noor and Sam</div>
    </div>
    <div class="stamp" data-stamp><svg viewBox="0 0 24 24"><polyline points="5 12.5 10 17 19 7.5"/></svg><span>Visited<br />in person</span></div>
  </div>`,
  // Forum: a hard question, answered by people who have done it.
  () => `<div class="card">
    <div class="row" style="justify-content: space-between"><span class="tag">Legal &amp; documents</span><span class="meta s"><span data-count>0</span> replies</span></div>
    <div class="ttl sm" style="margin-top: 24px">Legal name change in Portugal: sharing experiences and tips</div>
    <div class="row meta s" style="margin-top: 16px; gap: 12px">${av("yuki", 36)}Asked by Yuki</div>
    <div class="hr"></div>
    <div style="display: grid; gap: 30px">
      <div class="reply" data-a="0.4">${av("noor", 48)}<div><div class="who">Noor</div><p>I did mine last spring. Here’s the order that worked for me.</p></div></div>
      <div class="reply" data-a="0.85">${av("sam", 48)}<div><div class="who">Sam</div><p>Bring two copies of everything.</p></div></div>
      <div class="reply" data-a="1.3">${av("mateo", 48)}<div><div class="who">Mateo</div><p>Happy to come with you to the Conservatória.</p></div></div>
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
      <div class="ttl sm">A bright room in a three-person flat</div>
      <div class="meta" style="margin-top: 6px">Arroios</div>
      <div class="tile row" style="margin-top: 24px; gap: 18px"><span class="stack">${stackOf(["lucia", "tomas", "eva"], 52, 0.35)}</span><div class="col" data-a="0.8"><div class="name" style="font-size: 22px">Lucía, Tomás and Eva</div><div class="meta s">Vouched by 3 members</div></div></div>
      <div class="foot row" style="justify-content: space-between" data-a="1.2"><span class="tag jade">${TICK}LGBTQ+-affirming household</span><span class="btn coral">Say hello</span></div>
    </div>
  </div>`,
];
const FEATS = [
  {
    word: "VOUCH",
    label: "Vouches",
    head: "Come in <em>through a friend.</em>",
    bg: "var(--coral)",
    ink: "var(--plum)",
    em: "var(--cream)",
  },
  {
    word: "GATHER",
    label: "Gatherings",
    head: "See who’s <em>going.</em>",
    bg: "var(--jade)",
    ink: "var(--cream)",
    em: "var(--plum)",
  },
  {
    word: "CHAT",
    label: "Messages",
    head: "Talk <em>in private.</em>",
    bg: "var(--plum)",
    ink: "var(--cream)",
    em: "var(--coral)",
  },
  {
    word: "EXPLORE",
    label: "Safe spaces",
    head: "Go where it’s <em>safe.</em>",
    bg: "var(--amber)",
    ink: "var(--plum)",
    em: "var(--plum)",
  },
  {
    word: "ASK",
    label: "Forum",
    head: "Ask <em>anything.</em>",
    bg: "var(--lilac)",
    ink: "var(--plum)",
    em: "var(--coral-ink)",
  },
  {
    word: "MOVE IN",
    label: "Housing",
    head: "Find <em>your flatmates.</em>",
    bg: "var(--cream)",
    ink: "var(--plum)",
    em: "var(--coral-ink)",
  },
];
FEATS.forEach((f, i) => {
  f.mq = el(
    "div",
    "marquee",
    $("#feat-marquees"),
    Array(6).fill(f.word).join("&nbsp;&nbsp;"),
  );
  f.mq.style.webkitTextStroke = `3px ${f.ink}`; // outline only: the fill stays transparent
  f.h = el(
    "div",
    "fhead kin",
    $("#feat-heads"),
    f.head.replace(/<em>/, "<br /><em>"),
  );
  f.num = el("div", "fnum", $("#feat-heads"), `0${i + 1} · ${f.label}`);
  splitWords(f.h);
  f.words = $$(".w", f.h);
  f.dot = el("i", "", $("#feat-dots"));
  f.v = el("div", "vig", $("#feat-cards"), VIG[i]());
  f.anims = $$("[data-a]", f.v).map((n) => ({
    n,
    at: Math.min(1.35, parseFloat(n.dataset.a) * 0.7 + 0.12),
    pop: n.hasAttribute("data-pop"),
  }));
});
function splitWords(root) {
  [...root.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
        else el("span", "w", frag, part);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName === "EM") n.classList.add("w");
  });
}
function cardPop(node, t, at, isPop) {
  const s = popScale(t, at, isPop ? 0.4 : 0.45);
  node.style.opacity = t >= at ? Math.min(1, (t - at) / 0.08) : 0;
  node.style.transform = isPop
    ? `scale(${0.4 + 0.6 * s})`
    : `translateY(${(1 - s) * 24}px)`;
}
function feat(t) {
  const lt = t - S.feat[0],
    cur = clamp(Math.floor(lt / BAR), 0, FEATS.length - 1),
    f0 = FEATS[cur];
  $("#feat-bg").style.background = f0.bg;
  $("#feat").style.color = f0.ink;
  FEATS.forEach((f, i) => {
    const s = i * BAR,
      e = s + BAR,
      on = i === cur;
    const lx = lt - s;
    f.mq.style.display =
      f.h.style.display =
      f.num.style.display =
        on ? "block" : "none";
    f.dot.className = i <= cur ? "on" : "";
    if (on) {
      f.mq.style.transform = `translateX(${-lx * 260 - 80}px) rotate(-4deg)`;
      f.words.forEach((w, k) => {
        slam(w, t, S.feat[0] + s + k * 0.125, 1.4, k % 2 ? 3 : -3);
        w.style.color = w.tagName === "EM" ? f.em : f.ink;
      });
      f.num.style.opacity = eOut(prog(lx, 0, 0.2));
      f.h.style.transform = `scale(${punch(t, [S.feat[0] + s + 1.0], 9, 0.03)})`;
    }
    // The card springs up from below at a tilt and is flung away on the next downbeat.
    const inS = spring(prog(lx, 0, 0.6)),
      outX =
        i === FEATS.length - 1
          ? eIn(prog(lx, 1.8, 2.0))
          : eIn(prog(lx, 1.82, 2.0));
    f.v.style.display = lx > -0.02 && lx < BAR ? "block" : "none";
    f.v.style.transform = `translate(${outX * -60}px, ${(1 - inS) * 760 - outX * 1000}px) rotate(${lerp(9, -2.5, inS) - outX * 10}deg)`;
    f.anims.forEach(({ n, at, pop }) => cardPop(n, lx, at, pop));
  });
  // Feature-specific beats, re-timed for a two-second bar.
  const v = (i) => FEATS[i].v,
    lxOf = (i) => lt - i * BAR;
  {
    const lx = lxOf(1),
      flip = lx > 1.3;
    const a = $("[data-btn-a]", v(1)),
      b = $("[data-btn-b]", v(1));
    a.style.opacity = flip ? 0 : 1;
    b.style.opacity = flip ? 1 : 0;
    b.style.transform = `scale(${0.85 + 0.15 * popScale(lx, 1.3, 0.4)})`;
  }
  {
    const lx = lxOf(2),
      ty = $("[data-typing]", v(2));
    ty.style.opacity = lx > 0.85 && lx < 1.18 ? 1 : 0;
    $$(".dots i", ty).forEach((d, k) => {
      d.style.transform = `translateY(${-Math.max(0, Math.sin(lx * 12 - k * 0.9)) * 6}px)`;
    });
  }
  {
    const lx = lxOf(3),
      st = $("[data-stamp]", v(3));
    st.style.opacity = lx > 0.7 ? 1 : 0;
    st.style.transform = `scale(${popScale(lx, 0.7, 0.5)})`;
  }
  {
    const lx = lxOf(4);
    $("[data-count]", v(4)).textContent = String(
      [0.4, 0.72, 1.03].filter((a) => lx >= a).length,
    );
  }
}

/* ── Network: faces burst out of one point ────────────────────────────── */
const NC = { x: 1360, y: 560 },
  r5 = rng(42);
const rings = [
  [6, 185],
  [10, 330],
  [8, 460],
];
const netAvs = [],
  netLines = [];
let k5 = 0;
rings.forEach(([n, rad], ri) => {
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + ri * 0.35 + (r5() - 0.5) * 0.15;
    const size = [96, 78, 64][ri];
    const node = el(
      "div",
      "pop-av",
      $("#net-avs"),
      av(CAST[k5 % CAST.length], size),
    );
    node.style.width = node.style.height = size + "px";
    const a = {
      node,
      size,
      x: NC.x + Math.cos(ang) * rad,
      y: NC.y + Math.sin(ang) * rad * 0.8,
      at: 24.25 + k5 * 0.0625,
      ang,
    };
    netAvs.push(a);
    netLines.push(
      svgEl(
        "line",
        {
          x1: NC.x,
          y1: NC.y,
          x2: a.x,
          y2: a.y,
          stroke: "#2d1b3d",
          "stroke-width": 2.5,
          opacity: 0.18,
          "stroke-linecap": "round",
        },
        $("#net-lines"),
      ),
    );
    k5++;
  }
});
const netCore = svgEl(
  "circle",
  { cx: NC.x, cy: NC.y, r: 34, fill: "#e8775a" },
  $("#net-lines"),
);
const netWords = $$("#net .w");
function net(t) {
  enter($("#net"), t, 24.0);
  [24.0, 24.25, 24.5, 24.75].forEach((at, i) =>
    slam(netWords[i], t, at, 1.4, i % 2 ? 3 : -3),
  );
  netCore.setAttribute(
    "r",
    (34 * popScale(t, 24.0, 0.5) * punch(t, beatsIn(24, 28), 8, 0.18)).toFixed(
      2,
    ),
  );
  netAvs.forEach((a, i) => {
    const s = popScale(t, a.at, 0.55);
    const wave =
      1 + hit(t, 26.0 + ((a.ang / (Math.PI * 2) + 1) % 1) * 1.5, 7) * 0.14; // a bounce travels around the rings
    const x = lerp(NC.x, a.x, s),
      y = lerp(NC.y, a.y, s);
    a.node.style.opacity = t >= a.at ? 1 : 0;
    a.node.style.transform = `translate(${x - a.size / 2}px, ${y - a.size / 2}px) scale(${Math.max(0, s) * wave})`;
    netLines[i].setAttribute("x2", x);
    netLines[i].setAttribute("y2", y);
    netLines[i].setAttribute("opacity", t >= a.at ? 0.18 : 0);
  });
}

/* ── Promise: marquee bands and the five promises ──────────────────────── */
$("#band-a-text").textContent = "No ads · No algorithm · ".repeat(8);
$("#band-b-text").textContent = "No ads · No algorithm · ".repeat(8);
const PROMISES = [
  ["users", "Communities and collectives"],
  ["checkSquare", "Run by its members"],
  ["eyeOff", "You choose who sees what"],
  ["image", "Queer art front and center"],
  ["award", "Stories of queer changemakers"],
];
/* Two centred rows under the headline: the first three promises on top and
   the last two below, each row its own flex line so the split never reflows.
   The bottom row tilts gently so its corners stay clear of the row above. */
const promiseRows = [0, 1].map(() => el("div", "row", $("#promise-pills")));
const promisePills = PROMISES.map(([ic, h], i) => ({
  node: sticker(ic, h, promiseRows[i < 3 ? 0 : 1]),
  at: 29.5 + i * 0.25,
  rot: [-3, 2, -2, -1, 1][i],
}));
const promiseWords = $$("#promise .w");
function promise(t) {
  enter($("#promise"), t, 28.0);
  const lt = t - 28;
  const inA = eOut5(prog(t, 28.0, 28.4)),
    inB = eOut5(prog(t, 28.1, 28.5));
  $("#band-a").style.transform =
    `translateX(${(1 - inA) * -2400}px) rotate(-3deg)`;
  $("#band-b").style.transform =
    `translateX(${(1 - inB) * 2400}px) rotate(2.5deg)`;
  $("#band-a-text").style.transform = `translateX(${-lt * 220}px)`;
  $("#band-b-text").style.transform = `translateX(${-1400 + lt * 220}px)`;
  [28.5, 28.75].forEach((at, i) =>
    slam(promiseWords[i], t, at, 1.5, i ? 4 : -4),
  );
  $("#promise-type").style.transform =
    `scale(${punch(t, beatsIn(30, 32), 9, 0.02)})`;
  promisePills.forEach((p) => {
    const s = popScale(t, p.at, 0.45);
    p.node.style.opacity = t >= p.at ? 1 : 0;
    p.node.style.transform = `scale(${0.3 + 0.7 * s}) rotate(${p.rot}deg) translateY(${Math.sin(t * 3 + p.at * 5) * 4}px)`;
  });
}

/* ── City: neighbourhood stickers, each with its people ────────────────── */
const HOODS = [
  ["Arroios", 290, 430, ["lucia", "tomas"]],
  ["Anjos", 760, 395, ["noor", "harjit"]],
  ["Intendente", 1250, 430, ["joana", "chidi"]],
  ["Mouraria", 1620, 470, ["yuki", "eva"]],
  ["Graça", 470, 650, ["kai", "anika"]],
  ["Alfama", 980, 640, ["monica", "rafael"]],
  ["Príncipe Real", 1440, 690, ["leo", "priya"]],
  ["Cais do Sodré", 300, 860, ["sam", "grace"]],
  ["Marvila", 780, 870, ["philippine", "mateo"]],
  ["Campo de Ourique", 1230, 900, ["daniel", "sofia"]],
];
const r7 = rng(77);
const hoods = HOODS.map(([name, x, y, people], i) => {
  const node = el(
    "div",
    "hood",
    $("#city-hoods"),
    `<span class="stack">${people.map((p) => av(p, 64)).join("")}</span>`,
  );
  node.appendChild(sticker("pin", name, null));
  $(".sticker", node).style.position = "relative";
  return { node, x, y, at: 32.5 + i * 0.125, rot: (r7() - 0.5) * 10 };
});
const cityWords = $$("#city .w");
function city(t) {
  enter($("#city"), t, 32.0);
  [32.0, 32.125, 32.25, 32.5].forEach((at, i) =>
    slam(cityWords[i], t, at, 1.4, i % 2 ? 3 : -3),
  );
  hoods.forEach((h) => {
    const s = popScale(t, h.at, 0.5),
      w = h.node.offsetWidth || 300;
    h.node.style.opacity = t >= h.at ? 1 : 0;
    h.node.style.transform = `translate(${h.x - w / 2}px, ${h.y - 70 + Math.sin(t * 2.4 + h.at * 3) * 7}px) scale(${0.3 + 0.7 * s}) rotate(${h.rot}deg)`;
  });
}

/* ── Belong: the second drop ───────────────────────────────────────────── */
const belongWords = $$("#belong .w");
function belong(t) {
  enter($("#belong"), t, 36.0);
  [36.0, 36.25, 36.5, 36.75, 37.0].forEach((at, i) =>
    slam(belongWords[i], t, at, 1.45, i % 2 ? 4 : -4),
  );
  $("#belong-type").style.transform =
    `scale(${punch(t, beatsIn(38, 39.5), 9, 0.03)})`;
  const iris = $("#belong-iris"),
    rad = eIn(prog(t, 39.65, 40.0)) * 1400;
  iris.style.width = iris.style.height = rad * 2 + "px";
  iris.style.margin = `${-rad}px 0 0 ${-rad}px`;
}

/* ── End: the lockup on the second drop ────────────────────────────────── */
const endChars = wordmark($("#end-word")),
  endConf = makeConfetti($("#end-confetti"), 9, 60);
function end(t) {
  lockup(
    t,
    40.0,
    $("#end-word"),
    endChars,
    $("#end-ring"),
    $("#end-slogan"),
    endConf,
  );
  const cta = popScale(t, 41.2, 0.5);
  $("#end-cta").style.opacity = t >= 41.2 ? 1 : 0;
  $("#end-cta").style.transform =
    `translateY(${(1 - cta) * 30}px) scale(${0.9 + 0.1 * cta})`;
  $("#end-cta .btn").style.transform =
    `scale(${punch(t, [42, 43, 44, 45], 7, 0.04)})`;
  $("#credit").style.opacity = eOut(prog(t, 42.0, 42.6));
}

const RENDER = { hook, gap, drop, feat, net, promise, city, belong, end };

/* Moments the score plays to, read by upbeat.score.js. */
window.CUES = {
  duration: DURATION,
  hookWords: HOOK_AT,
  hookAvs: hookAvs.map((a) => a.at),
  gapWords: [4.0, 4.25, 4.5, 6.25, 6.375, 6.5, 6.625, 6.75],
  pills: pills.map((p) => p.at),
  drops: [8.0, 40.0],
  feats: FEATS.map((_, i) => S.feat[0] + i * BAR),
  cardPops: FEATS.flatMap((f, i) =>
    f.anims.map((a) => S.feat[0] + i * BAR + a.at),
  ).sort((a, b) => a - b),
  netPops: netAvs.map((a) => a.at),
  promisePills: promisePills.map((p) => p.at),
  cityPops: hoods.map((h) => h.at),
  belongWords: [36.0, 36.25, 36.5, 36.75, 37.0],
};

window.seek = function seek(t) {
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
  await document.fonts.load('900 40px "DM Sans"');
  await document.fonts.ready;
  await Promise.all(
    $$("img").map((i) =>
      i.decode().catch(() => console.warn("missing", i.src)),
    ),
  );
  return { duration: DURATION };
};
window.DURATION = DURATION;

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
