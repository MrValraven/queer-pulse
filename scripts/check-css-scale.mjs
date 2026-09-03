#!/usr/bin/env node
/**
 * CSS scale ratchet: the gate the design system never had.
 *
 * `check-design-tokens.mjs` guards COLOUR and nothing else. Nothing guarded the
 * other four primitive scales, and a deep scan on 2026-08-31 found what that
 * costs: 8,573 literal `font-size` values against 89 token uses, 2,999 literal
 * radii over 31 distinct steps, 570 hand-written `box-shadow` strings, and 156
 * raw `z-index` numbers with feature overlays parked at 1000, above the shared
 * Modal at 220, so a dialog opened from those surfaces rendered UNDER it. The
 * design system existed on paper and was bypassed in practice because writing a
 * literal was free.
 *
 * The scales those literals were converted to live in src/styles/tokens/:
 *   font-size      → --text-8 … --text-64 (0.5 steps to 20, then integers) and
 *                    the role names
 *                    (--text-body, --text-caption, --text-label, --text-eyebrow)
 *                    plus the fluid display set (--text-hero, --text-display,
 *                    --text-title, --text-heading)
 *   border-radius  → --radius-1 … --radius-30 and the role names
 *                    (--radius-tag, --radius-badge, --radius-panel,
 *                    --radius-card, --radius-pill, --radius-avatar)
 *   box-shadow     → the elevation scale --shadow-e1 … --shadow-e4 with
 *                    --shadow-lift for hover, and the --ring-* set for focus
 *                    and selection state
 *   z-index        → the named stacking order in tokens/layers.css
 *                    (--z-raised … --z-toast)
 *   section padding → --section-y-48 … --section-y-200 in tokens/spacing.css,
 *                    an 8px grid to 128 then coarser, plus --section-y and
 *                    --section-y-lg
 *   border colour  → --line-rgb (and the ready-made --line, --line-2,
 *                    --line-strong) in tokens/colors.css
 *   text colour    → --text-strong for plum-coloured type, rgba(var(--ink-rgb),
 *                    …) for faint type, and rgba(var(--cream-rgb), …) for type
 *                    sitting on a locked-dark fill
 *
 * WHAT COUNTS AS A VIOLATION
 *
 *   font-size      any `font-size` whose value still carries a px OR rem number
 *                  once var() references are removed. A hand-rolled
 *                  `clamp(28px, 4vw, 44px)` counts too: the four fluid display
 *                  tokens exist precisely so headings on adjacent pages scale
 *                  by the same curve, and the app shipped ~450 distinct curves.
 *   border-radius  any `border-radius` (or longhand, or a `--*-radius` custom
 *                  property) whose value still carries a px number. Percentages
 *                  are fine: `50%` draws a circle.
 *   box-shadow     any `box-shadow` (or `--*-shadow` custom property) with
 *                  anything left in it once var() references are removed.
 *                  `none` and a list of pure var() references pass.
 *   z-index        any numeric `z-index` above 3. Small in-component layering
 *                  (a badge over an avatar, a gradient over an image) stays a
 *                  bare 1/2/3 by design. See the rules comment at the top of
 *                  tokens/layers.css. Negative values (a decorative layer
 *                  pushed behind its own content) are local too and pass.
 *   section-padding a `padding` whose VERTICAL slot carries a px literal of 48
 *                  or more. Shorthand order decides which slot is vertical, so
 *                  see verticalPaddingParts() below. 48px is the floor because
 *                  below it the number is component padding, not the space
 *                  between sections, and this scale is only about the latter.
 *   non-flipping-  a `color` reading --plum, --plum-deep, --plum-rgb or --cream.
 *   text           The first three never flip, so such type stays near-black on
 *                  the dark page; --cream flips the WRONG way, to near-black, so
 *                  cream type on a locked-dark fill vanishes there too. This is
 *                  the bug that made 187 labels unreadable in dark mode before
 *                  the 2026-09-03 sweep, and nothing was watching for it: the
 *                  gate below guarded EDGES built on --plum-rgb and no more.
 *                  A var() FALLBACK position is not counted. `var(--ink-60,
 *                  rgba(var(--plum-rgb), 0.6))` only reaches the fallback if the
 *                  primary is undefined, which is a different bug from this one.
 *                  Genuine exceptions exist: type on a ground that is light in
 *                  BOTH themes (a cream card skin, a coral or amber fill) must
 *                  stay dark. Mark those in a comment on, or within the six
 *                  lines above, the declaration. See NON_FLIPPING_TEXT_ALLOW.
 *   plum-border    a border or outline colour reading `var(--plum-rgb)`.
 *                  Checked BEFORE the var() strip, because here the var()
 *                  reference IS the bug: --plum-rgb never flips, so such a
 *                  hairline is near-invisible in dark mode. --line-rgb resolves
 *                  to --plum-rgb in light and flips in dark, which makes the
 *                  swap provably a no-op in light mode.
 *
 * WHAT IS DELIBERATELY NOT COUNTED
 *
 *   src/styles/tokens/  is skipped whole. That is where the literals are
 *                       legitimately defined; a token file is the one place a
 *                       raw px value is the point.
 *   em / % font sizes   not flagged; both are already relative to something
 *                       real. rem USED to be exempt here on the reasoning that
 *                       the scale was px-based so a relative unit pointed at
 *                       nothing. That stopped being true on 2026-09-01 when the
 *                       scale went rem: every rem the app needs is now a token,
 *                       and a hand-written one (`0.85rem` = 13.6px) is the
 *                       second unit system this gate exists to keep out.
 *   plum backgrounds,   NOT flagged, and must not be. `background`, `box-shadow`
 *   fills, shadows      and gradients read --plum-rgb on purpose: they are meant
 *                       to stay plum in both themes. Only an EDGE, and the TYPE
 *                       sitting on it, has to flip.
 *   fill / stroke,      left alone. A plum `stroke` on a spot illustration or a
 *   text-decoration-    graph axis is usually decorative, often inside an SVG
 *   color, scrollbar-   carrying its own ground, and there are ~29 in the tree
 *   color               that would need judging one at a time. Underline and
 *                       scrollbar colours built on --plum-rgb are the same
 *                       defect as plum-border, but they are chrome rather than
 *                       letters. Both are real debt; neither is gated yet.
 *   padding under 48px, horizontal padding of any size, and the single-value
 *                       `padding: Npx` shorthand (see verticalPaddingParts).
 *                       Gutters are --wrap-px and the --gap-* set.
 *   text-shadow,        left alone. They are rare, they carry no elevation
 *   filter: drop-shadow meaning, and there is no token scale for them yet.
 *
 * THE RATCHET
 *
 * Each category is held at or under its committed budget in
 * scripts/css-scale-budget.json. A count that GROWS fails the build; a count
 * that shrinks is a gain to lock in with `--update-budget`, which only ever
 * writes budgets DOWNWARD. Raising a budget is not something this script will
 * do for you: if a number has to go up, edit the JSON by hand and say why in
 * the commit, the same discipline the a11y ratchet in report-a11y.mjs uses.
 *
 * Run: `pnpm check:css-scale`
 * Re-baseline after a cleanup: `node scripts/check-css-scale.mjs --update-budget`
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDirectory, "..");
const sourceDirectory = join(projectRoot, "src");
const budgetPath = join(scriptDirectory, "css-scale-budget.json");

// The token definitions themselves. Everything under here is exempt: this is
// the one directory where writing `--radius-12: 12px` is the correct answer.
const EXEMPT_DIRECTORY = join("src", "styles", "tokens");

const CATEGORIES = [
  {
    id: "font-size",
    label: "literal px font-size",
    fix: "use a --text-* step or a role name (--text-body, --text-caption, --text-label)",
  },
  {
    id: "border-radius",
    label: "literal px border-radius",
    fix: "use a --radius-* step or a role name (--radius-card, --radius-panel, --radius-tag, --radius-pill)",
  },
  {
    id: "box-shadow",
    label: "literal box-shadow",
    fix: "use an elevation step (--shadow-e1 … --shadow-e4, --shadow-lift) or a --ring-* for focus/selection state",
  },
  {
    id: "z-index",
    label: "raw z-index above 3",
    fix: "use a layer token from tokens/layers.css (--z-sticky, --z-nav, --z-popover, --z-modal, --z-lightbox, --z-toast)",
  },
  {
    id: "section-padding",
    label: "literal vertical section padding (>= 48px)",
    fix: "use a --section-y-* step from tokens/spacing.css (48 to 128 on an 8px grid, then 144/160/180/200)",
  },
  {
    id: "non-flipping-text",
    label: "text colour that does not flip in dark mode",
    fix: "use --text-strong for plum type (identical in light), rgba(var(--ink-rgb), …) for faint type, or rgba(var(--cream-rgb), …) for type on a locked-dark fill",
  },
  {
    id: "plum-border",
    label: "border built on --plum-rgb, which does not flip in dark mode",
    fix: "use rgba(var(--line-rgb), …) — identical in light, correct in dark — or the ready-made --line / --line-2 / --line-strong",
  },
];

function walk(directory, out = []) {
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".css")) out.push(full);
  }
  return out;
}

/**
 * Remove every `var(…)` call, parens balanced, so what is left is only the
 * literal part of a value. `box-shadow: var(--shadow-e1)` leaves nothing;
 * `box-shadow: 0 0 0 3px var(--x)` leaves the `0 0 0 3px` that is the problem.
 * A naive /var\([^)]*\)/ breaks on the fallback form `var(--a, rgba(0,0,0,.2))`,
 * which is exactly where a literal likes to hide.
 */
