/**
 * Build-time prerender for the quiet public surface.
 *
 * WHY: QueerPulse is a client-rendered SPA. Googlebot renders JavaScript on a
 * deferred best-effort basis, but the AI retrieval crawlers we deliberately
 * allow (OAI-SearchBot, Claude-SearchBot, PerplexityBot) do NOT execute
 * JavaScript at all — without this pass they receive an empty <div id="root">.
 *
 * HOW: serve dist/ on an ephemeral port, visit each quiet public path in a
 * headless Chromium, and write the settled DOM to dist/<path>/index.html.
 * The browser binary is NOT a dependency of `pnpm install` — it is a separate
 * download into $HOME/.cache/ms-playwright, so `pnpm build` runs
 * `prerender:browser` (playwright install chromium --only-shell) first. Do not
 * assume a developer's local e2e install is present; CI and Vercel start with
 * an empty browser cache. The binary also needs system libs that Vercel's
 * Amazon Linux 2023 build image does not ship (nss/nspr) — vercel.json's
 * installCommand dnf-installs them. Vercel serves directory indexes
 * natively, and vercel.json's rewrites only fire when no file matches — so
 * these files win, and the /(.*)->/ rule degrades into an SPA fallback for
 * gated routes.
 *
 * SAFETY: assertNoGatedPaths() runs before anything is written. A gated path
 * would bake in the sign-in redirect and leak member surface structure.
 *
 * ENVIRONMENT: this runs against the production bundle, so it inherits that
 * build's env. Demo mode is an explicit VITE_DEMO=1 opt-in and is NEVER inferred
 * from a missing VITE_API_URL (src/shared/api/config.ts) — an earlier version of
 * this comment claimed otherwise and was wrong. The env contract is asserted
 * below, before any work happens.
 */
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "@playwright/test";
import {
  QUIET_PUBLIC_PATHS,
  assertNoGatedPaths,
  fetchSubprofilePublicPaths,
} from "./publicPaths.mjs";

const DIST_DIRECTORY = "dist";
const NAVIGATION_TIMEOUT_MS = 20_000;
const READY_TIMEOUT_MS = 10_000;
/** Frames to let React commit fetched content after the ready flag flips. */
const SETTLE_AFTER_READY_MS = 250;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/**
 * Static file server over dist/, falling back to index.html so client-side
 * routes resolve — the same contract vercel.json provides in production.
 */
