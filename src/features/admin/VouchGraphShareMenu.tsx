import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence } from "motion/react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import {
  ListingOverflowPanel,
  type OverflowMenuItem,
} from "./ListingOverflowPanel";
import type { OverflowMenuInitialFocus } from "./useOverflowMenuKeyboard";
import styles from "./vouchGraphShell.module.css";

/**
 * The phone top bar's overflow menu: Copy view link and the PNG and SVG
 * downloads in one button (APG menu-button pattern). Focus moves to the
 * first enabled item on open; arrows, Home and End move between items;
 * Escape closes and hands focus back to the trigger, and stops there so the
 * network stays open; Tab or a press outside closes. The panel is the shared
 * `ListingOverflowPanel`, which grows out of the trigger and shrinks back.
 */
export function VouchGraphShareMenu({ items }: { items: OverflowMenuItem[] }) {
  const { t } = useTranslation();
  const [openWith, setOpenWith] = useState<OverflowMenuInitialFocus | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isOpen = openWith !== null;
  useOutsideDismiss(isOpen, containerRef, () => setOpenWith(null));

  function closeFromEscape(event: KeyboardEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOpenWith(null);
    triggerRef.current?.focus();
  }

  function choose(item: OverflowMenuItem) {
    triggerRef.current?.focus();
    setOpenWith(null);
    item.onSelect();
  }

  return (
    <div className={styles.shareMenu} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles.viewAction, isOpen && styles.viewActionOn)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("admin:vouchGraph.actions.shareMenuCta")}
        onClick={() => setOpenWith(isOpen ? null : "first")}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isOpen) return closeFromEscape(event);
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          setOpenWith(event.key === "ArrowUp" ? "last" : "first");
        }}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      <AnimatePresence>
        {openWith !== null && (
          <ListingOverflowPanel
            key="menu"
            items={items}
            isMenuDisabled={false}
            placement="bottom"
            initialFocus={openWith}
            onChoose={choose}
            onEscape={closeFromEscape}
            onTabOut={() => {
              triggerRef.current?.focus();
              setOpenWith(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
