// src/features/messages/ConversationMediaLoadMoreFooter.tsx
import { useEffect, useRef } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ConversationMediaGallery.module.css";

/**
 * The nearest ancestor that scrolls: inside the shared `Modal` that is its
 * body (`.modalBody`, `overflow-y: auto`), which the Modal exposes no ref to.
 * Observing against it is what lets `rootMargin` pre-load, since a margin on
 * the implicit viewport root cannot reach past a scroll container's clip.
 * Null (the viewport) when no ancestor scrolls.
 */
function scrollParentOf(node: HTMLElement): HTMLElement | null {
  for (
    let parent = node.parentElement;
    parent !== null;
    parent = parent.parentElement
  ) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") return parent;
  }
  return null;
}

interface ConversationMediaLoadMoreProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isNextPageError: boolean;
  onLoadMore: () => void;
}

/**
 * Loads the next page as the footer nears the sheet's visible edge, with a
 * real button for keyboards and for the moment a page fails (auto-loading
 * stops then, so a failing page is never retried in a loop).
 */
export function ConversationMediaLoadMore({
  hasNextPage,
  isFetchingNextPage,
  isNextPageError,
  onLoadMore,
}: ConversationMediaLoadMoreProps) {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });
  const shouldAutoLoad = hasNextPage && !isFetchingNextPage && !isNextPageError;

  useEffect(() => {
    if (!shouldAutoLoad) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { root: scrollParentOf(node), rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldAutoLoad]);

  if (!hasNextPage) return null;

  const label = isFetchingNextPage
    ? t("messages:mediaGallery.loadingMore")
    : isNextPageError
      ? t("common:error.retry")
      : t("messages:mediaGallery.loadMore");

  return (
    <div
      ref={sentinelRef}
      className={styles.footer}
      aria-busy={isFetchingNextPage}
    >
      {isNextPageError && (
        <p className={styles.statusText} role="alert">
          {t("messages:mediaGallery.loadMoreError")}
        </p>
      )}
      <Button
        variant="ghost"
        size="sm"
        // `aria-disabled` keeps focus on the button while the page loads.
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
