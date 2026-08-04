import { useEffect, useRef } from "react";
import { Button, Sending } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./FeedPage.module.css";

/**
 * The infinite-scroll pager below the live feed. An IntersectionObserver
 * sentinel auto-loads the next cursor page as the reader nears the end; the same
 * node is also a real `<Button>`, so the next page stays reachable by keyboard
 * and under reduced motion (where the observer is skipped and the reader taps to
 * advance, mirroring `useIncrementalList`'s reduced-motion contract).
 *
 * Renders nothing once the feed is exhausted (`hasNextPage` false) — which is
 * always the case in demo mode, whose scripted cards are a single terminal page
 * (the `useFeed` hook is disabled there), so the demo feed ends honestly with no
 * dangling pager.
 */
export function FeedLoadMore({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}) {
  const { t } = useTranslation();
  const prefersReduced = usePrefersReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced) return;
    if (!hasNextPage || isFetchingNextPage) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
      },
      // Kick the next fetch off before the sentinel is actually on screen, so the
      // following cards are arriving as the reader reaches the end of the list
      // rather than popping in after a scroll-stop.
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReduced, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;

  return (
    <div ref={sentinelRef} className={styles.loadMore}>
      <Button
        type="button"
        variant="ghost"
        disabled={isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage ? (
          <Sending label={t("feed:loadMore.loading")} />
        ) : (
          t("feed:loadMore.cta")
        )}
      </Button>
    </div>
  );
}
