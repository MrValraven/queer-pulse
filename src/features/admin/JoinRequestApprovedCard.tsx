import { FiCheck, FiLink } from "react-icons/fi";
import { CopyLinkRow } from "../../shared/components/ui";
import { AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import { inviteFullUrlFor, inviteUrlFor } from "../../shared/lib/inviteUrl";
import styles from "./AdminMembersPage.module.css";

/**
 * What the reviewer sees straight after welcoming someone in: the invite link
 * built from their code, ready to copy.
 *
 * Handing that link over is the reviewer's job. QueerPulse has no email
 * delivery, so approval puts nothing in the applicant's inbox and this card
 * is the only route the invite has to them, which is why their email address
 * is repeated right next to the link they need to send it to.
 */
export function JoinRequestApprovedCard({ item }: { item: JoinRequestView }) {
  const { t } = useTranslation();
  // The backend returns a code, never a URL — composing the link is the
  // client's job, and it goes through the one shared builder.
  const url = item.inviteCode ? inviteFullUrlFor(item.inviteCode) : null;

  return (
    <div className={`${styles.queueCard} ${styles.queueCardApproved}`}>
      <div className={styles.queueHead}>
        <AdminAvatar
          initials={item.initials}
          tone={item.tone}
          size="md"
          src={portrait(item.name)}
        />
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
