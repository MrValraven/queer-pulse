import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./PersonaUpdates.module.css";

export interface PersonaPostMenuItem {
  labelKey: string;
  onSelect: () => void;
}

/** Arrow keys, Home and End move between the menu's items. */
function moveMenuFocus(event: KeyboardEvent<HTMLDivElement>) {
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]',
    ),
  );
  const currentIndex = items.indexOf(
    document.activeElement as HTMLButtonElement,
  );
  const lastIndex = items.length - 1;
  const nextIndexByKey: Record<string, number> = {
    ArrowDown: currentIndex >= lastIndex ? 0 : currentIndex + 1,
    ArrowUp: currentIndex <= 0 ? lastIndex : currentIndex - 1,
    Home: 0,
    End: lastIndex,
  };
  const nextIndex = nextIndexByKey[event.key];
  if (nextIndex === undefined) return;
  event.preventDefault();
  items[nextIndex]?.focus();
}

/** One post's menu: Edit update and Delete update for the owner, Report
 *  update for a signed-in visitor. Escape, Tab and a press outside close
 *  it; Escape returns focus to the trigger. It fades in and out. */
export function PersonaPostMenu({ items }: { items: PersonaPostMenuItem[] }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false), {
    onEscape: close,
  });
  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
  }, [isOpen]);
  if (items.length === 0) return null;
  return (
    <div className={styles.menuWrap} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.menuTrigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={t("subprofiles:updates.post.menuLabel")}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="menu"
            id={menuId}
            role="menu"
            aria-label={t("subprofiles:updates.post.menuLabel")}
            className={styles.menu}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
            onKeyDown={(event) => {
              // Tab leaves the menu: it closes and focus moves on.
              if (event.key === "Tab") setIsOpen(false);
              else moveMenuFocus(event);
            }}
          >
            {items.map((item, index) => (
              <button
                key={item.labelKey}
                ref={index === 0 ? firstItemRef : undefined}
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
