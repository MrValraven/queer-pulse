import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logError } from "../../../shared/observability/logger";
import {
  cancelWorkshopRsvp as cancelRequest,
  rsvpToWorkshop as rsvpRequest,
  type WorkshopRsvpStatus,
} from "./workshopRsvp.api";

/** Where the viewer stands on one workshop, plus the counts that go with it. */
export interface WorkshopRsvpState {
  status: WorkshopRsvpStatus;
  spotsFilled: number;
  spotsTotal: number;
}

/** What a workshop looks like before the viewer has touched it — the numbers
 *  off the fetched row (live) or the fixture (demo). */
export interface WorkshopRsvpSeed {
  status: WorkshopRsvpStatus;
  spotsFilled: number;
  spotsTotal: number;
}

export interface WorkshopRsvpStore {
  /** The viewer's standing on `id`, with this session's changes applied over
   *  whatever the row arrived with. */
  getRsvp: (id: string, seed: WorkshopRsvpSeed) => WorkshopRsvpState;
  /** Take a seat (or join the queue). Resolves the new state, or `null` when
   *  the write failed — callers must not show a confirmation on `null`. */
  rsvpWorkshop: (
    id: string,
    seed: WorkshopRsvpSeed,
  ) => Promise<WorkshopRsvpState | null>;
  /** Give the seat back. Resolves false when the write failed. */
  cancelRsvp: (id: string, seed: WorkshopRsvpSeed) => Promise<boolean>;
  /** True while a write for `id` is in flight. */
  isPending: (id: string) => boolean;
}

/**
 * The session's workshop bookings, in both modes.
 *
 * Lives outside `WorkshopsProvider` only to keep that component under the
 * 200-line ceiling; the provider owns the state by spreading this into its
 * context value, exactly as it owns create/edit/delete.
 *
 * Dual-mode, and the split is the same one `addWorkshop`/`updateWorkshop` make:
 * demo mode never touches the network and works out the resulting status
 * client-side from the cohort size it already has, while live mode POSTs and
 * takes the server's counts as authoritative. Either way the answer lands in
 * the same overlay, so the components downstream can't tell the difference.
 */
export function useWorkshopRsvpStore(): WorkshopRsvpStore {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // Overlay of this session's changes, keyed by workshop id (the slug). Held
  // separately from the catalogue rows so a booking survives a refetch that
  // hasn't landed yet, and so demo mode has somewhere to put one at all.
  const [state, setState] = useState<Record<string, WorkshopRsvpState>>({});
  const [pending, setPending] = useState<string[]>([]);

  const getRsvp = useCallback(
    (id: string, seed: WorkshopRsvpSeed): WorkshopRsvpState => {
      const mine = state[id];
      if (!mine) {
        return {
          status: seed.status,
          spotsFilled: seed.spotsFilled,
          spotsTotal: seed.spotsTotal,
        };
      }
      // Live mode: the overlay is optimistic, so it has to stand down once the
      // server catches up — otherwise it pins `spotsFilled` to whatever it was
      // when *we* acted, and the count stops moving when other people book or
      // cancel. A refetched row agreeing with us about our own standing is the
      // signal that it has: from then on its counts are the fresher ones.
      //
      // Demo mode has no server to catch up, so the overlay stays the truth —
      // and must, since the fixture's status is permanently null.
      if (!demoMode && seed.status === mine.status) {
        return {
          status: seed.status,
          spotsFilled: seed.spotsFilled,
          spotsTotal: seed.spotsTotal,
        };
      }
      return mine;
    },
    [state, demoMode],
  );

  // Live mode: the catalogue card and the detail row both carry `spotsFilled`,
  // so both caches are stale the moment a seat changes hands.
  const invalidate = useCallback(
    (id: string) => {
      void queryClient.invalidateQueries({ queryKey: ["workshops"] });
      void queryClient.invalidateQueries({ queryKey: ["workshop", id] });
    },
    [queryClient],
  );

  const rsvpWorkshop = useCallback(
    async (
      id: string,
      seed: WorkshopRsvpSeed,
    ): Promise<WorkshopRsvpState | null> => {
      const current = state[id] ?? seed;
      // Already holding a seat or a place in the queue — nothing to do, and
      // re-sending would only risk a spurious failure state.
      if (current.status !== null) return current;

      if (demoMode) {
        // Same rule the backend applies under its row lock: the cohort fills to
        // `spotsTotal` and everyone after that queues.
        const full = current.spotsFilled >= current.spotsTotal;
        const next: WorkshopRsvpState = {
          status: full ? "waitlist" : "going",
          spotsFilled: full ? current.spotsFilled : current.spotsFilled + 1,
          spotsTotal: current.spotsTotal,
        };
        setState((prev) => ({ ...prev, [id]: next }));
        return next;
      }

      setPending((prev) => [...prev, id]);
      try {
        const res = await rsvpRequest(id);
        const next: WorkshopRsvpState = {
          status: res.status,
          spotsFilled: res.spotsFilled,
          spotsTotal: res.spotsTotal,
        };
        setState((prev) => ({ ...prev, [id]: next }));
        invalidate(id);
        return next;
      } catch (err) {
        logError(err, { scope: "workshops.rsvp" });
        return null;
      } finally {
        setPending((prev) => prev.filter((p) => p !== id));
      }
    },
    [demoMode, state, invalidate],
  );

  const cancelRsvp = useCallback(
    async (id: string, seed: WorkshopRsvpSeed): Promise<boolean> => {
      const current = state[id] ?? seed;
      if (current.status === null) return true; // nothing held — already done

      if (demoMode) {
        setState((prev) => ({
          ...prev,
          [id]: {
            status: null,
            // Only a held seat frees one; leaving the queue changes no count.
            spotsFilled:
              current.status === "going"
                ? Math.max(0, current.spotsFilled - 1)
                : current.spotsFilled,
            spotsTotal: current.spotsTotal,
          },
        }));
        return true;
      }

      setPending((prev) => [...prev, id]);
      try {
        await cancelRequest(id);
        // DELETE answers 204, so there are no counts to take from it. Drop to a
        // locally-derived number and let the invalidated queries correct it —
        // the server may also have promoted someone off the waitlist into the
        // seat just freed, which only a refetch can show.
        setState((prev) => ({
          ...prev,
          [id]: {
            status: null,
            spotsFilled:
              current.status === "going"
                ? Math.max(0, current.spotsFilled - 1)
                : current.spotsFilled,
            spotsTotal: current.spotsTotal,
          },
        }));
        invalidate(id);
        return true;
      } catch (err) {
        logError(err, { scope: "workshops.rsvp.cancel" });
        return false;
      } finally {
        setPending((prev) => prev.filter((p) => p !== id));
      }
    },
    [demoMode, state, invalidate],
  );

  const isPending = useCallback(
    (id: string) => pending.includes(id),
    [pending],
  );

  return useMemo(
    () => ({ getRsvp, rsvpWorkshop, cancelRsvp, isPending }),
    [getRsvp, rsvpWorkshop, cancelRsvp, isPending],
  );
}
