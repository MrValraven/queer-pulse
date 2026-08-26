/**
 * One-off press-kit asset generation.
 *
 * The /about/press-kit page used to synthesise its "downloads" in the browser:
 * a hand-written wordmark SVG in whatever serif the visitor happened to have,
 * plus .txt stand-ins for every other card. A journalist who clicked "download
 * the logo" got a placeholder. This script produces the real files instead,
 * committed to public/press/ and served as static assets.
 *
 * Everything here is DERIVED, never invented:
 *   - the mark comes from public/favicon.svg, the same source the PWA icons
 *     are generated from (scripts/generate-icons.mjs);
 *   - the wordmark is rendered by Chromium from the app's own self-hosted
 *     Fraunces, at the weight, tracking and coral pulse dot that
 *     PressKitPage.module.css and Footer.module.css already use;
 *   - every colour and type value is parsed out of src/styles/tokens/, so the
 *     published palette cannot drift from the app.
 *
 * Chromium rather than sharp/librsvg for anything with type: librsvg
 * substitutes a system font for Fraunces and the substitution goes stale
 * silently. Same reasoning as scripts/generate-og-image.mjs, which this
 * script's rendering approach mirrors.
 *
 * Re-run with `pnpm press:assets` when the mark, the palette or the type
 * tokens change. Requires the Chromium binary: `pnpm prerender:browser`
 * installs it if missing.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const MARK_SOURCE = "public/favicon.svg";
const APP_ICON_SOURCE = "public/icons/icon-512.png";
const COLOR_TOKENS = "src/styles/tokens/colors.css";
const TYPE_TOKENS = "src/styles/tokens/typography.css";
const OUTPUT_DIRECTORY = "public/press";

const MARK_PNG_SIZE = 1024;
const WORDMARK_PNG_WIDTH = 2048;
const CAPTURE_SCALE = 2;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const PRESS_EMAIL = "hello@queerpulse.com";

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The light-theme `:root` block of a token stylesheet. Dark mode re-declares
 * several of these names further down the file, so the lookup is scoped to the
 * first block or a published "brand" hex would silently become its dark-mode
 * counterpart.
 */
async function readRootBlock(path) {
  const source = await readFile(path, "utf8");
  const [firstBlock] = source.split(/^\}/m);
  return firstBlock;
}

const colorBlock = await readRootBlock(COLOR_TOKENS);
const typeBlock = await readRootBlock(TYPE_TOKENS);

/** Resolve one custom property out of an already-scoped token block. */
function tokenValue(block, tokenName, path) {
  const match = block.match(new RegExp(`^\\s*${tokenName}:\\s*([^;]+);`, "m"));
  if (!match) {
    throw new Error(`Token ${tokenName} not found in ${path}`);
  }
  return match[1].replace(/\s+/g, " ").trim();
}

const color = (tokenName) => tokenValue(colorBlock, tokenName, COLOR_TOKENS);
const type = (tokenName) => tokenValue(typeBlock, tokenName, TYPE_TOKENS);

const PLUM = color("--plum");
const PLUM_DEEP = color("--plum-deep");
const ACCENT = color("--accent");
const CREAM = color("--cream");
const INK = color("--ink");

/**
 * The palette the press kit publishes. Names and usage notes are written here;
 * every value is read from the token file, so the sheet cannot go stale.
 */
const PALETTE = [
  {
    name: "Plum",
    token: "--plum",
    usage: "Brand anchor. Dark surfaces, headings, the app's theme colour.",
  },
  {
    name: "Plum deep",
    token: "--plum-deep",
    usage: "The deeper end of the plum gradient.",
  },
  {
    name: "Coral",
    token: "--accent",
    usage: "The accent. Fills, tints, the pulse dot. Never small text.",
  },
  {
    name: "Coral text",
    token: "--accent-text",
    usage: "Coral as text on light surfaces. Clears WCAG AA.",
  },
  {
    name: "Coral fill",
    token: "--accent-fill",
    usage: "Coral as a filled button carrying a white label. Clears AA.",
  },
  {
    name: "Cream",
    token: "--cream",
    usage: "Page background. Never pure white.",
  },
  { name: "Paper", token: "--paper", usage: "Card surface." },
  { name: "Jade", token: "--jade", usage: "Verified, live, success." },
  {
    name: "Jade text",
    token: "--jade-ink",
    usage: "Jade as small text on light surfaces. Clears AA.",
  },
  {
    name: "Amber",
    token: "--amber",
    usage: "Warning and medium states. A fill colour, never type.",
  },
  {
    name: "Danger",
    token: "--danger",
    usage: "Destructive actions: delete, block, report.",
  },
  { name: "Ink", token: "--ink", usage: "Body text." },
].map((entry) => ({ ...entry, hex: color(entry.token).toUpperCase() }));

