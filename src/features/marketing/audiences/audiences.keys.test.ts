import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import type { Namespace } from "../../../shared/i18n/types";

/**
 * Every key the audience pages use must exist in both catalogs (a missing one
 * renders the raw key), and every EN key must be used (dead copy drifts).
 * Plural keys are used bare and declared as `_one`/`_other`. A key built in a
 * template literal counts through its static prefix.
 */
const AUDIENCES_DIR = "src/features/marketing/audiences";
const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/;

const AUDIENCE_NAMESPACES: readonly Namespace[] = [
  "audiences",
  "forBusinesses",
  "forCommunities",
  "forPerformers",
  "forPractitioners",
];

function landingSources(directory = AUDIENCES_DIR): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return landingSources(entryPath);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) {
      return [];
    }
    return [readFileSync(entryPath, "utf8")];
  });
}

function usedKeys(namespace: Namespace) {
  const literalKey = new RegExp(
    `["'\`]${namespace}:([A-Za-z0-9_.-]+)["'\`]`,
    "g",
  );
  const templatePrefix = new RegExp(
    `\`${namespace}:([A-Za-z0-9_.-]*)\\$\\{`,
    "g",
  );
  const literalKeys = new Set<string>();
  const templatePrefixes = new Set<string>();
  for (const source of landingSources()) {
    for (const match of source.matchAll(literalKey)) literalKeys.add(match[1]!);
    for (const match of source.matchAll(templatePrefix)) {
      templatePrefixes.add(match[1]!);
    }
  }
  return { literalKeys, templatePrefixes };
}

function isDeclared(catalogKeys: Set<string>, key: string): boolean {
  return (
    catalogKeys.has(key) ||
    (catalogKeys.has(`${key}_one`) && catalogKeys.has(`${key}_other`))
  );
}

describe.each(AUDIENCE_NAMESPACES)("%s keys", (namespace) => {
  it.each(["en", "pt"] as const)(
    "%s declares every key the pages use",
    async (language) => {
      const catalogKeys = new Set(
        Object.keys(await loadNamespace(language, namespace)),
      );
      const missing = [...usedKeys(namespace).literalKeys].filter(
        (key) => !isDeclared(catalogKeys, key),
      );
      expect(missing).toEqual([]);
    },
  );

  it(`every en ${namespace} key is used`, async () => {
    const catalogKeys = Object.keys(await loadNamespace("en", namespace));
    const { literalKeys, templatePrefixes } = usedKeys(namespace);
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
