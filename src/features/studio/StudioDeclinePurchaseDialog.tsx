import { useId, useState } from "react";
import {
  Collapse,
  ConfirmDialog,
  RadioCardGroup,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSellerPurchaseView } from "./api/studioPurchases.adapters";
import type {
  DeclineStudioPurchaseBody,
  StudioPurchaseDeclineReason,
} from "./api/studioPurchases.types";
import css from "./StudioPayments.module.css";

const DECLINE_REASONS: readonly StudioPurchaseDeclineReason[] = [
  "payment_not_found",
  "amount_different",
  "other",
];
const NOTE_MAX_LENGTH = 200;

/** Decline a claimed payment: one of three reasons and an optional note the
 *  buyer reads in their notification. Mounted while `purchase` is set; the
 *  caller wraps it in `AnimatePresence`, so it folds out on close. A failed
 *  decline keeps the dialog open with the reason and note as picked, and
 *  `errorMessage` names why at the top of the dialog. */
export function StudioDeclinePurchaseDialog({
  purchase,
  isDeclining,
  onClose,
  onDecline,
  errorMessage = null,
}: {
  purchase: StudioSellerPurchaseView | null;
  isDeclining: boolean;
  /** The failed decline's action line and reason; null hides it. */
  errorMessage?: string | null;
  onClose: () => void;
  onDecline: (body: DeclineStudioPurchaseBody) => void;
}) {
  const { t } = useTranslation();
  const legendId = useId();
  const [reason, setReason] =
    useState<StudioPurchaseDeclineReason>("payment_not_found");
  const [note, setNote] = useState("");
  // The last line stays through the alert's fold, so the box never empties
  // as it closes.
  const [shownErrorMessage, setShownErrorMessage] = useState(errorMessage);
  if (errorMessage !== null && errorMessage !== shownErrorMessage)
    setShownErrorMessage(errorMessage);
  const buyerName =
    purchase?.buyer?.name ?? t("studio:purchase.inbox.deletedAccount");
  return (
    <ConfirmDialog
      open={purchase !== null}
      onClose={() => {
        if (!isDeclining) onClose();
      }}
      onConfirm={() =>
        onDecline({ reason, note: note.trim() === "" ? null : note.trim() })
      }
      loading={isDeclining}
      tone="destructive"
      title={t("studio:purchase.decline.title")}
      description={t("studio:purchase.decline.body", { name: buyerName })}
      confirmLabel={t("studio:purchase.decline.confirm")}
      cancelLabel={t("studio:purchase.decline.keep")}
      reason={{
        value: note,
        onChange: setNote,
        label: t("studio:purchase.decline.noteLabel", { name: buyerName }),
        placeholder: t("studio:purchase.decline.notePlaceholder"),
        maxLength: NOTE_MAX_LENGTH,
      }}
    >
      <Collapse isOpen={errorMessage !== null}>
        <p className={css.alert} role="alert">
          {shownErrorMessage}
        </p>
      </Collapse>
      <p id={legendId} className={css.reasonLegend}>
        {t("studio:purchase.decline.reasonLegend")}
      </p>
      <RadioCardGroup
        value={reason}
        onChange={setReason}
        ariaLabel={t("studio:purchase.decline.reasonLegend")}
        ariaLabelledBy={legendId}
        className={css.reasons}
        optionClassName={css.reasonCard}
        checkedClassName={css.reasonCardOn}
        options={DECLINE_REASONS.map((option) => ({
          id: option,
          render: (
            <>
              <span className={css.reasonDot} aria-hidden />
              <span>{t(`studio:purchase.decline.reason.${option}`)}</span>
            </>
          ),
        }))}
      />
    </ConfirmDialog>
  );
}