/** Hex to an `R, G, B` triple for the printable colour reference. */
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) =>
    parseInt(clean.slice(offset, offset + 2), 16),
  );
  return channels.join(", ");
}

const TYPE_SCALE = [
  { name: "Hero", token: "--text-hero" },
  { name: "Display", token: "--text-display" },
  { name: "Title", token: "--text-title" },
  { name: "Heading", token: "--text-heading" },
  { name: "Subhead", token: "--text-subhead" },
  { name: "Body large", token: "--text-body-lg" },
  { name: "Body", token: "--text-body" },
  { name: "Body small", token: "--text-body-sm" },
  { name: "Caption", token: "--text-caption" },
  { name: "Label", token: "--text-label" },
  { name: "Eyebrow", token: "--text-eyebrow" },
].map((entry) => ({ ...entry, value: type(entry.token) }));

/* -------------------------------------------------------------------------- */
/* The mark                                                                   */
/* -------------------------------------------------------------------------- */

const markSource = await readFile(MARK_SOURCE, "utf8");

/**
 * The mark's silhouette. favicon.svg draws the glyph as one filled outline and
 * then paints its interior shading through a mask of that same outline, so the
 * first path IS the silhouette. Extracting it gives a genuine single-colour
 * variant of the real mark rather than a redrawn approximation.
 */
function extractSilhouettePath(svg) {
  const match = svg.match(/<path[^>]*\sd="([^"]+)"/);
  if (!match) throw new Error(`No outline path found in ${MARK_SOURCE}`);
  return match[1];
}

function extractViewBox(svg) {
  const match = svg.match(/viewBox="([^"]+)"/);
  if (!match) throw new Error(`No viewBox found in ${MARK_SOURCE}`);
  return match[1];
}

const silhouettePath = extractSilhouettePath(markSource);
const markViewBox = extractViewBox(markSource);

