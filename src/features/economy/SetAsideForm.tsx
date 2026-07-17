import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import type { TaxYear } from "./tax.calc";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  ACTIVITY_OPTIONS,
  YEAR_OPTIONS,
  type Activity,
  type PotEntry,
} from "./setAside.data";
import styles from "./SetAsidePlannerPage.module.css";

interface SetAsideFormProps {
  gross: number;
  activity: Activity;
  year: TaxYear;
  pot: PotEntry[];
  today: string;
  onGross: (n: number) => void;
  onActivity: (a: Activity) => void;
  onYear: (y: TaxYear) => void;
  onAdd: (amount: number, date: string) => void;
  onRemove: (id: string) => void;
}

export function SetAsideForm({
  gross,
  activity,
  year,
  pot,
  today,
  onGross,
  onActivity,
  onYear,
  onAdd,
  onRemove,
}: SetAsideFormProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const fmtDate = (iso: string) =>
    fmt.date(new Date(iso + "T00:00:00"), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const parsedAmount = Number(amount);
  const canAdd = parsedAmount > 0 && !!date;

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(parsedAmount, date);
    setAmount("");
    setDate(today);
  };

  return (
    <div className={styles.form}>
      <section className={styles.fieldset}>
        <h2 className={styles.legend}>
          {t("economy:setAside.yourYearLegend")}
        </h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sa-gross">
            {t("economy:setAside.grossLabel")}{" "}
            <span className={styles.req}>*</span>
          </label>
          <input
            id="sa-gross"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            className={styles.input}
            value={gross || ""}
            onChange={(e) => onGross(Math.max(0, Number(e.target.value)))}
            placeholder={t("economy:setAside.grossPlaceholder")}
          />
          <p className={styles.hint}>{t("economy:setAside.grossHint")}</p>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-activity">
              {t("economy:setAside.activityLabel")}
            </label>
            <select
              id="sa-activity"
              className={styles.select}
              value={activity}
              onChange={(e) => onActivity(e.target.value as Activity)}
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-year">
              {t("economy:setAside.yearLabel")}
            </label>
            <select
              id="sa-year"
              className={styles.select}
              value={year}
              onChange={(e) => onYear(Number(e.target.value) as TaxYear)}
            >
              {YEAR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={styles.fieldset}>
        <h2 className={styles.legend}>
          {t("economy:setAside.logInvoiceLegend")}
        </h2>
        <p className={styles.hint}>{t("economy:setAside.logInvoiceHint")}</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-amount">
              {t("economy:setAside.amountLabel")}{" "}
              <span className={styles.req}>*</span>
            </label>
            <input
              id="sa-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={t("economy:setAside.amountPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-date">
              {t("economy:setAside.dateLabel")}
            </label>
            <input
              id="sa-date"
              type="date"
              className={styles.input}
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <Button variant="primary" onClick={handleAdd} disabled={!canAdd}>
          <FiPlus aria-hidden /> {t("economy:setAside.addCta")}
        </Button>

        {pot.length > 0 && (
          <ul className={styles.list}>
            {pot.map((e) => (
              <li key={e.id} className={styles.item}>
                <span className={styles.itemAmount}>
                  {fmt.currency(e.amount)}
                </span>
                <span className={styles.itemDate}>{fmtDate(e.date)}</span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onRemove(e.id)}
                  aria-label={t("economy:setAside.removeAriaLabel", {
                    amount: fmt.currency(e.amount),
                  })}
                >
                  <FiX aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
