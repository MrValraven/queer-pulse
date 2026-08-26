import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { AdminChip } from "./ui";
import { AdminWaitingChip } from "./AdminSubmissionQueue";
import { ADMIN_SUBMISSION_STATUS_TONE } from "./adminSubmissionMeta";
import { AdminIntakePayload } from "./AdminIntakePayload";
import { intakeKindLabel, payloadContact } from "./adminIntakeLabels";
import {
  CONFIDENTIAL_INTAKE_KIND,
  type AdminIntakeDTO,
} from "./api/adminIntakes.api";
import styles from "./AdminSubmissionList.module.css";

/** Day-precision date, the same shape every other admin queue prints. */
function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Who sent it and how a human could reach them. A signed-in member resolves to
 *  their profile; an anonymous submission carries whatever the form asked for. */
function IntakeContact({ intake }: { intake: AdminIntakeDTO }) {
  const { t } = useTranslation();
  if (intake.submitter) {
    return (
      <div className={styles.rowMeta}>
        {t("admin:adminIntakes.row.fromMember")}{" "}
        <Link to={`${routes.members}/${intake.submitter.slug}`}>
          {intake.submitter.name}
        </Link>
      </div>
    );
  }
  const contact = payloadContact(intake.payload);
  if (contact.email) {
    return (
      <div className={styles.rowMeta}>
        {t("admin:adminIntakes.row.contactEmail", { email: contact.email })}
      </div>
    );
  }
  if (contact.name) {
    return (
      <div className={styles.rowMeta}>
        {t("admin:adminIntakes.row.contactName", { name: contact.name })}
      </div>
    );
  }
  return (
    <div className={styles.rowMeta}>
      {t("admin:adminIntakes.row.noContact")}
    </div>
  );
}

/** When it was triaged and by whom. Rows triaged before this console shipped
 *  carry no reviewer, and say so rather than naming somebody. */
function IntakeReviewLine({ intake }: { intake: AdminIntakeDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (!intake.reviewedAt) return null;
  const date = shortDate(fmt, intake.reviewedAt);
  return (
    <div className={styles.rowDates}>
      {intake.reviewedBy
        ? t("admin:adminIntakes.row.reviewedBy", {
            date,
            name: intake.reviewedBy.name,
          })
        : t("admin:adminIntakes.row.reviewedNoOne", { date })}
    </div>
  );
}

/**
 * One row of the intake console.
 *
 * Governance concerns are the exception the whole console is shaped around:
 * they are confidential and have their own richer worklist on `/admin/concerns`,
 * so the row here counts one as waiting and links across without reprinting a
 * word of what was reported. Every other kind shows its payload and gets the
 * plain "mark reviewed" flip.
 */
export function AdminIntakeRow({
  intake,
  onMarkReviewed,
  pending,
}: {
  intake: AdminIntakeDTO;
  onMarkReviewed: () => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isConfidential = intake.kind === CONFIDENTIAL_INTAKE_KIND;
  const isWaiting = intake.status === "new";

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>
            {intakeKindLabel(t, intake.kind)}
          </span>
          <AdminChip
            tone={ADMIN_SUBMISSION_STATUS_TONE[intake.status] ?? "plum"}
            dot
          >
            {t(`admin:adminIntakes.status.${intake.status}`)}
          </AdminChip>
          {isWaiting && <AdminWaitingChip since={intake.createdAt} />}
        </div>

        {isConfidential ? (
          <p className={styles.rowNote}>
            {t("admin:adminIntakes.confidential.body")}
          </p>
        ) : (
          <>
            <IntakeContact intake={intake} />
            <AdminIntakePayload kind={intake.kind} payload={intake.payload} />
          </>
        )}

        <div className={styles.rowDates}>
          {t("admin:adminIntakes.row.arrived", {
            date: shortDate(fmt, intake.createdAt),
          })}
        </div>
        <IntakeReviewLine intake={intake} />
      </div>

      <div className={styles.rowActions}>
        <div className={styles.rowActionButtons}>
          {isConfidential ? (
            <Link className={styles.rowCrossLink} to={routes.adminConcerns}>
              {t("admin:adminIntakes.confidential.openCta")}
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={pending || !isWaiting}
              onClick={onMarkReviewed}
            >
              {t("admin:adminIntakes.action.reviewed")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
