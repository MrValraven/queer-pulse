/**
 * Build-time prerender for the quiet public surface.
 *
 * WHY: QueerPulse is a client-rendered SPA. Googlebot renders JavaScript on a
 * deferred best-effort basis, but the AI retrieval crawlers we deliberately
 * allow (OAI-SearchBot, Claude-SearchBot, PerplexityBot) do NOT execute
 * JavaScript at all — without this pass they receive an empty <div id="root">.
 *
 * HOW: serve dist/ on an ephemeral port, visit each quiet public path in the
 * headless Chromium already installed for the Playwright e2e suite, and write
 * the settled DOM to dist/<path>/index.html. Vercel serves directory indexes
 * natively, and vercel.json's rewrites only fire when no file matches — so
 * these files win, and the /(.*)->/ rule degrades into an SPA fallback for
 * gated routes.
 *
 * SAFETY: assertNoGatedPaths() runs before anything is written. A gated path
 * would bake in the sign-in redirect and leak member surface structure.
 *
 * DEMO MODE: this runs with VITE_API_URL unset, so DemoModeProvider forces demo
 * mode. Only pages whose content is static hand-written copy may be listed in
 * QUIET_PUBLIC_PATHS — see the note there.
 */
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "@playwright/test";
import { QUIET_PUBLIC_PATHS, assertNoGatedPaths } from "./publicPaths.mjs";

const DIST_DIRECTORY = "dist";
const NAVIGATION_TIMEOUT_MS = 20_000;
const READY_TIMEOUT_MS = 10_000;

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
function createDistServer() {
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
      const shell = await readFile(join(DIST_DIRECTORY, "index.html"));
      response.writeHead(200, { "Content-Type": CONTENT_TYPES[".html"] });
      response.end(shell);
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

const server = createDistServer();
const port = await listen(server);
const failures = [];

// `browser` is declared out here but launched INSIDE the try: if
// chromium.launch() rejects (missing or broken browser binary), the finally
// block still runs and closes the server rather than leaving it dangling
// behind an uncaught exception.
let browser;

try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  for (const publicPath of QUIET_PUBLIC_PATHS) {
    const url = `http://127.0.0.1:${port}${publicPath}`;
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
    `[prerender] ${failures.length} of ${QUIET_PUBLIC_PATHS.length} paths failed. Failing the build rather than shipping an empty shell for them.`,
  );
  process.exit(1);
}

console.log(`[prerender] Wrote ${QUIET_PUBLIC_PATHS.length} pages.`);
