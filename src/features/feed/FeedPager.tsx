import { useCallback, useEffect, useRef } from "react";
import {
  LoadMoreButton,
  LoadMoreStatus,
  Sending,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FeedLoadMore } from "./FeedLoadMore";
import styles from "./FeedPager.module.css";

interface FeedPagerProps {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  /** True when the latest next-page fetch failed. Every card already loaded
   *  stays on screen; this footer alone says so and retries that page. */
  isFetchNextPageError: boolean;
}

/**
 * ENG-501: the live feed's footer. While pages arrive cleanly it is the
 * infinite-scroll `FeedLoadMore`. Once a next page fails it swaps to an inline
 * failure line and a Retry button that fetches that page again.
 *
 * `FeedLoadMore` is unmounted while the page is failed, which disconnects its
 * IntersectionObserver: the sentinel sits on screen at the end of the list, so
 * a mounted observer would re-fire the failed fetch in a loop. After a failure
 * the next attempt waits for the member to press Retry.
 */
export function FeedPager({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
}: FeedPagerProps) {
  const { t } = useTranslation();
  const footerRef = useRef<HTMLDivElement>(null);
  const wasFocusInFooterRef = useRef(false);

  // Every page request, pressed or observer-fired, records whether keyboard
  // focus sat inside this footer at that moment.
  // Memoised because `FeedLoadMore` lists it in its observer effect's deps.
  const requestNextPage = useCallback(() => {
    wasFocusInFooterRef.current = Boolean(
      footerRef.current?.contains(document.activeElement),
    );
    fetchNextPage();
  }, [fetchNextPage]);

  // When a request settles its button can unmount: a failure swaps "Load
  // more" for Retry, a landed retry swaps it back, and the last page leaves
  // no button at all. If the request came from inside the footer and focus
  // fell to the page body, hand it to the footer's current button, or to the
  // footer itself after the last page so the member keeps their place.
  useEffect(() => {
    if (isFetchingNextPage || !wasFocusInFooterRef.current) return;
    wasFocusInFooterRef.current = false;
    const footer = footerRef.current;
    const focusedElement = document.activeElement;
    if (!footer || (focusedElement && focusedElement !== document.body)) return;
    const footerButton = footer.querySelector("button");
    if (footerButton) footerButton.focus();
    else footer.focus({ preventScroll: true });
  }, [isFetchingNextPage, isFetchNextPageError]);

  // The true end of the feed: nothing left to load and nothing failed.
  const isAtEnd = !hasNextPage && !isFetchNextPageError;

  return (
    <div
      ref={footerRef}
      tabIndex={-1}
      role="group"
      aria-label={t("feed:loadMore.footerAria")}
      data-feed-end={isAtEnd || undefined}
      className={
        isAtEnd ? `${styles.footer} ${styles.footerAtEnd}` : styles.footer
      }
    >
      <LoadMoreStatus
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        errorMessage={t("feed:loadMore.error")}
      />
      {isFetchNextPageError ? (
        <div className={styles.retryRow}>
          <LoadMoreButton
            isFetchingNextPage={isFetchingNextPage}
            isFetchNextPageError
            onLoadMore={requestNextPage}
            label={t("feed:loadMore.cta")}
            loadingLabel={<Sending label={t("feed:loadMore.loading")} />}
          />
        </div>
      ) : (
        <FeedLoadMore
          hasNextPage={hasNextPage}
          fetchNextPage={requestNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </div>
  );
}
