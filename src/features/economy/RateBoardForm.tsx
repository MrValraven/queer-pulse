import { useId, useState } from "react";
import { Button, Select } from "../../shared/components/ui";
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
          <Select
            id={ids.role}
            options={ROLE_OPTIONS.map((r) => ({
              value: String(r.value),
              label: t(r.labelKey),
            }))}
            value={role}
            onChange={(value) => setRole(value ?? "")}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.exp}>
            {t("economy:rateBoard.form.experienceLabel")}
          </label>
          <Select
            id={ids.exp}
            options={EXPERIENCE_OPTIONS.map((o) => ({
              value: String(o.value),
              label: t(o.labelKey),
            }))}
            value={experience}
            onChange={(value) => setExperience(value as Experience)}
          />
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
          <Select
            id={ids.type}
            options={TYPE_OPTIONS.map((o) => ({
              value: String(o.value),
              label: t(o.labelKey),
            }))}
            value={type}
            onChange={(value) => setType(value as RateType)}
          />
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
