import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PublishMode } from "./composeThread.types";
import styles from "./ComposePublishMenu.module.css";

export interface ComposePublishMenuProps {
  /** Which way the member wants the post to leave the composer. */
  onSelect: (mode: PublishMode) => void;
  /** Mirrors the Publish button's own disabled state: there is nothing to
   *  schedule or send for a read while the draft cannot publish at all. */
  isDisabled?: boolean;
  className?: string;
}

/**
 * The caret half of the split Publish button, and the menu it opens.
 *
 * A real menu, to the APG menu-button contract: the trigger owns
 * `aria-haspopup`/`aria-expanded`, the first item takes focus on open, Up and
 * Down roll through the items, Home and End jump to the ends, Escape and an
 * outside press both close it and hand focus back to the caret.
 *
 * Each row carries its sub-line inside the same button, so the explanation is
 * part of the item's accessible name: a member hearing "Schedule" alone has no
 * way to know it holds the post in drafts until the day comes.
 */
export function ComposePublishMenu({
  onSelect,
  isDisabled = false,
  className,
}: ComposePublishMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const menuId = useId();

  /** Close and hand focus back to the caret, per the menu-button contract. */
  const closeAndRestoreFocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || container.contains(event.target as Node)) return;
      // Focus is inside the menu about to unmount, so give it back to the
      // trigger rather than dropping the caret on <body>.
      if (container.contains(document.activeElement)) {
        closeAndRestoreFocus();
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
    // `closeAndRestoreFocus` is recreated each render and only ever calls
    // setOpen plus focus, so it is safe to leave out of the deps.
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();
  }, [isOpen]);

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRestoreFocus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let nextIndex: number;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else {
      nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length;
    }
    items[nextIndex]?.focus();
  };

  // Tabbing out of the menu used to leave it open behind the member's focus.
  // A null relatedTarget (focus heading to <body>, which is what a click on an
  // item does before its own handler runs) is ignored on purpose.
  const onFocusOut = (event: FocusEvent<HTMLSpanElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget) return;
    if (containerRef.current?.contains(nextTarget)) return;
    setOpen(false);
  };

  const chooseMode = (mode: PublishMode) => () => {
    setOpen(false);
    onSelect(mode);
  };

  return (
    <span
      ref={containerRef}
      className={[styles.container, className].filter(Boolean).join(" ")}
      onBlur={onFocusOut}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={styles.trigger}
        disabled={isDisabled}
        aria-label={t("forum:composePage.publishMenu.triggerAria")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <FiChevronDown aria-hidden />
      </button>
      {isOpen && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          aria-labelledby={triggerId}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {PUBLISH_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={styles.item}
              onClick={chooseMode(mode)}
            >
              <b>{t(`forum:composePage.publishMenu.${mode}.label`)}</b>
              <small>{t(`forum:composePage.publishMenu.${mode}.sub`)}</small>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

/** Menu order, quietest commitment last: publishing now is what most people
 *  want, and asking for a moderator read is the one you choose deliberately. */
const PUBLISH_MODES: readonly PublishMode[] = ["now", "schedule", "review"];
