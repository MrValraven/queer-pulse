import { useRef, useState } from "react";
import { ConfirmDialog, LoadErrorState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityOwnershipOfferDTO } from "./api/communityOwnershipOffers.api";
import {
  useMyCommunityOwnershipOffers,
  useRespondToOwnershipOffer,
  type OwnershipOfferAnswer,
} from "./api/useCommunityOwnershipOffers";
import { CommunityOwnershipOfferInboxRow } from "./CommunityOwnershipOfferInboxRow";
import { communityErrorText } from "./communityErrors";
import { offeringOwnerName } from "./ownershipOfferNames";
import styles from "./CommunityInvitations.module.css";

/**
 * Where focus goes once an answer lands: the section heading while other
 * offers remain, the page's h1 when the last one leaves (the section unmounts
 * with it). Two frames, so the dialog has closed and restored its own focus
 * first.
 */
function focusAfterAnswer(heading: HTMLElement | null, isLastOffer: boolean) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = isLastOffer
        ? document.querySelector<HTMLElement>("h1")
        : heading;
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  });
}

interface PendingAnswer {
  offer: CommunityOwnershipOfferDTO;
  answer: OwnershipOfferAnswer;
}

/**
 * PRD-514. The offered member's ownership inbox, at the top of the
 * invitations shelf: the other place a community is waiting on this member's
 * answer. Renders nothing while there is nothing open, so the shelf reads as
 * it always has for everyone else.
 *
 * Both answers go through a confirm step: accepting makes the member
 * accountable for the community, and declining tells the owner. A refusal
 * names its cause (an offer that lapsed, was cancelled, or can now only be
 * declined), and the list re-reads either way so a stale row leaves.
 */
export function CommunityOwnershipOffersSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { offers, isError, refetch } = useMyCommunityOwnershipOffers();
  const respond = useRespondToOwnershipOffer();
  const [pending, setPending] = useState<PendingAnswer | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  if (isError) {
    return (
      <section className={styles.offers}>
        <LoadErrorState compact onRetry={refetch} />
      </section>
    );
  }
  if (offers.length === 0) return null;

  const confirm = () => {
    if (!pending || respond.isPending) return;
    const { offer, answer } = pending;
    respond.mutate(
      { offerId: offer.id, communitySlug: offer.communitySlug, answer },
      {
        onSuccess: () => {
          showToast(
            answer === "accept"
              ? t("communities:ownershipOffer.accepted", {
                  communityName: offer.communityName,
                })
              : t("communities:ownershipOffer.declined"),
            "success",
          );
          focusAfterAnswer(headingRef.current, offers.length <= 1);
        },
        onError: (error) => showToast(communityErrorText(t, error), "error"),
        onSettled: () => setPending(null),
      },
    );
  };

  const dialogValues = pending
    ? {
        communityName: pending.offer.communityName,
        name: offeringOwnerName(pending.offer, t),
      }
    : undefined;
  const isAccepting = pending?.answer === "accept";

  return (
    <section
      className={styles.offers}
      aria-labelledby="ownership-offers-heading"
    >
      <h2
        id="ownership-offers-heading"
        ref={headingRef}
        tabIndex={-1}
        className={styles.offersTitle}
      >
        {t("communities:ownershipOffer.inboxTitle")}
      </h2>
      <ul className={styles.offerList}>
        {offers.map((offer) => (
          <CommunityOwnershipOfferInboxRow
            key={offer.id}
            offer={offer}
            isBusy={respond.isPending && pending?.offer.id === offer.id}
            onAnswer={(answer) => setPending({ offer, answer })}
          />
        ))}
      </ul>
      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        loading={respond.isPending}
        // Declining keeps ownership where it is, so it reads as a neutral step.
        tone={isAccepting ? "positive" : "neutral"}
        title={t(
          isAccepting
            ? "communities:ownershipOffer.acceptConfirm.title"
            : "communities:ownershipOffer.declineConfirm.title",
          dialogValues,
        )}
        description={t(
          isAccepting
            ? "communities:ownershipOffer.acceptConfirm.body"
            : "communities:ownershipOffer.declineConfirm.body",
          dialogValues,
        )}
        confirmLabel={t(
          isAccepting
            ? "communities:ownershipOffer.accept"
            : "communities:ownershipOffer.decline",
        )}
        cancelLabel={t("communities:ownershipOffer.keepDeciding")}
      />
    </section>
  );
}
