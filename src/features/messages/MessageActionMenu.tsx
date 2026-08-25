// src/features/messages/MessageActionMenu.tsx
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

export interface MessageActionMenuProps {
  /** Focus target: the parent moves focus here on open and traps it. */
  menuRef: RefObject<HTMLDivElement | null>;
  /** Server-authoritative: own message AND within the server's edit window. */
  canEdit: boolean;
  /** Server-authoritative: own message OR staff. */
  canDelete: boolean;
  /** Server-authoritative: NOT own message. */
  canReport: boolean;
  /** Server-authoritative: may pin/unpin this message. */
  canPin: boolean;
  /** Message is currently pinned (SHARED) — toggles the Pin/Unpin label. */
  pinned: boolean;
  /** Viewer has privately starred it — toggles the Star/Unstar label. */
  starred: boolean;
  onReply: () => void;
  onForward: () => void;
  onTogglePin: () => void;
  onToggleStar: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onReport: () => void;
  /** Called after any action runs, so the parent surface closes. */
  onClose: () => void;
}

/**
 * The permission-gated action list shared by the touch overlay
 * (`MessageActionOverlay`) and the desktop context menu (`MessageContextMenu`)
 * so the two surfaces can never drift. Reply / Forward / Pin / Star are always
 * available (Forward and Star work on any message; Pin is gated by `canPin`);
 * Edit / Delete / Report stay gated by their existing `can*` flags. Each button
 * runs its handler then closes.
 */
export function MessageActionMenu({
  menuRef,
  canEdit,
  canDelete,
  canReport,
  canPin,
  pinned,
  starred,
  onReply,
  onForward,
  onTogglePin,
  onToggleStar,
  onEdit,
  onCopy,
  onDelete,
  onReport,
  onClose,
}: MessageActionMenuProps) {
  const { t } = useTranslation();
  const runThenClose = (action: () => void) => () => {
    action();
    onClose();
  };
  // Roving ArrowUp/ArrowDown + Home/End focus movement among the menu items,
  // additive to the parent overlay's Tab trap (Tab still cycles the whole
  // dialog). Reads the live menuitem buttons so it stays correct as the
  // permission-gated items appear/disappear.
  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const navigationKeys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!navigationKeys.includes(event.key)) return;
    const menu = menuRef.current;
    if (!menu) return;
    const items = Array.from(
      menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
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
  return (
    <div
      ref={menuRef}
      className={styles.overlayMenu}
      role="menu"
      tabIndex={-1}
      aria-label={t("messages:actions.menuLabel")}
      onKeyDown={handleMenuKeyDown}
    >
      <button
        type="button"
        className={styles.overlayMenuItem}
        role="menuitem"
        onClick={runThenClose(onReply)}
      >
        {t("messages:actions.reply")}
      </button>
      <button
        type="button"
        className={styles.overlayMenuItem}
        role="menuitem"
        onClick={runThenClose(onForward)}
      >
        {t("messages:actions.forward")}
      </button>
      {canPin && (
        <button
          type="button"
          className={styles.overlayMenuItem}
          role="menuitem"
          onClick={runThenClose(onTogglePin)}
        >
          {pinned ? t("messages:actions.unpin") : t("messages:actions.pin")}
        </button>
      )}
      <button
        type="button"
        className={styles.overlayMenuItem}
        role="menuitem"
        onClick={runThenClose(onToggleStar)}
      >
        {starred ? t("messages:actions.unstar") : t("messages:actions.star")}
      </button>
      {canEdit && (
        <button
          type="button"
          className={styles.overlayMenuItem}
          role="menuitem"
          onClick={runThenClose(onEdit)}
        >
          {t("messages:actions.edit")}
        </button>
      )}
      <button
        type="button"
        className={styles.overlayMenuItem}
        role="menuitem"
        onClick={runThenClose(onCopy)}
      >
        {t("messages:actions.copy")}
      </button>
      {canDelete && (
        <button
          type="button"
          className={[
            styles.overlayMenuItem,
            styles.overlayMenuItemDanger,
          ].join(" ")}
          role="menuitem"
          onClick={runThenClose(onDelete)}
        >
          {t("messages:actions.delete")}
        </button>
      )}
      {canReport && (
        <button
          type="button"
          className={styles.overlayMenuItem}
          role="menuitem"
          onClick={runThenClose(onReport)}
        >
          {t("messages:actions.report")}
        </button>
      )}
    </div>
  );
}
