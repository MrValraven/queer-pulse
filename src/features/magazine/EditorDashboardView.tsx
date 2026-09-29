import { MagazineDeskShell } from "../../shared/components/layout";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatRelative } from "../../shared/lib/date";
import { DEMO_STAGES, type Pitch } from "./data/desk.data";
import { DeskView } from "./desk/DeskView";
import { DeskModals } from "./desk/DeskModals";
import { DeskIssueModals } from "./desk/DeskIssueModals";
import { DeskBulkBar } from "./desk/DeskBulkBar";
import { PitchTriage } from "./desk/PitchTriage";
import { PiecePeekPanel } from "./desk/PiecePeekPanel";
import { DeskPublishFlow } from "./desk/DeskPublishFlow";
import type { EditorDesk } from "./desk/useEditorDesk";

export interface EditorDashboardViewProps {
  desk: EditorDesk;
}

/**
 * The desk's render layer: the page shell, `DeskView`, and every overlay the
 * desk raises. The overlays sit here, beside `DeskView` and outside its
 * layout boxes: the peek panel is `position: fixed` and the table is a size
 * container, which would otherwise become the panel's containing block.
 * Pitch triage mounts before `DeskModals`, so the pass and commission
 * dialogs it opens portal on top of it.
 */
export function EditorDashboardView({ desk }: EditorDashboardViewProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { deskState, modals, triage, triageState, peek, tracks } = desk;

  // "3 days ago" from the pitch's received instant, through the same
  // relative-time formatter the piece threads use.
  const pitchAgeLabel = (pitch: Pitch) =>
    pitch.receivedAt ? formatRelative(pitch.receivedAt, format) || null : null;

  return (
    <MagazineDeskShell>
      <DeskView desk={desk} />

      <PiecePeekPanel
        piece={peek.peekPiece}
        track={tracks.track}
        onClose={peek.close}
        onOpenFullRecord={desk.pieceActions.openPiece}
        onNextAction={desk.nextAction.runNextAction}
        onPrevious={peek.showPrevious}
        onNext={peek.showNext}
        hasPrevious={peek.hasPrevious}
        hasNext={peek.hasNext}
        me={desk.activeMe}
        viewers={
          peek.peekPiece
            ? desk.presence.viewersByPiece[peek.peekPiece.id]
            : undefined
        }
      />

      <DeskBulkBar
        selectedPieces={desk.selectedPieces}
        stages={DEMO_STAGES}
        hasAnyIssue={desk.issues.length > 0}
        track={tracks.track}
        onAssignIssue={() =>
          desk.assignment.openForSelection(desk.selectedPieces)
        }
        onChangeStage={(stage) =>
          desk.bulkActions.changeStageForSelection(desk.selectedPieces, stage)
        }
        onChaseAll={modals.openChaseQueue}
        onHandOff={() => desk.bulkActions.handOffSelection(desk.selectedPieces)}
        onClear={desk.pieceSelection.clearPieceSelection}
        selectableCount={deskState.visiblePieces.length}
        onSelectAll={desk.pieceSelection.selectAll}
      />

      <PitchTriage
        isOpen={triageState.isOpen}
        onClose={triageState.close}
        pitches={desk.pitches}
        isLoading={desk.arePitchesLoading}
        initialPitchId={triageState.initialPitchId}
        leavingPitchIds={[...triage.leavingIds]}
        onCommission={modals.openCommissionFromPitch}
        onMaybe={triage.maybe}
        onPass={modals.openPassFromPitch}
        selectedPitchIds={deskState.selected}
        // The overlay's own selection: picking a pitch here leaves the
        // desk's piece selection (and its bulk bar) alone.
        onToggleSelect={deskState.toggleSelect}
        onBulkMaybe={triage.bulkMaybe}
        onBulkPass={triage.bulkPass}
        onClearSelection={deskState.clearSelected}
        pitchAgeLabel={pitchAgeLabel}
        answeredPitchIds={triageState.answeredPitchIds}
      />

      <DeskModals
        modal={modals.modal}
        editors={desk.editors}
        sections={desk.sections}
        commissionTrack={tracks.track}
        hasCurrentIssue={tracks.hasCurrentIssue}
        issueNumber={desk.issue.number}
        onClose={modals.close}
        onCommission={modals.submitCommission}
        onPass={modals.submitPass}
        onHandoff={modals.confirmHandoff}
        onSkipChase={modals.skipChase}
        onConfirmDeletePiece={() => void modals.confirmDeletePiece()}
        isDeletingPiece={modals.isDeletingPiece}
      />

      <DeskIssueModals
        assignTargets={desk.assignment.assignTargets}
        onCloseAssign={desk.assignment.close}
        onAssign={desk.assignment.submit}
        isNewIssueOpen={desk.isNewIssueOpen}
        onCloseNewIssue={() => desk.setIsNewIssueOpen(false)}
        isCreatingIssue={desk.createIssue.isPending}
        issues={desk.issues}
        onCreateIssue={async (body) => {
          const created = await desk.createIssue.mutateAsync(body);
          // Land on the issue that was just made, in its own scope: creating
          // one and still looking at the previous issue is the wrong default.
          desk.selectIssueScope(created.number);
          desk.showToast(
            t("magazine:desk.newIssue.createdToast", {
              number: created.number,
            }),
            "success",
          );
          return created;
        }}
      />

      <DeskPublishFlow
        piece={desk.nextAction.publishPiece}
        onDone={desk.nextAction.finishPublish}
      />
    </MagazineDeskShell>
  );
}
