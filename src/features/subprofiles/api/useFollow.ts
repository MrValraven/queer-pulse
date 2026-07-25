import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { followSubprofile, unfollowSubprofile } from "./subprofiles.api";
import { mockSetFollowing } from "../data/subprofiles.data";

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
 * `mockSetFollowing`, so it stays consistent with `mockPublicByHandle` reads
 * (a purely local count nudge here would get overwritten by the very
 * invalidate-triggered refetch below). Unlike endorsements, followers are
 * never listed (count-only, anonymity-preserving), so there is no separate
 * "followers" query to invalidate — only the persona public query.
 */
export function useFollow(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["subprofile"] });
  };

  const follow = useMutation<FollowResult, Error, FollowVariables>({
    mutationFn: async ({ currentFollowerCount }) => {
      if (demoMode) {
        return (
          mockSetFollowing(subprofileId, true) ?? {
            followerCount: currentFollowerCount + 1,
            viewerFollowing: true,
          }
        );
      }
      return followSubprofile(subprofileId);
    },
    onSuccess: invalidate,
  });

  const unfollow = useMutation<FollowResult, Error, UnfollowVariables>({
    mutationFn: async ({ currentFollowerCount }) => {
      if (demoMode) {
        return (
          mockSetFollowing(subprofileId, false) ?? {
            followerCount: Math.max(0, currentFollowerCount - 1),
            viewerFollowing: false,
          }
        );
      }
      return unfollowSubprofile(subprofileId);
    },
    onSuccess: invalidate,
  });

  return { follow, unfollow };
}
