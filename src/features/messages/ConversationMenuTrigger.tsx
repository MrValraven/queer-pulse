// src/features/messages/ConversationMenuTrigger.tsx
import type {
  Dispatch,
  KeyboardEvent,
  MutableRefObject,
  RefObject,
  SetStateAction,
} from "react";
import { FiBellOff, FiMoreHorizontal } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MenuItemDef } from "./buildConversationMenuItems";
import styles from "./MessagesPage.module.css";

interface ConversationMenuTriggerProps {
  name: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  itemRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  onMenuKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** PRD-349's "Muted until {time}" / "Muted" status row, null when unmuted. */
  muteStatusLabel: string | null;
  items: MenuItemDef[];
}

/**
 * The `ConversationMenu`'s visible affordance: the "⋯" trigger button and, once
 * open, its popover (the mute status row, then every built menu item). Split
 * out purely to keep that orchestrator under the size cap; keyboard/open-state
 * mechanics stay owned by the caller's `useKebabMenuA11y`, this component only
 * renders what it's handed.
 */
export function ConversationMenuTrigger({
  name,
  open,
  setOpen,
  triggerRef,
  itemRefs,
  onMenuKeyDown,
  muteStatusLabel,
  items,
}: ConversationMenuTriggerProps) {
  const { t } = useTranslation();
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.ctbIconBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("messages:conversation.menuAriaLabel", { name })}
        title={t("messages:conversation.menuAriaLabel", { name })}
        onClick={() => setOpen((previous) => !previous)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {open && (
        <div
          className={styles.rowMenuPopover}
          role="menu"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {muteStatusLabel && (
            // Non-interactive status row, deliberately NOT a `menuitem`/
            // counted in `itemRefs`, so the roving-tabindex keyboard nav
            // below skips straight to the actionable "Unmute" item right
            // after it.
            <div className={styles.rowMenuItem} aria-disabled="true">
              <FiBellOff aria-hidden />
              {muteStatusLabel}
            </div>
          )}
          {items.map((item, index) => (
            <button
              key={item.key}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={
                item.danger ? styles.rowMenuItemDanger : styles.rowMenuItem
              }
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
