import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip, AdminCat } from "./ui";
import {
  SEVERITY,
  chipKey,
  chipLabel,
  type ModReport,
} from "./adminModeration.data";
import styles from "./AdminModerationPage.module.css";

/** The report drawer's head: severity category, chips, title, and (when the
 *  caller passed either handler) the assignment line with its claim/release
 *  CTA. */
export function AdminReportDrawerHead({
  report,
  currentUserId,
  onAssignToMe,
  onUnassign,
}: {
  report: ModReport;
  /** The signed-in moderator's id, for "is this assigned to ME" (COM-5). */
  currentUserId?: string;
  onAssignToMe?: (report: ModReport) => void;
  onUnassign?: (report: ModReport) => void;
}) {
  const { t } = useTranslation();
  const sev = SEVERITY[report.severity];

  return (
    <>
      <div className={styles.dHeadChips}>
        <AdminCat tone={sev.category}>{t(sev.labelKey)}</AdminCat>
        {report.chips.map((chip) => (
          <AdminChip key={chipKey(chip)} tone={chip.tone}>
            {chipLabel(chip, t)}
          </AdminChip>
        ))}
      </div>
      <h2 className={styles.dTitle}>
        {t("admin:moderation.reportDrawer.title")}
      </h2>
      {(onAssignToMe || onUnassign) && (
        <div className={styles.dAssignment}>
          <span>
            {report.assignedModeratorId
              ? report.assignedModeratorId === currentUserId
                ? t("admin:moderation.reportDrawer.assignedToYou")
                : t("admin:moderation.reportDrawer.assignedTo", {
                    name:
                      report.assignedModeratorName ??
                      t("admin:moderation.reportDrawer.anotherModerator"),
                  })
              : t("admin:moderation.reportDrawer.unassigned")}
          </span>
          {report.assignedModeratorId === currentUserId && onUnassign ? (
            <button
              type="button"
              className={styles.dAssignmentCta}
              onClick={() => onUnassign(report)}
            >
              {t("admin:moderation.reportDrawer.unassignCta")}
            </button>
          ) : !report.assignedModeratorId && onAssignToMe ? (
            <button
              type="button"
              className={styles.dAssignmentCta}
              onClick={() => onAssignToMe(report)}
            >
              {t("admin:moderation.reportDrawer.assignToMeCta")}
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
