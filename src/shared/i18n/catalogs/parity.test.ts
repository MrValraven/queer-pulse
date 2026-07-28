import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalogs, loadPtNamespace } from "./index";
import type { Catalog, Language, Namespace } from "../types";

const namespaces = Object.keys(catalogs.en) as Namespace[];
const languages = ["en", "pt"] as const;

/**
 * PT ships most namespaces as lazy chunks, so `catalogs.pt[namespace]` is a
 * placeholder until loaded. Resolve the real catalog for either language.
 */
async function catalogFor(
  language: Language,
  namespace: Namespace,
): Promise<Catalog> {
  return language === "pt"
    ? loadPtNamespace(namespace)
    : catalogs.en[namespace];
}

/**
 * A catalog entry's key, at exactly one indent level. Anchoring to two spaces
 * keeps wrapped string values (indented four) from matching. Keys are written
 * both quoted ("a.b": …) and bare (toggleTheme: …) — both forms count.
 */
const ENTRY_KEY = /^ {2}(?:"([^"]+)"|([A-Za-z_$][\w$]*))\s*:/gm;

/** Vitest runs from the repo root, and `import.meta.url` is a bare path here
 *  rather than a file:// URL — so resolve from cwd. */
const CATALOG_DIR = "src/shared/i18n/catalogs";

function declaredKeysInSource(language: string, namespace: string): string[] {
  const source = readFileSync(
    `${CATALOG_DIR}/${language}/${namespace}.ts`,
    "utf8",
  );
  return [...source.matchAll(ENTRY_KEY)].map((match) => match[1] ?? match[2]!);
}

describe("catalog parity", () => {
  it.each(namespaces)(
    "pt/%s declares exactly the keys en/%s declares",
    async (namespace) => {
      const enKeys = Object.keys(catalogs.en[namespace]).sort();
      const ptKeys = Object.keys(await loadPtNamespace(namespace)).sort();
      expect(ptKeys).toEqual(enKeys);
    },
  );

  it.each(namespaces)("pt/%s has no empty values", async (namespace) => {
    const ptCatalog = await loadPtNamespace(namespace);
    const blank = Object.entries(ptCatalog)
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);
    expect(blank).toEqual([]);
  });

  /**
   * Catalog values are plain strings, and neither `t()` nor `<Translation>`
   * HTML-decodes them — React renders the text verbatim. So an entity carried
   * over from the HTML prototype prints literally: "Cast &amp; crew".
   * (This shipped: 35 instances across 8 catalogs.)
   */
  describe.each(languages)("%s has no HTML entities", (language) => {
    it.each(namespaces)("%s", async (namespace) => {
      const catalog = await catalogFor(language, namespace);
      const offenders = Object.entries(catalog)
        .filter(([, value]) => /&[a-zA-Z]+;|&#[0-9]+;/.test(value))
        .map(([key, value]) => `${key}: ${value}`);
      expect(offenders).toEqual([]);
    });
  });

  /**
   * A duplicate key is invisible to every check above: a JS object literal
   * silently keeps the last one, so the imported catalog looks correct while a
   * translation is shadowed and never renders. Only the source text shows it.
   * (This has happened — two agents wrote the same `shorts.catalog.*` block.)
   */
  describe.each(languages)("%s declares no duplicate keys", (language) => {
    it.each(namespaces)("%s", (namespace) => {
      const keys = declaredKeysInSource(language, namespace);
      const duplicates = [
        ...new Set(keys.filter((key, index) => keys.indexOf(key) !== index)),
      ];
      expect(duplicates).toEqual([]);
    });
  });
});
