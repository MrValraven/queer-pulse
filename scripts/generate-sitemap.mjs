#!/usr/bin/env node
/**
 * Build-time sitemap generator for QueerPulse.
 *
 * Emits `public/sitemap.xml` listing ONLY public routes. Run manually via the
 * `sitemap` package.json script (see repo README/report) — it is intentionally
 * NOT wired into the main `build` and NOT required in CI. Because `public/` is
 * copied verbatim into `dist/`, the generated file ships as `/sitemap.xml`.
 *
 * The public path list and the gated-path check both live in
 * `./publicPaths.mjs` (shared with the prerenderer), which is in turn a mirror
 * of `src/app/authGate.ts` (GATED_PATTERNS / PUBLIC_EXCEPTIONS). If you change
 * authGate, mirror it in publicPaths.mjs.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { QUIET_PUBLIC_PATHS, assertNoGatedPaths } from "./publicPaths.mjs";

const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN ?? "https://queerpulse.com";

// --- Guard: no gated path may leak in ---------------------------------------
assertNoGatedPaths(QUIET_PUBLIC_PATHS);

// De-dupe defensively (QUIET_PUBLIC_PATHS is asserted duplicate-free upstream).
const uniquePaths = [...new Set(QUIET_PUBLIC_PATHS)];

const lastmod = new Date().toISOString().slice(0, 10);
const urls = uniquePaths
  .map((publicPath) => {
    const loc = `${SITE_ORIGIN}${publicPath === "/" ? "/" : publicPath}`;
    const priority = publicPath === "/" ? "1.0" : "0.7";
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "sitemap.xml",
);
writeFileSync(outPath, xml, "utf8");
console.log(
  `[sitemap] Wrote ${uniquePaths.length} public URLs to ${outPath} (origin ${SITE_ORIGIN})`,
);
