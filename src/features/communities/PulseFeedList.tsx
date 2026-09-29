import { FiMessageCircle } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  LoadErrorState,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Post, PulseMoment } from "./community.model";
import type { PulsePaging } from "./api/useCommunityPosts";
import { PulseFeedPost } from "./PulseFeedPost";
import type { PulseFeedItem } from "./usePulseFeedData";
import styles from "./PulseTab.module.css";

/**
 * The Pulse tab's live feed (as opposed to search results): the empty/failed
 * states, the pinned rail, the interleaved post+moment feed, and its own
 * load-more. Extracted from `PulseTab` so that component stays under the
 * repo's 200-line limit.
 */
export function PulseFeedList({
  pinnedPosts,
  feed,
  isFeedEmpty,
  isMember,
  paging,
  postProps,
  momentAgo,
}: {
  pinnedPosts: Post[];
  feed: PulseFeedItem[];
  isFeedEmpty: boolean;
  isMember: boolean;
  paging: PulsePaging;
  postProps: Parameters<typeof PulseFeedPost>[0]["postProps"];
  momentAgo: (moment: PulseMoment) => string;
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* A failed feed read is never the "nothing here yet" empty state:
          that reads as an answer about the community rather than a request
          that did not land (DES-22). */}
      {isFeedEmpty && paging.isError ? (
        <LoadErrorState onRetry={paging.refetch} />
      ) : (
        isFeedEmpty && (
          <EmptyState
            icon={<FiMessageCircle />}
            title={t("communities:detail.pulse.empty.title")}
            description={t(
              isMember
                ? "communities:detail.pulse.empty.description"
                : "communities:detail.pulse.empty.visitorDescription",
            )}
          />
        )
      )}

      {pinnedPosts.map((post) => (
        <FadeIn key={post.id} className={styles.rowFade}>
          <PulseFeedPost post={post} isPinned postProps={postProps} />
        </FadeIn>
      ))}

      {feed.map((item, index) =>
        item.post ? (
          <FadeIn
            key={item.post.id}
            className={styles.rowFade}
            delay={Math.min(index, 8) * 55}
          >
            <PulseFeedPost post={item.post} postProps={postProps} />
          </FadeIn>
        ) : (
          <FadeIn
            key={`m-${item.moment!.id}`}
            className={styles.rowFade}
            delay={Math.min(index, 8) * 55}
          >
            <div className={styles.moment}>
              <span className={styles.momentDot} />
              {item.moment!.text}
              <span className={styles.momentTime}>
                {momentAgo(item.moment!)}
              </span>
            </div>
          </FadeIn>
        ),
      )}

      {paging.hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={paging.isFetchingNextPage}
            onClick={paging.fetchNextPage}
          >
            {paging.isFetchingNextPage
              ? t("communities:detail.pulse.loadingMore")
              : t("communities:detail.pulse.loadMoreCta")}
          </Button>
        </div>
      )}
    </>
  );
}
