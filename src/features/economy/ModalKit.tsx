import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { FiCheck, FiClock, FiFile } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ApplicationModals.module.css";

// Consolidated into the shared UI layer — re-exported here so existing
// `./ModalKit` consumers keep their imports unchanged. The submit-flow hook
// (`useSubmitFlow`) lives in `./modalFlow`.
export { Sending } from "../../shared/components/ui";

// Focusable-descendant selector for the Tab focus-trap (mirrors Modal.tsx).
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  // Latest-callback ref so the focus-setup effect can run once on mount (deps
  // `[]`) without an inline `onClose` re-running the initial focus + trap on
  // every parent render, which would yank focus back mid-interaction.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useScrollLock();

  // Escape-to-close, an initial focus into the dialog, a Tab focus-trap so
  // keyboard/screen-reader users can't tab out to the inert page behind, and
  // focus restore to the opener on close. (Mirrors Modal.tsx's useDismiss.)
  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
          ).filter((element) => element.offsetParent !== null)
        : [];

    const firstFocusable = focusables()[0];
    if (firstFocusable) firstFocusable.focus();
    else dialog?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = focusables();
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (!firstItem || !lastItem) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === firstItem || activeElement === dialog)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  // Drag-to-dismiss for the mobile sheet (mirrors the shared <ModalSheet>).
  // Touch-only — mouse is ignored so the desktop centered dialog is untouched.
  // A downward drag past the threshold closes; anything shorter springs back.
  // The transform is written straight to the sheet element to stay off the React
  // render path during the drag.
  const dragStartYRef = useRef<number | null>(null);
  const handleGrabberPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "mouse") return;
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleGrabberPointerMove = (event: ReactPointerEvent) => {
    const sheet = dialogRef.current;
    if (dragStartYRef.current === null || !sheet) return;
    const dragDistance = Math.max(0, event.clientY - dragStartYRef.current);
    sheet.style.transition = "none";
    sheet.style.transform = `translateY(${dragDistance}px)`;
  };
  const handleGrabberPointerEnd = (event: ReactPointerEvent) => {
    const sheet = dialogRef.current;
    if (dragStartYRef.current === null || !sheet) return;
    const dragDistance = event.clientY - dragStartYRef.current;
    dragStartYRef.current = null;
    if (dragDistance > 120) {
      onClose();
      return;
    }
    sheet.style.transition = "transform var(--dur-base, 0.24s) var(--ease)";
    sheet.style.transform = "translateY(0)";
    const clearInlineDragStyles = () => {
      sheet.style.transition = "";
      sheet.style.transform = "";
      sheet.removeEventListener("transitionend", clearInlineDragStyles);
    };
    sheet.addEventListener("transitionend", clearInlineDragStyles);
  };

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
        ref={dialogRef}
        tabIndex={-1}
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
        {!success && (
          <div
            className={styles.grabber}
            aria-hidden
            onPointerDown={handleGrabberPointerDown}
            onPointerMove={handleGrabberPointerMove}
            onPointerUp={handleGrabberPointerEnd}
            onPointerCancel={handleGrabberPointerEnd}
          />
        )}
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

/**
 * Plum-panel "coming soon" shown in live mode for submit flows that have no
 * backend yet — an honest stand-in so we never fake a success the API can't
 * deliver. Reuses the success panel's chrome with a clock glyph.
 */
export function ComingSoonPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiClock size={26} color="var(--jade)" aria-hidden />
      </div>
      <h2>
        {t("economy:comingSoon.title")} <em>{t("economy:comingSoon.em")}</em>
      </h2>
      <p>{t("economy:comingSoon.body")}</p>
      <div className={styles.successBtn}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {t("economy:comingSoon.close")}
        </Button>
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
