import { useState } from "react";
import type { SkinData } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  skinBlocksForKind,
  skinChaptersForKind,
  type SkinBlockDescriptor,
  type SkinChapterDescriptor,
  type SkinControlKind,
} from "./skinBlockFields.data";
import type { SectionRowMap } from "./useEditorRowsState";
import { nonBlankLines } from "./sectionItemsNormalize";

/** Working copy of the persona's editable `SkinData` blocks, keyed by their
 *  top-level `SkinData` key (`booker`, `chair`, `beforeYouSit`, …). Values are
 *  the raw block shapes (object / `string` / `string[]` / object[]). */
type SkinBlocksDraft = Record<string, unknown>;

export interface SkinBlockChange {
  blockKey: string;
  titleKey: string;
}

export interface SubprofileSkinBlocksEditor {
  /** The blocks this persona's skin can edit (empty for studio/workshop). */
  descriptors: SkinBlockDescriptor[];
  /** `descriptors.length > 0`. Gates the pane + rail entry. */
  hasBlocks: boolean;
  /** The chapters of the pane, each one screen picked by `?chapter=`. Empty
   *  for kinds without a chaptered editor. */
  chapters: SkinChapterDescriptor[];
  /** Read the current value at a `SkinData` dot-path (`"chair.rate"`). A
   *  `section:<name>` path reads that section's draft rows as
   *  `{ title, description }` pairs, so the chapter fill counts them. */
  getValue: (path: string) => unknown;
  /** Read the last-saved value at a `SkinData` dot-path, so the save graph
   *  can tell whether a single field (`"therapist.status"`) changed. */
  getBaselineValue: (path: string) => unknown;
  /** Write a value at a `SkinData` dot-path, preserving sibling sub-fields. */
  setValue: (path: string, value: unknown) => void;
  /** Any block diverged from the last-saved baseline. */
  dirty: boolean;
  /** The blocks that changed since baseline, one entry per changed block, for
   *  the pending-changes list. */
  changes: SkinBlockChange[];
  /**
   * The current values of every editable block, as a `SkinData` subset. The
   * save graph spreads this onto the merged `skinData` it PATCHes (after the
   * loaded `skinData` + `coverBleed`), so exactly ONE request carries the whole
   * column. A second concurrent `skinData` PATCH would clobber the bleed
   * flag. Only the family's own keys are returned; every other block is
   * preserved by the base spread. A block this editor emptied comes back as
   * `null`, so it overrides the stored value in that spread.
   */
  buildSkinBlocks: () => Partial<SkinData>;
  /** Advance the baseline to the current draft after a successful save, so
   *  `dirty` clears without depending on a refetch (mirrors the meta editor). */
  markSaved: () => void;
  /** Restore every block to the last-saved baseline (powers "Discard all"). */
  reset: () => void;
}

const clone = <T>(value: T): T =>
  value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);

/** Drop blank rows from a list before it's persisted: empty strings from a
 *  `string[]`, and all-empty entries from an object[]. Plain strings pass
 *  through untouched. */
function normalizeList(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  if (value.every((entry) => typeof entry === "string")) {
    return value.filter((entry) => entry.trim() !== "");
  }
  return value.filter((entry) =>
    entry && typeof entry === "object"
      ? Object.values(entry as Record<string, unknown>).some(
          (field) => typeof field === "string" && field.trim() !== "",
        )
      : false,
  );
}

/** Control kinds whose value is always an array. `multiSelect` stays out on
 *  purpose: `therapist.languages` may still hold the older comma string until
 *  its first edit, and listing it here would replace that stored text with
 *  `[]` on any save of the block. */
const LIST_CONTROL_KINDS = new Set<SkinControlKind>([
  "stringList",
  "objectList",
  "chips",
  "paragraphs",
  "pairs",
  "entries",
  "lines",
  "multiChoice",
]);

/** The list-typed sub-field names of an object block (e.g. `excerpt` →
 *  `["lines"]`, `menuMeta` → `["practical"]`), read from its
 *  `stringList`/`objectList` controls whose path is nested (`block.field`). A
 *  persisted object block must carry each of these as an array: an ABSENT list
 *  sub-field is read as `undefined.length` by the skin renderers (PageExcerpt,
 *  TableMenuHeader) and white-screens the page, which is exactly what a
 *  partially-filled block produces (e.g. an excerpt with only `from` typed).
 *  Whole-block list descriptors (path === blockKey) are handled by the
 *  empty-list drop in `buildSkinBlocks`. */