function stripVarCalls(value) {
  let result = "";
  let index = 0;
  while (index < value.length) {
    const start = value.indexOf("var(", index);
    if (start === -1) {
      result += value.slice(index);
      break;
    }
    result += value.slice(index, start);
    let depth = 0;
    let cursor = start + "var".length;
    for (; cursor < value.length; cursor += 1) {
      if (value[cursor] === "(") depth += 1;
      else if (value[cursor] === ")") {
        depth -= 1;
        if (depth === 0) {
          cursor += 1;
          break;
        }
      }
    }
    index = cursor;
  }
  return result;
}

const PX_LITERAL = /(?:^|[^\w-])\d+(?:\.\d+)?px\b/;
// font-size only: rem counts as a literal too. The scale went rem on
// 2026-09-01 (see the unit note in tokens/typography.css), so `0.85rem` is no
// longer "a deliberate relative size" — it is 13.6px written by hand, and the
// whole reason the app had two unit systems. Every rem the app needs is a token.
const TYPE_LITERAL = /(?:^|[^\w-])\d+(?:\.\d+)?(?:px|rem)\b/;
const RADIUS_PROPERTY =
  /^(?:border-radius|border-[a-z-]+-radius|--[\w-]*radius)$/;
const SHADOW_PROPERTY = /^(?:box-shadow|--[\w-]*shadow)$/;
const PADDING_PROPERTY =
  /^(?:padding|padding-block|padding-block-start|padding-block-end|padding-top|padding-bottom)$/;
