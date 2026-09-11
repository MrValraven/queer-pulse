import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Button } from "../ui";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./SlashMenu.module.css";

export interface SlashMenuPoint {
  x: number;
  y: number;
}

export interface SlashMenuOption {
  /** Stable id handed back to `onPick`. */
  id: string;
  /** Already-translated row label. */
  label: string;
  /** Optional already-translated hint shown at the row's end. */
  hint?: string;
}

export interface SlashMenuProps {
  /** Viewport coordinates to open the menu at, typically just under the
   * block that opened it. */
  at: SlashMenuPoint;
  options: readonly SlashMenuOption[];
  onPick: (optionId: string) => void;
  onClose: () => void;
}

const VIEWPORT_MARGIN = 12;

/** Wraps an index into the option list so Arrow keys cycle at both ends. */
function wrapIndex(index: number, count: number): number {
  if (count === 0) return 0;
  return (index + count) % count;
}

/**
 * A fixed popup listing insertable options, opened when `RichText`'s
 * `onSlash` fires (typing "/" in an empty block). Each editor passes its own
 * options: the magazine desk its article block kinds, the guide workspace
 * its guide block kinds.
 *
 * FE-CNT-09: the menu is opened by a KEYBOARD action, so it has to be
 * operable from the keyboard. It is a `role="menu"` with roving focus: the
 * first item takes focus on open, Arrow Up/Down (plus Home/End) move between
 * items, Enter/Space picks, and Escape closes and returns focus to the block
 * that opened it. The pointer path keeps `preventDefault` on mousedown so a
 * click never collapses the caret before `onPick` runs.
 */
export function SlashMenu({ at, options, onPick, onClose }: SlashMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [position, setPosition] = useState<SlashMenuPoint>(at);
  const [activeIndex, setActiveIndex] = useState(0);
  const optionCount = options.length;
  const safeActiveIndex = Math.min(activeIndex, Math.max(optionCount - 1, 0));

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      setPosition(at);
      return;
    }
    // Clamp so the menu never renders partly off-screen when the caret sits
    // near a viewport edge.
    const { width, height } = menu.getBoundingClientRect();
    const maxX = Math.max(
      VIEWPORT_MARGIN,
      window.innerWidth - width - VIEWPORT_MARGIN,
    );
    const maxY = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - height - VIEWPORT_MARGIN,
    );
    setPosition({ x: Math.min(at.x, maxX), y: Math.min(at.y, maxY) });
  }, [at]);

  // Focus moves into the menu on open and back to the opening block on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    itemRefs.current[0]?.focus();
    return () => {
      if (
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused.isConnected
      ) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    itemRefs.current[safeActiveIndex]?.focus();
  }, [safeActiveIndex]);

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => wrapIndex(current + 1, optionCount));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => wrapIndex(current - 1, optionCount));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(optionCount - 1, 0));
    }
  }

  return (
    <>
      <div
        className={styles.backdrop}
        role="presentation"
        onMouseDown={onClose}
      />
      <div
        ref={menuRef}
        className={styles.slash}
        style={{ left: position.x, top: position.y }}
        role="menu"
        aria-label={t("shared:richText.slashMenuAria")}
        // The container owns the arrow-key handling, so it has to be able to
        // hold focus itself. -1 keeps it out of the Tab order: focus arrives
        // programmatically when the menu opens, and roving focus then moves
        // between the items.
        tabIndex={-1}
        onKeyDown={handleMenuKeyDown}
      >
        {options.map((option, index) => (
          <Button
            key={option.id}
            variant="ghost"
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="menuitem"
            tabIndex={index === safeActiveIndex ? 0 : -1}
            onMouseDown={(event) => {
              // Keep the caret where it was in the calling block.
              event.preventDefault();
            }}
            // Enter and Space on a focused item fire this native button
            // click, so the keyboard picks through the same path as a pointer.
            onClick={() => onPick(option.id)}
            onFocus={() => setActiveIndex(index)}
          >
            {option.label}
            {option.hint && <span className={styles.hint}>{option.hint}</span>}
          </Button>
        ))}
      </div>
    </>
  );
}
