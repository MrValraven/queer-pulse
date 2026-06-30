import { useEffect, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../hooks";
import styles from "./Modal.module.css";

/**
 * Closes the dialog on Escape. Shared by both modal variants.
 * Mount the modal only while open so this and `useScrollLock` run per the repo
 * convention (self-contained modals own their state).
 */
function useDismiss(onClose: () => void) {
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  eyebrow?: ReactNode;
  sub?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Centered dialog with a head (eyebrow + title + close), scrolling body, and
 * optional footer. The canonical modal for confirmations, settings, and forms.
 */
export function Modal({
  title,
  onClose,
  eyebrow,
  sub,
  footer,
  wide = false,
  className,
  children,
}: ModalProps) {
  useDismiss(onClose);
  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={[styles.modal, wide && styles.modalWide, className]
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
            {sub && <p className={styles.modalSub}>{sub}</p>}
          </div>
          <button
            type="button"
            className={styles.modalX}
            onClick={onClose}
            aria-label="Close"
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

interface ModalSheetProps {
  onClose: () => void;
  /** Switches the sheet to the plum success surface (removes padding + close chrome handling stays). */
  success?: boolean;
  wide?: boolean;
  /** Accessible label for the dialog when there's no in-body heading. */
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Bottom-sheet content modal (rises from the bottom on mobile, centers on
 * desktop). Used for richer post/submit forms whose own markup provides the
 * eyebrow/title/sub header. Pair with `<SuccessPanel>` for the done state.
 */
export function ModalSheet({
  onClose,
  success = false,
  wide = false,
  ariaLabel,
  className,
  children,
}: ModalSheetProps) {
  useDismiss(onClose);
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          styles.sheet,
          wide && styles.sheetWide,
          success && styles.sheetSuccess,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {!success && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
