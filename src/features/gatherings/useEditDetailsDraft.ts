import { useState } from "react";
import { resetSection } from "./editDetailsChanges";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import type { EditSectionKey } from "./editDetailsSections";
import { sanitizeThemes } from "./gatheringExtras";

/**
 * The edit-details modal's draft: the one the host is editing, the baseline it
 * opened on, and the ways a section writes into it.
 *
 * Its own hook so `EditDetailsModal` stays inside the 200-line rule.
 */
export function useEditDetailsDraft(initial: GatheringDetailsDraft) {
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial);
  // The baseline the modal opened on, frozen for its whole life. Parents
  // rebuild `initial` on every render, and one re-seeded while the modal is
  // open would otherwise light Save with no edit made.
  const [openedDraft] = useState<GatheringDetailsDraft>(initial);

  const setField = <FieldName extends keyof GatheringDetailsDraft>(
    key: FieldName,
    value: GatheringDetailsDraft[FieldName],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const merge = (patch: Partial<GatheringDetailsDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  // Family, format, the host's own words and the family's own questions move
  // together when the family changes. A new family also drops the themes its
  // own questions already ask (ruling R6), the rule the wizard applies.
  const mergeFormat = (patch: Partial<GatheringDetailsDraft>) =>
    setDraft((current) => {
      const next = { ...current, ...patch };
      return patch.gatheringFamily === undefined
        ? next
        : {
            ...next,
            themes: sanitizeThemes(next.themes, next.gatheringFamily),
          };
    });
  // Puts one section's fields back to the baseline. Undoing "The gathering"
  // also restores the themes its family change dropped (`resetSection`), so
  // "Taking care" stops reading Edited for a change the host never made.
  const resetSectionKey = (key: EditSectionKey) =>
    setDraft((current) => resetSection(current, openedDraft, key));

  return { draft, openedDraft, setField, merge, mergeFormat, resetSectionKey };
}
