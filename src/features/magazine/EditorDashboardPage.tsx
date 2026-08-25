import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MagazineDeskShell, useMagazineShellOverlay } from "../../shared/components/layout";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DEMO_SECTIONS, DEMO_STAGES } from "./data/desk.data";
import { usePieces } from "./api/usePieces";
import { usePitches } from "./api/usePitches";
import { useDeskSummary } from "./api/useDeskSummary";
import { useMagazineEditors } from "./api/useMagazineEditors";
import { useCurrentIssue } from "./api/useCurrentIssue";
import { useCreateIssue, useDeskIssues } from "./api/useDeskIssues";
import { usePieceMutations } from "./api/usePieceMutations";
import { usePitchMutations } from "./api/usePitchMutations";
import type { DeskLayout } from "./desk/DeskHeader";
import { useDeskState } from "./desk/useDeskState";
import { useDeskTracks } from "./desk/useDeskTracks";
import { useDeskIssueSelection } from "./desk/useDeskIssueSelection";
import { useDeskPieceSelection } from "./desk/useDeskPieceSelection";
import { useDeskAssignment } from "./desk/useDeskAssignment";
import { useDeskPieceActions } from "./desk/useDeskPieceActions";
import { useDeskWriteAction } from "./desk/useDeskWriteAction";
import { useDeskEntryParams } from "./desk/useDeskEntryParams";
import { useDeskKeyboard } from "./desk/useDeskKeyboard";
import { useDeskModals } from "./desk/useDeskModals";
import { usePitchTriageActions } from "./desk/usePitchTriageActions";
import { DeskView } from "./desk/DeskView";
import { DeskModals } from "./desk/DeskModals";
import { DeskIssueModals } from "./desk/DeskIssueModals";

/**
 * The magazine editor desk. Thin by design: owns the page shell, dual-mode
 * data hooks, local filter/sort/selection state, and overlay state (the
 * commission/pass/chase/handoff modal) — the visible layout lives in
 * `DeskView`. The ⌘K command palette is now hoisted into `MagazineDeskShell`
 * (it runs on every editor surface, not just this one) —
 * `useMagazineShellOverlay` reads its open state so this page's own
 * j/k/o/c/y/n shortcuts stay disabled while the palette is open.
 */
