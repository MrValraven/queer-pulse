import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { likeFeedPost, replyToFeedPost, type FeedItem } from "./feed.api";

/** The shape react-query holds for every `useFeed` infinite query. Patched in
 *  place rather than invalidated, so acting on a card never reshuffles the
 *  ranked page the member is reading mid-scroll. */
interface CachedFeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}
interface CachedFeed {
  pages: CachedFeedPage[];
  pageParams: unknown[];
}

/** Narrow an unknown cache entry to the infinite-feed shape. Anything else
 *  (a half-written cache, a future shape) is left untouched. */
function isCachedFeed(value: unknown): value is CachedFeed {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as CachedFeed).pages)
  );
}

type ItemPatch = (item: FeedItem) => FeedItem;

/**
 * Inline reactions and replies on a feed card (SOC-04).
 *
 * Every feed card used to be read-only in live mode: reacting meant opening
 * the thread, which is the one thing a member scrolling their home screen
 * will not do. These two actions write through the flat `community-posts`
 * aliases and patch the cached page so the card updates the instant it is
 * tapped.
 *
 * OPTIMISTIC WITH A REAL ROLLBACK. The patch is applied before the request,
 * the previous cache entries are snapshotted, and a failure restores them
 * exactly and says so. On success the like count is replaced with the number
 * the SERVER returned rather than the guessed one, so a double-tap or a
 * reaction added from another device converges instead of drifting.
 *
 * Demo mode never calls the API: the mutation resolves locally and the card's
 * own state carries the change, exactly as the prototype always did.
 */
export function useFeedPostActions() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  /** Apply `patch` to one post across every cached feed query, returning the
   *  snapshot needed to undo it. */
  const patchCachedItem = useCallback(
    (postId: string, patch: ItemPatch): [readonly unknown[], unknown][] => {
      const snapshot = queryClient.getQueriesData({ queryKey: ["feed"] });
      queryClient.setQueriesData({ queryKey: ["feed"] }, (current: unknown) => {
        if (!isCachedFeed(current)) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === postId ? patch(item) : item,
            ),
          })),
        };
      });
      return snapshot;
    },
    [queryClient],
  );

  const restore = useCallback(
    (snapshot: [readonly unknown[], unknown][] | undefined) => {
      if (!snapshot) return;
      for (const [key, value] of snapshot) queryClient.setQueryData(key, value);
    },
    [queryClient],
  );

  const reactMutation = useMutation({
    mutationFn: async ({
      postId,
      liked,
    }: {
      postId: string;
      liked: boolean;
    }) => {
      if (demoMode) return { liked, likeCount: 0 };
      return likeFeedPost(postId, liked);
    },
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      return {
        snapshot: patchCachedItem(postId, (item) => ({
          ...item,
          myReaction: liked ? "like" : null,
          reactionCount: Math.max(
            0,
            (item.reactionCount ?? 0) + (liked ? 1 : -1),
          ),
        })),
      };
    },
    onError: (_error, _variables, context) => {
      restore(context?.snapshot);
      showToast(t("feed:action.reactionFailed"), "error");
    },
    onSuccess: (result, { postId }) => {
      if (demoMode) return;
      // The server's own count wins over the guess.
      patchCachedItem(postId, (item) => ({
        ...item,
        myReaction: result.liked ? "like" : null,
        reactionCount: result.likeCount,
      }));
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ postId, body }: { postId: string; body: string }) => {
      if (demoMode) return { id: "demo-reply" };
      return replyToFeedPost(postId, body);
    },
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      return {
        snapshot: patchCachedItem(postId, (item) => ({
          ...item,
          replyCount: (item.replyCount ?? 0) + 1,
        })),
      };
    },
    onError: (_error, _variables, context) => {
      restore(context?.snapshot);
      showToast(t("feed:action.replyFailed"), "error");
    },
    onSuccess: () => showToast(t("feed:action.replySent"), "success"),
  });

  return {
    react: reactMutation.mutate,
    isReacting: reactMutation.isPending,
    reply: replyMutation.mutate,
    isReplying: replyMutation.isPending,
  };
}
