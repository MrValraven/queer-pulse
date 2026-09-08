import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { parseAmountInput } from "./adminFinanceAmount";
import { isAmountRejected } from "./adminGovernanceFinancesEdit.utils";
import styles from "./AdminGovernanceFinancesEdit.module.css";

export type AmountUnit = "currency" | "count" | "percent";

/**
 * A money/number cell that accepts whatever notation the admin actually
 * types. `type="text"` is deliberate: a native number input throws away
 * "1.840,50" before React ever sees it, which is how a Portuguese admin used
 * to lose an edit without being told. The inline error lives in the same
 * cell, so the field that is wrong is the field that says so.
 */
export function AmountInput({
  ariaLabel,
  value,
  onChange,
  isBlankAllowed,
  disabled = false,
  unit,
}: {
  ariaLabel: string;
  value: string;
  onChange: (next: string) => void;
  isBlankAllowed: boolean;
  disabled?: boolean;
  unit: AmountUnit;
}) {
  const { t } = useTranslation();
  const errorId = useId();
  const status = parseAmountInput(value).status;
  const isRejected = !disabled && isAmountRejected(value, isBlankAllowed);
  const adornment = unit === "currency" ? "€" : unit === "percent" ? "%" : "";

  return (
    <div className={styles.amountCell}>
      <div
        className={[
          styles.amountWrap,
          unit === "currency" && styles.amountWrapPrefix,
          unit === "percent" && styles.amountWrapSuffix,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {adornment && (
          <span className={styles.amountUnit} aria-hidden>
            {adornment}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={styles.amountInput}
          aria-label={ariaLabel}
          aria-invalid={isRejected || undefined}
          aria-describedby={isRejected ? errorId : undefined}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {isRejected && (
        <p id={errorId} className={styles.cellError}>
          {t(
            status === "blank"
              ? "admin:governance.finances.edit.field.amountRequired"
              : "admin:governance.finances.edit.field.amountInvalid",
          )}
        </p>
      )}
    </div>
  );
}
