import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadNamespace } from "../../../shared/i18n/catalogs";

/**
 * Every `studio:landing.` key the landing source uses must exist in both
 * catalogs (a missing one renders the raw key), and every en `landing.` key
 * must be used by the landing (dead copy drifts).
 */
const LANDING_DIR = "src/features/studio/landing";
const LANDING_KEY = /["'`]studio:(landing\.[A-Za-z0-9_.-]+)["'`]/g;

function landingSources(): string[] {
  return readdirSync(LANDING_DIR)
    .filter((name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name))
    .map((name) => readFileSync(`${LANDING_DIR}/${name}`, "utf8"));
}

function usedLandingKeys(): Set<string> {
  const usedKeys = new Set<string>();
  for (const source of landingSources()) {
    for (const match of source.matchAll(LANDING_KEY)) usedKeys.add(match[1]!);
  }
  return usedKeys;
}

describe("studio landing keys", () => {
  it.each(["en", "pt"] as const)(
    "%s declares every landing key the page uses",
    async (language) => {
      const catalogKeys = new Set(
        Object.keys(await loadNamespace(language, "studio")),
      );
      const missing = [...usedLandingKeys()].filter(
        (key) => !catalogKeys.has(key),
      );
      expect(missing).toEqual([]);
    },
  );

  it("every en landing key is used", async () => {
    const usedKeys = usedLandingKeys();
    const unused = Object.keys(await loadNamespace("en", "studio")).filter(
      (key) => key.startsWith("landing.") && !usedKeys.has(key),
    );
    expect(unused).toEqual([]);
  });
});
