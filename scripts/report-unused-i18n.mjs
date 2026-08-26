#!/usr/bin/env node
/**
 * Unused-i18n-key reporter for QueerPulse.
 *
 * The EN catalogs under `src/shared/i18n/catalogs/en/` hold ~27,000 flat keys
 * across 33 namespaces, and PT mirrors them key-for-key (enforced by
 * `catalogs/parity.test.ts`). Copy gets rewritten, sections get deleted, and
 * the keys that fed them stay behind. This script finds those orphans.
 *
 * THE ONE RULE THIS TOOL OBEYS: deleting a LIVE key ships a raw key string to
 * a member's screen; keeping a DEAD key costs a few bytes. So every ambiguity
 * resolves towards "still in use". The tool may call a dead key live. It must
 * never call a live key dead. Everything below follows from that.
 *
 * ── How it decides ────────────────────────────────────────────────────────
 *
 * 1. Catalogs are read by evaluating each `en/<namespace>.ts` as a plain
 *    object literal (they contain nothing but `import type` + one exported
 *    `Catalog`), so the key set is exact rather than regex-guessed.
 *
 * 2. Every scanned source file is parsed with the real TypeScript parser, not
 *    a regex. That matters: keys are quoted inside JSDoc comments all over
 *    this repo, an apostrophe in JSX text would desync a hand-rolled string
 *    scanner, and `t()` is only one of several ways a key reaches the catalog.
 *
 * 3. From the AST it takes two things:
 *    - STRING LITERALS. Every string literal in the product source, wherever
 *      it sits. `t("ns:key")` is one shape among several: this repo also parks
 *      keys in data files as `labelKey` / `titleKey` / `bodyKey` fields and
 *      renders them later with `t(item.labelKey)`, and builds `Record<Union, string>`
 *      maps of key fragments. Harvesting every literal catches all of those
 *      without modelling the dataflow. It over-approximates (a literal that
 *      merely happens to equal a key marks it live), which is the safe way to
 *      be wrong.
 *    - TEMPLATE LITERALS WITH HOLES, folded into PATTERNS such as
 *      `marketing:changelog.entries.*.title`, after a small constant
 *      evaluator resolves whatever it can (see 4).
 *    - KEY-PREFIX LITERALS, folded into the same kind of pattern even when no
 *      concatenation is visible anywhere (see 8).
 *
 * 4. The constant evaluator resolves, within one file: string literals,
 *    template literals, `a ? b : c`, `a + b`, single-assignment `const`s,
 *    member access into a locally-declared object/array literal (the union of
 *    every member, whatever the index turns out to be), and calls to locally
 *    declared single-expression functions with their parameters bound. That
 *    turns
 *      `const base = `economy:coopTemplate.doc.${doc.slug}``  … t(`${base}.h`)
 *    into the tight pattern `economy:coopTemplate.doc.*.s*.h` instead of a
 *    useless `*.h`. Anything it cannot resolve stays a `*` hole: a prop, a
 *    DTO field, an argument from another module.
 *
 * 5. PLURALS. `translate.ts` resolves `count` through CLDR suffixes, so a
 *    reference to `foo.bar` keeps `foo.bar_one` / `foo.bar_other` alive, and a
 *    reference to any one variant keeps the whole family alive.
 *
 * 6. NAMESPACES. A use site says `ns:path`; the catalog file holds bare
 *    `path`. A literal carrying a namespace is matched only against that
 *    namespace. A literal WITHOUT one is matched against every namespace,
 *    because `t("save")` legitimately means `common:save` and because a bare
 *    fragment may be composed with a namespace elsewhere. Deliberately loose.
 *
 * 7. TESTS. A key referenced only from a test file is not evidence the product
 *    uses it, so test files never feed the live set. They get their own report
 *    group: those keys are almost certainly dead product-side, but deleting
 *    one breaks the suite, so they are handed over as a separate decision.
 *
 * 8. KEY-PREFIX LITERALS. A literal that ends in `.` or `:` AND is a proper
 *    prefix of a catalog key is not a key: `t("governance:transparency.action.")`
 *    resolves to nothing, so the only use such a string has is to have a suffix
 *    appended. It therefore becomes the shape `governance:transparency.action.*`
 *    with no proof required about where the suffix comes from.
 *
 *    This exists because 3+4 are not enough on their own. `TransparencySections.tsx`
 *    curries the prefix into a closure:
 *      `function labelLookup(allowedKeys, translate, prefix) {
 *         return (key) => allowedKeys.includes(key) ? translate(`${prefix}${key}`) : undefined; }`
 *    Both halves of that template are parameters, so the evaluator resolves
 *    NOTHING, `buildPattern` rejects an all-holes value as not-a-key, and the
 *    shape disappeared entirely: seventeen live keys sat in tier 1A. Rule 8
 *    catches it from the call site's bare `"governance:transparency.action."`
 *    argument instead, which no dataflow has to be followed to see.
 *
 *    The trailing separator is what keeps this narrow, and it is a fact about
 *    the string rather than a guess about the code. Accepting ANY proper prefix
 *    would accept `"m"` and `"a"` (1,587 literals, most of the catalog). Even
 *    accepting only segment-boundary prefixes would accept `"directory"`,
 *    `"governance"` and 398 more ordinary words that are complete values in
 *    their own right (400 literals, ~9,000 keys), which would empty tiers 1A
 *    and 1B of anything worth reading. A string ending in a separator has no
 *    standalone meaning at all, so there is nothing to trade away. Today the
 *    whole repo holds four: the three `governance:transparency.*` prefixes and
 *    `community:readingGroups.listGroup.`.
 *
 * ── The three unused tiers, and what separates them ──────────────────────
 *
 * A key that no shape can even reach is unused, full stop. That is TIER 1A.
 *
 * The awkward case is a key that some shape COULD reach. A single
 * `t(`marketing:${item.titleKey}`)` yields the shape `marketing:*`, which
 * touches all 4,400 marketing keys; calling every one of them undecidable
 * would throw the whole namespace away. So for a reachable key the script asks
 * one more question: does anything in the source actually PRODUCE the string
 * the hole would have to take?
 *
 * It answers that from a FRAGMENT POOL: every product string literal, every
 * contiguous dot-run inside one (this codebase really does slice keys apart at
 * dots: see `keyBeforeSuffix` / `lastSegment` in
 * `features/admin/api/useAdminGovernanceOverview.ts`), every object-literal
 * property name and enum member name, plus any run of digits (loop indices
 * fill holes constantly). If every hole value sits in that pool, the key is
 * LIVE-BY-SHAPE. If one does not, nothing in this repository spells the
 * fragment the hole would need, and the key is unused by this repo.
 *
 * "By this repo" is the whole caveat, and how much it bites depends on how
 * much the shape constrains, which is what splits 1B from 1C:
 *
 * - TIER 1B. The only shapes reaching the key swallow two or more segments at
 *   once (`marketing:*`, `*.title`) or do not pin a namespace at all. Such a
 *   shape constrains nothing, so "reachable" is close to meaningless and the
 *   key is nearly as safe to delete as a 1A one.
 *
 * - TIER 1C. A shape that pins its namespace and leaves a ONE-SEGMENT hole
 *   reaches the key: a genuine enumeration. Either the key is dead, or that
 *   one value only ever exists on the backend. Both live in this bucket, and
 *   the tool cannot tell them apart. It is small (eight keys today) precisely
 *   so a human can read all of it. All eight are the
 *   `safety:governance.audit.*` family, which IS live: `action` is a bare
 *   `string` off the audit DTO, so those codes are spelled nowhere in the
 *   frontend. NEVER bulk-delete tier 1C.
 *
 * ── What it deliberately cannot decide ────────────────────────────────────
 *
 * It does not resolve union types, so it cannot prove a hole fed by
 * `card.status` only ever takes the four values `CardStatus` allows. It does
 * not follow a value across module boundaries, into a React prop, or out of a
 * DTO. Every such hole stays a `*`, and the keys behind it are reported as
 * undecidable rather than guessed at.
 *
 * Rule 8 closes the curried-prefix hole only for a prefix the source SPELLS
 * with its separator attached. A prefix assembled as `base + "." + suffix`,
 * where `base` is itself unresolvable, still leaves the tool with `"."` as its
 * only static text, which `buildPattern` rejects as too short to be a key
 * shape. A prefix that arrives from the backend or from another module is
 * likewise invisible. Both would put a live key in 1A, which is why every
 * deletion pass still reads whole flagged families rather than single keys.
 *
 * Run: `node scripts/report-unused-i18n.mjs`
 *   --summary        per-namespace table only, no key listings
 *   --namespace=NS   restrict the listings to one namespace
 *   --patterns       list every dynamic key shape, down to the narrowest
 *   --explain=KEY    show the verdict for one `namespace:key` and the evidence
 *                    behind it, so a single call can be audited
 *   --max=N          exit 1 if the 1A + 1B count exceeds N, the deletable
 *                    surface, deliberately excluding 1C. For use as a ratchet;
 *                    omit it and the script always exits 0, which is how it is
 *                    meant to be run by hand.
 *
 * The deletion runbook, the tier-by-tier confidence, and the argument against
 * making this a build gate all live in `scripts/README-unused-i18n.md`. The
 * hard cases are pinned in `scripts/report-unused-i18n.test.mjs`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const typescript = createRequire(import.meta.url)("typescript");

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(scriptDirectory, "..");
const catalogDirectoryEn = join(repositoryRoot, "src/shared/i18n/catalogs/en");
const catalogDirectoryPt = join(repositoryRoot, "src/shared/i18n/catalogs/pt");

/** Directories walked for use sites. `src`, the build scripts, the e2e specs. */
const SCAN_ROOTS = ["src", "scripts", "e2e"];

