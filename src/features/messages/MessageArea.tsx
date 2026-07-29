import { Fragment, useEffect, useRef, useState, type RefObject } from "react";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { MessageRunView, type RunParticipant } from "./MessageRun";
import { buildTimeline } from "./messageRuns";
import { SystemMessagePill } from "./SystemMessagePill";
import type { LongPressOrigin } from "./useLongPress";
import type { SeenByEntry } from "./groupReceipts";
import type { ChatMessage } from "./data";
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
  messageGroups: { day: string; items: ChatMessage[] }[];
  loadingOlder: boolean;
  onScroll: () => void;
  /** The message the "New messages" divider renders before (matched by reference). */
  dividerAnchorMessage: ChatMessage | undefined;
  counterpart: RunParticipant;
  counterpartName: string;
  /** GROUP thread → received runs carry per-sender name + avatar attribution. */
  isGroup?: boolean;
  /** True while the counterpart is typing — renders an in-list typing bubble at
   *  the bottom of the log (reuses the signal from `useTypingIndicator`; always
   *  false in demo mode without the socket, but demo simulates it live). */
  counterpartTyping?: boolean;
  /** Resolved typing label ("Ana is typing…" / "Ana and Bea are typing…" /
   *  "Several people are typing…") — the typing bubble's accessible name, and
   *  (for groups) shown as visible text above the dots. */
  typingLabel?: string;
  /** GROUP → show `typingLabel` as visible text (a group needs to name WHO is
   *  typing; a DM's single counterpart is already named by the header). */
  showTypingText?: boolean;
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
  messageGroups,
  loadingOlder,
  onScroll,
  dividerAnchorMessage,
  counterpart,
  counterpartName,
  isGroup,
  counterpartTyping,
  typingLabel,
  showTypingText,
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
        {messageGroups.map((group) => (
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
            {buildTimeline(group.items, undefined, dividerAnchorMessage).map(
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
            above the composer. It renders at the very bottom of the log, so it
            grows the content and the scroll hook's ResizeObserver keeps a
            pinned reader anchored to it. The polite live region announces the
            counterpart typing once (dots are decorative → aria-hidden). */}
        {counterpartTyping && (
          <div className={styles.typingRow}>
            <div className={styles.runAvatar}>
              <Avatar
                initials={counterpart.initials}
                tint={counterpart.tint}
                src={counterpart.src}
                size={28}
              />
            </div>
            <div
              className={styles.typingBubble}
              role="status"
              aria-live="polite"
              aria-label={
                typingLabel ??
                t("messages:conversation.typing", {
                  name: counterpartName.split(" ")[0],
                })
              }
            >
              {showTypingText && typingLabel && (
                <span className={styles.typingLabel}>{typingLabel}</span>
              )}
              <span className={styles.typingDot} aria-hidden="true" />
              <span className={styles.typingDot} aria-hidden="true" />
              <span className={styles.typingDot} aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
