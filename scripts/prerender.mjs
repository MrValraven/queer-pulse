/**
 * Build-time prerender for the ESSENTIAL public pages.
 *
 * WHY: QueerPulse is a client-rendered SPA. Googlebot renders JavaScript on a
 * deferred best-effort basis, but the AI retrieval crawlers we deliberately
 * allow (OAI-SearchBot, Claude-SearchBot, PerplexityBot) do NOT execute
 * JavaScript at all — without this pass they receive an empty <div id="root">.
 *
 * SCOPE: only PRERENDER_PATHS (a minimal subset of the public surface —
 * currently the homepage alone) is baked, to save build time and data. Every
 * other public page (policies, about, the /local guides, /p/:handle personas)
 * stays in the sitemap and is served as a normal SPA route — see
 * ./publicPaths.mjs and ./generate-sitemap.mjs for that deliberate split.
 *
 * HOW: serve dist/ on an ephemeral port, visit each prerendered path in a
 * headless Chromium, and write the settled DOM to dist/<path>/index.html.
 * The browser binary is NOT a dependency of `pnpm install` — it is a separate
 * download into $HOME/.cache/ms-playwright, so `pnpm build` runs
 * `prerender:browser` (playwright install chromium --only-shell) first. Do not
 * assume a developer's local e2e install is present; CI and Vercel start with
 * an empty browser cache. The binary also needs system libs that Vercel's
 * Amazon Linux 2023 build image does not ship (nss/nspr) — vercel.json's
 * installCommand dnf-installs them.
 *
 * TWO-FILE CONTRACT (ENG-15): Vercel resolves the filesystem BEFORE its
 * rewrites, so a baked dist/<path>/index.html wins on its own URL — that is how
 * "/" serves the prerendered homepage. Everything unbaked falls through to
 * vercel.json's catch-all, which must point at FALLBACK_HTML_FILE and never at
 * "/". It used to rewrite to "/", so every unbaked route — the other 17 sitemap
 * URLs, every /p/:handle, every gated route — was served the homepage's baked
 * HTML: its title, description, canonical and Organization JSON-LD (which
 * <JsonLd> never removes, because it only cleans up elements it created
 * itself), plus a painted homepage body that real members saw flash before
 * React cleared #root. So this script writes the UNTOUCHED shell to that file,
 * and assertFallbackRewrite() holds vercel.json to it on every build.
 *
 * ONE PATH THIS DOES NOT COVER: the service worker's OFFLINE navigation
 * fallback still hands back the precached "index.html" (src/sw.ts:121), which by
 * then is the baked homepage. It cannot point here instead — vite-plugin-pwa
 * builds its precache manifest during `vite build`, before this file exists, so
 * matchPrecache("spa.html") would miss and the offline page would break. React
 * clears #root either way, so the cost is a homepage flash on an offline
 * navigation to a never-visited route. Narrow, and deliberate.
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
  PRERENDER_PATHS,
  assertNoGatedPaths,
  assertPrerenderSubset,
} from "./publicPaths.mjs";

const DIST_DIRECTORY = "dist";
/**
 * The untouched SPA shell, served for every path this script does NOT bake.
 * Kept OUT of dist/index.html, which the "/" pass overwrites with the rendered
 * homepage. vercel.json's catch-all rewrite must name this file — see the
 * two-file contract above and assertFallbackRewrite() below.
 */
const FALLBACK_HTML_FILE = "spa.html";
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
        "Content-Type":
          CONTENT_TYPES[extname(candidate)] ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      // Serve the ORIGINAL shell captured before the loop started, never a
      // re-read of dist/index.html. "/" overwrites dist/index.html, so a re-read
      // would hand any subsequent page the prerendered homepage as its shell —
      // and since <JsonLd> only appends, they would ship the homepage's
      // Organization schema on top of their own. The snapshot keeps this correct
      // and order-independent even if PRERENDER_PATHS grows beyond the homepage.
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

/** "/" maps to dist/index.html; "/about" -> dist/about/index.html, etc. */
function outputPathFor(publicPath) {
  if (publicPath === "/") return join(DIST_DIRECTORY, "index.html");
  return join(DIST_DIRECTORY, publicPath, "index.html");
}

/**
 * Fail the build if vercel.json's catch-all rewrite points at a page this
 * script bakes, instead of at the untouched shell.
 *
 * This is the ENG-15 regression guard. It lives here rather than in a test
 * because no CI runs on this repo and `scripts/build-gates.mjs` runs neither
 * lint nor tests (ENG-02) — a spec file asserting the same thing would never
 * execute. `pnpm prerender` is a real build step, so this does.
 *
 * It catches the two ways the contract breaks: someone restoring the old
 * `destination: "/"`, and PRERENDER_PATHS growing to include whatever the
 * catch-all names.
 */
