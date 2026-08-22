// src/features/messages/ComposerInputRow.tsx
import type { RefObject } from "react";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { GifComposerButton } from "./GifComposerButton";
import { ImageComposerButton } from "./ImageComposerButton";
import { MentionHintButton } from "./MentionHintButton";
import type { ComposerPopover } from "./useComposerPopovers";
import type { GifAttachment } from "../../shared/api/gifs";
import styles from "./MessagesPage.module.css";

interface ComposerInputRowProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  popoverGroupRef: RefObject<HTMLDivElement | null>;
  openPopover: ComposerPopover;
  onTogglePopover: (which: NonNullable<ComposerPopover>) => void;
  onClosePopover: () => void;
  onSendGif?: (attachment: GifAttachment) => void;
  onSendImage?: (attachment: GifAttachment, localAttachment?: GifAttachment) => void;
  onInsertShortcut: (sigil: string) => void;
  placeholder: string;
  draft: string;
  onChange: (nextValue: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  sendLabel: string;
}

/**
 * The composer's attach/GIF/shortcut controls, the auto-growing textarea, and
 * the send button — split out of `Composer` to keep it under the line cap.
 * Purely presentational: every behaviour (typing frames, popovers, autogrow,
 * draft persistence) is owned by `Composer` and its own colocated hooks.
 */
export function ComposerInputRow({
  textareaRef,
  popoverGroupRef,
  openPopover,
  onTogglePopover,
  onClosePopover,
  onSendGif,
  onSendImage,
  onInsertShortcut,
  placeholder,
  draft,
  onChange,
  onBlur,
  onKeyDown,
  onSend,
  sendLabel,
}: ComposerInputRowProps) {
  return (
    <div className={styles.composerRow}>
      <div className={styles.composerControls} ref={popoverGroupRef}>
        {onSendImage && <ImageComposerButton onSendImage={onSendImage} />}
        {onSendGif && (
          <GifComposerButton
            onSendGif={onSendGif}
            open={openPopover === "gif"}
            onToggle={() => onTogglePopover("gif")}
            onClose={onClosePopover}
          />
        )}
        <MentionHintButton
          open={openPopover === "shortcuts"}
          onToggle={() => onTogglePopover("shortcuts")}
          onInsert={onInsertShortcut}
        />
      </div>
      <MentionTextarea
        id="messages-composer"
        wrapClassName={styles.composerTaWrap}
        className={styles.composerTa}
        placeholder={placeholder}
        value={draft}
        rows={1}
        textareaRef={textareaRef}
        placement="above"
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        className={[styles.sendBtn, draft.trim() && styles.sendBtnActive].filter(Boolean).join(" ")}
        onClick={onSend}
        aria-label={sendLabel}
        disabled={!draft.trim()}
      >
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M14 8l-12-6 4 6-4 6 12-6Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
