import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  getEventLineup,
  replaceEventLineup,
  type EventLineupDTO,
  type LineupEntryInput,
} from "./events.api";
import { eventKeys } from "./eventKeys";
import { demoEventLineup } from "./eventLineup.mock";

/**
 * An event's lineup ("who performed") — the host-tagged bill `GET
 * /events/:slug/lineup` returns, plus the caller's own row if they're on it.
 * Demo mode returns a network-free mock; live mode calls the endpoint, which
 * sits behind `ActiveMemberGuard` like every other `/events` route, so the
 * query mirrors `useMyPersonaInvites`'s auth gate: only fire once the session
 * has settled and the member is signed in and active — a logged-out/visitor
 * viewer (or a suspended one) never hits it.
 */
export function useEventLineup(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const activeSession = !checking && loggedIn && status === "active";

  return useQuery<EventLineupDTO>({
    queryKey: eventKeys.lineup(slug, demoMode),
    enabled: Boolean(slug) && (demoMode || activeSession),
    retry: false,
    queryFn: async () => {
      if (demoMode || !slug) return demoEventLineup();
      return getEventLineup(slug);
    },
  });
}

/**
 * PUT /events/:slug/lineup — host/co-host replace-all. Demo is a no-op (the
 * host editor keeps its own optimistic local state, exactly like
 * `useEventMutations`'s cohost/invite mutations); live calls the endpoint and
 * seeds the query cache with the server's resolved response so the editor and
 * `GatheringPerformerNudge` both see the fresh lineup immediately.
 */
export function useReplaceLineup(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<EventLineupDTO | undefined, Error, LineupEntryInput[]>({
    // The lineup editor toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (entries) => {
      if (demoMode) return undefined;
      return replaceEventLineup(slug, entries);
    },
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(eventKeys.lineup(slug, demoMode), data);
      void queryClient.invalidateQueries({ queryKey: eventKeys.lineupRoot });
    },
  });
}
