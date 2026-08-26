import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  getJoinRequestStatus,
  isUnresolvableStatusToken,
  type JoinRequestStatusDTO,
} from "./joinRequest.api";

/**
 * The public endpoint is throttled at 20 requests/hour per IP, and the thing it
 * reports changes at human speed (a moderator reading a form, once). Five
 * minutes of freshness means a page left open, or revisited from a bookmark,
 * costs nothing — while still being far shorter than any decision takes.
 */
const STATUS_STALE_TIME_MS = 5 * 60 * 1000;

/** One retry for a genuine blip, never for an answer that will not change. */
const MAX_RETRIES = 1;

/**
 * Where an applicant's join request stands, keyed on their opaque status token.
 *
 * Demo mode resolves the colocated fixtures instead of touching the network, so
 * every display state is reviewable in the sandbox — see
 * `joinRequestStatus.data.ts` for the codes.
 *
 * `token` may be null (nothing in the query string, nothing in storage), in
 * which case the query stays idle and the page renders its paste-a-code form.
 */
export function useJoinRequestStatus(token: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<JoinRequestStatusDTO>({
    queryKey: ["join-request-status", demoMode, token],
    enabled: token !== null && token.length > 0,
    staleTime: STATUS_STALE_TIME_MS,
    // The page renders every failure itself, in one message that never reveals
    // whether a code exists. A global toast on top of that would both nag and
    // leak more than the page deliberately says.
    meta: { silentError: true },
    retry: (failureCount, error) => {
      // A 400 or 404 is the endpoint's answer, not a hiccup: retrying spends
      // the applicant's hourly allowance to be told the same thing again.
      if (isUnresolvableStatusToken(error)) return false;
      return failureCount < MAX_RETRIES;
    },
    queryFn: async () => {
      if (demoMode) {
        // Loaded on demand so the fixtures stay out of the live bundle.
        const { demoJoinRequestStatusFor } =
          await import("../joinRequestStatus.data");
        const fixture = demoJoinRequestStatusFor(token ?? "");
        // Mirrors the live miss exactly, so the not-found state is reachable
        // in the sandbox through the same branch it takes in production.
        if (!fixture) throw new ApiError(404, "No demo request for that code");
        return fixture;
      }
      return getJoinRequestStatus(token ?? "");
    },
  });
}
