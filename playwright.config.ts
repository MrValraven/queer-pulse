import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E — happy paths against the app in DEMO mode (no backend needed).
 *
 * NOT run in CI (this repo has no CI by design) and NOT part of `pnpm test`
 * (Vitest excludes `e2e/**`). Run it deliberately, locally:
 *
 *     pnpm exec playwright install   # first time: fetch browser binaries
 *     pnpm test:e2e
 *
 * `webServer` boots `pnpm dev`; with no VITE_API_URL the app forces demo mode,
 * so these specs stay green in a backend-less checkout.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
