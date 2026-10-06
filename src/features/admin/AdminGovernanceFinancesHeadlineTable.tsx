import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import { AmountInput } from "./AdminGovernanceFinancesEditCells";
import { lossClass, rowClass } from "./adminGovernanceFinancesEditRow";
import {
  SCALAR_KEYS,
  SCALAR_UNIT,
  isScalarChanged,
  type ScalarDrafts,
  type ScalarKey,
} from "./adminGovernanceFinancesEdit.utils";
import type { AdminFinanceLatest } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/** The five editable headline figures plus the surplus derived from two of
 *  them, one row each: what is stored, where it came from, and the new value. */
export function HeadlineTable({
  scalars,
  latest,
  onChange,
  surplusPreview,
}: {
  scalars: ScalarDrafts;
  latest: AdminFinanceLatest;
  onChange: (key: ScalarKey, value: string) => void;
  surplusPreview: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const formatCurrent = (key: ScalarKey): string => {
    const value = latest[key];
    // A figure nobody entered yet has no current value to show.
    if (value === null) return "";
    const unit = SCALAR_UNIT[key];
    if (unit === "currency") return fmt.currency(value, "EUR");
    if (unit === "percent") return `${fmt.number(value)}%`;
    return fmt.number(value);
  };
  const columns = {
    figure: t("admin:governance.finances.edit.col.figure"),
    source: t("admin:governance.finances.edit.col.source"),
    current: t("admin:governance.finances.edit.col.current"),
    newValue: t("admin:governance.finances.edit.col.newValue"),
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h4 className={styles.sectionTitle}>
          {t("admin:governance.finances.edit.section.headline")}
        </h4>
      </div>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableHeadline}`}>
          <thead>
            <tr>
              <th scope="col">{columns.figure}</th>
              <th scope="col">{columns.source}</th>
              <th scope="col" className={styles.colNumber}>
                {columns.current}
              </th>
              <th scope="col">{columns.newValue}</th>
            </tr>
          </thead>
          <tbody>
            {SCALAR_KEYS.map((key) => {
              const label = t(`admin:governance.finances.edit.field.${key}`);
              const isSpending = key === "expenseTotal";
              return (
                <tr
                  key={key}
                  className={rowClass(isScalarChanged(key, scalars, latest))}
                >
                  <th scope="row" data-label={columns.figure}>
                    <span className={styles.rowLabel}>{label}</span>
                  </th>
                  <td data-label={columns.source}>
                    <FinanceSourceBadge source={latest.sources[key]} />
                  </td>
                  <td
                    data-label={columns.current}
                    className={lossClass(styles.colNumber, isSpending)}
                  >
                    {formatCurrent(key)}
                  </td>
                  <td data-label={columns.newValue}>
                    <AmountInput
                      ariaLabel={t(
                        "admin:governance.finances.edit.aria.newValue",
                        { label },
                      )}
                      value={scalars[key]}
                      isBlankAllowed
                      unit={SCALAR_UNIT[key]}
                      isLoss={isSpending}
                      onChange={(value) => onChange(key, value)}
                    />
                  </td>
                </tr>
              );
            })}
            <tr className={`${styles.row} ${styles.rowComputed}`}>
              <th scope="row" data-label={columns.figure}>
                <span className={styles.rowLabel}>
                  {t("admin:governance.finances.edit.field.surplus")}
                </span>
                <span className={styles.rowHint}>
                  {t("admin:governance.finances.edit.field.surplusHint")}
                </span>
              </th>
              <td data-label={columns.source}>
                <FinanceSourceBadge source="computed" />
              </td>
              <td
                data-label={columns.current}
                className={lossClass(styles.colNumber, latest.surplus < 0)}
              >
                {fmt.currency(latest.surplus, "EUR")}
              </td>
              <td data-label={columns.newValue}>
                <output
                  className={lossClass(
                    styles.surplusPreview,
                    surplusPreview < 0,
                  )}
                >
                  <RollingNumber
                    value={fmt.currency(surplusPreview, "EUR")}
                    numericValue={surplusPreview}
                  />
                </output>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
