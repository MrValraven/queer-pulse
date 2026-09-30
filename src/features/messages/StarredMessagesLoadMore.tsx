// src/features/messages/StarredMessagesLoadMore.tsx
import { LoadMoreFooter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StarredMessagesModal.module.css";

interface StarredMessagesLoadMoreProps {
  isFetchingNextPage: boolean;
  /** True when the most recent page fetch failed. Every row already loaded
   *  stays on screen (`StarredMessagesModal` keeps rendering `visibleItems`
   *  unchanged); this footer alone switches to an inline retry, so a load-
   *  more failure never costs the member the rows they already had. */
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
}

/**
 * PRD-374: the older-stars page footer. A plain button fetches the next
 * keyset page from whichever `q`/`type` key is current; the starred list is
 * a short, deliberately-opened modal, so an explicit tap fits its scale
 * better than the media gallery's IntersectionObserver auto-load sentinel.
 */
export function StarredMessagesLoadMore({
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
}: StarredMessagesLoadMoreProps) {
  const { t } = useTranslation();
  return (
    <LoadMoreFooter
      className={styles.footer}
      messageClassName={styles.footerStatusText}
      aria-busy={isFetchingNextPage}
      size="sm"
      isFetchingNextPage={isFetchingNextPage}
      isFetchNextPageError={isFetchNextPageError}
      onLoadMore={onLoadMore}
      errorMessage={t("messages:mediaGallery.loadMoreError")}
      label={t("messages:starred.loadMore")}
      loadingLabel={t("messages:starred.loadingMore")}
    />
  );
}
