import { type ReactNode } from "react";
import { FiCheck, FiClock, FiFile } from "react-icons/fi";
import { Button, ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ApplicationModals.module.css";

// Consolidated into the shared UI layer — re-exported here so existing
// `./ModalKit` consumers keep their imports unchanged. The submit-flow hook
// (`useSubmitFlow`) lives in `./modalFlow`.
export { Sending } from "../../shared/components/ui";

/** Small file glyph used in attachment rows. */
export function FileIcon() {
  return <FiFile className={styles.attachIcon} size={16} aria-hidden />;
}

/**
 * Thin wrapper over the shared <ModalSheet> so economy submit/detail modals all
 * share one bottom-sheet chrome: grabber + drag-to-dismiss, scroll-lock, focus
 * trap, Escape, and — unlike the old hand-rolled shell — the shared modal-stack
 * (so a dialog opened from inside another only closes the topmost on Escape).
 * ModalSheet renders its own close button (aria-label "shared:modal.close"), so
 * this wrapper adds none. Kept as a named export with the original prop API
 * (now additively including `className`) so existing consumers import it
 * unchanged.
 */
export function ModalShell({
  onClose,
  success,
  wide,
  ariaLabel,
  className,
  children,
}: {
  onClose: () => void;
  success?: boolean;
  wide?: boolean;
  /** Accessible name for the dialog (the visible title lives in children). */
  ariaLabel?: string;
  /** Extra class merged onto the sheet element — e.g. NoteModal's plum surface. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <ModalSheet
      onClose={onClose}
      success={success}
      wide={wide}
      ariaLabel={ariaLabel}
      className={className}
    >
      {children}
    </ModalSheet>
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

/**
 * The two accepted title shapes, deliberately mutually exclusive so a title
 * that already carries its own emphasis can never also receive an `em`.
 *
 * - **Split**: `title` is plain text and `em` is the coral italic tail. The
 *   panel joins them with a single space: `{title} <em>{em}</em>`. Only use
 *   this when the catalog holds the two halves as separate plain-text keys.
 * - **Whole**: `title` is a node that already renders its own `<em>`, e.g.
 *   `<Translation i18nKey="…" components={{ em: <em /> }} />` over a catalog
 *   value like `"Your request is <em>in.</em>"`. Pass no `em` at all.
 *
 * Passing both would print the emphasised word twice (`"…is in in"`), which is
 * why the type refuses it rather than leaving it to review.
 */
type SuccessPanelTitleProps =
  { title: string; em: string } | { title: ReactNode; em?: never };

type SuccessPanelProps = SuccessPanelTitleProps & {
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  /** Optional extra content below the primary action — e.g. an undo affordance. */
  footer?: ReactNode;
};

/** Plum-panel confirmation shown after a flow completes. */
export function SuccessPanel({
  title,
  em,
  children,
  onClose,
  closeLabel,
  footer,
}: SuccessPanelProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiCheck size={26} color="var(--jade)" aria-hidden />
      </div>
      <h2>
        {em ? (
          <>
            {title} <em>{em}</em>
          </>
        ) : (
          title
        )}
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
