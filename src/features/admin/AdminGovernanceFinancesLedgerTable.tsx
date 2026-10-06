import { FiPlus } from "react-icons/fi";
import { Button, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import { AmountInput } from "./AdminGovernanceFinancesEditCells";
import { rowClass } from "./adminGovernanceFinancesEditRow";
import {
  isLineChanged,
  parseNumber,
  sumEnabledLines,
  type LineDraft,
} from "./adminGovernanceFinancesEdit.utils";
import type { AdminFinLine } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/** One ledger (income or spending) as a table: a row per line with its
 *  visibility switch, name, provenance, stored amount, new amount and note.
 *  PRD-447: the name is editable and "Add a line" appends a row, so a newly
 *  opened quarter can be filled in with no SQL. */
export function LedgerTable({
  titleKey,
  lines,
  original,
  onChange,
  onAdd,
}: {
  titleKey: string;
  lines: LineDraft[];
  original: AdminFinLine[];
  onChange: (index: number, patch: Partial<LineDraft>) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const shownCount = lines.filter((line) => line.enabled).length;
  // Stored amounts are pre-formatted strings ("€1,840" from the seed, "23150"
  // from demo mode); show them in the reader's locale when they parse.
  const formatStored = (amount: string): string => {
    const parsed = parseNumber(amount);
    return parsed === undefined ? amount : fmt.currency(parsed, "EUR");
  };
  const columns = {
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
          <tbody>
            {lines.map((line, index) => {
              const source = original[index];
              const isChanged = source ? isLineChanged(line, source) : true;
              // Names every control on the row for assistive tech, including
              // a just-added row that has no name yet.
              const rowName =
                line.label.trim() ||
                t("admin:governance.finances.edit.field.newLine", {
                  position: index + 1,
                });
              return (
                <tr key={index} className={rowClass(isChanged, !line.enabled)}>
                  <td data-label={columns.shown} className={styles.colShown}>
                    <Toggle
                      checked={line.enabled}
                      onChange={(enabled) => onChange(index, { enabled })}
                      label={t(
                        "admin:governance.finances.edit.field.lineEnabled",
                        { label: rowName },
                      )}
                    />
                  </td>
                  <th scope="row" data-label={columns.line}>
                    <input
                      type="text"
                      className={styles.noteInput}
                      aria-label={t(
                        "admin:governance.finances.edit.aria.lineName",
                        { position: index + 1 },
                      )}
                      aria-invalid={!line.label.trim() || undefined}
                      value={line.label}
                      maxLength={80}
                      onChange={(event) =>
                        onChange(index, { label: event.target.value })
                      }
                    />
                    {!line.enabled && (
                      <span className={styles.rowHint}>
                        {t(
                          "admin:governance.finances.edit.field.lineDisabledHint",
                        )}
                      </span>
                    )}
                  </th>
                  <td data-label={columns.source}>
                    <FinanceSourceBadge source={source?.source ?? "manual"} />
                  </td>
                  <td data-label={columns.current} className={styles.colNumber}>
                    {source ? formatStored(source.amount) : ""}
                  </td>
                  <td data-label={columns.newAmount}>
                    <AmountInput
                      ariaLabel={t(
                        "admin:governance.finances.edit.aria.newAmount",
                        { label: rowName },
                      )}
                      value={line.amount}
                      isBlankAllowed={false}
                      disabled={!line.enabled}
                      unit="currency"
                      onChange={(amount) => onChange(index, { amount })}
                    />
                  </td>
                  <td data-label={columns.note} className={styles.colNote}>
                    <input
                      type="text"
                      className={styles.noteInput}
                      aria-label={t(
                        "admin:governance.finances.edit.aria.note",
                        { label: rowName },
                      )}
                      value={line.note}
                      disabled={!line.enabled}
                      onChange={(event) =>
                        onChange(index, { note: event.target.value })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className={styles.footLabel}>
                {t("admin:governance.finances.edit.foot.sumShown")}
              </th>
              <td colSpan={3} className={styles.footSum}>
                {fmt.currency(sumEnabledLines(lines), "EUR")}
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
