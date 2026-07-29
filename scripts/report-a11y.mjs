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
 * Run: `pnpm lint:a11y`. Reporting only — it always exits 0 and never gates CI.
 */

import { execFileSync } from "node:child_process";

// ESLint exits non-zero whenever any error exists; its JSON report is still on
// stdout in that case, so read stdout off the thrown error too.
function runEslintJson() {
  try {
    return execFileSync("npx", ["eslint", ".", "--format", "json"], {
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    });
  } catch (error) {
    if (typeof error.stdout === "string" && error.stdout.length > 0) {
      return error.stdout;
    }
    throw error;
  }
}

const results = JSON.parse(runEslintJson());

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
  console.log("No jsx-a11y warnings. Promote the a11y rules to \"error\".");
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

console.log(
  `\n${countByFile.size} files affected. This is a reporting tool only — ` +
    "a11y rules stay at \"warn\" until each is driven to zero (see eslint.config.js).",
);
