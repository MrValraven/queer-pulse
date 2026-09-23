import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import type { ListingOwnerOfferDTO } from "../api/ownerOffers.api";
import { useAnswerOwnerOffer, useOwnerOffers } from "../api/useOwnerOffers";
import { OwnerOfferRow } from "./OwnerOfferRow";
import coManagerStyles from "../coManagers/CoManagers.module.css";

/**
 * Places an admin has written and put in a member's name, answered where the
 * member's own places live.
 *
 * Somebody being told a business is theirs is a heavier ask than being invited
 * to help run one, so this sits above the co-manager inbox on the account
 * profile and is answered first. It shares that inbox's shell, because the two
 * stack and should read as one thing waiting on the member.
 *
 * An accepted place lands in the grid below the moment they say yes, which is
 * why the answer is asked for here, beside the member's other businesses. The
 * app already answers "what is waiting on me?" beside the thing it concerns,
 * and this belongs with places.
 *
 * Renders nothing at all when there is nothing waiting, and never in demo
 * mode, where the query is disabled and answers with an empty list.
 */
export function OwnerOfferInbox() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { offers } = useOwnerOffers();
  const answer = useAnswerOwnerOffer();
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  if (offers.length === 0) return null;

  const respond = (offer: ListingOwnerOfferDTO, isAccepted: boolean) => {
    setAnsweringId(offer.id);
    answer.mutate(
      { offerId: offer.id, isAccepted },
      {
        onSuccess: () => {
          setAnsweringId(null);
          if (!isAccepted) {
            showToast(t("members:places.ownerOffers.declinedToast"), "info");
            return;
          }
          showToast(
            t("members:places.ownerOffers.acceptedToast", {
              listing: offer.listingName,
            }),
            "success",
          );
          // Straight into the place that is now theirs, where the details they
          // were handed are theirs to correct.
          void navigate(
            routes.listBusinessEdit.replace(":ref", offer.listingRef),
          );
        },
        onError: () => {
          setAnsweringId(null);
          showToast(t("members:places.ownerOffers.error"), "error");
        },
      },
    );
  };

  return (
    <section className={coManagerStyles.inbox} aria-labelledby="owner-offers">
      {/* An h2, so it sits level with "Places you run" below it and with the
          co-manager inbox between them. All three are peers on this page. */}
      <h2 className={coManagerStyles.inboxTitle} id="owner-offers">
        {t("members:places.ownerOffers.title", { count: offers.length })}
      </h2>
      <p className={coManagerStyles.intro}>
        {t("members:places.ownerOffers.sub")}
      </p>
      <ul className={coManagerStyles.inviteList}>
        {offers.map((offer) => (
          <OwnerOfferRow
            key={offer.id}
            offer={offer}
            isBusy={answeringId === offer.id}
            onAnswer={respond}
          />
        ))}
      </ul>
    </section>
  );
}
