// src/features/messages/ComposerReplyPreview.tsx
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionText } from "../../shared/mentions/MentionText";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

interface ComposerReplyPreviewProps {
  /** The message being quoted, lagging the exit animation by design (see
   *  `useReplyPreviewTransition`) — null once the collapse has fully played. */
  previewMessage: ChatMessage | null;
  /** Drives the wrapper's grid-row/margin collapse transition. */
  open: boolean;
  isGroup: boolean | undefined;
  /** The open thread's display name — used for a DM's "them" quote label, and
   *  as a GROUP fallback when the quoted sender's own name is unavailable. */
  activeName: string;
  /** Clears the reply draft (the preview banner's close button). */
  onCancelReply?: () => void;
}

/**
 * The reply-quote banner above the composer's input row — split out of
 * `Composer` to keep it under the line cap. Always mounted (even with
 * nothing to reply to) so the collapse transition always has a real "closed"
 * state to animate from.
 */
export function ComposerReplyPreview({
  previewMessage,
  open,
  isGroup,
  activeName,
  onCancelReply,
}: ComposerReplyPreviewProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.replyPreviewWrap} data-open={open}>
      {previewMessage && (
        <div className={styles.replyPreview}>
          <div className={styles.replyPreviewBody}>
            <span className={styles.replyPreviewName}>
              {previewMessage.from === "me"
                ? t("messages:conversation.you")
                : isGroup
                  ? (previewMessage.senderName ?? activeName)
                  : activeName}
            </span>
            <span className={styles.replyPreviewSnippet}>
              <MentionText text={previewMessage.text} />
            </span>
          </div>
          <button
            type="button"
            className={styles.replyPreviewClose}
            aria-label={t("messages:actions.editCancel")}
            onClick={onCancelReply}
          >
            <FiX aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
