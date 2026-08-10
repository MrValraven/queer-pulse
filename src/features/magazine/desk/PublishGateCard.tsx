import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PublishGateItemDto } from "../api/pieces.api";
import styles from "./pieceTabs.module.css";

export interface PublishGateCardProps {
  publishGate: PublishGateItemDto[];
  onPublish: () => void;
}

/**
 * The publish gate: every consent and sensitivity-read blocker that must be
 * resolved before a piece can go out. Lives in the piece record's `.erail`
 * sidebar. The Publish action stays disabled while anything below is open —
 * this is a hard gate, not a reminder.
 */
export function PublishGateCard({ publishGate, onPublish }: PublishGateCardProps) {
  const { t } = useTranslation();
  const hasOpenItems = publishGate.some((item) => !item.done);

  return (
    <div className={styles.card}>
      <h3>{t("magazine:piece.gate.heading")}</h3>
      <div className={styles.stack}>
        {publishGate.map((item) => (
          <div key={item.label} className={cx(styles.gaterow, !item.done && styles.open)}>
            {item.done ? (
              <FiCheck className={styles.doneIcon} aria-hidden />
            ) : (
              <FiX className={styles.openIcon} aria-hidden />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <p className={styles.tiny}>{t("magazine:piece.gate.notAdvisory")}</p>
      <Button variant="plum" onClick={onPublish} disabled={hasOpenItems}>
        {t("magazine:piece.gate.publish")}
      </Button>
    </div>
  );
}
