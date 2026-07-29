import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

/** Row-level "⋯" menu, rendered as a SIBLING of the thread row `<button>`
 *  (never nested inside it) — see `.threadRowWrap` in MessagesPage.module.css. */
export function ThreadRowMenu({
  onDelete,
}: {
  /** Opens the delete-confirmation flow for this conversation. */
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);

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
    if (open) itemRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Escape closes and restores focus to the trigger. Home/End/Arrows keep the
  // single item focused so the keyboard contract holds if items are ever added.
  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      itemRef.current?.focus();
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
          <button
            ref={itemRef}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.rowMenuItemDanger}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            <FiTrash2 aria-hidden />
            {t("messages:thread.deleteChat")}
          </button>
        </div>
      )}
    </div>
  );
}
