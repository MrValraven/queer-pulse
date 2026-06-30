import { FiX } from "react-icons/fi";
import type { BudgetRow } from "./microGrants.data";
import styles from "./MicroGrantsPage.module.css";

/* Step 3 — budget */
export function BudgetStep({
  rows,
  total,
  addRow,
  removeRow,
  updateRow,
}: {
  rows: BudgetRow[];
  total: number;
  addRow: () => void;
  removeRow: (id: number) => void;
  updateRow: (id: number, field: "item" | "amount", val: string) => void;
}) {
  return (
    <>
      <div className={styles.stepTitle}>
        How will you <em>spend it?</em>
      </div>
      <p className={styles.stepSub}>
        Break your budget into line items. Be realistic — the panel prefers
        honest estimates to optimistic ones. Maximum €2,000 this round.
      </p>
      <div className={styles.budgetItems}>
        {rows.map((r) => (
          <div className={styles.budgetRow} key={r.id}>
            <input
              className={styles.input}
              placeholder="Line item (e.g. Print costs)"
              value={r.item}
              onChange={(e) => updateRow(r.id, "item", e.target.value)}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="€"
              min={0}
              max={2000}
              value={r.amount}
              onChange={(e) => updateRow(r.id, "amount", e.target.value)}
            />
            <button
              type="button"
              className={styles.remove}
              onClick={() => removeRow(r.id)}
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addItem} onClick={addRow}>
        + Add line item
      </button>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total requested</span>
        <span
          className={[styles.totalVal, total > 2000 && styles.totalValOver]
            .filter(Boolean)
            .join(" ")}
        >
          €{total.toFixed(0)}
        </span>
      </div>
      <div className={styles.hint}>
        If you're also contributing your own time or money, mention it below —
        it strengthens the application.
      </div>
      <label className={styles.label}>Other contributions (optional)</label>
      <input
        className={styles.input}
        type="text"
        placeholder="e.g. 20 hours of my own time, use of a friend's studio"
      />
    </>
  );
}
