import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  acceptLineupInvite,
  declineLineupInvite,
  getLineupInvite,
  type EventLineupDTO,
  type LineupInviteDTO,
} from "./events.api";
import { eventKeys } from "./eventKeys";
import { recordDemoInviteAnswer } from "./eventLineup.mock";

/** The lineup with the viewer's own row set to the answered status. */
function answerViewerEntry(
  lineup: EventLineupDTO,
  outcome: "accepted" | "declined",
): EventLineupDTO {
  if (!lineup.viewerEntry) return lineup;
  const answered = { ...lineup.viewerEntry, status: outcome };
  const isListed = lineup.entries.some((entry) => entry.slug === answered.slug);
  const entries = isListed
    ? lineup.entries.map((entry) =>
        entry.slug === answered.slug ? answered : entry,
      )
    : outcome === "accepted"
      ? [...lineup.entries, answered]
      : lineup.entries;
  return { entries, viewerEntry: answered };
}

/** `GET /event-lineup-invites/:id`. Demo resolves any id to the mock invite,
 *  loaded lazily so it ships in its own chunk that live sessions never
 *  fetch. */
export function useLineupInvite(entryId: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<LineupInviteDTO>({
    queryKey: eventKeys.lineupInvite(entryId, demoMode),
    enabled: Boolean(entryId),
    retry: false,
    ...(demoMode ? { staleTime: Infinity } : {}),
    queryFn: async () => {
      if (demoMode || !entryId) {
        const { demoLineupInvite } = await import("./lineupInvite.mock");
        return demoLineupInvite(entryId ?? "demo");
      }
      return getLineupInvite(entryId);
    },
  });
}

/**
 * Accept or decline a lineup invite, from the invite page or the gathering
 * page banner. On success, patches both the invite and the gathering's
 * lineup cache so either surface updates at once. Demo also records the
 * answer in the mock, so a surface whose cache never loaded builds it
 * answered. Live mode refetches both once settled, so a failed answer
 * (already answered, withdrawn) also refreshes the stale invite.
 */
export function useRespondLineupInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { entryId: string; slug: string; outcome: "accepted" | "declined" }
  >({
    meta: { silentError: true },
    mutationFn: async ({ entryId, slug, outcome }) => {
      if (demoMode) {
        recordDemoInviteAnswer(slug, outcome);
        return undefined;
      }
      return outcome === "accepted"
        ? acceptLineupInvite(entryId)
        : declineLineupInvite(entryId);
    },
    onSuccess: (_data, { entryId, slug, outcome }) => {
      queryClient.setQueryData<LineupInviteDTO>(
        eventKeys.lineupInvite(entryId, demoMode),
        (invite) => (invite ? { ...invite, status: outcome } : invite),
      );
      queryClient.setQueryData<EventLineupDTO>(
        eventKeys.lineup(slug, demoMode),
        (lineup) => (lineup ? answerViewerEntry(lineup, outcome) : lineup),
      );
    },
    onSettled: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: eventKeys.lineupRoot });
        void queryClient.invalidateQueries({
          queryKey: eventKeys.lineupInviteRoot,
        });
      }
    },
  });
}