function monochromeMarkSvg(fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${markViewBox}" role="img" aria-label="QueerPulse">
  <path fill="${fill}" d="${silhouettePath}"/>
</svg>
`;
}

/* -------------------------------------------------------------------------- */
/* The wordmark                                                               */
/* -------------------------------------------------------------------------- */

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

const FONT_FACES = `
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
  }`;

/**
 * The wordmark exactly as the app draws it: Fraunces semibold, -0.01em
 * tracking, "Pulse" in the italic, preceded by the coral pulse dot. The dot
 * and gap are expressed in em so the three colourways stay identical at any
 * render size (PressKitPage.module.css uses 11px and 9px against a 28px face,
 * which is what these two ratios are).
 */
const WORDMARK_CSS = `
  .lockup {
    display: inline-flex;
    align-items: center;
    gap: 0.3214em;
    font-family: "Fraunces", Georgia, serif;
    font-weight: 600;
    font-optical-sizing: auto;
    letter-spacing: -0.01em;
    line-height: 1;
  }
  .dot {
    width: 0.3929em;
    height: 0.3929em;
    border-radius: 50%;
    flex: none;
  }
  .lockup i {
    font-style: italic;
  }`;

const WORDMARK_VARIANTS = [
  {
    outputName: "queerpulse-logo-primary.png",
    ink: PLUM,
    dot: ACCENT,
    field: null,
  },
  {
    outputName: "queerpulse-logo-inverse.png",
    ink: CREAM,
    dot: ACCENT,
    field: null,
  },
  {
    outputName: "queerpulse-logo-coral.png",
    ink: CREAM,
    dot: PLUM,
    field: ACCENT,
  },
];

function wordmarkHtml({ ink, dot, field }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${FONT_FACES}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    display: inline-block;
    background: ${field ?? "transparent"};
    padding: 0.42em 0.5em;
    font-size: 240px;
    color: ${ink};
  }
  ${WORDMARK_CSS}
  .dot { background: ${dot}; }
</style>
</head>
<body><span class="lockup"><span class="dot"></span><span>Queer<i>Pulse</i></span></span></body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/* The printable colour + type reference                                      */
/* -------------------------------------------------------------------------- */

function brandReferenceHtml() {
  const swatchRows = PALETTE.map(
    (entry) => `
    <tr>
      <td><span class="chip" style="background:${entry.hex}"></span></td>
      <td class="name">${entry.name}</td>
      <td class="mono">${entry.hex}</td>
      <td class="mono">${hexToRgb(entry.hex)}</td>
      <td class="mono">${entry.token}</td>
      <td class="usage">${entry.usage}</td>
    </tr>`,
  ).join("");

  const typeRows = TYPE_SCALE.map(
    (entry) => `
    <tr>
      <td class="name">${entry.name}</td>
      <td class="mono">${entry.token}</td>
      <td class="mono">${entry.value}</td>
    </tr>`,
  ).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${FONT_FACES}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "DM Sans", system-ui, sans-serif;
    color: ${INK};
    background: #ffffff;
    font-size: 9.5pt;
    line-height: 1.5;
  }
  .cover {
    background: linear-gradient(135deg, ${PLUM}, ${PLUM_DEEP});
    color: ${CREAM};
    padding: 34pt 32pt;
    margin-bottom: 22pt;
  }
  ${WORDMARK_CSS}
  .cover .lockup { font-size: 30pt; color: ${CREAM}; }
  .cover .dot { background: ${ACCENT}; }
  .cover p { margin-top: 12pt; opacity: 0.78; max-width: 380pt; }
  section { padding: 0 32pt; margin-bottom: 20pt; }
  h2 {
    font-family: "Fraunces", Georgia, serif;
    font-weight: 600;
    font-size: 15pt;
    letter-spacing: -0.01em;
    margin-bottom: 3pt;
  }
  h2 + p { color: rgba(26, 26, 31, 0.62); margin-bottom: 10pt; }
  table { width: 100%; border-collapse: collapse; }
  td, th {
    text-align: left;
    padding: 5pt 8pt 5pt 0;
    border-bottom: 0.5pt solid rgba(45, 27, 61, 0.12);
    vertical-align: middle;
  }
  th { font-size: 7.5pt; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(26, 26, 31, 0.5); }
  .chip { display: block; width: 22pt; height: 22pt; border-radius: 5pt; border: 0.5pt solid rgba(45, 27, 61, 0.12); }
  .name { font-weight: 600; white-space: nowrap; }
  .mono { font-variant-numeric: tabular-nums; white-space: nowrap; color: rgba(26, 26, 31, 0.72); }
  .usage { color: rgba(26, 26, 31, 0.62); }
  .specimen { font-family: "Fraunces", Georgia, serif; font-size: 26pt; letter-spacing: -0.02em; line-height: 1.15; }
  .specimen em { font-style: italic; color: ${ACCENT}; }
  li em { font-style: italic; }
  .specimen-sans { font-size: 12pt; color: rgba(26, 26, 31, 0.72); margin-top: 8pt; max-width: 400pt; }
  ul { margin: 0 0 0 12pt; }
  li { margin-bottom: 3pt; }
  footer { padding: 0 32pt; color: rgba(26, 26, 31, 0.55); font-size: 8.5pt; }
</style>
</head>
<body>
  <div class="cover">
    <span class="lockup"><span class="dot"></span><span>Queer<i>Pulse</i></span></span>
    <p>Colour and typography reference for editorial and partner use. Every
    value on these pages is read straight from the platform's design tokens, so
    it matches what the product actually renders.</p>
  </div>

  <section>
    <h2>Colour</h2>
    <p>Four brand hues, warm-tinted throughout, plus the state colours the
    interface needs. Where a hue is too light to carry small type, the
    accessible text variant is listed beside it.</p>
    <table>
      <tr><th></th><th>Name</th><th>Hex</th><th>RGB</th><th>Token</th><th>Where it is used</th></tr>
      ${swatchRows}
    </table>
  </section>

  <section>
    <h2>Typography</h2>
    <p>Two families. Fraunces sets editorial type and the wordmark; DM Sans
    sets everything in the interface. Both are open source under the SIL Open
    Font License 1.1, so you can set headlines about us in the real faces.</p>
    <div class="specimen">A queer network, <em>rooted in Lisbon.</em></div>
    <div class="specimen-sans">DM Sans carries body copy, labels and every
    control in the product. Fraunces carries display type, pull quotes and the
    wordmark, with the italic reserved for emphasis.</div>
    <table style="margin-top: 14pt">
      <tr><th>Step</th><th>Token</th><th>Size</th></tr>
      ${typeRows}
    </table>
  </section>

  <section>
    <h2>Using the marks</h2>
    <ul>
      <li>Leave one full <em>P</em>-height of clear space around the mark on every side.</li>
      <li>Minimum size: 88&nbsp;px wide on screen, 18&nbsp;mm in print.</li>
      <li>The wordmark always carries the coral pulse dot, except in the coral colourway, where the dot becomes plum. Do not recolour the dot to anything else.</li>
      <li>On a light ground use the primary wordmark; on plum or any dark ground use the inverse.</li>
      <li>The wordmark is Fraunces semibold with &ldquo;Pulse&rdquo; in the italic. Do not re-set it in another face.</li>
      <li>Do not stretch it, set it on busy photographs, or pair it with rainbow gradients we did not make.</li>
      <li>Coral never carries small type. Use the coral text value for that.</li>
    </ul>
  </section>

  <footer>
    Released under a Creative Commons Attribution 4.0 licence for editorial
    use. For commercial use, write to ${PRESS_EMAIL} first.
  </footer>
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/* Plain-text colour reference                                                */
/* -------------------------------------------------------------------------- */

function brandColoursText() {
  const width = Math.max(...PALETTE.map((entry) => entry.name.length)) + 2;
  const rows = PALETTE.map(
    (entry) =>
      `${entry.name.padEnd(width)}${entry.hex}   rgb(${hexToRgb(entry.hex)})   ${entry.usage}`,
  ).join("\n");
  return `QUEERPULSE BRAND COLOURS
