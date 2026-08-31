import { FiClock, FiMessageCircle, FiSearch, FiWifiOff } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { applicantDeclineReasonKey } from "./api/joinRequestDeclineReason";
import { ContactLink, StatusState } from "./JoinRequestStatusFrame";
import { useDayLabel, wholeDaysSince } from "./joinRequestStatusFormat";
import { Under18Notice } from "./Under18Notice";
import styles from "./JoinRequestStatus.module.css";

/** Still with a reviewer. No promised date, because we do not have one. */
export function UnderReviewState({ submittedAt }: { submittedAt: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const dayLabel = useDayLabel();
  const submittedLabel = dayLabel(submittedAt);
  const days = wholeDaysSince(submittedAt);
  const lead =
    submittedLabel === null
      ? t("auth:joinRequestStatus.underReview.leadNoDate")
      : days === null
        ? t("auth:joinRequestStatus.underReview.leadDateOnly", {
            date: submittedLabel,
          })
        : t("auth:joinRequestStatus.underReview.lead", {
            ago: fmt.relativeTime(-days, "day"),
            date: submittedLabel,
          });
  return (
    <StatusState
      icon={<FiClock aria-hidden />}
      eyebrow={t("auth:joinRequestStatus.underReview.eyebrow")}
      title={
        <Translation
          i18nKey="auth:joinRequestStatus.underReview.title"
          components={{ em: <em /> }}
        />
      }
      lead={lead}
      actions={
        <Button variant="ghost" to={routes.homepage}>
          {t("auth:joinRequestStatus.backHome")}
        </Button>
      }
      foot={
        <Translation
          i18nKey="auth:joinRequestStatus.underReview.foot"
          components={{ a: <ContactLink /> }}
        />
      }
    >
      <p className={styles.note}>
        {t("auth:joinRequestStatus.underReview.note")}
      </p>
    </StatusState>
  );
}

/**
 * Declined. The page that most needs care: it says what happened, keeps the
 * reason on the platform's side of the table wherever that is honest, and
 * always leaves a person to talk to.
 *
 * `underage` never reaches the reason catalogue — it renders the platform's
 * existing supportive 18+ notice instead, so a young person meets an open door
 * with a date on it rather than a rejection.
 */
export function DeclinedState({
  declineReason,
  decidedAt,
}: {
  declineReason: string | null;
  decidedAt: string | null;
}) {
  const { t } = useTranslation();
  const decidedLabel = useDayLabel()(decidedAt);
  const isUnderage = declineReason === "underage";
  const leadKey = isUnderage
    ? decidedLabel
      ? "auth:joinRequestStatus.declined.leadUnderage"
      : "auth:joinRequestStatus.declined.leadUnderageNoDate"
    : decidedLabel
      ? "auth:joinRequestStatus.declined.lead"
      : "auth:joinRequestStatus.declined.leadNoDate";
  return (
    <StatusState
      icon={<FiMessageCircle aria-hidden />}
      tone="quiet"
      eyebrow={t("auth:joinRequestStatus.declined.eyebrow")}
      title={
        <Translation
          i18nKey={
            isUnderage
              ? "auth:joinRequestStatus.declined.titleUnderage"
              : "auth:joinRequestStatus.declined.title"
          }
          components={{ em: <em /> }}
        />
      }
      lead={t(leadKey, decidedLabel ? { date: decidedLabel } : undefined)}
      actions={
        // The under-18 notice carries its own links (resources, the coming-out
        // guide, and "talk to us"), so this state needs only the way out. Every
        // other decline gets a person to write to, first.
        isUnderage ? (
          <Button variant="ghost" to={routes.homepage}>
            {t("auth:joinRequestStatus.backHome")}
          </Button>
        ) : (
          <>
            <Button to={routes.contact}>
              {t("auth:joinRequestStatus.declined.contactCta")}
            </Button>
            <Button variant="ghost" to={routes.homepage}>
              {t("auth:joinRequestStatus.backHome")}
            </Button>
          </>
        )
      }
    >
      {isUnderage ? (
        <Under18Notice shouldShowContactLink />
      ) : (
        <div className={styles.reason}>
          <p className={styles.reasonTitle}>
            {t("auth:joinRequestStatus.declined.reasonTitle")}
          </p>
          <p className={styles.reasonBody}>
            {t(applicantDeclineReasonKey(declineReason))}
          </p>
        </div>
      )}
    </StatusState>
  );
}

/**
 * The single answer to both a `400` (malformed code) and a `404` (no such
 * request). One message for both, so nobody probing codes learns whether any
 * given one exists.
 */
export function CodeNotFoundState({ onTryAgain }: { onTryAgain: () => void }) {
  const { t } = useTranslation();
  return (
    <StatusState
      icon={<FiSearch aria-hidden />}
      tone="quiet"
      eyebrow={t("auth:joinRequestStatus.notFound.eyebrow")}
      title={
        <Translation
          i18nKey="auth:joinRequestStatus.notFound.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("auth:joinRequestStatus.notFound.lead")}
      actions={
        <>
          <Button onClick={onTryAgain}>
            {t("auth:joinRequestStatus.notFound.retryCta")}
          </Button>
          <Button variant="ghost" to={routes.contact}>
            {t("auth:joinRequestStatus.contactCta")}
          </Button>
        </>
      }
    />
  );
}

/** The server did not answer. Distinct from "we could not find that": nothing
 *  is known about the request either way, and retrying is worth doing. */
export function StatusUnavailableState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <StatusState
      icon={<FiWifiOff aria-hidden />}
      tone="quiet"
      eyebrow={t("auth:joinRequestStatus.unavailable.eyebrow")}
      title={
        <Translation
          i18nKey="auth:joinRequestStatus.unavailable.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("auth:joinRequestStatus.unavailable.lead")}
      actions={
        <>
          <Button onClick={onRetry}>
            {t("auth:joinRequestStatus.unavailable.retryCta")}
          </Button>
          <Button variant="ghost" to={routes.homepage}>
            {t("auth:joinRequestStatus.backHome")}
          </Button>
        </>
      }
      foot={
        <Translation
          i18nKey="auth:joinRequestStatus.unavailable.foot"
          components={{ a: <ContactLink /> }}
        />
      }
    />
  );
}
