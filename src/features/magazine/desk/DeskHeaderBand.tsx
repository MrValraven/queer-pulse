import { useMemo } from "react";
import type { Piece } from "../data/desk.data";
import { DeskPulseHeader } from "./DeskPulseHeader";
import { issueSlotTotals } from "./issueSlots";
import type { EditorDesk } from "./useEditorDesk";

/** In-flight pieces per issue id, and how many issues they span. */
function countPiecesByIssue(pieces: Piece[]) {
  const pieceCountByIssueId: Record<string, number> = {};
  for (const piece of pieces) {
    if (piece.issueId === null) continue;
    pieceCountByIssueId[piece.issueId] =
      (pieceCountByIssueId[piece.issueId] ?? 0) + 1;
  }
  return {
    pieceCountByIssueId,
    issueCount: Object.keys(pieceCountByIssueId).length,
  };
}

/**
 * The desk's first band: the pulse header (`DeskPulseHeader`), fed the scope
 * counts and the selected issue's slot totals.
 */
export function DeskHeaderBand({ desk }: { desk: EditorDesk }) {
  const { tracks, issue, issues, writeAction, modals } = desk;
  const everything = useMemo(
    () => countPiecesByIssue(tracks.everythingPieces),
    [tracks.everythingPieces],
  );
  // The selected issue's own pieces against the section targets: the same
  // count the Issue plan and the rail draw. With no section list (still
  // loading, or failed) the pulse falls back to the issue's stored figures.
  const slotTotals = useMemo(
    () =>
      desk.sections.length > 0
        ? issueSlotTotals(tracks.issuePieces, desk.sections)
        : undefined,
    [tracks.issuePieces, desk.sections],
  );
  const onNewIssue = () => desk.setIsNewIssueOpen(true);

  return (
    <DeskPulseHeader
      issue={issue}
      issues={issues}
      onSelectIssueScope={desk.selectIssueScope}
      track={tracks.track}
      onTrack={tracks.setTrack}
      hasCurrentIssue={tracks.hasCurrentIssue}
      unassignedCount={tracks.unassignedPieces.length}
      everythingCount={tracks.everythingPieces.length}
      everythingIssueCount={everything.issueCount}
      pieceCountByIssueId={everything.pieceCountByIssueId}
      onNewIssue={onNewIssue}
      onWrite={writeAction.startWriting}
      isWriting={writeAction.isStarting}
      onBuildDeck={desk.buildDeckAction.startBuildingDeck}
      isBuildingDeck={desk.buildDeckAction.isStarting}
      onCommission={modals.openCommission}
      onProduce={desk.pieceActions.produceIssue}
      slotTotals={slotTotals}
      onOpenPlan={() => desk.setLayout("plan")}
    />
  );
}
