// src/features/messages/MessagesThreadListScroller.tsx
import { useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { paneScrollRegistry } from "../../app/paneScrollRegistry";
import { PullToRefresh } from "../../shared/components/ui";
import styles from "./MessagesPage.module.css";

/**
 * The element that actually scrolls inside `.threadList`. `PullToRefresh`
 * nests its own `overflow-y: auto; height: 100%` scroller as the direct
 * child, so the rows overflow THAT element while `.threadList`'s single
 * child fits it exactly: the inner one is the real scroll surface.
 * Register that so scroll-to-top / per-navigation restore act on the surface
 * that moves, falling back to `.threadList` itself if the structure ever
 * changes.
 */
function resolveScrollContainer(root: HTMLElement): HTMLElement {
  const child = root.firstElementChild;
  if (child instanceof HTMLElement) {
    const overflowY = getComputedStyle(child).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return child;
  }
  return root;
}

/**
 * The inbox list's scroll surface with pull-to-refresh around the rows. The
 * list is this fullHeight route's own scroll surface (the window doesn't
 * move), so it registers with ScrollManager, which restores/resets its offset
 * per navigation and honours a tap-on-the-active-tab scroll-to-top: the pane
 * half of the internally-scrolled scroll logic (see paneScrollRegistry).
 */
export function MessagesThreadListScroller({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const threadListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = threadListRef.current;
    if (!root) return;
    return paneScrollRegistry.register(resolveScrollContainer(root));
  }, []);
  return (
    <div
      className={styles.threadList}
      ref={threadListRef}
      // DES-194: the skeleton rows underneath are all `aria-hidden`
      // (MessagesSkeleton.tsx), so without this a screen-reader member
      // hears nothing at all while the inbox's first load is in flight.
      // Mirrors the `aria-busy` the search-results loading state already
      // carries (ThreadSearchModal/MessagesSearchResults), keeping one
      // pattern.
      aria-busy={loading}
    >
      {/* `queryKey: ["conversations"]` matches useConversations' inline
          `["conversations", demoMode, deletedToken, scopeKey]` as a prefix,
          where the fourth segment is the active mailbox identity, so a pull
          refreshes every mailbox's list. Every conversations mutation in
          this feature invalidates the inbox through the same prefix
          (useMessageActions/useMessageMutations).
          No `disabled` gate: this panel is the thread LIST, which carries no
          composer of its own. The message composer lives entirely inside
          the separate `ConversationPanel` (on mobile the two panels aren't
          even shown at once; on desktop they're independent scroll regions),
          so a pull here can never fight a focused input. */}
      <PullToRefresh
        scrollable
        onRefresh={() =>
          // DES-197: `invalidateQueries` forwards straight to
          // `refetchQueries`, which swallows a failed refetch in its own
          // `.catch(noop)` unless `throwOnError` is set (query-core's
          // `queryClient.js`); without this the promise below never
          // rejected, so `usePullToRefresh`'s existing failure toast never
          // fired. This is the one path where the member needs to actually
          // learn THIS specific pull failed, since the ambient query-error
          // toast stays deliberately suppressed while cached rows exist.
          queryClient.invalidateQueries(
            { queryKey: ["conversations"] },
            { throwOnError: true },
          )
        }
      >
        {children}
      </PullToRefresh>
    </div>
  );
}
