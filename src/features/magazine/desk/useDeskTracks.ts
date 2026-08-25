/**
 * The desk's two-track state (Unassigned vs. the selected issue): the
 * URL-persisted active track, the client-side partition of the already-fetched
 * pieces, and the handlers that file a piece onto an issue or lift it back
 * out. Kept out of `EditorDashboardPage` so the page stays thin — mirrors
 * `useDeskState` / `useDeskModals`.
 *
 * The issue this track targets is chosen by `useDeskIssueSelection`, not by
 * the backend's implicit "highest number wins" rule.
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
  /** The selected issue (id `""` when the magazine has none) — its id is the
   *  Issue-track key. */
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
  unassignedPieces: Piece[];
  issuePieces: Piece[];
  /** The active track's pieces — feed straight into `useDeskState`. */
  activePieces: Piece[];
  /** File one piece onto a specific issue, or detach it with `null`. Toast is
   *  owned here so it can name the issue it moved to; fires in both demo and
   *  live via the mutation callback. */
  assignPieceToIssue: (
    piece: Piece,
    target: { id: string; number: string } | null,
  ) => void;
}

/** `?track=highlights` is the pre-switcher name for the same predicate
 *  (`issueId === null`). Still accepted so an open tab or a bookmarked desk
 *  link keeps working; only the stored/written value changed. */
function readTrackParam(
  rawTrack: string | null,
  hasCurrentIssue: boolean,
): DeskTrack {
  if (rawTrack === "unassigned" || rawTrack === "highlights") return "unassigned";
  if (rawTrack === "issue") return "issue";
  return hasCurrentIssue ? "issue" : "unassigned";
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
  // A piece with `issueId === null` is unfiled work; one matching the selected
  // issue's id belongs to that issue. Pieces bound to a DIFFERENT issue fall
  // into neither track and stay off this desk — switch issues to reach them.
  // Partition the already-fetched list once: no second fetch, no new query key.
  const hasCurrentIssue = issue.id !== "";
  const { unassignedPieces, issuePieces } = useMemo(() => {
    const unassigned: Piece[] = [];
    const issueWork: Piece[] = [];
    for (const piece of pieces) {
      if (piece.issueId === null) unassigned.push(piece);
      else if (piece.issueId === issue.id) issueWork.push(piece);
    }
    return { unassignedPieces: unassigned, issuePieces: issueWork };
  }, [pieces, issue.id]);

  // Track lives in the URL (`?track=`), mirroring the `?commission=` idiom.
  // Default to Issue when one is selected, else Unassigned.
  const track = readTrackParam(searchParams.get("track"), hasCurrentIssue);
  const setTrack = (nextTrack: DeskTrack) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("track", nextTrack);
    setSearchParams(nextParams, { replace: true });
  };

  const activePieces = track === "unassigned" ? unassignedPieces : issuePieces;

  // The mutation invalidates `["magazine-pieces"]`, so the piece re-partitions
  // and hops tabs. Passing the target explicitly (rather than deriving it from
  // the active track) is what lets a piece move straight from one issue to
  // another without a detach step in between.
  const assignPieceToIssue = (
    piece: Piece,
    target: { id: string; number: string } | null,
  ) => {
    pieceMutations.updatePiece.mutate(
      { id: piece.id, body: { issueId: target?.id ?? null } },
      {
        onSuccess: () =>
          showToast(
            target
              ? translate("magazine:desk.reassign.addedToIssueToast", {
                  number: target.number,
                })
              : translate("magazine:desk.reassign.madeUnassignedToast"),
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
    unassignedPieces,
    issuePieces,
    activePieces,
    assignPieceToIssue,
  };
}
