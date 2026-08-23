/**
 * React-query hooks for the join wizard and the mod queue's triage, paired with
 * `communityJoin.api.ts`. Kept beside it (rather than in the shared mutations
 * file) so the house-rules + decline-kind fields have one home.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getLiving } from "../livingCommunities.data";
import {
  getCommunityRules,
  joinCommunityWithRules,
  triageJoinRequest,
  type JoinCommunityPayload,
  type JoinResultDTO,
  type TriageJoinRequestPayload,
} from "./communityJoin.api";

/** The community's covenant as every rules surface needs it. */
export interface CommunityRulesState {
  /** Preset rules are i18n KEYS; custom ones are member-written text. Render
   *  through the `RULE_PRESET_KEYS.includes(rule)` test, never blindly. */
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
 * no backend behind it. Live re-reads `GET /communities/:slug` under its own
 * query key: the detail hook maps the DTO straight to view-models and drops
 * these fields, and re-fetching one small document is cheaper than threading a
 * second shape through every adapter.
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
 * refusal itself (rules changed, banned, reapply wait), inline and in the
 * viewer's language.
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
    },
  });
}

/** PATCH /communities/:slug/join-requests/:id — approve, or decline with the
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
