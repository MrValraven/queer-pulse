import { Link } from "react-router-dom";
import { FiInfo } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { communityPath } from "../../app/routeMap";
import { AdminBanEvasionFlag } from "./AdminBanEvasionFlag";
import {
  AdminChip,
  AdminEmptyState,
  AdminNotice,
  AdminPanel,
  AdminRowActions,
} from "./ui";
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

  const subjectTitle =
    escalation.subject && subjectName ? (
      <Link
        to={`/members/${escalation.subject.slug}`}
        className={styles.subjectLink}
      >
        {subjectName}
      </Link>
    ) : (
      t("admin:banEvasionEscalations.subjectErased")
    );

  return (
    <AdminPanel
      title={subjectTitle}
      description={
        <>
          <span className={styles.headLine}>
            {t("admin:banEvasionEscalations.raisedBy", {
              name: raisedByName,
              date: raisedOn,
            })}
          </span>
          <span className={styles.headLine}>
            <Link
              to={communityPath(escalation.communitySlug)}
              className={styles.subjectLink}
            >
              {escalation.communityName}
            </Link>
          </span>
        </>
      }
      actions={
        <AdminChip tone={isOpen ? "amber" : "jade"} dot>
          {t(`admin:banEvasionEscalations.status.${escalation.status}`)}
        </AdminChip>
      }
      bodyClassName={styles.cardBody}
    >
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
      ) : (
        <div className={styles.assessmentState}>
          {escalation.assessment === null ? (
            <AdminEmptyState
              size="inline"
              icon={FiInfo}
              title={t("admin:banEvasionEscalations.assessmentUnavailable")}
            />
          ) : (
            <AdminNotice tone="success">
              {t("admin:banEvasionEscalations.assessmentClear")}
            </AdminNotice>
          )}
        </div>
      )}

      {isOpen ? (
        <AdminRowActions className={styles.cardActions}>
          <Button variant="primary" size="sm" onClick={onResolve}>
            {t("admin:banEvasionEscalations.action.resolve")}
          </Button>
        </AdminRowActions>
      ) : (
        <AdminBanEvasionEscalationOutcome escalation={escalation} />
      )}
    </AdminPanel>
  );
}
