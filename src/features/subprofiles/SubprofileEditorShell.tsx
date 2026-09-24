import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useLocalStorage, useMediaQuery } from "../../shared/hooks";
import { mediaMax, mediaMin } from "../../shared/theme/breakpoints";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  buildEditorRailGroups,
  sectionsInPageBlocks,
  type EditorPaneKey,
} from "./editorRail.data";
import { SubprofileEditorProvider } from "./SubprofileEditorProvider";
import { EditorRail } from "./EditorRail";
import { EditorPaneSwitcher } from "./EditorPaneSwitcher";
import { EditorPaneRouter } from "./EditorPaneRouter";
import { EditorFieldDeepLink } from "./EditorFieldDeepLink";
import { EditorSavebar } from "./EditorSavebar";
import { EditorPreview } from "./EditorPreview";
import type { PreviewDevice } from "./usePreviewFit";
import { SubprofileEditorNavContext } from "./subprofileEditorNav";
import { useEditorPane } from "./useEditorPane";
// The global `.ed*` editor-shell styles. Imported here (a lazy editor-only
// surface) rather than globally so they ride the editor route chunk, not the
// app-wide bundle. The editor's docked preview renders `.pp*` too, but that
// skin CSS comes in via EditorPreview → SubprofilePageBody's own import.
import "./persona-editor.css";

/**
 * Below this the rail is gone and `EditorPaneSwitcher` navigates instead. It
 * must be the same 760px cut the CSS hides the rail at, which is why that one
 * CSS block is a `@media` rule while the editor's other breakpoints are
 * `@container` queries against `.ed-shell` — see the note in
 * `persona-editor.css`.
 */
const RAIL_HIDDEN_QUERY = mediaMax("lg");

/** At or above this the Desktop dock fits beside the rail and pane. Must match
 *  the `@media (min-width: 1180px)` Desktop dock rule in `persona-editor.css`. */
const DESKTOP_PREVIEW_QUERY = mediaMin(1180);

/** Whether the rail is folded to its icon strip. Persisted per device, the same
 *  way `AdminShell` keeps its rail: an owner who traded rail width for pane
 *  width wants it that way on every persona they open. */
const RAIL_COLLAPSED_KEY = "qp.personaEditorRail.collapsed";

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

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
 * area at once.
 *
 * The active pane lives in the URL (`useEditorPane`), so the phone's Back
 * gesture steps back a pane instead of leaving the editor, and a pane survives
 * a refresh. `previewOpen` stays local state: it is a viewing preference, not
 * somewhere the owner navigated to. `previewDevice` (the dock's Mobile /
 * Desktop width) is the same kind of viewing preference. The rail groups are
 * built ONCE here and handed to both the rail and the mobile switcher, so the
 * two navigations cannot drift apart.
 *
 * That pane state is also published on `SubprofileEditorNavContext`, the one
 * seam that lets something rendered INSIDE a pane move the editor to another
 * one — the publish checklist's unmet rows jumping to the field they are about
 * (`useEditorFieldJump`). Kept separate from `SubprofileEditorProvider` on
 * purpose: that context owns the unsaved-edit state, and folding "where am I
 * looking" into it would re-render every consumer of the edit state on each
 * pane change.
 */
export function SubprofileEditorShell({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const [previewOpen, setPreviewOpen] = useState(true);
  // `null` until the owner picks one on the switch.
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice | null>(
    null,
  );
  const [isRailCollapsed, setIsRailCollapsed] = useLocalStorage<boolean>(
    RAIL_COLLAPSED_KEY,
    false,
    isBoolean,
  );
  const isRailHidden = useMediaQuery(RAIL_HIDDEN_QUERY);
  const canPreviewDesktop = useMediaQuery(DESKTOP_PREVIEW_QUERY);
  // Until the owner picks, the dock previews the device they are on: Desktop
  // on a wide screen, Mobile below the Desktop cut. Below the cut the switch is
  // hidden and the dock shows Mobile; a picked device is kept, so widening the
  // window brings it back.
  const effectiveDevice = canPreviewDesktop
    ? (previewDevice ?? "desktop")
    : "mobile";

  const groups = useMemo(() => buildEditorRailGroups(subprofile), [subprofile]);
  // Flattened rail order — what `?pane=` is validated against, and the order
  // the switcher's back/forward arrows walk.
  const paneKeys = useMemo(
    () =>
      groups.flatMap((group): EditorPaneKey[] =>
        group.entries.map((entry) => entry.key),
      ),
    [groups],
  );
  const sectionsInBlocks = useMemo(
    () => sectionsInPageBlocks(subprofile.kind),
    [subprofile.kind],
  );
  const pane = useEditorPane(paneKeys, sectionsInBlocks);
  // Memoized: a fresh object every render would re-render every nav consumer
  // on each keystroke in the editor, and remount nothing usefully.
  const navValue = useMemo(
    () => ({ activePane: pane.activePane, goToPane: pane.selectPane }),
    [pane.activePane, pane.selectPane],
  );

  // An older link to a section that now lives in Page blocks: swap the URL
  // before the editor mounts, so `EditorFieldDeepLink` reads the new `?field=`.
  if (pane.movedPaneSearch) {
    return <Navigate replace to={{ search: pane.movedPaneSearch }} />;
  }

  return (
    <SubprofileEditorNavContext.Provider value={navValue}>
      <SubprofileEditorProvider subprofile={subprofile}>
        {isRailHidden && <EditorPaneSwitcher groups={groups} pane={pane} />}

        <div
          className="ed"
          data-preview={previewOpen ? "on" : "off"}
          data-preview-device={effectiveDevice}
          data-rail={isRailCollapsed ? "collapsed" : "expanded"}
        >
          <EditorRail
            groups={groups}
            activePane={pane.activePane}
            isCollapsed={isRailCollapsed}
            onSelect={pane.selectPane}
            onToggleCollapse={() =>
              setIsRailCollapsed((isCollapsed) => !isCollapsed)
            }
          />

          <div className="ed-main">
            <EditorFieldDeepLink />
            <EditorPaneRouter pane={pane.activePane} subprofile={subprofile} />
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
            <EditorPreview
              subprofile={subprofile}
              device={effectiveDevice}
              canPreviewDesktop={canPreviewDesktop}
              onDeviceChange={setPreviewDevice}
            />
          </div>
        </div>
      </SubprofileEditorProvider>
    </SubprofileEditorNavContext.Provider>
  );
}
