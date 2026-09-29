/**
 * Everything the editor desk page renders from, in one object: the data
 * layer (`useEditorDeskData`) plus the actions, the table's grouping and
 * folds, the calendar's dates, the peek panel, presence, saved views, pitch
 * triage, the bulk bar's handlers and the keyboard layer.
 * `EditorDashboardPage` calls this once; `DeskView` and the overlays in
 * `EditorDashboardView` read from the result.
 */

import { useRef, useState } from "react";
import { useCreateIssue } from "../api/useDeskIssues";
import { useDeskPresence } from "../api/useDeskPresence";
import { useDeskPieceSelection } from "./useDeskPieceSelection";
import { useDeskAssignment } from "./useDeskAssignment";
import { useDeskPieceActions } from "./useDeskPieceActions";
import { useDeskWriteAction } from "./useDeskWriteAction";
import { useDeskBuildDeckAction } from "./useDeskBuildDeckAction";
import { useDeskEntryParams } from "./useDeskEntryParams";
import { useDeskModals } from "./useDeskModals";
import { usePitchTriageActions } from "./usePitchTriageActions";
import { usePitchTriageState } from "./usePitchTriageState";
import { useDeskBulkActions } from "./useDeskBulkActions";
import { useDeskPieceOrder } from "./useDeskPieceOrder";
import { useDeskPeek } from "./useDeskPeek";
import { useDeskNextAction } from "./useDeskNextAction";
import { useDeskShortcuts } from "./useDeskShortcuts";
import { useEditorDeskData } from "./useEditorDeskData";
import { useDeskCalendarProps } from "./useDeskCalendarProps";
import { useDeskViewsWiring } from "./useDeskViewsWiring";
import type { DeskLayoutOption } from "./DeskWorkbar";

export function useEditorDesk() {
  const data = useEditorDeskData();
  const { deskState, tracks, issue, activeMe, pieceMutations } = data;
  const { showToast, translate, sections, editors, pitches } = data;
  const { visiblePieces } = deskState;

  const pieceSelection = useDeskPieceSelection(visiblePieces);
  const [layout, setLayout] = useState<DeskLayoutOption>("list");
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const createIssue = useCreateIssue();
  const assignment = useDeskAssignment({
    pieceMutations,
    pieceSelection,
    assignPieceToIssue: tracks.assignPieceToIssue,
    pitchSelection: deskState,
    showToast,
    translate,
  });
  // Clears any pitch bulk selection left over from this opening, so a pitch
  // answered in one pass cannot ride along into a later one.
  const triageState = usePitchTriageState(deskState.clearSelected);
  const modals = useDeskModals({
    activeMe,
    currentIssueId: issue.id,
    pieceMutations,
    pitchMutations: data.pitchMutations,
    onPitchAnswered: triageState.recordAnswered,
  });
  const triage = usePitchTriageActions({
    pitchMutations: data.pitchMutations,
    selectedPitchIds: deskState.selected,
    clearSelectedPitchIds: deskState.clearSelected,
  });
  const pieceActions = useDeskPieceActions({
    issue,
    pieceMutations,
    showToast,
    translate,
  });
  const creationParams = {
    activeMe,
    editors,
    sections,
    areSectionsLoading: data.areSectionsLoading,
    hasSectionsError: data.hasSectionsError,
    issue,
    track: tracks.track,
    showToast,
    translate,
  };
  // Write lands in the article editor, Build a deck in the deck editor; both
  // create the piece with this editor as its own writer (no brief goes out).
  const writeAction = useDeskWriteAction({ ...creationParams, pieceMutations });
  const buildDeckAction = useDeskBuildDeckAction(creationParams);
  const bulkActions = useDeskBulkActions({
    moveStage: pieceMutations.moveStage,
    openHandoff: modals.openHandoff,
  });

  useDeskEntryParams({
    searchParams: data.searchParams,
    setSearchParams: data.setSearchParams,
    onWrite: writeAction.startWriting,
    // Settled is enough: a failed section fetch is spent on an error toast
    // that names the real problem (PRD-130).
    isWriteReady: Boolean(activeMe) && !data.areSectionsLoading,
    onCommission: modals.openCommission,
  });

  const calendar = useDeskCalendarProps({
    issue,
    track: tracks.track,
    visiblePieces,
  });
  const { groups, collapsedGroups, keyboardPieces, selectedPieces } =
    useDeskPieceOrder({
      layout,
      visiblePieces,
      calendarOrderPieces: calendar.calendarOrderPieces,
      me: activeMe,
      groupBy: deskState.groupBy,
      focusId: deskState.focusId,
      selectedPieceIds: pieceSelection.selectedPieceIds,
      isFocusActive: data.focus.activeFocusIds.length > 0,
    });

  // One presence socket per page: the peek watches the piece it shows, and
  // the table rows and the peek show who else has a piece open.
  const presence = useDeskPresence();
  const peek = useDeskPeek({
    order: keyboardPieces,
    pieces: data.pieces,
    setFocusId: deskState.setFocusId,
    watchPiece: presence.watchPiece,
    unwatchPiece: presence.unwatchPiece,
  });
  const nextAction = useDeskNextAction({
    openChase: modals.openChase,
    editPiece: pieceActions.editPiece,
    openAssignIssue: assignment.openForPiece,
    openHandoff: modals.openHandoff,
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const viewsMenu = useDeskViewsWiring({
    searchParams: data.searchParams,
    setSearchParams: data.setSearchParams,
    deskState,
    track: tracks.track,
  });

  useDeskShortcuts({
    keyboardPieces,
    focusId: deskState.focusId,
    setFocusId: deskState.setFocusId,
    peek,
    pitches,
    onChase: modals.openChase,
    onWrite: writeAction.startWriting,
    onShortcuts: modals.openShortcuts,
    onToggleSelect: assignment.togglePieceSelect,
    onOpenTriage: () => triageState.open(),
    onTriageTop: (verdict) => {
      const topPitch = pitches[0];
      if (!topPitch) return;
      if (verdict === "maybe") triage.maybe(topPitch.id);
      else triage.pass(topPitch.id);
    },
    searchInputRef,
    hasOpenDialog:
      modals.modal !== null ||
      triageState.isOpen ||
      isNewIssueOpen ||
      assignment.assignTargets !== null ||
      nextAction.publishPiece !== null,
  });

  return {
    ...data,
    pieceSelection,
    selectedPieces,
    layout,
    setLayout,
    isNewIssueOpen,
    setIsNewIssueOpen,
    createIssue,
    assignment,
    modals,
    triage,
    triageState,
    pieceActions,
    writeAction,
    buildDeckAction,
    bulkActions,
    groups,
    collapsedGroups,
    peek,
    nextAction,
    searchInputRef,
    calendar,
    presence,
    viewsMenu,
  };
}

export type EditorDesk = ReturnType<typeof useEditorDesk>;
