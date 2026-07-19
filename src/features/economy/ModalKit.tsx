import { useEffect, type ReactNode } from "react";
import { FiCheck, FiFile } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ApplicationModals.module.css";

// Consolidated into the shared UI/hooks layer — re-exported here so existing
// `./ModalKit` consumers keep their imports unchanged.
export { Sending } from "../../shared/components/ui";
export { useSubmitFlow, type FlowStatus } from "../../shared/hooks";

/** Small file glyph used in attachment rows. */
export function FileIcon() {
  return <FiFile className={styles.attachIcon} size={16} aria-hidden />;
}

/** Shared bottom-sheet modal frame: backdrop, close button, scroll lock. */
export function ModalShell({
  onClose,
  success,
  wide,
  ariaLabel,
  children,
}: {
  onClose: () => void;
  success?: boolean;
  wide?: boolean;
  /** Accessible name for the dialog (the visible title lives in children). */
  ariaLabel?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className={styles.overlay}
      // Backdrop click is a mouse-only shortcut; Esc and the close button
      // already provide the keyboard path, so this div is not interactive.
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          styles.modal,
          wide && styles.modalWide,
          success && styles.modalSuccess,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("economy:modalKit.closeAriaLabel")}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

/** Plum-panel confirmation shown after a flow completes. */
export function SuccessPanel({
  title,
  em,
  children,
  onClose,
  closeLabel,
  footer,
}: {
  title: string;
  em: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  /** Optional extra content below the primary action — e.g. an undo affordance. */
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiCheck size={26} color="var(--jade)" aria-hidden />
      </div>
      <h2>
        {title} <em>{em}</em>
      </h2>
      <p>{children}</p>
      <div className={styles.successBtn}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {closeLabel ?? t("economy:modalKit.close")}
        </Button>
      </div>
      {footer}
    </div>
  );
}