// A border or outline whose COLOUR is the one that must flip in dark mode.
// Deliberately not `background`, `color`, `box-shadow` or a gradient: those read
// --plum-rgb on purpose, because they are supposed to stay plum.
// The type whose colour has to follow the theme. Only `color` and its
// -webkit alias: `fill`/`stroke` are usually decorative SVG (see the header),
// and `text-decoration-color` is an edge, not a letter.
const FLIPPING_TEXT_PROPERTY = /^(?:color|-webkit-text-fill-color)$/;
// --plum / --plum-deep / --plum-rgb never flip, so type built on them stays
// near-black on the dark page. --cream flips the WRONG way for type, to
// near-black, so cream type on a locked-dark fill vanishes there.
const NON_FLIPPING_TEXT_VALUE =
  /var\(\s*--(?:plum-deep|plum-rgb|plum|cream)\s*[,)]/;
// A var() FALLBACK is not this bug: `var(--ink-60, rgba(var(--plum-rgb), 0.6))`
// only reaches the plum if --ink-60 is undefined, which never happens for a
// global token. Detected as "a var() whose first argument is followed by a
// comma", which is the only shape a fallback can take.
const HAS_VAR_FALLBACK = /var\(\s*--[\w-]+\s*,/;
// Opt-out for the genuine exception: type on a ground that is light in BOTH
// themes (a cream card skin, a coral or amber fill) must stay dark, and
// --text-strong would flip it to light ink and make it vanish there instead.
const NON_FLIPPING_TEXT_ALLOW = "css-scale-allow: non-flipping-text";
const NON_FLIPPING_TEXT_ALLOW_REACH = 6;

const FLIPPING_EDGE_PROPERTY =
  /^(?:border|border-top|border-right|border-bottom|border-left|border-block|border-inline|border-(?:top|right|bottom|left|block|inline)(?:-start|-end)?|border-color|border-[a-z-]+-color|outline|outline-color)$/;
const SECTION_PADDING_FLOOR = 48;

/**
 * The vertical slots of a padding declaration, which is the only part this gate
 * cares about: horizontal gutters are --wrap-px's job, not the rhythm scale's.
 * Shorthand order is the whole difficulty, so it is spelled out rather than
 * inferred:
 *   padding: A            NOT COUNTED — see below
 *   padding: A B          A vertical
 *   padding: A B C        A top, C bottom
 *   padding: A B C D      A top, C bottom
 *   padding-block: A [B]  both vertical
 *
 * Slots are split paren-aware and on the RAW value, so `var(--x)`,
 * `max(48px, env(safe-area-inset-bottom))` and `calc(…)` each occupy exactly
 * one slot rather than being torn apart or deleted.
 *
 * The single-value shorthand is deliberately exempt. `padding: 48px` sets all
 * four sides to the same number, and a box padded equally on every side is
 * component padding — a callout card, a CTA panel — not the space between
 * sections. Vertical rhythm is by definition the asymmetry between the two
 * axes, so a declaration with no asymmetry has nothing to say about it, and
 * putting a --section-y-* token there would set the HORIZONTAL padding from the
 * rhythm scale too. Three separate reviewers reached that conclusion
 * independently on the four sites in the tree (a CTA card, a plum callout, a
 * two-column feature panel and a talk box), which is what settled it.
 */
function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const character of value) {
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    if (depth === 0 && /\s/.test(character)) {
      if (current) parts.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  if (current) parts.push(current);
  return parts;
}

function verticalPaddingParts(property, value) {
  const parts = splitTopLevel(value);
  if (parts.length === 0) return [];
  if (property === "padding-top" || property === "padding-bottom") {
    return parts.slice(0, 1);
  }
  if (property.startsWith("padding-block")) return parts.slice(0, 2);
  if (parts.length === 1) return [];
  if (parts.length === 2) return parts.slice(0, 1);
  return [parts[0], parts[2]];
}

/**
 * Which category a declaration violates, or null when it is fine. Values arrive
 * already comment-stripped; `property` is lowercased.
 */
function classify(property, rawValue) {
  // Checked BEFORE the var() strip, because the whole violation here IS a
  // var() reference: rgba(var(--plum-rgb), 0.1) on an edge.
  if (
    FLIPPING_EDGE_PROPERTY.test(property) &&
    /var\(\s*--plum-rgb\s*[,)]/.test(rawValue)
  ) {
    return "plum-border";
  }

  // Same reasoning, and the same reason it runs before the strip: the var()
  // reference IS the violation.
  if (
    FLIPPING_TEXT_PROPERTY.test(property) &&
    NON_FLIPPING_TEXT_VALUE.test(rawValue) &&
    !HAS_VAR_FALLBACK.test(rawValue)
  ) {
    return "non-flipping-text";
  }

  const value = stripVarCalls(rawValue).trim();

  if (property === "font-size") {
    return TYPE_LITERAL.test(value) ? "font-size" : null;
  }
  if (PADDING_PROPERTY.test(property)) {
    // Deliberately the RAW value, not the var()-stripped one. Stripping first
    // deletes a slot and SHIFTS every later value left, so
    // `padding: var(--section-y-56) 52px 46px` reads as `52px 46px` and the
    // horizontal 52px gets mistaken for the vertical position. Two such
    // declarations in the tree were false positives before this was fixed.
    const isOverFloor = verticalPaddingParts(property, rawValue).some(
      (part) => {
        const match = /^(\d+(?:\.\d+)?)px$/.exec(part);
        return match !== null && Number(match[1]) >= SECTION_PADDING_FLOOR;
      },
    );
    return isOverFloor ? "section-padding" : null;
  }
  if (RADIUS_PROPERTY.test(property)) {
    return PX_LITERAL.test(value) ? "border-radius" : null;
  }
  if (SHADOW_PROPERTY.test(property)) {
    // Anything with a number or a colour left after the var() strip is a
    // hand-written shadow. `none`, `inset`, and a comma-separated list of pure
    // var() references all reduce to punctuation and keywords.
    return /\d/.test(value) || /#|rgb|hsl|color-mix/i.test(value)
      ? "box-shadow"
      : null;
  }
  if (property === "z-index") {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 3 ? "z-index" : null;
  }
  return null;
}

// A declaration always follows `{`, `;` or `}`, so anchoring on those keeps the
// match off selectors (`.card:hover`) and at-rule preludes. The value runs to
// the next `;` or brace, which lets a multi-line box-shadow through intact.
const DECLARATION = /(?:^|[;{}])\s*(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;{}]*)/g;

