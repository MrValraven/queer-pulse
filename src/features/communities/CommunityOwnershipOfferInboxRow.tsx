import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import type { CommunityOwnershipOfferDTO } from "./api/communityOwnershipOffers.api";
import type { OwnershipOfferAnswer } from "./api/useCommunityOwnershipOffers";
import { offeringOwnerName } from "./ownershipOfferNames";
import styles from "./CommunityInvitations.module.css";

/**
 * One open ownership offer in the offered member's inbox (PRD-514): who
 * offered which community, when the offer lapses, and the two answers. The
 * community name links to its page so the member can look before deciding.
 * Both answers open a confirm step in the section above this row.
 */
export function CommunityOwnershipOfferInboxRow({
  offer,
  isBusy,
  onAnswer,
}: {
  offer: CommunityOwnershipOfferDTO;
  isBusy: boolean;
  onAnswer: (answer: OwnershipOfferAnswer) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const communityName = offer.communityName;

  return (
    <li className={styles.offerRow}>
      <Link
        to={communityPath(offer.communitySlug)}
        className={styles.offerCommunity}
      >
        {communityName}
      </Link>
      <p className={styles.offerText}>
        {t("communities:ownershipOffer.inboxItem", {
          name: offeringOwnerName(offer, t),
          communityName,
        })}
      </p>
      <p className={styles.rowWhen}>
        <time dateTime={offer.expiresAt}>
          {t("communities:ownershipOffer.expiresOn", {
            date: fmt.date(new Date(offer.expiresAt)),
          })}
        </time>
      </p>
      <div className={styles.rowActions}>
        <Button
          variant="ghost"
          onClick={() => onAnswer("decline")}
          disabled={isBusy}
          aria-label={t("communities:ownershipOffer.declineAriaLabel", {
            communityName,
          })}
        >
          {t("communities:ownershipOffer.decline")}
        </Button>
        <Button
          variant="primary"
          onClick={() => onAnswer("accept")}
          disabled={isBusy}
          aria-label={t("communities:ownershipOffer.acceptAriaLabel", {
            communityName,
          })}
        >
          {t("communities:ownershipOffer.accept")}
        </Button>
      </div>
    </li>
  );
}
