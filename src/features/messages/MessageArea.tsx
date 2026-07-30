import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { MessageRunView, type RunParticipant } from "./MessageRun";
import { buildTimeline } from "./messageRuns";
import { SystemMessagePill } from "./SystemMessagePill";
import { TypingIndicatorRow } from "./TypingIndicatorRow";
import type { LongPressOrigin } from "./useLongPress";
import type { SeenByEntry } from "./groupReceipts";
import type { ChatMessage, GroupMemberView } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * `day` is a stable canonical id ("Today" / "Yesterday", or an already
 * locale-formatted date string from the adapter) — only the two chrome buckets
 * computed client-side resolve through the catalog; any other value is a date
 * string rendered as-is.
 */
function dayHeading(day: string, t: TFunction): string {
  if (day === "Today") return t("messages:day.today");
  if (day === "Yesterday") return t("messages:day.yesterday");
  return day;
}

/** Stable identity of a message for continuity tracking: the server id, or the
 *  ISO timestamp as a fallback. Demo/optimistic messages have neither → the
 *  live-region announcer treats them as unannounceable (undefined). */
function messageKey(message: ChatMessage): string | undefined {
  return message.id ?? message.at;
}

/** Every stable identity a message may be known under across its lifetime: the
 *  server id, the client-generated `localId` (set while an optimistic send is
 *  still in flight), and the ISO timestamp as a last resort. A message keeps
 *  ALL of these once acquired (an acked optimistic send gains an `id` but
 *  keeps its original `localId`) — `useMessageNewness` below treats a message
 *  as new only when NONE of its current identities have been seen before, so
 *  gaining an `id` on ack never makes an already-on-screen bubble "new" again. */
function messageIdentities(message: ChatMessage): string[] {
  return [message.id, message.localId, message.at].filter(
    (identity): identity is string => !!identity,
  );
}

/** Composite identity for one reaction chip on a message — only meaningful
 *  once the message has a server id (reactions don't exist on demo/optimistic
 *  messages, see `ChatMessage.reactions`). */
function reactionIdentity(message: ChatMessage, key: string): string | undefined {
  return message.id ? `${message.id}::reaction::${key}` : undefined;
}

/** Every message + reaction-chip identity currently in `messageGroups`, as a
 *  fresh `Set` (a plain value, never a persisted mutable reference — safe to
 *  compute directly in a render body). */
function collectAllIdentities(
  messageGroups: { day: string; items: ChatMessage[] }[],
): Set<string> {
  const identities = new Set<string>();
  for (const group of messageGroups) {
    for (const message of group.items) {
      for (const identity of messageIdentities(message)) {
        identities.add(identity);
      }
      for (const reaction of message.reactions ?? []) {
        if (reaction.count <= 0) continue;
        const identity = reactionIdentity(message, reaction.key);
        if (identity) identities.add(identity);
      }
    }
  }
  return identities;
}

/**
 * Tracks which message + reaction-chip identities have already been on
 * screen for this conversation, so the `msgBubbleIn` entrance plays ONLY for
 * a genuinely new arrival — never for the whole thread on open/switch (which
 * would animate 20-50 bubbles/chips at once, a "swarm"), and never replayed
 * for a message/chip an unrelated re-render happens to touch again.
 *
 * Two layers, deliberately split so neither needs a ref read/write in the
 * render body (`react-hooks/refs` disallows that outright):
 *  - `baseSeenSet` (real state) is everything that was ALREADY on screen the
 *    moment we most recently arrived at `conversationId`. Reseeded via
 *    React's sanctioned "adjust state while rendering" idiom (matching
 *    `useFeedPage.tsx`'s `prevDemo` pattern) — calling `setState` directly in
 *    the render body when `conversationId` has changed causes React to
 *    re-render immediately with the corrected value BEFORE any child (a
 *    bubble's own mount-time `playEntrance` decision) ever sees it, so even
 *    the FIRST paint of a freshly opened thread treats every message/chip in
 *    it as already-known. Because this only changes on an actual thread
 *    switch, `isNewMessage`/`isNewReaction`'s `useCallback` reference below
 *    stays stable across ordinary new-message arrivals within the same
 *    thread — passing them to the memoized `MessageRunView`/`MessageBubble`
 *    tree doesn't defeat that memoization on every message.
 *  - `accumulatedRef` (a plain ref) layers in everything that has arrived
 *    SINCE the thread settled — written only inside the `useLayoutEffect`s
 *    below, never at the top level of render, and read only from inside the
 *    `useCallback` bodies (which run later, as event/render-prop callbacks,
 *    not synchronously in this hook's own render flow) — the same shape
 *    `useMessageScroll`'s `handleAreaScroll` already uses for `areaRef`.
 */
