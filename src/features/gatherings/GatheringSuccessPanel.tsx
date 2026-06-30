import type { ReactNode } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import styles from "./GatheringModals.module.css";

export function GatheringSuccessPanel({
  title,
  sub,
  meta,
  onClose,
  closeLabel = "Done",
}: {
  title: ReactNode;
  sub: ReactNode;
  meta?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  return (
    <div className={styles.successPanel}>
      <button
        type="button"
        className={styles.successClose}
        onClick={onClose}
        aria-label="Close"
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
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
