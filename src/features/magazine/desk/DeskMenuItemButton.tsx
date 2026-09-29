import { useId, type PointerEvent } from "react";
import { FiCheck } from "react-icons/fi";
import type { DeskMenuSelectableItem } from "./deskMenuItems";
import styles from "./DeskMenu.module.css";

export interface DeskMenuItemButtonProps {
  item: DeskMenuSelectableItem;
  /** Registers the button with the menu's keyboard roving. */
  itemRef: (node: HTMLButtonElement | null) => void;
  onSelect: (item: DeskMenuSelectableItem) => void;
}

const ROLE_BY_KIND = {
  action: "menuitem",
  radio: "menuitemradio",
  checkbox: "menuitemcheckbox",
} as const;

/**
 * One choosable row of a `DeskMenu`. The accessible name is the label alone
 * (via `aria-labelledby`) and the muted second line is its description, so a
 * screen reader says "Issue 12" and then the slot count. The shortcut hint is
 * `aria-hidden` and stays out of the name.
 */
export function DeskMenuItemButton({
  item,
  itemRef,
  onSelect,
}: DeskMenuItemButtonProps) {
  const labelId = useId();
  const descriptionId = useId();
  const isCheckable = item.kind !== "action";
  const isDisabled = item.kind === "action" && item.isDisabled === true;
  const isDanger = item.kind === "action" && item.tone === "danger";
  const hasLead = isCheckable || item.icon !== undefined;

  // Pointer and keyboard share one highlight: hovering with a mouse moves real
  // focus, so the next arrow press continues from the row under the pointer.
  function handlePointerMove(event: PointerEvent<HTMLButtonElement>): void {
    if (event.pointerType !== "mouse" || isDisabled) return;
    if (document.activeElement === event.currentTarget) return;
    event.currentTarget.focus({ preventScroll: true });
  }

  return (
    <button
      ref={itemRef}
      type="button"
      role={ROLE_BY_KIND[item.kind]}
      tabIndex={-1}
      aria-checked={isCheckable ? item.isChecked : undefined}
      aria-disabled={isDisabled || undefined}
      aria-labelledby={labelId}
      aria-describedby={item.description ? descriptionId : undefined}
      className={isDanger ? styles.itemDanger : styles.item}
      onClick={() => {
        if (!isDisabled) onSelect(item);
      }}
      onPointerMove={handlePointerMove}
    >
      {hasLead && (
        <span className={styles.lead} aria-hidden>
          {isCheckable
            ? item.isChecked && <FiCheck className={styles.check} />
            : item.icon}
        </span>
      )}
      <span className={styles.text}>
        <span id={labelId} className={styles.label}>
          {item.label}
        </span>
        {item.description && (
          <span id={descriptionId} className={styles.description}>
            {item.description}
          </span>
        )}
      </span>
      {item.kind === "action" && item.shortcut && (
        <kbd className={styles.shortcut} aria-hidden>
          {item.shortcut}
        </kbd>
      )}
    </button>
  );
}
