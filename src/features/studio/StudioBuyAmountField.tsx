import { useId, useState, type Ref } from "react";
import { Button, Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPriceView } from "./api/studioPurchases.adapters";
import { StudioEuroAmount } from "./StudioEuroAmount";
import {
  STUDIO_PURCHASE_LIMITS,
  centsFromEuroText,
  euroTextFromCents,
  quickPickAmountsCents,
} from "./studioPurchaseRules";
import styles from "./StudioBuySheet.module.css";

interface StudioBuyAmountFieldProps {
  price: StudioPriceView;
  valueText: string;
  onValueTextChange: (text: string) => void;
  /** The refusal's catalog key, shown under the input; null when none. */
  errorKey: string | null;
  isDisabled: boolean;
  /** The amount input, so the sheet can send focus to a refused amount. */
  inputRef?: Ref<HTMLInputElement>;
}

/** The buy sheet's amount: a fixed price reads as text; name your price
 *  offers the minimum and two higher quick picks, then a euro input with its
 *  range and the reason a typed amount is refused. */
export function StudioBuyAmountField({
  price,
  valueText,
  onValueTextChange,
  errorKey,
  isDisabled,
  inputRef,
}: StudioBuyAmountFieldProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const isFixed = price.mode === "fixed";
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionHeading}>
        {t("studio:purchase.sheet.amountHeading")}
      </h3>
      <Collapse isOpen={isFixed}>
        <p className={styles.fixedAmount}>
          <StudioEuroAmount value={price.amountCents / 100} />
        </p>
      </Collapse>
      <Collapse isOpen={!isFixed}>
        <NameYourPriceInput
          minimumCents={price.amountCents}
          valueText={valueText}
          onValueTextChange={onValueTextChange}
          errorKey={errorKey}
          isDisabled={isDisabled}
          inputRef={inputRef}
        />
      </Collapse>
    </section>
  );
}

function NameYourPriceInput({
  minimumCents,
  valueText,
  onValueTextChange,
  errorKey,
  isDisabled,
  inputRef,
}: Omit<StudioBuyAmountFieldProps, "price"> & { minimumCents: number }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const hintId = useId();
  const errorId = useId();
  // PT writes the euro mark after the amount ("5 €"), EN before ("€5").
  const isEuroMarkAfter = !fmt.currency(0).startsWith("€");
  const decimalSeparator = fmt.number(1.5).includes(",") ? "," : ".";
  const currentCents = centsFromEuroText(valueText);
  // The line keeps its last words while it folds away.
  const [shownErrorKey, setShownErrorKey] = useState(errorKey);
  if (errorKey !== null && errorKey !== shownErrorKey)
    setShownErrorKey(errorKey);
  const describedBy = errorKey !== null ? `${hintId} ${errorId}` : hintId;
  return (
    <>
      <div
        className={styles.quickPicks}
        role="group"
        aria-label={t("studio:purchase.sheet.quickPicksLabel")}
      >
        {quickPickAmountsCents(minimumCents).map((pickCents) => {
          const isPressed = currentCents === pickCents;
          return (
            <Button
              key={pickCents}
              variant={isPressed ? "primary" : "ghost"}
              className={styles.quickPick}
              aria-pressed={isPressed}
              disabled={isDisabled}
              onClick={() =>
                onValueTextChange(
                  euroTextFromCents(pickCents, decimalSeparator),
                )
              }
            >
              <StudioEuroAmount value={pickCents / 100} />
            </Button>
          );
        })}
      </div>
      <div className={styles.amountRow}>
        {!isEuroMarkAfter && <span aria-hidden>€</span>}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          maxLength={9}
          aria-label={t("studio:purchase.sheet.amountLabel")}
          aria-describedby={describedBy}
          aria-invalid={errorKey !== null || undefined}
          value={valueText}
          disabled={isDisabled}
          onChange={(event) => onValueTextChange(event.target.value)}
        />
        {isEuroMarkAfter && <span aria-hidden>€</span>}
      </div>
      <p id={hintId} className={styles.hint}>
        <Translation
          i18nKey="studio:purchase.sheet.amountHint"
          slots={{
            minimum: <StudioEuroAmount value={minimumCents / 100} />,
            cap: (
              <StudioEuroAmount
                value={STUDIO_PURCHASE_LIMITS.amountMaxCents / 100}
              />
            ),
          }}
        />
      </p>
      <Collapse isOpen={errorKey !== null}>
        <p id={errorId} className={styles.fieldError}>
          {shownErrorKey !== null && t(shownErrorKey)}
        </p>
      </Collapse>
    </>
  );
}
