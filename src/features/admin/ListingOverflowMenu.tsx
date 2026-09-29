import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence } from "motion/react";
import { FiMoreVertical } from "react-icons/fi";
import {
  ListingOverflowPanel,
  type OverflowMenuItem,
  type OverflowMenuPlacement,
} from "./ListingOverflowPanel";
import type { OverflowMenuInitialFocus } from "./useOverflowMenuKeyboard";
import styles from "./ListingOverflowMenu.module.css";

export type { OverflowMenuItem } from "./ListingOverflowPanel";

/** Placement estimate, in px: the 6px gap to the trigger, the panel's padding
 *  and border, a touch-height item row and the danger-group divider. */
const MENU_GAP = 6;
const MENU_CHROME_HEIGHT = 14;
const ESTIMATED_ITEM_HEIGHT = 44;
const DIVIDER_HEIGHT = 13;
/** A trigger whose centre sits below this share of the viewport opens upward. */
const LOWER_ZONE_START = 0.6;

/**
 * Picks the side the menu opens on, measured from the trigger at the moment of
 * opening. It opens upward when the trigger sits in the lower 40% of the
 * viewport or the menu would cross the bottom edge, as long as the space above
 * holds it; everywhere else it hangs below.
 */
function resolvePlacement(
  trigger: HTMLElement | null,
  items: OverflowMenuItem[],
): OverflowMenuPlacement {
  if (!trigger) return "bottom";
  const triggerRect = trigger.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const hasDivider = items.findIndex((item) => item.tone === "danger") > 0;
  const estimatedMenuHeight =
    MENU_GAP +
    MENU_CHROME_HEIGHT +
    items.length * ESTIMATED_ITEM_HEIGHT +
    (hasDivider ? DIVIDER_HEIGHT : 0);
  const triggerCentre = triggerRect.top + triggerRect.height / 2;
  const isInLowerZone = triggerCentre > viewportHeight * LOWER_ZONE_START;
  const wouldCrossBottom =
    triggerRect.bottom + estimatedMenuHeight > viewportHeight;
  const hasRoomAbove = triggerRect.top >= estimatedMenuHeight;
  return (isInLowerZone || wouldCrossBottom) && hasRoomAbove ? "top" : "bottom";
}

/**
 * The `⋮` menu that carries a listing's secondary moderation actions (APG
 * menu-button pattern, modeled on `AdminRoleSwitcher`). Focus moves to the
 * first enabled item on open; arrows, Home and End move between items; Escape
 * closes and returns focus to the trigger; Tab closes and moves on. The panel
 * grows out of the trigger and shrinks back into it under `AnimatePresence`
 * (same motion as `ComposePublishMenuPanel`).
 */
export function ListingOverflowMenu({
  items,
  ariaLabel,
  disabled,
}: {
  items: OverflowMenuItem[];
  ariaLabel: string;
  disabled: boolean;
}) {
  const [openWith, setOpenWith] = useState<OverflowMenuInitialFocus | null>(
    null,
  );
  const [placement, setPlacement] = useState<OverflowMenuPlacement>("bottom");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isOpen = openWith !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenWith(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  function open(initialFocus: OverflowMenuInitialFocus) {
    setPlacement(resolvePlacement(triggerRef.current, items));
    setOpenWith(initialFocus);
  }

  function closeFromEscape(event: KeyboardEvent<HTMLElement>) {
    // Stopping here keeps a surrounding dialog (the preview drawer) open:
    // this Escape belongs to the menu.
    event.preventDefault();
    event.stopPropagation();
    setOpenWith(null);
    triggerRef.current?.focus();
  }

  function choose(item: OverflowMenuItem) {
    // Focus goes back to the trigger before the item runs. A modal the item
    // opens then takes focus on mount and records the trigger as the control
    // to return to on close, since the menu item itself leaves the page.
    triggerRef.current?.focus();
    setOpenWith(null);
    item.onSelect();
  }

  return (
    <div
      className={styles.overflow}
      ref={containerRef}
      onBlur={(event) => {
        // Tabbing away moves focus somewhere React's synthetic `onBlur`
        // (native `focusout`, which bubbles) reports as `relatedTarget`, so
        // close unless that target is still inside the menu.
        if (isOpen && !containerRef.current?.contains(event.relatedTarget)) {
          setOpenWith(null);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (isOpen ? setOpenWith(null) : open("first"))}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isOpen) return closeFromEscape(event);
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          open(event.key === "ArrowUp" ? "last" : "first");
        }}
      >
        <FiMoreVertical aria-hidden />
      </button>
      <AnimatePresence>
        {openWith !== null && (
          <ListingOverflowPanel
            key="menu"
            items={items}
            isMenuDisabled={disabled}
            placement={placement}
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
