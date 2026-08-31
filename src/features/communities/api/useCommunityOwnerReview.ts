import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCommunityOwnerReview,
  openCommunityOwnerReview,
  withdrawCommunityOwnerReview,
  type CommunityOwnerReviewStateDTO,
} from "./communityOwnerReview.api";

/** Nothing filed and nothing flagged: the state a healthy community sits in,
 *  and what demo mode answers with (the mock has no review rows). */
const DEMO_STATE: CommunityOwnerReviewStateDTO = {
  request: null,
  needsOwnerReviewAt: null,
  canOpen: true,
  canWithdraw: false,
};

export interface CommunityOwnerReviewResult {
  state: CommunityOwnerReviewStateDTO | null;
  isLoading: boolean;
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

/**
 * `GET /communities/:slug/owner-review` — the open request if there is one,
 * the community's own review flag, and what this viewer may do about it.
 *
 * `canOpen`/`canWithdraw` come from the server, so the danger zone never
 * reimplements the role rules: filing is moderators and co-owners, withdrawal
 * is the filer or the owner.
 */
export function useCommunityOwnerReview(
  slug: string | undefined,
  enabled = true,
): CommunityOwnerReviewResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["community-owner-review", slug],
    enabled: !demoMode && enabled && Boolean(slug),
    queryFn: () => getCommunityOwnerReview(slug!),
  });

  if (demoMode) {
    return {
      state: DEMO_STATE,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }
  return {
    state: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** `POST /communities/:slug/owner-review` — file a request (moderators and
 *  co-owners). The reason is required by the backend. */
export function useOpenCommunityOwnerReview(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { reason: string }>({
    meta: { silentError: true },
    mutationFn: async ({ reason }) => {
      if (demoMode) return;
      await openCommunityOwnerReview(slug, reason);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["community-owner-review", slug],
      });
    },
  });
}

/** `DELETE /communities/:slug/owner-review` — withdraw the open request (the
 *  moderator who filed it, or the owner). */
export function useWithdrawCommunityOwnerReview(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) return;
      await withdrawCommunityOwnerReview(slug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["community-owner-review", slug],
      });
    },
  });
}
