import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Button, DatePicker, Select } from "../../shared/components/ui";
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
            <Select
              id="sa-activity"
              options={ACTIVITY_OPTIONS.map((o) => ({
                value: String(o.value),
                label: t(o.labelKey),
              }))}
              value={activity}
              onChange={(value) => onActivity(value as Activity)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="sa-year">
              {t("economy:setAside.yearLabel")}
            </label>
            <Select
              id="sa-year"
              options={YEAR_OPTIONS.map((o) => ({
                value: String(o.value),
                label: o.label,
              }))}
              value={String(year)}
              onChange={(value) => onYear(Number(value) as TaxYear)}
            />
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
            <label id="sa-date-label" className={styles.label}>
              {t("economy:setAside.dateLabel")}
            </label>
            <DatePicker
              mode="date"
              id="sa-date"
              labelledBy="sa-date-label"
              value={date || null}
              max={today}
              onChange={(value) => setDate(value ?? "")}
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
