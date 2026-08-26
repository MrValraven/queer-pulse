import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiMessageCircle,
  FiRotateCcw,
  FiSearch,
  FiWifiOff,
} from "react-icons/fi";
import { Button, CopyLinkRow } from "../../shared/components/ui";
import { inviteLink, routes } from "../../app/routeMap";
import { inviteFullUrlFor } from "../../shared/lib/inviteUrl";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { applicantDeclineReasonKey } from "./api/joinRequestDeclineReason";
import { Under18Notice } from "./Under18Notice";
import styles from "./JoinRequestStatus.module.css";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between `iso` and now, floored at 0. Null for an unparseable
 *  timestamp, so a bad value drops the phrase instead of printing "NaN days". */
function wholeDaysSince(iso: string): number | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / DAY_MS));
}

/**
 * A localized day label, or null when there is no usable timestamp. Every date
 * on this page goes through `useFormat()`; an ISO string must never reach the
 * screen, and neither must "Invalid Date", so an unparseable value falls back
 * to the state's own no-date copy.
 */
function useDayLabel(): (iso: string | null) => string | null {
  const fmt = useFormat();
  return (iso) => {
    if (!iso) return null;
    const value = new Date(iso);
    return Number.isNaN(value.getTime()) ? null : fmt.date(value);
  };
}

/** One frame for every state: icon tile, eyebrow, serif heading, lead, body,
 *  actions and a foot line. Keeps six screens visually identical apart from
 *  the words, which is the whole point of a page people arrive at anxious. */
function StatusState({
  icon,
  tone = "accent",
  eyebrow,
  title,
  lead,
  children,
  actions,
  foot,
}: {
  icon: ReactNode;
  tone?: "accent" | "jade" | "quiet";
  eyebrow: string;
  /** Rendered as the page's `<h1>`; carries the coral `<em>` idiom. */
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  foot?: ReactNode;
}) {
  const toneClass =
    tone === "jade"
      ? styles.iconJade
      : tone === "quiet"
        ? styles.iconQuiet
        : undefined;
  return (
    <div className={styles.state}>
      <div className={[styles.icon, toneClass].filter(Boolean).join(" ")}>
        {icon}
      </div>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children}
      {actions && <div className={styles.actions}>{actions}</div>}
      {foot && <div className={styles.foot}>{foot}</div>}
    </div>
  );
}

/** "Get in touch" — every state offers one, so nobody is ever left with only
 *  a back button. */
function ContactLink() {
  const { t } = useTranslation();
  return (
    <Link to={routes.contact}>{t("auth:joinRequestStatus.contactCta")}</Link>
  );
}

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

/** Approved, with an invite that still works. The win. */
export function ApprovedState({
  inviteCode,
  decidedAt,
}: {
  inviteCode: string;
  decidedAt: string | null;
}) {
  const { t } = useTranslation();
  const decidedLabel = useDayLabel()(decidedAt);
  return (
    <StatusState
      icon={<FiCheckCircle aria-hidden />}
      tone="jade"
      eyebrow={t("auth:joinRequestStatus.approved.eyebrow")}
      title={
        <Translation
          i18nKey="auth:joinRequestStatus.approved.title"
          components={{ em: <em /> }}
        />
      }
      lead={
        decidedLabel
          ? t("auth:joinRequestStatus.approved.lead", { date: decidedLabel })
          : t("auth:joinRequestStatus.approved.leadNoDate")
      }
      actions={
        <Button to={inviteLink(inviteCode)}>
          {t("auth:joinRequestStatus.approved.cta")}
        </Button>
      }
      foot={
        <Translation
          i18nKey="auth:joinRequestStatus.approved.foot"
          components={{ a: <ContactLink /> }}
        />
      }
    >
      <div className={styles.invite}>
        <p className={styles.inviteLabel}>
          {t("auth:joinRequestStatus.approved.linkLabel")}
        </p>
        {/* The one place invite links are built — never assembled by hand. */}
        <CopyLinkRow
          tone="paper"
          value={inviteFullUrlFor(inviteCode)}
          fieldLabel={t("auth:joinRequestStatus.approved.linkLabel")}
          copyLabel={t("auth:joinRequestStatus.approved.copy")}
          copiedLabel={t("auth:joinRequestStatus.approved.copied")}
          copiedToast={t("auth:joinRequestStatus.approved.copiedToast")}
          errorToast={t("auth:joinRequestStatus.approved.copyErrorToast")}
        />
      </div>
      <p className={styles.note}>{t("auth:joinRequestStatus.approved.note")}</p>
    </StatusState>
  );
}

/**
 * Approved, but the invite behind it is gone — used, revoked or expired. A real
 * state with its own recovery path, never collapsed into the live approval.
 */
export function ApprovedInviteSpentState({
  decidedAt,
}: {
  decidedAt: string | null;
}) {
  const { t } = useTranslation();
  const decidedLabel = useDayLabel()(decidedAt);
  return (
    <StatusState
      icon={<FiRotateCcw aria-hidden />}
      eyebrow={t("auth:joinRequestStatus.approvedSpent.eyebrow")}
      title={
        <Translation
          i18nKey="auth:joinRequestStatus.approvedSpent.title"
          components={{ em: <em /> }}
        />
      }
      lead={
        decidedLabel
          ? t("auth:joinRequestStatus.approvedSpent.lead", {
              date: decidedLabel,
            })
          : t("auth:joinRequestStatus.approvedSpent.leadNoDate")
      }
      actions={
        <>
          <Button to={routes.contact}>
            {t("auth:joinRequestStatus.approvedSpent.cta")}
          </Button>
          <Button variant="ghost" to={routes.signIn}>
            {t("auth:joinRequestStatus.approvedSpent.signInCta")}
          </Button>
        </>
      }
      foot={t("auth:joinRequestStatus.approvedSpent.foot")}
    />
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
