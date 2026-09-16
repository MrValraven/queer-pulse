// src/features/messages/ComposerDockContent.tsx
import { useRef } from "react";
import { FiArrowDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Composer } from "./Composer";
import { useAttachmentStaging } from "./useAttachmentStaging";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import type { ExplicitSendOptions } from "./useMessageSendActions";
import styles from "./MessagesPage.module.css";

export interface ComposerDockContentProps {
  active: Conversation;
  onSend: (body: string) => void;
  /** Widened to the full `ExplicitSendOptions` shape (conversation id +
   *  reply snapshot) so a future wrapper here can't silently narrow it back
   *  down and drop either one: the attachment queue (`useAttachmentStaging`)
   *  always calls these with both. */
  onSendGif?: (
    attachment: GifAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  /** Sends an uploaded document as its own message (PRD-226). */
  onSendDocument?: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  blocked: boolean;
  replyDraft?: ChatMessage | null;
  onCancelReply?: () => void;
  /** Shows the "N new messages" jump-to-latest pill above the composer. */
  showJumpPill: boolean;
  newMessagesCount: number;
  onJumpToLatest: () => void;
}

/**
 * The composer plus its floating "jump to latest" pill, wrapped in one
 * positioned dock (`.composerDock`) so the pill can anchor to the composer's
 * OWN top edge (`inset-block-end: 100%` in CSS) instead of a fixed px guess at
 * its height, so it survives a multi-line draft or an open reply-preview
 * banner without overlapping either. Split out of `ConversationPanel` to keep
 * that component under the line cap; `ConversationComposerDock` above this
 * component in the tree is a thin pass-through with no logic of its own, now
 * that the attachment queue is provided once, at the Messages page level
 * (see `AttachmentQueueContext.tsx` and `MessagesPage.tsx`).
 *
 * Owns `useAttachmentStaging` and the message textarea's own ref (DES-198/
 * DES-199): this component stays mounted across a thread switch, while
 * `Composer` below it remounts (keyed by `active.id`), so an attachment
 * whose "Send" was already pressed while it was still uploading keeps
 * uploading, and lands in ITS OWN thread, even after the member has moved on
 * to another one. See `useAttachmentStaging`'s own doc.
 */
export function ComposerDockContent({
  active,
  onSend,
  onSendGif,
  onSendImage,
  onSendDocument,
  blocked,
  replyDraft,
  onCancelReply,
  showJumpPill,
  newMessagesCount,
  onJumpToLatest,
}: ComposerDockContentProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const staging = useAttachmentStaging({
    conversationId: active.id,
    active,
    replyDraft,
    onCancelReply,
    onSendGif,
    onSendImage,
    onSendDocument,
    textareaRef,
  });
  return (
    <div className={styles.composerDock}>
      {showJumpPill && (
        <button
          type="button"
          className={styles.jumpPill}
          onClick={onJumpToLatest}
        >
          <span>
            {t("messages:conversation.newMessagesCount", {
              count: newMessagesCount,
            })}
          </span>
          <FiArrowDown aria-hidden />
        </button>
      )}

      <Composer
        // Remounts per thread so the draft (owned inside `Composer`) resets
        // instead of leaking the previous thread's typed-but-unsent text.
        // `textareaRef`/`staging` are passed in from here precisely because
        // THEY must survive that remount, see this component's own doc.
        key={active.id}
        active={active}
        conversationId={active.id}
        onSend={onSend}
        blocked={blocked}
        replyDraft={replyDraft}
        onCancelReply={onCancelReply}
        textareaRef={textareaRef}
        staging={staging}
      />
    </div>
  );
}