const SKIPPED_DIRECTORIES = new Set([
  "node_modules",
  "dist",
  "coverage",
  ".git",
]);

const SCANNED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

/** The catalog files themselves are the definition, never a use site. */
const CATALOG_PATH_FRAGMENT = join("src", "shared", "i18n", "catalogs");

/**
 * This reporter's own fixture file, excluded from its own scan.
 *
 * `report-unused-i18n.test.mjs` pins verdicts by naming real keys, so scanning
 * it would make the tool read its own fixtures as evidence: the fifteen
 * `forOrgs.tiers.*.list*` keys the test asserts are unused would come back
 * "referenced by a test", and the test would then be asserting against a world
 * it created. Every other file under `scripts/` is scanned normally.
 */
const SELF_FIXTURE_FILE = "report-unused-i18n.test.mjs";

/** CLDR plural suffixes `resolveEntry()` appends. */
const PLURAL_SUFFIXES = ["zero", "one", "two", "few", "many", "other"];
const PLURAL_SUFFIX_PATTERN = /_(?:zero|one|two|few|many|other)$/;

/** The characters a catalog key path is built from (verified: `[-.0-9A-Za-z_]`). */
const KEY_PATH_PATTERN = /^[A-Za-z0-9_.-]+$/;
/** A hole may span a namespace colon: `${keyPrefix}.title` holds `ns:a.b`. */
const HOLE_PATTERN_SOURCE = "[A-Za-z0-9_.:-]*";
const KEY_SHAPED_PATTERN = /^[A-Za-z0-9_.:-]+$/;
const DIGITS_PATTERN = /^\d+$/;
/**
 * A key-shaped literal that ENDS on a key separator, so it cannot be a key
 * itself and can only be a prefix awaiting a suffix. See rule 8 in the header.
 */
const KEY_PREFIX_LITERAL_PATTERN = /^[A-Za-z0-9_.:-]*[A-Za-z0-9_-][.:]$/;

/** A namespace id as `types.ts` spells them: lowerCamel, letters and digits. */
const NAMESPACE_PATTERN = /^[a-z][A-Za-z0-9]*$/;

/** Guard rails so a non-i18n template (a URL, a query key) cannot swallow the catalog. */
const MINIMUM_STATIC_SEGMENT_LENGTH = 3;
const MAXIMUM_ALTERNATIVES = 64;
const MAXIMUM_EVALUATION_DEPTH = 8;
/** Cap on dot-runs harvested per literal, so a prose string cannot explode the pool. */
const MAXIMUM_FRAGMENT_SEGMENTS = 12;

// ── arguments ──────────────────────────────────────────────────────────────

function readFlag(prefix) {
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument === undefined ? null : argument.slice(prefix.length);
}

const options = {
  isSummaryOnly: process.argv.includes("--summary"),
  shouldListAllPatterns: process.argv.includes("--patterns"),
  namespaceFilter: readFlag("--namespace="),
  explainKey: readFlag("--explain="),
  maximumUnused: readFlag("--max="),
};

// ── catalogs ───────────────────────────────────────────────────────────────

/**
 * Read one `en/<namespace>.ts` catalog into a real object.
 *
 * These files hold exactly one `import type` line and one exported object
 * literal, so stripping the import and turning the export into a `return`
 * yields a valid function body. That is an exact parse: no regex has to guess
 * where a multi-line string value ends, or whether an unquoted identifier key
 * is really a key.
 */
function readCatalogFile(filePath) {
  const source = readFileSync(filePath, "utf8")
    .replace(/^import[^\n]*\n/gm, "")
    .replace(/export const \w+\s*:\s*Catalog\s*=/, "return");
  // The input is repo-owned catalog source, never user input.
  return new Function(source)();
}

function loadCatalogs(directory) {
  const catalogs = new Map();
  for (const fileName of readdirSync(directory).sort()) {
    if (!fileName.endsWith(".ts") || fileName.includes(".test.")) continue;
    catalogs.set(
      fileName.slice(0, -3),
      new Set(Object.keys(readCatalogFile(join(directory, fileName)))),
    );
  }
  return catalogs;
}

/** Strip a trailing CLDR suffix, so every variant of a plural shares one base. */
function pluralBase(path) {
  return path.replace(PLURAL_SUFFIX_PATTERN, "");
}

// ── file discovery ─────────────────────────────────────────────────────────

function collectSourceFiles() {
  const files = [];
  for (const root of SCAN_ROOTS) {
    const absoluteRoot = join(repositoryRoot, root);
    let stats;
    try {
      stats = statSync(absoluteRoot);
    } catch {
      continue;
    }
    if (stats.isDirectory()) walkDirectory(absoluteRoot, files);
  }
  return files;
}

function walkDirectory(directory, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
      walkDirectory(fullPath, files);
      continue;
    }
    if (!SCANNED_EXTENSIONS.has(extname(entry.name))) continue;
    if (fullPath.includes(CATALOG_PATH_FRAGMENT)) continue;
    if (entry.name === SELF_FIXTURE_FILE) continue;
    files.push(fullPath);
  }
}

/**
 * A file whose references prove nothing about the product. Tests assert on
 * keys precisely because the keys exist, so counting them as use sites would
 * make the tool agree with itself.
 */
function isTestFile(relativePath) {
  return (
    relativePath.includes(".test.") ||
    relativePath.includes(".spec.") ||
    relativePath.startsWith(join("src", "test")) ||
    relativePath.startsWith("e2e") ||
    relativePath.includes("__mocks__")
  );
}

