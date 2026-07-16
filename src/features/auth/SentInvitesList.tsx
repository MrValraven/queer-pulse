import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { useSentInvites, type SentInviteView } from "./api/useSentInvites";
import styles from "./SentInvitesList.module.css";

/** One sent-invite row: code, status chip, and the send/expiry or accepted line. */
function SentInviteRow({
  invite,
  t,
  fmt,
}: {
  invite: SentInviteView;
  t: TFunction;
  fmt: Formatters;
}) {
  const sent = fmt.date(invite.sentAt);
  const expires = fmt.date(invite.expiresAt);
  const detail =
    invite.status === "used" && invite.acceptedByName
      ? t("auth:invite.sentList.detail.joined", { name: invite.acceptedByName })
      : invite.status === "valid"
        ? t("auth:invite.sentList.detail.sentExpires", { sent, expires })
        : t("auth:invite.sentList.detail.sentExpired", { sent, expires });

  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <div className={styles.code}>{invite.code}</div>
        {invite.note && <div className={styles.note}>"{invite.note}"</div>}
        <div className={styles.detail}>{detail}</div>
      </div>
      <span className={`${styles.chip} ${styles[invite.statusTone]}`}>
        {t(invite.statusKey)}
      </span>
    </div>
  );
}

/**
 * The invites the current member has already sent, with live status/expiry.
 * Sourced from useSentInvites (GET /invites in live mode, mock in demo mode).
 * Renders nothing when the member has never sent an invite, to keep the compose
 * page focused for first-time inviters.
 */
export function SentInvitesList() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data, isLoading } = useSentInvites();

  if (isLoading) {
    return (
      <section className={styles.wrap}>
        <div className={styles.label}>{t("auth:invite.sentList.label")}</div>
        <div className={styles.list}>
          {[0, 1].map((i) => (
            <div className={styles.row} key={i}>
              <div className={styles.main}>
                <SkeletonLine width="45%" />
                <SkeletonLine width="70%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className={styles.wrap}>
      <div className={styles.label}>{t("auth:invite.sentList.label")}</div>
      <div className={styles.list}>
        {data.map((invite, i) => (
          <FadeIn key={invite.code} delay={i * 60}>
            <SentInviteRow invite={invite} t={t} fmt={fmt} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
