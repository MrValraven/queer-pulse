import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CURRENCIES,
  FREQS,
  type CurrencyCode,
  type FreqKey,
} from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

const FREQ_OPTIONS: { key: FreqKey; tagKey?: string }[] = [
  { key: "monthly" },
  { key: "annual", tagKey: "support:controls.saveTag" },
  { key: "once" },
];

/** Billing-frequency pill segment (with a sliding indicator) + currency dropdown. */
export function SustainerControls({ store }: { store: SustainerStore }) {
  const { t } = useTranslation();
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
        aria-label={t("support:controls.billingFrequencyAriaLabel")}
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
            {t(FREQS[o.key].billingKey)}
            {o.tagKey && <span className={styles.saveTag}>{t(o.tagKey)}</span>}
          </button>
        ))}
      </div>

      <div className={styles.curSelectWrap}>
        <select
          className={styles.curSelect}
          aria-label={t("support:controls.currencyAriaLabel")}
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