// ── the constant evaluator ─────────────────────────────────────────────────
//
// A "value" is an array of segments: a string segment is text we know, `null`
// is a hole we do not. `["admin:settings.confirm.", null, ".title"]` reads as
// `admin:settings.confirm.*.title`. `evaluate()` returns the ALTERNATIVES for
// one expression, because a ternary genuinely has two.

const UNKNOWN_VALUE = [[null]];

/** Fold adjacent known segments together so `["a", "b"]` becomes `["ab"]`. */
function normalizeSegments(segments) {
  const folded = [];
  for (const segment of segments) {
    if (segment === null) {
      folded.push(null);
      continue;
    }
    const last = folded[folded.length - 1];
    if (typeof last === "string") folded[folded.length - 1] = last + segment;
    else folded.push(segment);
  }
  return folded.length === 0 ? [""] : folded;
}

function concatenateAlternatives(left, right) {
  const combined = [];
  for (const leftValue of left) {
    for (const rightValue of right) {
      if (combined.length >= MAXIMUM_ALTERNATIVES) return combined;
      combined.push(normalizeSegments([...leftValue, ...rightValue]));
    }
  }
  return combined.length === 0 ? UNKNOWN_VALUE : combined;
}

/**
 * Per-file symbol table: `const` initialisers and single-expression functions,
 * both keyed by name. A name declared twice keeps both declarations and the
 * evaluator unions their values, which widens the result, the safe direction.
 */
function buildScope(sourceFile) {
  const constants = new Map();
  const functions = new Map();
  const functionNodes = new Map();

  const remember = (map, name, entry) => {
    const existing = map.get(name);
    if (existing) existing.push(entry);
    else map.set(name, [entry]);
  };

  const visit = (node) => {
    if (
      typescript.isVariableDeclaration(node) &&
      typescript.isIdentifier(node.name) &&
      node.initializer
    ) {
      const functionEntry = asResolvableFunction(node.initializer);
      if (functionEntry) remember(functions, node.name.text, functionEntry);
      else remember(constants, node.name.text, node.initializer);
      if (
        typescript.isArrowFunction(node.initializer) ||
        typescript.isFunctionExpression(node.initializer)
      ) {
        remember(functionNodes, node.name.text, node.initializer);
      }
    }
    if (
      typescript.isFunctionDeclaration(node) &&
      node.name &&
      typescript.isIdentifier(node.name)
    ) {
      const functionEntry = asResolvableFunction(node);
      if (functionEntry) remember(functions, node.name.text, functionEntry);
      remember(functionNodes, node.name.text, node);
    }
    // `let key: string; … key = someHelper(type, payload);` is a declaration
    // with no initialiser plus assignments. Union every assigned expression:
    // widening a name's value set can only widen the shapes built from it.
    if (
      typescript.isBinaryExpression(node) &&
      node.operatorToken.kind === typescript.SyntaxKind.EqualsToken &&
      typescript.isIdentifier(node.left)
    ) {
      remember(constants, node.left.text, node.right);
    }
    typescript.forEachChild(node, visit);
  };
  visit(sourceFile);

  return { constants, functions, functionNodes, bindings: new Map() };
}

/**
 * A function's parameter names and every expression it can return.
 *
 * Taking the union of ALL returns (rather than insisting on a single-expression
 * body) is sound, because the result really is one of them, and it is what makes
 * multi-branch key helpers resolvable. `formatNotification.ts` is full of them:
 *   `const level = severity === "ok" ? severity : "warning";
 *    return `admin:moderationHealth.notification.${level}`;`
 */
function asResolvableFunction(node) {
  const isFunctionLike =
    typescript.isArrowFunction(node) ||
    typescript.isFunctionExpression(node) ||
    typescript.isFunctionDeclaration(node);
  if (!isFunctionLike || !node.body) return null;

  const parameterNames = node.parameters.map((parameter) =>
    typescript.isIdentifier(parameter.name) ? parameter.name.text : null,
  );

  if (!typescript.isBlock(node.body)) {
    return { parameterNames, bodies: [node.body] };
  }

  const bodies = [];
  const collect = (child) => {
    // Do not descend into a nested function: its returns are not this one's.
    if (
      typescript.isFunctionDeclaration(child) ||
      typescript.isFunctionExpression(child) ||
      typescript.isArrowFunction(child)
    ) {
      return;
    }
    if (typescript.isReturnStatement(child) && child.expression) {
      bodies.push(child.expression);
    }
    typescript.forEachChild(child, collect);
  };
  collect(node.body);
  return bodies.length === 0 ? null : { parameterNames, bodies };
}

/**
 * Every value a locally-declared object or array literal can yield, whatever
 * the index expression turns out to be. `TAB_EMPTY_KEY[activeTab]` becomes the
 * union of the map's four values. Sound, because the result has to be one of
 * them.
 */
function evaluateMemberAccess(node, scope, depth) {
  const objectNode = unwrapToDeclaration(node.expression, scope, depth);
  if (!objectNode) return UNKNOWN_VALUE;

  const members = [];
  if (typescript.isObjectLiteralExpression(objectNode)) {
    for (const property of objectNode.properties) {
      if (typescript.isPropertyAssignment(property)) {
        members.push(property.initializer);
      } else if (!typescript.isShorthandPropertyAssignment(property)) {
        return UNKNOWN_VALUE; // a spread or a method: the shape is not closed.
      }
    }
  } else if (typescript.isArrayLiteralExpression(objectNode)) {
    members.push(...objectNode.elements);
  } else {
    return UNKNOWN_VALUE;
  }

  const alternatives = [];
  for (const member of members) {
    alternatives.push(...evaluate(member, scope, depth + 1));
    if (alternatives.length >= MAXIMUM_ALTERNATIVES) break;
  }
  return alternatives.length === 0
    ? UNKNOWN_VALUE
    : alternatives.slice(0, MAXIMUM_ALTERNATIVES);
}

