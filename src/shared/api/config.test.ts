import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * config.ts freezes its exports from `import.meta.env` at module load, so every
 * case stubs the env and then re-imports the module. The module THROWS in one of
 * these cases by design, so the import itself is the assertion target.
 *
 * What's being defended here: a missing or typo'd VITE_API_URL used to yield
 * `""` ⇒ demo mode forced on ⇒ anonymous visitors auto-signed-in as a mock user
 * and served fabricated data as real content, with /admin reachable. Demo is now
 * an explicit opt-in and a prod build without a backend refuses to boot.
 */
async function loadConfig() {
  vi.resetModules();
  return import("./config");
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("config — production build without VITE_API_URL", () => {
  it("throws at import rather than silently degrading to demo", async () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_DEMO", "");

    await expect(loadConfig()).rejects.toThrow(/VITE_API_URL/);
  });

  it("throws when VITE_API_URL is only whitespace", async () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_URL", "   ");
    vi.stubEnv("VITE_DEMO", "");

    await expect(loadConfig()).rejects.toThrow(/Refusing to boot/);
  });

  it("does NOT throw when VITE_DEMO=1 — a deliberate standalone demo build", async () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_DEMO", "1");

    const cfg = await loadConfig();
    expect(cfg.demoConfigured).toBe(true);
    expect(cfg.apiAvailable).toBe(false);
  });
});

describe("config — production build with an API URL", () => {
  it("yields live mode: API available, demo not configured", async () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_URL", "https://api.queerpulse.com");
    vi.stubEnv("VITE_DEMO", "");

    const cfg = await loadConfig();
    expect(cfg.API_BASE_URL).toBe("https://api.queerpulse.com");
    expect(cfg.apiAvailable).toBe(true);
    expect(cfg.demoConfigured).toBe(false);
  });
});

describe("config — demo is an explicit opt-in", () => {
  it("VITE_DEMO=1 opts in", async () => {
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_DEMO", "1");

    expect((await loadConfig()).demoConfigured).toBe(true);
  });

  it.each(["", "0", "true", "yes", "TRUE"])(
    "VITE_DEMO=%j does not opt in — only the exact string '1' counts",
    async (value) => {
      vi.stubEnv("VITE_API_URL", "http://api.test");
      vi.stubEnv("VITE_DEMO", value);

      expect((await loadConfig()).demoConfigured).toBe(false);
    },
  );

  it("an absent VITE_API_URL is never read as an opt-in (dev build)", async () => {
    vi.stubEnv("PROD", false);
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_DEMO", "");

    const cfg = await loadConfig();
    expect(cfg.apiAvailable).toBe(false);
    expect(cfg.demoConfigured).toBe(false); // the whole point of the inversion
  });
});
