// src/features/messages/StarredMessagesLoadMore.tsx
import { Button } from "../../shared/components/ui";
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
  const label = isFetchingNextPage
    ? t("messages:starred.loadingMore")
    : isFetchNextPageError
      ? t("common:error.retry")
      : t("messages:starred.loadMore");
  return (
    <div className={styles.footer} aria-busy={isFetchingNextPage}>
      {isFetchNextPageError && (
        <p className={styles.statusText} role="alert">
          {t("messages:mediaGallery.loadMoreError")}
        </p>
      )}
      <Button
        variant="ghost"
        size="sm"
        aria-disabled={isFetchingNextPage || undefined}
        onClick={() => {
          if (!isFetchingNextPage) onLoadMore();
        }}
      >
        {label}
      </Button>
    </div>
  );
}