function useMessageNewness(
  conversationId: string,
  messageGroups: { day: string; items: ChatMessage[] }[],
) {
  const [settledConversationId, setSettledConversationId] = useState(conversationId);
  const [baseSeenSet, setBaseSeenSet] = useState(() => collectAllIdentities(messageGroups));
  if (conversationId !== settledConversationId) {
    setSettledConversationId(conversationId);
    setBaseSeenSet(collectAllIdentities(messageGroups));
  }

  const accumulatedRef = useRef<Set<string>>(new Set());

  // Thread switch: drop whatever the PREVIOUS conversation accumulated — it's
  // for a different set of message ids and would just grow this ref forever
  // across a long session otherwise. Declared before the mark-effect below so
  // it clears first within the same commit when both fire together.
  useLayoutEffect(() => {
    accumulatedRef.current = new Set();
  }, [conversationId]);

  useLayoutEffect(() => {
    for (const identity of collectAllIdentities(messageGroups)) {
      accumulatedRef.current.add(identity);
    }
  }, [messageGroups]);

  const isNewMessage = useCallback(
    (message: ChatMessage): boolean => {
      const identities = messageIdentities(message);
      if (identities.length === 0) return false;
      return identities.every(
        (identity) => !baseSeenSet.has(identity) && !accumulatedRef.current.has(identity),
      );
    },
    [baseSeenSet],
  );

  const isNewReaction = useCallback(
    (message: ChatMessage, key: MessageReactionKey): boolean => {
      const identity = reactionIdentity(message, key);
      if (!identity) return false;
      return !baseSeenSet.has(identity) && !accumulatedRef.current.has(identity);
    },
    [baseSeenSet],
  );

  return { isNewMessage, isNewReaction };
}

/**
 * Announces ONLY genuinely-new inbound messages to a polite live region — never
 * history loads (the tail message is unchanged when older pages prepend above)
 * and never thread switches (the previously-tracked tail message is absent from
 * the freshly-loaded list, so we re-seed silently instead of reading it out).
 * The signed-in member's own sends are never announced. Returns the string to
 * render inside the sr-only region; empty until the first real arrival.
 */
function useNewIncomingAnnouncement(
  messageGroups: { day: string; items: ChatMessage[] }[],
  counterpartName: string,
  t: TFunction,
): string {
  const [announcement, setAnnouncement] = useState("");
  const lastTailKeyRef = useRef<string | undefined>(undefined);
  const initializedRef = useRef(false);

  useEffect(() => {
    const flat = messageGroups.flatMap((group) => group.items);
    const tail = flat[flat.length - 1];
    const tailKey = tail ? messageKey(tail) : undefined;
    const previousTailKey = lastTailKeyRef.current;

    // Tail unchanged (older history prepended above, or an unrelated re-render)
    // → nothing arrived at the bottom, so there is nothing new to announce.
    if (initializedRef.current && tailKey === previousTailKey) return;

    // Continuity check: is the message we last tracked as the tail still present
    // in this list? If so, messages were appended to the SAME thread. If it's
    // gone, the whole list was replaced (thread switch) → re-seed silently.
    const keys = new Set(flat.map(messageKey));
    const isContinuation =
      initializedRef.current &&
      previousTailKey !== undefined &&
      keys.has(previousTailKey);

    lastTailKeyRef.current = tailKey;
    initializedRef.current = true;

    if (
      isContinuation &&
      tail &&
      tail.from === "them" &&
      tailKey !== undefined &&
      !tail.deletedAt
    ) {
      const snippet = tail.text.trim().slice(0, 120);
      setAnnouncement(
        t("messages:conversation.newMessageAnnouncement", {
          name: counterpartName,
          snippet,
        }),
      );
    }
  }, [messageGroups, counterpartName, t]);

  return announcement;
}

