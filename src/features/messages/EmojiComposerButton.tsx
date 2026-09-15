// src/features/messages/EmojiComposerButton.tsx
import { useEffect, useRef, type RefObject } from "react";
import { FiSmile } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { EmojiPicker } from "./EmojiPicker";
import { useInsertEmoji } from "./useInsertEmoji";
import type { ComposerPopover } from "./useComposerPopovers";
import panel from "./EmojiComposerButton.module.css";
import styles from "./MessagesPage.module.css";

interface EmojiComposerButtonProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  draft: string;
  onChange: (nextValue: string) => void;
  /** The raw shared popover state, not just this button's own derived
   *  boolean — needed to tell a genuine dismiss (Escape, outside click, this
   *  trigger closing) apart from handing off to a SIBLING popover, which
   *  also flips this button's own `open` to false but must never steal focus
   *  into the textarea. See the focus-return effect below. */
  openPopover: ComposerPopover;
  /** Toggle request — the Composer flips its single open-popover state. */
  onToggle: () => void;
}

/**
 * The composer's emoji affordance: a smile icon sitting INSIDE the input
 * pill, between the paperclip and the textarea (WhatsApp's own position),
 * that opens `EmojiPicker`. **Desktop only** — a fine pointer, gated by
 * `useMediaQuery`, since phones already have an emoji key on the OS
 * keyboard and a second trigger here would just crowd the pill.
 *
 * Owns the caret-tracking insert (`useInsertEmoji`) so repeated picks never
 * refocus the textarea mid-panel — see that hook's own doc for the trap it
 * solves.
 *
 * Focus returns to the textarea only on a genuine dismiss (Escape, outside
 * click, or this trigger closing itself) — driven by an effect watching the
 * open→closed transition, not by a click handler or a local Escape listener
 * inside `EmojiPicker`. That was tried first and DOESN'T reliably fire:
 * verified by driving this in a real browser, `useComposerPopovers`'s own
 * document-level Escape listener always wins the race and unmounts the
 * picker before a listener registered inside it gets a turn. Watching the
 * transition here instead catches every dismiss path uniformly, regardless
 * of which listener actually closed it. Switching to a SIBLING popover
 * (e.g. tapping the paperclip while this is open) also flips `open` to
 * false, so this only reclaims focus when `openPopover` has gone all the
 * way to `null` — otherwise it would yank focus away from whatever the
 * sibling trigger just did.
 */
export function EmojiComposerButton({
  textareaRef,
  draft,
  onChange,
  openPopover,
  onToggle,
}: EmojiComposerButtonProps) {
  const { t } = useTranslation();
  const isPointerFine = useMediaQuery("(pointer: fine)");
  const open = openPopover === "emoji";
  const insertEmoji = useInsertEmoji(textareaRef, draft, onChange, open);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (wasOpenRef.current && !open && openPopover === null) {
      textareaRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open, openPopover, textareaRef]);

  if (!isPointerFine) return null;

  return (
    <div className={panel.control}>
      <button
        type="button"
        className={styles.composerIconBtn}
        aria-label={t("messages:emoji.trigger")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onToggle}
      >
        <FiSmile aria-hidden />
      </button>
      {open && <EmojiPicker onPick={insertEmoji} />}
    </div>
  );
}
