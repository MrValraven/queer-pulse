import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  EXPERIENCE_OPTIONS,
  ROLE_OPTIONS,
  TYPE_OPTIONS,
  newRateId,
  type Experience,
  type RateEntry,
  type RateType,
} from "./rateBoard.data";
import styles from "./RateBoardPage.module.css";

interface RateBoardFormProps {
  /** Add a new anonymous entry to the board. */
  onAdd: (entry: RateEntry) => void;
  /** The user's own day rate to compare (0 = none); lifted so stats can read it. */
  compareRate: number;
  onCompareChange: (rate: number) => void;
}

export function RateBoardForm({
  onAdd,
  compareRate,
  onCompareChange,
}: RateBoardFormProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const ids = {
    role: useId(),
    exp: useId(),
    rate: useId(),
    type: useId(),
    compare: useId(),
  };

  const [role, setRole] = useState<string>(ROLE_OPTIONS[0]!.value);
  const [experience, setExperience] = useState<Experience>("mid");
  const [type, setType] = useState<RateType>("freelance");
  const [dayRate, setDayRate] = useState("");

  const rateNum = Number(dayRate);
  const valid = role !== "" && Number.isFinite(rateNum) && rateNum > 0;

  function handleAdd() {
    if (!valid) return;
    onAdd({
      id: newRateId(),
      role,
      experience,
      dayRate: Math.round(rateNum),
      type,
    });
    setDayRate("");
    showToast(t("economy:rateBoard.form.addedToast"), "success");
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>{t("economy:rateBoard.form.title")}</h2>
      <p className={styles.formHint}>{t("economy:rateBoard.form.hint")}</p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.role}>
            {t("economy:rateBoard.form.roleLabel")}
          </label>
          <select
            id={ids.role}
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {t(r.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.exp}>
            {t("economy:rateBoard.form.experienceLabel")}
          </label>
          <select
            id={ids.exp}
            className={styles.select}
            value={experience}
            onChange={(e) => setExperience(e.target.value as Experience)}
          >
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.rate}>
            {t("economy:rateBoard.form.dayRateLabel")}{" "}
            <span className={styles.req}>*</span>
          </label>
          <input
            id={ids.rate}
            className={styles.input}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={t("economy:rateBoard.form.dayRatePlaceholder")}
            value={dayRate}
            onChange={(e) => setDayRate(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.type}>
            {t("economy:rateBoard.form.typeLabel")}
          </label>
          <select
            id={ids.type}
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as RateType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button variant="primary" onClick={handleAdd} disabled={!valid}>
        {t("economy:rateBoard.form.addCta")}
      </Button>

      <div className={styles.compare}>
        <label className={styles.label} htmlFor={ids.compare}>
          {t("economy:rateBoard.form.compareLabel")}
        </label>
        <input
          id={ids.compare}
          className={styles.input}
          type="number"
          min={0}
          inputMode="numeric"
          placeholder={t("economy:rateBoard.form.comparePlaceholder")}
          value={compareRate > 0 ? String(compareRate) : ""}
          onChange={(e) =>
            onCompareChange(Math.max(0, Number(e.target.value) || 0))
          }
        />
        <p className={styles.compareHint}>
          {t("economy:rateBoard.form.compareHint")}
        </p>
      </div>
    </div>
  );
}
