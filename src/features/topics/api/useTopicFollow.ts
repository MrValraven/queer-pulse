import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { topicFollowKeys } from "./topicFollowKeys";
import {
  followTopic,
  getTopicFollows,
  unfollowTopic,
} from "./topicFollows.api";

interface ToggleContext {
  previous: string[];
}

/**
 * Catalog key for a failed follow toggle. `POST /topics/:slug/follow` answers
 * 400 for a malformed tag and 409 once a member hits the per-account follow
 * cap; both deserve their own sentence rather than "Something went wrong".
 */
function followErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return "topics:header.followCapToast";
    if (error.status === 400) return "topics:header.followInvalidToast";
  }
  return "topics:header.followFailedToast";
}

/**
 * Follow-state + toggle for one topic (P2-15), for `TopicHeader`'s follow
 * button. Works in both modes:
 *
 * - Live: seeds the followed-slug set from `GET /topics/follows` (so the button
 *   opens in the right state on load), then the toggle really calls
 *   `POST`/`DELETE /topics/:slug/follow`. The set is patched optimistically on
 *   `onMutate` and rolled back on error, so the button flips instantly.
 * - Demo: keeps the original mock behaviour — no network, an in-memory
 *   optimistic toggle of the same cached set, and the same success toast. The
 *   demo set starts empty every session (topics carry no persisted follow in
 *   the fixture).
 *
 * The success toast fires in both modes and reflects the NEW state (follow /
 * unfollow), matching the pre-existing `topics:header.followToast` copy.
 */
export function useTopicFollow(tag: string) {
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const followsQuery = useQuery<string[]>({
    queryKey: topicFollowKeys.list(demoMode),
    // Demo has no backend follow store; start from an empty set and let the
    // optimistic toggle be the only source of truth for the session.
    queryFn: () => (demoMode ? Promise.resolve([]) : getTopicFollows()),
  });

  const followedSlugs = followsQuery.data ?? [];
  const isFollowing = followedSlugs.includes(tag);

  const toggle = useMutation<unknown, Error, boolean, ToggleContext>({
    // This hook shows the failure itself (see `onError`), so the global
    // mutation toast must not fire a second, vaguer message on top of it.
    meta: { silentError: true },
    mutationFn: async (nextFollowing) => {
      // Demo mode never touches the network; the optimistic patch is the truth.
      if (demoMode) return;
      return nextFollowing ? followTopic(tag) : unfollowTopic(tag);
    },
    onMutate: async (nextFollowing) => {
      const key = topicFollowKeys.list(demoMode);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key) ?? [];
      const withoutTag = previous.filter((slug) => slug !== tag);
      queryClient.setQueryData<string[]>(
        key,
        nextFollowing ? [tag, ...withoutTag] : withoutTag,
      );
      return { previous };
    },
    onError: (error, _nextFollowing, context) => {
      if (context) {
        queryClient.setQueryData(
          topicFollowKeys.list(demoMode),
          context.previous,
        );
      }
      // The follow endpoint now has two specific refusals worth naming: a
      // malformed tag (400) and the per-member follow cap (409). Everything
      // else falls through to the generic copy. This hook owns the message
      // (see `meta.silentError`), so the button flips back AND says why.
      showToast(t(followErrorKey(error)), "error");
    },
    onSuccess: (_data, nextFollowing) => {
      showToast(
        t(
          nextFollowing
            ? "topics:header.followToast"
            : "topics:header.unfollowToast",
          { tag },
        ),
        "success",
      );
    },
  });

  return {
    isFollowing,
    isPending: toggle.isPending,
    // The follow list failing means "Follow" is shown to someone who already
    // follows the topic, so the state is surfaced rather than swallowed
    // (DES-22). The button stays usable: the toggle is idempotent server-side
    // and its own failure is already reported by the toast above.
    isFollowStateUnknown: followsQuery.isError,
    refetchFollows: () => void followsQuery.refetch(),
    toggle: () => toggle.mutate(!isFollowing),
  };
}
