import type { TFunction } from "../../../../../shared/i18n/types";
import { DIFF_KEY_PREFIX } from "./restoreDiffFields.data";
import type { RestoreRowChange } from "./restoreDiff.types";

/**
 * The small pieces every row builder shares: how a row gets its status, how
 * a row's parts join into one readable line, and what an unnamed row is
 * called.
 */

/** Parts of one row's summary ("Haircut · 25 EUR · 45 minutes"). The same
 *  middle dot the read-only hours display already joins with. */
export const SUMMARY_SEPARATOR = " · ";

/** A row whose status follows from which side is missing: no "before" means
 *  the saved copy adds it, no "after" means the saved copy drops it. */
export function changedRow(
  key: string,
  label: string,
  before: string | null,
  after: string | null,
): RestoreRowChange {
  const status =
    before === null ? "added" : after === null ? "removed" : "changed";
  return { key, status, label, before, after };
}

/** Display only: trimmed, empty parts dropped. Whether a row changed is
 *  always decided on the raw fields, so a change this hides still shows. */
export function summaryOf(parts: readonly string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(SUMMARY_SEPARATOR);
}

export function untitled(t: TFunction, name: string): string {
  return name.trim() || t(`${DIFF_KEY_PREFIX}.row.untitled`);
}

/** Position-matched pairs of two lists, for rows with no identity beyond
 *  their client ids (regenerated on every load). `position` is 1-based. */
export function pairsByPosition<Entry>(
  before: readonly Entry[],
  after: readonly Entry[],
): Array<{ position: number; before?: Entry; after?: Entry }> {
  const count = Math.max(before.length, after.length);
  return Array.from({ length: count }, (_unused, index) => ({
    position: index + 1,
    before: before[index],
    after: after[index],
  }));
}
