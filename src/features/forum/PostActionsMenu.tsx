import { useEffect, useId, useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./PostActionsMenu.module.css";

interface PostActionsMenuProps {
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
}

export function PostActionsMenu({
  canEdit,
  canDelete,
  canRestore,
  canViewHistory,
  onEdit,
  onDelete,
  onRestore,
  onHistory,
}: PostActionsMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!canEdit && !canDelete && !canRestore && !canViewHistory) return null;

  const runAndClose = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t("forum:postMenu.ariaLabel")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {open && (
        <div id={menuId} role="menu" className={styles.menu}>
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={runAndClose(onEdit)}
            >
              {t("forum:postMenu.edit")}
            </button>
          )}
          {canViewHistory && (
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={runAndClose(onHistory)}
            >
              {t("forum:postMenu.history")}
            </button>
          )}
          {canRestore && (
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={runAndClose(onRestore)}
            >
              {t("forum:postMenu.restore")}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              role="menuitem"
              className={`${styles.item} ${styles.danger}`}
              onClick={runAndClose(onDelete)}
            >
              {t("forum:postMenu.delete")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