function createDistServer(shellHtml) {
  return createServer(async (request, response) => {
    const requestPath = new URL(request.url, "http://localhost").pathname;
    const candidate = join(DIST_DIRECTORY, requestPath);
    try {
      const body = await readFile(candidate);
      response.writeHead(200, {
        "Content-Type": CONTENT_TYPES[extname(candidate)] ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      // Serve the ORIGINAL shell captured before the loop started, never a
      // re-read of dist/index.html. "/" is the first path we prerender and it
      // overwrites dist/index.html — so a re-read would hand every subsequent
      // page the prerendered homepage as its shell, and since <JsonLd> only
      // appends, all 66 of them would ship the homepage's Organization schema
      // on top of their own. Snapshotting also makes output order-independent.
      response.writeHead(200, { "Content-Type": CONTENT_TYPES[".html"] });
      response.end(shellHtml);
    }
  });
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

/** dist/resources/trans-healthcare/index.html — "/" maps to dist/index.html. */
function outputPathFor(publicPath) {
  if (publicPath === "/") return join(DIST_DIRECTORY, "index.html");
  return join(DIST_DIRECTORY, publicPath, "index.html");
}

// --- Guard before any I/O ---------------------------------------------------
assertNoGatedPaths(QUIET_PUBLIC_PATHS);

// --- Environment contract ---------------------------------------------------
// src/shared/api/config.ts THROWS at module load in a production build that has
// neither VITE_API_URL nor VITE_DEMO=1 — deliberately, so a mis-configured build
// cannot silently serve mock data as real community content. If that happens
// here React never mounts, no page ever signals ready, and all 67 paths burn the
// full ready-timeout before failing. That is a very expensive way to discover a
// missing env var, so check it up front and say so plainly.
const apiUrl = (process.env.VITE_API_URL ?? "").trim();
const isDemoBuild = process.env.VITE_DEMO === "1";

if (!apiUrl && !isDemoBuild) {
  console.error(
    "[prerender] Refusing to run: neither VITE_API_URL nor VITE_DEMO=1 is set.\n" +
      "  The app throws at boot in that state (src/shared/api/config.ts), so every\n" +
      "  page would render nothing and time out.\n" +
      "  Set VITE_API_URL to the API origin for a real build, or VITE_DEMO=1 to\n" +
      "  prerender the standalone demo prototype.",
  );
  process.exit(1);
}

if (isDemoBuild) {
  console.warn(
    "[prerender] WARNING: VITE_DEMO=1 — mock/fixture data will be baked into the\n" +
      "  prerendered HTML and served to crawlers as though it were real content.\n" +
      "  This is acceptable for a demo deploy ONLY. Do not ship it to queerpulse.com.",
  );
}

// Dynamic persona pages (/p/:handle) — fetched from the backend. Demo builds
// have no API to ask, so they skip dynamic paths entirely; a live build's
// fetch never throws (returns [] + warns on any failure), so a build machine
// that can't reach the API still produces the static quiet surface.
const dynamicEntries = isDemoBuild ? [] : await fetchSubprofilePublicPaths(apiUrl);
const dynamicPersonaPaths = dynamicEntries.map((entry) => entry.path);
assertNoGatedPaths(dynamicPersonaPaths);
const allPublicPaths = [...QUIET_PUBLIC_PATHS, ...dynamicPersonaPaths];

// A handful of indexed pages read live data (the glossary, the guide library,
// partners, volunteer opportunities). With a real VITE_API_URL they will fetch
// during this pass, so the build machine needs to be able to reach the API — or
// those pages bake in their empty-state fallback.
console.log(
  `[prerender] mode: ${isDemoBuild ? "DEMO (mock data)" : `live API ${apiUrl}`}`,
);

// Capture the untouched SPA shell before anything is overwritten (see the
// fallback comment in createDistServer).
const shellHtml = await readFile(join(DIST_DIRECTORY, "index.html"));

const server = createDistServer(shellHtml);
const port = await listen(server);
const failures = [];

// `browser` is declared out here but launched INSIDE the try: if
// chromium.launch() rejects (missing or broken browser binary), the finally
// block still runs and closes the server rather than leaving it dangling
// behind an uncaught exception.
let browser;

try {
  browser = await chromium.launch();
  // reducedMotion: "reduce" makes useCountUp jump straight to its target
  // instead of animating over 1100ms — without it, pages like /about/cities
  // serialise mid-animation and ship "0 members, 0 gatherings, 0 safe spaces"
  // as their indexed content. It also settles every other reveal animation.
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const publicPath of allPublicPaths) {
    // ?__prerender=1 tells the app to skip its simulated-load skeletons — see
    // src/shared/prerender.ts. It is a search param, so it never leaks into
    // canonical/og:url (both are built from pathname).
    const url = `http://127.0.0.1:${port}${publicPath}?__prerender=1`;
    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: NAVIGATION_TIMEOUT_MS,
      });
      // Routes are lazy-loaded, so networkidle alone can capture a
      // pre-hydration frame. Wait for the app to signal its meta effect ran.
      await page.waitForFunction(
        () => document.documentElement.dataset.prerenderReady === "true",
        undefined,
        { timeout: READY_TIMEOUT_MS },
      );
      // The ready flag proves the metadata effect ran; it does not prove React
      // has committed the content those pages fetched. Give the render loop a
      // couple of frames to flush before serialising.
      await page.waitForTimeout(SETTLE_AFTER_READY_MS);
      // Strip the readiness marker before serialising — it is a signal between
      // the app and this script, not something that belongs in shipped HTML.
      await page.evaluate(() => {
        delete document.documentElement.dataset.prerenderReady;
      });
      const html = await page.content();
      const outputPath = outputPathFor(publicPath);
      await mkdir(join(outputPath, ".."), { recursive: true });
      await writeFile(outputPath, html, "utf8");
      console.log(`[prerender] ${publicPath} -> ${outputPath}`);
    } catch (error) {
      failures.push({ publicPath, message: error.message });
      console.error(`[prerender] FAILED ${publicPath}: ${error.message}`);
    }
  }
} finally {
  await browser?.close();
  server.close();
}

if (failures.length > 0) {
  console.error(
    `[prerender] ${failures.length} of ${allPublicPaths.length} paths failed. Failing the build rather than shipping an empty shell for them.`,
  );
  process.exit(1);
}

console.log(
  `[prerender] Wrote ${allPublicPaths.length} pages (${QUIET_PUBLIC_PATHS.length} static + ${dynamicPersonaPaths.length} persona).`,
);
