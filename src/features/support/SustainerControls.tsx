import { useLayoutEffect, useRef, useState } from "react";
import {
  CURRENCIES,
  type CurrencyCode,
  type FreqKey,
} from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

const FREQ_OPTIONS: { key: FreqKey; label: string; tag?: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Yearly", tag: "2 mo free" },
  { key: "once", label: "One-time" },
];

/** Billing-frequency pill segment (with a sliding indicator) + currency dropdown. */
export function SustainerControls({ store }: { store: SustainerStore }) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [ind, setInd] = useState({ left: 4, width: 0 });
  const activeIndex = FREQ_OPTIONS.findIndex((o) => o.key === store.freq);

  useLayoutEffect(() => {
    function move() {
      const el = btnRefs.current[activeIndex];
      if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
    }
    move();
    window.addEventListener("resize", move);
    return () => window.removeEventListener("resize", move);
  }, [activeIndex]);

  return (
    <div className={styles.controlsBar}>
      <div
        className={styles.pillSeg}
        role="tablist"
        aria-label="Billing frequency"
      >
        <span
          className={styles.pillIndicator}
          style={{ left: ind.left, width: ind.width }}
          aria-hidden
        />
        {FREQ_OPTIONS.map((o, i) => (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={store.freq === o.key}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            className={`${styles.pillBtn} ${store.freq === o.key ? styles.active : ""}`}
            onClick={() => store.setFreq(o.key)}
          >
            {o.label}
            {o.tag && <span className={styles.saveTag}>{o.tag}</span>}
          </button>
        ))}
      </div>

      <div className={styles.curSelectWrap}>
        <select
          className={styles.curSelect}
          aria-label="Currency"
          value={store.cur}
          onChange={(e) => store.setCurrency(e.target.value as CurrencyCode)}
        >
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
            <option key={code} value={code}>
              {CURRENCIES[code].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
