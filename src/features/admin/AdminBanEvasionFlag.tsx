import { FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { formatDate } from "../../shared/lib/date";
import type {
  BanEvasionAssessmentDTO,
  BanEvasionSignalDTO,
  BanEvasionSignalKind,
} from "./api/adminInvites.api";
import styles from "./AdminBanEvasionFlag.module.css";

/**
 * The "this may be someone who was removed" panel on a join request in the
 * invite review console.
 *
 * IT IS A SIGNAL, AND THE REVIEWER DECIDES. Nothing on the platform acts on
 * this: no application is held, refused, or hidden because of it. The panel
 * exists so a reviewer who would otherwise see a stranger's first application
 * knows there is a specific removed account worth reading first.
 *
 * THE COPY IS ABOUT A REMOVED ACCOUNT, never about the applicant. Every line
 * names something a specific removed account did (the address it applied with,
 * who invited it) and the date it was removed. There is no wording here about
 * who anyone appears to be, and there never should be.
 */

/** Reason key to catalogue key, mirroring how the queue's existing join-request
 *  flags resolve their labels. */
const REASON_KEYS: Record<BanEvasionSignalKind, string> = {
  sign_in_identifier_match: "admin:invites.banEvasion.reasons.signInIdentifier",
  intake_contact_match: "admin:invites.banEvasion.reasons.intakeContact",
  stated_details_match: "admin:invites.banEvasion.reasons.statedDetails",
  inviter_removed: "admin:invites.banEvasion.reasons.inviterRemoved",
  inviter_of_removed_account:
    "admin:invites.banEvasion.reasons.inviterOfRemoved",
  reference_removed: "admin:invites.banEvasion.reasons.referenceRemoved",
  reference_of_removed_account:
    "admin:invites.banEvasion.reasons.referenceOfRemoved",
};

/** "Removed from Porto Queer Readers on 4 Apr 2026", or the platform-wide
 *  equivalent. Always names where the removal happened and when. */
function contextLine(
  signal: BanEvasionSignalDTO,
  t: TFunction,
  locale: string,
): string {
  const date = formatDate(signal.removedAt, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (signal.removalKind === "community_ban") {
    return signal.communityName
      ? t("admin:invites.banEvasion.context.community", {
          community: signal.communityName,
          date,
        })
      : t("admin:invites.banEvasion.context.communityUnnamed", { date });
  }
  return t("admin:invites.banEvasion.context.platform", { date });
}

function BanEvasionReason({
  signal,
  locale,
  t,
}: {
  signal: BanEvasionSignalDTO;
  locale: string;
  t: TFunction;
}) {
  return (
    <li className={styles.reason}>
      <span className={styles.reasonLabel}>{t(REASON_KEYS[signal.kind])}</span>
      <span className={styles.reasonContext}>
        {contextLine(signal, t, locale)}
        {signal.removedAccountSlug ? (
          <>
            {" "}
            <Link
              to={`/members/${signal.removedAccountSlug}`}
              className={styles.reasonLink}
            >
              {signal.removedAccountName ??
                t("admin:invites.banEvasion.viewAccount")}
            </Link>
          </>
        ) : (
          <> {t("admin:invites.banEvasion.accountErased")}</>
        )}
      </span>
    </li>
  );
}

export function AdminBanEvasionFlag({
  assessment,
}: {
  /** Undefined while the assessment is still loading, or when the queue was
   *  never able to fetch one. Renders nothing in both cases, and in the very
   *  common case of a clear applicant (`tier: "none"`). */
  assessment: BanEvasionAssessmentDTO | undefined;
}) {
  const { t, language } = useTranslation();
  if (!assessment || assessment.tier === "none") return null;
  if (assessment.signals.length === 0) return null;

  return (
    <section
      className={`${styles.panel} ${styles[`panel--${assessment.tier}`]}`}
      aria-label={t("admin:invites.banEvasion.title")}
    >
      <div className={styles.head}>
        <FiAlertCircle aria-hidden className={styles.icon} />
        <h4 className={styles.title}>{t("admin:invites.banEvasion.title")}</h4>
        <span className={styles.tier}>
          {t(`admin:invites.banEvasion.tier.${assessment.tier}`)}
        </span>
      </div>

      <ul className={styles.reasons}>
        {assessment.signals.map((signal, index) => (
          <BanEvasionReason
            key={`${signal.kind}-${signal.removedAt}-${index}`}
            signal={signal}
            locale={language}
            t={t}
          />
        ))}
      </ul>

      <p className={styles.note}>{t("admin:invites.banEvasion.note")}</p>
    </section>
  );
}