========================

Read from the platform's own design tokens (src/styles/tokens/colors.css),
so these are the exact values the product renders.

${rows}

TYPE
----
Wordmark and editorial type: Fraunces (SIL Open Font License 1.1), semibold,
"Pulse" set in the italic, -0.01em tracking.
Interface and body type: DM Sans (SIL Open Font License 1.1).

Released under a Creative Commons Attribution 4.0 licence for editorial use.
For commercial use, write to ${PRESS_EMAIL} first.
`;
}

const KIT_README = `QUEERPULSE PRESS KIT
====================

All assets in this archive are released under a Creative Commons Attribution
4.0 (CC BY 4.0) licence for editorial use. For commercial use, write to
${PRESS_EMAIL} first.

CONTENTS
--------
queerpulse-mark.svg                  The mark, full colour, vector.
queerpulse-mark-${MARK_PNG_SIZE}.png                The mark, ${MARK_PNG_SIZE} px, transparent.
queerpulse-mark-monochrome.svg       Single-colour mark, vector.
queerpulse-mark-monochrome-${MARK_PNG_SIZE}.png     Single-colour mark, ${MARK_PNG_SIZE} px, transparent.
queerpulse-logo-primary.png          Wordmark for light grounds, ${WORDMARK_PNG_WIDTH} px wide.
queerpulse-logo-inverse.png          Wordmark for dark grounds, ${WORDMARK_PNG_WIDTH} px wide.
queerpulse-logo-coral.png            Wordmark on the coral field, ${WORDMARK_PNG_WIDTH} px wide.
queerpulse-app-icon-512.png          The app icon as it ships on devices.
queerpulse-brand-colours.txt         The palette as hex and RGB.
queerpulse-brand-reference.pdf       Printable colour and typography reference.

USING THE MARKS
---------------
Leave one full P-height of clear space around the mark on every side. Minimum
size is 88 px wide on screen, 18 mm in print. The wordmark always carries the
coral pulse dot, except in the coral colourway, where the dot becomes plum.

The wordmark is set in Fraunces semibold with "Pulse" in the italic. Both
Fraunces and DM Sans are open source under the SIL Open Font License 1.1, so
the wordmark can be reset faithfully if you need it as outlines.

