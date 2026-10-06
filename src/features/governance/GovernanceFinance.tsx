import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { FinLine } from "./governance.data";
import styles from "./GovernancePage.module.css";

/** A ledger amount the admin Finances editor saved is a plain number string
 *  ("1840.5"); older rows hold a pre-formatted one ("€1,840"). */
const CANONICAL_AMOUNT = /^-?\d+(\.\d+)?$/;

function FinanceRow({ line, color }: { line: FinLine; color: string }) {
  const [open, setOpen] = useState(false);
  const fmt = useFormat();
  const { t } = useTranslation();
  // PRD-447: an entered figure is shown in the reader's locale; a
  // pre-formatted one is shown as it was written. Breakdown amounts and the
  // breakdown total follow the same rule. A whole number drops its cents
  // ("€520"), matching the pre-formatted rows beside it.
  const formatAmount = (value: string): string => {
    if (!CANONICAL_AMOUNT.test(value)) return value;
    const parsed = Number(value);
    return fmt.currency(
      parsed,
      "EUR",
      Number.isInteger(parsed) ? { maximumFractionDigits: 0 } : undefined,
    );
  };
  const amount = formatAmount(line.amount);
  // The public report carries a breakdown only once an admin saved one, so a
  // row with nothing to reveal renders as a plain row with no toggle.
  const hasBreakdown = line.items.length > 0;
  // A saved breakdown's total carries no label; it reads as the item count.
  const totalLabel =
    line.total.label ||
    t("governance:sections.finances.itemCount", { count: line.items.length });
  const summary = (
    <>
      <div className={styles.finLineTop}>
        <span className={styles.finLineLabel}>{line.label}</span>
        <span className={styles.finLineRight}>
          <span className={styles.finLineAmount}>{amount}</span>
          {hasBreakdown && (
            <span className={styles.finChevron} aria-hidden>
              <FiChevronDown />
            </span>
          )}
        </span>
      </div>
      <div className={styles.finLineNote}>{line.note}</div>
      <div className={styles.finTrack}>
        <div
          className={styles.finFill}
          style={{ width: `${line.width}%`, background: color }}
        />
      </div>
    </>
  );
  if (!hasBreakdown) {
    return (
      <div className={styles.finLine}>
        <div className={`${styles.finSummary} ${styles.finSummaryStatic}`}>
          {summary}
        </div>
      </div>
    );
  }
  return (
    <div
      className={[styles.finLine, open && styles.finLineOpen]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={styles.finSummary}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {summary}
      </button>
      <div className={styles.finDetailWrap}>
        <div className={styles.finDetailInner}>
          <div className={styles.finDetail}>
            {line.items.map((item, index) => (
              // Names may repeat, so the position keeps each key unique.
              <div
                key={`${index}-${item.name}`}
                className={styles.finDetailItem}
              >
                <span>{item.name}</span>
                {/* An empty detail leaves its grid slot blank. */}
                <span className={styles.fdiPeriod}>{item.period}</span>
                <span className={styles.fdiAmount}>
                  {formatAmount(item.amount)}
                </span>
              </div>
            ))}
            <div className={styles.finDetailTotal}>
              <span>{totalLabel}</span>
              <span>{formatAmount(line.total.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FinanceLines({
  lines,
  color,
  total,
}: {
  lines: FinLine[];
  color: string;
  total: string;
}) {
  return (
    <>
      {lines.map((line, index) => (
        <FinanceRow key={`${index}-${line.label}`} line={line} color={color} />
      ))}
      <div className={styles.finTotalLine}>
        <span className={styles.finTotalLabel}>{total}</span>
      </div>
    </>
  );
}
