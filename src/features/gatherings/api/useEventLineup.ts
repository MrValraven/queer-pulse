import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  changeLineupRole,
  getEventLineup,
  inviteToLineup,
  leaveLineup,
  removeFromLineup,
  type EventLineupDTO,
  type EventLineupEntryDTO,
} from "./events.api";
import { eventKeys } from "./eventKeys";
import { demoEventLineup } from "./eventLineup.mock";

/** Who the host is inviting, as the picker knows them. */
export interface LineupPerson {
  slug: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * An event's lineup: `GET /events/:slug/lineup`. Organizers receive every
 * row with its status, everyone else accepted rows only, and `viewerEntry`
 * is the caller's own row in any status. Fires only for an active session
 * (the route sits behind `ActiveMemberGuard`). Demo serves a mock and never
 * goes stale, so the host's demo edits survive a remount.
 */
export function useEventLineup(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const isActiveSession = !checking && loggedIn && status === "active";

  return useQuery<EventLineupDTO>({
    queryKey: eventKeys.lineup(slug, demoMode),
    enabled: Boolean(slug) && (demoMode || isActiveSession),
    retry: false,
    ...(demoMode ? { staleTime: Infinity } : {}),
    queryFn: async () => {
      if (demoMode || !slug) return demoEventLineup(slug);
      return getEventLineup(slug);
    },
  });
}

/**
 * Shared shape of every organizer or performer lineup write: patch the
 * cached lineup at once, roll back on failure, take the server's lineup when
 * it returns one, and refetch afterwards in live mode. Demo skips the
 * network and the refetch, so the optimistic state is the state.
 */
function useLineupWrite<TVariables>(
  slug: string,
  liveRequest: (
    variables: TVariables,
  ) => Promise<EventLineupDTO | { ok: true }>,
  optimisticUpdate: (
    lineup: EventLineupDTO,
    variables: TVariables,
  ) => EventLineupDTO,
) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const lineupKey = eventKeys.lineup(slug, demoMode);
  const writeMutationKey = ["event-lineup-write", slug];
  // Inside a mutation's own callbacks it still counts as pending, so a count
  // of one means no other lineup write is in flight.
  const isLastWriteInFlight = () =>
    queryClient.isMutating({ mutationKey: writeMutationKey }) <= 1;

  return useMutation<
    EventLineupDTO | { ok: true } | undefined,
    Error,
    TVariables,
    { previous: EventLineupDTO | undefined }
  >({
    mutationKey: writeMutationKey,
    // Callers toast their own errors, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (variables) =>
      demoMode ? undefined : liveRequest(variables),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: lineupKey });
      const previous = queryClient.getQueryData<EventLineupDTO>(lineupKey);
      if (previous) {
        queryClient.setQueryData(
          lineupKey,
          optimisticUpdate(previous, variables),
        );
      }
      return { previous };
    },
    // With other writes in flight a rollback would wipe their patches, so
    // the last write's invalidation reconciles instead.
    onError: (_error, _variables, context) => {
      if (context?.previous && isLastWriteInFlight()) {
        queryClient.setQueryData(lineupKey, context.previous);
      }
    },
    onSuccess: (data) => {
      if (data && "entries" in data && isLastWriteInFlight()) {
        queryClient.setQueryData(lineupKey, data);
      }
    },
    onSettled: () => {
      if (!demoMode && isLastWriteInFlight()) {
        void queryClient.invalidateQueries({ queryKey: eventKeys.lineupRoot });
      }
    },
  });
}

function withEntry(
  lineup: EventLineupDTO,
  slug: string,
  update: (entry: EventLineupEntryDTO) => EventLineupEntryDTO,
): EventLineupDTO {
  const entries = lineup.entries.map((entry) =>
    entry.slug === slug ? update(entry) : entry,
  );
  const viewerEntry =
    lineup.viewerEntry?.slug === slug
      ? update(lineup.viewerEntry)
      : lineup.viewerEntry;
  return { entries, viewerEntry };
}

/** POST /events/:slug/lineup. Re-inviting a declined row flips it back to
 *  pending in place; anyone else is appended as pending. */
export function useInviteToLineup(slug: string) {
  return useLineupWrite<{ person: LineupPerson; role: string }>(
    slug,
    ({ person, role }) =>
      inviteToLineup(slug, { memberSlug: person.slug, role }),
    (lineup, { person, role }) => {
      const isAlreadyListed = lineup.entries.some(
        (entry) => entry.slug === person.slug,
      );
      if (isAlreadyListed) {
        return withEntry(lineup, person.slug, (entry) => ({
          ...entry,
          role,
          status: "pending",
        }));
      }
      return {
        ...lineup,
        entries: [
          ...lineup.entries,
          {
            id: `optimistic-${person.slug}`,
            slug: person.slug,
            name: person.name,
            avatarUrl: person.avatarUrl,
            role,
            status: "pending",
          },
        ],
      };
    },
  );
}

/** PATCH /events/:slug/lineup/:memberSlug. */
export function useChangeLineupRole(slug: string) {
  return useLineupWrite<{ memberSlug: string; role: string }>(
    slug,
    ({ memberSlug, role }) => changeLineupRole(slug, memberSlug, role),
    (lineup, { memberSlug, role }) =>
      withEntry(lineup, memberSlug, (entry) => ({ ...entry, role })),
  );
}

/** DELETE /events/:slug/lineup/:memberSlug: remove a row or withdraw an
 *  invite. Callers host any confirm dialog OUTSIDE the row, because this
 *  drops the row from the cache before the request settles. */
export function useRemoveFromLineup(slug: string) {
  return useLineupWrite<{ memberSlug: string }>(
    slug,
    ({ memberSlug }) => removeFromLineup(slug, memberSlug),
    (lineup, { memberSlug }) => ({
      entries: lineup.entries.filter((entry) => entry.slug !== memberSlug),
      viewerEntry:
        lineup.viewerEntry?.slug === memberSlug ? null : lineup.viewerEntry,
    }),
  );
}

/** POST /events/:slug/lineup/leave: the performer takes themselves off. */
export function useLeaveLineup(slug: string) {
  return useLineupWrite<void>(
    slug,
    () => leaveLineup(slug),
    (lineup) => {
      const viewerSlug = lineup.viewerEntry?.slug;
      return {
        entries: lineup.entries.filter((entry) => entry.slug !== viewerSlug),
        viewerEntry: null,
      };
    },
  );
}
