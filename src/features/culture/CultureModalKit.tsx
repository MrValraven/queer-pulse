import { type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CultureModals.module.css";

// Consolidated into the shared UI layer — re-exported here so existing
// `./CultureModalKit` consumers keep their imports unchanged. The hooks
// (`useSubmitFlow`, `useChipSet`) live in `./cultureModalKit.hooks`.
export { Sending } from "../../shared/components/ui";

/**
 * Shared bottom-sheet frame for the culture form/success modals. A thin wrapper
 * over the shared <ModalSheet>, which brings scroll-lock, click-out, Escape via
 * the shared modal stack, a Tab focus-trap and focus-restore (the a11y the
 * hand-rolled shell used to omit). `success` switches to the plum surface;
 * culture's own <SuccessPanel> renders flat inside it.
 */
export function ModalShell({
  onClose,
  success,
  label,
  children,
}: {
  onClose: () => void;
  success?: boolean;
  /** Accessible dialog name announced to screen readers. */
  label?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      onClose={onClose}
      success={success}
      ariaLabel={label ?? t("culture:modal.dialogAriaLabel")}
    >
      {children}
    </ModalSheet>
  );
}

/** Plum-panel confirmation with a jade tick, serif title and optional next steps.
 * Intentionally NOT swapped for the shared <SuccessPanel>: this one renders flat
 * inside the already-plum ModalShell success surface (the shared panel brings its
 * own plum background + padding, which would double up here) and keeps the richer
 * staggered entrance animation, reduced-motion-guarded in CultureModals.module.css. */
export function SuccessPanel({
  title,
  em,
  children,
  steps,
  onClose,
}: {
  title: string;
  em: string;
  children: ReactNode;
  steps?: ReactNode[];
  onClose: () => void;
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
      {steps && steps.length > 0 && (
        <ul className={styles.steps}>
          {steps.map((step, i) => (
            <li key={i} className={styles.step}>
              <FiCheck size={16} aria-hidden />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.successBtn}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {t("culture:modal.done")}
        </Button>
      </div>
    </div>
  );
}
