// src/features/messages/ComposerInputRow.tsx
import type { RefObject } from "react";
import { FiSend } from "react-icons/fi";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { ComposerAttachButton } from "./ComposerAttachButton";
import { EmojiComposerButton } from "./EmojiComposerButton";
import { MentionHintButton } from "./MentionHintButton";
import type { ComposerPopover } from "./useComposerPopovers";
import type { GifAttachment } from "../../shared/api/gifs";
import styles from "./MessagesPage.module.css";

interface ComposerInputRowProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  popoverGroupRef: RefObject<HTMLDivElement | null>;
  openPopover: ComposerPopover;
  onTogglePopover: (which: NonNullable<ComposerPopover>) => void;
  onOpenPopover: (which: NonNullable<ComposerPopover>) => void;
  onClosePopover: () => void;
  onSendGif?: (attachment: GifAttachment) => void;
  /** Hands picked image file(s) to staging (DES-198/DES-199). */
  onImagePicked?: (files: File[]) => void;
  /** Hands picked document file(s) to staging (PRD-226/DES-198). */
  onDocumentPicked?: (files: File[]) => void;
  onInsertShortcut: (sigil: string) => void;
  placeholder: string;
  draft: string;
  onChange: (nextValue: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Passthrough to `MentionTextarea` for pasted-file staging (DES-204). */
  onPaste?: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  sendLabel: string;
  /** Accessible name for the message textarea. The placeholder vanishes as
   *  soon as someone types, so the field needs a name of its own. */
  messageFieldLabel: string;
  /** Over the server's length limit (DES-202): the send button stays
   *  reachable through `aria-disabled` rather than the native `disabled`
   *  attribute, while `Composer`'s own `handleSend`/Enter-to-send both no-op
   *  while this is true. */
  isOverLimit?: boolean;
  /** `ComposerLengthCounter`'s visible span id (I5): wired onto both the
   *  textarea and the send button's `aria-describedby` once `isOverLimit` is
   *  true, so a screen reader reaches the "too long" reason from either
   *  control. */
  counterId: string;
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
  onImagePicked,
  onDocumentPicked,
  onInsertShortcut,
  placeholder,
  draft,
  onChange,
  onBlur,
  onKeyDown,
  onPaste,
  onSend,
  sendLabel,
  messageFieldLabel,
  isOverLimit,
  counterId,
}: ComposerInputRowProps) {
  const hasDraft = draft.trim().length > 0;

  return (
    <div className={styles.composerRow}>
      <div className={styles.composerField} ref={popoverGroupRef}>
        <ComposerAttachButton
          onSendGif={onSendGif}
          onImagePicked={onImagePicked}
          onDocumentPicked={onDocumentPicked}
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
          aria-describedby={isOverLimit ? counterId : undefined}
          aria-invalid={isOverLimit || undefined}
          value={draft}
          rows={1}
          textareaRef={textareaRef}
          placement="above"
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onClosePopover}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
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
          aria-disabled={isOverLimit || undefined}
          aria-describedby={isOverLimit ? counterId : undefined}
        >
          <FiSend aria-hidden size={16} />
        </button>
      </div>
    </div>
  );
}
