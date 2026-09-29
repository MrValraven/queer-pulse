#!/usr/bin/env node
/**
 * Design-token ratchet for CSS and for colour literals in TS/TSX.
 *
 * Two kinds of literal, both of which were real bugs before this gate existed.
 * They are counted as five rule ids: raw hex in a CSS Module
 * (`hex-in-modules`), in a global stylesheet (`hex-in-global-css`) and in a
 * TS/TSX string (`hex-in-ts`), and raw channel triples in CSS (`rgb-triple`)
 * and in TS/TSX (`rgb-triple-in-ts`). Only hex and rgb()/rgba() are counted;
 * hsl(), oklch() and named colours are not.
 *
 * 1. NO RAW HEX. Hardcoded colour does not follow a token change and, worse,
 *    does not flip in dark mode. 477 literals were converted on 2026-08-21;
 *    this stops them coming back.
 *
 * 2. NO RAW rgb()/rgba() CHANNEL TRIPLES. Every brand colour publishes an
 *    `-rgb` channel token precisely so a translucent use of it can be written
 *    as `rgba(var(--jade-rgb), .2)` and still follow the theme. Writing the
 *    three numbers out by hand pins the colour to light mode. The original
 *    version of this gate matched exactly ONE triple, light-mode plum,
 *    `rgba(45, 27, 61, …)`, because that was the bug being fixed at the time
 *    (219 borders were invisible in dark mode). A scan on 2026-08-31 found 249
 *    OTHER raw triples across 82 module files sailing past it, so the rule is
 *    now general: any three-channel rgb()/rgba() literal is a violation, and
 *    the message names the token when the triple is a known one.
 *
 *    Two triples are ALLOWED everywhere: `rgba(255,255,255,…)` and
 *    `rgba(0,0,0,…)`. White at low alpha is the standard inset top-highlight on
 *    a raised surface and black at low alpha is a photographic wash over an
 *    image. Neither is a brand colour, neither should flip with the theme, and
 *    there is no token for "a bit of light" or "a bit of shade".
 *
 * SCOPE. This used to walk only `*.module.css`, which was a hole big enough to
 * drive a feature through: `src/features/subprofiles/persona-skins.css` is a
 * deliberately global stylesheet, and it redeclared `--ink-40` thirteen times
 * below the audited contrast floor without anything noticing. It now walks
 * EVERY `.css` under `src/` except `src/styles/tokens/`, which is where the
 * literals are legitimately defined.
 *
 * It also walks every `.ts` and `.tsx` under `src/` (skipping `*.test.*`,
 * `*.spec.*`, `__tests__/`, `*.d.ts` and `src/styles/tokens/`). Walking only
 * CSS left a second hole: a colour written into a TS string reaches the page as
 * an inline style, and a deep scan on 2026-09-29 (DES-431) found raw
 * `rgba(45,27,61,…)` plum washes in three live API adapters, the block/mute
 * icon discs and the directory map placeholder, all of which vanished on the
 * dark-mode plum surface. TS is scanned with the TypeScript parser and only
 * the text of string and template literals is matched, so comments, regex
 * literals, JSX text and identifiers never count. Three filters keep a `#` that
 * is a link or a number out of the hex count:
 *   - shape: a TS hex needs a colour's length (3, 4, 6 or 8 digits) and no
 *     URL or word character beside it, so `"#discovery"` and `/path#frag` do
 *     not match;
 *   - digits: a hex made only of 0-9 counts when it is the whole literal
 *     (`"#000"`) or sits in CSS-value position (after `(`, `,`, `:`, `=`, a
 *     quote, a border style or a length), so `"report #4471"` stays out, and
 *     four plain digits never count;
 *   - anchor props: a literal that is the value of an `href`, `hash`, `id` or
 *     `anchor` prop or key is skipped, unless it holds an rgb()/rgba() triple.
 * TS debt is held by its own two rules, `hex-in-ts` and `rgb-triple-in-ts`.
 *
 * Some TS colours are content that CSS variables cannot reach: national flag
 * stripes, sticker template art, the email palette (mail clients read no CSS
 * custom properties) and the MapLibre style (MapLibre paints on a canvas from
 * literal colours). Those sit in ALLOWED_DIRECTORIES / ALLOWED_FILES with a
 * reason. Mock and demo data carrying UI colours is debt, and stays counted.
 *
 * ALLOWLIST: a few literals are genuinely not theme colours and must stay. Mask
 * stencils (`#000` inside a `mask`/`-webkit-mask`) are opacity stencils, a video
 * letterbox is true black by definition, and a national flag's colours are
 * content. Each entry names the file, the rule it is exempt from, and why:
 * per-RULE rather than per-file, so a file excused for its `#000` mask stencils
 * is still held to the channel-triple rule.
 *
 * An entry can narrow the hex exemption further with `hexValues`: the set of
 * exact literals (lowercase) the file may use, so the gate keeps failing on
 * any OTHER raw hex that lands in that file. `BadgesPage.module.css` is the
 * one file that needs this today: its only legitimate literal is the `#000`
 * mask-stencil alpha stop, and a blanket file exemption let two unrelated
 * gradient stops (`#3a2553`) slip past it uncaught.
 *
 * THE RATCHET. Widening the scope brought a body of pre-existing debt into
 * view that cannot be fixed in one pass, so the rules are held at or under
 * the committed floors in scripts/design-token-budget.json rather than at a
 * hard zero. `hex-in-modules` is a genuine zero and must stay one: that sweep
 * is finished. `--update-budget` only ever writes budgets DOWNWARD; a rise is a
 * hand edit that needs a written reason, the same discipline as BUDGET in
 * report-a11y.mjs.
 *
 * Run: `pnpm check:tokens`
 * Re-baseline after a cleanup: `node scripts/check-design-tokens.mjs --update-budget`
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDirectory, "..");
const sourceDirectory = join(projectRoot, "src");
const budgetPath = join(scriptDirectory, "design-token-budget.json");

// Where the tokens themselves live. Skipped whole: a raw hex in colors.css is
// the definition every other file is supposed to point at.
const EXEMPT_DIRECTORY = join("src", "styles", "tokens");

// path (relative to src/) → the rules it is exempt from, and why. Being excused
// from "hex" does NOT excuse a file from "rgb-triple".
const ALLOWED_FILES = new Map([
  [
    "features/cinema/WatchPage.module.css",
    {
      rules: ["hex"],
      reason: "video letterbox is true black regardless of theme",
    },
  ],
  [
    "features/members/BadgesPage.module.css",
    {
      rules: [],
      // Only these exact literals are exempt (see `hexValues` above); every
      // other raw hex in this file still fails hex-in-modules.
      hexValues: new Set(["#000", "#000000"]),
      reason:
        "#000 inside radial-gradient masks: an opacity stencil, not a colour",
    },
  ],
  [
    "features/onboarding/GettingStartedPage.module.css",
    {
      rules: ["hex"],
      reason:
        "#000 inside a radial-gradient mask: an opacity stencil, not a colour",
    },
  ],
  [
    "features/studio/StudioEndCardPage.module.css",
    { rules: ["hex"], reason: "#000 gradient stops used as a fade stencil" },
  ],
  [
    "features/system/GeoRestrictedPage.module.css",
    {
      rules: ["hex"],
      reason:
        "Portuguese flag colours are content and must not shift with the theme",
    },
  ],
  [
    "features/marketing/venueMarker.module.css",
    { rules: ["hex"], reason: "category pin colours are data-driven content" },
  ],
  // ── TS/TSX (see SCOPE in the header) ──
  [
    "shared/data/flagStripes.data.ts",
    {
      rules: ["hex"],
      reason:
        "national flag stripes are content and must not shift with the theme",
    },
  ],
  [
    "features/settings/profileTheme.data.ts",
    {
      rules: ["hex"],
      reason:
        "pride flag swatches a member picks for their profile theme are content",
    },
  ],
  [
    "features/admin/emailTemplates/design/emailPalette.ts",
    {
      rules: ["hex", "rgb-triple"],
      reason:
        "mail clients read no CSS custom properties, so the email palette is literal",
    },
  ],
  [
    "shared/components/map/siteMapStyle.ts",
    {
      rules: ["hex", "rgb-triple"],
      reason:
        "MapLibre paints the basemap on a canvas and needs literal colours",
    },
  ],
  [
    "features/admin/stickerBuilder/stickerColorPresets.data.ts",
    {
      rules: ["hex"],
      reason: "sticker artwork colours baked into the exported PNG",
    },
  ],
  [
    "features/admin/stickerBuilder/StickerColorField.tsx",
    {
      rules: [],
      hexValues: new Set(["#000000"]),
      reason:
        '<input type="color"> takes only a literal #rrggbb, so its fallback is one',
    },
  ],
  [
    "features/members/ProfileQrModal.tsx",
    {
      rules: [],
      hexValues: new Set(["#2d1b3d", "#ffffff"]),
      reason:
        "the QR code is drawn into a canvas bitmap, which cannot read a CSS variable",
    },
  ],
  [
    "features/studio/StudioGoogleButton.tsx",
    {
      rules: [],
      hexValues: new Set(["#4285f4", "#34a853", "#fbbc05", "#ea4335"]),
      reason: "Google's G mark must use Google's own brand colours",
    },
  ],
]);

// Directory prefix (relative to src/, ending in "/") → the rules every file
// under it is exempt from, and why. Same per-rule shape as ALLOWED_FILES, for
// a folder whose every file is content.
const ALLOWED_DIRECTORIES = new Map([
  [
    "features/stickers/templates/",
    {
      rules: ["hex"],
      reason: "sticker template art, rendered into exported sticker images",
    },
  ],
  [
    "shared/i18n/catalogs/",
    {
      rules: ["hex"],
      reason:
        "translated copy: a hex here is an example the reader sees in a sentence",
    },
  ],
]);

/** The allowlist entry for a file: its own entry, else its folder's. */
function allowedEntryFor(relativePath) {
  const fileEntry = ALLOWED_FILES.get(relativePath);
  if (fileEntry) return fileEntry;
  for (const [prefix, entry] of ALLOWED_DIRECTORIES) {
    if (relativePath.startsWith(prefix)) return entry;
  }
  return undefined;
}

