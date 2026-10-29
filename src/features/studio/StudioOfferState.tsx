import { useState, type Ref } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioOfferView,
  StudioPriceView,
} from "./api/studioPurchases.adapters";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { studioErrorMessageKey } from "./studioErrors.data";
import { StudioOfferOwned } from "./StudioOfferOwned";
import {
  StudioOfferCancelDialog,
  StudioOfferPending,
} from "./StudioOfferPending";
import { studioPaymentsPath } from "./studioPaths";
import {
  buyLabelKeyOf,
  isSoldTrackByTrack,
  offerPanelStateOf,
} from "./studioPurchaseRules";
import styles from "./StudioBuyPanel.module.css";

/** The last value that was present, so a block keeps its words while it
 *  folds away after the value turns null. Shared by the buy panels. */
// eslint-disable-next-line react-refresh/only-export-components -- the buy panels' one copy; a hook file would sit outside this task's files
export function useLastPresent<Value>(value: Value | null): Value | null {
  const [lastValue, setLastValue] = useState(value);
  if (value !== null && value !== lastValue) setLastValue(value);
  return value ?? lastValue;
}

/** The price line, folding in and out with the price: a fixed price, or
 *  "Name your price, {minimum} or more". Its spacing folds with it. */
function StudioOfferPrice({ price }: { price: StudioPriceView | null }) {
  const shownPrice = useLastPresent(price);
  const cents = shownPrice?.amountCents ?? 0;
  const amount = <StudioEuroAmount value={cents / 100} />;
  return (
    <Collapse isOpen={price !== null}>
      {shownPrice?.mode === "fixed" && (
        <p className={`${styles.price} ${styles.priceSlot}`}>{amount}</p>
      )}
      {shownPrice?.mode === "name_your_price" && (
        <p className={`${styles.priceNamed} ${styles.priceSlot}`}>
          <Translation
            i18nKey="studio:purchase.price.nameYourPrice"
            slots={{ amount }}
          />
        </p>
      )}
    </Collapse>
  );
}

function StudioOfferCanBuy({
  offer,
  onBuy,
  buyButtonRef,
}: {
  offer: StudioOfferView;
  onBuy: () => void;
  buyButtonRef?: Ref<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  const buyLabel = t(buyLabelKeyOf(offer.item));
  return (
    <div className={styles.stack}>
      <StudioOfferPrice price={offer.price} />
      <div className={styles.block}>
        <Button
          ref={buyButtonRef}
          variant="primary"
          className={styles.buyButton}
          aria-label={t("studio:purchase.panel.buyAria", {
            action: buyLabel,
            title: offer.item.title,
            artist: offer.artist.name,
          })}
          onClick={onBuy}
        >
          {buyLabel}
        </Button>
        <p className={styles.note}>
          {t("studio:purchase.panel.directNote", { artist: offer.artist.name })}
        </p>
      </div>
    </div>
  );
}

/** A refusal names its own reason (a block reads the one neutral line); the
 *  artist's own page links to the payments to confirm. A release sold track
 *  by track points to its tracklist; the two lines fold into each other. */
function StudioOfferRefused({ offer }: { offer: StudioOfferView }) {
  const { t } = useTranslation();
  const refusalCode = useLastPresent(offer.viewer.refusalCode);
  const isTracksOnly = isSoldTrackByTrack(offer);
  return (
    <div className={styles.stack}>
      <StudioOfferPrice price={offer.price} />
      <div className={styles.block}>
        <div>
          <Collapse isOpen={isTracksOnly}>
            <p className={styles.refusal}>
              {t("studio:purchase.panel.tracksOnly")}
            </p>
          </Collapse>
          <Collapse isOpen={!isTracksOnly}>
            <p className={styles.refusal}>
              {t(studioErrorMessageKey(refusalCode))}
            </p>
          </Collapse>
        </div>
        {refusalCode === "studio_purchase_own_persona" && (
          <Link
            to={studioPaymentsPath(offer.artist.id)}
            className={styles.quietLink}
          >
            {t("studio:purchase.panel.ownPersonaLink")}
            <FiArrowRight aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

/** What the panel shows for the offer's display state; Buy opens the sheet
 *  through onBuy. Each state sits in its own Collapse, so a change (bought,
 *  cancelled, confirmed) folds one block away and the next one in. The
 *  viewer's own persona wins first, then an owned item, so an item taken
 *  off sale still shows its download. The cancel dialog sits outside the
 *  pending block, so a successful cancel never unmounts it mid-exit. */
export function StudioOfferState({
  offer,
  variant,
  onBuy,
  buyButtonRef,
  onAnnounce,
}: {
  offer: StudioOfferView;
  variant: "release" | "track";
  onBuy: () => void;
  buyButtonRef?: Ref<HTMLButtonElement>;
  /** The host's status region: a cancelled claim says so there, since the
   *  pending block folds away with its own words. */
  onAnnounce?: (line: string) => void;
}) {
  const displayState = offerPanelStateOf(offer.viewer);
  const pendingPurchase = useLastPresent(offer.viewer.pendingPurchase);
  const ownedPurchase = useLastPresent(offer.viewer.ownedPurchase);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const isPending =
    displayState === "pending" && offer.viewer.pendingPurchase !== null;
  return (
    <div className={styles.states}>
      <Collapse isOpen={displayState === "can_buy"}>
        <StudioOfferCanBuy
          offer={offer}
          onBuy={onBuy}
          buyButtonRef={buyButtonRef}
        />
      </Collapse>
      <Collapse isOpen={isPending}>
        {pendingPurchase !== null && (
          <StudioOfferPending
            offer={offer}
            purchase={pendingPurchase}
            variant={variant}
            onCancelRequest={() => setIsCancelOpen(true)}
          />
        )}
      </Collapse>
      {pendingPurchase !== null && (
        <StudioOfferCancelDialog
          purchaseId={pendingPurchase.id}
          artistName={offer.artist.name}
          isOpen={isCancelOpen}
          isClaimShown={isPending}
          onClose={() => setIsCancelOpen(false)}
          onAnnounce={onAnnounce}
        />
      )}
      <Collapse isOpen={displayState === "owned"}>
        {ownedPurchase !== null && (
          <StudioOfferOwned purchase={ownedPurchase} variant={variant} />
        )}
      </Collapse>
      <Collapse isOpen={displayState === "refused"}>
        <StudioOfferRefused offer={offer} />
      </Collapse>
    </div>
  );
}
