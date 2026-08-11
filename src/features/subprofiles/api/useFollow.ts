import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { followSubprofile, unfollowSubprofile } from "./subprofiles.api";
import type { PublicSubprofileOutcome } from "./usePublicSubprofile";

/** Result shape shared by the follow and unfollow endpoints. */
export interface FollowResult {
  followerCount: number;
  viewerFollowing: boolean;
}

export interface FollowVariables {
  /** The view's current count — only used as a demo-branch fallback if the
   *  persona somehow isn't in the mock registry. Ignored in live mode; the
   *  API is authoritative. */
  currentFollowerCount: number;
}

export interface UnfollowVariables {
  currentFollowerCount: number;
}

/**
 * Follow/unfollow mutations for one persona, keyed on its `id` (the follow
 * routes key on the non-identifying persona id, never slug/handle — mirrors
 * the endorse routes). Mirrors the demo/live branch in `useEndorsement`: live
 * calls the API; demo flips the shared in-memory `DEMO_SUBPROFILES` state via
 * `mockSetFollowing`, so it stays consistent with `resolvePublicAccessDemo`
 * reads (a purely local count nudge here would get overwritten by the very
 * invalidate-triggered refetch below). Unlike endorsements, followers are
 * never listed (count-only, anonymity-preserving), so there is no separate
 * "followers" query to invalidate — only the persona public query.
 */
export function useFollow(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  // Patch the persona's public query cache in place with the AUTHORITATIVE
  // `{followerCount, viewerFollowing}` the endpoint returns, instead of firing
  // a broad invalidate + refetch (which flickered the count between the stale
  // and fresh values on every tap). The public query is keyed by handle/slug +
  // viewer, not by this persona `id`, so we scan the whole `["subprofile",
  // "public"]` family via `setQueriesData` and patch only the entry whose
  // cached DTO carries this `id`. Works identically in demo mode — the demo
  // branch returns the same `FollowResult` shape (from `mockSetFollowing`,
  // which also flips the shared `DEMO_SUBPROFILES` state so any later fresh
  // read stays consistent). Followers are never listed (count-only,
  // anonymity-preserving), so there is no separate followers query to refresh.
  const patchPublic = (result: FollowResult) => {
    queryClient.setQueriesData<PublicSubprofileOutcome>(
      { queryKey: ["subprofile", "public"] },
      (prev) =>
        prev && prev.state === "ok" && prev.data.id === subprofileId
          ? {
              ...prev,
              data: {
                ...prev.data,
                followerCount: result.followerCount,
                viewerFollowing: result.viewerFollowing,
              },
            }
          : prev,
    );
  };

  const follow = useMutation<FollowResult, Error, FollowVariables>({
    // SubprofileFollow toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ currentFollowerCount }) => {
      if (demoMode) {
        const { mockSetFollowing } = await import("../data/subprofiles.data");
        return (
          mockSetFollowing(subprofileId, true) ?? {
            followerCount: currentFollowerCount + 1,
            viewerFollowing: true,
          }
        );
      }
      return followSubprofile(subprofileId);
    },
    onSuccess: patchPublic,
  });

  const unfollow = useMutation<FollowResult, Error, UnfollowVariables>({
    // SubprofileFollow toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ currentFollowerCount }) => {
      if (demoMode) {
        const { mockSetFollowing } = await import("../data/subprofiles.data");
        return (
          mockSetFollowing(subprofileId, false) ?? {
            followerCount: Math.max(0, currentFollowerCount - 1),
            viewerFollowing: false,
          }
        );
      }
      return unfollowSubprofile(subprofileId);
    },
    onSuccess: patchPublic,
  });

  return { follow, unfollow };
}
