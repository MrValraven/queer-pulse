#!/usr/bin/env node
/**
 * Accessibility-debt reporter for QueerPulse.
 *
 * Every `jsx-a11y/*` rule is configured at "warn" in eslint.config.js (the
 * existing tail of a11y debt is real but untriaged, so erroring would block
 * every build). Warnings are easy to ignore, though — `pnpm lint` buries them
 * under thousands of other warnings and nothing tracks the count. This script
 * surfaces JUST the accessibility warnings: a per-rule breakdown, the files
 * with the most hits, and a running total, so the debt is visible and its
 * trend is trackable as rules are driven to zero and promoted to "error".
 *
 * RATCHET: the total is held at/under BUDGET below (now 0 — the whole tail was
 * driven to zero on 2026-08-04). At or under budget the script exits 0; if the
 * count grows past it, the script exits 1 so the build (`pnpm build` runs this
 * first) blocks the new a11y debt. This covers EVERY jsx-a11y rule that is still
 * only "warn" in eslint.config.js — the accessible-name/ARIA-correctness rules
 * that hard-error through `pnpm lint` don't need it, but the interaction rules
 * (which legitimately take an occasional justified `eslint-disable`) are held at
 * zero here without the friction of erroring them.
 *
 * Run: `pnpm lint:a11y`.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

// A dedicated, fast a11y-only ESLint config (eslint.a11y.config.js) — it keeps
// the TypeScript parser but omits projectService, so it never boots the type
// checker the way the main config's recommendedTypeChecked does. That single
// change takes this pass from ~60s to a few seconds; --cache makes repeat runs
// near-instant. Both are pure speed: the jsx-a11y rule surface is imported from
// eslint.config.js, so the warnings counted here are exactly the gate's.
const CACHE_DIRECTORY = "node_modules/.cache/eslint-a11y";

// The most a11y warnings allowed before this gate fails. Currently 0: the tail
// is fully cleared. Only ever ratchet this DOWN, never up without a written
// reason — every increase is new a11y debt for a screen-reader-using audience.
const BUDGET = 0;

// ESLint exits non-zero whenever any error exists; its JSON report is still on
// stdout in that case, so read stdout off the thrown error too.
function runEslintJson() {
  mkdirSync(CACHE_DIRECTORY, { recursive: true });
  try {
    return execFileSync(
      "npx",
      [
        "eslint",
        ".",
        "--config",
        "eslint.a11y.config.js",
        "--cache",
        "--cache-location",
        `${CACHE_DIRECTORY}/`,
        "--format",
        "json",
      ],
      {
        encoding: "utf8",
        maxBuffer: 128 * 1024 * 1024,
      },
    );
  } catch (error) {
    if (typeof error.stdout === "string" && error.stdout.length > 0) {
      return error.stdout;
    }
    throw error;
  }
}

const results = JSON.parse(runEslintJson());

// Safety: a file ESLint cannot PARSE emits a fatal message (ruleId: null) and
// is otherwise absent from the a11y counts below — so a parse break would let a
// file sail past the ratchet unchecked. Since this pass runs its own parser
// setup (eslint.a11y.config.js), surface any fatal error loudly and fail rather
// than silently under-report. Real type errors are still the job of `tsc -b`.
const fatalErrors = results.flatMap((fileResult) =>
  fileResult.messages
    .filter((message) => message.fatal)
    .map((message) => ({
      filePath: fileResult.filePath.replace(`${process.cwd()}/`, ""),
      message: message.message,
    })),
);

if (fatalErrors.length > 0) {
  console.error(
    `A11Y RATCHET ABORTED: ${fatalErrors.length} file(s) failed to parse, so ` +
      "they were NOT accessibility-checked. Fix these before trusting the count:",
  );
  for (const { filePath, message } of fatalErrors) {
    console.error(`  ${filePath}: ${message}`);
  }
  process.exit(1);
}

const countByRule = new Map();
const countByFile = new Map();
let total = 0;

for (const fileResult of results) {
  for (const message of fileResult.messages) {
    if (!message.ruleId || !message.ruleId.startsWith("jsx-a11y/")) continue;
    total += 1;
    countByRule.set(message.ruleId, (countByRule.get(message.ruleId) ?? 0) + 1);
    const relativePath = fileResult.filePath.replace(`${process.cwd()}/`, "");
    countByFile.set(relativePath, (countByFile.get(relativePath) ?? 0) + 1);
  }
}

const sortedRules = [...countByRule.entries()].sort(
  (first, second) => second[1] - first[1],
);
const topFiles = [...countByFile.entries()]
  .sort((first, second) => second[1] - first[1])
  .slice(0, 15);

if (total === 0) {
  console.log(
    "No jsx-a11y warnings — the ratchet (BUDGET = 0) holds the whole set at zero.",
  );
  process.exit(0);
}

console.log(`Accessibility warnings (jsx-a11y): ${total}\n`);

console.log("By rule:");
for (const [ruleId, count] of sortedRules) {
  console.log(`  ${String(count).padStart(4)}  ${ruleId}`);
}

console.log(`\nTop ${topFiles.length} files:`);
for (const [relativePath, count] of topFiles) {
  console.log(`  ${String(count).padStart(4)}  ${relativePath}`);
}

console.log(`\n${countByFile.size} files affected.`);

// Ratchet: fail if the tail grew, nudge to lock in any gain, else pass.
if (total > BUDGET) {
  console.error(
    `\nA11Y RATCHET FAILED: ${total} warnings exceeds the budget of ${BUDGET}.\n` +
      `Fix the ${total - BUDGET} new one(s), or — only with a written reason — ` +
      "raise BUDGET in scripts/report-a11y.mjs.",
  );
  process.exit(1);
}

if (total < BUDGET) {
  console.log(
    `\nUnder budget (${total} < ${BUDGET}). Lower BUDGET to ${total} in ` +
      "scripts/report-a11y.mjs to lock in the gain (ratchet down).",
  );
} else {
  console.log(`\nAt budget (${BUDGET}). Drive rules to zero and promote them to "error".`);
}
