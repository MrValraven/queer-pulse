import { useMemo, useState } from "react";
import { safeHref } from "../../../shared/lib/safeHref";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { itemDrawerSaveState } from "../itemDrawerSave";

/** A ticket link that was typed but cannot be opened: any non-empty value
 *  without an http(s) or mailto scheme. An empty field is fine, since the
 *  link is optional. */
export function isGigTicketLinkInvalid(ticketUrl: string | null): boolean {
  const typed = ticketUrl?.trim() ?? "";
  return typed !== "" && safeHref(typed) === null;
}

/** The first thing stopping Save, as a status key, else null. Order: title,
 *  date, ticket link. The date check reads the raw stored text (`draft.date`).
 *  The picker shows empty for "Sep 2025" or free text (`toGigDayValue` returns
 *  ""), yet that stored text counts as a date until a new one is picked, so an
 *  old gig opens ready to save. */
export function gigMissingRequiredKey(
  draft: SubprofileItemView,
): string | null {
  if (!draft.title.trim()) return "subprofiles:itemDrawer.status.needsTitle";
  if (!draft.date.trim()) return "subprofiles:gigEditor.status.needsDate";
  if (isGigTicketLinkInvalid(draft.ticketUrl)) {
    return "subprofiles:gigEditor.status.badTicketLink";
  }
  return null;
}

/**
 * The gig drawer's local draft: a copy of the row that edits never reach the
 * section until Save. Returns the draft, a merging `patch`, whether anything
 * changed, the save blocker (a status key) and a guarded `save`.
 *
 * `draft` starts as a copy of `item` and is only ever spread over, so key
 * order is stable and a serialized compare is an honest "has anything been
 * typed yet".
 */
export function useGigDrawerDraft({
  item,
  isNew,
  onSave,
}: {
  item: SubprofileItemView;
  isNew: boolean;
  onSave: (item: SubprofileItemView) => void;
}) {
  const [draft, setDraft] = useState(item);

  const isDraftDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(item),
    [draft, item],
  );
  const missingRequiredKey = gigMissingRequiredKey(draft);
  const canSave =
    itemDrawerSaveState({
      isNew,
      isDirty: isDraftDirty,
      isMissingRequired: missingRequiredKey !== null,
    }) === "dirty";

  function patch(changes: Partial<SubprofileItemView>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function save() {
    if (canSave) onSave(draft);
  }

  return { draft, patch, isDraftDirty, missingRequiredKey, canSave, save };
}