const countByCategory = new Map(CATEGORIES.map(({ id }) => [id, 0]));
const filesByCategory = new Map(CATEGORIES.map(({ id }) => [id, new Map()]));
const samplesByCategory = new Map(CATEGORIES.map(({ id }) => [id, []]));

for (const file of walk(sourceDirectory)) {
  const relativePath = relative(projectRoot, file);
  if (relativePath.startsWith(`${EXEMPT_DIRECTORY}${sep}`)) continue;

  // Strip comments first: this repo writes long explanatory comments in its
  // stylesheets, and several of them quote the very literals being retired.
  // Blanked to spaces rather than deleted, so every offset and line number
  // still lines up with the file on disk. The old outright deletion pulled
  // later lines upward and mis-reported every sample below a block comment.
  const raw = readFileSync(file, "utf8");
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  );

  // Lines carrying the non-flipping-text opt-out. Read from `raw`, since the
  // marker lives in the very comments blanked out above.
  const allowLines = new Set();
  raw.split("\n").forEach((line, index) => {
    if (line.includes(NON_FLIPPING_TEXT_ALLOW)) allowLines.add(index + 1);
  });
  const isAllowed = (line) => {
    for (let above = 0; above <= NON_FLIPPING_TEXT_ALLOW_REACH; above += 1) {
      if (allowLines.has(line - above)) return true;
    }
    return false;
  };

  for (const match of text.matchAll(DECLARATION)) {
    const property = match[1].toLowerCase();
    const value = match[2].trim();
    const category = classify(property, value);
    if (!category) continue;

    // Anchored on the VALUE, not on match.index: DECLARATION starts at the
    // preceding `;`/`{`/`}`, which for the first declaration in a rule sits on
    // the selector line, ABOVE any comment between the two. That put the line
    // number before the opt-out marker rather than after it.
    const valueOffset = match.index + match[0].length - match[2].length;
    const line = text.slice(0, valueOffset).split("\n").length;
    if (category === "non-flipping-text" && isAllowed(line)) continue;

    countByCategory.set(category, countByCategory.get(category) + 1);
    const perFile = filesByCategory.get(category);
    perFile.set(relativePath, (perFile.get(relativePath) ?? 0) + 1);

    const samples = samplesByCategory.get(category);
    if (samples.length < 6) {
      samples.push(
        `${relativePath}:${line}  ${property}: ${value.replace(/\s+/g, " ").slice(0, 80)}`,
      );
    }
  }
}

