import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { cardDtoToCommunity } from "./api/communities.adapters";
import type { MyCommunityInviteDTO } from "./api/communityInvites.api";
import { CommunityCardShell } from "./CommunityCardShell";
import styles from "./CommunityInvitations.module.css";

/**
 * One standing invitation on the shelf: the community as the ordinary card the
 * rest of the app renders, the person who sent it, and the two answers.
 *
 * The card and the actions are siblings rather than nested, because
 * `CommunityCardShell` renders as a `<Link>` to the community: putting Accept
 * and Decline inside it would nest controls in a link, and a keyboard user
 * would have no way to reach either without also being offered the whole card.
 *
 * ACCEPT is a link to the community, not a mutation. Accepting is
 * `POST /communities/:slug/join`, which is the door the house rules are read
 * at, so this hands the member to that door rather than joining them to a
 * covenant they were never shown. DECLINE is the mutation, and it is the
 * quiet one: the community is never told the answer was no.
 */
export function CommunityInvitationRow({
  invite,
  isDeclining,
  onDecline,
}: {
  invite: MyCommunityInviteDTO;
  isDeclining: boolean;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const community = cardDtoToCommunity(invite.community, t);
  const inviterName = invite.invitedBy
    ? `${invite.invitedBy.firstName} ${invite.invitedBy.lastName}`.trim()
    : "";

  return (
    <li className={styles.row}>
      <CommunityCardShell
        slug={community.slug}
        name={community.name}
        type={community.type}
        typeLabel={community.typeLabel}
        description={community.description}
        countLabel={community.count}
        activeThisWeek={community.activeThisWeek}
        coverImageUrl={community.coverImageUrl}
        tags={community.tags}
      />
      <div className={styles.rowFoot}>
        <p className={styles.rowFrom}>
          <span className={styles.rowFromName}>
            {inviterName
              ? t("communities:invites.from", { name: inviterName })
              : t("communities:invites.fromUnknown")}
          </span>
          <span className={styles.rowWhen}>
            {fmt.date(new Date(invite.createdAt))}
          </span>
        </p>
        <div className={styles.rowActions}>
          <Button
            variant="ghost"
            onClick={onDecline}
            disabled={isDeclining}
            aria-label={t("communities:invites.declineAriaLabel", {
              name: community.name,
            })}
          >
            {t("communities:detail.invite.decline")}
          </Button>
          <Button
            variant="primary"
            to={`/community/${community.slug}`}
            aria-label={t("communities:invites.acceptAriaLabel", {
              name: community.name,
            })}
          >
            {t("communities:invites.openCta")}
          </Button>
        </div>
      </div>
    </li>
  );
}
