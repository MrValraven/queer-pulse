import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ReportedGroupSnapshot } from "./adminModeration.data";
import styles from "./AdminReportEvidence.module.css";

/**
 * PRD-356: the reported group as the server snapshotted it when the report
 * was filed (`GroupSnapshotEvidence` in queerpulse-backend
 * `reports/report-evidence.ts`). Split out of `AdminReportEvidence.tsx` (which
 * is already over the line budget) into its own colocated component; it
 * reuses that file's module for the same section rhythm the message evidence
 * block uses.
 *
 * The group's owner is already shown as the report's content author above
 * the evidence blocks (the subject resolver seats the current owner there),
 * so this block does not repeat it.
 */
export function ReportedGroupEvidence({
  group,
}: {
  group: ReportedGroupSnapshot;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const capturedMoment = new Date(group.capturedAt);
  const capturedLabel = `${format.date(capturedMoment)} ${format.time(capturedMoment)}`;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionLabel}>
        {t("admin:moderation.reportDrawer.groupEvidence.title")}
      </h3>

      <p className={styles.evidenceQuote}>{group.title}</p>

      {group.description && (
        <p className={styles.contextBody}>{group.description}</p>
      )}

      <dl className={styles.evidenceFacts}>
        <div className={styles.evidenceFact}>
          <dt>
            {t("admin:moderation.reportDrawer.groupEvidence.memberCountLabel")}
          </dt>
          <dd>{group.memberCount}</dd>
        </div>
        <div className={styles.evidenceFact}>
          <dt>
            {t("admin:moderation.reportDrawer.groupEvidence.capturedLabel")}
          </dt>
          <dd>{capturedLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
