import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import type { FinLine } from "./governance.data";
import styles from "./GovernancePage.module.css";

function FinanceRow({ line, color }: { line: FinLine; color: string }) {
  const [open, setOpen] = useState(false);
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
        <div className={styles.finLineTop}>
          <span className={styles.finLineLabel}>{line.label}</span>
          <span className={styles.finLineRight}>
            <span className={styles.finLineAmount}>{line.amount}</span>
            <span className={styles.finChevron} aria-hidden>
              <FiChevronDown />
            </span>
          </span>
        </div>
        <div className={styles.finLineNote}>{line.note}</div>
        <div className={styles.finTrack}>
          <div
            className={styles.finFill}
            style={{ width: `${line.width}%`, background: color }}
          />
        </div>
      </button>
      <div className={styles.finDetailWrap}>
        <div className={styles.finDetailInner}>
          <div className={styles.finDetail}>
            {line.items.map((it) => (
              <div key={it.name} className={styles.finDetailItem}>
                <span>{it.name}</span>
                <span className={styles.fdiPeriod}>{it.period}</span>
                <span className={styles.fdiAmount}>{it.amount}</span>
              </div>
            ))}
            <div className={styles.finDetailTotal}>
              <span>{line.total.label}</span>
              <span>{line.total.amount}</span>
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
      {lines.map((line) => (
        <FinanceRow key={line.label} line={line} color={color} />
      ))}
      <div className={styles.finTotalLine}>
        <span className={styles.finTotalLabel}>{total}</span>
      </div>
    </>
  );
}
