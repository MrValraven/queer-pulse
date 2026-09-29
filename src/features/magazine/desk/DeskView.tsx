import { DEMO_STAGES } from "../data/desk.data";
import { DeskFocusBar } from "./DeskFocusBar";
import { DeskWorkbar } from "./DeskWorkbar";
import { DeskViewsMenu } from "./DeskViewsMenu";
import { DeskHeaderBand } from "./DeskHeaderBand";
import { DeskWorkArea } from "./DeskWorkArea";
import { DeskSkeleton, DeskErrorBand } from "./DeskStates";
import type { EditorDesk } from "./useEditorDesk";
import styles from "./DeskView.module.css";

export interface DeskViewProps {
  desk: EditorDesk;
}

/**
 * The magazine desk's visible page, four bands top to bottom: the header
 * (scope, issue pulse, New menu), the focus chips, the workbar (search,
 * layout, Filter, Sort, shortcuts), and the work area (the table beside the
 * rail). The overlays (peek panel, pitch triage, bulk bar, dialogs) mount
 * beside this in `EditorDashboardView`, outside every layout box. All state
 * lives in `useEditorDesk`; this only renders it.
 */
export function DeskView({ desk }: DeskViewProps) {
  if (desk.isLoading) {
    return (
      <div className={styles.page}>
        <DeskSkeleton />
      </div>
    );
  }

  const { deskState, focus } = desk;
  return (
    <div className={styles.page}>
      <DeskHeaderBand desk={desk} />
      {desk.hasDeskLoadError && <DeskErrorBand onRetry={desk.retry} />}
      <div className={styles.band}>
        <DeskFocusBar
          pieces={desk.tracks.activePieces}
          me={desk.activeMe}
          activeFocusIds={focus.activeFocusIds}
          onToggleFocus={focus.toggleFocus}
          onClearFocus={focus.clearFocus}
          pitchCount={desk.pitches.length}
          onOpenPitches={() => desk.triageState.open()}
          closesOn={desk.calendar.closesOn}
        />
      </div>
      <div className={styles.band}>
        <DeskWorkbar
          query={deskState.q}
          onQuery={deskState.setQ}
          layout={desk.layout}
          onLayout={desk.setLayout}
          isCalendarAvailable
          onShortcuts={desk.modals.openShortcuts}
          searchInputRef={desk.searchInputRef}
          format={deskState.fmt}
          onFormat={deskState.setFmt}
          sections={desk.sections.map((section) => section.name)}
          sectionFilter={deskState.sectionFilter}
          onSectionFilter={deskState.setSectionFilter}
          stages={DEMO_STAGES}
          stageFilter={deskState.stageFilter}
          onStageFilter={deskState.setStageFilter}
          editors={desk.editors}
          editorFilter={deskState.editorFilter}
          onEditorFilter={deskState.setEditorFilter}
          isEditorDirectoryLoading={desk.isEditorDirectoryLoading}
          sort={deskState.sort}
          onSort={deskState.setSort}
          groupBy={deskState.groupBy}
          onGroupBy={deskState.setGroupBy}
          density={deskState.density}
          onDensity={deskState.setDensity}
          viewsMenu={<DeskViewsMenu {...desk.viewsMenu} />}
        />
      </div>
      <DeskWorkArea desk={desk} />
    </div>
  );
}
