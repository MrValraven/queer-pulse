import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoBanEvasionEscalation,
  demoBanEvasionFlags,
  DEMO_BAN_EVASION_ESCALATIONS,
} from "../communityBanEvasion.data";
import {
  COMMUNITY_BAN_EVASION_MAX_IDS,
  escalateCommunityBanEvasion,
  getCommunityBanEvasionEscalations,
  getCommunityBanEvasionFlags,
  type CommunityBanEvasionEscalationDTO,
  type CommunityBanEvasionFlagDTO,
} from "./communityBanEvasion.api";

/**
 * The join queue's ban-evasion flag and its escalation state, for a whole page
 * of rows in two requests (PRD-31).
 *
 * THE ONE RULE THIS FILE EXISTS TO KEEP: a failed or missing answer is never
 * collapsed into `false`. The flag has THREE outcomes, and the third one is
 * load-bearing. Telling a moderator that a known evader is clean because a
 * fetch dropped is a worse failure than telling them nothing, so "we could not
 * check" is a state of its own that the row renders as its own thing.
 *
 * `demoMode` is part of every cache key because the toggle flips at runtime:
 * nothing synthesized in demo may survive a switch to live and be read back as
 * a real match or a real escalation.
 */

/** What the row knows about one applicant. */
export type CommunityBanEvasionFlagState =
  /** The answer has not arrived yet. Not an answer. */
  | "checking"
  /** This applicant matches somebody THIS community banned. */
  | "matched"
  /** Answered, and no match here. The common case, and the row stays quiet. */
  | "clear"
  /** The request failed, or the id came back absent. NOT reassurance. */
  | "unavailable";

export interface CommunityBanEvasionRowState {
  flag: CommunityBanEvasionFlagState;
  /** The newest escalation raised on this row, open or resolved, or null when
   *  nobody has escalated it. */
  escalation: CommunityBanEvasionEscalationDTO | null;
  /** The escalation list has not arrived yet, so "was this already escalated?"
   *  has no answer. */
  isEscalationChecking: boolean;
  /** The escalation list failed. The button stays available (escalating twice
   *  is idempotent), and the row says the state could not be read. */
  isEscalationUnavailable: boolean;
}

export interface CommunityBanEvasionQueue {
  rowState: (joinRequestId: string) => CommunityBanEvasionRowState;
  /** Re-runs both reads, for the row-level "try again". */
  retry: () => void;
  escalate: (
    joinRequestId: string,
    note?: string,
  ) => Promise<CommunityBanEvasionEscalationDTO>;
  /** The join request an escalation is currently in flight for, or null. */
  escalatingId: string | null;
}

export const communityBanEvasionFlagsKey = (
  slug: string | undefined,
  demoMode: boolean,
  joinRequestIds: string[],
) =>
  [
    "community-ban-evasion-flags",
    slug,
    demoMode,
    // Sorted so that a queue re-ordering on its own does not look like a new
    // question. Adding a page of rows genuinely is one, and does refetch.
    [...joinRequestIds].sort().join(","),
  ] as const;

export const communityBanEvasionEscalationsKey = (
  slug: string | undefined,
  demoMode: boolean,
) => ["community-ban-evasion-escalations", slug, demoMode] as const;

/** The id list split into calls the backend will accept. Its
 *  `BAN_EVASION_MAX_SUBJECTS` is 60 and an oversized list is a 400, so a queue
 *  that has paged past that must not send one request. */
function chunkJoinRequestIds(joinRequestIds: string[]): string[][] {
  const chunks: string[][] = [];
  for (
    let start = 0;
    start < joinRequestIds.length;
    start += COMMUNITY_BAN_EVASION_MAX_IDS
  ) {
    chunks.push(
      joinRequestIds.slice(start, start + COMMUNITY_BAN_EVASION_MAX_IDS),
    );
  }
  return chunks;
}

/**
 * One page of the join queue's flags plus this community's escalations.
 *
 * Both reads carry `meta.silentError`: the row renders its own could-not-check
 * state, and an app-wide error toast on top of it would say the same thing
 * twice while telling a moderator nothing about WHICH row is unknown.
 */
