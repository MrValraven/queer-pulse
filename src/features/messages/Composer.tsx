// src/features/messages/Composer.tsx
import { useRef, useLayoutEffect, useEffect, type ChangeEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEmitTyping } from "../../shared/api/realtime";
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
  /** Idle timer that emits `typing:false` ~3s after the last keystroke; also
   *  cleared (and re-armed) on send/blur so we never emit a late false-then-true. */
  const typingIdleTimerRef = useRef<number | undefined>(undefined);
  /** Last `Date.now()` a `typing:true` frame was sent — throttles emits to at
   *  most once per ~2s while the reader keeps typing. */
  const lastTypingSentRef = useRef(0);

  // Sync height to content up to the CSS max-height (120px), then let it scroll.
  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
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

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onDraftChange(event.target.value);
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

  return (
    <div className={styles.composer}>
      {replyDraft && (
        <div className={styles.replyPreview}>
          <div className={styles.replyPreviewBody}>
            <span className={styles.replyPreviewName}>
              {replyDraft.from === "me" ? t("messages:conversation.you") : active.name}
            </span>
            <span className={styles.replyPreviewSnippet}>{replyDraft.text}</span>
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
      <div className={styles.composerRow}>
        <textarea
          id="messages-composer"
          ref={textareaRef}
          className={styles.composerTa}
          placeholder={t("messages:conversation.composerPlaceholder", { name: firstName })}
          value={draft}
          rows={1}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(event) => {
            const isCoarsePointer =
              typeof window !== "undefined" &&
              window.matchMedia?.("(pointer: coarse)").matches;
            if (event.key === "Enter" && !event.shiftKey && !isCoarsePointer) {
              event.preventDefault();
              handleSend();
            }
          }}
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
