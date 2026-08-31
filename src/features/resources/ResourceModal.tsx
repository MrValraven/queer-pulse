import { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiClock, FiX } from "react-icons/fi";
import { Button, useDismiss } from "../../shared/components/ui";
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
  const { t } = useTranslation();
  // Shared dialog behaviour: scroll lock, initial focus into the sheet, a Tab
  // trap so a keyboard user cannot reach the page behind, focus restore to the
  // trigger on close, and modal-stack-aware Escape.
  const dialogRef = useDismiss(onClose);
  const titleId = useId();
  // The success and coming-soon panels are rendered with an empty title, so the
  // dialog falls back to a name of its own instead of announcing as unnamed.
  const hasTitle = Boolean(title);

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : t("resources:modal.resultAriaLabel")}
      >
        {hasTitle ? (
          <div className={styles.head}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
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
    </div>,
    document.body,
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

/**
 * Honest plum-panel "coming soon" state. Shown in LIVE mode in place of a
 * submission form whose backing endpoint does not exist yet — so we never
 * fabricate a success ("submitted"/"received") for a request that reaches no
 * one. The demo mode keeps the full mock form + simulated success.
 */
export function PlumComingSoon({
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
        <FiClock />
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
