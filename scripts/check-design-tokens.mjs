#!/usr/bin/env node
/**
 * Design-token ratchet for CSS.
 *
 * Two rules, both of which were real bugs before this gate existed:
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
 * ALLOWLIST: a few literals are genuinely not theme colours and must stay. Mask
 * stencils (`#000` inside a `mask`/`-webkit-mask`) are opacity stencils, a video
 * letterbox is true black by definition, and a national flag's colours are
 * content. Each entry names the file, the rule it is exempt from, and why:
 * per-RULE rather than per-file, so a file excused for its `#000` mask stencils
 * is still held to the channel-triple rule.
 *
 * THE RATCHET. Widening the scope brought a body of pre-existing debt into
 * view that cannot be fixed in one pass, so the two rules are held at or under
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
      rules: ["hex"],
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
]);

// The channel triples that HAVE a token, and what to reach for instead. Kept in
// sync by hand with src/styles/tokens/colors.css and effects.css.
const KNOWN_TRIPLES = new Map([
  [
    "45, 27, 61",
    "var(--line-rgb) for a border or hairline (flips to cream in dark mode), var(--plum-rgb) for a background or shadow (does not)",
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

const HEX = /#[0-9a-fA-F]{3,8}\b/;
// Matches both the legacy comma form `rgba(45, 27, 61, .4)` and the modern
// space form `rgb(45 27 61 / 40%)`.
const RGB_TRIPLE =
  /rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\b/g;

const RULES = [
  {
    id: "hex-in-modules",
    label: "raw hex in a CSS Module",
    exemptAs: "hex",
    appliesTo: (relativePath) => relativePath.endsWith(".module.css"),
  },
  {
    id: "hex-in-global-css",
    label: "raw hex in a global stylesheet",
    exemptAs: "hex",
    appliesTo: (relativePath) => !relativePath.endsWith(".module.css"),
  },
  {
    id: "rgb-triple",
    label: "raw rgb()/rgba() channel triple",
    exemptAs: "rgb-triple",
    appliesTo: () => true,
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
  const exemptions = ALLOWED_FILES.get(relativePath)?.rules ?? [];

  // Comments are stripped so the long explanatory notes this repo writes in its
  // stylesheets, several of which quote the very literals being retired, do
  // not count as violations. Line numbers are preserved by keeping newlines.
  const source = readFileSync(file, "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    (block) => block.replace(/[^\n]/g, " "),
  );

  source.split("\n").forEach((line, index) => {
    // `url(#…)` is an SVG fragment reference, not a colour; an inline data: URI
    // can carry a whole SVG palette that is content rather than chrome.
    const scannable = line.replace(/url\([^)]*\)/g, "");
    const lineNumber = index + 1;

    for (const rule of RULES) {
      if (exemptions.includes(rule.exemptAs)) continue;
      if (!rule.appliesTo(relativePath)) continue;

      if (rule.exemptAs === "hex") {
        if (HEX.test(scannable)) {
          record(
            rule.id,
            relativePath,
            lineNumber,
            line,
            "raw hex, use a design token",
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
      "sweep finished on 2026-08-21. Lower a number with",
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

console.log("Design-token literals (src/**/*.css, excluding styles/tokens):\n");
for (const { id, label } of RULES) {
  const count = countByRule.get(id);
  const allowed = budget[id] ?? 0;
  const marker = count > allowed ? "✗" : count < allowed ? "↓" : "·";
  console.log(
    `  ${marker} ${String(count).padStart(5)} / ${String(allowed).padEnd(5)}  ${label}`,
  );
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
      "letterbox), add the file to ALLOWED_FILES in this script with the RULE it " +
      "is exempt from and the reason.",
  );
  process.exit(1);
}

if (gains.length > 0) {
  console.log(
    `\nUnder budget in ${gains.length} rule${gains.length === 1 ? "" : "s"}. ` +
      "Run `node scripts/check-design-tokens.mjs --update-budget` to lock the gain in.",
  );
} else {
  console.log("\nAt budget. Both rules hold.");
}
