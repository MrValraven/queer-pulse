import { Button } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingCoManagerInviteDTO } from "../api/listingCoManagers.api";
import styles from "./CoManagers.module.css";

/**
 * One invitation waiting on an answer: which place, who asked, and the two
 * ways to reply.
 *
 * Both answers are offered with equal weight. Being asked to help run
 * somebody's business is a real commitment, and a decline is a perfectly good
 * answer, so it is a plain button beside accept rather than a small link
 * underneath it.
 */
export function CoManagerInviteRow({
  invite,
  isBusy,
  onAnswer,
}: {
  invite: ListingCoManagerInviteDTO;
  isBusy: boolean;
  onAnswer: (invite: ListingCoManagerInviteDTO, isAccepted: boolean) => void;
}) {
  const { t } = useTranslation();
  const inviter = invite.invitedBy;
  const inviterName = inviter
    ? `${inviter.firstName} ${inviter.lastName}`.trim()
    : "";

  return (
    <li className={styles.inviteRow}>
      <div className={styles.inviteBody}>
        <p className={styles.inviteName}>{invite.listingName}</p>
        <p className={styles.inviteFrom}>
          <Translation
            i18nKey={
              inviterName
                ? "members:places.coManagerInvites.fromNamed"
                : "members:places.coManagerInvites.from"
            }
            values={{ name: inviterName }}
            components={{ b: <b /> }}
          />
        </p>
      </div>
      <div className={styles.inviteActions}>
        <Button
          variant="ghost"
          disabled={isBusy}
          onClick={() => onAnswer(invite, false)}
        >
          {t("members:places.coManagerInvites.declineCta")}
        </Button>
        <Button
          variant="primary"
          disabled={isBusy}
          onClick={() => onAnswer(invite, true)}
        >
          {t("members:places.coManagerInvites.acceptCta")}
        </Button>
      </div>
    </li>
  );
}
