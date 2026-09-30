#!/usr/bin/env node
/**
 * Local check: the frontend work taxonomy matches the backend's, and every id
 * in it has a label in both catalogs.
 *
 * The backend `profiles/professions.ts` is the authority for field and
 * profession ids. The frontend keeps an import-free mirror in
 * `src/features/members/workTaxonomy.data.ts`, and the job vocabulary
 * (commitment and seniority ids) lives on both sides as well. This script
 * transpiles each source file with the TypeScript compiler, imports the
 * result from a temporary directory, and reports every difference:
 *
 *   1. field ids and their order
 *   2. per field, the profession ids and their order
 *   3. backend `JOB_FIELD_IDS` against frontend `JOB_FIELD_IDS`
 *   4. `JOB_COMMITMENT_IDS` and `JOB_SENIORITY_IDS`, backend against frontend
 *   5. every field and profession id has its `directory.discipline.<id>` /
 *      `directory.profession.<id>` label in the EN and PT `members` catalogs
 *   6. every job field sits in exactly one `JOB_FIELD_GROUPS` entry, and every
 *      group id has its `jobs.fieldGroup.<id>` label in EN and PT `economy`
 *   7. every commitment and seniority id has its `postJob.option.*` label in
 *      EN and PT `economy`
 *   8. persona kinds (contract C1): backend `KIND_SECTIONS` against the
 *      frontend `kindSections.data.ts`, kind by kind and section by section
 *   9. the profession → persona kind crosswalk
 *      (`subprofiles/professionKinds.data.ts`) names only listed professions
 *      and backend kinds, and every listed profession is either mapped or
 *      deliberately left out
 *
 * Exit codes: 0 in sync, 1 on any difference, 2 when the backend repo is not
 * checked out beside this one. It stays out of `build-gates.mjs` because the
 * hosted frontend build has no backend repo; run it locally with
 * `node scripts/check-work-taxonomy.mjs`.
 */

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendRoot = resolve(frontendRoot, "..", "queerpulse-backend");

if (!existsSync(backendRoot)) {
  console.error(
    `check-work-taxonomy: backend repo not found at ${backendRoot}; this check runs locally only`,
  );
  process.exit(2);
}

const SOURCE_PATHS = {
  backendProfessions: join(backendRoot, "src/profiles/professions.ts"),
  backendJobVocabulary: join(backendRoot, "src/jobs/job-vocabulary.ts"),
  frontendTaxonomy: join(
    frontendRoot,
    "src/features/members/workTaxonomy.data.ts",
  ),
  frontendJobVocabulary: join(
    frontendRoot,
    "src/features/economy/jobVocabulary.data.ts",
  ),
  backendKinds: join(backendRoot, "src/subprofiles/subprofile-kinds.ts"),
  frontendKinds: join(
    frontendRoot,
    "src/features/subprofiles/kindSections.data.ts",
  ),
  frontendCrosswalk: join(
    frontendRoot,
    "src/features/subprofiles/professionKinds.data.ts",
  ),
  membersEnglish: join(frontendRoot, "src/shared/i18n/catalogs/en/members.ts"),
  membersPortuguese: join(
    frontendRoot,
    "src/shared/i18n/catalogs/pt/members.ts",
  ),
  economyEnglish: join(frontendRoot, "src/shared/i18n/catalogs/en/economy.ts"),
  economyPortuguese: join(
    frontendRoot,
    "src/shared/i18n/catalogs/pt/economy.ts",
  ),
};

const differences = [];
const temporaryDirectory = mkdtempSync(join(tmpdir(), "check-work-taxonomy-"));
const transpiledPathBySource = new Map();

/** Resolve a relative import specifier from a TypeScript source to a file. */
function resolveTypeScriptImport(importerDirectory, specifier) {
  const basePath = resolve(importerDirectory, specifier);
  const candidates = [
    basePath,
    basePath.replace(/\.js$/, ".ts"),
    `${basePath}.ts`,
    `${basePath}.tsx`,
    join(basePath, "index.ts"),
  ];
  const found = candidates.find(
    (candidate) => /\.tsx?$/.test(candidate) && existsSync(candidate),
  );
  if (!found) {
    throw new Error(`cannot resolve "${specifier}" from ${importerDirectory}`);
  }
  return found;
}

