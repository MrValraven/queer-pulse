import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Modal } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isPaymentCodeRefusal,
  priceChangedPriceOf,
  type StudioBuyerPurchaseView,
  type StudioOfferView,
  type StudioPriceView,
} from "./api/studioPurchases.adapters";
import { useStudioPurchaseMutations } from "./api/useStudioPurchaseMutations";
import { useStudioPurchaseReference } from "./api/useStudioPurchaseReference";
import { StudioBuyAmountField } from "./StudioBuyAmountField";
import { StudioBuyPaymentStep } from "./StudioBuyPaymentMethods";
import {
  StudioBuyFooter,
  StudioBuyNotice,
  StudioBuyPayerField,
  type StudioBuyFailure,
} from "./StudioBuySheetParts";
import { StudioBuyWallFields } from "./StudioBuyWallFields";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  amountErrorKeyOf,
  centsFromEuroText,
  euroTextFromCents,
} from "./studioPurchaseRules";
import styles from "./StudioBuySheet.module.css";

interface StudioBuySheetProps {
  offer: StudioOfferView;
  /** After the dialog's exit, when the buyer closed it. */
  onClose: () => void;
  /** The new pending purchase, after the exit; the host announces it. */
  onPurchased: (purchase: StudioBuyerPurchaseView) => void;
}

/** Escape, the scrim and Close wait while "I've paid" is in flight, so a
 *  claim that lands always reaches the host as `onPurchased`. */
function holdCloseWhileClaiming() {}
/** Hosts mount priced offers only; the server names any refusal. */
const UNPRICED: StudioPriceView = { mode: "name_your_price", amountCents: 0 };

/** The buy sheet: a dialog on desktop, a bottom sheet on phones. Owns its
 *  presence, so the exit plays before the host hears of it. Opening it
 *  records nothing; the purchase exists once "I've paid" succeeds. */
export function StudioBuySheet({
  offer,
  onClose,
  onPurchased,
}: StudioBuySheetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const purchasedRef = useRef<StudioBuyerPurchaseView | null>(null);
  const handleExitComplete = () => {
    const purchase = purchasedRef.current;
    if (purchase) onPurchased(purchase);
    else onClose();
  };
  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && (
        <StudioBuyDialog
          offer={offer}
          onClose={() => setIsOpen(false)}
          onPurchased={(purchase) => {
            purchasedRef.current = purchase;
            setIsOpen(false);
          }}
        />
      )}
    </AnimatePresence>
  );
}

function StudioBuyDialog({ offer, onClose, onPurchased }: StudioBuySheetProps) {
  const { t } = useTranslation();
  // One fresh code per opening; fetching it records nothing.
  const paymentReference = useStudioPurchaseReference();
  const { create } = useStudioPurchaseMutations();
  const decimalSeparator = useFormat().number(1.5).includes(",") ? "," : ".";
  const [price, setPrice] = useState(offer.price ?? UNPRICED);
  const [amountText, setAmountText] = useState(() =>
    euroTextFromCents(price.amountCents, decimalSeparator),
  );
  const [payerName, setPayerName] = useState("");
  const [isOnWall, setIsOnWall] = useState(false);
  const [shownAs, setShownAs] = useState<string | null>(null);
  const [amountErrorKey, setAmountErrorKey] = useState<string | null>(null);
  const [failure, setFailure] = useState<StudioBuyFailure>({
    line: "",
    isShown: false,
    canRequestNewCode: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const artistName = offer.artist.name;
  const { reference } = paymentReference;
  const isReferenceReady = paymentReference.status === "ready";
  const typedCents = centsFromEuroText(amountText);
  const showFailure = (reasonKey: string, canRequestNewCode = false) => {
    const line = `${t("studio:purchase.sheet.createFailed")}. ${t(reasonKey)}`;
    setFailure({ line, isShown: true, canRequestNewCode });
  };
  const hideError = () => setFailure((shown) => ({ ...shown, isShown: false }));
  // An expired or taken code: a fresh one replaces it in the pay step.
  const requestNewCode = () => {
    hideError();
    paymentReference.requestNew();
  };
  const changeAmountText = (text: string) => {
    setAmountText(text);
    if (amountErrorKey === null) return;
    setAmountErrorKey(null);
    hideError();
  };

  async function claimPayment() {
    if (isSubmitting || reference === null || !isReferenceReady) return;
    const refusalKey = amountErrorKeyOf(price, typedCents);
    if (refusalKey !== null) {
      setAmountErrorKey(refusalKey);
      showFailure(refusalKey);
      amountInputRef.current?.focus();
      return;
    }
    // amountErrorKeyOf already refused an unreadable amount above.
    if (typedCents === null) return;
    setIsSubmitting(true);
    hideError();
    try {
      const purchase = await create({
        ...(offer.item.kind === "track"
          ? { trackId: offer.item.trackId ?? undefined }
          : { releaseId: offer.item.releaseId ?? undefined }),
        amountCents: typedCents,
        payerName: payerName.trim() || null,
        isOnWall,
        shownAsSubprofileId: isOnWall ? shownAs : null,
        referenceCode: reference.referenceCode,
        referenceToken: reference.referenceToken,
      });
      onPurchased(purchase);
    } catch (error) {
      // A 409 hands the new price; a fixed one reseeds the amount.
      const newPrice = priceChangedPriceOf(error);
      if (newPrice !== null) setPrice(newPrice);
      if (newPrice?.mode === "fixed") {
        setAmountText(
          euroTextFromCents(newPrice.amountCents, decimalSeparator),
        );
      }
      showFailure(
        studioErrorMessageKeyOf(error, "save"),
        isPaymentCodeRefusal(error),
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={t("studio:purchase.sheet.title", { title: offer.item.title })}
      eyebrow={t(offer.item.formatLabelKey)}
      sub={t("studio:purchase.sheet.sub", { artist: artistName })}
      onClose={isSubmitting ? holdCloseWhileClaiming : onClose}
      isStudioPlayerSurface
      shouldCollapseSubWithKeyboard
      footer={
        <StudioBuyFooter
          failure={failure}
          onRequestNewCode={requestNewCode}
          referenceStatus={paymentReference.status}
          isSubmitting={isSubmitting}
          onPress={() => void claimPayment()}
        />
      }
    >
      <div className={styles.body} aria-busy={isSubmitting || undefined}>
        <div className={styles.sections}>
          <StudioBuyAmountField
            price={price}
            valueText={amountText}
            onValueTextChange={changeAmountText}
            errorKey={amountErrorKey}
            isDisabled={isSubmitting}
            inputRef={amountInputRef}
          />
          <StudioBuyPaymentStep
            artistName={artistName}
            amountCents={typedCents ?? price.amountCents}
            methods={offer.paymentMethods}
            paymentReference={paymentReference}
          />
          <StudioBuyPayerField
            artistName={artistName}
            value={payerName}
            onChange={setPayerName}
            isDisabled={isSubmitting}
          />
          <StudioBuyWallFields
            artistName={artistName}
            isOnWall={isOnWall}
            onIsOnWallChange={setIsOnWall}
            options={offer.identityOptions}
            shownAsSubprofileId={shownAs}
            onShownAsChange={setShownAs}
          />
        </div>
        <StudioBuyNotice artistName={artistName} />
      </div>
    </Modal>
  );
}
