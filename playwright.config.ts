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
 * `webServer` boots `pnpm dev` with demo mode explicitly opted into (VITE_DEMO=1)
 * and no API URL, so these specs stay green in a backend-less checkout. Demo is
 * never inferred from a missing VITE_API_URL (see src/shared/api/config.ts), so
 * the opt-in has to be stated. Both vars are set on the command line to beat any
 * local `.env` — process.env VITE_* wins over .env files in Vite's loadEnv, which
 * keeps the run identical on a machine that has a backend configured.
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
    command: "VITE_API_URL= VITE_DEMO=1 pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
