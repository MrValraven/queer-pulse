/**
 * Capture the real app screens the launch film shows, into .cache/shots.
 *
 *   node scripts/launch-video/capture.mjs
 *
 * Starts Vite in demo mode (VITE_DEMO=1, so the signed-in member pages render
 * from their colocated mock data with no backend), then shoots each route
 * twice: a 1440px desktop page, taken as a tall strip so the film can scroll
 * it, and a 390px phone screen. The cookie banner is accepted first so it
 * never appears in frame. Re-run whenever the UI changes and re-render.
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = join(HERE, ".cache/shots");
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  ["home", "/"],
  ["feed", "/feed"],
  ["gatherings", "/gatherings"],
  ["forum", "/forum"],
  ["magazine", "/magazine"],
  ["cinema", "/cinema"],
  ["studio", "/studio"],
  ["communities", "/communities"],
  ["messages", "/messages"],
  ["members", "/members"],
  ["safe", "/local/safe-spaces"],
  ["housing", "/local/housing"],
];
const TALL = 3600; // enough page for the film's slow scroll

const vite = spawn(
  "pnpm",
  [
    "exec",
    "vite",
    "--port",
    String(PORT),
    "--strictPort",
    "--host",
    "127.0.0.1",
  ],
  {
    cwd: ROOT,
    env: { ...process.env, VITE_DEMO: "1", VITE_API_URL: "" },
    stdio: ["ignore", "pipe", "inherit"],
  },
);
await new Promise((ok, fail) => {
  vite.stdout.on("data", (d) => String(d).includes(BASE) && ok());
  vite.on("close", (code) => fail(new Error(`vite exited ${code}`)));
});

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1.5,
  isMobile: true,
  hasTouch: true,
});

try {
  for (const [name, route] of ROUTES) {
    for (const [context, suffix] of [
      [desktop, ""],
      [phone, "-m"],
    ]) {
      const page = await context.newPage();
      await page
        .goto(BASE + route, { waitUntil: "networkidle", timeout: 60_000 })
        .catch(() => console.warn(`slow: ${route}`));
      const accept = page.getByRole("button", { name: /^Accept$/ });
      if (await accept.count())
        await accept
          .first()
          .click()
          .catch(() => {});
      await page.waitForTimeout(1800); // let entrances and images settle
      await page.screenshot({ path: join(OUT, `${name}${suffix}.png`) });
      if (!suffix) {
        const height = await page.evaluate(
          () => document.documentElement.scrollHeight,
        );
        await page.screenshot({
          path: join(OUT, `${name}-tall.png`),
          fullPage: true,
          clip: { x: 0, y: 0, width: 1440, height: Math.min(height, TALL) },
        });
      }
      if (!page.url().includes(route === "/gatherings" ? "/events" : route))
        console.warn(`${route} redirected to ${page.url()}`);
      console.log(`${name}${suffix}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  vite.kill();
}
