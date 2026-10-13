import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadNamespace } from "./index";

/**
 * Every `studioShowcase:` key the Studio source uses must exist in both
 * catalogs (a missing one renders the raw key in the demo), and every catalog
 * key must be used (dead copy drifts). Plural keys are used bare and declared
 * as `_one`/`_other`. A key built in a template literal counts through its
 * static prefix, `studioShowcase:council.member.${id}` style.
 */
const STUDIO_DIR = "src/features/studio";
const LITERAL_KEY = /["'`]studioShowcase:([A-Za-z0-9_.-]+)["'`]/g;
const TEMPLATE_PREFIX = /`studioShowcase:([A-Za-z0-9_.-]*)\$\{/g;
const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/;

function studioSources(): string[] {
  return readdirSync(STUDIO_DIR)
    .filter((name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name))
    .map((name) => readFileSync(`${STUDIO_DIR}/${name}`, "utf8"));
}

function usedKeys() {
  const literalKeys = new Set<string>();
  const templatePrefixes = new Set<string>();
  for (const source of studioSources()) {
    for (const match of source.matchAll(LITERAL_KEY))
      literalKeys.add(match[1]!);
    for (const match of source.matchAll(TEMPLATE_PREFIX))
      templatePrefixes.add(match[1]!);
  }
  return { literalKeys, templatePrefixes };
}

function isDeclared(catalogKeys: Set<string>, key: string): boolean {
  return (
    catalogKeys.has(key) ||
    (catalogKeys.has(`${key}_one`) && catalogKeys.has(`${key}_other`))
  );
}

describe("studioShowcase keys", () => {
  it.each(["en", "pt"] as const)(
    "%s declares every key the Studio source uses",
    async (language) => {
      const catalogKeys = new Set(
        Object.keys(await loadNamespace(language, "studioShowcase")),
      );
      const { literalKeys } = usedKeys();
      const missing = [...literalKeys].filter(
        (key) => !isDeclared(catalogKeys, key),
      );
      expect(missing).toEqual([]);
    },
  );

  it("uses every key the EN catalog declares", async () => {
    const catalogKeys = Object.keys(
      await loadNamespace("en", "studioShowcase"),
    );
    const { literalKeys, templatePrefixes } = usedKeys();
    const unused = catalogKeys
      .map((key) => key.replace(PLURAL_SUFFIX, ""))
      .filter(
        (key) =>
          !literalKeys.has(key) &&
          ![...templatePrefixes].some((prefix) => key.startsWith(prefix)),
      );
    expect([...new Set(unused)]).toEqual([]);
  });
});
