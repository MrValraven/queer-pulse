import { createContext, useContext } from "react";
import type { EditorPaneKey } from "./editorRail.data";

/**
 * Rail navigation, exposed to anything rendered INSIDE a pane. `activePane`
 * lives in `SubprofileEditorShell` (above the editor provider, so it resets per
 * persona), and the panes themselves sit two levels down under
 * `EditorPaneRouter` — this is the one seam between them, so the publish
 * checklist can send an owner to the field a requirement is about without the
 * shell having to prop-drill a setter through every pane.
 *
 * Deliberately separate from `SubprofileEditorContext`: that context owns the
 * persona's UNSAVED EDIT state behind one global save, and mixing "where am I
 * looking" into it would make every consumer of the edit state re-render on
 * each rail click.
 */
export interface SubprofileEditorNavValue {
  activePane: EditorPaneKey;
  /** Opens a pane. Safe to call with the pane already active. */
  goToPane: (pane: EditorPaneKey) => void;
}

export const SubprofileEditorNavContext =
  createContext<SubprofileEditorNavValue | null>(null);

export function useSubprofileEditorNav(): SubprofileEditorNavValue {
  const nav = useContext(SubprofileEditorNavContext);
  if (!nav) {
    throw new Error(
      "useSubprofileEditorNav must be used within a SubprofileEditorShell",
    );
  }
  return nav;
}
