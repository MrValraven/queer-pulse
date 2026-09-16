import { useEffect, useRef } from "react";
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
import menu from "./ComposerAttachButton.module.css";
import styles from "./MessagesPage.module.css";

interface ComposerAttachButtonProps {
  /** Sends a picked GIF as its own message. Absent = no GIF row. */
  onSendGif?: (attachment: GifAttachment) => void;
  /** Hands picked image file(s) to staging (DES-198/DES-199). Absent = no
   *  Photo/Camera rows. */
  onImagePicked?: (files: File[]) => void;
  /** Hands picked document file(s) to staging (PRD-226/DES-198). Absent =
   *  no File row. */
  onDocumentPicked?: (files: File[]) => void;
  /** Whether the attach MENU is the open composer popover. */
  menuOpen: boolean;
  /** Whether the GIF PICKER is the open composer popover; the menu hands off
   *  to it, so the two are never open at once. */
  gifOpen: boolean;
  /** Toggle request for the menu; the Composer flips its single popover state. */
  onToggleMenu: () => void;
  /** Swaps the menu for the GIF picker in this same anchor slot. */
  onOpenGif: () => void;
  /** Closes whichever panel is open. */
  onClose: () => void;
}

/**
 * The composer's single attach affordance: a paperclip sitting INSIDE the
 * input pill (WhatsApp-style) that opens a small menu (Photo, File, GIF)
 * instead of the row of outlined circles that used to flank the input. One
 * trigger is what keeps the pill uncrowded however many attachment kinds get
 * added later, and it stops the "GIF" wordmark competing with the placeholder.
 *
 * Picking GIF closes the menu and opens `GifPicker` from the same anchor, so
 * a panel never stacks on a panel; `useComposerPopovers` owns that mutual
 * exclusion plus outside-click/Escape dismissal for both.
 *
 * Photo and File keep their own components: each owns its own hidden file
 * input(s) (Photo also owns the coarse-pointer-only Camera row, PRD-350) and
 * hands picked files straight to `useAttachmentStaging`, which owns the
 * actual upload pipeline (EXIF strip, presigned PUT, demo-mode blob); none of
 * that has anything to do with how this menu renders.
 */
export function ComposerAttachButton({
  onSendGif,
  onImagePicked,
  onDocumentPicked,
  menuOpen,
  gifOpen,
  onToggleMenu,
  onOpenGif,
  onClose,
}: ComposerAttachButtonProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Wraps the paperclip and both its panels: the focus-return effect below
  // checks focus against THIS boundary rather than the popover state, so it
  // can tell "focus already moved somewhere deliberate" apart from "focus
  // has nowhere left to go" regardless of what closed the popover.
  const controlRef = useRef<HTMLDivElement>(null);
  // A document-level Escape (or outside click) closes the popover in
  // `useComposerPopovers` BEFORE either panel below gets a turn to react to
  // it, so a listener inside the menu/`GifPicker` itself would never fire
  // for that dismissal path. Watching the open-to-closed transition here
  // instead catches every close uniformly: Escape, outside click, handing
  // off to the GIF picker's sibling slot, tapping into the textarea
  // (`ComposerInputRow`'s own `onFocus` close), or a reply arming while the
  // menu is open. In every one of those cases focus already landed
  // somewhere the member meant it to, so `isFocusStranded` below only
  // reclaims it for the paperclip when it would otherwise land nowhere.
  const wasMenuOpenRef = useRef(menuOpen);
  const wasGifOpenRef = useRef(gifOpen);
  useEffect(() => {
    const justClosed =
      (wasMenuOpenRef.current && !menuOpen) ||
      (wasGifOpenRef.current && !gifOpen);
    wasMenuOpenRef.current = menuOpen;
    wasGifOpenRef.current = gifOpen;
    if (!justClosed) return;
    const activeElement = document.activeElement;
    const isFocusStranded =
      !activeElement ||
      activeElement === document.body ||
      controlRef.current?.contains(activeElement);
    if (isFocusStranded) buttonRef.current?.focus();
  }, [menuOpen, gifOpen]);

  // Live mode without a configured provider (KLIPY key unset): the picker has
  // no live source, so drop the row entirely rather than offer one that opens
  // a dead panel. Demo mode always has curated GIFs, so it's exempt.
  const showGifRow =
    Boolean(onSendGif) && (demoMode || isGifProviderConfigured);

  // Nothing to attach on this surface — render no trigger at all rather than a
  // paperclip that opens an empty menu.
  if (!onImagePicked && !onDocumentPicked && !showGifRow) return null;

  return (
    <div className={menu.control} ref={controlRef}>
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
        {onImagePicked && (
          <ImageComposerButton
            onFilesPicked={onImagePicked}
            onPicked={onClose}
          />
        )}
        {onDocumentPicked && (
          <DocumentComposerButton
            onFilesPicked={onDocumentPicked}
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
          }}
          onClose={onClose}
        />
      )}
    </div>
  );
}