async function assertFallbackRewrite() {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  const catchAll = (config.rewrites ?? []).find(
    (rule) => rule.source === "/(.*)",
  );
  if (!catchAll) {
    throw new Error(
      "vercel.json has no `/(.*)` rewrite. Every unbaked route would 404 instead of\n" +
        `  reaching the SPA. Restore: { "source": "/(.*)", "destination": "/${FALLBACK_HTML_FILE}" }`,
    );
  }

  // Every URL a baked page is reachable at, in the shapes a rewrite could name.
  const bakedDestinations = new Set(
    PRERENDER_PATHS.flatMap((publicPath) =>
      publicPath === "/"
        ? ["/", "/index.html"]
        : [publicPath, `${publicPath}/`, `${publicPath}/index.html`],
    ),
  );
  if (bakedDestinations.has(catchAll.destination)) {
    throw new Error(
      `vercel.json's catch-all rewrites to "${catchAll.destination}", which this script\n` +
        "  OVERWRITES with a prerendered page. Every unbaked route — the rest of the\n" +
        "  sitemap, every /p/:handle, every gated route — would be served that page's\n" +
        "  title, description, canonical and JSON-LD, and members would see its body\n" +
        `  flash on every deep link. Point it at "/${FALLBACK_HTML_FILE}" instead.`,
    );
  }
  if (catchAll.destination !== `/${FALLBACK_HTML_FILE}`) {
    throw new Error(
      `vercel.json's catch-all rewrites to "${catchAll.destination}", but the only file\n` +
        `  this script guarantees holds the untouched SPA shell is "/${FALLBACK_HTML_FILE}".\n` +
        "  Change one to match the other.",
    );
  }
}

// --- Guard before any I/O ---------------------------------------------------
// PRERENDER_PATHS must be a subset of the vetted public surface AND ungated.
assertPrerenderSubset();
assertNoGatedPaths(PRERENDER_PATHS);
// ...and the production fallback must not be one of the pages we overwrite.
await assertFallbackRewrite();

// --- Environment contract ---------------------------------------------------
// src/shared/api/config.ts THROWS at module load in a production build that has
// neither VITE_API_URL nor VITE_DEMO=1 — deliberately, so a mis-configured build
// cannot silently serve mock data as real community content. If that happens
// here React never mounts, no page ever signals ready, and every prerendered
// path burns the full ready-timeout before failing. That is a very expensive way
// to discover a missing env var, so check it up front and say so plainly.
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

// Only the essential subset is prerendered (PRERENDER_PATHS — currently the
// homepage alone). Dynamic persona pages (/p/:handle) are intentionally NOT
// prerendered: their count is unbounded, so baking one HTML file per published
// persona is the main data cost this trim removes. They remain in the sitemap
// (see generate-sitemap.mjs) and are served as SPA routes.
const allPublicPaths = [...PRERENDER_PATHS];

// If PRERENDER_PATHS ever grows to include an API-backed page, note it will
// FETCH during this pass with a real VITE_API_URL — so the build machine must
// reach the API or the page bakes in its empty-state fallback.
console.log(
  `[prerender] mode: ${isDemoBuild ? "DEMO (mock data)" : `live API ${apiUrl}`}`,
);

// Capture the untouched SPA shell before anything is overwritten (see the
// fallback comment in createDistServer).
const shellHtml = await readFile(join(DIST_DIRECTORY, "index.html"));

// The shell is only a shell if #root is still EMPTY. `pnpm build` always runs
// `vite build` first, which regenerates a clean dist/index.html, so this holds
// there. Running `pnpm prerender` twice without a rebuild does NOT: the second
// run would read the FIRST run's baked homepage and persist it as the fallback,
// re-creating the exact ENG-15 bug through a different door. Refuse instead.
if (!/<div id="root">\s*<\/div>/.test(shellHtml.toString("utf8"))) {
  console.error(
    `[prerender] Refusing to run: ${join(DIST_DIRECTORY, "index.html")} is not a clean SPA shell —\n` +
      "  its #root already has content, so a previous prerender pass wrote it. Persisting\n" +
      `  that as ${FALLBACK_HTML_FILE} would serve the homepage for every unbaked route, which is\n` +
      "  the bug this two-file contract exists to prevent.\n" +
      "  Run `vite build` (or the full `pnpm build`) to regenerate the shell first.",
  );
  process.exit(1);
}

// Persist that snapshot as the PRODUCTION fallback. Written before the render
// loop so it exists even if a path fails and the build aborts below: a dist/
// with no fallback file would rewrite every unbaked route to a 404.
await writeFile(join(DIST_DIRECTORY, FALLBACK_HTML_FILE), shellHtml);
console.log(
  `[prerender] Wrote the untouched shell to ${join(DIST_DIRECTORY, FALLBACK_HTML_FILE)} (the catch-all rewrite's target).`,
);

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
  `[prerender] Wrote ${allPublicPaths.length} essential page(s): ${allPublicPaths.join(", ")}.`,
);
