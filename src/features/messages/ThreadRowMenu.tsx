import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useThreadRowMenuItems } from "./useThreadRowMenuItems";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/** Row-level "⋯" menu, rendered as a SIBLING of the thread row `<button>`
 *  (never nested inside it) — see `.threadRowWrap` in MessagesPage.module.css.
 *  Pin/Favorite are CONVERSATION-scoped (a different concept from the existing
 *  message-level pin/star inside a thread). */
export function ThreadRowMenu({
  thread,
  isUnread,
  onTogglePin,
  onToggleFavorite,
  onToggleMute,
  onToggleArchive,
  onToggleReadUnread,
  onDelete,
}: {
  /** Carries this row's own pinned/favorite/muted/archived state — the pin cap
   *  check itself lives in `useTogglePin` (the caller computes and passes the
   *  pinned count into its `mutate()` call, not through this component). */
  thread: Conversation;
  /** Whether the row is CURRENTLY showing as unread (real unread count OR a
   *  manual "mark unread", PRD-225) — decides the Mark as read/unread label,
   *  computed by the caller (`isThreadUnread`) so this stays in lockstep with
   *  the row's own badge. */
  isUnread: boolean;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  /** Marks read (reuses the real read-watermark mutation) when `isUnread` is
   *  true, or marks unread (PRD-225) when it's false. */
  onToggleReadUnread: () => void;
  /** Opens the delete-confirmation flow for this conversation. */
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Item definitions live in their own hook purely to keep this component
  // under the 200-line cap — see `useThreadRowMenuItems`'s own doc.
  const items = useThreadRowMenuItems(thread, isUnread, {
    onTogglePin,
    onToggleFavorite,
    onToggleMute,
    onToggleArchive,
    onToggleReadUnread,
    onDelete,
  });

  useEffect(() => {
    if (!open) return;
    function onDocumentPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
    };
  }, [open]);

  // APG menu-button contract: move focus into the menu when it opens.
  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // APG menu keyboard contract, generalized to N items: Arrow Up/Down move a
  // roving focus, Home/End jump to the ends, Escape closes and restores focus
  // to the trigger.
  const moveTo = (index: number) => {
    const nextIndex = (index + items.length) % items.length;
    itemRefs.current[nextIndex]?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    const currentIndex = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(currentIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(currentIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(items.length - 1);
        break;
    }
  };

  return (
    <div className={styles.rowMenu} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.rowMenuTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("messages:thread.menuAria")}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
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
              onClick={(event) => {
                event.stopPropagation();
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
    </div>
  );
}
