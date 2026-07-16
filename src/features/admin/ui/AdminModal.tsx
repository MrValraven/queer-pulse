import { useEffect, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./adminUi.module.css";

/**
 * Centered modal dialog. Mount it only while open (parent renders it
 * conditionally) so `useScrollLock` runs unconditionally per repo convention.
 */
export function AdminModal({
  eyebrow,
  title,
  onClose,
  footer,
  wide = false,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  useScrollLock();
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.modalScrim} onClick={onClose}>
      <div
        className={[styles.modal, wide && styles.modalWide]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <div className={styles.modalHeadTx}>
            {eyebrow && <div className={styles.modalEyebrow}>{eyebrow}</div>}
            <h3 className={styles.modalTitle}>{title}</h3>
          </div>
          <button
            type="button"
            className={styles.modalX}
            onClick={onClose}
            aria-label={t("admin:common.close")}
          >
            <FiX />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFoot}>{footer}</div>}
      </div>
    </div>
  );
}
