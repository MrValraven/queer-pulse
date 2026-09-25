import { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDismiss } from "../../../shared/components/ui";
import styles from "./adminUi.module.css";

/**
 * Centered modal dialog, named by its title. Mount it only while open (the
 * parent renders it conditionally) so the dialog behaviour in `useDismiss`
 * runs once per open: scroll lock, Escape while topmost on the shared modal
 * stack, initial focus on the first control inside (the close button), a Tab
 * trap, and focus restore to whatever opened it.
 */
export function AdminModal({
  eyebrow,
  title,
  onClose,
  footer,
  wide = false,
  isFullSize = false,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  wide?: boolean;
  /** Near full-viewport dialog whose body stretches its content to the footer. */
  isFullSize?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  // The shared dialog behaviour, the same hook AdminDrawer and the shared
  // `Modal` use. It still registers on the modal stack, so a confirm opened
  // from inside an AdminDrawer closes alone on one Escape press.
  const dialogRef = useDismiss(onClose);
  const titleId = useId();

  // Portal to <body> so the fixed scrim is anchored to the viewport itself.
  // A `transform`, `filter`, `contain: paint`
  // or `content-visibility: auto` on any ancestor establishes a containing
  // block that would confine this `position: fixed` scrim to that ancestor's
  // box instead of the viewport. Rendering through <body> escapes all of them.
  // React events still bubble via the React tree, so onClose et al. work
  // unchanged. Mirrors the shared `Modal` in shared/components/ui/Modal.tsx.
  return createPortal(
    <div
      className={styles.modalScrim}
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
          isFullSize && styles.modalFull,
        ]
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
    </div>,
    document.body,
  );
}
