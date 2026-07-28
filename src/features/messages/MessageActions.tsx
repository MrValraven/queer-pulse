// src/features/messages/MessageActions.tsx
import { useEffect, useRef, useState } from "react";
import { FiMoreHorizontal, FiSmile } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { ReactionPicker } from "./ReactionPicker";
import styles from "./MessagesPage.module.css";

export interface MessageActionsProps {
  onReact: (key: MessageReactionKey) => void;
  /** Opens the full action overlay (Reply / Edit / Copy / Delete / Report) —
   *  the same sheet long-press (touch) and right-click (desktop) open. Wiring
   *  the "More" button to it gives keyboard and mouse users every action, not
   *  just React: the hover bar is reachable via `:focus-within`, so Tab lands
   *  here and Enter opens the overlay, which then manages its own focus. */
  onOpenOverlay: () => void;
}

/**
 * Small floating action bar shown on bubble hover (desktop) and reachable by
 * keyboard (revealed via `:focus-within` in `MessageRun`). A "React" button
 * opens the emoji picker popover; a "More" button opens the full action
 * overlay. `data-open` on the root lets the CSS keep the bar visible while the
 * picker is open, even after the pointer leaves.
 */
export function MessageActions({ onReact, onOpenOverlay }: MessageActionsProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPickerOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [pickerOpen]);

  return (
    <div
      className={styles.messageActions}
      ref={rootRef}
      data-open={pickerOpen ? "true" : undefined}
    >
      <button
        type="button"
        className={styles.messageActionBtn}
        aria-haspopup="menu"
        aria-expanded={pickerOpen}
        aria-label={t("messages:actions.react")}
        onClick={() => setPickerOpen((open) => !open)}
      >
        <FiSmile aria-hidden />
      </button>
      <button
        type="button"
        className={styles.messageActionBtn}
        aria-haspopup="dialog"
        aria-label={t("messages:actions.more")}
        onClick={() => {
          setPickerOpen(false);
          onOpenOverlay();
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
    </div>
  );
}
