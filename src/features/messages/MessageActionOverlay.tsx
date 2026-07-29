// src/features/messages/MessageActionOverlay.tsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useScrollLock, usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { MessageActionMenu } from "./MessageActionMenu";
import { ReactionPicker } from "./ReactionPicker";
import { MentionText } from "../../shared/mentions/MentionText";
import { renderWithLinks } from "./linkify";
import styles from "./MessagesPage.module.css";

// Focusable-descendant selector for the Tab focus-trap (mirrors Modal.tsx).
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface MessageActionOverlayProps {
  /** The bubble body, rendered read-only in the lifted clone. */
  text: string;
  /** Right-align the lifted bubble like the real one. */
  isSent: boolean;
  /** Where the pressed bubble is, for positioning the lifted clone + menu. */
  anchorRect: DOMRect;
  /** Own message AND within the 15-min edit window. */
  canEdit: boolean;
  /** Own message OR staff. */
  canDelete: boolean;
  /** NOT own message. */
  canReport: boolean;
  /** May pin/unpin this message (server-authoritative). */
  canPin: boolean;
  /** Message is currently pinned (SHARED). */
  pinned: boolean;
  /** Viewer has privately starred it. */
  starred: boolean;
  onReact: (key: MessageReactionKey) => void;
  onReply: () => void;
  onForward: () => void;
  onTogglePin: () => void;
  onToggleStar: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onReport: () => void;
  onClose: () => void;
}

/**
 * WhatsApp-style full-screen overlay opened by long-press (touch) or
 * right-click (desktop) on a message bubble: a lifted read-only clone of the
 * bubble, a reaction row above it, and an action menu below (Reply / Edit /
 * Copy / Delete / Report, gated by the `can*` props). Portals to
 * `document.body` so it escapes the scrollable message list; every action is
 * wrapped to run the handler then close the overlay, so the parent owns any
 * follow-up UI (e.g. the delete confirm dialog).
 */
export function MessageActionOverlay({
  text,
  isSent,
  anchorRect,
  canEdit,
  canDelete,
  canReport,
  canPin,
  pinned,
  starred,
  onReact,
  onReply,
  onForward,
  onTogglePin,
  onToggleStar,
  onEdit,
  onCopy,
  onDelete,
  onReport,
  onClose,
}: MessageActionOverlayProps) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  useScrollLock();

  // Close on Escape; move focus into the menu; trap Tab within the dialog so
  // keyboard/screen-reader users can't reach the inert message list behind it;
  // restore focus on unmount. (Trap mirrors the Modal.tsx pattern.)
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    menuRef.current?.focus();

    const focusableItems = (): HTMLElement[] => {
      const column = columnRef.current;
      return column
        ? Array.from(
            column.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
          ).filter((element) => element.offsetParent !== null)
        : [];
    };

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const column = columnRef.current;
      if (!column) return;
      const items = focusableItems();
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const activeElement = document.activeElement;
      if (!firstItem || !lastItem) {
        event.preventDefault();
        menuRef.current?.focus();
        return;
      }
      if (
        event.shiftKey &&
        (activeElement === firstItem || activeElement === column || activeElement === menuRef.current)
      ) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  // Anchor the sheet to the pressed bubble; flip above when low in the viewport.
  const openBelow = anchorRect.bottom < window.innerHeight * 0.6;
  // Anchor horizontally to the bubble too, not the viewport edge: on desktop the
  // conversation panel starts ~360px in, so pinning received menus to the left
  // viewport edge left them detached from the bubble. Received aligns its start
  // edge to the bubble's left; sent aligns its end edge to the bubble's right —
  // each clamped so the column never spills off either side.
  const columnMaxWidth = Math.min(320, window.innerWidth * 0.82);
  const edgeGap = 8;
  const maxInset = Math.max(edgeGap, window.innerWidth - columnMaxWidth - edgeGap);
  const horizontalStyle = isSent
    ? { right: Math.min(maxInset, Math.max(edgeGap, window.innerWidth - anchorRect.right)) }
    : { left: Math.min(maxInset, Math.max(edgeGap, anchorRect.left)) };
  const runThenClose = (action: () => void) => () => {
    action();
    onClose();
  };

  return createPortal(
    <div
      className={styles.overlayBackdrop}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={columnRef}
        className={[
          styles.overlayColumn,
          openBelow ? styles.overlayColumnBelow : styles.overlayColumnAbove,
          isSent ? styles.overlaySent : styles.overlayReceived,
        ].join(" ")}
        style={{
          top: openBelow ? anchorRect.top : undefined,
          bottom: openBelow
            ? undefined
            : window.innerHeight - anchorRect.bottom,
          ...horizontalStyle,
        }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("messages:actions.overlayLabel")}
      >
        <div className={styles.overlayReactions}>
          <ReactionPicker onPick={(key) => runThenClose(() => onReact(key))()} />
        </div>

        <div
          className={[styles.overlayBubble, isSent ? styles.sent : styles.received].join(" ")}
        >
          <MentionText text={text} renderText={renderWithLinks} />
        </div>

        <MessageActionMenu
          menuRef={menuRef}
          canEdit={canEdit}
          canDelete={canDelete}
          canReport={canReport}
          canPin={canPin}
          pinned={pinned}
          starred={starred}
          onReply={onReply}
          onForward={onForward}
          onTogglePin={onTogglePin}
          onToggleStar={onToggleStar}
          onEdit={onEdit}
          onCopy={onCopy}
          onDelete={onDelete}
          onReport={onReport}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body,
  );
}
