// src/features/messages/useStarredMessagesLoadMoreAnnouncement.ts
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * PRD-374 (M3): announces a successful "Load more" through its own dedicated
 * live region: the toolbar's result-count region only speaks while a
 * search/filter is active, and a "Load more" tap on the untouched list still
 * deserves an announcement.
 *
 * Focus moves onto the list container (a `tabIndex={-1}` `<ul ref={listRef}>`
 * the caller wires up) ONLY when the "Load more" button the member just
 * pressed has actually unmounted (`hasNextPage` reads false on the page that
 * just landed): while the button is still there, the member's own focus
 * stays exactly where they left it, and only the announcement below speaks.
 * `preventScroll` on that `.focus()` call matches `RouteAnnouncer.tsx`'s own
 * pattern: focusing an element scrolls it into view by default, which would
 * drag the member back to the top of a list they just scrolled down to read.
 *
 * `isAnnouncementPending` covers the one commit where this could collide
 * with the toolbar's own result-count region: appending a page changes
 * `resultCount` too, so both regions would otherwise update in the same
 * commit. The caller gates the toolbar's announcement on this being false.
 */
export function useStarredMessagesLoadMoreAnnouncement(
  itemCount: number,
  isFetchingNextPage: boolean,
  isFetchNextPageError: boolean,
  hasNextPage: boolean,
) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLUListElement>(null);
  const previousItemCount = useRef(itemCount);
  const wasFetchingNextPage = useRef(isFetchingNextPage);
  const [announcement, setAnnouncement] = useState("");
  const [isAnnouncementPending, setIsAnnouncementPending] = useState(false);

  useEffect(() => {
    const justFinishedLoadingMore =
      wasFetchingNextPage.current && !isFetchingNextPage;
    wasFetchingNextPage.current = isFetchingNextPage;
    const appendedCount = itemCount - previousItemCount.current;
    previousItemCount.current = itemCount;
    if (
      !justFinishedLoadingMore ||
      isFetchNextPageError ||
      appendedCount <= 0
    ) {
      return;
    }
    const message = t("messages:starred.moreLoaded", { count: appendedCount });
    if (!hasNextPage) {
      listRef.current?.focus({ preventScroll: true });
    }
    // Two consecutive full pages can produce the identical announcement
    // string; React bails on a same-value state update, so setting it twice
    // in a row would leave the live region's DOM content unchanged and a
    // screen reader silent on the second tap. Clearing first, then setting
    // the real text a frame later, guarantees a DOM mutation every time
    // regardless of whether the text repeats. `isAnnouncementPending` stays
    // true for that one frame so the toolbar's own count region holds off.
    setIsAnnouncementPending(true);
    setAnnouncement("");
    const frame = window.requestAnimationFrame(() => {
      setAnnouncement(message);
      setIsAnnouncementPending(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [itemCount, isFetchingNextPage, isFetchNextPageError, hasNextPage, t]);

  return { listRef, announcement, isAnnouncementPending };
}
