import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingTeamMemberLinkRowView } from "../../marketing/listBusiness/api/listingTeam.types";
import { ListingTeamListingImage } from "../../marketing/listBusiness/team/ListingTeamListingImage";
import styles from "./MemberTeamInvites.module.css";

const KEY = "members:places.teamInvites";
const LISTING_IMAGE_SIZE = 40;

export type MemberTeamLinkKind = "invite" | "accepted";

interface MemberTeamInviteRowProps {
  row: ListingTeamMemberLinkRowView;
  kind: MemberTeamLinkKind;
  isBusy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onLeave: () => void;
}

/** One link between this member and a business, with the actions its kind
 *  allows. Busy buttons keep focus: aria-disabled, with the handler returning
 *  early. */
export function MemberTeamInviteRow({
  row,
  kind,
  isBusy,
  onAccept,
  onDecline,
  onLeave,
}: MemberTeamInviteRowProps) {
  const { t } = useTranslation();
  const { listing } = row;
  const guard = (action: () => void) => () => {
    if (!isBusy) action();
  };
  return (
    <div className={styles.row}>
      <ListingTeamListingImage listing={listing} size={LISTING_IMAGE_SIZE} />
      <div className={styles.text}>
        {row.isListingLive ? (
          <Link to={listing.href} className={styles.name}>
            {listing.name}
          </Link>
        ) : (
          <span className={styles.name}>{listing.name}</span>
        )}
        {row.roleLabel && (
          <span className={styles.meta}>
            {t(`${KEY}.roleLine`, { role: row.roleLabel })}
          </span>
        )}
        {!row.isListingLive && (
          <span className={styles.meta}>{t(`${KEY}.listingHidden`)}</span>
        )}
      </div>
      <div className={styles.actions}>
        {kind === "invite" && (
          <>
            <Button
              size="sm"
              variant="primary"
              aria-disabled={isBusy}
              aria-label={t(`${KEY}.acceptAria`, { listing: listing.name })}
              onClick={guard(onAccept)}
            >
              {t(`${KEY}.acceptCta`)}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-disabled={isBusy}
              aria-label={t(`${KEY}.declineAria`, { listing: listing.name })}
              onClick={guard(onDecline)}
            >
              {t(`${KEY}.declineCta`)}
            </Button>
          </>
        )}
        {kind === "accepted" && (
          <Button
            size="sm"
            variant="ghost"
            aria-disabled={isBusy}
            aria-label={t(`${KEY}.leaveAria`, { listing: listing.name })}
            onClick={guard(onLeave)}
          >
            {t(`${KEY}.leaveCta`)}
          </Button>
        )}
      </div>
    </div>
  );
}
