import type { Piece } from "../data/desk.data";

/**
 * Whether a piece is scheduled: its linked article or deck carries a
 * `publishedAt` instant still ahead of `now`. There is no job that flips it
 * to Published when the moment arrives, so a scheduled piece sits at Ready
 * until an editor acts; the desk hides Publish in the meantime (its stage lock
 * is `hasPublishDate`, below). A past instant is live already and still offers Publish, which
 * advances the stage and keeps the original date. A missing or unparseable
 * value reads as not scheduled.
 *
 * A module function (the clock is a parameter) so the desk hooks that call it
 * stay pure.
 */
export function isPieceScheduled(
  piece: Pick<Piece, "publishedAt">,
  now: number = Date.now(),
): boolean {
  if (!piece.publishedAt) return false;
  const publishesAtMs = Date.parse(piece.publishedAt);
  if (Number.isNaN(publishesAtMs)) return false;
  return publishesAtMs > now;
}

/**
 * Whether a piece's linked article or deck carries any parseable
 * `publishedAt`, scheduled or already live. The desk's stage-move guards read
 * this: with no job to advance the stage, a Ready piece whose date has passed
 * is public, and a plain stage move would leave it public at Edit. Moving it
 * belongs to the piece record (unschedule or unpublish first).
 */
export function hasPublishDate(piece: Pick<Piece, "publishedAt">): boolean {
  if (!piece.publishedAt) return false;
  return !Number.isNaN(Date.parse(piece.publishedAt));
}
