import { FiCheckCircle, FiClock, FiRotateCcw } from "react-icons/fi";
import { Button, CopyLinkRow, Sending } from "../../shared/components/ui";
import { inviteLink, routes } from "../../app/routeMap";
import { inviteFullUrlFor } from "../../shared/lib/inviteUrl";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestInviteRefreshRefusal } from "./api/joinRequest.api";
import { ContactLink, StatusState } from "./JoinRequestStatusFrame";
import { useDayLabel, wholeDaysUntil } from "./joinRequestStatusFormat";
import styles from "./JoinRequestStatus.module.css";

/** At or under this many days left, the deadline stops being a footnote and
 *  gets the urgent treatment. Two days is the last point at which "come back
 *  tomorrow" is still a plan that works. */
const URGENT_DAYS_LEFT = 2;

/**
 * When the invite stops working, said plainly, because nothing else will ever
 * say it. QueerPulse sends no email and an applicant has no account, so there
 * is no reminder to come: this line is the entire warning, and the window
 * behind it starts at the applicant's first read of this page rather than at a
 * decision they never saw.
 *
 * Renders nothing without a usable date, rather than a half-sentence.
 */
function InviteDeadline({ expiresAt }: { expiresAt: string | null }) {
  const { t } = useTranslation();
  const dateLabel = useDayLabel()(expiresAt);
  if (!expiresAt || !dateLabel) return null;
  const daysLeft = wholeDaysUntil(expiresAt);
  const isUrgent = daysLeft !== null && daysLeft <= URGENT_DAYS_LEFT;
  return (
    <p
      className={[styles.deadline, isUrgent ? styles.deadlineUrgent : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <FiClock aria-hidden />
      <span>
        {daysLeft === null
          ? t("auth:joinRequestStatus.approved.deadline", { date: dateLabel })
          : daysLeft <= 0
            ? // CLDR puts 0 in `other` ("0 more days"), which is both wrong
              // and the worst possible day to be vague on.
              t("auth:joinRequestStatus.approved.deadlineToday")
            : t("auth:joinRequestStatus.approved.deadlineDays", {
                count: daysLeft,
                date: dateLabel,
              })}
      </span>
    </p>
  );
}

/** Approved, with an invite that still works. The win. */
export function ApprovedState({
  inviteCode,
  decidedAt,
  expiresAt,
}: {
  inviteCode: string;
  decidedAt: string | null;
  /** ISO deadline of the invite, or null when the backend reported none. */
  expiresAt: string | null;
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
        <InviteDeadline expiresAt={expiresAt} />
      </div>
      <p className={styles.note}>{t("auth:joinRequestStatus.approved.note")}</p>
    </StatusState>
  );
}

/** The copy keys for each way an invite can be spent. `expired` is the only
 *  one the applicant can undo, so it is the only one offered a refresh. */
const SPENT_COPY = {
  expired: "expired",
  used: "used",
  revoked: "revoked",
} as const;

/**
 * Approved, but the invite behind it is gone. THREE different situations that
 * used to share one dead-end screen:
 *
 * - `expired`: the window ran out. Recoverable, and by the applicant
 *   themselves: the button below mints a fresh window on the same invite.
 *   This is the state PRD-02 was about, and it is now a loop that closes
 *   rather than the end of the funnel.
 * - `used`: an account already exists on this invite. Nothing to reissue;
 *   the way forward is signing in.
 * - `revoked`: a moderator's deliberate act, which is not the applicant's to
 *   undo. A person to talk to, and no button that pretends otherwise.
 */
export function ApprovedInviteSpentState({
  decidedAt,
  inviteStatus,
  onRefresh,
  isRefreshing,
  refusal,
}: {
  decidedAt: string | null;
  inviteStatus: "used" | "expired" | "revoked" | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  /** The backend's typed reason for turning a refresh down, or null when none
   *  has been refused. Rendered in a live region below the actions. */
  refusal: JoinRequestInviteRefreshRefusal | "unknown" | null;
}) {
  const { t } = useTranslation();
  const decidedLabel = useDayLabel()(decidedAt);
  // An unknown or absent status falls back to the expired copy, which is the
  // most common case and the only one that offers a way forward.
  const variant = SPENT_COPY[inviteStatus ?? "expired"] ?? "expired";
  const prefix = `auth:joinRequestStatus.approvedSpent.${variant}`;
  const isRecoverable = variant === "expired";
  return (
    <StatusState
      icon={<FiRotateCcw aria-hidden />}
      eyebrow={t(`${prefix}.eyebrow`)}
      title={
        <Translation i18nKey={`${prefix}.title`} components={{ em: <em /> }} />
      }
      lead={
        decidedLabel
          ? t(`${prefix}.lead`, { date: decidedLabel })
          : t(`${prefix}.leadNoDate`)
      }
      actions={
        <>
          {isRecoverable && (
            <Button
              // Guarded rather than `disabled`: the control stays focusable,
              // and a second click while the first is in flight would issue a
              // second request against a 5-per-hour route.
              onClick={() => {
                if (!isRefreshing) onRefresh();
              }}
              aria-disabled={isRefreshing}
              aria-busy={isRefreshing}
            >
              {isRefreshing ? (
                <Sending
                  label={t(
                    "auth:joinRequestStatus.approvedSpent.expired.refreshing",
                  )}
                />
              ) : (
                t("auth:joinRequestStatus.approvedSpent.expired.cta")
              )}
            </Button>
          )}
          <Button
            variant={isRecoverable ? "ghost" : "primary"}
            to={routes.signIn}
          >
            {t("auth:joinRequestStatus.approvedSpent.signInCta")}
          </Button>
          {!isRecoverable && (
            <Button variant="ghost" to={routes.contact}>
              {t("auth:joinRequestStatus.contactCta")}
            </Button>
          )}
        </>
      }
      foot={t(`${prefix}.foot`)}
    >
      {/* A live region: the answer to a button press must reach a screen
          reader without moving focus off the button that caused it. */}
      <p className={styles.refusal} role="status">
        {refusal
          ? t(`auth:joinRequestStatus.approvedSpent.refusal.${refusal}`)
          : ""}
      </p>
    </StatusState>
  );
}
