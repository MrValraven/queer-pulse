import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
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
  const { showToast } = useToast();
  const ids = {
    role: useId(),
    exp: useId(),
    rate: useId(),
    type: useId(),
    compare: useId(),
  };

  const [role, setRole] = useState<string>(ROLE_OPTIONS[0]!);
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
    showToast("Added anonymously", "success");
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Add your rate</h2>
      <p className={styles.formHint}>
        No name, no email — just the numbers. It stays on this device until you
        export it.
      </p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.role}>
            Role
          </label>
          <select
            id={ids.role}
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.exp}>
            Experience
          </label>
          <select
            id={ids.exp}
            className={styles.select}
            value={experience}
            onChange={(e) => setExperience(e.target.value as Experience)}
          >
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.rate}>
            Day rate (€) <span className={styles.req}>*</span>
          </label>
          <input
            id={ids.rate}
            className={styles.input}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="e.g. 350"
            value={dayRate}
            onChange={(e) => setDayRate(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.type}>
            Type
          </label>
          <select
            id={ids.type}
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as RateType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button variant="primary" onClick={handleAdd} disabled={!valid}>
        Add to the board
      </Button>

      <div className={styles.compare}>
        <label className={styles.label} htmlFor={ids.compare}>
          See where you stand
        </label>
        <input
          id={ids.compare}
          className={styles.input}
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="Your day rate (€)"
          value={compareRate > 0 ? String(compareRate) : ""}
          onChange={(e) =>
            onCompareChange(Math.max(0, Number(e.target.value) || 0))
          }
        />
        <p className={styles.compareHint}>
          We'll show your percentile against everyone here — nothing's added to
          the board.
        </p>
      </div>
    </div>
  );
}
