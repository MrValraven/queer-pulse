import { vi } from "vitest";
import { DEMO_STAGES, type Piece } from "../data/desk.data";
import { usePieceMutations } from "../api/usePieceMutations";
import { usePitchMutations } from "../api/usePitchMutations";
import { DeskModals } from "./DeskModals";
import { PieceRow } from "./PieceRow";
import { PiecesBoard } from "./PiecesBoard";
import { useDeskModals } from "./useDeskModals";

/**
 * Test-only wiring for the unpublish flow: a Published piece shown as a table
 * row or a board card, both opening the desk's ONE confirm through the real
 * `useDeskModals` and `DeskModals`, exactly as `DeskWorkArea` hands
 * `modals.openUnpublishPiece` to both.
 */

export function UnpublishFlowHarness({
  piece,
  surface,
}: {
  piece: Piece;
  surface: "row" | "board";
}) {
  const modals = useDeskModals({
    activeMe: "marta",
    currentIssueId: "",
    pieceMutations: usePieceMutations(),
    pitchMutations: usePitchMutations(),
  });
  return (
    <>
      {surface === "row" ? (
        <PieceRow
          piece={piece}
          focused={false}
          track="issue"
          hasAnyIssue
          selected={false}
          today={new Date(2026, 7, 5)}
          onToggleSelect={vi.fn()}
          onOpen={vi.fn()}
          onEdit={vi.fn()}
          onChase={vi.fn()}
          onHandoff={vi.fn()}
          onAssignIssue={vi.fn()}
          onDelete={vi.fn()}
          onUnpublish={modals.openUnpublishPiece}
        />
      ) : (
        <PiecesBoard
          pieces={[piece]}
          stages={DEMO_STAGES}
          onOpen={vi.fn()}
          onMove={vi.fn()}
          onUnpublish={modals.openUnpublishPiece}
        />
      )}
      <DeskModals
        modal={modals.modal}
        editors={[]}
        sections={[]}
        commissionTrack="issue"
        hasCurrentIssue={false}
        issueNumber=""
        onClose={modals.close}
        onCommission={vi.fn()}
        onPass={vi.fn()}
        onHandoff={vi.fn()}
        onSkipChase={vi.fn()}
        onConfirmDeletePiece={vi.fn()}
        isDeletingPiece={false}
        onConfirmUnpublishPiece={(stage) =>
          void modals.confirmUnpublishPiece(stage)
        }
        isUnpublishingPiece={modals.isUnpublishingPiece}
      />
    </>
  );
}
