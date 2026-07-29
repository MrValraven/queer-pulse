import { useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GifAttachment } from "../../shared/api/gifs";
import { GifPicker } from "./GifPicker";
import styles from "./MessagesPage.module.css";

interface GifComposerButtonProps {
  /** Sends the picked GIF as its own message. */
  onSendGif: (attachment: GifAttachment) => void;
  /** Whether this popover is the one currently open (controlled by Composer so
   *  only one composer popover is ever open at a time). */
  open: boolean;
  /** Toggle request — the Composer flips its single open-popover state. */
  onToggle: () => void;
  /** Closes this popover (used after pick / from the picker's own close). */
  onClose: () => void;
}

/** The composer's GIF affordance: a button that toggles the KLIPY-powered
 *  GifPicker popover. Open state is lifted to the Composer so it can't co-exist
 *  with the shortcut popover — the Composer owns outside-click/Esc dismissal. */
export function GifComposerButton({ onSendGif, open, onToggle, onClose }: GifComposerButtonProps) {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.gifControl}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.gifBtn}
        aria-label={t("messages:gif.open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span aria-hidden>GIF</span>
      </button>
      {open && (
        <GifPicker
          onPick={(attachment) => {
            onSendGif(attachment);
            onClose();
            buttonRef.current?.focus();
          }}
          onClose={() => {
            onClose();
            buttonRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
