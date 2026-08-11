/**
 * The desk's two-track state (Highlights vs. Issue): the URL-persisted active
 * track, the client-side partition of the already-fetched pieces, and the
 * reassignment handler that moves a piece across tracks. Kept out of
 * `EditorDashboardPage` so the page stays thin — mirrors `useDeskState` /
 * `useDeskModals`.
 */

import { useMemo } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import type { Issue, Piece } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import type { TFunction } from "../../../shared/i18n/types";
import type { ToastType } from "../../../shared/components/feedback/toastContext";
import type { DeskTrack } from "./DeskTrackTabs";

export interface UseDeskTracksParams {
  pieces: Piece[];
  /** The current issue (id `""` when none) — its id is the Issue-track key. */
  issue: Issue;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  pieceMutations: ReturnType<typeof usePieceMutations>;
  showToast: (message: string, type?: ToastType) => void;
  translate: TFunction;
}

export interface UseDeskTracksResult {
  track: DeskTrack;
  setTrack: (track: DeskTrack) => void;
  hasCurrentIssue: boolean;
  highlightsPieces: Piece[];
  issuePieces: Piece[];
  /** The active track's pieces — feed straight into `useDeskState`. */
  activePieces: Piece[];
  /** Move a piece to the other track. Toast is owned here so it can name the
   *  track it moved to; fires in both demo and live via the mutation callback. */
  reassignPiece: (piece: Piece) => void;
}

export function useDeskTracks({
  pieces,
  issue,
  searchParams,
  setSearchParams,
  pieceMutations,
  showToast,
  translate,
}: UseDeskTracksParams): UseDeskTracksResult {
  // A piece with `issueId === null` is a standalone platform highlight; one
  // matching the current issue's id is issue work. Pieces bound to *other*
  // (past) issues fall into neither and stay out of the current desk. Partition
  // the already-fetched list once — no second fetch, no new query key.
  const hasCurrentIssue = issue.id !== "";
  const { highlightsPieces, issuePieces } = useMemo(() => {
    const highlights: Piece[] = [];
    const issueWork: Piece[] = [];
    for (const piece of pieces) {
      if (piece.issueId === null) highlights.push(piece);
      else if (piece.issueId === issue.id) issueWork.push(piece);
    }
    return { highlightsPieces: highlights, issuePieces: issueWork };
  }, [pieces, issue.id]);

  // Track lives in the URL (`?track=`), mirroring the `?commission=` idiom.
  // Default to Issue when a current issue exists, else Highlights.
  const trackParam = searchParams.get("track");
  const track: DeskTrack =
    trackParam === "highlights" || trackParam === "issue"
      ? trackParam
      : hasCurrentIssue
        ? "issue"
        : "highlights";
  const setTrack = (nextTrack: DeskTrack) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("track", nextTrack);
    setSearchParams(nextParams, { replace: true });
  };

  const activePieces = track === "highlights" ? highlightsPieces : issuePieces;

  // From Highlights → into the current issue (`issueId: currentId`); from Issue
  // → standalone (`issueId: null`). The mutation invalidates `["magazine-pieces"]`,
  // so the piece re-partitions and hops tabs.
  const reassignPiece = (piece: Piece) => {
    const intoIssue = track === "highlights";
    pieceMutations.updatePiece.mutate(
      { id: piece.id, body: { issueId: intoIssue ? issue.id : null } },
      {
        onSuccess: () =>
          showToast(
            intoIssue
              ? translate("magazine:desk.reassign.addedToIssueToast", { number: issue.number })
              : translate("magazine:desk.reassign.madeStandaloneToast"),
            "success",
          ),
        onError: () => showToast(translate("magazine:desk.reassign.failedToast"), "error"),
      },
    );
  };

  return {
    track,
    setTrack,
    hasCurrentIssue,
    highlightsPieces,
    issuePieces,
    activePieces,
    reassignPiece,
  };
}
