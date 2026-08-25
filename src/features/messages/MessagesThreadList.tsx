import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { paneScrollRegistry } from "../../app/paneScrollRegistry";
import { PullToRefresh } from "../../shared/components/ui";
import { useMessageRequestsCount } from "./api/useMessageRequestsCount";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { MessagesThreadListBody } from "./MessagesThreadListBody";
import { MessagesThreadListHeader } from "./MessagesThreadListHeader";
import { filterThreadsByTab, type InboxTab } from "./threadFilters";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * The element that actually scrolls inside `.threadList`. `PullToRefresh`
 * nests its own `overflow-y: auto; height: 100%` scroller as the direct
 * child, so the rows overflow THAT element while `.threadList`'s single
 * child fits it exactly — meaning the inner one is the real scroll surface.
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

export function MessagesThreadList({
  loading,
  threads,
  activeId,
  readIds,
  query,
  onQueryChange,
  onOpen,
  onCompose,
  onComposeGroup,
  onDelete,
  onSelectResult,
  deletePending,
}: {
  loading: boolean;
  threads: Conversation[];
  activeId: string;
  readIds: Set<string>;
  query: string;
  onQueryChange: (value: string) => void;
  onOpen: (id: string) => void;
  onCompose: () => void;
  /** Opens the create-group picker. */
  onComposeGroup: () => void;
  onDelete: (id: string) => void;
  /** Opens the result's conversation and (when the hit carries a server message
   *  id) jumps to that bubble. */
  onSelectResult: (conversationId: string, messageId?: string) => void;
  deletePending: boolean;
}) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);
  // All/Unread/Favorites/Groups/Requests — local UI state, doesn't need to
  // persist. Reset to "All" whenever a search starts so leaving the search
  // view never strands the list on a stale filter the user can't see the
  // control for.
  const [activeTab, setActiveTab] = useState<InboxTab>("all");
  const requestsCount = useMessageRequestsCount();
  const searching = !loading && query.trim().length > 0;
  // Tabs stay visible whenever there's SOMETHING to filter — either an actual
  // conversation, or a pending message request (a brand-new member with
  // requests but no conversations yet must still be able to reach the
  // Requests tab, not just members who already have a thread).
  const showTabs =
    !loading && !searching && (threads.length > 0 || requestsCount > 0);
  const visibleThreads = useMemo(
    () => filterThreadsByTab(threads, activeTab, activeId, readIds),
    [threads, activeTab, activeId, readIds],
  );
  // The count the pin-toggle mutation caps against — the whole inbox
  // (pre-tab-filter), so pinning from inside e.g. the Favorites tab still
  // enforces the real cap.
  const pinnedCount = useMemo(
    () => threads.filter((thread) => !!thread.pinnedAt).length,
    [threads],
  );

  // The inbox list is this fullHeight route's own scroll surface (the window
  // doesn't move). Register it so ScrollManager can restore/reset its offset per
  // navigation and honour a tap-on-the-active-tab scroll-to-top — the pane half
  // of the internally-scrolled scroll logic (see paneScrollRegistry).
  const threadListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = threadListRef.current;
    if (!root) return;
    return paneScrollRegistry.register(resolveScrollContainer(root));
  }, []);
  return (
    <div className={styles.threadPanel}>
      <MessagesThreadListHeader
        query={query}
        onQueryChange={(value) => {
          if (value.trim()) setActiveTab("all");
          onQueryChange(value);
        }}
        onCompose={onCompose}
        onComposeGroup={onComposeGroup}
        showTabs={showTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        requestsCount={requestsCount}
      />

      <div className={styles.threadList} ref={threadListRef}>
        {/* `queryKey: ["conversations"]` matches useConversations' inline
            `["conversations", demoMode, deletedToken]` as a prefix — the same
            convention every conversations mutation in this feature already
            uses to invalidate the inbox (useMessageActions/useMessageMutations).
            No `disabled` gate: this panel is the thread LIST, which carries no
            composer of its own — the message composer lives entirely inside
            the separate `ConversationPanel` (on mobile the two panels aren't
            even shown at once; on desktop they're independent scroll regions),
            so a pull here can never fight a focused input. */}
        <PullToRefresh
          scrollable
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ["conversations"] })
          }
        >
          <MessagesThreadListBody
            loading={loading}
            searching={searching}
            query={query}
            threads={threads}
            visibleThreads={visibleThreads}
            activeTab={activeTab}
            activeId={activeId}
            readIds={readIds}
            pinnedCount={pinnedCount}
            onOpen={onOpen}
            onCompose={onCompose}
            onQueryChange={onQueryChange}
            onSelectResult={onSelectResult}
            onRequestDelete={setConfirmDelete}
          />
        </PullToRefresh>
      </div>
      {confirmDelete && (
        <DeleteConversationDialog
          name={confirmDelete.name}
          pending={deletePending}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => {
            onDelete(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
