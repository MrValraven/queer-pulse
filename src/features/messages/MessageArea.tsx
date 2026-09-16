import { type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { type RunParticipant } from "./MessageRun";
import { MessageLogRows } from "./MessageLogRows";
import { MessageJumpStatus } from "./MessageJumpStatus";
import { MessageThreadOfflineEmptyState } from "./MessageThreadOfflineEmptyState";
import { useReactionNewness } from "./useReactionNewness";
import { useNewIncomingAnnouncement } from "./useNewIncomingAnnouncement";
import type { MessageRow } from "./messageRows";
import { TypingIndicatorRow } from "./TypingIndicatorRow";
import type { LongPressOrigin } from "./useLongPress";
import type { SeenByEntry } from "./groupReceipts";
import type { ChatMessage, GroupMemberView } from "./data";
import styles from "./MessagesPage.module.css";

export interface MessageAreaProps {
  areaRef: RefObject<HTMLDivElement | null>;
  /** Wraps the virtualized sizer + typing row as ONE stable node for
   *  `useMessageScroll`'s resize-follow `ResizeObserver` to watch — see that
   *  hook's `contentRef` comment. */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Only used for the live-region "new message" announcement and the
   *  entrance-animation freshness gate below — rendering itself is driven
   *  entirely by `rows`/`rowVirtualizer` (see `useMessageRowVirtualizer`). */
  messageGroups: { day: string; items: ChatMessage[] }[];
  /** The flattened, virtualizer-keyed row list (day separators, the unread
   *  divider, runs, system pills, the group "Seen by" line) built once
   *  upstream by `useMessageRowVirtualizer` from the same `messageGroups`. */
  rows: MessageRow[];
  /** The `@tanstack/react-virtual` instance driving which rows actually
   *  mount, built alongside `rows` so both stay in lock-step. */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  loadingOlder: boolean;
  /** True when the offline stand-in session (PRD-375) opened this thread and
   *  the device never saved it: there is nothing to render and no network to
   *  fetch it with, so a short explanation replaces the (otherwise empty and
   *  permanently pending) log. */
  isThreadUnsavedOffline?: boolean;
  onScroll: () => void;
  counterpart: RunParticipant;
  counterpartName: string;
  /** GROUP thread → received runs carry per-sender name + avatar attribution. */
  isGroup?: boolean;
  /** The open thread's id — passed straight through to `TypingIndicatorRow`,
   *  which subscribes to typing frames internally so they never re-render
   *  this component or the log above it. */
  conversationId: string;
  /** GROUP roster, forwarded to `TypingIndicatorRow` to resolve WHO is typing. */
  groupMembers?: GroupMemberView[];
  /** GROUP "Seen by N": members who've seen the last outbound message. Rendered
   *  as a tappable receipt under that message; empty → nothing shown. */
  groupSeenBy?: SeenByEntry[];
  /** Opens the "Seen by" sheet (the full read list with times). */
  onOpenSeenBy?: () => void;
  onRetry: (message: ChatMessage) => void;
  /** True when the counterpart's read watermark has caught the last outbound message. */
  seenActive: boolean;
  /** True when the counterpart's DELIVERED watermark has caught the last outbound
   *  message (one rung below `seenActive`). */
  deliveredActive: boolean;
  lastOutbound: ChatMessage | undefined;
  onReactionToggle: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  /** Arms a reply to `message` (swipe-to-reply on touch; same handler the
   *  long-press overlay's Reply calls). Undefined disables the gesture. */
  onReply?: (message: ChatMessage) => void;
  /** Opens the long-press/right-click action menu for `message`. */
  onOpenActions?: (
    message: ChatMessage,
    origin: LongPressOrigin,
    isSent: boolean,
  ) => void;
  /** Server id of the message currently showing the inline editor, if any. */
  editingMessageId?: string | null;
  /** Opens the inline editor for `message`. */
  onBeginEdit?: (message: ChatMessage) => void;
  /** Saves the inline editor's current text for `message`. */
  onSubmitEdit?: (message: ChatMessage, nextBody: string) => void;
  /** Closes the inline editor without saving. */
  onCancelEdit?: () => void;
  /** Scrolls to and briefly highlights the message with this server id. */
  onJumpToMessage?: (messageId: string) => void;
}

/** The scrolling conversation log: older-history spinner, day-grouped runs, and
 *  the unread divider. Scroll behaviour is owned by the parent via `areaRef`. */
export function MessageArea({
  areaRef,
  contentRef,
  messageGroups,
  loadingOlder,
  isThreadUnsavedOffline = false,
  onScroll,
  counterpart,
  counterpartName,
  isGroup,
  conversationId,
  groupMembers,
  groupSeenBy,
  ...rowProps
}: MessageAreaProps) {
  const { t } = useTranslation();
  const liveAnnouncement = useNewIncomingAnnouncement(
    messageGroups,
    isGroup === true,
    counterpartName,
    t,
  );
  // Gates each reaction chip's pop to a genuine first arrival — see
  // `useReactionNewness`.
  const { isNewReaction } = useReactionNewness(conversationId, messageGroups);
  return (
    <>
      {/* Scoped live region, the log's ONLY one: announces new inbound messages
          and live system events (see the hook). Kept OUTSIDE the log so
          prepending history or switching threads never dumps the whole thread
          to a screen reader. The inner node is keyed on the announced message,
          so an identical repeat ("ok", "ok") replaces the node and is read
          again. */}
      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveAnnouncement ? (
          <span key={liveAnnouncement.key}>{liveAnnouncement.text}</span>
        ) : null}
      </div>
      {/* Jump-to-message status ("finding it" / couldn't reach it) and the
          older-history loading pill, overlaid on the top of the log from a
          zero-height slot outside the scroller, so neither shifts the log. */}
      <MessageJumpStatus
        conversationId={conversationId}
        isLoadingOlder={loadingOlder}
      />
      <div
        className={styles.area}
        ref={areaRef}
        // role="log" implies an assertive-free live region; we set aria-live
        // "off" so the log itself stays silent and the scoped region above owns
        // all announcements — otherwise history/thread-switch additions would be
        // read out too.
        role="log"
        aria-live="off"
        onScroll={onScroll}
      >
        {/* The ONE node `useMessageScroll`'s resize-follow ResizeObserver
            watches (see its `contentRef` comment) — a plain in-flow wrapper,
            so its own box grows with any descendant (a late image, an added
            reaction, an expanding inline edit, or the virtualized sizer below
            correcting an estimated row to its measured height), unlike
            `.area` itself, whose `overflow-y: auto` box never changes size. */}
        <div className={styles.areaContent} ref={contentRef}>
          {/* The virtualized sizer, its rows and the floating day pill; see
              `MessageLogRows`. Swapped for a short explanation when the
              offline stand-in session opened a thread the device never
              saved (PRD-375 gap 6), so the log never renders blank there. */}
          {isThreadUnsavedOffline ? (
            <MessageThreadOfflineEmptyState />
          ) : (
            <MessageLogRows
              {...rowProps}
              areaRef={areaRef}
              conversationId={conversationId}
              counterpart={counterpart}
              counterpartName={counterpartName}
              isGroup={isGroup}
              groupSeenByCount={groupSeenBy?.length ?? 0}
              isNewReaction={isNewReaction}
            />
          )}
          {/* In-list typing indicator: styled as an incoming bubble on the left
              (same avatar + alignment as a received run) so the signal lives
              inside the conversation flow (WhatsApp/Signal-style) instead of only
              above the composer. Rendered at the very bottom of the log, so it
              grows the content and the scroll hook's ResizeObserver keeps a
              pinned reader anchored to it. It subscribes to typing frames
              INTERNALLY, so a typing frame re-renders only this leaf — never this
              component or the log above it. Kept OUTSIDE the virtualized sizer:
              it's always exactly one instance, so it never needs windowing. */}
          <TypingIndicatorRow
            conversationId={conversationId}
            counterpart={counterpart}
            counterpartName={counterpartName}
            isGroup={isGroup}
            members={groupMembers}
          />
        </div>
      </div>
    </>
  );
}
