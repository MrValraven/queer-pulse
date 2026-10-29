import { useId, useState, type Ref } from "react";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioPaymentMethods } from "./api/useStudioPaymentMethods";
import type { StudioPriceMode } from "./api/studio.types";
import { STUDIO_PURCHASE_LIMITS } from "./studioPurchaseRules";
import { studioGettingPaidPath } from "./studioPaths";
import type { StudioPriceFormMode } from "./studioUploadDraft.data";
import { StudioUploadRadioCards } from "./StudioUploadRadioCards";
import css from "./StudioPriceFields.module.css";
import fieldStyles from "./StudioTrackFields.module.css";

/** The release price field's id; the error summary links to it. */
export const STUDIO_RELEASE_PRICE_FIELD_ID = "release-price";

const PRICE_FORM_MODES: readonly StudioPriceFormMode[] = [
  "not_for_sale",
  "fixed",
  "name_your_price",
];

/** Whole euros drop the cents, as StudioEuroAmount does. */
function euroLabelOf(fmt: Formatters, cents: number): string {
  const euros = cents / 100;
  const fractionDigits = Number.isInteger(euros) ? 0 : 2;
  return fmt.currency(euros, "EUR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

interface StudioPriceFieldsProps {
  /** The amount input's id; the error summary links to it. */
  amountInputId: string;
  legendKey:
    "studio:purchase.price.legend" | "studio:purchase.price.trackLegend";
  priceMode: StudioPriceFormMode;
  priceText: string;
  onPriceModeChange: (mode: StudioPriceFormMode) => void;
  onPriceTextChange: (text: string) => void;
  /** A catalog key, shown once the member tried to save; null otherwise. */
  errorKey: string | null;
  subprofileId: string;
  /** False for a draft or scheduled release: "Buying opens once the release is out". */
  isReleaseOut: boolean;
  amountInputRef?: Ref<HTMLInputElement>;
}

/** How an item sells: not for sale, a fixed price, or a minimum buyers can
 *  pay more than. The two price modes wait until the persona has a way to
 *  get paid, and the amount shows only for a price. */
export function StudioPriceFields({
  amountInputId,
  legendKey,
  priceMode,
  priceText,
  onPriceModeChange,
  onPriceTextChange,
  errorKey,
  subprofileId,
  isReleaseOut,
  amountInputRef,
}: StudioPriceFieldsProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const legendId = useId();
  const needsMethodsId = useId();
  const errorId = useId();
  const { paymentMethods } = useStudioPaymentMethods(
    subprofileId === "" ? null : subprofileId,
  );
  const isMethodsMissing =
    paymentMethods !== null && paymentMethods.methods.length === 0;
  const isPriceMode = priceMode !== "not_for_sale";
  // The amount keeps its label and hint while the field folds away.
  const [shownMode, setShownMode] = useState<StudioPriceMode>(
    priceMode === "not_for_sale" ? "fixed" : priceMode,
  );
  if (priceMode !== "not_for_sale" && priceMode !== shownMode)
    setShownMode(priceMode);
  const [shownErrorKey, setShownErrorKey] = useState(errorKey);
  if (errorKey !== null && errorKey !== shownErrorKey)
    setShownErrorKey(errorKey);
  const lowestCents =
    shownMode === "fixed"
      ? STUDIO_PURCHASE_LIMITS.fixedPriceMinCents
      : STUDIO_PURCHASE_LIMITS.minimumPriceMinCents;

  return (
    <fieldset className={css.fieldset}>
      <legend id={legendId} className={css.legend}>
        {t(legendKey)}
      </legend>
      <div className={css.modes}>
        <StudioUploadRadioCards
          legendId={legendId}
          describedBy={isMethodsMissing ? needsMethodsId : undefined}
          value={priceMode}
          onChange={onPriceModeChange}
          options={PRICE_FORM_MODES.map((mode) => ({
            id: mode,
            label: t(`studio:purchase.price.mode.${mode}`),
            isDisabled: mode !== "not_for_sale" && isMethodsMissing,
          }))}
        />
      </div>
      <Collapse isOpen={isMethodsMissing}>
        <div className={css.needsMethods}>
          <p id={needsMethodsId} className={css.note}>
            {t("studio:purchase.price.needsMethods")}
          </p>
          <Button variant="quiet" to={studioGettingPaidPath(subprofileId)}>
            {t("studio:purchase.price.needsMethodsCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={isPriceMode}>
        <FormField
          className={`${fieldStyles.studioField} ${css.amountField}`}
          label={t(`studio:purchase.price.amountLabel.${shownMode}`)}
          helper={t(`studio:purchase.price.hint.${shownMode}`, {
            minimum: euroLabelOf(fmt, lowestCents),
            cap: euroLabelOf(fmt, STUDIO_PURCHASE_LIMITS.priceMaxCents),
          })}
        >
          <input
            id={amountInputId}
            ref={amountInputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={priceText}
            aria-invalid={errorKey ? true : undefined}
            aria-describedby={errorKey ? errorId : undefined}
            onChange={(event) => onPriceTextChange(event.target.value)}
          />
        </FormField>
        {/* No alert of its own: the summary announces, and focus on the
            amount reads this line through aria-describedby. */}
        <Collapse isOpen={errorKey !== null}>
          <p id={errorId} className={css.error}>
            {shownErrorKey ? t(shownErrorKey) : null}
          </p>
        </Collapse>
      </Collapse>
      <Collapse isOpen={isPriceMode && !isReleaseOut}>
        <p className={css.note}>{t("studio:purchase.price.notOutNote")}</p>
      </Collapse>
      <p className={css.note}>{t("studio:purchase.price.directNote")}</p>
    </fieldset>
  );
}