// The channel triples that HAVE a token, and what to reach for instead. Kept in
// sync by hand with src/styles/tokens/colors.css and effects.css.
const KNOWN_TRIPLES = new Map([
  [
    "45, 27, 61",
    "var(--line-rgb) for a wash, chip, border or hairline that must stay visible in dark mode (flips to cream there); var(--plum-rgb) only for a shadow or a deliberately plum surface (does not flip)",
  ],
  ["247, 243, 238", "var(--cream-rgb)"],
  ["232, 119, 90", "var(--accent-rgb)"],
  ["74, 140, 111", "var(--jade-rgb)"],
  ["232, 180, 74", "var(--amber-rgb)"],
  ["185, 28, 28", "var(--danger-rgb)"],
  ["92, 62, 146", "var(--desk-violet-rgb)"],
  ["122, 82, 184", "var(--violet-rgb)"],
  ["176, 98, 143", "var(--rose-rgb)"],
  [
    "26, 26, 31",
    "var(--ink-rgb) for faint text (flips in dark mode), or var(--scrim-rgb) for a modal overlay (does not). See the scrim note in tokens/effects.css",
  ],
]);

// White and black at any alpha. See the header: inset highlights and
// photographic washes, both outside the brand palette.
const ALLOWED_TRIPLES = new Set(["255, 255, 255", "0, 0, 0"]);

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
// Inside a TS string a `#` is often a URL fragment, an anchor or a ticket
// number, so a TS hex needs a colour's digit count (3, 4, 6 or 8) and no word,
// path or query character on either side: `"#fff"` and `"1px solid #2d1b3d"`
// match, `"#discovery"`, `"/help#faq"` and `"&#123;"` do not. isTsColourHex
// below then drops the numbers that survive that shape test.
const TS_HEX =
  /(?<![\w/&?=#.-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const QUOTES = new Set(['"', "'", "`"]);
// What sits right before an all-digit hex when it is a CSS value: an opening
// paren, comma, colon or `=`, a quote (an SVG attribute inside markup), a
// border style keyword, or a length (`"0 0 0 2px #333"`).
const CSS_VALUE_LEAD =
  /(?:[(,:=]\s*|["'`]|\b(?:solid|dashed|dotted|double)\s+|\d(?:px|r?em|%)\s+)$/;

/**
 * A TS_HEX match is a colour when the whole string literal is the hex
 * (`"#2d1b3d"`, `"#000"`) or the hex has an a-f digit. An all-digit hex inside
 * longer text counts only in CSS-value position, so `"report #4471"` and
 * `"issue #123"` stay out while `"linear-gradient(#000, …)"` counts. The
 * 4-digit `#rgba` form needs an a-f digit everywhere: four plain digits are
 * a ticket number far more often than a colour.
 */
function isTsColourHex(text, match) {
  const digits = match[0].slice(1);
  const hasHexLetter = /[a-f]/i.test(digits);
  if (digits.length === 4 && !hasHexLetter) return false;
  const before = text[match.index - 1];
  const after = text[match.index + match[0].length];
  const isWholeLiteral = QUOTES.has(before) && after === before;
  if (isWholeLiteral || hasHexLetter) return true;
  return CSS_VALUE_LEAD.test(text.slice(0, match.index));
}
// Matches both the legacy comma form `rgba(45, 27, 61, .4)` and the modern
// space form `rgb(45 27 61 / 40%)`, in any letter case.
const RGB_TRIPLE =
  /rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\b/gi;

const isStylesheet = (relativePath) => relativePath.endsWith(".css");
const isModule = (relativePath) => relativePath.endsWith(".module.css");

const RULES = [
  {
    id: "hex-in-modules",
    label: "raw hex in a CSS Module",
    exemptAs: "hex",
    hexPattern: HEX,
    appliesTo: isModule,
  },
  {
    id: "hex-in-global-css",
    label: "raw hex in a global stylesheet",
    exemptAs: "hex",
    hexPattern: HEX,
    appliesTo: (relativePath) =>
      isStylesheet(relativePath) && !isModule(relativePath),
  },
  {
    id: "rgb-triple",
    label: "raw rgb()/rgba() channel triple",
    exemptAs: "rgb-triple",
    appliesTo: isStylesheet,
  },
  {
    id: "hex-in-ts",
    label: "raw hex in a TS/TSX string",
    exemptAs: "hex",
    hexPattern: TS_HEX,
    isColourHex: isTsColourHex,
    appliesTo: (relativePath) => !isStylesheet(relativePath),
  },
  {
    id: "rgb-triple-in-ts",
    label: "raw rgb()/rgba() channel triple in a TS/TSX string",
    exemptAs: "rgb-triple",
    appliesTo: (relativePath) => !isStylesheet(relativePath),
  },
];

const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;

/** Stylesheets, plus TS/TSX that is shipped code (no tests, no .d.ts). */
function isScannedFile(entry) {
  if (entry.endsWith(".css")) return true;
  if (entry.endsWith(".d.ts") || TEST_FILE.test(entry)) return false;
  return entry.endsWith(".ts") || entry.endsWith(".tsx");
}

function walk(directory, out = []) {
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== "__tests__") walk(full, out);
    } else if (isScannedFile(entry)) out.push(full);
  }
  return out;
}

/** "#ABC" and "#aabbcc" both become "#aabbcc", so lookups ignore spelling. */
function normaliseHex(literal) {
  const digits = literal.slice(1).toLowerCase();
  if (digits.length === 3 || digits.length === 4) {
    return `#${[...digits].map((digit) => digit + digit).join("")}`;
  }
  return `#${digits}`;
}

// Light-mode hex value → the first token in tokens/colors.css that declares
// it, so a failure can name the token to reach for. Read from the file on
// every run, so it never drifts the way KNOWN_TRIPLES can.
const TOKEN_BY_HEX = (() => {
  const tokenByHex = new Map();
  let colors = "";
  try {
    colors = readFileSync(
      join(sourceDirectory, "styles", "tokens", "colors.css"),
      "utf8",
    );
  } catch {
    return tokenByHex;
  }
  const lightBlock = colors
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\n\[data-theme="dark"\]/)[0];
  for (const match of lightBlock.matchAll(
    /(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})\b/g,
  )) {
    const hex = normaliseHex(match[2]);
    if (!tokenByHex.has(hex)) tokenByHex.set(hex, match[1]);
  }
  return tokenByHex;
})();

