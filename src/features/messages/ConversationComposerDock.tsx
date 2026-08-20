// src/features/messages/ConversationComposerDock.tsx
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Composer } from "./Composer";
import type { ChatMessage, Conversation } from "./data";
import type { GifAttachment } from "../../shared/api/gifs";
import styles from "./MessagesPage.module.css";

interface ConversationComposerDockProps {
  active: Conversation;
  onSend: (body: string) => void;
  onSendGif?: (attachment: GifAttachment) => void;
  onSendImage?: (attachment: GifAttachment, localAttachment?: GifAttachment) => void;
  blocked: boolean;
  replyDraft?: ChatMessage | null;
  onCancelReply?: () => void;
  /** Shows the "N new messages ↓" pill above the composer. */
  showJumpPill: boolean;
  newMessagesCount: number;
  onJumpToLatest: () => void;
}

/**
 * The composer plus its floating "jump to latest" pill, wrapped in one
 * positioned dock (`.composerDock`) so the pill can anchor to the composer's
 * OWN top edge (`inset-block-end: 100%` in CSS) instead of a fixed px guess at
 * its height — it then survives a multi-line draft or an open reply-preview
 * banner without overlapping either. Split out of `ConversationPanel` to keep
 * that component under the line cap.
 */
export function ConversationComposerDock({
  active,
  onSend,
  onSendGif,
  onSendImage,
  blocked,
  replyDraft,
  onCancelReply,
  showJumpPill,
  newMessagesCount,
  onJumpToLatest,
}: ConversationComposerDockProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.composerDock}>
      {showJumpPill && (
        <button type="button" className={styles.jumpPill} onClick={onJumpToLatest}>
          {`${t("messages:conversation.newMessagesCount", { count: newMessagesCount })} ↓`}
        </button>
      )}

      <Composer
        // Remounts per thread so the draft (owned inside `Composer` now) resets
        // instead of leaking the previous thread's typed-but-unsent text.
        key={active.id}
        active={active}
        conversationId={active.id}
        onSend={onSend}
        onSendGif={onSendGif}
        onSendImage={onSendImage}
        blocked={blocked}
        replyDraft={replyDraft}
        onCancelReply={onCancelReply}
      />
    </div>
  );
}
