import { Fragment, type KeyboardEvent } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  useOverflowMenuKeyboard,
  type OverflowMenuInitialFocus,
} from "./useOverflowMenuKeyboard";
import styles from "./ListingOverflowMenu.module.css";

export interface OverflowMenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  tone?: "danger";
  disabled?: boolean;
}

export type OverflowMenuPlacement = "bottom" | "top";

/**
 * The menu surface. Its own component so `useIsPresent` can mark it `inert`
 * while it animates out, which keeps a second press on a fading item from
 * firing. It grows out of the trigger's end edge: hanging below the trigger by
 * default, and rising above it when `placement` is `"top"`.
 */
export function ListingOverflowPanel({
  items,
  isMenuDisabled,
  placement,
  initialFocus,
  onChoose,
  onEscape,
  onTabOut,
}: {
  items: OverflowMenuItem[];
  isMenuDisabled: boolean;
  placement: OverflowMenuPlacement;
  initialFocus: OverflowMenuInitialFocus;
  onChoose: (item: OverflowMenuItem) => void;
  /** Escape closes the menu and hands focus back to the trigger. */
  onEscape: (event: KeyboardEvent<HTMLElement>) => void;
  /** Tab closes the menu; focus moves on from the trigger as if the Tab
   *  had been pressed there. */
  onTabOut: () => void;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const itemDisabledStates = items.map(
    (item) => isMenuDisabled || Boolean(item.disabled),
  );
  const { itemRefs, focusedIndex, onMenuKeyDown, onItemFocus } =
    useOverflowMenuKeyboard(itemDisabledStates, initialFocus);
  const isPlacedTop = placement === "top";
  // The panel slides in from the trigger's side: down from above it when it
  // hangs below, up from below it when it rises above.
  const offsetDirection = isPlacedTop ? 1 : -1;
  const firstDangerIndex = items.findIndex((item) => item.tone === "danger");

  return (
    <m.div
      className={styles.menu}
      role="menu"
      data-placement={placement}
      inert={!isPresent}
      onKeyDown={(event) => {
        if (event.key === "Escape") return onEscape(event);
        if (event.key === "Tab") {
          // Inert right away, ahead of the exit render, so the browser's own
          // Tab step from the trigger (where `onTabOut` puts focus) passes
          // over the closing panel to the next control on the page.
          event.currentTarget.inert = true;
          return onTabOut();
        }
        onMenuKeyDown(event);
      }}
      style={{ originX: 1, originY: isPlacedTop ? 1 : 0 }}
      initial={{ opacity: 0, scale: 0.96, y: 6 * offsetDirection }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 4 * offsetDirection }}
      transition={{
        duration: reducedMotion ? 0 : 0.18,
        ease: [0.22, 0.68, 0.16, 1],
      }}
    >
      {items.map((item, index) => {
        const isDisabled = itemDisabledStates[index] ?? false;
        // The danger group sits under a hairline when safe items precede it.
        const hasDividerBefore = index === firstDangerIndex && index > 0;
        return (
          <Fragment key={item.key}>
            {hasDividerBefore && (
              <div role="separator" className={styles.divider} />
            )}
            <button
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitem"
              tabIndex={index === focusedIndex ? 0 : -1}
              aria-disabled={isDisabled || undefined}
              className={
                item.tone === "danger"
                  ? `${styles.item} ${styles.itemDanger}`
                  : styles.item
              }
              onFocus={() => onItemFocus(index)}
              onClick={() => {
                if (!isDisabled) onChoose(item);
              }}
            >
              {item.label}
            </button>
          </Fragment>
        );
      })}
    </m.div>
  );
}
