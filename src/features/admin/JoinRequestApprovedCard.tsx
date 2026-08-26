import { FiCheck, FiLink } from "react-icons/fi";
import { CopyLinkRow } from "../../shared/components/ui";
import { AdminAvatar, AdminChip } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import { joinRequestInviteState } from "./joinRequestInviteState";
import { inviteFullUrlFor, inviteUrlFor } from "../../shared/lib/inviteUrl";
import styles from "./AdminMembersPage.module.css";
import decidedStyles from "./AdminVerifyDecided.module.css";

/**
 * What the reviewer sees straight after welcoming someone in: the invite link
 * built from their code, ready to copy.
 *
 * Handing that link over is the reviewer's job. QueerPulse has no email
 * delivery and never will, so approval puts nothing in the applicant's inbox,
 * which is why their email address is repeated right next to the link they
 * need to send it to.
 *
 * The link is not open-ended: an approval invite lapses seven days after it is
 * minted, so the card says how long is left. This card is also transient (it
 * lives in the reviewer's session), so a reviewer who closes the tab picks the
 * same link back up in the Decided tab, which reads from the server.
 */
export function JoinRequestApprovedCard({ item }: { item: JoinRequestView }) {
  const { t } = useTranslation();
  // The backend returns a code, never a URL — composing the link is the
  // client's job, and it goes through the one shared builder.
  const url = item.inviteCode ? inviteFullUrlFor(item.inviteCode) : null;
  // How long the reviewer has to hand it over, in the same words the Decided
  // tab uses — one helper, so the two surfaces can never disagree.
  const inviteState = joinRequestInviteState(item, t);

  return (
    <div className={`${styles.queueCard} ${styles.queueCardApproved}`}>
      <div className={styles.queueHead}>
        {/* Initials only — same reason as the pending card: the applicant
            has no avatar of their own, and the demo portrait registry keys off
            the name they submitted. */}
        <AdminAvatar initials={item.initials} tone={item.tone} size="md" />
        <div>
          <div className={styles.queueName}>
            {item.name}
            <span className={styles.queueApprovedTick} aria-hidden>
              <FiCheck />
            </span>
          </div>
          <div className={styles.queueApplied}>
            {t("admin:members.verify.approvedLabel")}
          </div>
        </div>
      </div>

      <p className={styles.queueSendNote}>
        <FiLink aria-hidden />
        {t("admin:members.verify.sendYourself", { email: item.email })}
      </p>

      {inviteState && (
        <p className={decidedStyles.inviteHead}>
          <AdminChip tone={inviteState.chipTone}>
            {inviteState.chipLabel}
          </AdminChip>
          <span className={decidedStyles.inviteNote}>{inviteState.note}</span>
        </p>
      )}

      {url ? (
        <CopyLinkRow
          tone="paper"
          value={url}
          // The field is narrow inside a queue column, so show the short,
          // scheme-less form; the full absolute URL is still what is copied.
          display={item.inviteCode ? inviteUrlFor(item.inviteCode) : undefined}
          fieldLabel={t("admin:members.verify.linkFieldLabel")}
          copyLabel={t("admin:members.verify.copyLink")}
          copiedLabel={t("admin:members.verify.copiedLink")}
          copiedToast={t("admin:members.verify.copiedToast")}
          errorToast={t("admin:members.verify.copyFailed")}
        />
      ) : (
        <p className={styles.queueNoCode}>
          {t("admin:members.verify.noInviteCode")}
        </p>
      )}
    </div>
  );
}
