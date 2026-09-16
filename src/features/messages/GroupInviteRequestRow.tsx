import { Avatar, Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { groupInitials } from "./api/messages.adapters";
import type { GroupInviteSummary } from "../../shared/contracts/contracts";
import connectStyles from "../connect/ConnectionsPage.module.css";

/**
 * PRD-353: one pending group invite in the Requests tab, a near-twin of
 * `MessagesInboundRequestCard` (same `connectStyles` card shell, for visual
 * parity with the message-request cards it sits beside) but for a GROUP
 * rather than a person: no profile link, an avatar/initials in place of a
 * member photo, and an Accept/Decline pair rather than the three-way
 * Accept/Reply/Decline a message request offers (there is no "reply" for an
 * invite that hasn't been answered yet).
 */
export function GroupInviteRequestRow({
  invite,
  isBusy,
  onAccept,
  onDecline,
}: {
  invite: GroupInviteSummary;
  /** True while accept/decline is in flight for THIS invite. */
  isBusy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const title =
    invite.title ?? t("messages:requests.groupInvite.untitledGroup");
  return (
    <div className={connectStyles.card}>
      <div className={connectStyles.cardHead}>
        <Avatar
          initials={groupInitials(title)}
          src={invite.avatarUrl ?? undefined}
          size={54}
          name={title}
        />
        <div>
          <div className={connectStyles.name}>{title}</div>
          <div className={connectStyles.role}>
            <Translation
              i18nKey="messages:requests.groupInvite.invitedBy"
              values={{ inviter: invite.inviter.displayName }}
            />
          </div>
        </div>
      </div>
      <div className={connectStyles.meta}>
        <span>
          {t("messages:group.memberCount", { count: invite.memberCount })}
        </span>
      </div>
      <div className={connectStyles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onDecline}
          disabled={isBusy}
        >
          {t("messages:requests.groupInvite.decline")}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onAccept}
          disabled={isBusy}
        >
          {t("messages:requests.groupInvite.accept")}
        </Button>
      </div>
    </div>
  );
}
