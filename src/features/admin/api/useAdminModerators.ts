import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addAdminCommunityModerator,
  getAdminCommunityModeratorCandidates,
  removeAdminCommunityModerator,
  type AdminModeratorCandidateDTO,
} from "./adminCommunities.api";

const ADMIN_COMMUNITIES_KEY = "admin-communities";

/**
 * Moderator management for the admin communities panel
 * (`AdminCommunitySettings`). These hooks are LIVE-only — demo mode keeps its
 * simulated local-state behaviour in the component, so nothing here ever fires
 * on the network in demo. Every mutation invalidates the shared
 * `["admin-communities"]` prefix, so the detail query re-reads the real
 * moderator roster (and the candidate list re-filters) after a change.
 */

/**
 * The roster members eligible to be promoted to moderator. `enabled` gates the
 * fetch to when the add-moderator picker is actually open (live mode only) so
 * the admin-only endpoint isn't hit on every settings render.
 */
export function useModeratorCandidates(slug: string, enabled: boolean) {
  return useQuery<AdminModeratorCandidateDTO[]>({
    queryKey: [ADMIN_COMMUNITIES_KEY, "candidates", slug],
    enabled,
    queryFn: () => getAdminCommunityModeratorCandidates(slug),
  });
}

/** Promote a roster member (by user id) to moderator. */
export function useAddModerator(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, { memberId: string }>({
    mutationKey: [ADMIN_COMMUNITIES_KEY, "add-moderator", slug],
    mutationFn: ({ memberId }) => addAdminCommunityModerator(slug, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_COMMUNITIES_KEY] });
    },
  });
}

/** Demote a moderator (by user id) back to a plain member. */
export function useRemoveModerator(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, { memberId: string }>({
    mutationKey: [ADMIN_COMMUNITIES_KEY, "remove-moderator", slug],
    mutationFn: ({ memberId }) => removeAdminCommunityModerator(slug, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_COMMUNITIES_KEY] });
    },
  });
}
