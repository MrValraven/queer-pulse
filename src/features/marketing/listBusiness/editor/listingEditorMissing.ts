import type { MissingField } from "../listBusiness.data";

/**
 * The wizard steps whose required fields the single-screen editor renders.
 *
 * Step 0 is deliberately absent: it holds only the create-time "how do you
 * know this place?" path choice, which an existing listing already carries and
 * the editor never re-asks, so it can never be outstanding here.
 */
const EDITOR_STEPS = [1, 2, 3, 4, 5];

/**
 * Flatten `useListingForm`'s per-step `missing` map into the one list a
 * single-screen editor needs, keeping step order so the chips read top-to-
 * bottom in the order the fields appear on the page.
 */
export function flattenEditorMissing(
  missingByStep: Record<number, MissingField[]>,
): MissingField[] {
  return EDITOR_STEPS.flatMap((step) => missingByStep[step] ?? []);
}

/** How many of the outstanding fields belong to one section, so its jump link
 *  can carry a count instead of the member hunting for what is still red. */
export function countMissingInSection(
  missing: MissingField[],
  anchors: string[],
): number {
  return missing.filter((field) => anchors.includes(field.anchor)).length;
}