function hexDetail(hexLiterals) {
  const suggestions = hexLiterals.map((literal) => {
    const token = TOKEN_BY_HEX.get(normaliseHex(literal));
    return token
      ? `${literal}: var(${token}) has this value in light mode`
      : `${literal}: no token has this exact value, pick the nearest semantic one`;
  });
  return `raw hex, use a design token (${suggestions.join("; ")})`;
}

const TS_LITERAL_KINDS = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
]);
// Cheap pre-filter: most TS files hold no colour-shaped text at all, and
// parsing only the ones that might keeps the gate fast.
const MIGHT_HOLD_COLOUR = /#[0-9a-fA-F]{3}|rgba?\(\s*\d/i;
// A literal assigned to one of these names is a link target or an id, so a
// hex-shaped value there (`href: "#bad"`) is an anchor. `to` and `key` stay
// off the list: both commonly carry a colour (`{ to: "#e8775a" }` in a
// gradient stop map, a palette keyed by name).
const ANCHOR_NAMES = new Set(["href", "hash", "id", "anchor"]);
// Non-global twin of RGB_TRIPLE for a yes/no test that keeps no lastIndex.
const HAS_RGB_TRIPLE = new RegExp(RGB_TRIPLE.source, "i");

/**
 * Whether a literal is the value of an `href`/`id`-style prop or key. A
 * literal holding an rgb()/rgba() triple is never an anchor, so it is always
 * scanned.
 */
