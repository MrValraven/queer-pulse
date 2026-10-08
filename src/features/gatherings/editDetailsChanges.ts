import type { GatheringDetailsDraft } from "./editDetailsDraft";
import {
  EDIT_SECTION_FIELDS,
  EDIT_SECTION_KEYS,
  type EditSectionKey,
} from "./editDetailsSections";
import { OTHER_FORMAT_KEY } from "./gatheringCatalog";
import { sanitizeThemes } from "./gatheringExtras";
import {
  canSaveEditDraft,
  editCapacityProblem,
  editScheduleProblem,
} from "./manageGatheringState";

type DraftField = keyof GatheringDetailsDraft;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/** Whether two draft values hold the same answer: equal primitives, or
 *  arrays and plain objects (themes, content notes, format details, RSVP
 *  questions) with equal entries all the way down. A key missing on one side
 *  reads as `undefined`, so `{ a: undefined }` and `{}` count as the same. */
export function isSameDraftValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => isSameDraftValue(item, right[index]))
    );
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    return [...keys].every((key) => isSameDraftValue(left[key], right[key]));
  }
  return false;
}

function isFieldEdited(
  draft: GatheringDetailsDraft,
  openedDraft: GatheringDetailsDraft,
  field: DraftField,
): boolean {
  return !isSameDraftValue(draft[field], openedDraft[field]);
}

/** A section's fields, widened from the config's literal tuple. */
function sectionFields(key: EditSectionKey): readonly DraftField[] {
  return EDIT_SECTION_FIELDS[key];
}

/** The sections holding at least one field that differs from what the modal
 *  opened on, in the form's order. */
export function editedSectionKeys(
  draft: GatheringDetailsDraft,
  openedDraft: GatheringDetailsDraft,
): EditSectionKey[] {
  return EDIT_SECTION_KEYS.filter((key) =>
    sectionFields(key).some((field) =>
      isFieldEdited(draft, openedDraft, field),
    ),
  );
}

/** Whether the draft's themes are exactly what a family change left of the
 *  opened themes: the opened list with the current family's own questions
 *  dropped (ruling R6), and no theme the host picked or removed by hand. */
function hasOnlyFamilyThemeDrop(
  draft: GatheringDetailsDraft,
  openedDraft: GatheringDetailsDraft,
): boolean {
  return isSameDraftValue(
    draft.themes,
    sanitizeThemes(openedDraft.themes, draft.gatheringFamily),
  );
}

/** The draft with one section's fields put back to what the modal opened on.
 *  Every other section keeps its edits. Undoing "The gathering" also brings
 *  back the themes its family change dropped, since the host never touched
 *  them; themes the host edited by hand stay with "Taking care". */
export function resetSection(
  draft: GatheringDetailsDraft,
  openedDraft: GatheringDetailsDraft,
  key: EditSectionKey,
): GatheringDetailsDraft {
  const restored: Partial<GatheringDetailsDraft> = {};
  for (const field of sectionFields(key)) {
    Object.assign(restored, { [field]: openedDraft[field] });
  }
  if (key === "gathering" && hasOnlyFamilyThemeDrop(draft, openedDraft)) {
    restored.themes = openedDraft.themes;
  }
  return { ...draft, ...restored };
}

/**
 * The draft fields whose change makes the server tell attendees. Checked
 * against `EventsService.update` in the backend: it fans an `EventUpdated`
 * notification out (to live RSVPs and standing invites, published gatherings
 * only) when the START moves or the venue fields move. The end, the title,
 * the description, the cover, the capacity and the audience notify nobody.
 * `buildEditPatch` sends the venue only when the location text changed.
 */
const ATTENDEE_NOTIFYING_FIELDS = [
  "startAt",
  "location",
] as const satisfies readonly DraftField[];

/** Whether saving this draft will notify the people going. */
export function hasAttendeeNotifyingChange(
  draft: GatheringDetailsDraft,
  openedDraft: GatheringDetailsDraft,
): boolean {
  return ATTENDEE_NOTIFYING_FIELDS.some((field) =>
    isFieldEdited(draft, openedDraft, field),
  );
}

/** What holds Save: the section and the field to fix, or no target when the
 *  rule that refused the draft has no field to point at. */
export type EditSaveProblem =
  | { sectionKey: EditSectionKey; field: DraftField }
  | { sectionKey: null; field: null };

/**
 * Why `canSaveEditDraft` refuses this draft, as the place to fix it, or
 * `null` when the draft saves. Mirrors every rule of `canSaveEditDraft`, in
 * its order: the title, the start, the location, the words "Something else"
 * needs, the schedule (whose message hangs off the end field) and the
 * capacity. A refusal none of them explains still reports a problem, with
 * no target, so the footer never says a draft saves when it does not.
 */
export function editSaveProblem(
  draft: GatheringDetailsDraft,
  openedWithCapacity: string,
): EditSaveProblem | null {
  if (canSaveEditDraft(draft, openedWithCapacity)) return null;
  if (draft.title.trim().length === 0) {
    return { sectionKey: "gathering", field: "title" };
  }
  if (draft.startAt.trim().length === 0) {
    return { sectionKey: "whenWhere", field: "startAt" };
  }
  if (draft.location.trim().length === 0) {
    return { sectionKey: "whenWhere", field: "location" };
  }
  if (draft.format === OTHER_FORMAT_KEY && draft.otherText.trim() === "") {
    return { sectionKey: "gathering", field: "otherText" };
  }
  if (editScheduleProblem(draft) !== null) {
    return { sectionKey: "whenWhere", field: "endAt" };
  }
  if (editCapacityProblem(draft, openedWithCapacity) !== null) {
    return { sectionKey: "audience", field: "capacity" };
  }
  return { sectionKey: null, field: null };
}

/** The DOM id a field's wrapper carries in the edit-details modal, so the
 *  footer's "Show the field" can scroll to it and focus its control.
 *  `editorId` is the modal's own `useId`, so two editors never share ids. */
export function editFieldDomId(editorId: string, field: DraftField): string {
  return `${editorId}-field-${field}`;
}

/** The DOM id of a section's heading, the focus target of the rail. */
export function editSectionHeadingId(
  editorId: string,
  key: EditSectionKey,
): string {
  return `${editorId}-section-${key}`;
}