function readBudget() {
  try {
    const parsed = JSON.parse(readFileSync(budgetPath, "utf8"));
    return { budget: parsed, exists: true };
  } catch {
    return { budget: null, exists: false };
  }
}

function writeBudget(counts) {
  const payload = {
    "//": [
      "Committed floor for scripts/check-css-scale.mjs. Every number here is debt",
      "to pay down. Lower it with `node scripts/check-css-scale.mjs",
      "--update-budget` after a cleanup; raising one is a hand edit that needs a",
      "written reason in the commit, the same rule as BUDGET in report-a11y.mjs.",
    ].join(" "),
    ...Object.fromEntries(CATEGORIES.map(({ id }) => [id, counts.get(id)])),
  };
  writeFileSync(budgetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

const isUpdatingBudget = process.argv.includes("--update-budget");
const { budget, exists } = readBudget();

if (isUpdatingBudget) {
  if (exists) {
    // Lowering is the only sanctioned move. If a count has grown, rewriting the
    // file would launder new debt into the baseline, which is the exact
    // failure mode a ratchet exists to prevent.
    const grown = CATEGORIES.filter(
      ({ id }) => countByCategory.get(id) > (budget[id] ?? 0),
    );
    if (grown.length > 0) {
      console.error(
        "REFUSING to update the budget: these categories are ABOVE their " +
          "committed floor, so writing them in would lock the new debt in.\n",
      );
      for (const { id, label, fix } of grown) {
        console.error(
          `  ${id}: ${countByCategory.get(id)} > ${budget[id] ?? 0}  (${label})\n    ${fix}`,
        );
      }
      console.error(
        "\nFix the new violations first. If a rise is genuinely correct, edit " +
          "scripts/css-scale-budget.json by hand and say why in the commit.",
      );
      process.exit(1);
    }
  }
  writeBudget(countByCategory);
  console.log(
    `${exists ? "Lowered" : "Wrote"} scripts/css-scale-budget.json:\n`,
  );
  for (const { id, label } of CATEGORIES) {
    const previous = exists ? (budget[id] ?? 0) : null;
    const now = countByCategory.get(id);
    const arrow = previous === null ? "" : `  (was ${previous})`;
    console.log(`  ${String(now).padStart(5)}  ${id}: ${label}${arrow}`);
  }
  process.exit(0);
}

if (!exists) {
  console.error(
    "CSS SCALE RATCHET ABORTED: scripts/css-scale-budget.json is missing, so " +
      "there is no floor to measure against.\nGenerate it with " +
      "`node scripts/check-css-scale.mjs --update-budget` and commit it.",
  );
  process.exit(1);
}

const failures = CATEGORIES.filter(
  ({ id }) => countByCategory.get(id) > (budget[id] ?? 0),
);
const gains = CATEGORIES.filter(
  ({ id }) => countByCategory.get(id) < (budget[id] ?? 0),
);

console.log("CSS scale literals (src/**/*.css, excluding styles/tokens):\n");
for (const { id, label } of CATEGORIES) {
  const count = countByCategory.get(id);
  const allowed = budget[id] ?? 0;
  const marker = count > allowed ? "✗" : count < allowed ? "↓" : "·";
  console.log(
    `  ${marker} ${String(count).padStart(5)} / ${String(allowed).padEnd(5)}  ${label}`,
  );
}

// Only the failing categories get a file breakdown. A passing category's list
// is a wall of known debt nobody is being asked to act on right now.
for (const { id, label, fix } of failures) {
  const topFiles = [...filesByCategory.get(id).entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 10);
  console.error(`\n${label}: over budget. Top files:`);
  for (const [relativePath, count] of topFiles) {
    console.error(`  ${String(count).padStart(4)}  ${relativePath}`);
  }
  console.error("  examples:");
  for (const sample of samplesByCategory.get(id)) {
    console.error(`    ${sample}`);
  }
  console.error(`  fix: ${fix}`);
}

if (failures.length > 0) {
  console.error(
    `\nCSS SCALE RATCHET FAILED in ${failures.length} categor` +
      `${failures.length === 1 ? "y" : "ies"}. Point the new declarations at a ` +
      "token from src/styles/tokens/.\nIf a literal is genuinely unrepresentable " +
      "as a token, raise its budget by hand in scripts/css-scale-budget.json " +
      "with a written reason. `--update-budget` will not do it for you.",
  );
  process.exit(1);
}

if (gains.length > 0) {
  console.log(
    `\nUnder budget in ${gains.length} categor${gains.length === 1 ? "y" : "ies"}. ` +
      "Run `node scripts/check-css-scale.mjs --update-budget` to lock the gain in.",
  );
} else {
  console.log("\nAt budget. Every category holds.");
}
