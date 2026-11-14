import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { FiCheck } from "react-icons/fi";
import { useAnchoredPopover } from "../../../shared/components/ui/useAnchoredPopover";
import styles from "./LeadActionMenu.module.css";

export interface LeadMenuItem {
  id: string;
  label: string;
  /** Set on a choice in a one-of group: the item reads as a radio. */
  isChecked?: boolean;
  /** A quiet line above the item splits the menu into groups. */
  hasDividerBefore?: boolean;
  /** Quieter text at the end of the item, such as a date. */
  hint?: string;
  icon?: ReactNode;
  onSelect: () => void;
}

/** The items of an open menu, in a portal so no row or list clips them.
 *  Arrow keys, Home and End move between items; Escape and Tab close. */
function LeadActionMenuPanel({
  anchorRef,
  menuId,
  label,
  items,
  isBusy,
  onClose,
}: {
  anchorRef: RefObject<HTMLButtonElement | null>;
  menuId: string;
  label: string;
  items: LeadMenuItem[];
  isBusy: boolean;
  onClose: (shouldRestoreFocus: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const placement = useAnchoredPopover(anchorRef, panelRef, true);
  const savedOnClose = useRef(onClose);
  useEffect(() => {
    savedOnClose.current = onClose;
  });

  useEffect(() => {
    const panel = panelRef.current;
    const checked = panel?.querySelector<HTMLElement>('[aria-checked="true"]');
    (checked ?? panel?.querySelector<HTMLElement>("[role^=menuitem]"))?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panel?.contains(target) || anchorRef.current?.contains(target)) {
        return;
      }
      savedOnClose.current(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [anchorRef]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const menuItems = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>("[role^=menuitem]") ?? [],
    );
    const index = menuItems.indexOf(document.activeElement as HTMLElement);
    const focusAt = (next: number) => {
      const count = menuItems.length;
      menuItems[(next + count) % count]?.focus();
    };
    if (event.key === "ArrowDown") focusAt(index + 1);
    else if (event.key === "ArrowUp") focusAt(index - 1);
    else if (event.key === "Home") focusAt(0);
    else if (event.key === "End") focusAt(menuItems.length - 1);
    else if (event.key === "Escape") savedOnClose.current(true);
    else if (event.key === "Tab") savedOnClose.current(false);
    else return;
    if (event.key !== "Tab") event.preventDefault();
    event.stopPropagation();
  };

  return createPortal(
    <div
      ref={panelRef}
      id={menuId}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      aria-busy={isBusy || undefined}
      className={styles.menu}
      data-placed={placement !== null || undefined}
      data-flipped={placement?.isFlipped || undefined}
      style={placement?.style}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role={item.isChecked === undefined ? "menuitem" : "menuitemradio"}
          aria-checked={item.isChecked}
          aria-disabled={isBusy || undefined}
          tabIndex={-1}
          className={styles.item}
          data-divider={item.hasDividerBefore || undefined}
          onClick={() => {
            if (isBusy) return;
            savedOnClose.current(true);
            item.onSelect();
          }}
        >
          <span className={styles.itemIcon} aria-hidden>
            {item.isChecked ? <FiCheck /> : item.icon}
          </span>
          <span className={styles.itemLabel}>{item.label}</span>
          {item.hint !== undefined ? (
            <span className={styles.itemHint}>{item.hint}</span>
          ) : null}
        </button>
      ))}
    </div>,
    document.body,
  );
}

/**
 * A compact menu button for a list row (the APG menu-button pattern): the
 * trigger shows the current value, and the menu opens on the checked item.
 * Picking an item closes the menu and gives focus back to the trigger.
 */
export function LeadActionMenu({
  triggerLabel,
  menuLabel,
  items,
  isBusy = false,
  className,
  children,
}: {
  /** The trigger's accessible name: the value and what pressing does. */
  triggerLabel: string;
  menuLabel: string;
  items: LeadMenuItem[];
  isBusy?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = (shouldRestoreFocus: boolean) => {
    setIsOpen(false);
    if (shouldRestoreFocus) triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, className].filter(Boolean).join(" ")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={triggerLabel}
        data-open={isOpen || undefined}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          setIsOpen(true);
        }}
      >
        {children}
      </button>
      {isOpen ? (
        <LeadActionMenuPanel
          anchorRef={triggerRef}
          menuId={menuId}
          label={menuLabel}
          items={items}
          isBusy={isBusy}
          onClose={close}
        />
      ) : null}
    </>
  );
}
