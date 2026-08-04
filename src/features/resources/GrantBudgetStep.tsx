import { useId } from "react";
import { FiX } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="resources:microGrants.apply.budget.stepTitle"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>
        {t("resources:microGrants.apply.budget.stepSub")}
      </p>
      <div className={styles.budgetItems}>
        {rows.map((r) => (
          <div className={styles.budgetRow} key={r.id}>
            <input
              className={styles.input}
              placeholder={t(
                "resources:microGrants.apply.budget.itemPlaceholder",
              )}
              aria-label={t("resources:microGrants.apply.budget.itemPlaceholder")}
              value={r.item}
              onChange={(e) => updateRow(r.id, "item", e.target.value)}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="€"
              aria-label={t("gatherings:checkout.payment.multibancoAmountLabel")}
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
        {t("resources:microGrants.apply.budget.addItemCta")}
      </button>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>
          {t("resources:microGrants.apply.budget.totalLabel")}
        </span>
        <span
          className={[styles.totalVal, total > 2000 && styles.totalValOver]
            .filter(Boolean)
            .join(" ")}
        >
          €{total.toFixed(0)}
        </span>
      </div>
      <div className={styles.hint}>
        {t("resources:microGrants.apply.budget.hint")}
      </div>
      <label className={styles.label} htmlFor={`${fieldId}-other`}>
        {t("resources:microGrants.apply.budget.otherContributionsLabel")}
      </label>
      <input
        id={`${fieldId}-other`}
        className={styles.input}
        type="text"
        placeholder={t(
          "resources:microGrants.apply.budget.otherContributionsPlaceholder",
        )}
      />
    </>
  );
}
