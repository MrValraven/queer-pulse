import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  QUIET_PUBLIC_PATHS,
  isGatedPath,
  assertNoGatedPaths,
} from "./publicPaths.mjs";

// Resolved through `node:path` rather than `new URL(..., import.meta.url)`:
// Vite rewrites that form as an ASSET reference (a template literal turns into
// an `import.meta.glob` lookup that misses and yields `undefined`), so under
// vitest the same expression tried to read `scripts/undefined`.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const repoFile = (relativePath) =>
  readFileSync(resolve(REPO_ROOT, relativePath), {
    encoding: "utf8",
  });

/**
 * Read one `const NAME... = [ … ]` array of string literals out of a source
 * file, as text.
 *
 * `authGate.ts` cannot be imported here: it pulls in react-router and the app's
 * auth providers, so a plain script test would drag half the frontend in. The
 * two lists are small, flat, and written one quoted literal per line in both
 * files, so reading them as text is enough to compare them, and it keeps the
 * mirror check honest about what is literally written in each file.
 *
 * `authGate.ts` also writes some entries as `routes.someName`, which resolve
 * against `routeMap.ts`.
 */
function readPatternList(sourceText, listName, routeMapText) {
  const start = sourceText.indexOf(`const ${listName}`);
  if (start === -1) throw new Error(`${listName} not found`);
  // Anchored on `= [`, never the first `[`: authGate.ts annotates these as
  // `const GATED_PATTERNS: string[] = [`, and the brackets in `string[]` come
  // first.
  const open = sourceText.indexOf("= [", start);
  const close = sourceText.indexOf("\n];", open);
  if (open === -1 || close === -1) throw new Error(`${listName} unterminated`);

  return sourceText
    .slice(open + 3, close)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("//"))
    .map((line) => {
      const literal = line.match(/^"([^"]+)"/);
      if (literal) return literal[1];
      const routeReference = line.match(/^routes\.(\w+)/);
      if (routeReference) {
        const resolved = routeMapText.match(
          new RegExp(`\\n {2}${routeReference[1]}: "([^"]+)"`),
        );
        if (!resolved)
          throw new Error(`unresolved routes.${routeReference[1]}`);
        return resolved[1];
      }
      throw new Error(`unparsed entry in ${listName}: ${line}`);
    });
}

/**
 * Patterns `authGate.ts` gates that the mirror deliberately cannot express.
 *
 * The mirror's matcher supports exact paths and `/prefix/*` only, with no
 * `:param` support, and no consumer ever emits a `:slug` path (see the
 * "Dynamic :slug routes are excluded" note on QUIET_PUBLIC_PATHS), so a
 * parameterised pattern has nothing to match against on this side.
 */
const PATTERNS_THE_MIRROR_CANNOT_EXPRESS = [
  "/about/volunteer/opportunity/:slug/edit",
];

describe("publicPaths", () => {
  it("marks known gated paths as gated", () => {
    expect(isGatedPath("/feed")).toBe(true);
    expect(isGatedPath("/messages")).toBe(true);
    expect(isGatedPath("/members/some-person")).toBe(true);
    expect(isGatedPath("/studio/dashboard")).toBe(true);
  });

  it("marks the quiet public surface as not gated", () => {
    expect(isGatedPath("/")).toBe(false);
    expect(isGatedPath("/resources/trans-healthcare")).toBe(false);
    expect(isGatedPath("/safety/emergency")).toBe(false);
  });

  it("contains no gated path", () => {
    expect(() => assertNoGatedPaths(QUIET_PUBLIC_PATHS)).not.toThrow();
  });

  it("throws listing every offending path", () => {
    expect(() => assertNoGatedPaths(["/feed", "/", "/messages"])).toThrow(
      /\/feed[\s\S]*\/messages/,
    );
  });

  it("excludes the de-indexed surfaces", () => {
    const deIndexedPrefixes = [
      "/magazine",
      "/cinema",
      "/studio",
      "/activism",
      "/archive",
      "/sustainer",
    ];
    const leaked = QUIET_PUBLIC_PATHS.filter((publicPath) =>
      deIndexedPrefixes.some(
        (prefix) =>
          publicPath === prefix || publicPath.startsWith(`${prefix}/`),
      ),
    );
    expect(leaked).toEqual([]);
  });

  it("has no duplicates", () => {
    expect(new Set(QUIET_PUBLIC_PATHS).size).toBe(QUIET_PUBLIC_PATHS.length);
  });

  it("lists every path root-relative", () => {
    for (const publicPath of QUIET_PUBLIC_PATHS) {
      expect(publicPath.startsWith("/")).toBe(true);
    }
  });
});

/**
 * The mirror check.
 *
 * `publicPaths.mjs` declares itself a standalone re-implementation of
 * `authGate.ts` and asks to be kept in sync by hand, which is how it drifted
 * eleven patterns before anyone noticed. Drift in one direction is merely
 * untidy: a pattern the mirror gates and the app does not just keeps a public
 * page out of the sitemap. Drift in the OTHER direction is the one that matters,
 * because `assertNoGatedPaths` is the guard that stops a member-only path
 * reaching the public sitemap and the prerenderer. A pattern the app gates and
 * the mirror does not means that guard says yes to a path the app says no to.
 *
 * So this asserts equality in both directions rather than containment.
 */
describe("publicPaths mirrors authGate.ts", () => {
  const gateSource = repoFile("src/app/authGate.ts");
  const routeMapSource = repoFile("src/app/routeMap.ts");
  const mirrorSource = repoFile("scripts/publicPaths.mjs");

  const expressible = (patterns) =>
    patterns
      .filter(
        (pattern) => !PATTERNS_THE_MIRROR_CANNOT_EXPRESS.includes(pattern),
      )
      .sort();

  it("gates exactly what authGate.ts gates", () => {
    const fromGate = readPatternList(
      gateSource,
      "GATED_PATTERNS",
      routeMapSource,
    );
    const fromMirror = readPatternList(
      mirrorSource,
      "GATED_PATTERNS",
      routeMapSource,
    );
    expect(expressible(fromMirror)).toEqual(expressible(fromGate));
  });

  it("carries exactly the same public exceptions", () => {
    const fromGate = readPatternList(
      gateSource,
      "PUBLIC_EXCEPTIONS",
      routeMapSource,
    );
    const fromMirror = readPatternList(
      mirrorSource,
      "PUBLIC_EXCEPTIONS",
      routeMapSource,
    );
    expect(expressible(fromMirror)).toEqual(expressible(fromGate));
  });

  it("still lists every pattern it says it cannot express", () => {
    const fromGate = readPatternList(
      gateSource,
      "GATED_PATTERNS",
      routeMapSource,
    );
    // A stale entry here would silently excuse a real difference, so the
    // exemption list has to keep earning its place.
    for (const pattern of PATTERNS_THE_MIRROR_CANNOT_EXPRESS) {
      expect(fromGate).toContain(pattern);
    }
  });
});