export function EditorDashboardPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPaletteOpen } = useMagazineShellOverlay();

  const { pieces, isLoading: piecesLoading, isError: piecesError } = usePieces({});
  const { pitches, isLoading: pitchesLoading } = usePitches();
  const { summary } = useDeskSummary();
  const pieceMutations = usePieceMutations();
  const pitchMutations = usePitchMutations();

  // The editor directory backs both the "Viewing as" picker and the
  // sidebar's editor-load names — real names in live mode, not editorIds.
  const { editors } = useMagazineEditors();

  // Every issue, for the header switcher and the new-issue modal's suggested
  // number. `useCurrentIssue` is now only the DEFAULT selection: which issue
  // the desk works on is the editor's choice (`?issue=`), so an older issue is
  // reachable and a newly created low-numbered issue is not stranded.
  const { issues } = useDeskIssues();
  const { issue: currentIssue } = useCurrentIssue();
  const { deskIssue: issue, selectIssue } = useDeskIssueSelection({
    issues,
    currentIssue,
    searchParams,
    setSearchParams,
  });

  // The `editorId` stamped on new commissions must be a real user UUID. In live
  // mode that's the signed-in editor (this desk is `magazine_editor`-guarded);
  // the "Viewing as" picker (`meState`) can override it. It must NOT fall back to
  // `editors[0]?.id` in live mode — the directory can be empty (or ordered
  // differently than "me") and stamping the wrong editor would misattribute
  // the commission. Demo mode keeps its slug identity (it never hits the API).
  const [meState, setMeState] = useState("");
  const activeMe = meState || (demoMode ? editors[0]?.id : user?.id) || "";

  // The desk splits into two tracks (Unassigned vs. the selected issue). The
  // partition, the URL-persisted active track, and the assignment handler all
  // live in `useDeskTracks`; only the active track feeds the existing
  // filter/sort/saved-view pipeline (`useDeskState`).
  const tracks = useDeskTracks({
    pieces,
    issue,
    searchParams,
    setSearchParams,
    pieceMutations,
    showToast,
    translate: t,
  });
  const deskState = useDeskState(tracks.activePieces, activeMe);
  const pieceSelection = useDeskPieceSelection(deskState.visiblePieces);

  const [layout, setLayout] = useState<DeskLayout>("list");

  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const createIssue = useCreateIssue();
  const assignment = useDeskAssignment({
    pieceMutations,
    pieceSelection,
    assignPieceToIssue: tracks.assignPieceToIssue,
    pitchSelection: deskState,
    showToast,
    translate: t,
  });

  const modals = useDeskModals({
    activeMe,
    currentIssueId: issue.id,
    pieceMutations,
    pitchMutations,
  });
  const triage = usePitchTriageActions({
    pitchMutations,
    selectedPitchIds: deskState.selected,
    clearSelectedPitchIds: deskState.clearSelected,
  });

  const pieceActions = useDeskPieceActions({ issue, pieceMutations });

  // "Write" creates the piece with this editor as its own writer and lands in
  // the article editor. No modal: the fields a brief-less piece needs are all
  // in the editor's meta rail.
  const writeAction = useDeskWriteAction({
    activeMe,
    editors,
    sections: DEMO_SECTIONS,
    issue,
    track: tracks.track,
    pieceMutations,
    showToast,
    translate: t,
  });

  useDeskEntryParams({
    searchParams,
    setSearchParams,
    onWrite: writeAction.startWriting,
    isWriteReady: Boolean(activeMe),
    onCommission: modals.openCommission,
  });

  useDeskKeyboard({
    visiblePieces: deskState.visiblePieces,
    focusId: deskState.focusId,
    setFocusId: deskState.setFocusId,
    onOpen: pieceActions.openPiece,
    onChase: modals.openChase,
    onWrite: writeAction.startWriting,
    onShortcuts: modals.openShortcuts,
    topPitchId: pitches[0]?.id ?? null,
    onTriageTop: (verdict) => {
      const topPitch = pitches[0];
      if (!topPitch) return;
      if (verdict === "maybe") triage.maybe(topPitch.id);
      else triage.pass(topPitch.id);
    },
    enabled: modals.modal === null && !isPaletteOpen,
  });

  const isLoading = piecesLoading || pitchesLoading;
  const isEmpty = !demoMode && !isLoading && !piecesError && pieces.length === 0 && pitches.length === 0;

  return (
    <MagazineDeskShell>
      <DeskView
        loading={isLoading}
        showError={piecesError}
        onRetry={() => void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] })}
        isEmpty={isEmpty}
        issue={issue}
        issues={issues}
        onSelectIssue={selectIssue}
        onNewIssue={() => setIsNewIssueOpen(true)}
        track={tracks.track}
        onTrack={tracks.setTrack}
        hasCurrentIssue={tracks.hasCurrentIssue}
        unassignedCount={tracks.unassignedPieces.length}
        issueCount={tracks.issuePieces.length}
        editors={editors}
        me={activeMe}
        onMe={setMeState}
        layout={layout}
        onLayout={setLayout}
        onWrite={writeAction.startWriting}
        isWriting={writeAction.isStarting}
        onCommission={modals.openCommission}
        onProduce={pieceActions.produceIssue}
        pieces={tracks.activePieces}
        visiblePieces={deskState.visiblePieces}
        focusId={deskState.focusId}
        pitches={pitches}
        pitchCount={pitches.length}
        stages={DEMO_STAGES}
        sections={DEMO_SECTIONS}
        q={deskState.q}
        onQ={deskState.setQ}
        fmt={deskState.fmt}
        onFmt={deskState.setFmt}
        mine={deskState.mine}
        onMine={deskState.setMine}
        sort={deskState.sort}
        onSort={deskState.setSort}
        onShortcuts={modals.openShortcuts}
        activeView={deskState.view}
        onToggleView={(id) => deskState.setView(deskState.view === id ? null : id)}
        onSaveView={() =>
          showToast(t("magazine:desk.page.savingViewsUnavailable"), "info")
        }
        onOpenPiece={pieceActions.openPiece}
        onEditPiece={pieceActions.editPiece}
        onChasePiece={modals.openChase}
        onHandoffPiece={modals.openHandoff}
        onAssignPieceIssue={assignment.openForPiece}
        selectedPieceIds={pieceSelection.selectedPieceIds}
        areAllPiecesSelected={pieceSelection.areAllSelected}
        onTogglePieceSelect={assignment.togglePieceSelect}
        onToggleAllPieceSelect={assignment.toggleAllPieceSelect}
        onBulkAssignIssue={() => assignment.openForSelection(deskState.visiblePieces)}
        onClearPieceSelection={pieceSelection.clearPieceSelection}
        onMovePiece={pieceActions.movePiece}
        onCommissionSection={modals.openCommissionForSection}
        selectedPitchIds={deskState.selected}
        onTogglePitchSelect={assignment.togglePitchSelect}
        onCommissionPitch={modals.openCommissionFromPitch}
        onMaybePitch={triage.maybe}
        onPassPitch={modals.openPassFromPitch}
        leavingPitchIds={[...triage.leavingIds]}
        onBulkMaybe={triage.bulkMaybe}
        onBulkPass={triage.bulkPass}
        onClearBulkSelection={deskState.clearSelected}
        summary={summary}
      />

      <DeskModals
        modal={modals.modal}
        editors={editors}
        sections={DEMO_SECTIONS}
        commissionTrack={tracks.track}
        hasCurrentIssue={tracks.hasCurrentIssue}
        issueNumber={issue.number}
        onClose={modals.close}
        onCommission={modals.submitCommission}
        onPass={modals.submitPass}
        onHandoff={modals.confirmHandoff}
      />

      <DeskIssueModals
        assignTargets={assignment.assignTargets}
        onCloseAssign={assignment.close}
        onAssign={assignment.submit}
        isNewIssueOpen={isNewIssueOpen}
        onCloseNewIssue={() => setIsNewIssueOpen(false)}
        isCreatingIssue={createIssue.isPending}
        issues={issues}
        onCreateIssue={async (body) => {
          const created = await createIssue.mutateAsync(body);
          // Land on the issue that was just made — creating one and then still
          // looking at the previous issue is the wrong default.
          selectIssue(created.number);
          showToast(
            t("magazine:desk.newIssue.createdToast", { number: created.number }),
            "success",
          );
          return created;
        }}
      />
    </MagazineDeskShell>
  );
}
