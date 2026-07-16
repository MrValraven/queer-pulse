import type { ReactNode } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GatheringModals.module.css";

export function GatheringSuccessPanel({
  title,
  sub,
  meta,
  onClose,
  closeLabel,
}: {
  title: ReactNode;
  sub: ReactNode;
  meta?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("gatherings:successPanel.ariaLabel")}
      className={styles.successPanel}
    >
      <button
        type="button"
        className={styles.successClose}
        onClick={onClose}
        aria-label={t("gatherings:successPanel.closeAriaLabel")}
      >
        <FiX />
      </button>
      <div className={styles.successIcon}>
        <FiCheck />
      </div>
      <div className={styles.successTitle}>{title}</div>
      <p className={styles.successSub}>{sub}</p>
      {meta && <div className={styles.successMeta}>{meta}</div>}
      <div className={styles.actions}>
        <Button variant="ghost-dark" onClick={onClose}>
          {closeLabel ?? t("gatherings:successPanel.defaultCloseLabel")}
        </Button>
      </div>
    </div>
  );
}
