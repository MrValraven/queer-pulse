#!/usr/bin/env node
/**
 * Design-token ratchet for CSS Modules.
 *
 * Two rules, both of which were real bugs before this gate existed:
 *
 * 1. NO RAW HEX in a feature/shared `*.module.css`. Hardcoded colour does not
 *    follow a token change and, worse, does not flip in dark mode. 477 literals
 *    were converted on 2026-08-21; this stops them coming back.
 *
 * 2. NO RAW PLUM CHANNELS `rgba(45, 27, 61, …)`. That is the light-mode plum
 *    written out by hand. As a BORDER it must be `rgba(var(--line-rgb), …)`,
 *    which flips to cream in dark mode; as a background or shadow it must be
 *    `rgba(var(--plum-rgb), …)`. 219 borders were invisible in dark mode.
 *
 * ALLOWLIST: a few literals are genuinely not theme colours and must stay.
 * Mask stencils (`#000` inside a `mask`/`-webkit-mask`) are opacity stencils,
 * a video letterbox is true black by definition, and a national flag's colours
 * are content. Each entry names the file and why.
 *
 * Run: node scripts/check-design-tokens.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const sourceDirectory = join(scriptDirectory, "..", "src");

// file suffix → why its literals are allowed to stay
const ALLOWED_FILES = new Map([
  [
    "features/cinema/WatchPage.module.css",
    "video letterbox is true black regardless of theme",
  ],
  [
    "features/members/BadgesPage.module.css",
    "#000 inside radial-gradient masks: an opacity stencil, not a colour",
  ],
  [
    "features/onboarding/GettingStartedPage.module.css",
    "#000 inside a radial-gradient mask: an opacity stencil, not a colour",
  ],
  [
    "features/studio/StudioEndCardPage.module.css",
    "#000 gradient stops used as a fade stencil",
  ],
  [
    "features/system/GeoRestrictedPage.module.css",
    "Portuguese flag colours are content and must not shift with the theme",
  ],
  [
    "features/marketing/venueMarker.module.css",
    "category pin colours are data-driven content",
  ],
]);

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RAW_PLUM = /rgba\(\s*45,\s*27,\s*61\s*,/g;

function walk(directory, out = []) {
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".module.css")) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(sourceDirectory)) {
  const relativePath = relative(join(scriptDirectory, ".."), file).replace(
    /^src\//,
    "",
  );
  if ([...ALLOWED_FILES.keys()].some((allowed) => relativePath === allowed)) {
    continue;
  }
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    // `url(#…)` is an SVG fragment reference, not a colour.
    const withoutUrls = line.replace(/url\([^)]*\)/g, "");
    for (const [pattern, rule] of [
      [HEX, "raw hex, use a design token"],
      [RAW_PLUM, "raw plum channels, use var(--line-rgb) or var(--plum-rgb)"],
    ]) {
      pattern.lastIndex = 0;
      if (pattern.test(withoutUrls)) {
        violations.push(
          `    ${relativePath}:${index + 1}  ${rule}\n      ${line.trim()}`,
        );
      }
    }
  });
}

if (violations.length > 0) {
  console.error(
    `Design-token violations in ${violations.length} place(s):\n`,
  );
  for (const violation of violations) console.error(violation);
  console.error(
    "\nUse a token from src/styles/tokens/. If a literal is genuinely not a " +
      "theme colour (a mask stencil, a flag, a video letterbox), add the file " +
      "to ALLOWED_FILES in this script with the reason.",
  );
  process.exit(1);
}

console.log("Design tokens: no raw hex or raw plum channels in CSS Modules.");
