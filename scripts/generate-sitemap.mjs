#!/usr/bin/env node
/**
 * Build-time sitemap generator for QueerPulse.
 *
 * Emits `public/sitemap.xml` listing ONLY public routes. Wired into `build`
 * (before `vite build`, which copies `public/` verbatim into `dist/`).
 *
 * The sitemap lists the FULL public surface (QUIET_PUBLIC_PATHS + dynamic
 * personas). It deliberately DIVERGES from the prerendered set: prerendering
 * bakes only PRERENDER_PATHS (a minimal subset — see ./prerender.mjs) to save
 * build data, but the sitemap costs nothing per URL, so it keeps advertising
 * every public page to search engines (Googlebot renders JS and finds them).
 *
 * The public path list and the gated-path check both live in
 * `./publicPaths.mjs`, which is in turn a mirror of `src/app/authGate.ts`
 * (GATED_PATTERNS / PUBLIC_EXCEPTIONS). If you change authGate, mirror it in
 * publicPaths.mjs.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  QUIET_PUBLIC_PATHS,
  assertNoGatedPaths,
  fetchSubprofilePublicPaths,
} from "./publicPaths.mjs";

const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN ?? "https://queerpulse.com";

async function main() {
  // --- Guard: no gated path may leak in -------------------------------------
  assertNoGatedPaths(QUIET_PUBLIC_PATHS);

  // De-dupe defensively (QUIET_PUBLIC_PATHS is asserted duplicate-free upstream).
  const uniquePaths = [...new Set(QUIET_PUBLIC_PATHS)];

  // Dynamic persona pages — fetched from the backend; [] on any failure or
  // missing VITE_API_URL, so an offline/demo build still succeeds.
  const dynamicPersonaPaths = await fetchSubprofilePublicPaths(
    process.env.VITE_API_URL,
  );

  const lastmod = new Date().toISOString().slice(0, 10);
  const staticUrls = uniquePaths
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

  const dynamicUrls = dynamicPersonaPaths
    .map(({ path: dynamicPath, lastmod: dynamicLastmod }) => {
      const loc = `${SITE_ORIGIN}${dynamicPath}`;
      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        ...(dynamicLastmod ? [`    <lastmod>${dynamicLastmod}</lastmod>`] : []),
        "    <priority>0.5</priority>",
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const urls = [staticUrls, dynamicUrls].filter(Boolean).join("\n");

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
    `[sitemap] Wrote ${uniquePaths.length} public URLs + ${dynamicPersonaPaths.length} persona URLs to ${outPath} (origin ${SITE_ORIGIN})`,
  );
}

await main().catch((error) => {
  console.error(`[sitemap] Failed to generate sitemap: ${error.message}`);
  process.exit(1);
});
