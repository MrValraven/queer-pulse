import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { Paginated } from "../../../shared/contracts/contracts";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  getForumReviewQueue,
  isForumReviewConflict,
  reviewForumThread,
  type AdminForumReviewThread,
  type ForumReviewDecision,
} from "./adminForumReview.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** Prefix for the queue query; the full key also carries `demoMode`. */
const FORUM_REVIEW_QUERY_KEY = "admin-forum-review";

/** The triage console's prefix (`useAdminQueues`), so its forum row count
 *  drops as soon as a decision lands. */
const ADMIN_QUEUES_QUERY_KEY = "admin-queues";

type ForumReviewPages = InfiniteData<Paginated<AdminForumReviewThread>>;

/**
 * The threads waiting on a moderator, newest first, one cursor page at a time.
 *
 * Demo mode serves the colocated fixture as a single page and never touches the
 * network: the route is staff-only and the fixture is invented. The cached copy
 * is demo mode's local state, so it never goes stale, and a decision removes its
 * row from that cache (see `useReviewForumThread`).
 */
export function useAdminForumReview() {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<
    Paginated<AdminForumReviewThread>,
    Error,
    ForumReviewPages,
    [string, boolean],
    string | undefined
  >({
    queryKey: [FORUM_REVIEW_QUERY_KEY, demoMode],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_FORUM_REVIEW_THREADS } =
          await import("../adminForumReview.data");
        return {
          data: ADMIN_FORUM_REVIEW_THREADS,
          pageInfo: { nextCursor: null, hasMore: false },
        };
      }
      return getForumReviewQueue(pageParam);
    },
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore && lastPage.pageInfo.nextCursor
        ? lastPage.pageInfo.nextCursor
        : undefined,
    staleTime: demoMode ? Infinity : undefined,
  });
  const threads = query.data?.pages.flatMap((page) => page.data) ?? [];
  return { ...query, threads };
}

export interface ReviewForumThreadVariables {
  slug: string;
  decision: ForumReviewDecision;
  /** Optional word to the author; trimmed and capped by the API call. */
  note?: string;
}

/**
 * Approve or reject one queued thread, with the toast for each outcome.
 *
 * The row leaves the cache only once the decision succeeds, in both modes. A
 * 409 means another moderator decided first: it gets its own toast, and the
 * live settle refetches the queue so the stale row disappears. Live mode also
 * refreshes the triage console's counts.
 */
export function useReviewForumThread() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const removeRow = (slug: string) => {
    queryClient.setQueriesData<ForumReviewPages>(
      { queryKey: [FORUM_REVIEW_QUERY_KEY] },
      (cached) =>
        cached
          ? {
              ...cached,
              pages: cached.pages.map((page) => ({
                ...page,
                data: page.data.filter((thread) => thread.slug !== slug),
              })),
            }
          : cached,
    );
  };

  const mutation = useDemoAwareMutation<
    ForumReviewDecision,
    Error,
    ReviewForumThreadVariables
  >({
    demoMode,
    demoResult: ({ decision }) => decision,
    live: async ({ slug, decision, note }) => {
      await reviewForumThread(slug, decision, note);
      return decision;
    },
    logLabel: "admin.forumReview.decide",
    logContext: ({ slug, decision }) => ({ slug, decision }),
    onSuccess: (decision, { slug }) => {
      removeRow(slug);
      showToast(
        t(
          decision === "approve"
            ? "admin:adminForumReview.toast.approved"
            : "admin:adminForumReview.toast.rejected",
        ),
        "success",
      );
    },
    onError: (error) => {
      showToast(
        t(
          isForumReviewConflict(error)
            ? "admin:adminForumReview.toast.conflict"
            : "admin:adminForumReview.toast.error",
        ),
        "error",
      );
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: [FORUM_REVIEW_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_QUEUES_QUERY_KEY],
      });
    },
    meta: { silentError: true },
  });

  return { review: mutation.mutate, isPending: mutation.isPending };
}