/**
 * Transpile one TypeScript file (and, recursively, its relative imports) into
 * the temporary directory and return the output path. Type-only imports are
 * erased by the transpiler, so the catalogs load without their `Catalog` type.
 */
function transpileTree(sourcePath) {
  const knownOutput = transpiledPathBySource.get(sourcePath);
  if (knownOutput) return knownOutput;
  const outputPath = join(
    temporaryDirectory,
    `module-${transpiledPathBySource.size}.mjs`,
  );
  transpiledPathBySource.set(sourcePath, outputPath);
  const source = readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const rewritten = transpiled.replace(
    /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']+)\2/g,
    (_match, prefix, quote, specifier) => {
      const dependencyPath = resolveTypeScriptImport(
        dirname(sourcePath),
        specifier,
      );
      const dependencyUrl = pathToFileURL(transpileTree(dependencyPath)).href;
      return `${prefix}${quote}${dependencyUrl}${quote}`;
    },
  );
  writeFileSync(outputPath, rewritten);
  return outputPath;
}

/** Load one source file, or record why it could not be loaded. */
async function loadModule(label, sourcePath) {
  if (!existsSync(sourcePath)) {
    differences.push(`${label}: file not found at ${sourcePath}`);
    return undefined;
  }
  try {
    return await import(pathToFileURL(transpileTree(sourcePath)).href);
  } catch (error) {
    differences.push(
      `${label}: could not load ${sourcePath} (${error.message})`,
    );
    return undefined;
  }
}

/** The catalog object a catalog module exports (`members` or `economy`). */
function catalogOf(loadedModule, exportName) {
  if (!loadedModule) return undefined;
  const catalog = loadedModule[exportName];
  return catalog && typeof catalog === "object" ? catalog : undefined;
}

/** Record every difference between two ordered id lists. */
function compareOrderedIds(context, backendIds, frontendIds) {
  if (!Array.isArray(backendIds) || !Array.isArray(frontendIds)) {
    differences.push(
      `${context}: missing on the ${Array.isArray(backendIds) ? "frontend" : "backend"}`,
    );
    return;
  }
  const backendSet = new Set(backendIds);
  const frontendSet = new Set(frontendIds);
  for (const id of backendIds) {
    if (!frontendSet.has(id))
      differences.push(`${context}: "${id}" is on the backend only`);
  }
  for (const id of frontendIds) {
    if (!backendSet.has(id))
      differences.push(`${context}: "${id}" is on the frontend only`);
  }
  const sharedBackendOrder = backendIds.filter((id) => frontendSet.has(id));
  const sharedFrontendOrder = frontendIds.filter((id) => backendSet.has(id));
  const firstOrderMismatch = sharedBackendOrder.findIndex(
    (id, position) => id !== sharedFrontendOrder[position],
  );
  if (firstOrderMismatch !== -1) {
    differences.push(
      `${context}: order differs from position ${firstOrderMismatch} (backend "${sharedBackendOrder[firstOrderMismatch]}", frontend "${sharedFrontendOrder[firstOrderMismatch]}")`,
    );
  }
}

/** Record a missing or empty label for `key` in each named catalog. */
function requireLabel(catalogsByName, key) {
  for (const [catalogName, catalog] of Object.entries(catalogsByName)) {
    if (!catalog) continue;
    const value = catalog[key];
    if (typeof value !== "string" || value.trim() === "") {
      differences.push(`${catalogName}: missing label "${key}"`);
    }
  }
}

