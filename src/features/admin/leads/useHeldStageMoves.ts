import { useEffect, useRef } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { leadKeys } from "./api/leadKeys";
import type { LeadListFilters, LeadStage } from "./api/leads.types";
import type { LeadDueCountFor } from "./api/useLeadDueCountFor";
import { lisbonLeadDay } from "./leadDates";
import {
  dueCountShiftOf,
  rereadLeadLists,
  showLeadMoveInCache,
  withLeadMovedInPages,
  type LeadListPages,
} from "./leadListCachePatch";
import { LEAD_UNDO_TOAST_MS } from "./leadsList.data";

/** A stage move on screen but not saved yet ("held"), or on its way. */
export interface HeldStageMove {
  leadId: string;
  from: { stage: LeadStage; followUpOn: string | null };
  stage: LeadStage;
  phase: "held" | "saving";
  timer: ReturnType<typeof setTimeout> | null;
}

/** True when a query key starts with `root`. */
function isUnder(key: readonly unknown[], root: readonly unknown[]): boolean {
  return root.every((part, index) => key[index] === part);
}

/** Puts every move back over a list or a due count the server just sent,
 *  since the server does not hold them yet. */
function reapplyMoves(
  queryClient: QueryClient,
  key: readonly unknown[],
  moves: HeldStageMove[],
): void {
  const today = lisbonLeadDay();
  if (isUnder(key, leadKeys.listRoot)) {
    const filters = key[3] as LeadListFilters | undefined;
    const pages = queryClient.getQueryData<LeadListPages>(key);
    if (pages === undefined || filters === undefined) return;
    const moved = moves.reduce(
      (current, move) =>
        withLeadMovedInPages(current, filters, move.leadId, move.stage, today),
      pages,
    );
    if (moved !== pages) queryClient.setQueryData(key, moved);
    return;
  }
  if (!isUnder(key, leadKeys.dueCountRoot)) return;
  const shift = moves.reduce(
    (sum, move) => sum + dueCountShiftOf(move.from, move.stage, today),
    0,
  );
  if (shift === 0) return;
  queryClient.setQueryData<number | LeadDueCountFor>(key, (count) => {
    if (count === undefined) return count;
    if (typeof count === "number") return Math.max(0, count + shift);
    return count.isCapped
      ? count
      : { ...count, count: Math.max(0, count.count + shift) };
  });
}

/**
 * Stage moves from the list are held for the Undo window before they are
 * saved, because every saved stage change writes a history line, and an
 * Undo after a save would write a second one. While held, the move shows
 * in every cached list and due count, and it is put back over each fresh
 * answer from the server. Undo drops it with no request. The window
 * ending saves it; so does leaving the page, hiding the tab or closing it,
 * so a held move is never left unsaved.
 */
export function useHeldStageMoves({
  save,
}: {
  /** Sends one move. Resolves when the server holds it; rejects on a
   *  refusal, after which the lists read the server's truth again. */
  save: (move: HeldStageMove) => Promise<unknown>;
}) {
  const queryClient = useQueryClient();
  const movesRef = useRef(new Map<string, HeldStageMove>());
  const savedSave = useRef(save);
  useEffect(() => {
    savedSave.current = save;
  });

  const commit = (move: HeldStageMove) => {
    if (move.phase !== "held") return;
    if (move.timer !== null) clearTimeout(move.timer);
    move.timer = null;
    move.phase = "saving";
    const settle = () => {
      if (movesRef.current.get(move.leadId) === move) {
        movesRef.current.delete(move.leadId);
      }
    };
    savedSave.current(move).then(settle, () => {
      settle();
      rereadLeadLists(queryClient);
    });
  };
  const commitAll = () => movesRef.current.forEach(commit);

  useEffect(() => {
    const moves = movesRef.current;
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || moves.size === 0) return;
      if (event.action.type !== "success" || event.action.manual) return;
      const key = event.query.queryKey as unknown as readonly unknown[];
      reapplyMoves(queryClient, key, [...moves.values()]);
    });
    const onHidden = () => {
      if (document.visibilityState === "hidden") commitAll();
    };
    // Closing the tab: save now, and let the browser ask to stay while the
    // request runs.
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (moves.size === 0) return;
      commitAll();
      event.preventDefault();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("beforeunload", onBeforeUnload);
      // Leaving the page saves what is still held.
      commitAll();
    };
    // `commitAll` reads only refs, so the first one serves for good.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  /** Holds a move, or changes the held one for the same lead (a move back
   *  to where it started drops it). Returns the move, or null when there is
   *  nothing left to hold. */
  const hold = (
    leadId: string,
    from: HeldStageMove["from"],
    stage: LeadStage,
  ): HeldStageMove | null => {
    const earlier = movesRef.current.get(leadId);
    if (earlier?.phase === "saving") return null;
    const origin = earlier?.from ?? from;
    if (earlier !== undefined) drop(earlier);
    if (origin.stage === stage) return null;
    const move: HeldStageMove = {
      leadId,
      from: origin,
      stage,
      phase: "held",
      timer: null,
    };
    move.timer = setTimeout(() => commit(move), LEAD_UNDO_TOAST_MS);
    movesRef.current.set(leadId, move);
    showLeadMoveInCache(queryClient, { ...move, today: lisbonLeadDay() });
    return move;
  };

  /** Drops a held move with no request; the lists read the server again.
   *  False when the move was already sent. */
  const drop = (move: HeldStageMove): boolean => {
    const current = movesRef.current.get(move.leadId);
    if (current === undefined || current.phase !== "held") return false;
    if (current.timer !== null) clearTimeout(current.timer);
    movesRef.current.delete(move.leadId);
    rereadLeadLists(queryClient);
    return true;
  };

  return { hold, drop };
}
