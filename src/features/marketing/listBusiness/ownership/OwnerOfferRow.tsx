import { useId, useRef, useState } from "react";
import { Button, CheckLine } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingOwnerOfferDTO } from "../api/ownerOffers.api";
import { AffirmingBaselineNotice } from "../fields/AffirmingBaselineAgreement";
import coManagerStyles from "../coManagers/CoManagers.module.css";
import styles from "./Ownership.module.css";

/**
 * One offer of ownership waiting on an answer: which place, who offered it,
 * anything they wrote, and the two ways to reply.
 *
 * Both answers are offered with equal weight. Being handed a business is a
 * real commitment, and a decline is a perfectly good answer, so it is a plain
 * button beside accept, the same size and on the same line. Declining is
 * always available, even once somebody else has taken the listing on, so a
 * dead offer can always be cleared off the list.
 *
 * Accepting takes a second step. The API requires `affirmingBaselineAccepted`
 * to be `true`, because an admin-authored listing carries no acceptance of the
 * affirming baseline until the person taking it on agrees, and that agreement
 * is stamped with their name at this moment. So Accept opens the pledge and
 * waits for a real answer to it. The pledge is a disclosure panel owned by the
 * Accept button, which stays mounted the whole time it is open and takes focus
 * back whenever it closes, so nothing is yanked out from under a keyboard or
 * screen reader in mid-step.
 */
export function OwnerOfferRow({
  offer,
  isBusy,
  onAnswer,
}: {
  offer: ListingOwnerOfferDTO;
  isBusy: boolean;
  onAnswer: (offer: ListingOwnerOfferDTO, isAccepted: boolean) => void;
}) {
  const { t } = useTranslation();
  const pledgeId = useId();
  const acceptTriggerRef = useRef<HTMLButtonElement>(null);
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [isBaselineAgreed, setIsBaselineAgreed] = useState(false);

  /**
   * Shut the pledge, from either control that shuts it.
   *
   * The tick is cleared on the way out, so each opening asks for a fresh
   * agreement and an answer somebody backed out of is never waiting for them
   * when they come back.
   *
   * Focus goes home to the trigger. "Not yet" sits inside the panel it
   * removes, so pressing it destroys the focused element and drops a keyboard
   * or screen-reader user on the document body. Handing focus back to the
   * control that opened the panel is what a disclosure promises, and the
   * trigger is mounted throughout, so this is a plain `.focus()` with no
   * timing to get wrong.
   */
  const closePledge = () => {
    setIsPledgeOpen(false);
    setIsBaselineAgreed(false);
    acceptTriggerRef.current?.focus();
  };

  const offeredBy = offer.offeredBy;
  const offeredByName = offeredBy
    ? `${offeredBy.firstName} ${offeredBy.lastName}`.trim()
    : "";

  return (
    <li className={coManagerStyles.inviteRow}>
      <div className={coManagerStyles.inviteBody}>
        <p className={coManagerStyles.inviteName}>{offer.listingName}</p>
        <p className={coManagerStyles.inviteFrom}>
          <Translation
            i18nKey={
              offeredByName
                ? "members:places.ownerOffers.fromNamed"
                : "members:places.ownerOffers.from"
            }
            values={{ name: offeredByName }}
            components={{ b: <b /> }}
          />
        </p>
        {offer.note && (
          <p className={styles.note}>
            {t("members:places.ownerOffers.note", { note: offer.note })}
          </p>
        )}
      </div>

      <div className={coManagerStyles.inviteActions}>
        <Button
          variant="ghost"
          disabled={isBusy}
          onClick={() => onAnswer(offer, false)}
        >
          {t("members:places.ownerOffers.declineCta")}
        </Button>
        {/* Expanded, this button closes the pledge, so it says so. A trigger
            still reading "Accept" while the next press backs out of accepting
            would describe the wrong action. */}
        <Button
          ref={acceptTriggerRef}
          variant="primary"
          disabled={isBusy}
          aria-expanded={isPledgeOpen}
          aria-controls={isPledgeOpen ? pledgeId : undefined}
          onClick={() => (isPledgeOpen ? closePledge() : setIsPledgeOpen(true))}
        >
          {t(
            isPledgeOpen
              ? "members:places.ownerOffers.acceptCloseCta"
              : "members:places.ownerOffers.acceptCta",
          )}
        </Button>
      </div>

      {isPledgeOpen && (
        <div id={pledgeId} className={styles.pledge}>
          <p className={styles.pledgeLead}>
            <Translation
              i18nKey="members:places.ownerOffers.pledgeLead"
              values={{ listing: offer.listingName }}
              components={{ b: <b /> }}
            />
          </p>
          <AffirmingBaselineNotice />
          <CheckLine
            checked={isBaselineAgreed}
            // Held still while the answer is in flight, so the tick and the
            // four buttons agree on when this row is busy. `CheckLine` takes
            // no `disabled` prop and is a shared primitive owned elsewhere,
            // so the guard lives in the handler. The window is the length of
            // one request, and the whole panel goes away on success.
            onChange={(isAgreed) => {
              if (isBusy) return;
              setIsBaselineAgreed(isAgreed);
            }}
            title={t("members:places.ownerOffers.agreeTitle")}
            sub={t("members:places.ownerOffers.agreeSub")}
          />
          <div className={styles.pledgeActions}>
            <Button variant="ghost" disabled={isBusy} onClick={closePledge}>
              {t("members:places.ownerOffers.pledgeBackCta")}
            </Button>
            <Button
              variant="primary"
              disabled={isBusy || !isBaselineAgreed}
              onClick={() => onAnswer(offer, true)}
            >
              {t("members:places.ownerOffers.pledgeAcceptCta")}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