try {
  const backendProfessions = await loadModule(
    "backend professions",
    SOURCE_PATHS.backendProfessions,
  );
  const backendJobVocabulary = await loadModule(
    "backend job vocabulary",
    SOURCE_PATHS.backendJobVocabulary,
  );
  const frontendTaxonomy = await loadModule(
    "frontend work taxonomy",
    SOURCE_PATHS.frontendTaxonomy,
  );
  const frontendJobVocabulary = await loadModule(
    "frontend job vocabulary",
    SOURCE_PATHS.frontendJobVocabulary,
  );
  const membersCatalogs = {
    "en members": catalogOf(
      await loadModule("en members catalog", SOURCE_PATHS.membersEnglish),
      "members",
    ),
    "pt members": catalogOf(
      await loadModule("pt members catalog", SOURCE_PATHS.membersPortuguese),
      "members",
    ),
  };
  const economyCatalogs = {
    "en economy": catalogOf(
      await loadModule("en economy catalog", SOURCE_PATHS.economyEnglish),
      "economy",
    ),
    "pt economy": catalogOf(
      await loadModule("pt economy catalog", SOURCE_PATHS.economyPortuguese),
      "economy",
    ),
  };
  for (const [catalogName, catalog] of Object.entries({
    ...membersCatalogs,
    ...economyCatalogs,
  })) {
    if (!catalog)
      differences.push(`${catalogName}: catalog object not exported`);
  }

  const backendByField = backendProfessions?.PROFESSIONS_BY_DISCIPLINE ?? {};
  const frontendByField = frontendTaxonomy?.PROFESSION_IDS_BY_FIELD ?? {};

  // 1. Field ids and their order.
  compareOrderedIds(
    "field ids",
    Object.keys(backendByField),
    Object.keys(frontendByField),
  );

  // 2. Per field, the profession ids and their order.
  for (const fieldId of Object.keys(backendByField)) {
    if (!(fieldId in frontendByField)) continue;
    compareOrderedIds(
      `professions of "${fieldId}"`,
      [...backendByField[fieldId]],
      [...frontendByField[fieldId]],
    );
  }

  // 3. Job field ids.
  if (backendProfessions && frontendTaxonomy) {
    compareOrderedIds(
      "JOB_FIELD_IDS",
      backendProfessions.JOB_FIELD_IDS && [...backendProfessions.JOB_FIELD_IDS],
      frontendTaxonomy.JOB_FIELD_IDS && [...frontendTaxonomy.JOB_FIELD_IDS],
    );
  }

  // 4. Commitment and seniority ids.
  if (backendJobVocabulary && frontendJobVocabulary) {
    for (const exportName of ["JOB_COMMITMENT_IDS", "JOB_SENIORITY_IDS"]) {
      compareOrderedIds(
        exportName,
        backendJobVocabulary[exportName] && [
          ...backendJobVocabulary[exportName],
        ],
        frontendJobVocabulary[exportName] && [
          ...frontendJobVocabulary[exportName],
        ],
      );
    }
  }

  // 5. Field and profession labels in both members catalogs.
  const allFieldIds = new Set([
    ...Object.keys(backendByField),
    ...Object.keys(frontendByField),
  ]);
  const allProfessionIds = new Set(
    [
      ...Object.values(backendByField),
      ...Object.values(frontendByField),
    ].flat(),
  );
  for (const fieldId of allFieldIds) {
    requireLabel(membersCatalogs, `directory.discipline.${fieldId}`);
  }
  for (const professionId of allProfessionIds) {
    requireLabel(membersCatalogs, `directory.profession.${professionId}`);
  }

  // 6. Job field groups: each job field in exactly one group, each group labelled.
  const jobFieldIds = [...(frontendTaxonomy?.JOB_FIELD_IDS ?? [])];
  const jobFieldGroups = [...(frontendTaxonomy?.JOB_FIELD_GROUPS ?? [])];
  if (frontendTaxonomy && jobFieldGroups.length === 0) {
    differences.push("JOB_FIELD_GROUPS: missing or empty on the frontend");
  }
  const groupIdsByField = new Map();
  for (const group of jobFieldGroups) {
    for (const fieldId of group.fieldIds) {
      groupIdsByField.set(fieldId, [
        ...(groupIdsByField.get(fieldId) ?? []),
        group.id,
      ]);
    }
    requireLabel(economyCatalogs, `jobs.fieldGroup.${group.id}`);
  }
  for (const fieldId of jobFieldIds) {
    const groupIds = groupIdsByField.get(fieldId) ?? [];
    if (groupIds.length !== 1) {
      differences.push(
        `JOB_FIELD_GROUPS: job field "${fieldId}" sits in ${groupIds.length} groups${groupIds.length ? ` (${groupIds.join(", ")})` : ""}`,
      );
    }
  }
  for (const fieldId of groupIdsByField.keys()) {
    if (!jobFieldIds.includes(fieldId)) {
      differences.push(
        `JOB_FIELD_GROUPS: "${fieldId}" is grouped but is not a job field`,
      );
    }
  }

  // 7. Commitment and seniority labels in both economy catalogs.
  const commitmentIds = new Set([
    ...(backendJobVocabulary?.JOB_COMMITMENT_IDS ?? []),
    ...(frontendJobVocabulary?.JOB_COMMITMENT_IDS ?? []),
  ]);
  const seniorityIds = new Set([
    ...(backendJobVocabulary?.JOB_SENIORITY_IDS ?? []),
    ...(frontendJobVocabulary?.JOB_SENIORITY_IDS ?? []),
  ]);
  for (const commitmentId of commitmentIds) {
    requireLabel(economyCatalogs, `postJob.option.commitment.${commitmentId}`);
  }
  for (const seniorityId of seniorityIds) {
    requireLabel(economyCatalogs, `postJob.option.seniority.${seniorityId}`);
  }

  // 8. Persona kinds and their sections, backend against frontend.
  const backendKinds = await loadModule(
    "backend persona kinds",
    SOURCE_PATHS.backendKinds,
  );
  const frontendKinds = await loadModule(
    "frontend persona kinds",
    SOURCE_PATHS.frontendKinds,
  );
  const backendSectionsByKind = backendKinds?.KIND_SECTIONS ?? {};
  const frontendSectionsByKind = frontendKinds?.KIND_SECTIONS ?? {};
  // Kind order carries no meaning in either record (the create picker orders
  // kinds by `KIND_LABEL_KEYS`), so kinds compare as a set. Section order is
  // the persona page's layout, so it compares strictly below.
  for (const kind of Object.keys(backendSectionsByKind)) {
    if (!(kind in frontendSectionsByKind)) {
      differences.push(`persona kinds: "${kind}" is missing on the frontend`);
    }
  }
  for (const kind of Object.keys(frontendSectionsByKind)) {
    if (!(kind in backendSectionsByKind)) {
      differences.push(`persona kinds: "${kind}" is missing on the backend`);
    }
  }
  for (const kind of Object.keys(backendSectionsByKind)) {
    if (!(kind in frontendSectionsByKind)) continue;
    compareOrderedIds(
      `persona kind "${kind}" sections`,
      backendSectionsByKind[kind],
      frontendSectionsByKind[kind],
    );
  }

  // 9. The profession → persona kind crosswalk.
  const crosswalk = await loadModule(
    "frontend profession → persona kind crosswalk",
    SOURCE_PATHS.frontendCrosswalk,
  );
  const kindsByProfession = crosswalk?.PERSONA_KINDS_BY_PROFESSION ?? {};
  const professionsWithoutKind = [
    ...(crosswalk?.PROFESSIONS_WITHOUT_PERSONA_KIND ?? []),
  ];
  const unlistedFieldIds = backendProfessions?.UNLISTED_DISCIPLINE_IDS ?? [];
  const listedProfessionIds = Object.entries(backendByField)
    .filter(([fieldId]) => !unlistedFieldIds.includes(fieldId))
    .flatMap(([, ids]) => ids);
  for (const [professionId, kinds] of Object.entries(kindsByProfession)) {
    if (!listedProfessionIds.includes(professionId)) {
      differences.push(
        `crosswalk: "${professionId}" is not a listed backend profession`,
      );
    }
    for (const kind of kinds) {
      if (!(kind in backendSectionsByKind)) {
        differences.push(
          `crosswalk: "${professionId}" points at "${kind}", which is not a backend persona kind`,
        );
      }
    }
  }
  for (const professionId of professionsWithoutKind) {
    if (!listedProfessionIds.includes(professionId)) {
      differences.push(
        `crosswalk: "${professionId}" (left without a kind) is not a listed backend profession`,
      );
    }
  }
  for (const professionId of listedProfessionIds) {
    if (
      !(professionId in kindsByProfession) &&
      !professionsWithoutKind.includes(professionId)
    ) {
      differences.push(
        `crosswalk: profession "${professionId}" is neither mapped to a persona kind nor left out on purpose`,
      );
    }
  }

  if (differences.length > 0) {
    for (const difference of differences) console.error(difference);
    console.error(
      `check-work-taxonomy: ${differences.length} difference${differences.length === 1 ? "" : "s"} found`,
    );
    process.exitCode = 1;
  } else {
    const professionCount = Object.values(frontendByField).flat().length;
    console.log(
      `work taxonomy in sync (${Object.keys(frontendByField).length} fields, ${professionCount} professions, ${jobFieldIds.length} job fields, ${Object.keys(frontendSectionsByKind).length} persona kinds, ${Object.keys(kindsByProfession).length} professions mapped to persona kinds)`,
    );
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
