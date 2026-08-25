import type { Dispatch, SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MagazineDeskShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DEMO_SECTIONS, DEMO_STAGES } from "./data/desk.data";
import type { useCreateIssue } from "./api/useDeskIssues";
import { DeskView, type DeskViewProps } from "./desk/DeskView";
import { DeskModals } from "./desk/DeskModals";
import { DeskIssueModals } from "./desk/DeskIssueModals";
import type { useDeskTracks } from "./desk/useDeskTracks";
import type { useDeskState } from "./desk/useDeskState";
import type { useDeskPieceSelection } from "./desk/useDeskPieceSelection";
import type { useDeskAssignment } from "./desk/useDeskAssignment";
import type { useDeskModals } from "./desk/useDeskModals";
import type { usePitchTriageActions } from "./desk/usePitchTriageActions";
import type { useDeskPieceActions } from "./desk/useDeskPieceActions";
import type { useDeskWriteAction } from "./desk/useDeskWriteAction";

export interface EditorDashboardViewProps {
  isLoading: boolean;
  piecesError: boolean;
  isEmpty: boolean;
  issue: DeskViewProps["issue"];
  issues: DeskViewProps["issues"];
  onSelectIssue: DeskViewProps["onSelectIssue"];
  tracks: ReturnType<typeof useDeskTracks>;
  deskState: ReturnType<typeof useDeskState>;
  pieceSelection: ReturnType<typeof useDeskPieceSelection>;
  assignment: ReturnType<typeof useDeskAssignment>;
  modals: ReturnType<typeof useDeskModals>;
  triage: ReturnType<typeof usePitchTriageActions>;
  pieceActions: ReturnType<typeof useDeskPieceActions>;
  writeAction: ReturnType<typeof useDeskWriteAction>;
  editors: DeskViewProps["editors"];
  activeMe: DeskViewProps["me"];
  onMe: DeskViewProps["onMe"];
  layout: DeskViewProps["layout"];
  onLayout: DeskViewProps["onLayout"];
  pitches: DeskViewProps["pitches"];
  summary: DeskViewProps["summary"];
  isNewIssueOpen: boolean;
  setIsNewIssueOpen: Dispatch<SetStateAction<boolean>>;
  createIssue: ReturnType<typeof useCreateIssue>;
}

/**
 * The desk's render layer: the page shell plus `DeskView` and the two modal
 * dispatchers, wired to the hook results `EditorDashboardPage` composes.
 * Split out solely to keep `EditorDashboardPage` under the line limit — all
 * prop-name mapping (a hook's result shape -> `DeskView`'s flatter prop
 * names) lives here, so the page itself stays a thin composition of its
 * data/state hooks.
 */
export function EditorDashboardView({
  isLoading,
  piecesError,
  isEmpty,
  issue,
  issues,
  onSelectIssue,
  tracks,
  deskState,
  pieceSelection,
  assignment,
  modals,
  triage,
  pieceActions,
  writeAction,
  editors,
  activeMe,
  onMe,
  layout,
  onLayout,
  pitches,
  summary,
  isNewIssueOpen,
  setIsNewIssueOpen,
  createIssue,
}: EditorDashboardViewProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return (
    <MagazineDeskShell>
      <DeskView
        loading={isLoading}
        showError={piecesError}
        onRetry={() =>
          void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] })
        }
        isEmpty={isEmpty}
        issue={issue}
        issues={issues}
        onSelectIssue={onSelectIssue}
        onNewIssue={() => setIsNewIssueOpen(true)}
        track={tracks.track}
        onTrack={tracks.setTrack}
        hasCurrentIssue={tracks.hasCurrentIssue}
        unassignedCount={tracks.unassignedPieces.length}
        issueCount={tracks.issuePieces.length}
        editors={editors}
        me={activeMe}
        onMe={onMe}
        layout={layout}
        onLayout={onLayout}
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
        onToggleView={(id) =>
          deskState.setView(deskState.view === id ? null : id)
        }
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
        onBulkAssignIssue={() =>
          assignment.openForSelection(deskState.visiblePieces)
        }
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
          onSelectIssue(created.number);
          showToast(
            t("magazine:desk.newIssue.createdToast", {
              number: created.number,
            }),
            "success",
          );
          return created;
        }}
      />
    </MagazineDeskShell>
  );
}
