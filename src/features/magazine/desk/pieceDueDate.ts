import { createContext, useMemo } from "react";

/** What a row needs to set an undated piece's due day where it stands. */
export interface PieceDueDateEditor {
  /** Saves `dueOn` (an ISO `YYYY-MM-DD` day) on the piece. Rejects when the
   *  save fails; the mutation's global error toast already says so. */
  saveDueOn: (pieceId: string, dueOn: string) => Promise<void>;
}

/**
 * Lets the pipeline's rows open a date popover from "Set date" without the
 * table threading a save handler through every row. The desk's work area
 * provides it. A row rendered with no provider keeps "Set date" as a plain
 * button that hands the piece to its `onSetDue` handler, so `PieceRow` still
 * works on its own.
 */
export const PieceDueDateContext = createContext<PieceDueDateEditor | null>(
  null,
);

/** The piece PATCH, as `usePieceMutations().updatePiece.mutateAsync` takes
 *  it; only the `dueOn` field is ever sent from here. */
export type SavePieceDueOn = (variables: {
  id: string;
  body: { dueOn: string };
}) => Promise<unknown>;

/** The desk's editor for the context above, built on the desk's own
 *  `updatePiece` mutation (whose demo branch mirrors the day onto
 *  `DEMO_PIECES`). `mutateAsync` is stable, so the value is too. */
export function usePieceDueDateEditor(
  savePiece: SavePieceDueOn,
): PieceDueDateEditor {
  return useMemo(
    () => ({
      saveDueOn: async (pieceId: string, dueOn: string) => {
        await savePiece({ id: pieceId, body: { dueOn } });
      },
    }),
    [savePiece],
  );
}
