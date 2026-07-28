import { FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal, AdminChip, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import type { AuditEntry } from "./adminGovernance.data";
import styles from "./AdminGovernancePage.module.css";

export function AdminGovernanceAuditModal({
  entry,
  onClose,
}: {
  entry: AuditEntry;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminModal
      eyebrow={t("admin:governance.audit.entryModal.eyebrow")}
      title={entry.action}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" to={entry.link.to} onClick={onClose}>
            {t("admin:governance.audit.entryModal.openLinkCta", {
              label: entry.link.label,
            })}{" "}
            →
          </Button>
          <Button variant="primary" onClick={onClose}>
            {t("admin:common.close")}
          </Button>
        </>
      }
    >
      <div className={styles.entryMod}>
        <AdminAvatar
          initials={entry.moderatorInitials}
          tone={entry.moderatorTone}
          size="md"
          src={portrait(entry.moderatorName)}
        />
        <div className={styles.entryModTx}>
          <span className={styles.entryModName}>{entry.moderatorName}</span>
          <span className={styles.entryModWhen}>
            {t("admin:governance.audit.entryModal.actedWhen", {
              when: entry.when,
            })}
          </span>
        </div>
        <AdminChip tone={entry.actionTone}>{entry.action}</AdminChip>
      </div>

      <dl className={styles.entryDl}>
        <dt className={styles.entryDt}>
          {t("admin:governance.audit.entryModal.subject")}
        </dt>
        <dd className={styles.entryDd}>{entry.subject}</dd>

        <dt className={styles.entryDt}>
          {t("admin:governance.audit.entryModal.reasonGiven")}
        </dt>
        <dd>
          <blockquote className={styles.entryQuote}>{entry.reason}</blockquote>
        </dd>
      </dl>

      <p className={styles.entryNote}>
        <FiShield className={styles.entryNoteIco} aria-hidden />
        {t("admin:governance.audit.entryModal.note")}
      </p>
    </AdminModal>
  );
}
