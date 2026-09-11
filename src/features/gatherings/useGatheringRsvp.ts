import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { gatheringHasEnded, type GatheringDetail } from "./data";
import { useRsvp, useUnrsvp } from "./api/useEventMutations";
import { rsvpErrorMessage } from "./rsvpErrors";
import { useHasRsvpCutoffPassed } from "./rsvpCutoff";

export type RsvpStatus = GatheringDetail["myRsvpStatus"];

export interface GatheringRsvpState {
  /** The viewer's current standing, optimistically ahead of the server. */
  status: RsvpStatus;
  /** Holding a seat or a waitlist place — the "you're in" states. */
  isConfirmed: boolean;
  isWaitlisted: boolean;
  isMaybe: boolean;
  /** A mutation is in flight; every action button disables on this. */
  isPending: boolean;
  /**
   * Can the viewer still act on this gathering at all?
   *
   * False once it is cancelled or over. Both are server-enforced — a cancelled
   * event and a past one each answer an RSVP with a 400 — so a button that is
   * still live here is a button that lies (PRD-181, PRD-183).
   */
  canRsvp: boolean;
  isCancelled: boolean;
  hasEnded: boolean;
  /**
   * The host's RSVP cutoff has passed on a gathering that is still on
   * (Create Gathering v2). The server refuses a new RSVP, a maybe and a
   * waitlist join from here, while cancelling and editing your details keep
   * working, so a member already coming keeps their own panel. Always false
   * for the host and co-hosts, whom the server exempts from the cutoff.
   */
  isRsvpClosed: boolean;
  /** When RSVPs close, or null when the host set no cutoff. */
  rsvpClosesAt: Date | null;
  /** RSVP, or join the waitlist when the gathering is full. */
  goOrWaitlist: () => void;
  /** Mark interest without taking a seat (PRD-188). */
  markMaybe: () => void;
  /** Withdraw whatever standing the viewer holds. */
  cancelRsvp: () => void;
}

/**
 * The gathering detail's RSVP state machine, in one place.
 *
 * The page hero and the sidebar control are two views of the SAME decision,
 * and each used to carry its own copy of this logic — its own optimistic
 * mirror, its own full/waitlist branch, its own error handling. Two copies of
 * a state machine drift, and these had already started to: only one of them
 * knew about "maybe".
 *
 * OPTIMISTIC MIRROR. `useRsvp`/`useUnrsvp` no-op the network call in demo, so
 * the confirmed state has to be held locally and re-synced when a live refetch
 * resolves new server truth — the same pattern `GatheringBookmarkButton` uses.
 * The re-sync is done during render (React's documented way to reset state
 * when a prop changes) rather than in an effect, so it lands in the same
 * commit instead of a follow-up render.
 */
export function useGatheringRsvp(
  gathering: GatheringDetail,
): GatheringRsvpState {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const rsvp = useRsvp(gathering.slug);
  const unrsvp = useUnrsvp(gathering.slug);

  const serverStatus = gathering.myRsvpStatus ?? null;
  const [previousServerStatus, setPreviousServerStatus] =
    useState<RsvpStatus>(serverStatus);
  const [status, setStatus] = useState<RsvpStatus>(serverStatus);
  if (previousServerStatus !== serverStatus) {
    setPreviousServerStatus(serverStatus);
    setStatus(serverStatus);
  }

  const isCancelled = gathering.cancelled === true;
  // LIVE ONLY. The demo registry's gatherings are hand-dated and drift into the
  // past as the calendar moves — every one of them is already behind us — so
  // reading the clock there would switch the prototype's whole RSVP flow off
  // and replace it with "this gathering has ended". The demo is a walkthrough
  // of how the surface behaves, not a real calendar, so it keeps behaving.
  // Nothing is lost: a demo RSVP reaches no server, and the live path is where
  // a past-gathering RSVP actually mattered (the server now refuses it).
  const hasEnded = !demoMode && gatheringHasEnded(gathering);
  const canRsvp = !isCancelled && !hasEnded;
  // Live only, for the same reason as `hasEnded`. The demo registry carries no
  // cutoff today, and a hand-dated one would drift into the past with it.
  const rsvpClosesAt = gathering.rsvpClosesAt ?? null;
  const hasCutoffPassed = useHasRsvpCutoffPassed(rsvpClosesAt);
  // The host and co-hosts are exempt, exactly as on the server (`RsvpService`
  // skips `assertRsvpsOpen` for an organiser), so their own controls stay live
  // past the cutoff. The sidebar note still tells them when members were cut off.
  const isRsvpClosed =
    canRsvp &&
    !demoMode &&
    hasCutoffPassed &&
    gathering.viewerIsOrganizer !== true;

  const revert = () => setStatus(gathering.myRsvpStatus ?? null);
  // A refusal (barred, blocked in either direction, cancelled, already over)
  // is surfaced as a plain sentence rather than a silent no-op that leaves the
  // button looking broken. It never names who decided it — see `rsvpErrors.ts`.
  const onError = (error: unknown) => {
    revert();
    showToast(rsvpErrorMessage(error, t), "error");
  };

  const goOrWaitlist = () => {
    if (isRsvpClosed) return;
    // A full gathering puts the member on the waitlist, so the mutation is
    // told that up front: the request body is still "going", but the
    // optimistic going head-count must not bump (see `RsvpIntent`).
    const next: "going" | "waitlisted" = gathering.isFull
      ? "waitlisted"
      : "going";
    setStatus(next);
    rsvp.mutate(next, {
      onSuccess: () =>
        showToast(
          t(
            next === "waitlisted"
              ? "gatherings:rsvpControl.waitlistToast"
              : "gatherings:rsvpControl.goingToast",
          ),
          "success",
        ),
      onError,
    });
  };

  const markMaybe = () => {
    if (isRsvpClosed) return;
    setStatus("maybe");
    rsvp.mutate("maybe", {
      onSuccess: () =>
        showToast(t("gatherings:rsvpControl.maybeToast"), "success"),
      onError,
    });
  };

  const cancelRsvp = () => {
    setStatus(null);
    unrsvp.mutate(undefined, {
      onSuccess: () =>
        showToast(t("gatherings:rsvpControl.cancelledToast"), "success"),
      onError: revert,
    });
  };

  return {
    status,
    isConfirmed: status === "going" || status === "waitlisted",
    isWaitlisted: status === "waitlisted",
    isMaybe: status === "maybe",
    isPending: rsvp.isPending || unrsvp.isPending,
    canRsvp,
    isCancelled,
    hasEnded,
    isRsvpClosed,
    rsvpClosesAt,
    goOrWaitlist,
    markMaybe,
    cancelRsvp,
  };
}
