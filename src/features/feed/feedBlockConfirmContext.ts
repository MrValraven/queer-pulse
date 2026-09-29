import { createContext, useContext, type RefObject } from "react";

export interface BlockConfirmRequest {
  authorName: string;
  slug: string;
  /**
   * The control to return focus to on close, carried as the REF OBJECT
   * itself. The host reads `.current` fresh at close time, when React has
   * already nulled it out if the opening card unmounted in the meantime (an
   * optimistic block removes the card from the feed before the dialog
   * closes), so the fallback needs no separate `isConnected` check.
   */
  returnFocusRef: RefObject<HTMLElement | null>;
}

export interface FeedBlockConfirmContextValue {
  requestBlockConfirm: (request: BlockConfirmRequest) => void;
}

/** Lives in its own module, apart from both `FeedModeration.tsx` (which
 *  reads this via `useFeedBlockConfirm`) and `FeedBlockConfirmHost.tsx`
 *  (which provides it): those two otherwise import each other, forcing a
 *  full reload on every edit to either file under Vite's fast refresh. */
export const FeedBlockConfirmContext =
  createContext<FeedBlockConfirmContextValue | null>(null);

/** The nearest `FeedBlockConfirmHost`'s confirm-request function, or `null`
 *  when no host is mounted above the caller. `MoreMenu` falls back to its
 *  own locally hosted modal when this is null. */
export function useFeedBlockConfirm() {
  return useContext(FeedBlockConfirmContext);
}
