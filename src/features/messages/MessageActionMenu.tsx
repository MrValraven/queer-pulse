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
  /** May star/unstar this message: has a server id, so the toggle never
   *  silently no-ops on a demo/optimistic message with none. Optional,
   *  defaulting to true, mirroring `canCopy`'s own default so a caller with
   *  no notion of a message id (the desktop context menu, today) keeps its
   *  prior always-show behavior unchanged. */
  canStar?: boolean;
  /** Viewer has privately starred it — toggles the Star/Unstar label. */
  starred: boolean;
  onReply: () => void;
  onForward: () => void;
  onTogglePin: () => void;
  onToggleStar: () => void;
  onEdit: () => void;
  onCopy: () => void;
  /** DES-203: whether to offer Copy at all. False hides it for a media
   *  message with no caption (there's nothing meaningful to copy; WhatsApp
   *  hides Copy the same way). Optional, defaulting to true, so a caller
   *  that has no notion of attachments (the desktop context menu, today)
   *  keeps its prior always-show behavior unchanged. */
  canCopy?: boolean;
  /** PRD-351: whether to offer "Info" (delivery and read details). Only the
   *  viewer's own, server-confirmed, not-deleted message qualifies (see
   *  `canShowMessageInfo`). Optional, defaulting to false, so a caller with
   *  no info surface never shows an item that does nothing. */
  canShowInfo?: boolean;
  onInfo?: () => void;
  /** PRD-352: whether to offer "Reactions" (who reacted). Only a
   *  server-confirmed, not-deleted message with a reaction qualifies (see
   *  `canShowMessageReactors`). Optional, defaulting to false, the same as
   *  `canShowInfo`. The keyboard and screen-reader path to the sheet. */
  canShowReactions?: boolean;
  onReactions?: () => void;
  onDelete: () => void;
  /** "Delete for me" (PRD-227) — hides this message from the caller's own
   *  view only. Unconditional (unlike `onDelete`/`canDelete`): ANY
   *  participant may do this, not just the author or staff. */
  onDeleteForMe: () => void;
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
  canStar = true,
  starred,
  onReply,
  onForward,
  onTogglePin,
  onToggleStar,
  onEdit,
  onCopy,
  canCopy = true,
  canShowInfo = false,
  onInfo,
  canShowReactions = false,
  onReactions,
  onDelete,
  onDeleteForMe,
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
      {canStar && (
        <button
          type="button"
          className={styles.overlayMenuItem}
          role="menuitem"
          onClick={runThenClose(onToggleStar)}
        >
          {starred ? t("messages:actions.unstar") : t("messages:actions.star")}
        </button>
      )}
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
      {canCopy && (
        <button
          type="button"
          className={styles.overlayMenuItem}
          role="menuitem"
          onClick={runThenClose(onCopy)}
        >
          {t("messages:actions.copy")}
        </button>
      )}
      {canShowInfo && onInfo && (
        <button
          type="button"
          className={styles.overlayMenuItem}
          role="menuitem"
          onClick={runThenClose(onInfo)}
        >
          {t("messages:actions.info")}
        </button>
      )}
      {canShowReactions && onReactions && (
        <button
          type="button"
          className={styles.overlayMenuItem}
          role="menuitem"
          onClick={runThenClose(onReactions)}
        >
          {t("messages:actions.reactions")}
        </button>
      )}
      {/* "Delete for me" (PRD-227) is unconditional — every participant may
          hide a message from their own view, not just the author/staff who
          can tombstone it for everyone below. */}
      <button
        type="button"
        className={styles.overlayMenuItem}
        role="menuitem"
        onClick={runThenClose(onDeleteForMe)}
      >
        {t("messages:actions.deleteForMe")}
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

/**
 * The action surface for a reportable tombstone (a "deleted for everyone"
 * message the server still lets a non-author report during its 30-day
 * evidence hold, `ChatMessage.canReport`) — the touch overlay and desktop
 * context menu both render THIS instead of the full `MessageActionMenu`, so
 * Reply/React/Forward/Star/Copy/Pin/Edit/Delete/Info can never leak onto a
 * tombstone: this menu simply never has them to gate.
 */
export function TombstoneReportMenu({
  menuRef,
  onReport,
  onClose,
}: {
  /** Focus target: the parent moves focus here on open and traps it. */
  menuRef: RefObject<HTMLDivElement | null>;
  onReport: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      ref={menuRef}
      className={styles.overlayMenu}
      role="menu"
      tabIndex={-1}
      aria-label={t("messages:actions.menuLabel")}
    >
      <button
        type="button"
        className={styles.overlayMenuItem}
        role="menuitem"
        onClick={() => {
          onReport();
          onClose();
        }}
      >
        {t("messages:actions.report")}
      </button>
    </div>
  );
}
