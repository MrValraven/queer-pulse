import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MemberSelectPerson } from "../../shared/components/ui";
import {
  hasFailedWithoutData,
  isRetryingFailedRead,
} from "../admin/queryLoadFailure";
import { eventKeys } from "./api/eventKeys";
import type { useRsvpInvites } from "./api/useRsvpInvites";
import { remainingInviteSlots } from "./rsvpGuestCap";

type RsvpInvitesQuery = ReturnType<typeof useRsvpInvites>;

/**
 * Did the member's invite list fail with nothing loaded, and is a retry of
 * that failure running? A background refetch that fails keeps the loaded
 * list, so it counts as neither. Read from the cache entry `useRsvpInvites`
 * already observes, so the caller re-renders on every change it reads.
 */
function useInvitesLoadFailure(slug: string) {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const state = queryClient.getQueryState(
    eventKeys.rsvpInvites(slug, demoMode),
  );
  if (!state) return { isLoadError: false, isRetrying: false };
  const loadState = {
    data: state.data,
    isError: state.status === "error",
    fetchStatus: state.fetchStatus,
    errorUpdateCount: state.errorUpdateCount,
  };
  return {
    isLoadError: hasFailedWithoutData(loadState),
    isRetrying: isRetryingFailedRead(loadState),
  };
}

/**
 * The RSVP modal's "Bring people from QueerPulse" draft: the seats left, and
 * the connections picked but not yet invited. The picks live with the modal,
 * so its one Save sends them after the RSVP details, and the seat icons above
 * can count them.
 *
 * Picks are capped at the seats left. When a raised guest count takes seats
 * away, the newest picks are unpicked for good and `trimmedCount` says how
 * many. When inviting stops altogether (cutoff, the list not loaded, the
 * section folded away) the picks clear without that line.
 */
export function useRsvpInviteDraft({
  slug,
  invitesQuery,
  savedGuestCount,
  currentGuestCount,
  isInviteClosed,
  canInviteConnections,
}: {
  slug: string;
  invitesQuery: RsvpInvitesQuery;
  savedGuestCount: number;
  currentGuestCount: number;
  isInviteClosed: boolean;
  canInviteConnections: boolean;
}) {
  const { invites, openInviteCount, isPending, refetch } = invitesQuery;
  const { isLoadError, isRetrying } = useInvitesLoadFailure(slug);
  // Seats are offered only once the open invites are known, so a list still
  // loading or never loaded never hands out a seat an invite already holds.
  const isInvitable =
    canInviteConnections && !isInviteClosed && !isPending && !isLoadError;
  const remainingSlots = isInvitable
    ? remainingInviteSlots({
        savedGuestCount,
        currentGuestCount,
        openInviteCount,
      })
    : 0;
  // A person the hosts declined may be invited again, so only their row
  // stays in the pool.
  const excludeSlugs = useMemo(
    () =>
      invites
        .filter((invite) => invite.status !== "host_declined")
        .map((invite) => invite.slug)
        .filter(Boolean),
    [invites],
  );

  // Everyone picked at any point, kept on untick, so a pinned row unticked
  // under another search can be ticked again.
  const [everPickedPeople, setEverPickedPeople] = useState<
    Map<string, MemberSelectPerson>
  >(() => new Map());
  const [pickedSlugs, setPickedSlugs] = useState<Set<string>>(() => new Set());
  const [trimmedCount, setTrimmedCount] = useState(0);

  // The picks that still count: an invitee who is now excluded drops out.
  const keptPicks = useMemo(() => {
    const excluded = new Set(excludeSlugs);
    return [...pickedSlugs].flatMap((pickedSlug) => {
      const person = everPickedPeople.get(pickedSlug);
      return person && !excluded.has(pickedSlug) ? [person] : [];
    });
  }, [pickedSlugs, everPickedPeople, excludeSlugs]);
  const activePicks = useMemo(
    () => keptPicks.slice(0, remainingSlots),
    [keptPicks, remainingSlots],
  );
  // Adjusted during render, so a seat that frees up later never brings an
  // unpicked person back.
  const overflowCount = keptPicks.length - activePicks.length;
  if (!isInvitable && (pickedSlugs.size > 0 || trimmedCount > 0)) {
    setPickedSlugs(new Set());
    setTrimmedCount(0);
  } else if (isInvitable && overflowCount > 0) {
    setPickedSlugs(new Set(activePicks.map((person) => person.slug)));
    setTrimmedCount(overflowCount);
  }
  const selected = useMemo(
    () => new Set(activePicks.map((person) => person.slug)),
    [activePicks],
  );

  /** Ticks or unticks one connection. `person` is the row from the current
   *  results; a pinned pick from an earlier search is found by its slug. */
  const togglePick = (memberSlug: string, person?: MemberSelectPerson) => {
    if (selected.has(memberSlug)) {
      setPickedSlugs((previous) => {
        const next = new Set(previous);
        next.delete(memberSlug);
        return next;
      });
      return;
    }
    const picked = person ?? everPickedPeople.get(memberSlug);
    if (!picked || selected.size >= remainingSlots) return;
    setEverPickedPeople((previous) =>
      new Map(previous).set(memberSlug, picked),
    );
    // Rebuilt from the active picks, so an excluded pick leaves state too.
    setPickedSlugs(new Set([...selected, memberSlug]));
    // A fresh pick answers the unpicked line, so it folds away.
    setTrimmedCount(0);
  };

  const clearPicks = () => {
    setPickedSlugs(new Set());
    setEverPickedPeople(new Map());
    setTrimmedCount(0);
  };

  return {
    invites,
    openInviteCount,
    isInvitesPending: isPending,
    isLoadError,
    isRetrying,
    retry: refetch,
    isInvitable,
    remainingSlots,
    excludeSlugs,
    activePicks,
    selected,
    trimmedCount,
    togglePick,
    clearPicks,
  };
}

export type RsvpInviteDraft = ReturnType<typeof useRsvpInviteDraft>;
