import { useState } from "react";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { EditorPaneKey } from "./editorRail.data";
import { useSubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { EditorRail } from "./EditorRail";
import { EditorPaneRouter } from "./EditorPaneRouter";
import { EditorSavebar } from "./EditorSavebar";
import { EditorPreview } from "./EditorPreview";

/**
 * The `.ed` grid interior — rail, routed pane + savebar, and docked preview —
 * for ONE persona. Mounted with `key={subprofile.id}` by `SubprofileEditorPage`
 * so it fully re-initializes when the route lands on a different persona
 * (mirrors the old `key`-on-`EditorPaneRouter` remount this replaced).
 *
 * Why this exists as its own component: it owns the ONE
 * `useSubprofileMetaEditor(subprofile)` instance and hands the SAME `editor`
 * to both `EditorPaneRouter` (the identity/presence/address form panes that
 * write it) and `EditorPreview` (which reads it). That shared instance is what
 * lets the docked preview reflect in-progress edits live, before any save —
 * previously the preview only saw the react-query cache value, so it changed
 * nothing until a pane was saved. `activePane`/`previewOpen` live here too, so
 * they reset per persona alongside the editor state.
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
  const editor = useSubprofileMetaEditor(subprofile);

  return (
    <div className="ed" data-preview={previewOpen ? "on" : "off"}>
      <EditorRail
        subprofile={subprofile}
        activePane={activePane}
        backTo={backTo}
        onSelect={setActivePane}
      />

      <div className="ed-main">
        <EditorPaneRouter pane={activePane} subprofile={subprofile} editor={editor} />
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
        <EditorPreview subprofile={subprofile} editor={editor} />
      </div>
    </div>
  );
}
