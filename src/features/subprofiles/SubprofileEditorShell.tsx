import { useState } from "react";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { EditorPaneKey } from "./editorRail.data";
import { SubprofileEditorProvider } from "./SubprofileEditorProvider";
import { EditorRail } from "./EditorRail";
import { EditorPaneRouter } from "./EditorPaneRouter";
import { EditorSavebar } from "./EditorSavebar";
import { EditorPreview } from "./EditorPreview";

/**
 * The `.ed` grid interior — rail, routed pane + savebar, and docked preview —
 * for ONE persona. Mounted with `key={subprofile.id}` by `SubprofileEditorPage`
 * so it fully re-initializes when the route lands on a different persona.
 *
 * Everything below the rail is wrapped in `SubprofileEditorProvider`, which
 * owns the ONE shared editor state (meta fields + every section/social/
 * affiliation working-list) behind a single global save. The routed panes and
 * the savebar write it; the docked preview reads it — so in-progress edits show
 * live before any save, and one "Save all" in the savebar commits every dirty
 * area at once. `activePane`/`previewOpen` stay here so they reset per persona.
 */
export function SubprofileEditorShell({
  subprofile,
  backTo,
}: {
  subprofile: SubprofileView;
  backTo: string;
}) {
  const [activePane, setActivePane] = useState<EditorPaneKey>("identity");
  const [previewOpen, setPreviewOpen] = useState(true);

  return (
    <div className="ed" data-preview={previewOpen ? "on" : "off"}>
      <SubprofileEditorProvider subprofile={subprofile}>
        <EditorRail
          subprofile={subprofile}
          activePane={activePane}
          backTo={backTo}
          onSelect={setActivePane}
        />

        <div className="ed-main">
          <EditorPaneRouter pane={activePane} subprofile={subprofile} />
          <EditorSavebar
            previewOpen={previewOpen}
            onTogglePreview={() => setPreviewOpen((open) => !open)}
          />
        </div>

        {/* Kept MOUNTED regardless of `previewOpen` so the panel can animate OUT
            (a conditional unmount would pop it away with no exit). While hidden
            it's `inert` — pulled out of the tab order and the a11y tree, and its
            in-flight "Open live" link made unfocusable — so the collapsed column
            is truly gone to keyboard/AT users even though it's still in the DOM.
            The visual collapse itself is driven by `data-preview` in CSS. */}
        <div className="ed-preview" inert={!previewOpen}>
          <EditorPreview subprofile={subprofile} />
        </div>
      </SubprofileEditorProvider>
    </div>
  );
}
