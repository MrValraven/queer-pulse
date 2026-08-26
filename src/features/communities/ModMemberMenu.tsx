import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import styles from "./ModMemberMenu.module.css";

export interface ModMemberMenuAction {
  key: string;
  label: string;
  icon: ReactNode;
  run: () => void;
  /** Destructive entries (removing someone) print in the danger colour. */
  danger?: boolean;
}

/**
 * The `⋯` overflow menu on a mod-tools roster row. The role controls used to
 * sit in the row as three or four side-by-side buttons, which made every row
 * read as a wall of verbs and pushed the person's own name into the margin.
 * Behind one trigger, the row is a person again and the actions are one tap
 * away.
 *
 * Follows the house APG menu-button contract (`forum/PostActionsMenu`,
 * `subprofiles/SubprofileMoreMenu`): outside-pointerdown close, focus the
 * first item on open, focus back to the trigger on close, arrow/Home/End/
 * Escape roving, and a focusout close so tabbing away never leaves an open
 * popup behind the caret.
 */
export function ModMemberMenu({
  ariaLabel,
  actions,
}: {
  /** Names the trigger for assistive tech, e.g. "Actions for Kai Adkins". */
  ariaLabel: string;
  actions: ModMemberMenuAction[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || container.contains(event.target as Node)) return;
      // Focus sits inside the menu we are about to unmount, so hand it back to
      // the trigger rather than dropping the caret on <body>.
      if (container.contains(document.activeElement)) {
        close();
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // `close` is re-created every render but only calls setIsOpen + focus.
  }, [isOpen]);

  // APG menu-button contract: focus the first item when the menu opens.
  useEffect(() => {
    if (!isOpen) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();
  }, [isOpen]);

  if (actions.length === 0) return null;

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
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

  // A null `relatedTarget` (focus heading to <body>, which is what clicking a
  // menu item does before its click handler runs) is deliberately ignored, or
  // the item would unmount before it could act.
  const onFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next) return;
    if (containerRef.current?.contains(next)) return;
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={styles.container} onBlur={onFocusOut}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((value) => !value)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {isOpen && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={
                action.danger ? `${styles.item} ${styles.danger}` : styles.item
              }
              onClick={() => {
                setIsOpen(false);
                action.run();
              }}
            >
              <span className={styles.itemIcon} aria-hidden>
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
