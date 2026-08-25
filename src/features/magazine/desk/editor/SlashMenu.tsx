import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { BLOCK_KINDS, type ArticleBlockKind } from "./blockKinds";
import styles from "./SlashMenu.module.css";

export interface SlashMenuPoint {
  x: number;
  y: number;
}

export interface SlashMenuProps {
  /** Viewport coordinates to open the menu at — typically the caret's own
   * position, read by the caller from a Range/rect right before opening. */
  at: SlashMenuPoint;
  onPick: (kind: ArticleBlockKind) => void;
  onClose: () => void;
}

const VIEWPORT_MARGIN = 12;

/** Wraps an index into `BLOCK_KINDS` so Arrow keys cycle at both ends. */
function wrapIndex(index: number): number {
  const count = BLOCK_KINDS.length;
  return (index + count) % count;
}

/**
 * A fixed popup listing the insertable block kinds (`BLOCK_KINDS`), opened
 * when `RichText`'s `onSlash` fires (typing "/" in an empty block). Ported
 * from the design prototype's slash menu.
 *
 * FE-CNT-09: the menu is opened by a KEYBOARD action, so it has to be
 * operable from the keyboard. It is a `role="menu"` with roving focus — the
 * first item takes focus on open, Arrow Up/Down (plus Home/End) move between
 * items, Enter/Space picks (the native button `click`, which those keys fire
 * for free), and Escape closes and returns focus to the block that opened it.
 * The pointer path keeps `preventDefault` on mousedown so a click never
 * collapses the caret before `onPick` runs.
 */
export function SlashMenu({ at, onPick, onClose }: SlashMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [position, setPosition] = useState<SlashMenuPoint>(at);
  const [activeIndex, setActiveIndex] = useState(0);

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
    setPosition({
      x: Math.min(at.x, maxX),
      y: Math.min(at.y, maxY),
    });
  }, [at]);

  // Focus moves into the menu on open and back to the opening block on close,
  // so a keyboard user is never stranded on an invisible focus position. The
  // caret's own block is safe to return to: `onPick` inserts after a stored
  // index rather than reading the live selection.
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

  // Keep the DOM focus on whichever item the roving index points at.
  useEffect(() => {
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => wrapIndex(current + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => wrapIndex(current - 1));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(BLOCK_KINDS.length - 1);
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
        aria-label={t("magazine:write.slash.menuAria")}
        // The container owns the arrow-key handling, so it has to be able to
        // hold focus itself. -1 keeps it out of the Tab order: focus arrives
        // programmatically when the menu opens, and roving focus then moves
        // between the items.
        tabIndex={-1}
        onKeyDown={handleMenuKeyDown}
      >
        {BLOCK_KINDS.map((option, index) => (
          <Button
            key={option.kind}
            variant="ghost"
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="menuitem"
            tabIndex={index === activeIndex ? 0 : -1}
            onMouseDown={(event) => {
              // Keep the caret/selection where it was in the calling block —
              // a plain click would steal focus before onPick can act on it.
              // The pick itself runs on `click`, which Enter/Space also fire.
              event.preventDefault();
            }}
            onClick={() => onPick(option.kind)}
            onFocus={() => setActiveIndex(index)}
          >
            {t(`magazine:write.blockKind.${option.kind}.label`)}
            <span className={styles.hint}>
              {t(`magazine:write.blockKind.${option.kind}.hint`)}
            </span>
          </Button>
        ))}
      </div>
    </>
  );
}
