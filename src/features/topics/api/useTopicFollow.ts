import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { topicFollowKeys } from "./topicFollowKeys";
import { followTopic, getTopicFollows, unfollowTopic } from "./topicFollows.api";

interface ToggleContext {
  previous: string[];
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
    onError: (_error, _nextFollowing, context) => {
      if (context) {
        queryClient.setQueryData(topicFollowKeys.list(demoMode), context.previous);
      }
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
    toggle: () => toggle.mutate(!isFollowing),
  };
}
