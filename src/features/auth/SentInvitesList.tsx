import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSentInvites, type SentInviteView } from "./api/useSentInvites";
import styles from "./SentInvitesList.module.css";

/** One sent-invite row: code, status chip, and the send/expiry or accepted line. */
function SentInviteRow({ invite }: { invite: SentInviteView }) {
  const detail =
    invite.status === "used" && invite.acceptedByName
      ? `Joined — welcome ${invite.acceptedByName}`
      : invite.status === "valid"
        ? `Sent ${invite.sentLabel} · expires ${invite.expiryLabel}`
        : `Sent ${invite.sentLabel} · expired ${invite.expiryLabel}`;

  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <div className={styles.code}>{invite.code}</div>
        {invite.note && <div className={styles.note}>"{invite.note}"</div>}
        <div className={styles.detail}>{detail}</div>
      </div>
      <span className={`${styles.chip} ${styles[invite.statusTone]}`}>
        {invite.statusLabel}
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
  const { data, isLoading } = useSentInvites();

  if (isLoading) {
    return (
      <section className={styles.wrap}>
        <div className={styles.label}>Invites you've sent</div>
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
      <div className={styles.label}>Invites you've sent</div>
      <div className={styles.list}>
        {data.map((invite, i) => (
          <FadeIn key={invite.code} delay={i * 60}>
            <SentInviteRow invite={invite} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
