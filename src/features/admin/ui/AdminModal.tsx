import { useEffect, useId, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  pushModal,
  popModal,
  isTopmostModal,
} from "../../../shared/components/ui/modalStack";
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
  // Stable per-instance id so this dialog can register itself on the shared
  // modal stack (see `shared/components/ui/modalStack`) and only act on
  // Escape while topmost — see `Modal`'s `useDismiss` for the same fix.
  const modalId = useId();

  useEffect(() => {
    pushModal(modalId);
    return () => popModal(modalId);
  }, [modalId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTopmostModal(modalId)) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, modalId]);

  return (
    <div
      className={styles.modalScrim}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[styles.modal, wide && styles.modalWide]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
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