export interface MessageAreaProps {
  areaRef: RefObject<HTMLDivElement | null>;
  /** Wraps the day-groups + typing row as ONE stable node for
   *  `useMessageScroll`'s resize-follow `ResizeObserver` to watch — see that
   *  hook's `contentRef` comment. */
  contentRef: RefObject<HTMLDivElement | null>;
  messageGroups: { day: string; items: ChatMessage[] }[];
  loadingOlder: boolean;
  onScroll: () => void;
  /** The message the "New messages" divider renders before (matched by reference). */
  dividerAnchorMessage: ChatMessage | undefined;
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
  onScroll,
  dividerAnchorMessage,
  counterpart,
  counterpartName,
  isGroup,
  conversationId,
  groupMembers,
  groupSeenBy,
  onOpenSeenBy,
  onRetry,
  seenActive,
  deliveredActive,
  lastOutbound,
  onReactionToggle,
  onReply,
  onOpenActions,
  editingMessageId,
  onBeginEdit,
  onSubmitEdit,
  onCancelEdit,
  onJumpToMessage,
}: MessageAreaProps) {
  const { t } = useTranslation();
  const liveAnnouncement = useNewIncomingAnnouncement(
    messageGroups,
    counterpartName,
    t,
  );
  // Gates each bubble/reaction-chip entrance to a genuine first arrival —
  // see `useMessageNewness` above.
  const { isNewMessage, isNewReaction } = useMessageNewness(
    conversationId,
    messageGroups,
  );
  // Each day-group's timeline (sender runs + system pills), built once per
  // `messageGroups`/`dividerAnchorMessage` change instead of on every render —
  // `messageGroups` is already a stable memoized reference upstream, and
  // `dividerAnchorMessage` is a latched ref value, so this only re-walks the
  // messages when the thread's actual content changes.
  const timeline = useMemo(
    () =>
      messageGroups.map((group) => ({
        day: group.day,
        blocks: buildTimeline(group.items, undefined, dividerAnchorMessage),
      })),
    [messageGroups, dividerAnchorMessage],
  );
  return (
    <>
      {/* Scoped live region: announces ONLY new inbound messages (see the
          hook). Kept OUTSIDE the log so prepending history or switching threads
          never dumps the whole thread to a screen reader. */}
      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveAnnouncement}
      </div>
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
        {loadingOlder && (
          <div className={styles.loadingOlder}>
            {t("messages:conversation.loadingOlder")}
          </div>
        )}
        {/* The ONE node `useMessageScroll`'s resize-follow ResizeObserver
            watches (see its `contentRef` comment) — a plain in-flow wrapper,
            so its own box grows with any descendant (a late image, an added
            reaction, an expanding inline edit), unlike `.area` itself, whose
            `overflow-y: auto` box never changes size. */}
        <div className={styles.areaContent} ref={contentRef}>
        {timeline.map((group) => (
          <div key={group.day} className={styles.dayGroup}>
            <div
              className={styles.daySep}
              role="separator"
              aria-label={t("messages:day.separatorLabel", {
                day: dayHeading(group.day, t),
              })}
            >
              <span className={styles.daySepLabel} aria-hidden="true">
                {dayHeading(group.day, t)}
              </span>
            </div>
            <div className={styles.runs} role="list">
            {group.blocks.map(
              (block, index) => {
                // A system block anchors on its own message; a run block on its
                // first bubble — either can carry the unread divider before it.
                const anchor =
                  block.kind === "run" ? block.run.items[0] : block.message;
                const blockKey =
                  (block.kind === "run"
                    ? block.run.items[0]?.id
                    : block.message.id) ?? `${group.day}-block-${index}`;
                const showDivider =
                  dividerAnchorMessage !== undefined &&
                  anchor === dividerAnchorMessage;
                return (
                  <Fragment key={blockKey}>
                    {showDivider && (
                      <div
                        className={styles.unreadDivider}
                        role="separator"
                        aria-label={t(
                          "messages:conversation.unreadDividerAria",
                        )}
                      >
                        <span aria-hidden="true">
                          {t("messages:conversation.unreadDivider")}
                        </span>
                      </div>
                    )}
                    {block.kind === "system" ? (
                      block.message.systemEvent && (
                        <SystemMessagePill event={block.message.systemEvent} />
                      )
                    ) : (
                      <MessageRunView
                        run={block.run}
                        counterpart={counterpart}
                        selfName={t("messages:conversation.you")}
                        counterpartName={counterpartName}
                        isGroup={isGroup}
                        onRetry={onRetry}
                        showSeen={
                          seenActive &&
                          block.run.items[block.run.items.length - 1] ===
                            lastOutbound
                        }
                        showDelivered={
                          deliveredActive &&
                          block.run.items[block.run.items.length - 1] ===
                            lastOutbound
                        }
                        onReactionToggle={onReactionToggle}
                        onReply={onReply}
                        onOpenActions={onOpenActions}
                        editingMessageId={editingMessageId}
                        onBeginEdit={onBeginEdit}
                        onSubmitEdit={onSubmitEdit}
                        onCancelEdit={onCancelEdit}
                        onJumpToMessage={onJumpToMessage}
                        isNewMessage={isNewMessage}
                        isNewReaction={isNewReaction}
                      />
                    )}
                    {/* Group "Seen by N": a tappable receipt under the run that
                        ends with the caller's latest message. DMs use the jade
                        double-check tick instead (rendered in the bubble). */}
                    {block.kind === "run" &&
                      isGroup &&
                      groupSeenBy &&
                      groupSeenBy.length > 0 &&
                      block.run.items[block.run.items.length - 1] ===
                        lastOutbound && (
                        <button
                          type="button"
                          className={styles.groupSeenByLine}
                          onClick={onOpenSeenBy}
                        >
                          {t("messages:group.seenByCount", {
                            count: groupSeenBy.length,
                          })}
                        </button>
                      )}
                  </Fragment>
                );
              },
            )}
            </div>
          </div>
        ))}
        {/* In-list typing indicator: styled as an incoming bubble on the left
            (same avatar + alignment as a received run) so the signal lives
            inside the conversation flow (WhatsApp/Signal-style) instead of only
            above the composer. Rendered at the very bottom of the log, so it
            grows the content and the scroll hook's ResizeObserver keeps a
            pinned reader anchored to it. It subscribes to typing frames
            INTERNALLY, so a typing frame re-renders only this leaf — never this
            component or the log above it. */}
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