function isAnchorValue(node, sourceFile) {
  if (HAS_RGB_TRIPLE.test(node.getText(sourceFile))) return false;
  let owner = node.parent;
  if (owner && ts.isJsxExpression(owner)) owner = owner.parent;
  if (!owner || !(ts.isPropertyAssignment(owner) || ts.isJsxAttribute(owner))) {
    return false;
  }
  const name = owner.name.getText(sourceFile).replace(/^["'`]|["'`]$/g, "");
  return ANCHOR_NAMES.has(name);
}

/**
 * The file with everything except string and template literal text blanked
 * to spaces (newlines kept, so line numbers hold). Comments, identifiers,
 * regex literals, JSX text and anchor values all disappear; what is left is
 * exactly the text that could reach a style at runtime.
 */
function maskToStringLiterals(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const masked = source.replace(/[^\n]/g, " ").split("");
  const visit = (node) => {
    if (TS_LITERAL_KINDS.has(node.kind) && !isAnchorValue(node, sourceFile)) {
      for (
        let offset = node.getStart(sourceFile);
        offset < node.end;
        offset++
      ) {
        masked[offset] = source[offset];
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return masked.join("");
}

/** The text to scan: CSS minus comments, or TS reduced to its literals. */
function scannableSource(file, relativePath) {
  const raw = readFileSync(file, "utf8");
  if (isStylesheet(relativePath)) {
    // Comments are stripped so the long explanatory notes this repo writes in
    // its stylesheets, several of which quote the very literals being retired,
    // do not count as violations. Line numbers survive: newlines are kept.
    return {
      raw,
      scannable: raw.replace(/\/\*[\s\S]*?\*\//g, (block) =>
        block.replace(/[^\n]/g, " "),
      ),
    };
  }
  if (!MIGHT_HOLD_COLOUR.test(raw)) return null;
  return { raw, scannable: maskToStringLiterals(raw, file) };
}

const countByRule = new Map(RULES.map(({ id }) => [id, 0]));
const filesByRule = new Map(RULES.map(({ id }) => [id, new Map()]));
const samplesByRule = new Map(RULES.map(({ id }) => [id, []]));

function record(ruleId, relativePath, lineNumber, line, detail) {
  countByRule.set(ruleId, countByRule.get(ruleId) + 1);
  const perFile = filesByRule.get(ruleId);
  perFile.set(relativePath, (perFile.get(relativePath) ?? 0) + 1);
  const samples = samplesByRule.get(ruleId);
  if (samples.length < 8) {
    samples.push(
      `${relativePath}:${lineNumber}  ${detail}\n        ${line.trim().slice(0, 100)}`,
    );
  }
}

for (const file of walk(sourceDirectory)) {
  const fromRoot = relative(projectRoot, file);
  if (fromRoot.startsWith(`${EXEMPT_DIRECTORY}${sep}`)) continue;
  const relativePath = fromRoot.replace(/^src[/\\]/, "");
  const allowedFileEntry = allowedEntryFor(relativePath);
  const exemptions = allowedFileEntry?.rules ?? [];
  const allowedHexValues = allowedFileEntry?.hexValues;

  const texts = scannableSource(file, relativePath);
  if (texts === null) continue;
  const rawLines = texts.raw.split("\n");

  texts.scannable.split("\n").forEach((scannedLine, index) => {
    // `url(#…)` is an SVG fragment reference, not a colour; an inline data: URI
    // can carry a whole SVG palette that is content rather than chrome.
    const scannable = scannedLine.replace(/url\([^)]*\)/g, "");
    const lineNumber = index + 1;
    const line = rawLines[index] ?? scannedLine;

    for (const rule of RULES) {
      if (exemptions.includes(rule.exemptAs)) continue;
      if (!rule.appliesTo(relativePath)) continue;

      if (rule.exemptAs === "hex") {
        const hexLiterals = [...scannable.matchAll(rule.hexPattern)]
          .filter((match) => rule.isColourHex?.(scannable, match) ?? true)
          .map((match) => match[0]);
        const unlistedHex = allowedHexValues
          ? hexLiterals.filter(
              (literal) => !allowedHexValues.has(literal.toLowerCase()),
            )
          : hexLiterals;
        if (unlistedHex.length > 0) {
          record(
            rule.id,
            relativePath,
            lineNumber,
            line,
            hexDetail(unlistedHex),
          );
        }
        continue;
      }

      RGB_TRIPLE.lastIndex = 0;
      for (const match of scannable.matchAll(RGB_TRIPLE)) {
        const triple = `${Number(match[1])}, ${Number(match[2])}, ${Number(match[3])}`;
        if (ALLOWED_TRIPLES.has(triple)) continue;
        const known = KNOWN_TRIPLES.get(triple);
        record(
          rule.id,
          relativePath,
          lineNumber,
          line,
          known
            ? `raw channels ${triple}: use ${known}`
            : `raw channels ${triple}: no token carries this colour. Add one to tokens/colors.css, or derive it from an existing token with color-mix()`,
        );
      }
    }
  });
}

function readBudget() {
  try {
    return {
      budget: JSON.parse(readFileSync(budgetPath, "utf8")),
      exists: true,
    };
  } catch {
    return { budget: null, exists: false };
  }
}

function writeBudget() {
  const payload = {
    "//": [
      "Committed floor for scripts/check-design-tokens.mjs. Every number here is debt",
      "to pay down. `hex-in-modules` is a genuine zero and must stay one: that",
      "sweep finished on 2026-08-21. The `-in-ts` rules count colour literals in",
      "TS/TSX strings (DES-431, 2026-09-29). Lower a number with",
      "`node scripts/check-design-tokens.mjs --update-budget` after a cleanup; raising",
      "one is a hand edit that needs a written reason in the commit.",
    ].join(" "),
    ...Object.fromEntries(RULES.map(({ id }) => [id, countByRule.get(id)])),
  };
  writeFileSync(budgetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

const isUpdatingBudget = process.argv.includes("--update-budget");
const { budget, exists } = readBudget();

if (isUpdatingBudget) {
  if (exists) {
    const grown = RULES.filter(
      ({ id }) => countByRule.get(id) > (budget[id] ?? 0),
    );
    if (grown.length > 0) {
      console.error(
        "REFUSING to update the budget: these rules are ABOVE their committed " +
          "floor, so writing them in would lock the new debt in.\n",
      );
      for (const { id, label } of grown) {
        console.error(
          `  ${id}: ${countByRule.get(id)} > ${budget[id] ?? 0}  (${label})`,
        );
      }
      console.error(
        "\nFix the new violations first. If a rise is genuinely correct, edit " +
          "scripts/design-token-budget.json by hand and say why in the commit.",
      );
      process.exit(1);
    }
  }
  writeBudget();
  console.log(
    `${exists ? "Lowered" : "Wrote"} scripts/design-token-budget.json:\n`,
  );
  for (const { id, label } of RULES) {
    const previous = exists ? (budget[id] ?? 0) : null;
    console.log(
      `  ${String(countByRule.get(id)).padStart(5)}  ${id}: ${label}` +
        (previous === null ? "" : `  (was ${previous})`),
    );
  }
  process.exit(0);
}

if (!exists) {
  console.error(
    "DESIGN-TOKEN RATCHET ABORTED: scripts/design-token-budget.json is missing, " +
      "so there is no floor to measure against.\nGenerate it with " +
      "`node scripts/check-design-tokens.mjs --update-budget` and commit it.",
  );
  process.exit(1);
}

const failures = RULES.filter(
  ({ id }) => countByRule.get(id) > (budget[id] ?? 0),
);
const gains = RULES.filter(({ id }) => countByRule.get(id) < (budget[id] ?? 0));

console.log(
  "Design-token literals (src/**/*.{css,ts,tsx}, excluding styles/tokens and tests):\n",
);
for (const { id, label } of RULES) {
  const count = countByRule.get(id);
  const allowed = budget[id] ?? 0;
  const marker = count > allowed ? "✗" : count < allowed ? "↓" : "·";
  console.log(
    `  ${marker} ${String(count).padStart(5)} / ${String(allowed).padEnd(5)}  ${label}`,
  );
}

// `--by-file`: every file that counts toward each rule, largest first. The
// worklist for a cleanup pass.
if (process.argv.includes("--by-file")) {
  for (const { id, label } of RULES) {
    const perFile = [...filesByRule.get(id).entries()].sort(
      (first, second) => second[1] - first[1],
    );
    if (perFile.length === 0) continue;
    console.log(`\n${id} (${label}), ${perFile.length} files:`);
    for (const [relativePath, count] of perFile) {
      console.log(`  ${String(count).padStart(4)}  ${relativePath}`);
    }
  }
}

for (const { id, label } of failures) {
  const topFiles = [...filesByRule.get(id).entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 10);
  console.error(`\n${label}: over budget. Top files:`);
  for (const [relativePath, count] of topFiles) {
    console.error(`  ${String(count).padStart(4)}  ${relativePath}`);
  }
  console.error("  examples:");
  for (const sample of samplesByRule.get(id)) {
    console.error(`      ${sample}`);
  }
}

if (failures.length > 0) {
  console.error(
    "\nDESIGN-TOKEN RATCHET FAILED. Use a token from src/styles/tokens/. If a " +
      "literal is genuinely not a theme colour (a mask stencil, a flag, a video " +
      "letterbox, sticker art, an email or MapLibre palette), add the file to " +
      "ALLOWED_FILES (or its folder to ALLOWED_DIRECTORIES) in this script with " +
      "the RULE it is exempt from and the reason. Mock data with UI colours is " +
      "debt: tokenise it. `--by-file` lists every file that counts.",
  );
  process.exit(1);
}

if (gains.length > 0) {
  console.log(
    `\nUnder budget in ${gains.length} rule${gains.length === 1 ? "" : "s"}. ` +
      "Run `node scripts/check-design-tokens.mjs --update-budget` to lock the gain in.",
  );
} else {
  console.log("\nAt budget. Every rule holds.");
}
