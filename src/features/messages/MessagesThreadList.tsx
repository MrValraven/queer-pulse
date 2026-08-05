import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiMessageCircle } from "react-icons/fi";
import { paneScrollRegistry } from "../../app/paneScrollRegistry";
import {
  EmptyState,
  FadeIn,
  FeatureHelp,
  PullToRefresh,
  SearchInput,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { MessagesSearchResults } from "./MessagesSearchResults";
import { MessageThreadListSkeleton } from "./MessagesSkeleton";
import { MessagesThreadRow } from "./MessagesThreadRow";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * The element that actually scrolls inside `.threadList`. `PullToRefresh` nests
 * its own `overflow-y: auto; height: 100%` scroller as the direct child, so the
 * rows overflow THAT element while `.threadList`'s single child fits it exactly
 * — meaning the inner one is the real scroll surface. Register that so
 * scroll-to-top / per-navigation restore act on the surface that moves, falling
 * back to `.threadList` itself if the structure ever changes.
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(
    null,
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
      <div className={styles.tpTop}>
        <div className={styles.tpHeadRow}>
          <div className={styles.tpTitle}>
            {t("messages:thread.title")}
            <FeatureHelp id="messages.inbox" />
          </div>
          <div className={styles.tpHeadActions}>
            <button
              type="button"
              className={styles.composeBtn}
              title={t("messages:group.newTooltip")}
              aria-label={t("messages:group.newTooltip")}
              onClick={onComposeGroup}
            >
              <svg
                width={17}
                height={17}
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <circle cx="7" cy="7.5" r="2.6" stroke="currentColor" strokeWidth={1.5} />
                <path
                  d="M2.5 15.5c0-2.2 2-3.6 4.5-3.6s4.5 1.4 4.5 3.6"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <circle cx="14" cy="6.5" r="2" stroke="currentColor" strokeWidth={1.5} />
                <path
                  d="M13 11.2c2.2 0 4 1.2 4 3.3"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={styles.composeBtn}
              title={t("messages:thread.composeTooltip")}
              aria-label={t("messages:thread.composeTooltip")}
              onClick={onCompose}
            >
              <svg
                width={15}
                height={15}
                viewBox="0 0 15 15"
                fill="none"
                aria-hidden
              >
                <path
                  d="M10.5 2L13 4.5l-7 7H3.5V9l7-7Z"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                <path
                  d="M2 13h11"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder={t("messages:thread.searchPlaceholder")}
          ariaLabel={t("messages:thread.searchAria")}
        />
      </div>

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
          {loading && <MessageThreadListSkeleton count={6} />}
          {/* Query present → the unified search view: name-matched conversations
              (already filtered by the controller into `threads`) alongside
              cross-conversation message-body hits. */}
          {!loading && query.trim() && (
            <MessagesSearchResults
              query={query}
              threads={threads}
              activeId={activeId}
              readIds={readIds}
              onOpen={onOpen}
              onRequestDelete={setConfirmDelete}
              onSelectResult={onSelectResult}
              onClearSearch={() => onQueryChange("")}
            />
          )}
          {!loading && !query.trim() && threads.length === 0 && (
            <EmptyState
              compact
              icon={<FiMessageCircle />}
              title={t("messages:thread.emptyTitle")}
              description={t("messages:thread.emptyDescription")}
              action={{
                label: t("messages:thread.newMessage"),
                onClick: onCompose,
              }}
            />
          )}
          {!loading &&
            !query.trim() &&
            threads.map((thread, index) => (
              <FadeIn key={thread.id} delay={Math.min(index, 8) * 60}>
                <MessagesThreadRow
                  thread={thread}
                  activeId={activeId}
                  readIds={readIds}
                  onOpen={onOpen}
                  onRequestDelete={setConfirmDelete}
                />
              </FadeIn>
            ))}
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
