/** The DOM id the listings queue page's heading carries (`AdminListingsPage`
 *  passes it to `AdminPageHeader` as `titleId`), and the one a successful
 *  single-listing Remove looks up. */
export const LISTING_QUEUE_HEADING_ID = "admin-listings-queue-heading";

/**
 * After a successful single-listing Remove, moves focus onto the queue's
 * heading. The removed row unmounts together with the menu trigger the delete
 * flow would restore focus to, which leaves focus on the body. Waits two
 * frames so React has committed the row removal and the dialogs' own focus
 * restore has run first. Does nothing unless focus has genuinely dropped (the
 * active element is the body, or there is none), so a restore that found a
 * live target, or a moderator who already moved on, keeps their focus where
 * it is. Same guard as `focusMessageNextFrame` in the messages feature.
 */
export function focusListingQueueHeadingAfterRemove() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) return;
      document.getElementById(LISTING_QUEUE_HEADING_ID)?.focus();
    });
  });
}
