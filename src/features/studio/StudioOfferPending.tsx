import { useId, useState } from "react";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioBuyerPurchaseView,
  StudioOfferView,
} from "./api/studioPurchases.adapters";
import { useStudioPurchaseMutations } from "./api/useStudioPurchaseMutations";
import { StudioBuyPaymentMethods } from "./StudioBuyPaymentMethods";
import { StudioCopyValueRow } from "./StudioCopyValueRow";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioPurchaseWallControl } from "./StudioPurchaseWallControl";
import styles from "./StudioBuyPanel.module.css";

/** The cancel confirmation for a pending claim, mounted by the panel
 *  outside the pending block so a successful cancel never unmounts it
 *  mid-exit. A cancelled claim is said in the host's status region; a
 *  failure names its reason under the block while the claim still shows. */
export function StudioOfferCancelDialog({
  purchaseId,
  artistName,
  isOpen,
  isClaimShown,
  onClose,
  onAnnounce,
}: {
  purchaseId: string;
  artistName: string;
  isOpen: boolean;
  isClaimShown: boolean;
  onClose: () => void;
  onAnnounce?: (line: string) => void;
}) {
  const { t } = useTranslation();
  const { cancel, isCancelling } = useStudioPurchaseMutations();
  // The line keeps its words while it folds away.
  const [failure, setFailure] = useState({ line: "", isShown: false });

  async function confirmCancel() {
    setFailure((shown) => ({ ...shown, isShown: false }));
    try {
      await cancel(purchaseId);
      onClose();
      onAnnounce?.(t("studio:purchase.cancel.done"));
    } catch (error) {
      onClose();
      const reason = t(studioErrorMessageKeyOf(error, "save"));
      setFailure({
        line: `${t("studio:purchase.cancel.failed")}. ${reason}`,
        isShown: true,
      });
    }
  }

  return (
    <>
      <Collapse isOpen={failure.isShown && isClaimShown}>
        <p role="alert" className={styles.failure}>
          {failure.line}
        </p>
      </Collapse>
      <ConfirmDialog
        open={isOpen}
        onClose={() => {
          if (!isCancelling) onClose();
        }}
        onConfirm={() => void confirmCancel()}
        title={t("studio:purchase.cancel.title")}
        description={t("studio:purchase.cancel.body", { artist: artistName })}
        confirmLabel={t("studio:purchase.cancel.confirm")}
        cancelLabel={t("studio:purchase.cancel.keep")}
        tone="destructive"
        loading={isCancelling}
      />
    </>
  );
}

/** The buyer's open claim on this item: who confirms it, the amount they
 *  said they paid, the stored payment code to copy, the ways to pay behind a
 *  disclosure, the wall choice (release panel) and the cancel action. */
export function StudioOfferPending({
  offer,
  purchase,
  variant,
  onCancelRequest,
}: {
  offer: StudioOfferView;
  purchase: StudioBuyerPurchaseView;
  variant: "release" | "track";
  /** Opens the host's StudioOfferCancelDialog; without it the block shows
   *  no cancel action. */
  onCancelRequest?: () => void;
}) {
  const { t } = useTranslation();
  const codeLineId = useId();
  const methodsId = useId();
  const [isWaysOpen, setIsWaysOpen] = useState(false);
  const artistName = offer.artist.name;
  return (
    <div className={styles.block}>
      <p className={styles.stateLine}>
        {t("studio:purchase.panel.pending", { artist: artistName })}
      </p>
      <p className={styles.note}>
        <Translation
          i18nKey="studio:purchase.panel.pendingAmount"
          slots={{
            amount: <StudioEuroAmount value={purchase.amountCents / 100} />,
          }}
        />
      </p>
      <div className={styles.code}>
        <StudioCopyValueRow
          label={t("studio:purchase.reference.label")}
          value={purchase.referenceCode}
          copyLabel={t("studio:purchase.reference.copyCta")}
          copyAriaLabel={t("studio:purchase.reference.copyAria")}
          copiedToast={t("studio:purchase.reference.copied")}
          copyFailedToast={t("studio:purchase.reference.copyFailed")}
          describedBy={codeLineId}
        />
        <p id={codeLineId} className={styles.note}>
          {t("studio:purchase.reference.line", { artist: artistName })}
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          variant="quiet"
          size="sm"
          className={styles.toggleButton}
          aria-expanded={isWaysOpen}
          aria-controls={methodsId}
          onClick={() => setIsWaysOpen((isOpen) => !isOpen)}
        >
          {isWaysOpen
            ? t("studio:purchase.panel.hideWaysToPay")
            : t("studio:purchase.panel.showWaysToPay", { artist: artistName })}
        </Button>
      </div>
      <div id={methodsId}>
        <Collapse isOpen={isWaysOpen}>
          <div className={styles.disclosed}>
            <StudioBuyPaymentMethods
              artistName={artistName}
              amountCents={purchase.amountCents}
              methods={offer.paymentMethods}
              reference={null}
            />
          </div>
        </Collapse>
      </div>
      {variant === "release" && (
        <div className={styles.wall}>
          <StudioPurchaseWallControl purchase={purchase} />
        </div>
      )}
      {onCancelRequest !== undefined && (
        <div className={styles.actions}>
          <Button
            variant="quiet"
            size="sm"
            className={styles.toggleButton}
            onClick={onCancelRequest}
          >
            {t("studio:purchase.panel.cancelCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
