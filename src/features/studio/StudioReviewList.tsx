import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { FiInbox } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  Collapse,
  EmptyState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReviewList as StudioReviewListData } from "./api/useStudioFlagReview";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import css from "./StudioFlagReview.module.css";

function StudioReviewSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-label={t("studio:states.loadingLabel")}
      className={css.list}
    >
      {[0, 1, 2].map((placeholderIndex) => (
        <div key={placeholderIndex} className={css.card}>
          <StudioLine width="45%" height={18} />
          <StudioLine width="70%" height={12} style={{ marginTop: 10 }} />
          <StudioLine width="100%" height={56} style={{ marginTop: 16 }} />
        </div>
      ))}
    </div>
  );
}

/**
 * One review queue: skeleton, error with Retry (kept up while it retries),
 * empty state, the cards, and Show more. A card leaves by fading while the
 * rest glide up; the list only drops it once the server confirmed.
 */
export function StudioReviewList<Item>({
  list,
  getKey,
  renderCard,
  emptyTitleKey,
  emptyBodyKey,
}: {
  list: StudioReviewListData<Item>;
  getKey: (item: Item) => string;
  renderCard: (item: Item) => ReactNode;
  emptyTitleKey: string;
  emptyBodyKey: string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  if (list.loadState.isLoading) return <StudioReviewSkeleton />;
  if (list.loadState.isError)
    return (
      <StudioLoadError
        loadState={list.loadState}
        title={t("studio:flagReviewLive.loadError")}
      />
    );
  return (
    <>
      <Collapse isOpen={list.items.length === 0}>
        <EmptyState
          icon={<FiInbox />}
          title={t(emptyTitleKey)}
          description={t(emptyBodyKey)}
          headingLevel={3}
        />
      </Collapse>
      <ul className={css.list}>
        <AnimatePresence initial={false}>
          {list.items.map((item) => (
            <m.li
              key={getKey(item)}
              className={css.item}
              layout="position"
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.24,
                ease: "easeOut",
              }}
            >
              {renderCard(item)}
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={list.hasNextPage || list.isFetchNextPageError}>
        <LoadMoreFooter
          isFetchingNextPage={list.isFetchingNextPage}
          isFetchNextPageError={list.isFetchNextPageError}
          onLoadMore={list.fetchNextPage}
          label={t("studio:flagReviewLive.loadMore")}
          loadingLabel={t("studio:flagReviewLive.loadingMore")}
          errorMessage={t("studio:flagReviewLive.loadMoreError")}
        />
      </Collapse>
    </>
  );
}
