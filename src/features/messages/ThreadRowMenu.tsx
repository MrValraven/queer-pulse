import { useEffect, useRef, useState } from "react";
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
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.rowMenu} ref={containerRef}>
      <button
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
        <div className={styles.rowMenuPopover} role="menu">
          <button
            type="button"
            role="menuitem"
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
