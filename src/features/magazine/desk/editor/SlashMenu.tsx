import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

/**
 * A fixed popup listing the insertable block kinds (`BLOCK_KINDS`), opened
 * when `RichText`'s `onSlash` fires (typing "/" in an empty block). Ported
 * from the design prototype's slash menu. Closes on Escape or a mousedown
 * anywhere outside the menu (the full-screen invisible backdrop) — picking a
 * row also closes it, via the caller's `onPick`.
 */
export function SlashMenu({ at, onPick, onClose }: SlashMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<SlashMenuPoint>(at);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      setPosition(at);
      return;
    }
    // Clamp so the menu never renders partly off-screen when the caret sits
    // near a viewport edge.
    const { width, height } = menu.getBoundingClientRect();
    const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN);
    const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN);
    setPosition({
      x: Math.min(at.x, maxX),
      y: Math.min(at.y, maxY),
    });
  }, [at]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
      >
        {BLOCK_KINDS.map((option) => (
          <button
            key={option.kind}
            type="button"
            onMouseDown={(event) => {
              // Keep the caret/selection where it was in the calling block —
              // a plain click would steal focus before onPick can act on it.
              event.preventDefault();
              onPick(option.kind);
            }}
          >
            {t(`magazine:write.blockKind.${option.kind}.label`)}
            <span className={styles.hint}>
              {t(`magazine:write.blockKind.${option.kind}.hint`)}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