export function useCommunityBanEvasion(
  slug: string | undefined,
  joinRequestIds: string[],
): CommunityBanEvasionQueue {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const hasRows = joinRequestIds.length > 0;

  const flagsQuery = useQuery<CommunityBanEvasionFlagDTO[]>({
    queryKey: communityBanEvasionFlagsKey(slug, demoMode, joinRequestIds),
    enabled: Boolean(slug) && hasRows,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) return demoBanEvasionFlags(joinRequestIds);
      const pages = await Promise.all(
        chunkJoinRequestIds(joinRequestIds).map((chunk) =>
          getCommunityBanEvasionFlags(slug!, chunk, signal),
        ),
      );
      return pages.flat();
    },
  });

  const escalationsQuery = useQuery<CommunityBanEvasionEscalationDTO[]>({
    queryKey: communityBanEvasionEscalationsKey(slug, demoMode),
    enabled: Boolean(slug) && hasRows,
    meta: { silentError: true },
    queryFn: ({ signal }) =>
      demoMode
        ? Promise.resolve(DEMO_BAN_EVASION_ESCALATIONS)
        : getCommunityBanEvasionEscalations(slug!, signal),
  });

  const escalateMutation = useMutation<
    CommunityBanEvasionEscalationDTO,
    Error,
    { joinRequestId: string; note?: string }
  >({
    // The row owns the failure copy, right where the moderator pressed.
    meta: { silentError: true },
    mutationFn: ({ joinRequestId, note }) =>
      demoMode
        ? Promise.resolve(demoBanEvasionEscalation(joinRequestId, note))
        : escalateCommunityBanEvasion(slug!, joinRequestId, note),
    onSuccess: (escalation) => {
      if (demoMode) {
        queryClient.setQueryData<CommunityBanEvasionEscalationDTO[]>(
          communityBanEvasionEscalationsKey(slug, true),
          (previous) => [
            escalation,
            ...(previous ?? []).filter(
              (row) => row.joinRequestId !== escalation.joinRequestId,
            ),
          ],
        );
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: communityBanEvasionEscalationsKey(slug, false),
      });
    },
  });

  // Keyed by join request. The flag response omits any id it could not resolve,
  // so a lookup that misses means "no answer", never "no match".
  const flagsById = new Map(
    (flagsQuery.data ?? []).map((flag) => [
      flag.joinRequestId,
      flag.isMatchingBannedMember,
    ]),
  );
  // Newest first off the wire, so the first row seen for a join request is the
  // current one. A resolved escalation with an older open one behind it would
  // otherwise read as still open.
  const escalationsById = new Map<string, CommunityBanEvasionEscalationDTO>();
  for (const escalation of escalationsQuery.data ?? []) {
    if (!escalationsById.has(escalation.joinRequestId)) {
      escalationsById.set(escalation.joinRequestId, escalation);
    }
  }

  const flagStateFor = (
    joinRequestId: string,
  ): CommunityBanEvasionFlagState => {
    if (flagsQuery.isError) return "unavailable";
    if (!flagsQuery.isSuccess) return "checking";
    const isMatching = flagsById.get(joinRequestId);
    if (isMatching === undefined) return "unavailable";
    return isMatching ? "matched" : "clear";
  };

  return {
    rowState: (joinRequestId) => ({
      flag: flagStateFor(joinRequestId),
      escalation: escalationsById.get(joinRequestId) ?? null,
      isEscalationChecking:
        !escalationsQuery.isSuccess && !escalationsQuery.isError,
      isEscalationUnavailable: escalationsQuery.isError,
    }),
    retry: () => {
      void flagsQuery.refetch();
      void escalationsQuery.refetch();
    },
    escalate: (joinRequestId, note) =>
      escalateMutation.mutateAsync({ joinRequestId, note }),
    escalatingId: escalateMutation.isPending
      ? (escalateMutation.variables?.joinRequestId ?? null)
      : null,
  };
}
