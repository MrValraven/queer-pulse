import { FiCheck } from "react-icons/fi";
import { Button, ModalSheet } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ReportReplyModal.module.css";

interface ReportReplyConfirmPanelProps {
  /** The modal's own title, reused as the sheet's accessible name. */
  ariaLabel: string;
  /** The reported author's first name (or the inactive member's label). */
  firstName: string;
  onClose: () => void;
}

/** The plum-panel confirmation `ReportReplyModal` shows once a report lands. */
export function ReportReplyConfirmPanel({
  ariaLabel,
  firstName,
  onClose,
}: ReportReplyConfirmPanelProps) {
  const { t } = useTranslation();
  return (
    <ModalSheet onClose={onClose} success ariaLabel={ariaLabel}>
      <div className={styles.confirm}>
        <span className={styles.confirmIcon} aria-hidden>
          <FiCheck />
        </span>
        <h2 className={styles.confirmTitle}>
          <Translation
            i18nKey="forum:reportReply.confirmTitle"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.confirmBody}>
          {t("forum:reportReply.confirmBody", { name: firstName })}
        </p>
        <div className={styles.confirmActions}>
          <Button variant="ghost-dark" onClick={onClose}>
            {t("forum:reportReply.done")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
