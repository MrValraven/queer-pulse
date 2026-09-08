import {
  diffStringLists,
  isSameStringList,
  isStringList,
  type StringListDiff,
} from "../../shared/lib/stringListDiff";
import type { UpdateCommunityDto } from "./api/communities.api";

/* ===========================================================
   What one save from the edit modal is about to change.

   `EditCommunityModal` already compares the DTO it would send
   against the DTO the form opened with, purely to decide whether
   the Save button is enabled. That comparison knows exactly what
   moved and throws it away. This names it instead, off the same
   two objects, so the summary an owner reads can never describe a
   different save than the one the button performs.
   =========================================================== */

/** One field the save will write, and how it moved. */
export interface CommunityFieldChange {
  /** The DTO field name, e.g. `rules`. Resolved to a label by the caller. */
  field: string;
  /**
   * Present only for the string-list fields (`rules`, `tags`, `features`),
   * naming what entered and what left. Absent for everything else, where the
   * field having changed at all is the whole story the summary tells: the live
   * card preview beside the form is already showing the new name, tagline,
   * cover and kind as they are typed.
   */
  listDiff?: StringListDiff;
}

/**
 * Whether two DTO values are the same. Lists compare by contents and order,
 * matching both `isUnchanged`'s JSON comparison in the modal and the backend's
 * own `diffSettings`, so all three agree on what counts as an edit.
 */
function isSameValue(from: unknown, to: unknown): boolean {
  if (isStringList(from) && isStringList(to)) return isSameStringList(from, to);
  return from === to;
}

/**
 * The fields this save will write, in the order the summary reads them out.
 *
 * Keys come from the outgoing DTO first, then any the outgoing DTO dropped, so
 * a field cleared to `undefined` is still reported rather than silently
 * vanishing from the summary while still being part of the request.
 */
export function diffCommunityUpdates(
  from: UpdateCommunityDto,
  to: UpdateCommunityDto,
): CommunityFieldChange[] {
  const fields = [
    ...Object.keys(to),
    ...Object.keys(from).filter((field) => !(field in to)),
  ];

  const changes: CommunityFieldChange[] = [];
  for (const field of fields) {
    const before = (from as Record<string, unknown>)[field];
    const after = (to as Record<string, unknown>)[field];
    if (isSameValue(before, after)) continue;

    changes.push(
      isStringList(before) && isStringList(after)
        ? { field, listDiff: diffStringLists(before, after) }
        : { field },
    );
  }
  return changes;
}

/**
 * Whether this save moves the community's shared values, which is the one
 * change with a consequence outside the form: the backend bumps `rulesVersion`
 * whenever `rules` moves, and every member on the roster is then asked to
 * agree to the values again before they can post. An owner adding a single
 * value should know that before they press Save, not after their whole
 * community gets the notice.
 */
export function hasSharedValueChange(
  changes: readonly CommunityFieldChange[],
): boolean {
  return changes.some((change) => change.field === "rules");
}
