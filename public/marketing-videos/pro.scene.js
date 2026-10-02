/**
 * QueerPulse launch film (pro): the picture.
 *
 * Builds pro.html's scenes and exposes the render contract the CLI
 * (scripts/launch-video/render.mjs) and the admin renderer both drive:
 * window.seek(t), window.ready(), window.DURATION and window.CUES, plus the
 * optional window.CAPTURE / window.SHUTTER hints. Kept out of the HTML because
 * the site's Content-Security-Policy allows no inline scripts.
 */
/* ── Timing: 120 BPM, a beat is 0.5s and a bar 2s; cuts fall on bar lines. */
const BEAT = 0.5,
  BAR = 2;
const DURATION = 24 * BAR; // 48s
const AV = "./avatars/";
const S = {
  open: [0, 8],
  reveal: [8, 12],
  "board-scene": [12, 28],
  net: [28, 32],
  promise: [32, 36],
  city: [36, 40],
  belong: [40, 42],
  end: [42, DURATION],
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
  userPlus:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eyeOff:
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
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
// The centre glow swells for the name, both times it lands.
const lockGlow = (t) =>
  Math.max(
    eOut(prog(t, 8.0, 9.2)) * (1 - eIn(prog(t, 11.4, 12.2))),
    eOut(prog(t, 42.0, 43.2)),
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
  $("#glow-c").style.transform = `translate(260px, 90px)`;
  $("#glow-c").style.opacity = lockGlow(t);
  $("#glow-a").style.opacity = 0.6 + 0.4 * g;
  // The HUD rides along while the product is on screen.
  const hud = eOut(prog(t, 12.4, 13.2)) * (1 - eIn(prog(t, 39.4, 39.9)));
  $("#hud").style.opacity = hud;
  $("#hud-fill").style.transform = `scaleX(${t / DURATION})`;
}

/* ── Open: everywhere, never in one place, gathered ────────────────────── */
const openA = masked($("#open-a")),
  openB = masked($("#open-b")),
  openC = masked($("#open-c"));
const FRAGS = [
  ["chat", "Group chat · 214 unread", 300, 200, 1.1],
  ["poster", "A poster on Rua dos Anjos", 1500, 180, 0.8],
  ["person", "A friend of a friend", 250, 880, 0.9],
  ["clock", "A story, gone in 24 hours", 1560, 890, 1.15],
  ["pin", "“Someone said Thursday?”", 900, 112, 0.7],
  ["chat", "Three group chats deep", 900, 968, 1.0],
];
const frags = FRAGS.map(([ic, text, x, y, z], i) => ({
  x,
  y,
  z,
  at: 1.5 + i * 0.22,
  node: chip(ic, text, $("#open-chips")),
}));
function open(t) {
  type(openA, t, 0.5, 3.6);
  type(openB, t, 4.0, 5.7);
  type(openC, t, 6.0, 6.95);
  const gather = eInOut(prog(t, 6.4, 7.5));
  frags.forEach((f) => {
    const w = f.node.offsetWidth || 380,
      h = 68;
    const p = eOut5(prog(t, f.at, f.at + 0.9));
    // Parallax: nearer chips drift faster and spread wider on "never".
    const spread = 1 + eInOut(prog(t, 4.0, 6.0)) * 0.08 * f.z;
    const dx = (f.x - 960) * spread + Math.sin(t * 0.4 + f.at) * 14 * f.z,
      dy =
        (f.y - 540) * spread +
        (1 - p) * 40 +
        Math.cos(t * 0.35 + f.at) * 8 * f.z;
    const x = 960 + dx * (1 - gather),
      y = 540 + dy * (1 - gather);
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
  word.style.left = (1920 - w) / 2 + "px";
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
    rr = 14 + rp * 900;
  const ring = $("#ring");
  ring.style.width = ring.style.height = rr * 2 + "px";
  ring.style.margin = `${-rr}px 0 0 ${-rr}px`;
  ring.style.opacity = (1 - rp) * (t >= 8 ? 1 : 0);
  ring.style.borderWidth = 2 + 10 * (1 - rp) + "px";
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
  ["Vouches", "Come in", "<em>through a friend.</em>"],
  ["Gatherings", "See who’s", "<em>going.</em>"],
  ["Messages", "Talk", "<em>in private.</em>"],
  ["Safe spaces", "Go where", "it’s <em>safe.</em>"],
  ["Forum", "Ask", "<em>anything.</em>"],
  ["Housing", "Find", "<em>your flatmates.</em>"],
];
const GX = 840,
  GY = 720;
// A snake: 0 1 2 along the top, 3 4 5 back along the bottom, so every
// camera move goes to a neighbouring card.
const cardAt = (i) => {
  const row = Math.floor(i / 3),
    col = row ? 2 - (i % 3) : i % 3;
  return { cx: col * GX + 380, cy: row * GY + 320 };
};
const cards = FEATS.map(([label, l1, l2], i) => {
  const node = el("div", "bc", $("#board"), VIG[i]());
  const { cx, cy } = cardAt(i);
  node.style.left = cx - 380 + "px";
  node.style.top = cy - 320 + "px";
  const head = el(
    "div",
    "hl fh",
    $("#board-heads"),
    `<span class="ln">${l1}</span><span class="ln">${l2}</span>`,
  );
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
    words: masked(head),
    focus: 14 + i * BAR,
    build: $$("[data-a]", node).map((n) => ({
      n,
      at: 12.5 + i * 0.12 + parseFloat(n.dataset.a) * 0.4,
      pop: n.hasAttribute("data-pop"),
    })),
    later: $$("[data-f]", node),
  };
});
const boardAll = masked($("#board-all"));
const WIDE = {
  cx: 1220,
  cy: 680,
  sx: 960,
  sy: 590,
  s: 0.52,
  rx: 30,
  ry: 0,
  rz: -10,
  w: 1, // how much the shot shows the whole board, separate from zoom
};
const FAR = { ...WIDE, s: 0.4, rx: 40, rz: -15, sy: 610 };
const LAST = { ...WIDE, sy: 660, s: 0.46, rx: 34 };
const FOCUS = (i) => ({
  ...cardAt(i),
  sx: 1410,
  sy: 540,
  s: 1,
  rx: 2,
  ry: -8,
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
    14 + i * BAR - 0.55,
    14 + i * BAR + 0.45,
    FOCUS(i - 1),
    FOCUS(i),
    true,
  ]);
MOVES.push([25.55, 26.5, FOCUS(5), LAST, false]);
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
  if (t > 26.5) c.s *= 1 + (t - 26.5) * 0.025;
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
  $("#cam").style.opacity = 1 - eIn(prog(t, 27.55, 28.0));
  cards.forEach((k, i) => {
    const d = Math.hypot(c.cx - k.cx, c.cy - k.cy) / GX;
    // Neighbours are a card apart (d = 1): the card you leave and the card
    // you reach cross-fade through the move instead of both going dark.
    const op = lerp(0.06, 1, Math.max(wide, clamp(1 - d * 1.1)));
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
    // Headline and label for the card in focus.
    const out = i === 5 ? 25.4 : k.focus + BAR - 0.65;
    type(k.words, t, k.focus + 0.05, out, 0.06, 0.8);
  });
  const cur = clamp(Math.floor((t - 13.9) / BAR), 0, 5);
  const eb = $("#board-eyebrow");
  eb.innerHTML = `<b>0${cur + 1}</b> / 06 &nbsp;·&nbsp; ${cards[cur].label}`;
  const ebIn = eOut(prog(t, cards[cur].focus - 0.05, cards[cur].focus + 0.35));
  const ebOut =
    cur === 5
      ? eIn(prog(t, 25.3, 25.6))
      : eIn(prog(t, cards[cur].focus + 1.35, cards[cur].focus + 1.7));
  eb.style.opacity = t < 13.9 ? 0 : ebIn * (1 - ebOut);
  eb.style.transform = `translateY(${(1 - ebIn) * 12}px)`;
  type(boardAll, t, 26.35, 27.5, 0.06, 0.9);

  // Close-ups: each card does its one thing while it is in focus.
  const f = (i) => t - cards[i].focus;
  {
    const tk = $(".tile .tick", cards[0].node);
    tk.style.transform = `scale(${0.4 + 0.6 * settle(prog(f(0), 0.6, 1.0)) + hit(f(0), 1.0, 6) * 0.25})`;
  }
  {
    const flip = f(1) > 0.95;
    $("[data-btn-a]", cards[1].node).style.opacity = flip ? 0 : 1;
    const bb = $("[data-btn-b]", cards[1].node);
    bb.style.opacity = flip ? 1 : 0;
    bb.style.transform = `scale(${0.88 + 0.12 * settle(prog(f(1), 0.95, 1.35))})`;
  }
  {
    const ty = $("[data-typing]", cards[2].node),
      done = cards[2].later[0],
      lx = f(2);
    ty.style.opacity = lx > 0.35 && lx < 1.0 ? 1 : 0;
    $$(".dots i", ty).forEach((d, k) => {
      d.style.transform = `translateY(${-Math.max(0, Math.sin(lx * 11 - k * 0.9)) * 6}px)`;
    });
    const p = eOut5(prog(lx, 1.0, 1.4));
    done.style.opacity = lx >= 1.0 ? 1 : 0;
    done.style.transform = `translateY(${(1 - p) * 16}px)`;
  }
  {
    const st = $("[data-stamp]", cards[3].node),
      lx = f(3);
    st.style.opacity = lx > 0.55 ? 1 : 0;
    st.style.transform = `scale(${settle(prog(lx, 0.55, 1.0))}) rotate(${(1 - eOut5(prog(lx, 0.55, 1.0))) * -14}deg)`;
  }
  {
    const lx = f(4),
      third = cards[4].later[0],
      p = eOut5(prog(lx, 0.7, 1.1));
    third.style.opacity = lx >= 0.7 ? 1 : 0;
    third.style.transform = `translateY(${(1 - p) * 16}px)`;
    $("[data-count]", cards[4].node).textContent = lx >= 0.7 ? "3" : "2";
  }
  {
    const tg = $(".tag.jade", cards[5].node),
      lx = f(5);
    tg.style.transform = `scale(${1 + hit(lx, 0.6, 5) * 0.1})`;
  }
}

/* ── Network: a vouch tree in orbit ───────────────────────────────────── */
const NC = { x: 1340, y: 548 };
const ORBITS = [
  [5, 160, 70, 0.11],
  [8, 280, 58, -0.07],
  [10, 400, 48, 0.045],
];
const netSvg = $("#net-svg");
const orbitRings = ORBITS.map(([, rad]) =>
  svgEl(
    "circle",
    {
      cx: NC.x,
      cy: NC.y,
      r: rad,
      fill: "none",
      stroke: "#f7f3ee",
      "stroke-opacity": 0.12,
      "stroke-width": 1.5,
      "stroke-dasharray": 2 * Math.PI * rad,
    },
    netSvg,
  ),
);
const linkG = svgEl("g", {}, netSvg);
const centre = { x: NC.x, y: NC.y, size: 104, at: 28.15, ring: -1 };
centre.node = el("div", "orb", $("#net-avs"), av("ines", 104));
const orbs = [centre];
let k6 = 1;
ORBITS.forEach(([n, rad, size, w], ri) => {
  for (let i = 0; i < n; i++) {
    const o = {
      ring: ri,
      rad,
      size,
      w,
      a0: (i / n) * Math.PI * 2 + ri * 0.4,
      at: 28.35 + (k6 - 1) * 0.06,
      node: el("div", "orb", $("#net-avs"), av(CAST[k6 % CAST.length], size)),
    };
    orbs.push(o);
    k6++;
  }
});
// Each person hangs off the nearest person one ring in: who vouched them.
orbs.forEach((o) => {
  if (o.ring < 0) return;
  const inner =
    o.ring === 0 ? [centre] : orbs.filter((p) => p.ring === o.ring - 1);
  let best = inner[0],
    bd = 9;
  inner.forEach((p) => {
    if (p === centre) return;
    const d = Math.abs(
      Math.atan2(Math.sin(o.a0 - p.a0), Math.cos(o.a0 - p.a0)),
    );
    if (d < bd) {
      bd = d;
      best = p;
    }
  });
  o.parent = best;
  o.link = svgEl(
    "line",
    {
      stroke: "#e8775a",
      "stroke-opacity": 0.5,
      "stroke-width": 1.6,
      "stroke-linecap": "round",
    },
    linkG,
  );
});
const netType = masked($("#net-type")),
  netSub = masked($("#net-sub"));
function net(t) {
  type(netType, t, 28.1, 31.4);
  type(netSub, t, 29.6, 31.45, 0.03, 0.7);
  orbitRings.forEach((c, i) => {
    const p = eInOut(prog(t, 28.05 + i * 0.15, 29.0 + i * 0.15));
    c.setAttribute("stroke-dashoffset", 2 * Math.PI * ORBITS[i][1] * (1 - p));
  });
  orbs.forEach((o) => {
    if (o.ring >= 0) {
      const a = o.a0 + o.w * (t - 28);
      o.x = NC.x + Math.cos(a) * o.rad;
      o.y = NC.y + Math.sin(a) * o.rad;
    }
  });
  orbs.forEach((o) => {
    const p = settle(prog(t, o.at, o.at + 0.5));
    o.node.style.width = o.node.style.height = o.size + "px";
    o.node.style.opacity = t >= o.at ? Math.min(1, (t - o.at) / 0.15) : 0;
    o.node.style.transform = `translate(${o.x - o.size / 2}px, ${o.y - o.size / 2}px) scale(${0.3 + 0.7 * p})`;
    if (o.link) {
      const d = eOut(prog(t, o.at - 0.2, o.at + 0.15));
      o.link.setAttribute("x1", o.parent.x);
      o.link.setAttribute("y1", o.parent.y);
      o.link.setAttribute("x2", lerp(o.parent.x, o.x, d));
      o.link.setAttribute("y2", lerp(o.parent.y, o.y, d));
      o.link.setAttribute("opacity", t >= o.at - 0.2 ? 1 : 0);
    }
  });
  const out = eIn(prog(t, 31.5, 32.0));
  $("#net-svg").style.opacity = $("#net-avs").style.opacity = 1 - out;
  $("#net-avs").style.transform = $("#net-svg").style.transform =
    `scale(${1 + out * 0.06})`;
  centre.node.style.boxShadow = `0 0 0 ${3 + hit(t, 28.15, 3) * 10}px rgba(232,119,90,${0.35 + 0.4 * hit(t, 28.15, 3)})`;
  centre.node.style.borderRadius = "50%";
}

/* ── Promise: no ads, no algorithm, just your people ──────────────────── */
const promiseA = masked($("#promise-a")),
  promiseB = masked($("#promise-b"));
const PROMISES = [
  ["userPlus", "Invite-only"],
  ["lock", "End-to-end encrypted"],
  ["eyeOff", "You choose who sees what"],
  ["users", "Moderated by real people"],
  ["pin", "Venues we’ve visited"],
];
const promiseChips = PROMISES.map(([ic, h], i) => ({
  node: chip(ic, h, $("#promise-chips"), "chip jade inline"),
  at: 34.55 + i * 0.12,
}));
function promise(t) {
  // "No" stays; the word after it rolls from ads to algorithm.
  type(promiseA.slice(0, 1), t, 32.05, 33.75);
  const slot = $("#promise-a .slot");
  const roll = eInOut(prog(t, 32.9, 33.3));
  const sp = eOut5(prog(t, 32.1, 32.95)),
    sq = eIn(prog(t, 33.78, 34.2));
  slot.style.transform = `translateY(${(1 - sp) * 115 - sq * 115}%)`;
  slot.style.opacity = t < 32.1 || sq >= 1 ? 0 : 1;
  const [wa, wb] = $$("span", slot).map((s) => {
    s.style.transform = `translateY(${-roll * 100}%)`;
    return s.offsetWidth;
  });
  // The slot narrows to its word, so "No ads." stays centred as it rolls.
  slot.style.width = lerp(wa, wb, roll) + "px";
  type(promiseB, t, 34.0, 35.5);
  promiseChips.forEach((c) => {
    const p = eOut5(prog(t, c.at, c.at + 0.6)),
      q = eIn(prog(t, 35.5, 35.85));
    c.node.style.opacity = (t >= c.at ? p : 0) * (1 - q);
    c.node.style.transform = `translateY(${(1 - p) * 24 - q * 16}px)`;
  });
}

/* ── City: a dot-matrix Lisbon, real neighbourhood positions ──────────── */
const geo = (lon, lat) => [
  1380 + (lon + 9.135) * 9000,
  520 - (lat - 38.725) * 11520,
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
for (let y = 9; y < 1080; y += 18)
  for (let x = 850; x < 1920; x += 18)
    if (inside(x, y)) {
      const park = Math.hypot((x - mx) / 1.2, y - my) < 150;
      DOTS.push({
        x,
        y,
        park,
        fade: clamp((x - 850) / 300),
        at: 36.05 + (Math.hypot(x - 1380, y - 560) / 900) * 0.8,
      });
    }
const HOODS = [
  ["Campo de Ourique", -9.166, 38.717, "l", "daniel"],
  ["Estrela", -9.159, 38.711, "d", "sofia"],
  ["Príncipe Real", -9.149, 38.717, "u", "leo"],
  ["Cais do Sodré", -9.144, 38.706, "d", "sam"],
  ["Mouraria", -9.136, 38.716, "r", "yuki"],
  ["Alfama", -9.128, 38.711, "r", "monica"],
  ["Anjos", -9.134, 38.726, "r", "noor"],
  ["Arroios", -9.134, 38.735, "r", "lucia"],
  ["Marvila", -9.104, 38.743, "r", "mateo"],
];
const pins = HOODS.map(([name, lon, lat, dir, who], i) => {
  const [x, y] = geo(lon, lat);
  const node = el(
    "div",
    "chip pin pinchip",
    $("#city-pins"),
    `${av(who, 36)}${name}`,
  );
  return { name, x, y, dir, node, at: 36.75 + i * 0.12 };
});
const ARCS = [
  ["Arroios", "Cais do Sodré", 37.9],
  ["Marvila", "Alfama", 38.15],
  ["Campo de Ourique", "Mouraria", 38.4],
  ["Anjos", "Príncipe Real", 38.65],
].map(([a, b, at]) => ({
  a: pins.find((p) => p.name === a),
  b: pins.find((p) => p.name === b),
  at,
}));
const cityType = masked($("#city-type"));
const cctx = $("#city-canvas").getContext("2d");
function city(t) {
  type(cityType, t, 36.1, 39.45);
  const out = eIn(prog(t, 39.5, 40.0));
  const ctx = cctx;
  ctx.clearRect(0, 0, 1920, 1080);
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
    if (p <= 0) return;
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
  pins.forEach((pn, i) => {
    const p = settle(prog(t, pn.at, pn.at + 0.45));
    if (t < pn.at) {
      pn.node.style.opacity = 0;
      return;
    }
    const pulse = ((t - pn.at) % 2) / 2;
    ctx.strokeStyle = `rgba(232,119,90,${0.5 * (1 - pulse)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pn.x, pn.y, 8 + pulse * 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e8775a";
    ctx.beginPath();
    ctx.arc(pn.x, pn.y, 7 * p, 0, Math.PI * 2);
    ctx.fill();
    const w = pn.node.offsetWidth || 160,
      h = 48;
    const [ox, oy] = {
      r: [18, -h / 2],
      l: [-18 - w, -h / 2],
      u: [-w / 2, -18 - h],
      d: [-w / 2, 18],
    }[pn.dir];
    pn.node.style.opacity =
      eOut(prog(t, pn.at + 0.1, pn.at + 0.45)) * (1 - out);
    pn.node.style.transform = `translate(${pn.x + ox}px, ${pn.y + oy + (1 - p) * 10}px)`;
  });
  $("#tejo").style.opacity = eOut(prog(t, 37.0, 37.8)) * (1 - out);
}

/* ── Belong and the end ───────────────────────────────────────────────── */
const belongType = masked($("#belong-type"));
function belong(t) {
  type(belongType, t, 40.05, 41.5, 0.06, 0.9);
}
const endChars = wordmark($("#end-word")),
  endSlogan = masked($("#end-slogan"));
function end(t) {
  lockup(t, 42.0, $("#end-word"), endChars, $("#end-slogan"), endSlogan, null);
  const c = eOut5(prog(t, 43.4, 44.2));
  $("#end-cta").style.opacity = c;
  $("#end-cta").style.transform = `translateY(${(1 - c) * 20}px)`;
  $("#credit").style.opacity = eOut(prog(t, 44.2, 45.0));
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
  lines: [0.5, 4.0, 6.0, 28.1, 32.05, 34.0, 36.1, 40.05],
  frags: frags.map((f) => f.at),
  ping: 7.55,
  names: [8.3, 42.0],
  build: [12.05, 12.5],
  moves: MOVES.map(([a]) => a),
  focus: cards.map((c) => c.focus),
  closeUps: [14.6, 16.95, 18.35, 19.0, 20.55, 22.7, 24.6],
  all: 26.35,
  netPops: orbs.map((o) => o.at),
  roll: 32.9,
  promiseChips: promiseChips.map((c) => c.at),
  dots: 36.05,
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
