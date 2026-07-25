// src/features/messages/MessageActions.tsx
import { useEffect, useRef, useState } from "react";
import { FiMoreHorizontal, FiSmile } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { ReactionPicker } from "./ReactionPicker";
import styles from "./MessagesPage.module.css";

export interface MessageActionsProps {
  /** Whether the signed-in member may delete this message (own message, or staff). */
  canDelete: boolean;
  onReact: (key: MessageReactionKey) => void;
  onReport: () => void;
  onDelete: () => void;
}

/**
 * Small floating action bar shown on bubble hover (desktop) — revealed via
 * CSS in `MessageRun`. A "React" button opens the emoji picker popover; a
 * "More" button opens a menu with Report (always) and Delete (only when
 * `canDelete`). `data-open` on the root lets the CSS keep the whole bar
 * visible while either popover is open, even after the pointer leaves.
 */
export function MessageActions({
  canDelete,
  onReact,
  onReport,
  onDelete,
}: MessageActionsProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const anyOpen = pickerOpen || menuOpen;

  useEffect(() => {
    if (!anyOpen) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
        setMenuOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPickerOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [anyOpen]);

  return (
    <div
      className={styles.messageActions}
      ref={rootRef}
      data-open={anyOpen ? "true" : undefined}
    >
      <button
        type="button"
        className={styles.messageActionBtn}
        aria-haspopup="menu"
        aria-expanded={pickerOpen}
        aria-label={t("messages:actions.react")}
        onClick={() => {
          setMenuOpen(false);
          setPickerOpen((open) => !open);
        }}
      >
        <FiSmile aria-hidden />
      </button>
      <button
        type="button"
        className={styles.messageActionBtn}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t("messages:actions.more")}
        onClick={() => {
          setPickerOpen(false);
          setMenuOpen((open) => !open);
        }}
      >
        <FiMoreHorizontal aria-hidden />
      </button>

      {pickerOpen && (
        <div className={styles.reactionPickerPopover}>
          <ReactionPicker
            onPick={(key) => {
              setPickerOpen(false);
              onReact(key);
            }}
          />
        </div>
      )}

      {menuOpen && (
        <div className={styles.messageActionsMenu} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.messageActionsMenuItem}
            onClick={() => {
              setMenuOpen(false);
              onReport();
            }}
          >
            {t("messages:actions.report")}
          </button>
          {canDelete && (
            <button
              type="button"
              role="menuitem"
              className={`${styles.messageActionsMenuItem} ${styles.messageActionsMenuItemDanger}`}
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
            >
              {t("messages:actions.delete")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
