// src/features/messages/Composer.tsx
import { useRef, useLayoutEffect, useEffect } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEmitTyping } from "../../shared/api/realtime";
import { useReplyPreviewTransition } from "./useReplyPreviewTransition";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { MentionText } from "../../shared/mentions/MentionText";
import type { ChatMessage, Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ComposerProps {
  active: Conversation;
  conversationId: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  blocked: boolean;
  /** The message currently being quoted for a reply, or null/absent. */
  replyDraft?: ChatMessage | null;
  /** Clears the reply draft (the preview banner's close button). */
  onCancelReply?: () => void;
}

/** Bottom composer: severed into a notice bar for official/blocked threads. */
export function Composer({
  active,
  conversationId,
  draft,
  onDraftChange,
  onSend,
  blocked,
  replyDraft,
  onCancelReply,
}: ComposerProps) {
  const { t } = useTranslation();
  const firstName = active.name.split(" ")[0]!;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emitTyping = useEmitTyping();
  // Keeps the reply-preview banner's content mounted through its collapse/
  // fade-out so dismissing it (✕ or post-send clear) actually animates
  // instead of snapping away — see the hook for why the wrapper below is
  // always rendered rather than conditionally on `replyDraft`.
  const { previewMessage, open: replyPreviewOpen } = useReplyPreviewTransition(replyDraft);
  /** Idle timer that emits `typing:false` ~3s after the last keystroke; also
   *  cleared (and re-armed) on send/blur so we never emit a late false-then-true. */
  const typingIdleTimerRef = useRef<number | undefined>(undefined);
  /** Last `Date.now()` a `typing:true` frame was sent — throttles emits to at
   *  most once per ~2s while the reader keeps typing. */
  const lastTypingSentRef = useRef(0);

  // Sync height to content up to the CSS max-height (120px), then let it scroll.
  // With `box-sizing: border-box`, `scrollHeight` excludes the borders, so
  // adding the top+bottom border back keeps the box from under-sizing by ~3px
  // and showing a spurious scrollbar on a single line.
  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    const borderY = node.offsetHeight - node.clientHeight;
    node.style.height = `${node.scrollHeight + borderY}px`;
  }, [draft]);

  // Never leave a stale idle timer running past this component's lifetime
  // (e.g. thread switch unmounts this Composer instance).
  useEffect(() => {
    return () => window.clearTimeout(typingIdleTimerRef.current);
  }, []);

  /** Enter-to-send and the send button both funnel through here so a send
   *  always clears the idle timer and tells the counterpart we've stopped. */
  function handleSend() {
    window.clearTimeout(typingIdleTimerRef.current);
    emitTyping(conversationId, false);
    lastTypingSentRef.current = 0;
    onSend();
  }

  function handleBlur() {
    window.clearTimeout(typingIdleTimerRef.current);
    emitTyping(conversationId, false);
  }

  function handleChange(nextValue: string) {
    onDraftChange(nextValue);
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      emitTyping(conversationId, true);
      lastTypingSentRef.current = now;
    }
    window.clearTimeout(typingIdleTimerRef.current);
    typingIdleTimerRef.current = window.setTimeout(() => {
      emitTyping(conversationId, false);
    }, 3000);
  }

  /** Enter-to-send (desktop, non-touch) — passed through to `MentionTextarea`,
   *  which invokes this only when the mention suggestion popup is closed, so
   *  Enter with the popup open still inserts the highlighted mention instead. */
  function handleComposerKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    if (event.key === "Enter" && !event.shiftKey && !isCoarsePointer) {
      event.preventDefault();
      handleSend();
    }
  }

  if (active.official) {
    return <div className={styles.officialBar}>{t("messages:conversation.officialNotice")}</div>;
  }
  if (blocked) {
    return (
      <div className={styles.officialBar}>
        {t("messages:conversation.blockedNotice", { name: firstName })}
      </div>
    );
  }
  // A member who LEFT a group keeps read access but the composer is severed
  // (the server also rejects a post from a left member).
  if (active.isGroup && active.hasLeft) {
    return (
      <div className={styles.officialBar}>
        {t("messages:conversation.leftGroupNotice")}
      </div>
    );
  }
  const composerPlaceholder = active.isGroup
    ? t("messages:conversation.composerGroupPlaceholder")
    : t("messages:conversation.composerPlaceholder", { name: firstName });

  return (
    <div className={styles.composer}>
      {/* Always mounted (even with nothing to reply to) so the grid-row/margin
          transition below always has a real "closed" state to animate from —
          `previewMessage` lags the exit animation, see the hook. */}
      <div className={styles.replyPreviewWrap} data-open={replyPreviewOpen}>
        {previewMessage && (
          <div className={styles.replyPreview}>
            <div className={styles.replyPreviewBody}>
              <span className={styles.replyPreviewName}>
                {previewMessage.from === "me"
                  ? t("messages:conversation.you")
                  : active.isGroup
                    ? (previewMessage.senderName ?? active.name)
                    : active.name}
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
              ✕
            </button>
          </div>
        )}
      </div>
      <div className={styles.composerRow}>
        <MentionTextarea
          id="messages-composer"
          wrapClassName={styles.composerTaWrap}
          className={styles.composerTa}
          placeholder={composerPlaceholder}
          value={draft}
          rows={1}
          textareaRef={textareaRef}
          placement="above"
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleComposerKeyDown}
        />
        <button
          type="button"
          className={[styles.sendBtn, draft.trim() && styles.sendBtnActive].filter(Boolean).join(" ")}
          onClick={handleSend}
          aria-label={t("messages:conversation.send")}
          disabled={!draft.trim()}
        >
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 8l12-6-4 6 4 6-12-6Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