function nestedListSubFields(descriptor: SkinBlockDescriptor): string[] {
  const subFields: string[] = [];
  for (const control of descriptor.controls) {
    if (!LIST_CONTROL_KINDS.has(control.kind)) continue;
    const subKey = control.path.split(".")[1];
    if (subKey) subFields.push(subKey);
  }
  return subFields;
}

/** Normalize a whole block for persistence: prune a list block, and prune any
 *  nested list fields inside an object block (e.g. `excerpt.lines`,
 *  `menuMeta.practical`). Object blocks keep their partial scalar fields. */
function normalizeBlockValue(value: unknown): unknown {
  if (Array.isArray(value)) return normalizeList(value);
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [field, fieldValue] of Object.entries(object)) {
      next[field] = Array.isArray(fieldValue)
        ? normalizeList(fieldValue)
        : fieldValue;
    }
    return next;
  }
  return value;
}

/** Whether a normalized block value carries nothing the page could show:
 *  absent, a blank string, an empty list, an object whose every field is blank
 *  or an empty list, or an availability grid without a start date (the skin
 *  cannot place its cells). */
function isEmptyBlockValue(blockKey: string, value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value !== "object") return false;
  const object = value as Record<string, unknown>;
  if (blockKey === "availability") {
    return (
      typeof object.startDate !== "string" || object.startDate.trim() === ""
    );
  }
  return Object.values(object).every(
    (field) =>
      field === undefined ||
      field === null ||
      (typeof field === "string" && field.trim() === "") ||
      (Array.isArray(field) && field.length === 0),
  );
}

/** The path prefix of a `sectionItems` control (`section:specialisms`). */
const SECTION_PATH_PREFIX = "section:";

/** A section's draft rows as their visible text only (heading and lines),
 *  keeping only the rows with at least one non-blank line. Picking a starter
 *  topic writes just its heading, so the control counts as filled once a
 *  topic holds a written line. */
function sectionItemsValue(
  sectionRows: SectionRowMap,
  path: string,
): Array<{ title: string; description: string }> {
  const rows = sectionRows[path.slice(SECTION_PATH_PREFIX.length)] ?? [];
  return rows
    .filter(({ description }) => nonBlankLines(description).length > 0)
    .map(({ title, description }) => ({ title, description }));
}

/** The value at a `SkinData` dot-path (`"chair.rate"`, `"openSlots"`) in a
 *  draft or baseline. Paths go one level deep, under a block. */
function readPath(source: SkinBlocksDraft, path: string): unknown {
  const [blockKey, subKey] = path.split(".");
  const blockValue = source[blockKey!];
  if (!subKey) return blockValue;
  if (blockValue && typeof blockValue === "object") {
    return (blockValue as Record<string, unknown>)[subKey];
  }
  return undefined;
}

/** A block value as the server would hold it, for comparing a stored value
 *  with the one recorded when this editor cleared the block. */
const storedJson = (value: unknown): string =>
  JSON.stringify(value === undefined ? null : value);

/**
 * Therapist blocks the public page still fills from the older `practical`
 * block, because they were never written. Seeding them shows the owner the
 * values their page already shows. Only an absent key (`undefined`) falls
 * back: `null` means the owner cleared the block. Blank fields stay absent.
 * Mirrors `seedFacts` in `skins/therapist/TherapistOwnerBar.tsx`.
 */
function legacyTherapistSeed(skinData: SkinData): SkinBlocksDraft {
  const seed: SkinBlocksDraft = {};
  const practical = skinData.practical;
  if (!practical) return seed;
  if (skinData.therapist === undefined) {
    const languages = practical.languages?.trim() ?? "";
    const mode = practical.mode?.trim() ?? "";
    const facts: Record<string, string> = {};
    if (languages) facts.languages = languages;
    if (mode) facts.where = mode;
    if (/online/i.test(mode)) facts.online = "yes";
    if (Object.keys(facts).length > 0) seed.therapist = facts;
  }
  // The amount the page's `parseAmount` reads, with its separator as typed.
  const feeAmount = practical.fee?.match(/\d+(?:[.,]\d+)?/)?.[0];
  if (skinData.therapyFees === undefined && feeAmount) {
    seed.therapyFees = { standard: feeAmount };
  }
  return seed;
}

