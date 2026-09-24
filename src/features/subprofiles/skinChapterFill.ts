import type {
  SkinBlockControl,
  SkinChapterDescriptor,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";

/**
 * Pure reads behind the chaptered skin editor: which controls are showing
 * (`showWhen`), and how much of a chapter is filled in (the map's "3 to fill").
 * No React here, so the strip, the cards and any test can share one answer.
 */

type ValueReader = Pick<SubprofileSkinBlocksEditor, "getValue">;

export interface ChapterFill {
  filled: number;
  total: number;
}

/** The control stored at `path`, searched across every chapter. */
function findControl(
  path: string,
  chapters: SkinChapterDescriptor[],
): SkinBlockControl | undefined {
  for (const chapter of chapters) {
    for (const group of chapter.groups) {
      const match = group.controls.find((control) => control.path === path);
      if (match) return match;
    }
  }
  return undefined;
}

/** What a watched control currently holds: its stored string, else its own
 *  `defaultValue` (what the public page assumes), else "". */
function watchedValue(
  path: string,
  editor: ValueReader,
  chapters: SkinChapterDescriptor[],
): string {
  const stored = editor.getValue(path);
  if (typeof stored === "string") return stored;
  return findControl(path, chapters)?.defaultValue ?? "";
}

/** Whether a control shows right now: every `showWhen` condition holds. A
 *  control without `showWhen` always shows; hidden values stay stored. */
export function isControlVisible(
  control: SkinBlockControl,
  editor: ValueReader,
  chapters: SkinChapterDescriptor[],
): boolean {
  if (!control.showWhen) return true;
  const conditions = Array.isArray(control.showWhen)
    ? control.showWhen
    : [control.showWhen];
  return conditions.every((condition) =>
    condition.values.includes(watchedValue(condition.path, editor, chapters)),
  );
}

function isNonBlankString(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}

/** A list entry counts when it is a non-blank string, or an object with at
 *  least one non-blank string field. */
function isFilledEntry(entry: unknown): boolean {
  if (typeof entry === "string") return isNonBlankString(entry);
  if (entry && typeof entry === "object") {
    return Object.values(entry as Record<string, unknown>).some(
      isNonBlankString,
    );
  }
  return false;
}

function isFilledValue(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.some(isFilledEntry);
  return isNonBlankString(value);
}

/** Whether a control holds something the page would show. A choice control
 *  reads its stored value, else its `defaultValue` (what the page renders);
 *  an empty choice ("Not said") counts as unfilled. A control whose older
 *  free-text answer (`legacyTextPath`) is still set counts as filled, since
 *  the page shows that text. */
export function isControlFilled(
  control: SkinBlockControl,
  editor: ValueReader,
): boolean {
  if (
    control.legacyTextPath &&
    isNonBlankString(editor.getValue(control.legacyTextPath))
  ) {
    return true;
  }
  const stored = editor.getValue(control.path);
  const isChoice = control.kind === "segmented" || control.kind === "select";
  if (isChoice && (stored === undefined || stored === null)) {
    return isNonBlankString(control.defaultValue);
  }
  return isFilledValue(stored);
}

/** Filled and total counts over a chapter's visible controls. */
export function chapterFill(
  chapter: SkinChapterDescriptor,
  editor: ValueReader,
  chapters: SkinChapterDescriptor[],
): ChapterFill {
  let filled = 0;
  let total = 0;
  for (const group of chapter.groups) {
    for (const control of group.controls) {
      if (!isControlVisible(control, editor, chapters)) continue;
      total += 1;
      if (isControlFilled(control, editor)) filled += 1;
    }
  }
  return { filled, total };
}

/** A stored value read as a number, or null when blank or not numeric. */
export function numericValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}
