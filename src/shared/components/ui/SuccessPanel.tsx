import { type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "./Button";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./SuccessPanel.module.css";

interface SuccessPanelProps {
  /** Title text; `em` is appended in coral italic per the design-system pattern. */
  title: string;
  em?: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: ReactNode;
  /** Optional checklist of next steps, each rendered with a jade tick. */
  steps?: ReactNode[];
  /** Optional content below the primary action — e.g. an undo affordance. */
  footer?: ReactNode;
  /** Override the default jade check glyph. */
  icon?: ReactNode;
}

/**
 * Plum-panel confirmation shown after a flow completes: jade tick, serif title
 * with a coral `<em>`, body copy, optional next-steps checklist, and a
 * `ghost-dark` close action. Consolidates the per-feature SuccessPanel copies.
 */
export function SuccessPanel({
  title,
  em,
  children,
  onClose,
  closeLabel,
  steps,
  footer,
  icon,
}: SuccessPanelProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.panel}>
      <div className={styles.icon}>
        {icon ?? <FiCheck size={26} color="var(--jade)" aria-hidden />}
      </div>
      <h2 className={styles.title}>
        {title} {em && <em>{em}</em>}
      </h2>
      <p className={styles.body}>{children}</p>
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
      <div className={styles.actions}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {closeLabel ?? t("shared:successPanel.done")}
        </Button>
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
