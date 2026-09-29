/**
 * The dates the desk's time-aware views share: one `today` per calendar day
 * (so the calendar's placement and the rail's forecast memoise on a stable
 * value), the issue's close and publish days, and the visible pieces in the
 * order the calendar draws them, for j/k and the peek's steps.
 *
 * The close and publish days belong to the issue scope. Unfiled work and
 * everything in flight have no deadline of their own, so both read null
 * there and neither the calendar nor the forecast marks one.
 */

import { useMemo } from "react";
import type { Issue, Piece } from "../data/desk.data";
import type { DeskTrack } from "./deskTrack";
import {
  buildCalendarWeeks,
  calendarPieceOrder,
  fromIsoDay,
  toIsoDay,
} from "./piecesCalendarWeeks";

export interface UseDeskCalendarPropsParams {
  issue: Issue;
  track: DeskTrack;
  /** The filtered, sorted pieces the active layout shows. */
  visiblePieces: Piece[];
}

export interface DeskCalendarProps {
  /** Local midnight of today; a new value only when the day changes. */
  today: Date;
  closesOn: string | null;
  publishesOn: string | null;
  /** `visiblePieces` as the calendar draws them (`calendarPieceOrder`):
   *  its lanes first, then day by day. Inside a lane or a day the pieces
   *  keep the table's order, as the calendar does. */
  calendarOrderPieces: Piece[];
}

export function useDeskCalendarProps({
  issue,
  track,
  visiblePieces,
}: UseDeskCalendarPropsParams): DeskCalendarProps {
  const todayKey = toIsoDay(new Date());
  const today = useMemo(() => fromIsoDay(todayKey), [todayKey]);
  const isIssueScope = track === "issue";
  const closesOn = isIssueScope ? (issue.closesOn ?? null) : null;
  const publishesOn = isIssueScope ? (issue.publishedOn ?? null) : null;
  // The same placement the calendar renders, so the lanes and days j/k
  // walks are the ones on screen.
  const calendarOrderPieces = useMemo(
    () =>
      calendarPieceOrder(
        buildCalendarWeeks(visiblePieces, today, closesOn, publishesOn),
      ),
    [visiblePieces, today, closesOn, publishesOn],
  );

  return { today, closesOn, publishesOn, calendarOrderPieces };
}
