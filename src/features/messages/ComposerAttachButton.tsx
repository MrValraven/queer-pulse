import { useRef } from "react";
import { FiPaperclip } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { DocumentComposerButton } from "./DocumentComposerButton";
import { GifPicker } from "./GifPicker";
import { ImageComposerButton } from "./ImageComposerButton";
import {
  isGifProviderConfigured,
  type GifAttachment,
} from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import menu from "./ComposerAttachButton.module.css";
import styles from "./MessagesPage.module.css";

interface ComposerAttachButtonProps {
  /** Sends a picked GIF as its own message. Absent = no GIF row. */
  onSendGif?: (attachment: GifAttachment) => void;
  /** Sends an uploaded image as its own message. Absent = no Photo row. */
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
  /** Sends an uploaded document as its own message (PRD-226). Absent = no
   *  File row. */
  onSendDocument?: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
  ) => void;
  /** Whether the attach MENU is the open composer popover. */
  menuOpen: boolean;
  /** Whether the GIF PICKER is the open composer popover — the menu hands off
   *  to it, so the two are never open at once. */
  gifOpen: boolean;
  /** Toggle request for the menu — the Composer flips its single popover state. */
  onToggleMenu: () => void;
  /** Swaps the menu for the GIF picker in this same anchor slot. */
  onOpenGif: () => void;
  /** Closes whichever panel is open. */
  onClose: () => void;
}

/**
 * The composer's single attach affordance: a paperclip sitting INSIDE the
 * input pill (WhatsApp-style) that opens a small menu — Photo, File, GIF —
 * instead of the row of outlined circles that used to flank the input. One
 * trigger is what keeps the pill uncrowded however many attachment kinds get
 * added later, and it stops the "GIF" wordmark competing with the placeholder.
 *
 * Picking GIF closes the menu and opens `GifPicker` from the same anchor, so
 * a panel never stacks on a panel — `useComposerPopovers` owns that mutual
 * exclusion plus outside-click/Escape dismissal for both.
 *
 * Photo and File keep their own components: each owns a hidden file input and
 * a real upload pipeline (EXIF strip, presigned PUT, demo-mode blob), which
 * has nothing to do with how the menu renders.
 */
export function ComposerAttachButton({
  onSendGif,
  onSendImage,
  onSendDocument,
  menuOpen,
  gifOpen,
  onToggleMenu,
  onOpenGif,
  onClose,
}: ComposerAttachButtonProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Live mode without a configured provider (KLIPY key unset): the picker has
  // no live source, so drop the row entirely rather than offer one that opens
  // a dead panel. Demo mode always has curated GIFs, so it's exempt.
  const showGifRow =
    Boolean(onSendGif) && (demoMode || isGifProviderConfigured);

  // Nothing to attach on this surface — render no trigger at all rather than a
  // paperclip that opens an empty menu.
  if (!onSendImage && !onSendDocument && !showGifRow) return null;

  return (
    <div className={menu.control}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.composerIconBtn}
        aria-label={t("messages:attachments.menuOpen")}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        onClick={onToggleMenu}
      >
        <FiPaperclip aria-hidden />
      </button>

      {/* Kept MOUNTED and hidden with `hidden`, never unmounted: the Photo and
          File rows each own a hidden <input type="file">, and picking either
          row closes this menu while the OS file chooser is still open.
          Unmounting detaches that input mid-pick, and a detached file input
          never delivers its `change` event — the chosen file is silently
          dropped and no message is ever sent. `.menu[hidden]` in the CSS
          module restores the display:none the panel's own `display: flex`
          would otherwise win against. */}
      <div
        className={menu.menu}
        role="dialog"
        aria-label={t("messages:attachments.menuLabel")}
        hidden={!menuOpen}
      >
        {onSendImage && (
          <ImageComposerButton onSendImage={onSendImage} onPicked={onClose} />
        )}
        {onSendDocument && (
          <DocumentComposerButton
            onSendDocument={onSendDocument}
            onPicked={onClose}
          />
        )}
        {showGifRow && (
          <button type="button" className={menu.row} onClick={onOpenGif}>
            {/* eslint-disable-next-line local/no-literal-string -- "GIF" is a universal file-format acronym, never translated. */}
            <span className={menu.rowIcon} aria-hidden>
              GIF
            </span>
            <span>{t("messages:gif.open")}</span>
          </button>
        )}
      </div>

      {gifOpen && onSendGif && (
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
