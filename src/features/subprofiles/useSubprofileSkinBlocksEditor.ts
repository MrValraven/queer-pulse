import { useState } from "react";
import type { SkinData } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  skinBlocksForKind,
  type SkinBlockDescriptor,
} from "./skinBlockFields.data";

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
  /** `descriptors.length > 0` — gates the pane + rail entry. */
  hasBlocks: boolean;
  /** Read the current value at a `SkinData` dot-path (`"chair.rate"`). */
  getValue: (path: string) => unknown;
  /** Write a value at a `SkinData` dot-path, preserving sibling sub-fields. */
  setValue: (path: string, value: unknown) => void;
  /** Any block diverged from the last-saved baseline. */
  dirty: boolean;
  /** The blocks that changed since baseline — one entry per changed block, for
   *  the pending-changes list. */
  changes: SkinBlockChange[];
  /**
   * The current values of every editable block, as a `SkinData` subset. The
   * save graph spreads this onto the merged `skinData` it PATCHes (after the
   * loaded `skinData` + `coverBleed`), so exactly ONE request carries the whole
   * column — never a second concurrent `skinData` PATCH that would clobber the
   * bleed flag. Only the family's own keys are returned; every other block is
   * preserved by the base spread.
   */
  buildSkinBlocks: () => Partial<SkinData>;
  /** Advance the baseline to the current draft after a successful save, so
   *  `dirty` clears without depending on a refetch (mirrors the meta editor). */
  markSaved: () => void;
  /** Restore every block to the last-saved baseline (powers "Discard all"). */
  reset: () => void;
}

const clone = <T,>(value: T): T =>
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

/** Seed a draft from the loaded persona's `skinData`, limited to the blocks the
 *  family can edit. Absent blocks stay absent (never seeded as empty objects),
 *  so an untouched family sends nothing extra. */
function seedDraft(
  subprofile: SubprofileView,
  descriptors: SkinBlockDescriptor[],
): SkinBlocksDraft {
  const draft: SkinBlocksDraft = {};
  const skinData = subprofile.skinData ?? {};
  for (const descriptor of descriptors) {
    const value = (skinData as Record<string, unknown>)[descriptor.blockKey];
    if (value !== undefined && value !== null) {
      draft[descriptor.blockKey] = clone(value);
    }
  }
  return draft;
}

/**
 * Owns the working copy + baseline of the persona's editable `SkinData` blocks
 * (only those for its derived skin family). Structurally the skin-block analogue
 * of `useSubprofileMetaEditor`: its own baseline advanced by `markSaved`, a
 * `dirty` diff that never depends on a refetch, and a `buildSkinBlocks()` the
 * save graph folds into the single meta PATCH. `coverBleed` is deliberately NOT
 * owned here — it stays on the meta editor; the save graph merges both into one
 * `skinData` object.
 */
export function useSubprofileSkinBlocksEditor(
  subprofile: SubprofileView,
): SubprofileSkinBlocksEditor {
  const [descriptors] = useState<SkinBlockDescriptor[]>(() =>
    skinBlocksForKind(subprofile.kind),
  );
  const [draft, setDraft] = useState<SkinBlocksDraft>(() =>
    seedDraft(subprofile, descriptors),
  );
  const [baseline, setBaseline] = useState<SkinBlocksDraft>(() =>
    seedDraft(subprofile, descriptors),
  );

  function getValue(path: string): unknown {
    const segments = path.split(".");
    const blockKey = segments[0]!;
    const subKey = segments[1];
    const blockValue = draft[blockKey];
    if (!subKey) return blockValue;
    if (blockValue && typeof blockValue === "object") {
      return (blockValue as Record<string, unknown>)[subKey];
    }
    return undefined;
  }

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
        if (value === undefined || value === null || emptyString || emptyArray) {
          delete next[blockKey];
        } else {
          next[blockKey] = value;
        }
        return next;
      }
      // Sub-field of an object block — preserve the sibling fields.
      const existing =
        current[blockKey] && typeof current[blockKey] === "object"
          ? (current[blockKey] as Record<string, unknown>)
          : {};
      next[blockKey] = { ...existing, [subKey]: value };
      return next;
    });
  }

  // Per-block change detection against the last-saved baseline (JSON compare —
  // block values are small plain data). Drives both `dirty` and the itemized
  // pending list.
  const changes: SkinBlockChange[] = [];
  for (const descriptor of descriptors) {
    const currentJson = JSON.stringify(draft[descriptor.blockKey] ?? null);
    const baselineJson = JSON.stringify(baseline[descriptor.blockKey] ?? null);
    if (currentJson !== baselineJson) {
      changes.push({ blockKey: descriptor.blockKey, titleKey: descriptor.titleKey });
    }
  }
  const dirty = changes.length > 0;

  function buildSkinBlocks(): Partial<SkinData> {
    const built: SkinBlocksDraft = {};
    for (const [blockKey, value] of Object.entries(clone(draft))) {
      const normalized = normalizeBlockValue(value);
      // Drop a list block that normalized down to nothing, so an emptied list
      // doesn't persist as `[]`.
      if (Array.isArray(normalized) && normalized.length === 0) continue;
      built[blockKey] = normalized;
    }
    return built;
  }

  function markSaved(): void {
    setBaseline(clone(draft));
  }

  function reset(): void {
    setDraft(clone(baseline));
  }

  return {
    descriptors,
    hasBlocks: descriptors.length > 0,
    getValue,
    setValue,
    dirty,
    changes,
    buildSkinBlocks,
    markSaved,
    reset,
  };
}
