import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { communityPath } from "../../app/routeMap";
import { AdminBanEvasionFlag } from "./AdminBanEvasionFlag";
import { AdminChip } from "./ui";
import { AdminBanEvasionEscalationOutcome } from "./AdminBanEvasionEscalationOutcome";
import {
  hasRenderableAssessment,
  type BanEvasionEscalationDTO,
} from "./api/adminBanEvasionEscalations.api";
import styles from "./AdminBanEvasionEscalationsPage.module.css";

/**
 * One escalation on the staff console, with the FULL cross-community assessment
 * of the applicant inline.
 *
 * The assessment renders through `AdminBanEvasionFlag`, the same panel the
 * invite review queue uses, so there is one way on the platform to read a
 * ban-evasion assessment and staff never have to learn a second.
 *
 * THREE THINGS THE PANEL ITSELF DOES NOT SAY, and this card does. It renders
 * nothing for a clear applicant, nothing for an assessment with no signals, and
 * nothing for a missing one, all of which are correct on the invite queue where
 * a panel per applicant would be noise. Here they are the answer somebody
 * asked for, so each gets a stated line: checked and clear, or the account has
 * been erased and there is nothing left to correlate.
 */
export function AdminBanEvasionEscalationCard({
  escalation,
  onResolve,
}: {
  escalation: BanEvasionEscalationDTO;
  onResolve: () => void;
}) {
  const { t, language } = useTranslation();
  const raisedOn = formatDate(escalation.createdAt, language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const subjectName = escalation.subject
    ? `${escalation.subject.firstName} ${escalation.subject.lastName}`.trim()
    : null;
  const raisedByName = escalation.raisedBy
    ? `${escalation.raisedBy.firstName} ${escalation.raisedBy.lastName}`.trim()
    : t("admin:banEvasionEscalations.moderatorErased");
  const isOpen = escalation.status === "open";

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadText}>
          <h3 className={styles.subject}>
            {escalation.subject && subjectName ? (
              <Link
                to={`/members/${escalation.subject.slug}`}
                className={styles.subjectLink}
              >
                {subjectName}
              </Link>
            ) : (
              t("admin:banEvasionEscalations.subjectErased")
            )}
          </h3>
          <p className={styles.meta}>
            {t("admin:banEvasionEscalations.raisedBy", {
              name: raisedByName,
              date: raisedOn,
            })}
          </p>
          <p className={styles.meta}>
            <Link
              to={communityPath(escalation.communitySlug)}
              className={styles.subjectLink}
            >
              {escalation.communityName}
            </Link>
          </p>
        </div>
        <div className={styles.chipRow}>
          <AdminChip tone={isOpen ? "amber" : "jade"} dot>
            {t(`admin:banEvasionEscalations.status.${escalation.status}`)}
          </AdminChip>
        </div>
      </div>

      {escalation.note && (
        <div className={styles.section}>
          <p className={styles.sectionTerm}>
            {t("admin:banEvasionEscalations.moderatorNote")}
          </p>
          <p className={styles.sectionBody}>{escalation.note}</p>
        </div>
      )}

      {hasRenderableAssessment(escalation.assessment) ? (
        <AdminBanEvasionFlag
          assessment={escalation.assessment ?? undefined}
          noteKey="admin:banEvasionEscalations.assessmentNote"
        />
      ) : escalation.assessment === null ? (
        <p className={`${styles.assessmentState} ${styles.assessmentUnknown}`}>
          {t("admin:banEvasionEscalations.assessmentUnavailable")}
        </p>
      ) : (
        <p className={styles.assessmentState}>
          {t("admin:banEvasionEscalations.assessmentClear")}
        </p>
      )}

      {isOpen ? (
        <div className={styles.cardActions}>
          <Button variant="primary" size="sm" onClick={onResolve}>
            {t("admin:banEvasionEscalations.action.resolve")}
          </Button>
        </div>
      ) : (
        <AdminBanEvasionEscalationOutcome escalation={escalation} />
      )}
    </article>
  );
}
