// src/features/messages/MessagesThreadListLoadMore.tsx
import { useEffect, useRef } from "react";
import { Button, Sending } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

/**
 * The nearest scrolling ancestor: `PullToRefresh` nests its own
 * `overflow-y: auto; height: 100%` scroller as `.threadList`'s direct child
 * (see `MessagesThreadList.tsx`'s own `resolveScrollContainer`, the same
 * lookup duplicated here so `rootMargin` can pre-load against the real
 * scroll surface instead of the implicit viewport root, which a nested
 * scroll container's clip would block it from reaching). Mirrors
 * `ConversationMediaLoadMoreFooter.tsx`'s identical helper for its own sheet.
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

interface MessagesThreadListLoadMoreProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/**
 * ENG-253: the inbox's own "load more" sentinel/footer, below the rendered
 * rows. `useConversations`'s `fetchNextPage` already cursor-pages
 * `GET /conversations`; nothing in the UI called it until this component, so
 * the inbox silently stopped at the first page (the same class of bug
 * ENG-253's cursor-pagination itself replaced: previously the endpoint
 * silently stopped at a fixed 200-row cap). Mirrors
 * `ConversationMediaLoadMore`'s own IntersectionObserver auto-load sentinel
 * (`ConversationMediaLoadMoreFooter.tsx`) rather than `StarredMessagesLoadMore`'s
 * tap-only button: the inbox is the member's main scroll surface here, the
 * same shape as the media gallery sheet rather than a short modal list.
 *
 * `aria-busy` sits on this footer alone, never on `.threadList` (the FIRST
 * load's own `aria-busy`, set by `MessagesThreadList` directly), so a screen
 * reader hears "busy" once for the whole list on first load, and then again
 * only for this small footer on every later page, keeping the rest of the
 * already-read list quiet on every scroll-triggered fetch.
 *
 * Renders nothing once the server reports no further page (`hasNextPage`
 * false). The demo inbox's single scripted page always resolves that way
 * (`useConversations`'s demo branch), so this never appears in demo mode.
 */
export function MessagesThreadListLoadMore({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: MessagesThreadListLoadMoreProps) {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });
  const shouldAutoLoad = hasNextPage && !isFetchingNextPage;

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

  // TODO(i18n): reusing the generic gallery copy (`messages:mediaGallery.
  // loadMore`/`.loadingMore`, "Load more"/"Loading more…" in both EN and PT)
  // rather than adding a dedicated `messages:thread.loadMore` key, since the
  // catalogs are owned by another build this session and the wording reads
  // fine unscoped. Swap to a thread-list-scoped key if/when one lands.
  return (
    <div
      ref={sentinelRef}
      className={styles.threadListLoadMore}
      aria-busy={isFetchingNextPage}
    >
      <Button
        variant="ghost"
        size="sm"
        // `aria-disabled` (not `disabled`) keeps focus on the button while
        // the page loads, mirroring `ConversationMediaLoadMore`.
        aria-disabled={isFetchingNextPage || undefined}
        onClick={() => {
          if (!isFetchingNextPage) onLoadMore();
        }}
      >
        {isFetchingNextPage ? (
          <Sending label={t("messages:mediaGallery.loadingMore")} />
        ) : (
          t("messages:mediaGallery.loadMore")
        )}
      </Button>
    </div>
  );
}
