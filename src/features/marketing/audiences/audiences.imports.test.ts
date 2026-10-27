import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards on what the audience pages may import. They render sample content
 * only, so they never pull a demo data module into their chunks, never load
 * the map, never fetch, and the businesses and communities pages never load
 * the persona skin styles.
 */
const AUDIENCES_DIR = "src/features/marketing/audiences";

interface SourceFile {
  path: string;
  source: string;
}

interface ImportStatement {
  path: string;
  specifier: string;
  isTypeOnly: boolean;
}

function landingSources(directory = AUDIENCES_DIR): SourceFile[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return landingSources(entryPath);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) {
      return [];
    }
    return [{ path: entryPath, source: readFileSync(entryPath, "utf8") }];
  });
}

// The bindings part never holds a quote or a semicolon, so a side-effect
// import (`import "x.css"`) cannot run on into the next statement's `from`.
const STATIC_IMPORT =
  /^\s*import\s+(type\s+)?(?:[^;"']*?\sfrom\s+)?["']([^"']+)["']/gm;
const DYNAMIC_IMPORT = /import\(\s*["']([^"']+)["']\s*\)/g;

function importsOf(file: SourceFile): ImportStatement[] {
  const statements: ImportStatement[] = [];
  for (const match of file.source.matchAll(STATIC_IMPORT)) {
    statements.push({
      path: file.path,
      specifier: match[2]!,
      isTypeOnly: match[1] !== undefined,
    });
  }
  for (const match of file.source.matchAll(DYNAMIC_IMPORT)) {
    statements.push({
      path: file.path,
      specifier: match[1]!,
      isTypeOnly: false,
    });
  }
  return statements;
}

const allImports = landingSources().flatMap(importsOf);
const valueImports = allImports.filter((statement) => !statement.isTypeOnly);

function describeImport(statement: ImportStatement): string {
  return `${relative(AUDIENCES_DIR, statement.path)} -> ${statement.specifier}`;
}

const DEMO_DATA =
  /(directoryPlaces|livingCommunities\.data|gatherings\/data"|gatheringRecap\.data|members\/data\/|subprofiles\/data\/|Demo[A-Za-z]*\.data|\.demo")/;
const MAP_MODULES = /DirectoryPlaceLocation|LocationMiniMap|maplibre/;
const PERSONA_STYLES = /shared\/persona\/|persona-/;
/** `api/` modules that are pure (no client, no hook): the invite path
 *  builder and the DTO-to-view mappers and types. */
const PURE_API_MODULE =
  /\/api\/(joinRequestSource|[A-Za-z]+\.(adapters|types))$/;

describe("audience page imports", () => {
  it("reads the landing sources", () => {
    expect(landingSources().length).toBeGreaterThan(0);
  });

  it("never value-imports demo data", () => {
    const offenders = valueImports
      .filter((statement) => DEMO_DATA.test(`${statement.specifier}"`))
      .map(describeImport);
    expect(offenders).toEqual([]);
  });

  it("never imports the map", () => {
    const offenders = allImports
      .filter((statement) => MAP_MODULES.test(statement.specifier))
      .map(describeImport);
    expect(offenders).toEqual([]);
  });

  it("businesses and communities never load persona styles", () => {
    const offenders = allImports
      .filter((statement) =>
        /\/audiences\/(businesses|communities)\//.test(statement.path),
      )
      .filter((statement) => PERSONA_STYLES.test(statement.specifier))
      .map(describeImport);
    expect(offenders).toEqual([]);
  });

  it("no fetching", () => {
    const fetchingFiles = landingSources()
      .filter(({ source }) => /useQuery\(|(?<![A-Za-z])fetch\(/.test(source))
      .map(({ path }) => relative(AUDIENCES_DIR, path));
    expect(fetchingFiles).toEqual([]);
    const apiImports = valueImports
      .filter((statement) => statement.specifier.includes("/api/"))
      .filter((statement) => !PURE_API_MODULE.test(statement.specifier))
      .map(describeImport);
    expect(apiImports).toEqual([]);
  });
});
