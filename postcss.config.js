// PostCSS configuration — auto-discovered by Vite (and the `postcss` CLI).
//
// Its one job: resolve the `@custom-media` breakpoint tokens authored in
// `src/styles/tokens/breakpoints.css` (e.g. `@media (--mobile) { … }`) into
// plain media queries at build time.
//
// THE CSS-MODULES PROBLEM. `postcss-custom-media` compiles every CSS / CSS
// Module file in isolation, so a `@custom-media` defined in one file is NOT
// visible in another — the tokens would silently fail to resolve everywhere
// except the file that declares them. The upstream fix is
// `@csstools/postcss-global-data`, but to avoid a second dependency we inline
// an equivalent below: a tiny plugin that reads the shared `@custom-media`
// declarations from breakpoints.css once and prepends them to every other file
// before `postcss-custom-media` runs. `postcss-custom-media` then resolves the
// tokens per-file and (with the default `preserve: false`) strips the injected
// `@custom-media` at-rules, so nothing extra reaches the output.
//
// Plugin ORDER matters: the global-data injector MUST run before
// `postcss-custom-media`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcssCustomMedia from "postcss-custom-media";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const definitionsPath = path.join(
  configDir,
  "src",
  "styles",
  "tokens",
  "breakpoints.css",
);

// Extract just the `@custom-media …;` declaration lines from the shared token
// file, at config-load time. breakpoints.css stays the single source of truth;
// this config never re-declares the values.
const definitionsSource = fs.readFileSync(definitionsPath, "utf8");
const customMediaDefinitions = definitionsSource
  .split("\n")
  .filter((line) => line.trim().startsWith("@custom-media"))
  // Drop any trailing `/* … */` doc comment so it doesn't survive as a stray
  // comment node once the `@custom-media` at-rule is stripped from output.
  .map((line) => line.replace(/\/\*[^]*?\*\//g, "").trimEnd())
  .join("\n");

// Authored as a PostCSS 8 plugin factory (a function returning the plugin
// object, with `.postcss = true`). The `plugins` array below passes the INVOKED
// instance so every config loader (Vite and the `postcss` CLI alike) treats it
// as an already-initialised plugin rather than trying to call it a second time.
const inlineGlobalCustomMedia = () => ({
  postcssPlugin: "inline-global-custom-media",
  Once(root, { result }) {
    if (!customMediaDefinitions) return;
    // Skip the definitions file itself — it already carries the declarations,
    // and re-prepending would just duplicate them (harmless, but pointless).
    const sourceFile = result.opts.from || "";
    if (sourceFile.replace(/\\/g, "/").endsWith("tokens/breakpoints.css")) {
      return;
    }
    root.prepend(customMediaDefinitions + "\n");
  },
});
inlineGlobalCustomMedia.postcss = true;

export default {
  plugins: [inlineGlobalCustomMedia(), postcssCustomMedia()],
};
