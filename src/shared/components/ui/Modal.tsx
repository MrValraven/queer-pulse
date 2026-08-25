import {
  useId,
  useRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { useDismiss, useScrimDismiss } from "./useDismiss";
import styles from "./Modal.module.css";

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
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const scrimProps = useScrimDismiss(onClose);
  const titleId = useId();
  // Portal to <body> so the fixed scrim is anchored to the viewport, never to a
  // transformed/contained ancestor. A `transform`, `filter`, `contain: paint`
  // or `content-visibility: auto` on any ancestor establishes a containing
  // block that would confine this `position: fixed` scrim to that ancestor's
  // box instead of the viewport (e.g. FeedPage's `.greetingRow`, which keeps a
  // resting transform from its `feedEnter` fill-mode animation). Rendering
  // through <body> escapes all of them. React events still bubble via the React
  // tree, so onClose et al. work unchanged.
  return createPortal(
    <div className={styles.scrim} role="presentation" {...scrimProps}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={[styles.modal, wide && styles.modalWide, className]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.modalHead}>
          <div className={styles.modalHeadTx}>
            {eyebrow && <div className={styles.modalEyebrow}>{eyebrow}</div>}
            <h3 id={titleId} className={styles.modalTitle}>
              {title}
            </h3>
            {sub && <p className={styles.modalSub}>{sub}</p>}
          </div>
          <button
            type="button"
            className={styles.modalX}
            onClick={onClose}
            aria-label={t("shared:modal.close")}
          >
            <FiX />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFoot}>{footer}</div>}
      </div>
    </div>,
    document.body,
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
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const scrimProps = useScrimDismiss(onClose);
  // Drag-to-dismiss for the mobile sheet. Touch-only (mouse is ignored so the
  // desktop centered dialog is untouched); a downward drag past the threshold
  // closes, anything shorter springs back. The transform is written directly to
  // the sheet element to stay off the React render path during the drag.
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
    // Under threshold: spring back to rest instead of snapping instantly.
    // (Reduced-motion collapses this transition via the global base.css rule.)
    sheet.style.transition = "transform var(--dur-base, 0.24s) var(--ease)";
    sheet.style.transform = "translateY(0)";
    const clearInlineDragStyles = () => {
      sheet.style.transition = "";
      sheet.style.transform = "";
      sheet.removeEventListener("transitionend", clearInlineDragStyles);
    };
    sheet.addEventListener("transitionend", clearInlineDragStyles);
  };

  // Portal to <body> for the same reason as <Modal> above: the fixed overlay
  // must anchor to the viewport, not to any transformed/contained ancestor.
  return createPortal(
    <div className={styles.overlay} role="presentation" {...scrimProps}>
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
          <>
            <div
              className={styles.grabber}
              aria-hidden
              onPointerDown={handleGrabberPointerDown}
              onPointerMove={handleGrabberPointerMove}
              onPointerUp={handleGrabberPointerEnd}
              onPointerCancel={handleGrabberPointerEnd}
            />
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label={t("shared:modal.close")}
            >
              <FiX />
            </button>
          </>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

interface SideSheetProps {
  title: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Wide bottom sheet for a settings surface with several grouped sub-sections
 * (too long/structured for a centered <Modal>). Reuses <Modal>'s
 * focus-trap/scroll-lock/Escape/body-portal mechanics via useDismiss.
 */
export function SideSheet({
  title,
  onClose,
  footer,
  className,
  children,
}: SideSheetProps) {
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const scrimProps = useScrimDismiss(onClose);
  const titleId = useId();
  return createPortal(
    <div className={styles.sideScrim} role="presentation" {...scrimProps}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={[styles.sideSheet, className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.sideSheetHead}>
          <h2 id={titleId} className={styles.sideSheetTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.modalX}
            onClick={onClose}
            aria-label={t("shared:modal.close")}
          >
            <FiX />
          </button>
        </div>
        <div className={styles.sideSheetBody}>{children}</div>
        {footer && <div className={styles.modalFoot}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