/** Seed a draft from the loaded persona's `skinData`, limited to the blocks the
 *  family can edit. Absent blocks stay absent (never seeded as empty objects),
 *  so an untouched family sends nothing extra. A therapist also gets the
 *  blocks its page reads from `practical` (`legacyTherapistSeed`); draft and
 *  baseline both seed through here, so that starts clean. */
function seedDraft(
  subprofile: SubprofileView,
  descriptors: SkinBlockDescriptor[],
): SkinBlocksDraft {
  const draft: SkinBlocksDraft = {};
  const skinData = subprofile.skinData ?? {};
  const legacySeed =
    subprofile.kind === "therapist" ? legacyTherapistSeed(skinData) : {};
  for (const descriptor of descriptors) {
    const value =
      (skinData as Record<string, unknown>)[descriptor.blockKey] ??
      legacySeed[descriptor.blockKey];
    if (value !== undefined && value !== null) {
      draft[descriptor.blockKey] = clone(value);
    }
  }
  return draft;
}

/**
 * Owns the working copy + baseline of the persona's editable `SkinData` blocks
 * (its kind's own table, else its skin family's). Structurally the skin-block
 * analogue of `useSubprofileMetaEditor`: its own baseline advanced by
 * `markSaved`, a `dirty` diff that never depends on a refetch, and a
 * `buildSkinBlocks()` the save graph folds into the single meta PATCH.
 * `coverBleed` is deliberately NOT owned here: it stays on the meta editor,
 * and the save graph merges both into one `skinData` object. `sectionRows`
 * (owned by `useEditorRowsState`) is read only, for `section:<name>` paths.
 */
