/**
 * React-query hooks for the join wizard and the mod queue's triage, paired with
 * `communityJoin.api.ts`. Kept beside it, outside the shared mutations
 * file, so the house-rules + decline-kind fields have one home.
 */
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getLiving } from "../livingCommunities.data";
import {
  getCommunityRules,
  joinCommunityWithRules,
  joinRefusalFor,
  triageJoinRequest,
  withdrawMyJoinRequest,
  type JoinCommunityPayload,
  type JoinResultDTO,
  type TriageJoinRequestPayload,
} from "./communityJoin.api";

/** The community's covenant as every rules surface needs it. */
export interface CommunityRulesState {
  /** Preset rules are i18n KEYS; custom ones are member-written text. Render
   *  through the `RULE_PRESET_KEYS.includes(rule)` test, every time. */
  rules: string[];
  hasRules: boolean;
  /** The version to send as `acceptedRulesVersion` when joining. */
  rulesVersion: number;
  /** The version the viewer last agreed to, or null when they never did. */
  acceptedVersion: number | null;
  isLoading: boolean;
  refetch: () => void;
}

const NO_RULES: CommunityRulesState = {
  rules: [],
  hasRules: false,
  rulesVersion: 1,
  acceptedVersion: null,
  isLoading: false,
  refetch: () => {},
};

/**
 * A community's house rules plus the two version numbers the join flow and the
 * "rules changed" prompt both key off.
 *
 * Demo mode reads the mock registry's authored rules and reports the viewer as
 * fully up to date, so the prototype never nags about a version bump that has
 * no backend behind it. Live reads `GET /communities/:slug/rules` (PRD-410).
 * The detail read answers a gated outsider (an applicant, an invitee) with a
 * 403, which left the wizard with no rules to show, no version to send, and a
 * join the server then refused for missing rules acceptance. The rules route
 * is visible to anyone who can see the gate card, so the applicant reads the
 * covenant at the door and agrees to the version the server will check.
 */
export function useCommunityRules(
  slug: string | undefined,
): CommunityRulesState {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["community-rules", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCommunityRules(slug!),
  });

  if (demoMode) {
    const rules = getLiving(slug)?.rules ?? [];
    return {
      ...NO_RULES,
      rules,
      hasRules: rules.length > 0,
      acceptedVersion: 1,
    };
  }
  const data = query.data;
  if (!data)
    return {
      ...NO_RULES,
      isLoading: query.isLoading,
      refetch: () => void query.refetch(),
    };
  return {
    rules: data.rules ?? [],
    hasRules: (data.rules ?? []).length > 0,
    rulesVersion: data.rulesVersion ?? 1,
    acceptedVersion: data.rulesAcceptedVersion ?? null,
    isLoading: false,
    refetch: () => void query.refetch(),
  };
}

/**
 * POST /communities/:slug/join with the full payload: the applicant's own
 * words, their involvement answer as a real field, and the house-rules version
 * they agreed to. Errors stay silent app-wide because the wizard renders the
 * refusal itself (rules changed, banned, reapply wait, pause, pending
 * request, parent first), inline and in the viewer's language.
 */
export function useJoinCommunityWithRules(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<JoinResultDTO | null, Error, JoinCommunityPayload>({
    meta: { silentError: true },
    mutationFn: async (payload) => {
      if (demoMode) return null;
      return joinCommunityWithRules(slug, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({
        queryKey: ["community-rules", slug],
      });
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["join-requests", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      // A space's card on its parent's Spaces tab shows the viewer's own
      // roster row, so the parent's list refreshes too.
      void queryClient.invalidateQueries({ queryKey: ["subcommunities"] });
      // The gate card carries the caller's own request status, so a gated
      // outsider who just asked sees "requested" there on the next render.
      void queryClient.invalidateQueries({
        queryKey: ["community-gate-card", slug],
      });
      // A join spends the caller's invitation on every tier but public, so
      // the gate stops offering Accept and the hub's invitations shelf drops
      // the spent row.
      void queryClient.invalidateQueries({
        queryKey: ["my-community-invites"],
      });
    },
    // A coded refusal means the surface that offered the join was stale: it
    // said "Ask to join" to somebody whose request is already in, or "Join"
    // on a community that has since paused. Refreshing the gate card, the
    // detail and the lists puts the true state behind the refusal panel, so
    // Close lands on a page that agrees with it. A rules change is left out:
    // the wizard re-reads the rules and asks again in place.
    onError: (error) => {
      const refusal = joinRefusalFor(error);
      if (!refusal || refusal.kind === "rulesChanged") return;
      void queryClient.invalidateQueries({
        queryKey: ["community-gate-card", slug],
      });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
}

/**
 * `DELETE /communities/:slug/join-requests/mine` (PRD-148): withdraw the
 * caller's own pending request.
 *
 * The hero's "Requested" button used to be a disabled label with no way out:
 * an applicant who changed their mind, or who asked the wrong community, could
 * only wait for a decision. Withdrawing before a decision also keeps a
 * `not_now`/`not_a_fit` decline (and its 30 or 180 day reapply lock) from ever
 * being written, which is the part that actually costs the member something.
 *
 * Demo mode is a no-op here: the demo request lives in the membership store,
 * so a demo surface withdraws it there with `withdrawRequest(slug)` from
 * `useCommunityMembership` (the gate card does this itself) and never calls
 * this hook's network path.
 *
 * Every withdraw of one slug runs under `withdrawJoinRequestMutationKey`, so
 * a surface that mounts later (the join wizard reopened while a withdraw is
 * parked offline) can see it through `useIsWithdrawingJoinRequest` and hold
 * its own Withdraw back.
 */
export function useWithdrawJoinRequest(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationKey: withdrawJoinRequestMutationKey(slug),
    // The confirm dialog reports its own failure next to the action.
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) return;
      await withdrawMyJoinRequest(slug);
    },
    onSuccess: () => {
      // The detail DTO carries `myJoinRequestStatus`, which is what flips the
      // hero back to "Ask to join"; the community's own queue drops the row.
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["join-requests", slug] });
      // A gated outsider withdraws from the gate card, which reads the same
      // status off its own query.
      void queryClient.invalidateQueries({
        queryKey: ["community-gate-card", slug],
      });
    },
  });
}

/** The mutation key every withdraw of `slug`'s pending request runs under. */
export function withdrawJoinRequestMutationKey(slug: string) {
  return ["community-withdraw-join-request", slug] as const;
}

/**
 * Whether a withdraw of `slug`'s pending request is in flight anywhere in the
 * app, from any surface. A withdraw react-query parked while offline counts
 * too: a paused mutation keeps its `pending` status until it runs.
 */
export function useIsWithdrawingJoinRequest(slug: string): boolean {
  return (
    useIsMutating({ mutationKey: withdrawJoinRequestMutationKey(slug) }) > 0
  );
}

/** PATCH /communities/:slug/join-requests/:id: approve, or decline with the
 *  kind of "no" and the note the applicant will read. */
export function useTriageJoinRequest(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string } & TriageJoinRequestPayload>({
    // The mod queue rolls its own optimistic row back and toasts the reason,
    // so the app-wide handler must not stack a second toast on top.
    meta: { silentError: true },
    mutationFn: async ({ id, ...payload }) => {
      if (demoMode) return;
      await triageJoinRequest(slug, id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests", slug] });
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}
