import { useEffect, useRef, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../hooks";
import styles from "./Modal.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal a11y for both variants: scroll-lock, Escape-to-close, an initial focus
 * into the dialog, a Tab focus-trap so keyboard/screen-reader users can't tab
 * out to the inert page behind, and focus restore to the trigger on close.
 * Returns a ref to attach to the dialog container. Mount the modal only while
 * open (self-contained modals own their state), so this runs per open.
 */
function useDismiss(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null,
          )
        : [];

    // Initial focus: first focusable inside, else the dialog itself.
    const first = focusables()[0];
    if (first) first.focus();
    else dialog?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = focusables();
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const active = document.activeElement;
      if (e.shiftKey && (active === firstEl || active === dialog)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return dialogRef;
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
  const dialogRef = useDismiss(onClose);
  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
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
  const dialogRef = useDismiss(onClose);
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
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
