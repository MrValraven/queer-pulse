import { useState } from "react";
import { ToolPage } from "./tools/ToolPage";
import { DayRateResult } from "./DayRateResult";
import { DAY_RATE_DEFAULTS } from "./dayRate.data";
import { IVA_RATES } from "./tax.constants";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DayRateCalculatorPage.module.css";

/** Parse a controlled-input string to a non-negative number, NaN → fallback. */
const num = (s: string, fallback = 0) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
};

export function DayRateCalculatorPage() {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState<string>(DAY_RATE_DEFAULTS.annual);
  const [days, setDays] = useState<string>(DAY_RATE_DEFAULTS.days);
  const [overhead, setOverhead] = useState<string>(DAY_RATE_DEFAULTS.overhead);
  const [hoursPerDay, setHoursPerDay] = useState<string>(
    DAY_RATE_DEFAULTS.hoursPerDay,
  );
  const [iva, setIva] = useState<string>(DAY_RATE_DEFAULTS.iva);

  const daysN = num(days);
  const hoursN = num(hoursPerDay);
  const base =
    daysN > 0 ? (num(annual) / daysN) * (1 + num(overhead) / 100) : 0;
  const withIva = base * (1 + num(iva) / 100);
  const hourly = hoursN > 0 ? base / hoursN : 0;

  const form = (
    <div className={styles.form}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>
            {t("economy:dayRate.annualLabel")}
          </span>
          <input
            className={styles.input}
            type="number"
            min={0}
            inputMode="numeric"
            value={annual}
            onChange={(e) => setAnnual(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{t("economy:dayRate.daysLabel")}</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            inputMode="numeric"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>
            {t("economy:dayRate.overheadLabel")}
          </span>
          <input
            className={styles.input}
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={overhead}
            onChange={(e) => setOverhead(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>
            {t("economy:dayRate.hoursLabel")}
          </span>
          <input
            className={styles.input}
            type="number"
            min={1}
            max={24}
            inputMode="numeric"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>{t("economy:dayRate.ivaLabel")}</span>
        <select
          className={styles.select}
          value={iva}
          onChange={(e) => setIva(e.target.value)}
        >
          {IVA_RATES.map((r) => (
            <option key={r.value} value={String(r.value)}>
              {t(r.labelKey)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowFreelance")}
      title={
        <Translation
          i18nKey="economy:dayRate.title"
          components={{ em: <em /> }}
        />
      }
      subtitle={t("economy:dayRate.sub")}
      form={form}
      preview={<DayRateResult base={base} withIva={withIva} hourly={hourly} />}
    />
  );
}
