import type { Piece } from "../data/desk.data";
import { hasPublishDate, isPieceScheduled } from "./pieceSchedule";

/**
 * What a piece's publish date says in the desk's action slot when there is
 * no next action to show: `scheduled` while its `publishedAt` is still ahead
 * (it goes live on its own), `live` once that date has passed while the stage
 * sits below Published (no job advances it), and null otherwise. The row and
 * the board card read this so a scheduled piece never shows an empty slot.
 */
export type PieceGoLiveState =
  { kind: "scheduled"; publishesAt: Date } | { kind: "live" };

export function pieceGoLiveState(
  piece: Pick<Piece, "publishedAt" | "stage">,
  now: number = Date.now(),
): PieceGoLiveState | null {
  if (!piece.publishedAt || !hasPublishDate(piece)) return null;
  if (isPieceScheduled(piece, now)) {
    return { kind: "scheduled", publishesAt: new Date(piece.publishedAt) };
  }
  return piece.stage === "Published" ? null : { kind: "live" };
}
