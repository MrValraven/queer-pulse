import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import type { Language, Namespace } from "../../../shared/i18n/types";

const SHARED_DIR = "src/features/marketing/audiences/shared";

function moduleStylesheets(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return moduleStylesheets(entryPath);
    return entry.name.endsWith(".module.css") ? [entryPath] : [];
  });
}

describe("audience kit stylesheets", () => {
  const stylesheets = moduleStylesheets(SHARED_DIR).map((path) => ({
    path,
    css: readFileSync(path, "utf8"),
  }));

  it("reads the kit stylesheets", () => {
    expect(stylesheets.length).toBeGreaterThan(0);
  });

  it("reduced motion in every kit stylesheet", () => {
    const missing = stylesheets
      .filter(({ css }) => /animation|transition/.test(css))
      .filter(
        ({ css }) =>
          !css.includes("prefers-reduced-motion: reduce") ||
          !css.includes(':global(html[data-reduce-motion="true"])'),
      )
      .map(({ path }) => path);
    expect(missing).toEqual([]);
  });

  it("no blurred box-shadow", () => {
    const offenders = stylesheets
      .filter(({ css }) => /box-shadow:[^;]*\d+px/.test(css))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });
});

const AUDIENCE_NAMESPACES: readonly Namespace[] = [
  "audiences",
  "forBusinesses",
  "forCommunities",
  "forPerformers",
  "forPractitioners",
];

// En and em dashes, built from their code points so the dash characters
// themselves never appear in source.
const DASHES = new RegExp(
  `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
);

const BANNED_EVERYWHERE: readonly RegExp[] = [
  DASHES,
  /, not /i,
  /\bnot\b[^.]{0,40}\bbut\b/i,
  /\bgathering/i,
  /\broom\b/i,
  /darkroom/i,
  /a real person/i,
  /Tiago/,
  /revolutionar|game.?changer/i,
];

// Letter-aware edges: `\b` is ASCII-only, so it never matches after the "ã"
// of "conexão" or the "ê" of "você".
const BANNED_IN_PT: readonly RegExp[] = [
  /(?<!\p{L})membros?(?!\p{L})/iu,
  /(?<!\p{L})conex(ão|ões)(?!\p{L})/iu,
  /(?<!\p{L})você(?!\p{L})/iu,
];

const MONEY_FIGURE = /€|\$|\d+\s?%/;

const CASES = AUDIENCE_NAMESPACES.flatMap((namespace) =>
  (["en", "pt"] as const).map((language) => ({ namespace, language })),
);

async function entriesOf(language: Language, namespace: Namespace) {
  return Object.entries(await loadNamespace(language, namespace));
}

describe("audience page copy", () => {
  it.each(CASES)(
    "$language $namespace keeps the house copy rules",
    async ({ language, namespace }) => {
      const patterns =
        language === "pt"
          ? [...BANNED_EVERYWHERE, ...BANNED_IN_PT]
          : BANNED_EVERYWHERE;
      const offenders = (await entriesOf(language, namespace))
        .filter(([, value]) => patterns.some((pattern) => pattern.test(value)))
        .map(([key]) => key);
      expect(offenders).toEqual([]);
    },
  );

  it.each(CASES)(
    "no money figures in page copy ($language $namespace)",
    async ({ language, namespace }) => {
      const offenders = (await entriesOf(language, namespace))
        .filter(([, value]) => MONEY_FIGURE.test(value))
        .map(([key]) => key);
      expect(offenders).toEqual([]);
    },
  );
});
