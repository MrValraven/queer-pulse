import { useEffect, type ReactNode } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ResourceModal.module.css";

/** Bottom-sheet / centred modal shell. Mounted only when open, so it locks scroll unconditionally. */
export function ResourceModal({
  title,
  onClose,
  children,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  useScrollLock();
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.sheet} role="dialog" aria-modal="true">
        {title ? (
          <div className={styles.head}>
            <div className={styles.title}>{title}</div>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label={t("resources:modal.closeAriaLabel")}
            >
              <FiX />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.closeFloat}
            onClick={onClose}
            aria-label={t("resources:modal.closeAriaLabel")}
          >
            <FiX />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/** Plum-panel success state shown inside a ResourceModal after a simulated submit. */
export function PlumSuccess({
  title,
  sub,
  onClose,
  closeLabel,
}: {
  title: ReactNode;
  sub: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiCheck />
      </div>
      <div className={styles.successTitle}>{title}</div>
      <p className={styles.successSub}>{sub}</p>
      <div className={styles.successActions}>
        <Button type="button" variant="ghost-dark" onClick={onClose}>
          {closeLabel ?? t("resources:modal.doneCta")}
        </Button>
      </div>
    </div>
  );
}
