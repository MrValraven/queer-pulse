import { useId, useState, type FormEvent } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import {
  VJ_SPEED_MAX,
  VJ_SPEED_MIN,
  isVjSpeed,
  type VjSpeed,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./VjDockRows.module.css";

/** Why a typed speed cannot go out; each names its own line of copy. */
type VjCustomSpeedProblem = "empty" | "tooSlow" | "tooFast" | "tooPrecise";

const VJ_CUSTOM_SPEED_PROBLEM_KEYS = {
  empty: "vj:effects.customSpeedEmpty",
  tooSlow: "vj:effects.customSpeedTooSlow",
  tooFast: "vj:effects.customSpeedTooFast",
  tooPrecise: "vj:effects.customSpeedTooPrecise",
} as const satisfies Record<VjCustomSpeedProblem, string>;

type VjCustomSpeedReading =
  | { speed: VjSpeed; problem: null }
  | { speed: null; problem: VjCustomSpeedProblem };

/** The typed field as a live speed, or the reason it is none: empty or no
 *  number, below 0.25, above 4, or more than two decimals. */
function readVjCustomSpeed(text: string): VjCustomSpeedReading {
  const trimmedText = text.trim().replace(",", ".");
  const typedSpeed = Number(trimmedText);
  if (trimmedText === "" || !Number.isFinite(typedSpeed)) {
    return { speed: null, problem: "empty" };
  }
  if (typedSpeed < VJ_SPEED_MIN) return { speed: null, problem: "tooSlow" };
  if (typedSpeed > VJ_SPEED_MAX) return { speed: null, problem: "tooFast" };
  if (!isVjSpeed(typedSpeed)) return { speed: null, problem: "tooPrecise" };
  return { speed: typedSpeed, problem: null };
}

export interface VjCustomSpeedFieldProps {
  /** The speed shown now; the field starts with it and follows it when it
   *  changes. */
  speed: VjSpeed;
  isBlocked: boolean;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  describedBy?: string;
  /** The submit button's class, so the field matches the presets beside it. */
  submitClassName?: string;
  onSubmitSpeed: (speed: VjSpeed) => void;
}

/**
 * A typed speed under the preset buttons: any value from 0.25x to 4x with at
 * most two decimals, sent with "Set speed" or Enter. A value it cannot send
 * names its reason under the field.
 */
export function VjCustomSpeedField({
  speed,
  isBlocked,
  describedBy,
  submitClassName = styles.chip,
  onSubmitSpeed,
}: VjCustomSpeedFieldProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  const problemId = useId();
  const [fieldText, setFieldText] = useState(() => String(speed));
  const [followedSpeed, setFollowedSpeed] = useState(speed);
  const [problem, setProblem] = useState<VjCustomSpeedProblem | null>(null);
  if (followedSpeed !== speed) {
    setFollowedSpeed(speed);
    setFieldText(String(speed));
    setProblem(null);
  }

  const submitField = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBlocked) return;
    const reading = readVjCustomSpeed(fieldText);
    setProblem(reading.problem);
    if (reading.speed !== null) onSubmitSpeed(reading.speed);
  };

  const fieldDescribedBy =
    [describedBy, problem === null ? undefined : problemId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={styles.customSpeed} data-vj-custom-speed="">
      <form className={styles.bpmForm} noValidate onSubmit={submitField}>
        <label htmlFor={fieldId} className={styles.fieldLabel}>
          {t("vj:effects.customSpeedLabel")}
          <input
            id={fieldId}
            className={styles.field}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={fieldText}
            readOnly={isBlocked}
            aria-disabled={isBlocked || undefined}
            aria-invalid={problem !== null || undefined}
            aria-describedby={fieldDescribedBy}
            onChange={(event) => {
              setFieldText(event.currentTarget.value);
              setProblem(null);
            }}
          />
        </label>
        <button
          type="submit"
          className={submitClassName}
          aria-disabled={isBlocked || undefined}
          aria-describedby={describedBy}
        >
          {t("vj:effects.customSpeedSubmit")}
        </button>
      </form>
      <Collapse isOpen={problem !== null}>
        <p id={problemId} className={`${styles.note} ${styles.fieldError}`}>
          <FiAlertTriangle aria-hidden fill="none" />
          <span>{t(VJ_CUSTOM_SPEED_PROBLEM_KEYS[problem ?? "empty"])}</span>
        </p>
      </Collapse>
    </div>
  );
}
