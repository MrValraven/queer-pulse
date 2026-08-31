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
 *   font-size      → --text-8 … --text-20 (0.5 steps) and the role names
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
 *
 * WHAT COUNTS AS A VIOLATION
 *
 *   font-size      any `font-size` whose value still carries a px number once
 *                  var() references are removed. A hand-rolled
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
 *
 * WHAT IS DELIBERATELY NOT COUNTED
 *
 *   src/styles/tokens/  is skipped whole. That is where the literals are
 *                       legitimately defined; a token file is the one place a
 *                       raw px value is the point.
 *   rem / em / %        font sizes are not flagged. The scale is px-based, so
 *                       there is nothing to point a relative unit at, and the
 *                       handful in the tree are deliberate (icon-relative
 *                       sizing inside a component that already scales).
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
const RADIUS_PROPERTY =
  /^(?:border-radius|border-[a-z-]+-radius|--[\w-]*radius)$/;
const SHADOW_PROPERTY = /^(?:box-shadow|--[\w-]*shadow)$/;

/**
 * Which category a declaration violates, or null when it is fine. Values arrive
 * already comment-stripped; `property` is lowercased.
 */
function classify(property, rawValue) {
  const value = stripVarCalls(rawValue).trim();

  if (property === "font-size") {
    return PX_LITERAL.test(value) ? "font-size" : null;
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
  const text = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  for (const match of text.matchAll(DECLARATION)) {
    const property = match[1].toLowerCase();
    const value = match[2].trim();
    const category = classify(property, value);
    if (!category) continue;

    countByCategory.set(category, countByCategory.get(category) + 1);
    const perFile = filesByCategory.get(category);
    perFile.set(relativePath, (perFile.get(relativePath) ?? 0) + 1);

    const samples = samplesByCategory.get(category);
    if (samples.length < 6) {
      const line = text.slice(0, match.index).split("\n").length;
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
