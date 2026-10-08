import { createContext, useContext } from "react";
import type { EditSectionKey } from "./editDetailsSections";

/**
 * What the edit-details modal tells each of its sections: which ones hold
 * edits, which one holds Save, how to put one back, and where to report its
 * element for the scroll spy. Provided by `EditDetailsModal`, read by
 * `EditDetailsSection`, so the section files pass only their `sectionKey`.
 */
export interface EditDetailsSectionsValue {
  /** The modal's own `useId`, the prefix of every heading and field id. */
  editorId: string;
  editedKeys: readonly EditSectionKey[];
  /** The section holding the rule that holds Save, or `null`. */
  needsFixKey: EditSectionKey | null;
  onReset: (key: EditSectionKey) => void;
  registerSection: (key: EditSectionKey, element: HTMLElement | null) => void;
}

export const EditDetailsSectionsContext =
  createContext<EditDetailsSectionsValue | null>(null);

/** The modal's section state, or `null` for a section drawn outside it. */
export function useEditDetailsSections(): EditDetailsSectionsValue | null {
  return useContext(EditDetailsSectionsContext);
}
