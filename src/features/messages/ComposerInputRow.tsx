// src/features/messages/ComposerInputRow.tsx
import type { RefObject } from "react";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { ComposerAttachButton } from "./ComposerAttachButton";
import { EmojiComposerButton } from "./EmojiComposerButton";
import { MentionHintButton } from "./MentionHintButton";
import type { ComposerPopover } from "./useComposerPopovers";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import styles from "./MessagesPage.module.css";

interface ComposerInputRowProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  popoverGroupRef: RefObject<HTMLDivElement | null>;
  openPopover: ComposerPopover;
  onTogglePopover: (which: NonNullable<ComposerPopover>) => void;
  onOpenPopover: (which: NonNullable<ComposerPopover>) => void;
  onClosePopover: () => void;
  onSendGif?: (attachment: GifAttachment) => void;
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
  /** Sends an uploaded document as its own message (PRD-226). */
  onSendDocument?: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
  ) => void;
  onInsertShortcut: (sigil: string) => void;
  placeholder: string;
  draft: string;
  onChange: (nextValue: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  sendLabel: string;
  /** Accessible name for the message textarea. The placeholder vanishes as
   *  soon as someone types, so the field needs a name of its own. */
  messageFieldLabel: string;
}

/**
 * The composer's input pill and its send button — split out of `Composer` to
 * keep it under the line cap. Purely presentational: every behaviour (typing
 * frames, popovers, autogrow, draft persistence) is owned by `Composer` and
 * its own colocated hooks.
 *
 * Every control sits INSIDE the pill (`.composerField`), the way
 * WhatsApp/Telegram place them, rather than as outlined circles flanking the
 * input: one bordered box reads as one field. The pill owns the border,
 * radius, background and focus ring that used to live on the textarea — see
 * `.composerField` / `.composerTa` for why the field keeps its own 44px
 * min-height and 16px font size through that move.
 *
 * The send button is in that pill too, and only appears once the draft has
 * something in it: it stays mounted and collapses to zero width rather than
 * unmounting, so clearing or sending a draft plays the same transition
 * backwards from a painted state instead of blinking out.
 *
 * `popoverGroupRef` lands on the pill, which is also the outside-click
 * boundary — so tapping the textarea no longer counts as "outside". The
 * textarea's own `onFocus` closes instead.
 *
 * `EmojiComposerButton` sits between the paperclip and the textarea
 * (WhatsApp's own position) and renders nothing at all on a coarse pointer —
 * phones already have an emoji key on the OS keyboard, so it's desktop only.
 */
export function ComposerInputRow({
  textareaRef,
  popoverGroupRef,
  openPopover,
  onTogglePopover,
  onOpenPopover,
  onClosePopover,
  onSendGif,
  onSendImage,
  onSendDocument,
  onInsertShortcut,
  placeholder,
  draft,
  onChange,
  onBlur,
  onKeyDown,
  onSend,
  sendLabel,
  messageFieldLabel,
}: ComposerInputRowProps) {
  const hasDraft = draft.trim().length > 0;

  return (
    <div className={styles.composerRow}>
      <div className={styles.composerField} ref={popoverGroupRef}>
        <ComposerAttachButton
          onSendGif={onSendGif}
          onSendImage={onSendImage}
          onSendDocument={onSendDocument}
          menuOpen={openPopover === "attach"}
          gifOpen={openPopover === "gif"}
          onToggleMenu={() => onTogglePopover("attach")}
          onOpenGif={() => onOpenPopover("gif")}
          onClose={onClosePopover}
        />
        <EmojiComposerButton
          textareaRef={textareaRef}
          draft={draft}
          onChange={onChange}
          openPopover={openPopover}
          onToggle={() => onTogglePopover("emoji")}
        />
        <MentionTextarea
          id="messages-composer"
          wrapClassName={styles.composerTaWrap}
          className={styles.composerTa}
          placeholder={placeholder}
          aria-label={messageFieldLabel}
          value={draft}
          rows={1}
          textareaRef={textareaRef}
          placement="above"
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onClosePopover}
          onKeyDown={onKeyDown}
        />
        <MentionHintButton
          open={openPopover === "shortcuts"}
          onToggle={() => onTogglePopover("shortcuts")}
          onInsert={onInsertShortcut}
        />
        <button
          type="button"
          className={[styles.sendBtn, hasDraft && styles.sendBtnActive]
            .filter(Boolean)
            .join(" ")}
          onClick={onSend}
          aria-label={sendLabel}
          disabled={!hasDraft}
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path d="M14 8l-12-6 4 6-4 6 12-6Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
