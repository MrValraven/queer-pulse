import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { eventKeys } from "../../gatherings/api/eventKeys";
import type {
  ProfileEventItem,
  ProfileEventsVM,
} from "./profileEvents.adapters";
import { getProfileEvents } from "./profileEvents.api";
import { isMemberMissingError, useMemberProfile } from "./useMemberProfile";

/** One shared empty list, so an unloaded section hands out a stable value. */
const NO_EVENTS: ProfileEventItem[] = [];

export interface ProfileEventsResult {
  /** Soonest first, at most 12. Empty until the fetch lands. */
  upcoming: ProfileEventItem[];
  /** Latest first, at most 6. */
  past: ProfileEventItem[];
  /** True while the fetch is out, so an empty list says nothing yet. */
  isPending: boolean;
  /** True when the fetch failed with nothing loaded, for a reason worth a
   *  retry panel. */
  isError: boolean;
  /** True while a retry after a failure runs. The error panel stays up. */
  isRetrying: boolean;
  /** The failure behind `isError`, kept through a retry, so the panel can
   *  name its cause. Null when nothing failed. */
  error: unknown;
  /** True when the server says this profile is not there for the viewer
   *  (404 or 403). The section then renders nothing. */
  isMissing: boolean;
  /** Re-runs the failed fetch, for the error panel's retry button. */
  refetch: () => void;
  /** A limited profile shows no events and makes no request. */
  isLimited: boolean;
}

/**
 * The events a member hosts or co-hosts, for the profile's Events section and
 * the rail's jump link. Demo matches the board registry to its hosts; live
 * calls `GET /profiles/:slug/events`. The limited flag comes from the same
 * `useMemberProfile` cache the page already filled, so it costs no request,
 * and the owner's own profile is never limited.
 */
export function useProfileEvents(
  slug: string,
  isSelf: boolean,
): ProfileEventsResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const profileQuery = useMemberProfile(isSelf ? undefined : slug);
  const isLimited = !isSelf && (profileQuery.data?.limited ?? false);
  // Hoisted because `isPending` reads it too: react-query reports a disabled
  // query as pending forever.
  const isQueryEnabled = slug !== "" && !isLimited;
  const eventsQuery = useQuery<ProfileEventsVM>({
    queryKey: eventKeys.byMember(slug, demoMode),
    enabled: isQueryEnabled,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoProfileEvents } = await import("../profileEvents.demo");
        return demoProfileEvents(slug, new Date());
      }
      const [dto, { toProfileEventsVM }] = await Promise.all([
        getProfileEvents(slug, signal),
        import("./profileEvents.adapters"),
      ]);
      return toProfileEventsVM(dto, t);
    },
  });

  // `refetch` off react-query is referentially stable, so this one is too.
  const { refetch: refetchEvents } = eventsQuery;
  const refetch = useCallback(() => {
    void refetchEvents();
  }, [refetchEvents]);

  // A refetch of a query that never held data puts it back to pending and
  // clears its error. `errorUpdatedAt` survives that reset, so it tells a
  // retry after a failure apart from the first load, and the section keeps
  // its error panel up (with the retry button busy) while the retry runs.
  const hasNoData = eventsQuery.data === undefined;
  const isRetrying =
    isQueryEnabled &&
    hasNoData &&
    eventsQuery.isFetching &&
    eventsQuery.errorUpdatedAt > 0;
  // The last failure, held through the retry so the panel's copy stays put.
  // Updated during render, React's pattern for state derived from props.
  const [lastError, setLastError] = useState<unknown>(null);
  if (eventsQuery.error && eventsQuery.error !== lastError) {
    setLastError(eventsQuery.error);
  }
  const isMissing = isMemberMissingError(eventsQuery.error);
  return {
    upcoming: isLimited ? NO_EVENTS : (eventsQuery.data?.upcoming ?? NO_EVENTS),
    past: isLimited ? NO_EVENTS : (eventsQuery.data?.past ?? NO_EVENTS),
    isPending: isQueryEnabled && eventsQuery.isPending && !isRetrying,
    // Only a failure with nothing to show counts: a background refetch that
    // fails behind loaded rows keeps the rows on screen.
    isError: isQueryEnabled && eventsQuery.isError && hasNoData && !isMissing,
    isRetrying,
    error: eventsQuery.error ?? (isRetrying ? lastError : null),
    isMissing,
    refetch,
    isLimited,
  };
}

/**
 * Whether the Events section draws anything, for the rail's jump link. Mirrors
 * `ProfileEventsSection`: the owner always gets the section (rows or the "Host
 * an event" prompt), a visitor when there is a row or a retryable failure.
 * False while the first load is out, when the section is only a placeholder
 * with no `#events` to jump to.
 */
export function useProfileEventsVisible(slug: string, isSelf: boolean) {
  const {
    upcoming,
    past,
    isPending,
    isError,
    isRetrying,
    isMissing,
    isLimited,
  } = useProfileEvents(slug, isSelf);
  if (isLimited || isMissing || isPending) return false;
  return isSelf || upcoming.length + past.length > 0 || isError || isRetrying;
}
