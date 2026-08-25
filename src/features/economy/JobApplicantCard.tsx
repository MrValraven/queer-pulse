import { Link } from "react-router-dom";
import { FiCheck, FiEye, FiX } from "react-icons/fi";
import {
  Avatar,
  Badge,
  Button,
  type BadgeTone,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { ApplicationStatus, JobApplicationDecision } from "./api/jobs.api";
import type { JobApplicantRow } from "./jobApplications.data";
import styles from "./JobApplicationsPage.module.css";

const STATUS_TONE: Record<ApplicationStatus, BadgeTone> = {
  submitted: "amber",
  reviewing: "violet",
  accepted: "jade",
  declined: "ghost",
};

const STATUS_LABEL_KEY: Record<ApplicationStatus, string> = {
  submitted: "economy:jobApplications.status.submitted",
  reviewing: "economy:jobApplications.status.reviewing",
  accepted: "economy:jobApplications.status.accepted",
  declined: "economy:jobApplications.status.declined",
};

/**
 * One application, poster-side: who applied, when, what they wrote, and where
 * the application stands.
 *
 * The decision buttons mirror the backend's own one-way rule. `reviewing` can
 * only be reached from `submitted`, accept and decline are final, and a decided
 * application offers nothing further. If the server disagrees anyway (a second
 * tab decided it first) the 409 comes back as this card's `error` line rather
 * than a silent no-op.
 */
export function JobApplicantCard({
  application,
  isBusy,
  error,
  onDecide,
}: {
  application: JobApplicantRow;
  isBusy: boolean;
  /** Per-row failure text, already resolved for the reader's language. */
  error: string | null;
  onDecide: (status: JobApplicationDecision) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isDecided =
    application.status === "accepted" || application.status === "declined";
  const canStartReview = application.status === "submitted";

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <Avatar
          initials={application.initials}
          tint={application.tint}
          src={application.avatarUrl ?? undefined}
          size={44}
        />
        <div className={styles.cardWho}>
          <h3 className={styles.cardName}>
            {application.profileSlug ? (
              <Link to={`${routes.members}/${application.profileSlug}`}>
                {application.name}
              </Link>
            ) : (
              t("economy:jobApplications.applicantRemoved")
            )}
          </h3>
          <p className={styles.cardWhen}>
            {t("economy:jobApplications.appliedOn", {
              date: fmt.date(new Date(application.appliedAt), {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            })}
          </p>
        </div>
        <Badge tone={STATUS_TONE[application.status]}>
          {t(STATUS_LABEL_KEY[application.status])}
        </Badge>
      </div>

      {application.coverNote && (
        <p className={styles.cardNote}>{application.coverNote}</p>
      )}

      {application.answers.length > 0 && (
        <dl className={styles.answers}>
          {application.answers.map((entry) => (
            <div className={styles.answer} key={entry.question}>
              <dt className={styles.answerQuestion}>{entry.question}</dt>
              <dd className={styles.answerText}>{entry.answer}</dd>
            </div>
          ))}
        </dl>
      )}

      {error && (
        <p className={styles.cardError} role="alert">
          {error}
        </p>
      )}

      {isDecided ? (
        <p className={styles.cardFinal}>
          {t("economy:jobApplications.decisionFinal")}
        </p>
      ) : (
        <div className={styles.cardActions}>
          {canStartReview && (
            <Button
              variant="ghost"
              size="md"
              disabled={isBusy}
              onClick={() => onDecide("reviewing")}
            >
              <FiEye aria-hidden />
              {t("economy:jobApplications.action.startReview")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="md"
            className={styles.declineBtn}
            disabled={isBusy}
            onClick={() => onDecide("declined")}
          >
            <FiX aria-hidden />
            {t("economy:jobApplications.action.decline")}
          </Button>
          <Button
            variant="jade"
            size="md"
            disabled={isBusy}
            onClick={() => onDecide("accepted")}
          >
            <FiCheck aria-hidden />
            {t("economy:jobApplications.action.accept")}
          </Button>
        </div>
      )}
    </article>
  );
}
