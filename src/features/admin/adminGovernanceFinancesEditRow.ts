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
