import styles from "./AdminGovernanceFinancesEdit.module.css";

/** Row classes shared by the headline and ledger tables: a changed row gets
 *  the accent rail, a switched-off row is dimmed. */
export function rowClass(isChanged: boolean, isDisabled = false): string {
  return [
    styles.row,
    isChanged && styles.rowChanged,
    isDisabled && styles.rowDisabled,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Spending and negative figures read in red (`.amountLoss`). */
export function lossClass(
  baseClass: string | undefined,
  isLoss: boolean,
): string | undefined {
  return isLoss ? `${baseClass} ${styles.amountLoss}` : baseClass;
}

/** Spending is stored as a positive magnitude and read as a negative figure.
 *  Zero stays zero, so it never formats as "-€0". */
export function toSpendingFigure(magnitude: number): number {
  return magnitude === 0 ? 0 : -magnitude;
}
