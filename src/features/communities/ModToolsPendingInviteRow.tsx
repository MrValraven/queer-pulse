import { Button, MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberRefToPerson } from "../../shared/api/refs";
import type { CommunityPendingInviteDTO } from "./api/communityInvites.api";
import styles from "./ModToolsPanels.module.css";

/**
 * One row on the pending-invitations list: who was invited, who invited them,
 * when, and the one control that takes it back.
 *
 * Who sent it leads the second line rather than the date, because the question
 * a moderator opens this list with is "did one of us already ask her", and the
 * answer to that names a person. The date sits beside it so a months-old
 * invitation reads as one.
 *
 * The Withdraw button carries the invitee's name in its accessible name. A
 * column of buttons all announcing themselves as "Withdraw" tells a screen
 * reader user which action they are on and nothing about who it lands on,
 * which for this particular action is the only thing that matters.
 */
export function ModToolsPendingInviteRow({
  invite,
  isPending,
  onRevoke,
  formatDate,
}: {
  invite: CommunityPendingInviteDTO;
  /** True while this row's own withdrawal is in flight. */
  isPending: boolean;
  onRevoke: () => void;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const member = memberRefToPerson(invite.member);
  const inviter = memberRefToPerson(invite.invitedBy);
  // A member ref with both name parts blank still has to render as somebody,
  // and the profile slug is the one identifier it always carries.
  const memberName = member?.name || invite.member.slug;
  const inviterName = inviter ? inviter.name || inviter.slug : null;

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <MemberIdentity
          person={{
            slug: invite.member.slug,
            name: memberName,
            avatarUrl: member?.avatarUrl ?? undefined,
          }}
          size={36}
        />
        <p className={styles.metaLine}>
          <span>
            {inviterName
              ? t("communities:detail.modtools.invites.pending.sentBy", {
                  name: inviterName,
                })
              : t("communities:detail.modtools.invites.pending.sentByGone")}
          </span>
          <time dateTime={invite.createdAt}>
            {formatDate(invite.createdAt)}
          </time>
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={onRevoke}
          aria-label={t(
            "communities:detail.modtools.invites.pending.revokeAriaLabel",
            { name: memberName },
          )}
        >
          {t("communities:detail.modtools.invites.pending.revokeCta")}
        </Button>
      </div>
    </div>
  );
}
