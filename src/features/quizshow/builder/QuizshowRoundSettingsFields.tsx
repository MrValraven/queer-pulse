import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { FormField } from "../../../shared/components/ui/FormField";
import { Toggle } from "../../../shared/components/ui/Controls";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowRoundKind,
  type QuizshowRoundSettings,
} from "../../../shared/contracts/quizshow";
import styles from "./QuizshowRounds.module.css";

interface SecondsFieldProps {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
}

function clampSeconds(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

function SecondsField({
  label,
  value,
  minimum,
  maximum,
  onChange,
}: SecondsFieldProps) {
  const [typedText, setTypedText] = useState<string | null>(null);
  return (
    <FormField label={label}>
      <input
        type="number"
        inputMode="numeric"
        className={styles.numberInput}
        min={minimum}
        max={maximum}
        value={typedText ?? String(value)}
        onChange={(event) => {
          setTypedText(event.target.value);
          const parsed = Number(event.target.value);
          if (event.target.value !== "" && Number.isFinite(parsed)) {
            onChange(parsed);
          }
        }}
        onBlur={() => {
          onChange(clampSeconds(value, minimum, maximum));
          setTypedText(null);
        }}
      />
    </FormField>
  );
}

interface ToggleRowProps {
  label: string;
  hint?: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}

function ToggleRow({ label, hint, isOn, onChange }: ToggleRowProps) {
  const toggleId = useId();
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <label className={styles.toggleLabel} htmlFor={toggleId}>
          {label}
        </label>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>
      <Toggle id={toggleId} label={label} checked={isOn} onChange={onChange} />
    </div>
  );
}

interface QuizshowRoundSettingsFieldsProps {
  kind: QuizshowRoundKind;
  settings: QuizshowRoundSettings;
  onChange: (settings: QuizshowRoundSettings) => void;
}

export function QuizshowRoundSettingsFields({
  kind,
  settings,
  onChange,
}: QuizshowRoundSettingsFieldsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isQuizRound = kind === "quiz";
  const jokerToggle = (
    <ToggleRow
      label={t("quizshow:rounds.joker.label")}
      hint={t("quizshow:rounds.joker.hint")}
      isOn={settings.isJokerAllowed}
      onChange={(isJokerAllowed) => onChange({ ...settings, isJokerAllowed })}
    />
  );
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={isQuizRound ? "quiz" : "party"}
        className={styles.settingsBody}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
      >
        {isQuizRound ? (
          <>
            <SecondsField
              label={t("quizshow:rounds.timeLimit.label")}
              value={settings.timeLimitSeconds}
              minimum={QUIZSHOW_LIMITS.timeLimitSecondsMin}
              maximum={QUIZSHOW_LIMITS.timeLimitSecondsMax}
              onChange={(timeLimitSeconds) =>
                onChange({ ...settings, timeLimitSeconds })
              }
            />
            <ToggleRow
              label={t("quizshow:rounds.speedBonus.label")}
              isOn={settings.isSpeedBonusOn}
              onChange={(isSpeedBonusOn) =>
                onChange({ ...settings, isSpeedBonusOn })
              }
            />
          </>
        ) : (
          <>
            <SecondsField
              label={t("quizshow:rounds.writeSeconds.label")}
              value={settings.writeSeconds}
              minimum={QUIZSHOW_LIMITS.writeSecondsMin}
              maximum={QUIZSHOW_LIMITS.writeSecondsMax}
              onChange={(writeSeconds) =>
                onChange({ ...settings, writeSeconds })
              }
            />
            <SecondsField
              label={t("quizshow:rounds.voteSeconds.label")}
              value={settings.voteSeconds}
              minimum={QUIZSHOW_LIMITS.voteSecondsMin}
              maximum={QUIZSHOW_LIMITS.voteSecondsMax}
              onChange={(voteSeconds) => onChange({ ...settings, voteSeconds })}
            />
          </>
        )}
        {jokerToggle}
      </m.div>
    </AnimatePresence>
  );
}
