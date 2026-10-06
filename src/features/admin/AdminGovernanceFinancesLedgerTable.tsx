import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  LedgerRow,
  type LedgerColumns,
} from "./AdminGovernanceFinancesLedgerRow";
import { lossClass } from "./adminGovernanceFinancesEditRow";
import {
  parseNumber,
  sumEnabledLines,
  type LineDraft,
} from "./adminGovernanceFinancesEdit.utils";
import type { AdminFinLine } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/** One ledger (income or spending) as a table: a row per line with its
 *  visibility switch, name, provenance, stored amount, new amount and note.
 *  PRD-447: the name is editable and "Add a line" appends a row, so a newly
 *  opened quarter can be filled in with no SQL. With `hasBreakdown` (the
 *  spending ledger) each line can also be split into items. */
export function LedgerTable({
  titleKey,
  lines,
  original,
  onChange,
  onAdd,
  isSpending = false,
  hasBreakdown = false,
}: {
  titleKey: string;
  lines: LineDraft[];
  original: AdminFinLine[];
  onChange: (index: number, patch: Partial<LineDraft>) => void;
  onAdd: () => void;
  /** The spending ledger: every amount reads in red. */
  isSpending?: boolean;
  /** Each line gets a "Breakdown" item editor. */
  hasBreakdown?: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const shownCount = lines.filter((line) => line.enabled).length;
  // Whole euros read without decimals, the same as a line's breakdown sum.
  const formatEuros = (value: number): string =>
    fmt.currency(
      value,
      "EUR",
      Number.isInteger(value) ? { maximumFractionDigits: 0 } : undefined,
    );
  // Stored amounts are pre-formatted strings ("€1,840" from the seed, "23150"
  // from demo mode); show them in the reader's locale when they parse.
  const formatStored = (amount: string): string => {
    const parsed = parseNumber(amount);
    return parsed === undefined ? amount : formatEuros(parsed);
  };
  const columns: LedgerColumns = {
    shown: t("admin:governance.finances.edit.col.shown"),
    line: t("admin:governance.finances.edit.col.line"),
    source: t("admin:governance.finances.edit.col.source"),
    current: t("admin:governance.finances.edit.col.current"),
    newAmount: t("admin:governance.finances.edit.col.newAmount"),
    note: t("admin:governance.finances.edit.col.note"),
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h4 className={styles.sectionTitle}>{t(`admin:${titleKey}`)}</h4>
        <span className={styles.sectionMeta}>
          {t("admin:governance.finances.edit.foot.shownCount", {
            shown: shownCount,
            total: lines.length,
          })}
        </span>
      </div>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableLedger}`}>
          <thead>
            <tr>
              <th scope="col" className={styles.colShown}>
                {columns.shown}
              </th>
              <th scope="col">{columns.line}</th>
              <th scope="col">{columns.source}</th>
              <th scope="col" className={styles.colNumber}>
                {columns.current}
              </th>
              <th scope="col">{columns.newAmount}</th>
              <th scope="col" className={styles.colNote}>
                {columns.note}
              </th>
            </tr>
          </thead>
          {/* Each line renders its own <tbody>, grouping it with its
              breakdown rows. */}
          {lines.map((line, index) => (
            <LedgerRow
              key={index}
              line={line}
              index={index}
              source={original[index]}
              columns={columns}
              isSpending={isSpending}
              hasBreakdown={hasBreakdown}
              formatStored={formatStored}
              onChange={(patch) => onChange(index, patch)}
            />
          ))}
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className={styles.footLabel}>
                {t("admin:governance.finances.edit.foot.sumShown")}
              </th>
              <td colSpan={3} className={lossClass(styles.footSum, isSpending)}>
                {formatEuros(sumEnabledLines(lines))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <FiPlus aria-hidden />
          {t("admin:governance.finances.edit.addLine")}
        </Button>
      </div>
    </section>
  );
}