/** Follow an identifier back to the single object/array literal it names. */
function unwrapToDeclaration(node, scope, depth) {
  if (depth > MAXIMUM_EVALUATION_DEPTH) return null;
  let current = node;
  while (
    typescript.isParenthesizedExpression(current) ||
    typescript.isAsExpression(current) ||
    typescript.isSatisfiesExpression(current) ||
    typescript.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  if (
    typescript.isObjectLiteralExpression(current) ||
    typescript.isArrayLiteralExpression(current)
  ) {
    return current;
  }
  if (typescript.isIdentifier(current)) {
    const declarations = scope.constants.get(current.text);
    if (!declarations || declarations.length !== 1) return null;
    return unwrapToDeclaration(declarations[0], scope, depth + 1);
  }
  return null;
}

/** Array methods whose callback receives one element of the receiver. */
const ELEMENT_CALLBACK_METHODS = new Set([
  "map",
  "flatMap",
  "forEach",
  "filter",
  "find",
  "some",
  "every",
]);

/**
 * A callback's parameter names and returnable bodies, whether it was written
 * inline or passed by name (`RETENTION_CLEARS_KEYS.map(leadBullet)`).
 */
function resolveCallback(node, scope) {
  if (!node) return null;
  if (typescript.isIdentifier(node)) {
    const declarations = scope.functionNodes.get(node.text);
    if (!declarations || declarations.length !== 1) return null;
    return resolveCallback(declarations[0], scope);
  }
  return asResolvableFunction(node);
}

/**
 * Every value an array expression can hold, when that is knowable: an array
 * literal, or a `.map()` over one whose callback this evaluator can run. This
 * is what lets
 *   `["gathering", "push"].map((id) => `retention.clears.${id}`)`
 * resolve to real keys instead of the useless shape `retention.clears.*`.
 */
function evaluateArrayElements(node, scope, depth) {
  if (!node || depth > MAXIMUM_EVALUATION_DEPTH) return null;

  const declaration = unwrapToDeclaration(node, scope, depth);
  if (declaration && typescript.isArrayLiteralExpression(declaration)) {
    const values = [];
    for (const element of declaration.elements) {
      values.push(...evaluate(element, scope, depth + 1));
      if (values.length >= MAXIMUM_ALTERNATIVES) break;
    }
    return values.slice(0, MAXIMUM_ALTERNATIVES);
  }

  let target = node;
  if (typescript.isIdentifier(target)) {
    const declarations = scope.constants.get(target.text);
    if (!declarations || declarations.length !== 1) return null;
    target = declarations[0];
  }
  if (
    !typescript.isCallExpression(target) ||
    !typescript.isPropertyAccessExpression(target.expression) ||
    target.expression.name.text !== "map"
  ) {
    return null;
  }
  const source = evaluateArrayElements(
    target.expression.expression,
    scope,
    depth + 1,
  );
  const callback = resolveCallback(target.arguments[0], scope);
  if (!source || !callback) return null;

  const values = [];
  for (const value of source) {
    const bindings = bindCallbackParameter(scope, callback, value);
    for (const body of callback.bodies) {
      values.push(...evaluate(body, { ...scope, bindings }, depth + 1));
    }
    if (values.length >= MAXIMUM_ALTERNATIVES) break;
  }
  return values.slice(0, MAXIMUM_ALTERNATIVES);
}

function bindCallbackParameter(scope, callback, value) {
  const bindings = new Map(scope.bindings);
  const [firstParameter] = callback.parameterNames;
  if (firstParameter) bindings.set(firstParameter, [value]);
  return bindings;
}

function evaluate(node, scope, depth = 0) {
  if (!node || depth > MAXIMUM_EVALUATION_DEPTH) return UNKNOWN_VALUE;

  if (
    typescript.isStringLiteral(node) ||
    typescript.isNoSubstitutionTemplateLiteral(node) ||
    typescript.isNumericLiteral(node)
  ) {
    // Numbers count: `[1, 2, 3].map((n) => `yourRights.item${n}`)` is a real
    // key-building idiom in `privacy.data.tsx`.
    return [[node.text]];
  }

  if (typescript.isTemplateExpression(node)) {
    let alternatives = [[node.head.text]];
    for (const span of node.templateSpans) {
      alternatives = concatenateAlternatives(
        alternatives,
        evaluate(span.expression, scope, depth + 1),
      );
      alternatives = concatenateAlternatives(alternatives, [
        [span.literal.text],
      ]);
    }
    return alternatives;
  }

  if (typescript.isConditionalExpression(node)) {
    return [
      ...evaluate(node.whenTrue, scope, depth + 1),
      ...evaluate(node.whenFalse, scope, depth + 1),
    ].slice(0, MAXIMUM_ALTERNATIVES);
  }

  if (
    typescript.isBinaryExpression(node) &&
    node.operatorToken.kind === typescript.SyntaxKind.PlusToken
  ) {
    return concatenateAlternatives(
      evaluate(node.left, scope, depth + 1),
      evaluate(node.right, scope, depth + 1),
    );
  }

  if (
    typescript.isParenthesizedExpression(node) ||
    typescript.isAsExpression(node) ||
    typescript.isSatisfiesExpression(node) ||
    typescript.isNonNullExpression(node) ||
    typescript.isTypeAssertionExpression(node)
  ) {
    return evaluate(node.expression, scope, depth + 1);
  }

  if (typescript.isIdentifier(node)) {
    const bound = scope.bindings.get(node.text);
    if (bound) return bound;
    const declarations = scope.constants.get(node.text);
    if (!declarations) return UNKNOWN_VALUE;
    const alternatives = [];
    for (const declaration of declarations) {
      alternatives.push(...evaluate(declaration, scope, depth + 1));
    }
    return alternatives.slice(0, MAXIMUM_ALTERNATIVES);
  }

  if (
    typescript.isElementAccessExpression(node) ||
    typescript.isPropertyAccessExpression(node)
  ) {
    return evaluateMemberAccess(node, scope, depth);
  }

  if (
    typescript.isCallExpression(node) &&
    typescript.isPropertyAccessExpression(node.expression) &&
    ELEMENT_CALLBACK_METHODS.has(node.expression.name.text)
  ) {
    const values = evaluateArrayElements(node, scope, depth);
    if (values && values.length > 0) return values;
    return UNKNOWN_VALUE;
  }

  if (
    typescript.isCallExpression(node) &&
    typescript.isIdentifier(node.expression)
  ) {
    const declarations = scope.functions.get(node.expression.text);
    if (!declarations || declarations.length !== 1) return UNKNOWN_VALUE;
    const [declaration] = declarations;
    const bindings = new Map(scope.bindings);
    declaration.parameterNames.forEach((parameterName, index) => {
      if (parameterName === null) return;
      const argument = node.arguments[index];
      bindings.set(
        parameterName,
        argument ? evaluate(argument, scope, depth + 1) : UNKNOWN_VALUE,
      );
    });
    const alternatives = [];
    for (const body of declaration.bodies) {
      alternatives.push(...evaluate(body, { ...scope, bindings }, depth + 1));
      if (alternatives.length >= MAXIMUM_ALTERNATIVES) break;
    }
    return alternatives.length === 0
      ? UNKNOWN_VALUE
      : alternatives.slice(0, MAXIMUM_ALTERNATIVES);
  }

  return UNKNOWN_VALUE;
}

// ── extraction ─────────────────────────────────────────────────────────────

/**
 * Pull every string literal, every declared name, and every hole-bearing
 * template out of one file. A template that resolves with no holes left is
 * just another literal; one that keeps a hole becomes a pattern.
 */
function extractFromFile(filePath, relativePath) {
  const text = readFileSync(filePath, "utf8");
  const sourceFile = typescript.createSourceFile(
    relativePath,
    text,
    typescript.ScriptTarget.Latest,
    false,
    relativePath.endsWith(".tsx")
      ? typescript.ScriptKind.TSX
      : typescript.ScriptKind.TS,
  );

  // A file the parser chokes on yields a partial AST, which silently drops the
  // literals it holds and could turn a live key into a reported-dead one. That
  // is the one failure mode this tool must never have quietly, so it is loud.
  const parseDiagnostics = sourceFile.parseDiagnostics ?? [];

  const scope = buildScope(sourceFile);
  const literals = new Set();
  const prefixLiterals = new Set();
  const declaredNames = new Set();
  const patterns = [];

  /** Every literal is a candidate key; one ending on a separator is also a
   *  candidate PREFIX, which `analyse()` checks against the catalogs. */
  const rememberLiteral = (text) => {
    literals.add(text);
    if (KEY_PREFIX_LITERAL_PATTERN.test(text)) prefixLiterals.add(text);
  };

  const visit = (node, activeScope) => {
    // `LIST.map((id) => `a.b.${id}`)` and `LIST.map(namedHelper)` both bind the
    // callback's first parameter, so the template inside resolves to real keys
    // rather than a shape. Walked in ADDITION to the ordinary traversal, so an
    // unresolvable second call site still widens the shape.
    if (
      typescript.isCallExpression(node) &&
      typescript.isPropertyAccessExpression(node.expression) &&
      ELEMENT_CALLBACK_METHODS.has(node.expression.name.text)
    ) {
      const elements = evaluateArrayElements(
        node.expression.expression,
        activeScope,
        0,
      );
      const callback = resolveCallback(node.arguments[0], activeScope);
      if (elements && callback && callback.parameterNames[0]) {
        for (const value of elements) {
          const childScope = {
            ...activeScope,
            bindings: bindCallbackParameter(activeScope, callback, value),
          };
          for (const body of callback.bodies) visit(body, childScope);
        }
      }
    }

    if (
      typescript.isStringLiteral(node) ||
      typescript.isNoSubstitutionTemplateLiteral(node)
    ) {
      rememberLiteral(node.text);
    } else if (typescript.isTemplateExpression(node)) {
      for (const value of evaluate(node, activeScope)) {
        if (value.every((segment) => segment !== null)) {
          rememberLiteral(value.join(""));
        } else {
          patterns.push({ segments: value, file: relativePath });
        }
      }
    } else if (
      (typescript.isPropertyAssignment(node) ||
        typescript.isShorthandPropertyAssignment(node) ||
        typescript.isEnumMember(node) ||
        typescript.isPropertySignature(node) ||
        typescript.isMethodDeclaration(node)) &&
      node.name &&
      typescript.isIdentifier(node.name)
    ) {
      // A key fragment is often an object key rather than a quoted string:
      // `Object.keys(RECORD)` and `record[value]` both put those names into
      // dynamic keys. They feed the fragment pool only, never liveness.
      declaredNames.add(node.name.text);
    }
    typescript.forEachChild(node, (child) => visit(child, activeScope));
  };
  visit(sourceFile, scope);

  return {
    literals,
    prefixLiterals,
    declaredNames,
    patterns,
    parseDiagnostics,
  };
}

// ── the fragment pool ──────────────────────────────────────────────────────

/**
 * Everything the source can be said to "spell". A hole whose value is in here
 * is a hole some code plausibly fills; a hole whose value is not is a hole
 * nothing in this repository knows how to produce.
 *
 * Contiguous dot-runs matter because this codebase slices keys apart at dots
 * (`keyBeforeSuffix`, `lastSegment` in `useAdminGovernanceOverview.ts`) and
 * reassembles them elsewhere.
 */
function addFragments(literal, pool) {
  if (!KEY_SHAPED_PATTERN.test(literal)) return;
  const colonIndex = literal.indexOf(":");
  const candidates =
    colonIndex === -1 ? [literal] : [literal, literal.slice(colonIndex + 1)];
  for (const candidate of candidates) {
    const segments = candidate.split(".");
    if (segments.length > MAXIMUM_FRAGMENT_SEGMENTS) {
      pool.add(candidate);
      continue;
    }
    for (let start = 0; start < segments.length; start += 1) {
      for (let end = start + 1; end <= segments.length; end += 1) {
        pool.add(segments.slice(start, end).join("."));
      }
    }
  }
}

function isHoleValueProduced(value, fragmentPool) {
  if (value === "") return true;
  if (DIGITS_PATTERN.test(value)) return true;
  return fragmentPool.has(value);
}

// ── key-prefix literals (rule 8) ───────────────────────────────────────────

/**
 * Every string that is a PROPER prefix of some catalog key and stops on a key
 * separator: for `governance:transparency.category.spam` that is `governance:`,
 * `governance:transparency.`, `governance:transparency.category.`, and the same
 * three without the namespace, because a literal carrying no namespace is
 * matched against every namespace (rule 6).
 *
 * Membership in this set is the whole test rule 8 applies. It is deliberately
 * not "starts a key": that would accept `"m"`.
 */
function collectKeyPrefixes(catalogs) {
  const prefixes = new Set();
  for (const [namespace, catalog] of catalogs) {
    prefixes.add(`${namespace}:`);
    for (const path of catalog) {
      let cursor = path.indexOf(".");
      while (cursor !== -1) {
        const prefix = path.slice(0, cursor + 1);
        prefixes.add(prefix);
        prefixes.add(`${namespace}:${prefix}`);
        cursor = path.indexOf(".", cursor + 1);
      }
    }
  }
  return prefixes;
}

/**
 * Turn each key-prefix literal into the shape `prefix*` and append it to the
 * pattern list, so it flows through exactly the same reach / produced / tier
 * machinery as a shape that came from a template literal.
 *
 * The hole gets no special treatment: where the source spells the suffix the
 * key comes out LIVE-BY-SHAPE, where it does not the key lands in 1C if the
 * hole took one segment and 1B if it took more. That is the honest reading. A
 * prefix used this way is a real enumeration over a vocabulary, which is the
 * same situation `safety:governance.audit.*` is in, and 1C is where a human
 * reads it.
 */
function appendPrefixLiteralPatterns(
  prefixLiteralFiles,
  keyPrefixes,
  patterns,
) {
  for (const [literal, files] of prefixLiteralFiles) {
    if (!keyPrefixes.has(literal)) continue;
    for (const file of files)
      patterns.push({ segments: [literal, null], file });
  }
}

// ── matching ───────────────────────────────────────────────────────────────

/**
 * Mark one resolved key string live.
 *
 * A string carrying `namespace:` is confined to that namespace. A bare one is
 * matched against every namespace: `t("save")` really does mean `common:save`,
 * and a bare fragment can be composed with a namespace in another module.
 * Whichever way it matches, the whole plural family goes with it.
 */
function markLiteral(literal, catalogs, liveKeys) {
  const colonIndex = literal.indexOf(":");
  if (colonIndex !== -1) {
    const namespace = literal.slice(0, colonIndex);
    const path = literal.slice(colonIndex + 1);
    if (!NAMESPACE_PATTERN.test(namespace) || !KEY_PATH_PATTERN.test(path)) {
      return;
    }
    markPathInNamespace(namespace, path, catalogs, liveKeys);
    return;
  }
  if (!KEY_PATH_PATTERN.test(literal)) return;
  for (const namespace of catalogs.keys()) {
    markPathInNamespace(namespace, literal, catalogs, liveKeys);
  }
}

function markPathInNamespace(namespace, path, catalogs, liveKeys) {
  const catalog = catalogs.get(namespace);
  if (!catalog) return;
  const base = pluralBase(path);
  const candidates = [
    path,
    base,
    ...PLURAL_SUFFIXES.map((suffix) => `${base}_${suffix}`),
  ];
  for (const candidate of candidates) {
    if (catalog.has(candidate)) liveKeys.add(`${namespace}:${candidate}`);
  }
}

function escapeForRegularExpression(text) {
  return text.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
}

/**
 * Turn a hole-bearing value into a matcher, or reject it as not-a-key.
 *
 * The guards exist because most template literals in the app build URLs, class
 * names, and query keys. A template counts as an i18n key shape only when
 * every known segment is spelled out of key characters, the known text carries
 * a `.` or a `:`, and at least one known run is long enough to mean something.
 * A URL-ish template still slips through now and then, which only ever moves a
 * key into "undecidable", never into "unused".
 */
function buildPattern(segments) {
  const staticSegments = segments.filter((segment) => segment !== null);
  if (staticSegments.length === 0) return null;
  if (!staticSegments.every((segment) => /^[A-Za-z0-9_.:-]*$/.test(segment))) {
    return null;
  }
  const joined = staticSegments.join("");
  if (!joined.includes(".") && !joined.includes(":")) return null;
  const longest = Math.max(...staticSegments.map((segment) => segment.length));
  if (longest < MINIMUM_STATIC_SEGMENT_LENGTH) return null;

  const source = segments
    .map((segment) =>
      segment === null
        ? `(${HOLE_PATTERN_SOURCE})`
        : escapeForRegularExpression(segment),
    )
    .join("");

  return {
    label: segments
      .map((segment) => (segment === null ? "*" : segment))
      .join(""),
    // A pattern whose known text names a namespace is anchored to it. One that
    // does not (`${keyPrefix}.title`) is tried both ways: against the full
    // `ns:path`, where the hole swallows the namespace, and the bare path.
    isNamespaced: joined.includes(":"),
    matcher: new RegExp(`^${source}$`),
  };
}

/**
 * How many key segments a hole swallowed. `""` is 0, `"critical"` is 1,
 * `"forOrgs.tiers.employer.list3"` is 4. This is the measure of how much a
 * shape actually constrains: a one-segment hole is a tight enumeration
 * (`safety:governance.audit.*` over an action code), while a four-segment one
 * is a catch-all that says nothing about the key it happens to match.
 */
function holeSpan(value) {
  if (value === "") return 0;
  return value.split(/[.:]/).filter(Boolean).length;
}

/**
 * Every catalog key a pattern can reach, with the values its holes must take
 * for that key. Plural bases are tried too, so `foo.bar_one` is reachable
 * through a pattern that spells `foo.bar`.
 */
function keysMatchedByPattern(pattern, catalogs) {
  const matched = [];
  for (const [namespace, catalog] of catalogs) {
    for (const path of catalog) {
      const subjects = pattern.isNamespaced
        ? [`${namespace}:${path}`, `${namespace}:${pluralBase(path)}`]
        : [
            `${namespace}:${path}`,
            `${namespace}:${pluralBase(path)}`,
            path,
            pluralBase(path),
          ];
      // Every form is tried and every hole tuple kept: `foo.bar_one` matches
      // both as itself and through its plural base `foo.bar`, and only the
      // base's hole value is one the source ever spells.
      const holeTuples = [];
      for (const subject of subjects) {
        const match = pattern.matcher.exec(subject);
        if (match) holeTuples.push(match.slice(1));
      }
      if (holeTuples.length > 0) {
        matched.push({ key: `${namespace}:${path}`, holeTuples });
      }
    }
  }
  return matched;
}

// ── report ─────────────────────────────────────────────────────────────────

function formatNumber(value) {
  return value.toLocaleString("en-GB");
}

export function analyse() {
  const catalogs = loadCatalogs(catalogDirectoryEn);
  const files = collectSourceFiles();

  const productLiterals = new Set();
  const testLiterals = new Set();
  const productPatterns = [];
  const testPatterns = [];
  /** literal → the files that spell it, so a synthesised shape can be traced. */
  const productPrefixLiteralFiles = new Map();
  const testPrefixLiteralFiles = new Map();
  const fragmentPool = new Set();
  const unparseableFiles = [];
  let productFileCount = 0;
  let testFileCount = 0;

  for (const filePath of files) {
    const relativePath = relative(repositoryRoot, filePath);
    const extracted = extractFromFile(filePath, relativePath);
    if (extracted.parseDiagnostics.length > 0) {
      unparseableFiles.push(relativePath);
    }
    const rememberPrefixLiterals = (destination) => {
      for (const literal of extracted.prefixLiterals) {
        const files = destination.get(literal);
        if (files) files.add(relativePath);
        else destination.set(literal, new Set([relativePath]));
      }
    };

    if (isTestFile(relativePath)) {
      testFileCount += 1;
      for (const literal of extracted.literals) testLiterals.add(literal);
      rememberPrefixLiterals(testPrefixLiteralFiles);
      testPatterns.push(...extracted.patterns);
      continue;
    }
    productFileCount += 1;
    for (const literal of extracted.literals) {
      productLiterals.add(literal);
      addFragments(literal, fragmentPool);
    }
    for (const name of extracted.declaredNames) fragmentPool.add(name);
    rememberPrefixLiterals(productPrefixLiteralFiles);
    productPatterns.push(...extracted.patterns);
  }

  // Rule 8. A literal ending on a key separator that is a proper prefix of a
  // catalog key becomes the shape `prefix*`, whether or not any concatenation
  // was visible. Appended here, where the catalogs are in hand, and then
  // treated exactly like a shape that came from a template literal.
  const keyPrefixes = collectKeyPrefixes(catalogs);
  appendPrefixLiteralPatterns(
    productPrefixLiteralFiles,
    keyPrefixes,
    productPatterns,
  );
  appendPrefixLiteralPatterns(
    testPrefixLiteralFiles,
    keyPrefixes,
    testPatterns,
  );

  const liveKeys = new Set();
  for (const literal of productLiterals)
    markLiteral(literal, catalogs, liveKeys);

  // One shape reported from twenty files is one line in the report.
  const patternsByLabel = new Map();
  for (const { segments, file } of productPatterns) {
    const pattern = buildPattern(segments);
    if (!pattern) continue;
    const existing = patternsByLabel.get(pattern.label);
    if (existing) existing.files.add(file);
    else
      patternsByLabel.set(pattern.label, { pattern, files: new Set([file]) });
  }

  /** key → { producedBy: Set<label>, reachedBy: Set<label> } */
  const patternReach = new Map();
  for (const [label, entry] of patternsByLabel) {
    const matches = keysMatchedByPattern(entry.pattern, catalogs);
    entry.matchCount = matches.length;
    entry.producedCount = 0;
    for (const { key, holeTuples } of matches) {
      const isProduced = holeTuples.some((holes) =>
        holes.every((value) => isHoleValueProduced(value, fragmentPool)),
      );
      if (isProduced) entry.producedCount += 1;
      if (liveKeys.has(key)) continue;
      let reach = patternReach.get(key);
      if (!reach) {
        reach = {
          producedBy: new Set(),
          reachedBy: new Set(),
          tightestSpan: Number.POSITIVE_INFINITY,
          tightestLabel: label,
        };
        patternReach.set(key, reach);
      }
      reach.reachedBy.add(label);
      if (isProduced) reach.producedBy.add(label);
      // Only a shape that pins its namespace can be "tight": one that does not
      // (`*.title`) has a hole wide enough to swallow the namespace and most of
      // the path, whatever a bare-path match happens to capture.
      const span = entry.pattern.isNamespaced
        ? Math.min(
            ...holeTuples.map((holes) =>
              Math.max(...holes.map((value) => holeSpan(value))),
            ),
          )
        : Number.MAX_SAFE_INTEGER;
      if (span < reach.tightestSpan) {
        reach.tightestSpan = span;
        reach.tightestLabel = label;
      }
    }
  }

  // Test evidence, computed the same way but kept in its own bucket.
  const testLiveKeys = new Set();
  for (const literal of testLiterals) {
    markLiteral(literal, catalogs, testLiveKeys);
  }
  for (const { segments } of testPatterns) {
    const pattern = buildPattern(segments);
    if (!pattern) continue;
    for (const { key } of keysMatchedByPattern(pattern, catalogs)) {
      testLiveKeys.add(key);
    }
  }

  const buckets = {
    live: new Map(),
    dynamic: new Map(),
    unreachable: new Map(),
    unproducedBroad: new Map(),
    unproducedTight: new Map(),
    testOnly: new Map(),
  };
  for (const namespace of catalogs.keys()) {
    for (const bucket of Object.values(buckets)) bucket.set(namespace, []);
  }

  for (const [namespace, catalog] of catalogs) {
    for (const path of catalog) {
      const key = `${namespace}:${path}`;
      const reach = patternReach.get(key);
      if (liveKeys.has(key)) {
        buckets.live.get(namespace).push(path);
      } else if (reach && reach.producedBy.size > 0) {
        buckets.dynamic.get(namespace).push(path);
      } else if (testLiveKeys.has(key)) {
        buckets.testOnly.get(namespace).push(path);
      } else if (reach) {
        const bucket =
          reach.tightestSpan <= 1
            ? buckets.unproducedTight
            : buckets.unproducedBroad;
        bucket.get(namespace).push({ path, reachedBy: reach.tightestLabel });
      } else {
        buckets.unreachable.get(namespace).push(path);
      }
    }
  }

  return {
    catalogs,
    buckets,
    patternsByLabel,
    patternReach,
    liveKeys,
    testLiveKeys,
    productLiterals,
    fragmentPool,
    productFileCount,
    testFileCount,
    unparseableFiles,
    fragmentPoolSize: fragmentPool.size,
  };
}

function bucketTotal(bucket) {
  return [...bucket.values()].reduce((sum, list) => sum + list.length, 0);
}

/**
 * PT is meant to mirror EN key-for-key. A key that exists only in PT would
 * never appear in this report otherwise, so it is called out separately.
 */
function reportParity(catalogs) {
  const catalogsPt = loadCatalogs(catalogDirectoryPt);
  const orphans = [];
  for (const [namespace, catalog] of catalogsPt) {
    const english = catalogs.get(namespace);
    if (!english) {
      orphans.push(`${namespace} (whole namespace missing from EN)`);
      continue;
    }
    for (const path of catalog) {
      if (!english.has(path)) orphans.push(`${namespace}:${path}`);
    }
  }
  if (orphans.length === 0) return;
  console.log(
    `⚠ ${orphans.length} PT key(s) with no EN counterpart, unclassifiable here:`,
  );
  for (const orphan of orphans.slice(0, 40)) console.log(`    ${orphan}`);
  console.log("");
}

/**
 * Every verdict this tool can reach, as stable ids. The report prints them and
 * `scripts/report-unused-i18n.test.mjs` pins them, so both read the same
 * classification rather than two copies of the same `if` chain.
 */
export const VERDICTS = {
  ABSENT: "absent",
  LIVE_LITERAL: "live-literal",
  LIVE_SHAPE: "live-shape",
  TEST_ONLY: "test-only",
  UNUSED_UNREACHABLE: "1A",
  UNUSED_CATCH_ALL: "1B",
  UNUSED_TIGHT_SHAPE: "1C",
};

const VERDICT_SENTENCES = {
  [VERDICTS.ABSENT]: "not in the EN catalog",
  [VERDICTS.LIVE_LITERAL]: "LIVE (a literal names it)",
  [VERDICTS.LIVE_SHAPE]:
    "LIVE (a dynamic shape reaches it and the source spells its hole)",
  [VERDICTS.TEST_ONLY]: "TEST-ONLY (only a test file names it)",
  [VERDICTS.UNUSED_UNREACHABLE]: "UNUSED, tier 1A (nothing can reach it)",
  [VERDICTS.UNUSED_CATCH_ALL]:
    "UNUSED, tier 1B (only a catch-all shape reaches it)",
  [VERDICTS.UNUSED_TIGHT_SHAPE]:
    "UNUSED by this repo, tier 1C (a TIGHT shape reaches it; the value may be backend-only, review it)",
};

/**
 * The verdict for one `namespace:path`, from an {@link analyse} result.
 *
 * Exported because a test that pins the hard cases has to ask the same
 * question the report asks, through the same code.
 */
export function classifyKey(result, requestedKey) {
  const { catalogs, patternReach, liveKeys, testLiveKeys } = result;
  const colonIndex = requestedKey.indexOf(":");
  if (colonIndex === -1) return VERDICTS.ABSENT;
  const catalog = catalogs.get(requestedKey.slice(0, colonIndex));
  if (!catalog || !catalog.has(requestedKey.slice(colonIndex + 1))) {
    return VERDICTS.ABSENT;
  }

  if (liveKeys.has(requestedKey)) return VERDICTS.LIVE_LITERAL;
  const reach = patternReach.get(requestedKey);
  if (reach && reach.producedBy.size > 0) return VERDICTS.LIVE_SHAPE;
  if (testLiveKeys.has(requestedKey)) return VERDICTS.TEST_ONLY;
  if (!reach) return VERDICTS.UNUSED_UNREACHABLE;
  return reach.tightestSpan <= 1
    ? VERDICTS.UNUSED_TIGHT_SHAPE
    : VERDICTS.UNUSED_CATCH_ALL;
}

/**
 * Why one key got the verdict it got. The point of this flag is that nobody
 * has to trust the summary: every classification can be re-derived by hand
 * from what it prints.
 */
function explain(result, requestedKey) {
  const { patternsByLabel, patternReach, liveKeys } = result;
  if (!requestedKey.includes(":")) {
    console.error(`Pass a full key, as namespace:path. Got "${requestedKey}".`);
    process.exit(2);
  }
  const path = requestedKey.slice(requestedKey.indexOf(":") + 1);
  const verdict = classifyKey(result, requestedKey);

  console.log(`${requestedKey}`);
  console.log(`  verdict   ${VERDICT_SENTENCES[verdict]}`);
  if (verdict === VERDICTS.ABSENT) return;

  if (verdict === VERDICTS.LIVE_LITERAL || !patternReach.has(requestedKey)) {
    if (liveKeys.has(requestedKey)) {
      for (const [label, entry] of patternsByLabel) {
        if (entry.pattern.matcher.test(requestedKey)) {
          console.log(`  also reached by shape  ${label}`);
        }
      }
      console.log(
        "  Find the use site with: grep -rn " + JSON.stringify(path) + " src",
      );
      return;
    }
    console.log("  No literal equals it and no dynamic shape can reach it.");
    return;
  }

  const reach = patternReach.get(requestedKey);
  for (const label of reach.reachedBy) {
    const entry = patternsByLabel.get(label);
    console.log(
      `  reached by  ${label}\n    from ${[...entry.files].sort().join(", ")}` +
        `\n    hole value spelled in the source: ${reach.producedBy.has(label) ? "yes" : "no"}`,
    );
  }
  console.log(`  tightest shape  ${reach.tightestLabel}`);
}

/** One namespace block per bucket entry, with the shape that reached it. */
function printUnusedEntries(bucket, shouldList) {
  for (const [namespace, entries] of bucket) {
    if (entries.length === 0 || !shouldList(namespace)) continue;
    console.log(`  ${namespace} (${formatNumber(entries.length)})`);
    for (const entry of [...entries].sort((left, right) =>
      left.path.localeCompare(right.path),
    )) {
      console.log(`    ${namespace}:${entry.path}   ← ${entry.reachedBy}`);
    }
    console.log("");
  }
}

function main() {
  const result = analyse();
  const { catalogs, buckets, patternsByLabel } = result;

  if (options.explainKey !== null) {
    explain(result, options.explainKey);
    return;
  }

  const totals = {
    all: [...catalogs.values()].reduce((sum, set) => sum + set.size, 0),
    live: bucketTotal(buckets.live),
    dynamic: bucketTotal(buckets.dynamic),
    unreachable: bucketTotal(buckets.unreachable),
    unproducedBroad: bucketTotal(buckets.unproducedBroad),
    unproducedTight: bucketTotal(buckets.unproducedTight),
    testOnly: bucketTotal(buckets.testOnly),
  };

  console.log("QueerPulse unused i18n key report");
  console.log("═".repeat(74));
  console.log(
    `Catalog   ${formatNumber(totals.all)} EN keys across ${catalogs.size} namespaces`,
  );
  console.log(
    `Scanned   ${formatNumber(result.productFileCount)} product files, ${formatNumber(result.testFileCount)} test files`,
  );
  console.log(
    `Dynamic   ${formatNumber(patternsByLabel.size)} distinct key shapes, ${formatNumber(result.fragmentPoolSize)} fragments in the pool`,
  );
  console.log("");

  if (result.unparseableFiles.length > 0) {
    console.error(
      `✗ ${result.unparseableFiles.length} file(s) did not parse cleanly. Their\n` +
        "  literals may be missing, so this run cannot be trusted to report a key\n" +
        "  as unused. Fix the syntax, or exclude the file, then re-run:",
    );
    for (const file of result.unparseableFiles) console.error(`    ${file}`);
    process.exit(2);
  }

  reportParity(catalogs);

  const shouldList = (namespace) =>
    options.namespaceFilter === null || options.namespaceFilter === namespace;

  if (!options.isSummaryOnly) {
    console.log("── 1A. Unused, unreachable ".padEnd(74, "─"));
    console.log(
      "No literal in the product source equals these, and no key shape this\n" +
        "tool models can reach them. The strongest signal it produces, and the\n" +
        "tier a deletion pass is meant to trust without reading each key.\n" +
        "It has been wrong once: a curried key prefix hid seventeen live keys\n" +
        "here on 2026-08-26. The constructs it models, and the ones that still\n" +
        "slip past, are enumerated in scripts/README-unused-i18n.md. STILL READ\n" +
        "ANY FAMILY WHOSE SIBLINGS ARE ALL FLAGGED: that is what caught it.\n",
    );
    for (const [namespace, paths] of buckets.unreachable) {
      if (paths.length === 0 || !shouldList(namespace)) continue;
      console.log(`  ${namespace} (${formatNumber(paths.length)})`);
      for (const path of [...paths].sort()) {
        console.log(`    ${namespace}:${path}`);
      }
      console.log("");
    }

    console.log(
      "── 1B. Unused, reached only by a catch-all shape ".padEnd(74, "─"),
    );
    console.log(
      "The only shapes that touch these swallow two or more key segments at\n" +
        "once (`marketing:*`, `*.title`), so they constrain nothing and reaching a\n" +
        "key means little. Nothing in the source spells the fragment they would\n" +
        "need. Nearly as safe as 1A.\n",
    );
    printUnusedEntries(buckets.unproducedBroad, shouldList);

    console.log(
      "── 1C. Unused by this repo, but a TIGHT shape reaches them ".padEnd(
        74,
        "─",
      ),
    );
    console.log(
      "A shape with a one-segment hole reaches these, a real enumeration, and\n" +
        "the value that would fill it is spelled nowhere in the frontend. That\n" +
        "means either the key is dead OR the value only ever exists on the\n" +
        "backend. `safety:governance.audit.badge_restored` is the second kind:\n" +
        "`AdminSafeSpaceNominationDrawer.tsx` renders\n" +
        "`t(`safety:governance.audit.${entry.action}`)` and `action` is a bare\n" +
        "`string` off the audit DTO. REVIEW EVERY ONE. Do not bulk-delete.\n",
    );
    printUnusedEntries(buckets.unproducedTight, shouldList);

    if (totals.testOnly > 0) {
      console.log("── 2. Referenced only by tests ".padEnd(74, "─"));
      console.log(
        "The product never names these; only a test does. Almost certainly dead,\n" +
          "but deleting one breaks the suite, so they are listed apart.\n",
      );
      for (const [namespace, paths] of buckets.testOnly) {
        if (paths.length === 0 || !shouldList(namespace)) continue;
        console.log(`  ${namespace} (${formatNumber(paths.length)})`);
        for (const path of [...paths].sort()) {
          console.log(`    ${namespace}:${path}`);
        }
      }
      console.log("");
    }
  }

  console.log("── 3. Undecidable: the dynamic key shapes ".padEnd(74, "─"));
  console.log(
    "Each shape's hole is a value this script cannot close. `produced` counts\n" +
      "the keys whose hole value the source does spell somewhere; those are\n" +
      "treated as live. The rest fall to 1B.\n",
  );
  const sortedPatterns = [...patternsByLabel.entries()]
    .filter(([, entry]) => entry.matchCount > 0)
    .sort((left, right) => right[1].matchCount - left[1].matchCount);
  const shownPatterns = options.shouldListAllPatterns
    ? sortedPatterns
    : sortedPatterns.slice(0, 30);
  for (const [label, entry] of shownPatterns) {
    console.log(
      `  ${label}\n    ${formatNumber(entry.matchCount)} keys reached · ${formatNumber(entry.producedCount)} produced · from ${[...entry.files].sort().join(", ")}`,
    );
  }
  if (shownPatterns.length < sortedPatterns.length) {
    console.log(
      `  … ${formatNumber(sortedPatterns.length - shownPatterns.length)} narrower shapes not shown (--patterns for all)`,
    );
  }
  console.log("");

  console.log("── 4. Summary ".padEnd(74, "─"));
  console.log(
    `  ${"namespace".padEnd(15)}${"total".padStart(8)}${"live".padStart(8)}${"dynamic".padStart(9)}${"test".padStart(6)}${"1A".padStart(7)}${"1B".padStart(7)}${"1C".padStart(7)}`,
  );
  const unusedTotalFor = (namespace) =>
    buckets.unreachable.get(namespace).length +
    buckets.unproducedBroad.get(namespace).length +
    buckets.unproducedTight.get(namespace).length;
  const summaryRows = [...catalogs.keys()].sort(
    (left, right) => unusedTotalFor(right) - unusedTotalFor(left),
  );
  for (const namespace of summaryRows) {
    console.log(
      `  ${namespace.padEnd(15)}` +
        `${formatNumber(catalogs.get(namespace).size).padStart(8)}` +
        `${formatNumber(buckets.live.get(namespace).length).padStart(8)}` +
        `${formatNumber(buckets.dynamic.get(namespace).length).padStart(9)}` +
        `${formatNumber(buckets.testOnly.get(namespace).length).padStart(6)}` +
        `${formatNumber(buckets.unreachable.get(namespace).length).padStart(7)}` +
        `${formatNumber(buckets.unproducedBroad.get(namespace).length).padStart(7)}` +
        `${formatNumber(buckets.unproducedTight.get(namespace).length).padStart(7)}`,
    );
  }
  console.log(
    `  ${"TOTAL".padEnd(15)}${formatNumber(totals.all).padStart(8)}${formatNumber(totals.live).padStart(8)}${formatNumber(totals.dynamic).padStart(9)}${formatNumber(totals.testOnly).padStart(6)}${formatNumber(totals.unreachable).padStart(7)}${formatNumber(totals.unproducedBroad).padStart(7)}${formatNumber(totals.unproducedTight).padStart(7)}`,
  );
  console.log("");
  console.log(
    `  1A unreachable ${formatNumber(totals.unreachable)} · 1B catch-all-only ${formatNumber(totals.unproducedBroad)} · 1C tight-shape ${formatNumber(totals.unproducedTight)} · test-only ${formatNumber(totals.testOnly)} · treated live ${formatNumber(totals.live + totals.dynamic)}`,
  );

  if (options.maximumUnused !== null) {
    // The budget tracks the DELETABLE surface, 1A plus 1B. Tier 1C is left
    // out on purpose: it holds keys that are live through backend-only values,
    // so its count moving is not a fact about this repo's debt.
    const deletable = totals.unreachable + totals.unproducedBroad;
    const budget = Number(options.maximumUnused);
    if (deletable > budget) {
      console.error(
        `✗ ${formatNumber(deletable)} unused keys (1A + 1B) exceeds the budget of ${formatNumber(budget)}.`,
      );
      process.exit(1);
    }
    console.log(
      `✓ ${formatNumber(deletable)} unused keys (1A + 1B), at or under the budget of ${formatNumber(budget)}.`,
    );
  }
}

// Importable as a module (the test asks it for one key's verdict) and runnable
// as a CLI, so only a direct `node scripts/report-unused-i18n.mjs` prints.
const entryPoint = process.argv[1];
if (entryPoint && resolve(entryPoint) === fileURLToPath(import.meta.url)) {
  main();
}
