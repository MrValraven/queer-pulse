// src/features/messages/MessageAreaRow.tsx
import { memo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { MessageRunView, type RunParticipant } from "./MessageRun";
import { SystemMessagePill } from "./SystemMessagePill";
import type { LongPressOrigin } from "./useLongPress";
import type { ChatMessage } from "./data";
import type { MessageRow } from "./messageRows";
import styles from "./MessagesPage.module.css";

/**
 * `day` is a stable canonical id ("Today" / "Yesterday", or an already
 * locale-formatted date string from the adapter) — only the two chrome
 * buckets computed client-side resolve through the catalog; any other value
 * is a date string rendered as-is.
 */
function dayHeading(day: string, t: TFunction): string {
  if (day === "Today") return t("messages:day.today");
  if (day === "Yesterday") return t("messages:day.yesterday");
  return day;
}

export interface MessageAreaRowProps {
  row: MessageRow;
  /** This row's position in the virtualizer's row list — required on
   *  `data-index` for `@tanstack/react-virtual`'s measurement bookkeeping. */
  index: number;
  /** `@tanstack/react-virtual`'s measurement ref — reports this row's real
   *  rendered height back to the virtualizer once mounted. */
  measureElementRef: (node: Element | null) => void;
  /** This row's absolute offset from the top of the virtualized sizer. */
  top: number;
  /** Reproduces the flex `gap` this row used to get for free — see
   *  `gapAfterRow` in `messageRows.ts`. */
  paddingBottomPx: number;
  counterpart: RunParticipant;
  counterpartName: string;
  isGroup?: boolean;
  onRetry: (message: ChatMessage) => void;
  lastOutbound: ChatMessage | undefined;
  seenActive: boolean;
  deliveredActive: boolean;
  groupSeenByCount: number;
  onOpenSeenBy?: () => void;
  onReactionToggle: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  onReply?: (message: ChatMessage) => void;
  onOpenActions?: (
    message: ChatMessage,
    origin: LongPressOrigin,
    isSent: boolean,
  ) => void;
  editingMessageId?: string | null;
  onBeginEdit?: (message: ChatMessage) => void;
  onSubmitEdit?: (message: ChatMessage, nextBody: string) => void;
  onCancelEdit?: () => void;
  onJumpToMessage?: (messageId: string) => void;
  isNewMessage: (message: ChatMessage) => boolean;
  isNewReaction: (message: ChatMessage, key: MessageReactionKey) => boolean;
}

/** Renders ONE virtualized row: a day separator, the one-time unread divider,
 *  a grouped message run, a system event pill, or the group "Seen by N" line
 *  — whichever `row.kind` this virtual item is. Positioned by the caller
 *  (`MessageArea`) via `top`; this component owns only its own content and
 *  the `paddingBottom` that stands in for the old inter-row flex `gap`. */
function MessageAreaRowImpl({
  row,
  index,
  measureElementRef,
  top,
  paddingBottomPx,
  counterpart,
  counterpartName,
  isGroup,
  onRetry,
  lastOutbound,
  seenActive,
  deliveredActive,
  groupSeenByCount,
  onOpenSeenBy,
  onReactionToggle,
  onReply,
  onOpenActions,
  editingMessageId,
  onBeginEdit,
  onSubmitEdit,
  onCancelEdit,
  onJumpToMessage,
  isNewMessage,
  isNewReaction,
}: MessageAreaRowProps) {
  const { t } = useTranslation();
  return (
    <div
      ref={measureElementRef}
      data-index={index}
      // Every virtualized row — a message run, a day separator, the unread
      // divider, a system pill, or the group "Seen by" line — is a direct
      // DOM child of `.virtualSizer`'s `role="list"` (see `MessageArea`).
      // ARIA's `list` role only permits `listitem`/`group` as owned elements,
      // so EVERY row gets `listitem` here, uniformly, regardless of kind —
      // never just the `run` rows (that was the bug: a `role="list"` whose
      // separator/divider/system rows carried no `listitem` at all). Rows
      // that aren't a message stay distinguishable to a screen reader via
      // their OWN inner role (`separator` for day/unread breaks, `status` for
      // system pills) nested inside this listitem — a listitem containing a
      // separator is valid ARIA; a list containing a non-listitem child is not.
      role="listitem"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${top}px)`,
        paddingBottom: paddingBottomPx,
      }}
    >
      {row.kind === "daySeparator" && (
        <div
          className={styles.daySep}
          role="separator"
          aria-label={t("messages:day.separatorLabel", {
            day: dayHeading(row.day, t),
          })}
        >
          <span className={styles.daySepLabel} aria-hidden="true">
            {dayHeading(row.day, t)}
          </span>
        </div>
      )}
      {row.kind === "unreadDivider" && (
        <div
          className={styles.unreadDivider}
          role="separator"
          aria-label={t("messages:conversation.unreadDividerAria")}
        >
          <span aria-hidden="true">{t("messages:conversation.unreadDivider")}</span>
        </div>
      )}
      {row.kind === "system" &&
        row.message.systemEvent && <SystemMessagePill event={row.message.systemEvent} />}
      {row.kind === "run" && (
        <MessageRunView
          run={row.run}
          counterpart={counterpart}
          selfName={t("messages:conversation.you")}
          counterpartName={counterpartName}
          isGroup={isGroup}
          onRetry={onRetry}
          showSeen={
            seenActive && row.run.items[row.run.items.length - 1] === lastOutbound
          }
          showDelivered={
            deliveredActive &&
            row.run.items[row.run.items.length - 1] === lastOutbound
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
      {row.kind === "groupSeenBy" && (
        <button type="button" className={styles.groupSeenByLine} onClick={onOpenSeenBy}>
          {t("messages:group.seenByCount", { count: groupSeenByCount })}
        </button>
      )}
    </div>
  );
}

export const MessageAreaRow = memo(MessageAreaRowImpl);
