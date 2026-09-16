// src/features/messages/WhoReactedSheet.tsx
import { useId, useRef, useState } from "react";
import { Modal } from "../../shared/components/ui";
import { tabPanelProps } from "../../shared/components/ui/tabIds";
import type {
  MessageReactionKey,
  MessageReactor,
  ReactionSummary,
} from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReactionKeysInFlight } from "./api/useMessageActions";
import { useMessageReactors } from "./api/useMessageReactors";
import { REACTION_ORDER } from "./reactionKeys";
import { useCachedThreadMessages } from "./useCachedThreadMessages";
import { useWhoReactedFocusRecovery } from "./useWhoReactedFocusRecovery";
import { WhoReactedList } from "./WhoReactedList";
import { WhoReactedTabs, type ReactorFilter } from "./WhoReactedTabs";
import type { ChatMessage } from "./data";
import styles from "./WhoReactedSheet.module.css";

interface WhoReactedSurfaceProps {
  /** Server id of the message the sheet was opened for. */
  messageId: string;
  /** The open thread's real server id; null for a demo thread. */
  conversationId: string | null;
  /** The thread's existing reaction toggle, reused to remove the viewer's
   *  own reaction (no second reaction path). */
  onReactionToggle: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  onClose: () => void;
}

/**
 * PRD-352: "who reacted" for one message. The message is read live from the
 * thread cache (see `useCachedThreadMessages`), so the tab counts follow
 * reactions landing while the sheet is open, and a message deleted meanwhile
 * hides the sheet, the same as the Info surface. The reactor list is fetched
 * lazily and refetched whenever a reaction on the message changes.
 */
export function WhoReactedSurface({
  messageId,
  conversationId,
  onReactionToggle,
  onClose,
}: WhoReactedSurfaceProps) {
  const threadMessages = useCachedThreadMessages(conversationId);
  const message = threadMessages.find(
    (threadMessage) => threadMessage.id === messageId,
  );
  const isVisible = !!message && !message.deletedAt;
  const reactorsQuery = useMessageReactors(
    messageId,
    isVisible,
    conversationId,
  );
  const keysInFlight = useReactionKeysInFlight(messageId);
  /** Keys THIS sheet asked to remove whose removal has not settled yet. Local
   *  on purpose: inferring "already removed" from the thread cache's `mine`
   *  left the button inert forever for a reaction made on another device,
   *  whose own-echo the socket handler skips, so the cache never learns it. */
  const [requestedRemovalKeys, setRequestedRemovalKeys] = useState<
    MessageReactionKey[]
  >([]);
  // A requested removal settles once its toggle is no longer in flight and no
  // reactor refetch is running. On success the toggle's `onSuccess` starts the
  // refetch before the mutation leaves "pending", so the key stays held until
  // the fresh list (without the row) lands; on an error nothing refetches and
  // the button comes straight back. Adjusted during render, React's pattern
  // for state derived from changing inputs.
  const settledRemovalKeys = requestedRemovalKeys.filter(
    (key) => !keysInFlight.includes(key) && !reactorsQuery.isFetching,
  );
  if (settledRemovalKeys.length > 0) {
    setRequestedRemovalKeys(
      requestedRemovalKeys.filter((key) => !settledRemovalKeys.includes(key)),
    );
  }
  if (!message || !isVisible) return null;
  // Held from the tap until the removal settles, so a double tap never sends a
  // second DELETE whose delta patch would decrement the cached count again.
  const pendingRemovalKeys = REACTION_ORDER.filter(
    (key) => keysInFlight.includes(key) || requestedRemovalKeys.includes(key),
  );
  return (
    <WhoReactedSheet
      reactions={message.reactions ?? []}
      reactors={reactorsQuery.data ?? []}
      isLoading={reactorsQuery.isPending}
      // A failed background refetch keeps showing the list it already has.
      isError={reactorsQuery.isError && !reactorsQuery.data}
      onRetry={() => void reactorsQuery.refetch()}
      pendingRemovalKeys={pendingRemovalKeys}
      onRemove={(key) => {
        if (pendingRemovalKeys.includes(key)) return;
        setRequestedRemovalKeys([...requestedRemovalKeys, key]);
        onReactionToggle(message, key, true);
      }}
      onClose={onClose}
    />
  );
}

interface WhoReactedSheetProps {
  /** The message's live per-key summaries: the tabs and their counts. */
  reactions: ReactionSummary[];
  reactors: MessageReactor[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Own reaction keys whose removal is still settling; their remove button
   *  stays focusable but inert. */
  pendingRemovalKeys: MessageReactionKey[];
  /** Removes the viewer's own reaction with `key`. */
  onRemove: (key: MessageReactionKey) => void;
  onClose: () => void;
}

/** Filter tabs ("All N", then one per reaction key present, with its count)
 *  over the reactor rows, on the same `Modal` sheet as `GroupSeenBySheet`.
 *  Only the selected tab's panel is rendered. Focus that falls out of the
 *  sheet when its element unmounts comes back (`useWhoReactedFocusRecovery`). */
export function WhoReactedSheet({
  reactions,
  reactors,
  isLoading,
  isError,
  onRetry,
  pendingRemovalKeys,
  onRemove,
  onClose,
}: WhoReactedSheetProps) {
  const { t } = useTranslation();
  const tabsId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusRecovery = useWhoReactedFocusRecovery(tablistRef, panelRef);
  const [selectedFilter, setSelectedFilter] = useState<ReactorFilter>("all");
  const presentReactions = REACTION_ORDER.flatMap((key) => {
    const summary = reactions.find((reaction) => reaction.key === key);
    return summary && summary.count > 0 ? [summary] : [];
  });
  const totalCount = presentReactions.reduce(
    (sum, reaction) => sum + reaction.count,
    0,
  );
  // A key whose last reaction goes while its tab is selected falls back to All.
  const activeFilter: ReactorFilter = presentReactions.some(
    (reaction) => reaction.key === selectedFilter,
  )
    ? selectedFilter
    : "all";
  const visibleReactors =
    activeFilter === "all"
      ? reactors
      : reactors.filter((reactor) => reactor.key === activeFilter);

  return (
    <Modal title={t("messages:reactors.title")} onClose={onClose}>
      <WhoReactedTabs
        tablistRef={tablistRef}
        tabsId={tabsId}
        presentReactions={presentReactions}
        activeFilter={activeFilter}
        totalCount={totalCount}
        onSelect={setSelectedFilter}
        onFocus={focusRecovery.onTabsFocus}
      />
      <div
        ref={panelRef}
        {...tabPanelProps(tabsId, activeFilter)}
        className={styles.panel}
        onFocus={focusRecovery.onPanelFocus}
      >
        <WhoReactedList
          reactors={visibleReactors}
          isLoading={isLoading}
          isError={isError}
          onRetry={onRetry}
          pendingRemovalKeys={pendingRemovalKeys}
          onRemove={onRemove}
        />
      </div>
    </Modal>
  );
}
