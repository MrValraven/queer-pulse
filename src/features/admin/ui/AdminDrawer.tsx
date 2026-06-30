import { useEffect, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../../shared/hooks";
import styles from "./adminUi.module.css";

/**
 * Right-hand slide-over drawer. Mount it only while open (the parent renders it
 * conditionally) so `useScrollLock` runs unconditionally per repo convention.
 */
export function AdminDrawer({
  head,
  children,
  foot,
  onClose,
  label,
}: {
  head: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
  onClose: () => void;
  label?: string;
}) {
  useScrollLock();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className={styles.scrim} onClick={onClose} />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className={styles.drawerHead}>
          <div className={styles.drawerHeadMain}>{head}</div>
          <button
            type="button"
            className={styles.drawerX}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <div className={styles.drawerBody}>{children}</div>
        {foot && <div className={styles.drawerFoot}>{foot}</div>}
      </aside>
    </>
  );
}
