import { useId, useState } from "react";
import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import { AmountInput } from "./AdminGovernanceFinancesEditCells";
import {
  BreakdownRows,
  BreakdownToggle,
} from "./AdminGovernanceFinancesBreakdown";
import { lossClass, rowClass } from "./adminGovernanceFinancesEditRow";
import {
  breakdownPatch,
  isLineChanged,
  itemAmountError,
  sumItems,
  type ItemDraft,
  type LineDraft,
} from "./adminGovernanceFinancesEdit.utils";
import type { AdminFinLine } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/** The ledger table's column captions, repeated inline on phone cards. */
export interface LedgerColumns {
  shown: string;
  line: string;
  source: string;
  current: string;
  newAmount: string;
  note: string;
}

/** An entry the save refuses: no name, or an amount it cannot store. */
function isItemRejected(item: ItemDraft): boolean {
  return !item.name.trim() || itemAmountError(item.amount) !== null;
}

/**
 * One ledger line, in its own `<tbody>` so the line and its breakdown rows
 * group together: its visibility switch, name, provenance, stored amount, new
 * amount and note. On the spending ledger a quiet toggle under the name opens
 * the item rows underneath; while the line has items, its amount reads as
 * their live sum.
 */
export function LedgerRow({
  line,
  index,
  source,
  columns,
  isSpending,
  hasBreakdown,
  formatStored,
  onChange,
}: {
  line: LineDraft;
  index: number;
  /** The stored row; absent for a row added in this dialog. */
  source: AdminFinLine | undefined;
  columns: LedgerColumns;
  isSpending: boolean;
  hasBreakdown: boolean;
  formatStored: (amount: string) => string;
  onChange: (patch: Partial<LineDraft>) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const rowsId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const isChanged = source ? isLineChanged(line, source) : true;
  const itemCount = line.items.length;
  const hasItems = itemCount > 0;
  // Checked on a switched-off line too: it still saves its breakdown.
  const hasRejectedItem = line.items.some(isItemRejected);
  const sum = sumItems(line.items);
  const lineRowClass = rowClass(isChanged, !line.enabled);
  // Names every control on the row for assistive tech, including a
  // just-added row that has no name yet.
  const rowName =
    line.label.trim() ||
    t("admin:governance.finances.edit.field.newLine", {
      position: index + 1,
    });

  return (
    <tbody
      className={[styles.lineGroup, isChanged && styles.lineGroupChanged]
        .filter(Boolean)
        .join(" ")}
    >
      <tr
        className={[lineRowClass, hasBreakdown && styles.lineRowWithToggle]
          .filter(Boolean)
          .join(" ")}
      >
        <td data-label={columns.shown} className={styles.colShown}>
          <Toggle
            checked={line.enabled}
            onChange={(enabled) => onChange({ enabled })}
            label={t("admin:governance.finances.edit.field.lineEnabled", {
              label: rowName,
            })}
          />
        </td>
        <th scope="row" data-label={columns.line}>
          <input
            type="text"
            className={styles.noteInput}
            aria-label={t("admin:governance.finances.edit.aria.lineName", {
              position: index + 1,
            })}
            aria-invalid={!line.label.trim() || undefined}
            value={line.label}
            maxLength={80}
            onChange={(event) => onChange({ label: event.target.value })}
          />
          {!line.enabled && (
            <span className={styles.rowHint}>
              {t("admin:governance.finances.edit.field.lineDisabledHint")}
            </span>
          )}
          {hasBreakdown && (
            <BreakdownToggle
              rowsId={rowsId}
              itemCount={itemCount}
              isOpen={isExpanded}
              hasRejectedItem={hasRejectedItem}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </th>
        <td data-label={columns.source}>
          <FinanceSourceBadge source={source?.source ?? "manual"} />
        </td>
        <td
          data-label={columns.current}
          className={lossClass(styles.colNumber, isSpending)}
        >
          {source ? formatStored(source.amount) : ""}
        </td>
        <td data-label={columns.newAmount}>
          {hasItems ? (
            <div className={styles.breakdownSum}>
              <span className={lossClass(styles.breakdownSumValue, isSpending)}>
                {format.currency(
                  sum,
                  "EUR",
                  Number.isInteger(sum)
                    ? { maximumFractionDigits: 0 }
                    : undefined,
                )}
              </span>
              <span className={styles.rowHint}>
                {t("admin:governance.finances.edit.breakdown.sumCaption", {
                  count: itemCount,
                })}
              </span>
            </div>
          ) : (
            <AmountInput
              ariaLabel={t("admin:governance.finances.edit.aria.newAmount", {
                label: rowName,
              })}
              value={line.amount}
              isBlankAllowed={false}
              disabled={!line.enabled}
              unit="currency"
              isLoss={isSpending}
              onChange={(amount) => onChange({ amount })}
            />
          )}
        </td>
        <td data-label={columns.note} className={styles.colNote}>
          <input
            type="text"
            className={styles.noteInput}
            aria-label={t("admin:governance.finances.edit.aria.note", {
              label: rowName,
            })}
            value={line.note}
            disabled={!line.enabled}
            onChange={(event) => onChange({ note: event.target.value })}
          />
        </td>
      </tr>
      {hasBreakdown && (
        <BreakdownRows
          rowsId={rowsId}
          items={line.items}
          isOpen={isExpanded}
          isLoss={isSpending}
          rowClassName={lineRowClass}
          onChange={(items) => {
            // Any breakdown edit opens the rows, so focus always lands in a
            // row that is on screen.
            setIsExpanded(true);
            onChange(breakdownPatch(line, items));
          }}
        />
      )}
    </tbody>
  );
}
