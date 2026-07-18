import { FiCheck, FiSend } from "react-icons/fi";
import { CopyLinkRow } from "../../shared/components/ui";
import { AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import { inviteFullUrlFor } from "../../shared/lib/inviteUrl";
import styles from "./AdminMembersPage.module.css";

/**
 * What the reviewer sees straight after welcoming someone in: the invite link
 * built from their code, ready to copy.
 *
 * There is **no email service** — nothing has been sent to the applicant, and
 * the copy says so plainly. The reviewer sends this link themselves, which is
 * why their email address is repeated right next to it.
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
        <FiSend aria-hidden />
        {t("admin:members.verify.sendYourself", { email: item.email })}
      </p>

      {url ? (
        <CopyLinkRow
          tone="paper"
          value={url}
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
