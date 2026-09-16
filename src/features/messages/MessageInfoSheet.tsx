// src/features/messages/MessageInfoSheet.tsx
import type { ReactNode } from "react";
import { useAuth } from "../../app/providers/authContext";
import { Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionText } from "../../shared/mentions/MentionText";
import { GroupSeenBySheet } from "./GroupSeenBySheet";
import { DoubleTickIcon, SentIcon } from "./messageIcons";
import { attachmentCaption } from "./messageCopy";
import { useCachedThreadMessages } from "./useCachedThreadMessages";
import { realConversationId } from "./useMessagesController.helpers";
import type { ConversationWithPreview } from "./api/messages.adapters";
import {
  canShowMessageInfo,
  groupSeenByForMessage,
  infoTimeLabel,
  messageKindLabel,
  resolveMessageInfoSteps,
  type MessageInfoSteps,
} from "./messageInfo";
import type { SeenByEntry } from "./groupReceipts";
import type { ChatMessage } from "./data";
import styles from "./MessageInfoSheet.module.css";

/** Everything the info surface derives from besides the thread itself (read
 *  from the thread cache, see `useCachedThreadMessages`). All of it is LIVE on
 *  every render (never a snapshot taken when the sheet opened), so a `read` or
 *  `delivered` frame arriving while it is open updates the rows in place.
 *
 *  `active` is typed as `ConversationWithPreview` (a strict superset of the
 *  base `Conversation`, every added field optional) purely so this surface
 *  can read `otherLastReadInstant` (PRD-351) straight off it, rather than
 *  plumbing a THIRD live watermark prop through `ConversationOverlays`
 *  alongside `counterpartLastReadAt`/`counterpartDeliveredAt` below: every
 *  conversation this surface is ever handed already comes from
 *  `conversationToView` (`useConversations`/`useMessageMutations`), so it
 *  always carries the field in practice; a plain `Conversation` (e.g. a demo
 *  row) is still assignable here since the field is optional and simply
 *  reads back `undefined`. */
export interface MessageInfoContext {
  active: ConversationWithPreview;
  /** The signed-in member, excluded from a group's "Seen by". */
  myUserId?: string | null;
  /** The DM counterpart's live read / delivered watermarks. */
  counterpartLastReadAt: string | null;
  counterpartDeliveredAt: string | null;
  /** The live "Seen by" receipt for the latest own group message. */
  groupSeenBy: SeenByEntry[];
}

interface MessageInfoSurfaceProps {
  /** Server id of the message "Info" was opened for. */
  messageId: string;
  context: MessageInfoContext;
  onClose: () => void;
}

/**
 * PRD-351: routes "Info" to the right surface. A group reuses the existing
 * `GroupSeenBySheet`, filled for this message; a DM opens `MessageInfoSheet`.
 * The message is looked up by id in the live thread, so an edit or a delete
 * while the sheet is open is reflected (a deleted message hides the sheet).
 */
export function MessageInfoSurface({
  messageId,
  context,
  onClose,
}: MessageInfoSurfaceProps) {
  const { user } = useAuth();
  const threadMessages = useCachedThreadMessages(
    realConversationId(context.active),
  );
  const message = threadMessages.find(
    (threadMessage) => threadMessage.id === messageId,
  );
  if (!message || !canShowMessageInfo(message)) return null;
  if (context.active.isGroup) {
    const entries = groupSeenByForMessage(
      context.active.members,
      message,
      { id: context.myUserId ?? null, slug: user?.profile?.slug },
      context.groupSeenBy,
    );
    return <GroupSeenBySheet entries={entries} onClose={onClose} />;
  }
  const steps = resolveMessageInfoSteps(
    message,
    threadMessages,
    context.counterpartLastReadAt,
    context.counterpartDeliveredAt,
    context.active.otherLastReadInstant ?? null,
  );
  return <MessageInfoSheet message={message} steps={steps} onClose={onClose} />;
}

interface MessageInfoSheetProps {
  message: ChatMessage;
  steps: MessageInfoSteps;
  onClose: () => void;
}

/** DM message info: a compact preview of the message, then Sent / Delivered /
 *  Read rows. A reached row shows its time when the backend recorded one; a row
 *  not reached yet reads "Not yet". Built on the same `Modal` sheet as
 *  `GroupSeenBySheet`. */
export function MessageInfoSheet({
  message,
  steps,
  onClose,
}: MessageInfoSheetProps) {
  const { t } = useTranslation();
  const kindLabel = messageKindLabel(message, t);
  const fileName =
    message.attachment && "fileName" in message.attachment
      ? message.attachment.fileName
      : undefined;
  const snippet = kindLabel
    ? (attachmentCaption(message) ?? fileName)
    : message.text;

  return (
    <Modal title={t("messages:info.title")} onClose={onClose}>
      <div className={styles.preview}>
        {kindLabel && <span className={styles.previewKind}>{kindLabel}</span>}
        {snippet && (
          <p className={styles.previewText}>
            <MentionText text={snippet} linkify={false} />
          </p>
        )}
      </div>
      <ul className={styles.steps}>
        <MessageInfoRow
          icon={<SentIcon aria-hidden="true" />}
          label={t("messages:status.sent")}
          isReached
          time={infoTimeLabel(steps.sentAt)}
        />
        <MessageInfoRow
          icon={<DoubleTickIcon aria-hidden="true" />}
          label={t("messages:status.delivered")}
          isReached={steps.delivered.isReached}
          time={infoTimeLabel(steps.delivered.at)}
        />
        <MessageInfoRow
          icon={<DoubleTickIcon aria-hidden="true" />}
          label={t("messages:info.read")}
          isReached={steps.read.isReached}
          time={infoTimeLabel(steps.read.at)}
          isReadRow
        />
      </ul>
    </Modal>
  );
}

interface MessageInfoRowProps {
  icon: ReactNode;
  label: string;
  isReached: boolean;
  /** Formatted time, or empty when the rung has no recorded moment. */
  time: string;
  /** The Read rung takes the jade "seen" colour once reached, like the tick. */
  isReadRow?: boolean;
}

/** One Sent / Delivered / Read row. The icon is decorative; the label plus the
 *  time (or "Not yet") carry the meaning for screen readers. */
function MessageInfoRow({
  icon,
  label,
  isReached,
  time,
  isReadRow = false,
}: MessageInfoRowProps) {
  const { t } = useTranslation();
  const value = isReached ? time : t("messages:info.notYet");
  return (
    <li
      className={[styles.step, !isReached && styles.stepPending]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          styles.stepIcon,
          isReadRow && isReached && styles.stepIconRead,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon}
      </span>
      <span className={styles.stepLabel}>{label}</span>
      {value && <span className={styles.stepValue}>{value}</span>}
    </li>
  );
}