PRESS DESK
----------
${PRESS_EMAIL}
We respond within 48 hours. English and Portuguese.
`;

/* -------------------------------------------------------------------------- */
/* ZIP writer (store + deflate, no third-party dependency)                    */
/* -------------------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let byte = 0; byte < 256; byte += 1) {
    let value = byte;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[byte] = value >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * A minimal ZIP writer. The archive is a handful of already-compressed PNGs
 * plus a little text, so pulling in an archiver dependency for it would be a
 * poor trade — the format's local header / central directory / end-of-central
 * -directory layout is short enough to write out directly.
 *
 * Entries are stored with a fixed 1980-01-01 timestamp: the archive is a build
 * artefact committed to the repo, and a real clock would rewrite every byte of
 * it on each run.
 */
function buildZip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, "utf8");
    const deflated = deflateRawSync(entry.data, { level: 9 });
    const useDeflate = deflated.length < entry.data.length;
    const payload = useDeflate ? deflated : entry.data;
    const method = useDeflate ? 8 : 0;
    const checksum = crc32(entry.data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(0, 10); // time
    localHeader.writeUInt16LE(33, 12); // date: 1980-01-01
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(nameBytes.length, 26);
    localHeader.writeUInt16LE(0, 28);

    chunks.push(localHeader, nameBytes, payload);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(33, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(nameBytes.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    central.push(centralHeader, nameBytes);

    offset += localHeader.length + nameBytes.length + payload.length;
  }

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, centralBuffer, end]);
}

/* -------------------------------------------------------------------------- */
/* Render                                                                     */
/* -------------------------------------------------------------------------- */

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

/** Every file that ends up in public/press/ and in the archive. */
const artefacts = [];

function collect(name, data) {
  artefacts.push({ name, data });
}

collect("queerpulse-mark.svg", Buffer.from(markSource, "utf8"));
collect(
  "queerpulse-mark-monochrome.svg",
  Buffer.from(monochromeMarkSvg(PLUM), "utf8"),
);

async function renderMarkPng(svg) {
  return sharp(Buffer.from(svg), { density: 384 })
    .resize(MARK_PNG_SIZE, MARK_PNG_SIZE, {
      fit: "contain",
      background: TRANSPARENT,
    })
    .png()
    .toBuffer();
}

collect(
  `queerpulse-mark-${MARK_PNG_SIZE}.png`,
  await renderMarkPng(markSource),
);
collect(
  `queerpulse-mark-monochrome-${MARK_PNG_SIZE}.png`,
  await renderMarkPng(monochromeMarkSvg(PLUM)),
);
collect("queerpulse-app-icon-512.png", await readFile(APP_ICON_SOURCE));

const browser = await chromium.launch();
try {
  for (const variant of WORDMARK_VARIANTS) {
    const page = await browser.newPage({
      viewport: { width: 2400, height: 800 },
      deviceScaleFactor: CAPTURE_SCALE,
    });
    await page.setContent(wordmarkHtml(variant), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({
      type: "png",
      omitBackground: variant.field === null,
      clip: await page.evaluate(() => {
        const { width, height } = document.body.getBoundingClientRect();
        return { x: 0, y: 0, width, height };
      }),
    });
    await page.close();
    collect(
      variant.outputName,
      await sharp(shot).resize({ width: WORDMARK_PNG_WIDTH }).png().toBuffer(),
    );
  }

  const pdfPage = await browser.newPage();
  await pdfPage.setContent(brandReferenceHtml(), { waitUntil: "networkidle" });
  await pdfPage.evaluate(() => document.fonts.ready);
  const pdf = await pdfPage.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0.25in", left: "0" },
  });
  await pdfPage.close();
  collect("queerpulse-brand-reference.pdf", pdf);
} finally {
  await browser.close();
}

collect(
  "queerpulse-brand-colours.txt",
  Buffer.from(brandColoursText(), "utf8"),
);

for (const artefact of artefacts) {
  await writeFile(`${OUTPUT_DIRECTORY}/${artefact.name}`, artefact.data);
}

const archive = buildZip([
  { name: "README.txt", data: Buffer.from(KIT_README, "utf8") },
  ...artefacts,
]);
await writeFile(`${OUTPUT_DIRECTORY}/queerpulse-press-kit.zip`, archive);

console.log(
  `Wrote ${artefacts.length + 1} press assets to ${OUTPUT_DIRECTORY}/ (archive: ${Math.round(archive.length / 1024)} KB)`,
);
