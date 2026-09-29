import { DEMO_STAGES } from "../data/desk.data";
import { PiecesPipeline } from "./PiecesPipeline";
import { PiecesBoard } from "./PiecesBoard";
import { IssuePlan } from "./IssuePlan";
import { PiecesCalendar } from "./PiecesCalendar";
import { DeskRail } from "./rail/DeskRail";
import { DeskEmptyState } from "./DeskStates";
import { DeskNoMatchState } from "./DeskNoMatchState";
import { toggleListValue } from "./deskWorkbar.data";
import { PieceDueDateContext, usePieceDueDateEditor } from "./pieceDueDate";
import type { EditorDesk } from "./useEditorDesk";
import { useDeskShowAtRisk } from "./useDeskShowAtRisk";
import { DeskShownCountStatus } from "./DeskShownCountStatus";
import styles from "./DeskView.module.css";

/** The active layout: the grouped table, the board, the issue plan or the
 *  calendar. */
function DeskLayoutBody({ desk }: { desk: EditorDesk }) {
  const { deskState, tracks, peek, nextAction, pieceSelection } = desk;
  const { assignment, pieceActions, modals } = desk;

  if (desk.layout === "board") {
    return (
      <PiecesBoard
        pieces={deskState.visiblePieces}
        stages={DEMO_STAGES}
        onOpen={peek.openPiece}
        onMove={pieceActions.movePiece}
        me={desk.activeMe}
        track={tracks.track}
        onNextAction={nextAction.runNextAction}
      />
    );
  }
  if (desk.layout === "plan") {
    return (
      <IssuePlan
        pieces={deskState.visiblePieces}
        sections={desk.sections}
        slotPieces={tracks.issuePieces}
        isFiltered={desk.isFiltered}
        scopePieceCount={tracks.activePieces.length}
        onOpen={peek.openPiece}
        onCommission={modals.openCommissionForSection}
        track={tracks.track}
      />
    );
  }
  if (desk.layout === "calendar") {
    return (
      <PiecesCalendar
        pieces={deskState.visiblePieces}
        today={desk.calendar.today}
        closesOn={desk.calendar.closesOn}
        publishesOn={desk.calendar.publishesOn}
        me={desk.activeMe}
        editors={desk.editors}
        track={tracks.track}
        onOpen={peek.openPiece}
        onNextAction={nextAction.runNextAction}
      />
    );
  }
  return (
    <PiecesPipeline
      pieces={deskState.visiblePieces}
      focusId={deskState.focusId}
      track={tracks.track}
      hasAnyIssue={desk.issues.length > 0}
      selectedPieceIds={pieceSelection.selectedPieceIds}
      areAllSelected={pieceSelection.areAllSelected}
      onToggleSelect={assignment.togglePieceSelect}
      onToggleSelectAll={assignment.toggleAllPieceSelect}
      onOpen={peek.openPiece}
      onEdit={pieceActions.editPiece}
      onChase={modals.openChase}
      onHandoff={modals.openHandoff}
      onAssignIssue={assignment.openForPiece}
      onDelete={modals.openDeletePiece}
      me={desk.activeMe}
      groupBy={deskState.groupBy}
      density={deskState.density}
      onNextAction={nextAction.runNextAction}
      openPieceId={peek.peekPiece?.id ?? null}
      isFiltered={desk.isFiltered}
      collapsedGroups={desk.collapsedGroups}
      viewersByPiece={desk.presence.viewersByPiece}
    />
  );
}

/**
 * The desk's fourth band: the active layout on the left and the rail on the
 * right, both starting at the top of the grid. At or below `--desk-split`
 * the grid is one column and the rail stacks under the table. A scope with
 * no pieces at all shows the empty state in the table's place (the plan
 * keeps its commission slots, so it draws itself); a scope whose pieces are
 * all hidden by search, filters or focus chips shows the no-match state,
 * with one button that clears them. A polite status line says how many
 * pieces show once search, chips or filters have settled the list.
 */
export function DeskWorkArea({ desk }: { desk: EditorDesk }) {
  const { deskState, tracks, triageState, focus } = desk;
  const { tableRef, showAtRisk } = useDeskShowAtRisk(desk);
  const dueDateEditor = usePieceDueDateEditor(
    desk.pieceMutations.updatePiece.mutateAsync,
  );
  const isScopeEmpty =
    !desk.hasDeskLoadError &&
    tracks.activePieces.length === 0 &&
    desk.layout !== "plan";
  const hasNoMatch =
    tracks.activePieces.length > 0 &&
    deskState.visiblePieces.length === 0 &&
    desk.layout !== "plan";

  // Everything that narrows the scope goes at once, then focus returns to
  // the search field, since the button that had it unmounts with the state.
  const clearSearchAndFilters = () => {
    deskState.setQ("");
    deskState.setFmt("all");
    deskState.setSectionFilter([]);
    deskState.setStageFilter([]);
    deskState.setEditorFilter(null);
    focus.clearFocus();
    desk.searchInputRef.current?.focus();
  };

  return (
    <div className={styles.grid}>
      <div ref={tableRef} className={styles.workMain}>
        {isScopeEmpty ? (
          <DeskEmptyState
            track={tracks.track}
            issueNumber={desk.issue.number}
            onWrite={desk.writeAction.startWriting}
            onCommission={desk.modals.openCommission}
          />
        ) : hasNoMatch ? (
          <DeskNoMatchState
            query={deskState.q}
            hasFilters={
              deskState.fmt !== "all" ||
              deskState.sectionFilter.length > 0 ||
              deskState.stageFilter.length > 0 ||
              deskState.editorFilter !== null ||
              focus.activeFocusIds.length > 0
            }
            scopePieceCount={tracks.activePieces.length}
            onClearAll={clearSearchAndFilters}
          />
        ) : (
          <PieceDueDateContext.Provider value={dueDateEditor}>
            <DeskLayoutBody desk={desk} />
          </PieceDueDateContext.Provider>
        )}
      </div>
      <DeskShownCountStatus count={deskState.visiblePieces.length} />
      <DeskRail
        track={tracks.track}
        hasCurrentIssue={tracks.hasCurrentIssue}
        pieces={tracks.activePieces}
        sections={desk.sections}
        summary={desk.summary}
        editors={desk.editors}
        me={desk.activeMe}
        pitches={desk.pitches}
        onOpenTriage={() => triageState.open()}
        onOpenPitch={(pitch) => triageState.open(pitch.id)}
        editorFilter={deskState.editorFilter}
        onEditorFilter={deskState.setEditorFilter}
        stageFilter={deskState.stageFilter}
        onStageFilter={(stage) =>
          deskState.setStageFilter(
            toggleListValue(deskState.stageFilter, stage),
          )
        }
        sectionFilter={deskState.sectionFilter}
        onSectionFilter={(sectionName) =>
          deskState.setSectionFilter(
            toggleListValue(deskState.sectionFilter, sectionName),
          )
        }
        closesOn={desk.calendar.closesOn}
        today={desk.calendar.today}
        onOpenPiece={desk.peek.openPiece}
        onShowAtRisk={showAtRisk}
        isNewVoicesFiltered={focus.activeFocusIds.includes("new-voices")}
        onNewVoicesFilter={() => focus.toggleFocus("new-voices")}
      />
    </div>
  );
}
