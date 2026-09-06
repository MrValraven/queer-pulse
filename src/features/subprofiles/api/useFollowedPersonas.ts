import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getFollowedPersonas,
  unfollowSubprofile,
  type FollowedPersonasPage,
} from "./subprofiles.api";

/**
 * Rows per page. Matches the backend's `PAGE_SIZE`, which `GET
 * /subprofiles/following` fixes and takes no parameter for, so the demo branch
 * pages the same way the live one does.
 */
export const FOLLOWED_PERSONAS_PAGE_SIZE = 20;

/** The query key family, so an unfollow anywhere in this feature can bust it. */
export const followedPersonasKey = (page: number) =>
  ["subprofile", "following", page] as const;

/**
 * The personas the signed-in member follows, one page at a time.
 *
 * Dual-mode, like every data hook here: live calls `GET /subprofiles/
 * following`; demo reads the colocated fixture through a dynamic import, so
 * the mock registry never lands in the live bundle path.
 *
 * The live list is already filtered server-side to personas the viewer may
 * still see (published, open, not owner-removed, not under a moderator
 * takedown, not blocked either way), which is the whole reason this is a
 * server read rather than a local set: a followed persona that was taken down
 * must not come back through a list.
 */
export function useFollowedPersonas(page: number, isEnabled: boolean) {
  const { demoMode } = useDemoMode();
  return useQuery<FollowedPersonasPage>({
    queryKey: followedPersonasKey(page),
    enabled: isEnabled,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { mockFollowedPersonas } =
          await import("../followedPersonas.data");
        return mockFollowedPersonas(page, FOLLOWED_PERSONAS_PAGE_SIZE);
      }
      return getFollowedPersonas(page, signal);
    },
  });
}

/**
 * Stop following one persona from the list.
 *
 * Deliberately NOT optimistic. Unfollowing removes the row it was fired from,
 * and a row that vanishes and then reappears is worse than a row that takes a
 * moment to go: the caller awaits this and only then confirms, the same
 * contract `ConnectionMoreMenu` uses for block and remove. On success the whole
 * `["subprofile", "following"]` family is invalidated (page counts shift, so
 * patching one page in place would leave the others wrong), and so is the
 * persona's own public query, whose "Following" pill and follower count this
 * just changed.
 */
export function useUnfollowPersona() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { personaId: string }>({
    // The list row raises its own error toast, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ personaId }) => {
      if (demoMode) {
        const { mockUnfollowPersona } =
          await import("../followedPersonas.data");
        mockUnfollowPersona(personaId);
        return;
      }
      await unfollowSubprofile(personaId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["subprofile", "following"],
        }),
        queryClient.invalidateQueries({ queryKey: ["subprofile", "public"] }),
      ]);
    },
  });
}