export function useSubprofileSkinBlocksEditor(
  subprofile: SubprofileView,
  sectionRows: SectionRowMap,
): SubprofileSkinBlocksEditor {
  const [descriptors] = useState<SkinBlockDescriptor[]>(() =>
    skinBlocksForKind(subprofile.kind),
  );
  const [chapters] = useState<SkinChapterDescriptor[]>(() =>
    skinChaptersForKind(subprofile.kind),
  );
  const [draft, setDraft] = useState<SkinBlocksDraft>(() =>
    seedDraft(subprofile, descriptors),
  );
  const [baseline, setBaseline] = useState<SkinBlocksDraft>(() =>
    seedDraft(subprofile, descriptors),
  );
  // Blocks this editor's last save cleared, each mapped to the stored value
  // the loaded persona still showed at that moment. Until the persona
  // refetches, that stale value is spread back under the next save, so the
  // block must be sent as `null` again.
  const [pendingClears, setPendingClears] = useState<Record<string, string>>(
    {},
  );

  const getValue = (path: string): unknown =>
    path.startsWith(SECTION_PATH_PREFIX)
      ? sectionItemsValue(sectionRows, path)
      : readPath(draft, path);
  const getBaselineValue = (path: string): unknown => readPath(baseline, path);

  function setValue(path: string, value: unknown): void {
    const segments = path.split(".");
    const blockKey = segments[0]!;
    const subKey = segments[1];
    setDraft((current) => {
      const next = { ...current };
      if (!subKey) {
        // Whole-block value (a string, string[], or object[]). Drop the key when
        // emptied so an untouched/cleared block leaves no stray entry.
        const emptyString = typeof value === "string" && value.trim() === "";
        const emptyArray = Array.isArray(value) && value.length === 0;
        if (
          value === undefined ||
          value === null ||
          emptyString ||
          emptyArray
        ) {
          delete next[blockKey];
        } else {
          next[blockKey] = value;
        }
        return next;
      }
      // Sub-field of an object block: preserve the sibling fields.
      const existing =
        current[blockKey] && typeof current[blockKey] === "object"
          ? (current[blockKey] as Record<string, unknown>)
          : {};
      next[blockKey] = { ...existing, [subKey]: value };
      return next;
    });
  }

  // Per-block change detection against the last-saved baseline (JSON compare;
  // block values are small plain data). Drives both `dirty` and the itemized
  // pending list.
  const changes: SkinBlockChange[] = [];
  for (const descriptor of descriptors) {
    const currentJson = JSON.stringify(draft[descriptor.blockKey] ?? null);
    const baselineJson = JSON.stringify(baseline[descriptor.blockKey] ?? null);
    if (currentJson !== baselineJson) {
      changes.push({
        blockKey: descriptor.blockKey,
        titleKey: descriptor.titleKey,
      });
    }
  }
  const dirty = changes.length > 0;

  const hasContent = (blockKey: string, value: unknown): boolean =>
    !isEmptyBlockValue(blockKey, normalizeBlockValue(value));
  const isDraftEmpty = (blockKey: string): boolean =>
    !hasContent(blockKey, draft[blockKey]);

  /** Whether THIS editor emptied the block: its baseline (at mount or at the
   *  last save) held content, or the last save cleared it and the loaded
   *  persona still shows the very value that save removed. A block someone
   *  else filled after this editor loaded matches neither, so it is kept. */
  function wasClearedHere(blockKey: string): boolean {
    if (hasContent(blockKey, baseline[blockKey])) return true;
    const loaded = (subprofile.skinData ?? {}) as Record<string, unknown>;
    return (
      blockKey in pendingClears &&
      pendingClears[blockKey] === storedJson(loaded[blockKey]) &&
      hasContent(blockKey, loaded[blockKey])
    );
  }

  function buildSkinBlocks(): Partial<SkinData> {
    const built: SkinBlocksDraft = {};
    for (const descriptor of descriptors) {
      const value = clone(draft[descriptor.blockKey]);
      const normalized =
        value === undefined ? undefined : normalizeBlockValue(value);
      // A block this editor emptied is sent as `null`. The save graph spreads
      // the loaded `skinData` first, so leaving the key out would put the old
      // stored value straight back. Blocks that never held anything here keep
      // the paths below, so an untouched page sends nothing new.
      if (
        isEmptyBlockValue(descriptor.blockKey, normalized) &&
        wasClearedHere(descriptor.blockKey)
      ) {
        built[descriptor.blockKey] = null;
        continue;
      }
      if (normalized === undefined) continue;
      // The availability calendar with no start date is unusable (the skin
      // renderer can't derive day numbers), so a half-filled one is skipped.
      if (
        descriptor.blockKey === "availability" &&
        isEmptyBlockValue(descriptor.blockKey, normalized)
      ) {
        continue;
      }
      // Drop a list block that normalized down to nothing, so an emptied list
      // doesn't persist as `[]`.
      if (Array.isArray(normalized) && normalized.length === 0) continue;
      // Guarantee every declared list sub-field of an object block persists as
      // an array: a partially-filled block (an excerpt with `from` but no
      // `lines` yet) must never save a shape the skin renderers read `.length`
      // off. Preserves the scalar fields the owner has already typed.
      if (
        normalized &&
        typeof normalized === "object" &&
        !Array.isArray(normalized)
      ) {
        const object = normalized as Record<string, unknown>;
        for (const subKey of nestedListSubFields(descriptor)) {
          if (!Array.isArray(object[subKey])) object[subKey] = [];
        }
      }
      built[descriptor.blockKey] = normalized;
    }
    return built;
  }

  function markSaved(): void {
    const loaded = (subprofile.skinData ?? {}) as Record<string, unknown>;
    const clears: Record<string, string> = {};
    for (const { blockKey } of descriptors) {
      if (isDraftEmpty(blockKey) && wasClearedHere(blockKey)) {
        clears[blockKey] = storedJson(loaded[blockKey]);
      }
    }
    setPendingClears(clears);
    setBaseline(clone(draft));
  }

  function reset(): void {
    setDraft(clone(baseline));
  }

  return {
    descriptors,
    hasBlocks: descriptors.length > 0,
    chapters,
    getValue,
    getBaselineValue,
    setValue,
    dirty,
    changes,
    buildSkinBlocks,
    markSaved,
    reset,
  };
}
