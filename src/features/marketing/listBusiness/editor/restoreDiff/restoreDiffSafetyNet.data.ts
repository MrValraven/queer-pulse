import type { TFunction } from "../../../../../shared/i18n/types";
import {
  DIFF_KEY_PREFIX,
  LIST_SEPARATOR,
  yesNoLabel,
} from "./restoreDiffFields.data";
import type { DiffSegment, RestoreFieldChange } from "./restoreDiff.types";

/**
 * The guarantee behind the review: a field is listed exactly when bringing
 * the saved copy back would change it. The builders aim for a precise,
 * readable entry, and these two helpers catch what they miss (a change no
 * row can put into words, such as spacing), so a change is always named
 * before it is applied, even if only as "Some details differ".
 */

/** A marked run the reader can actually see: added or removed text with
 *  something besides spacing in it. A spacing-only edit highlights nothing
 *  visible, so it falls through to the generic entry. */
function hasVisibleMark(segments: readonly DiffSegment[]): boolean {
  return segments.some(
    (segment) => segment.kind !== "same" && segment.text.trim() !== "",
  );
}

/** True when the entry gives the reader something to look at. */
export function isVisibleFieldChange(field: RestoreFieldChange): boolean {
  switch (field.kind) {
    case "text":
      return hasVisibleMark(field.segments);
    case "paragraphs":
      return field.paragraphs.some((paragraph) =>
        hasVisibleMark(paragraph.segments),
      );
    case "set":
      return field.added.length > 0 || field.removed.length > 0;
    case "choice":
      return field.before !== field.after;
    case "rows":
      return field.rows.length > 0;
  }
}

/** A short readable form of a plain value, or null for anything structured. */
function readableValue(t: TFunction, value: unknown): string | null {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return yesNoLabel(t, value);
  return isStringList(value) ? value.join(LIST_SEPARATOR) : null;
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

/**
 * The generic entry for a field that changed in a way its builder could not
 * show. A plain value shows both sides as they are; anything structured
 * becomes one row saying the details differ.
 */
export function fallbackFieldChange({
  t,
  key,
  labelKey,
  before,
  after,
}: {
  t: TFunction;
  key: string;
  labelKey: string;
  /** The raw value on screen, when the caller has one to show. */
  before?: unknown;
  /** The raw value in the saved copy. */
  after?: unknown;
}): RestoreFieldChange {
  const beforeText = readableValue(t, before);
  const afterText = readableValue(t, after);
  if (beforeText !== null && afterText !== null && beforeText !== afterText) {
    return {
      kind: "choice",
      key,
      labelKey,
      before: beforeText,
      after: afterText,
    };
  }
  return {
    kind: "rows",
    key,
    labelKey,
    rows: [
      {
        key: `${key}.changed`,
        status: "changed",
        label: t(`${DIFF_KEY_PREFIX}.row.otherChange`),
        before: t(`${DIFF_KEY_PREFIX}.value.onScreen`),
        after: t(`${DIFF_KEY_PREFIX}.value.savedCopy`),
      },
    ],
  };
}
