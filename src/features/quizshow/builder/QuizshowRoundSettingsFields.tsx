import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { FormField } from "../../../shared/components/ui/FormField";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import { Toggle } from "../../../shared/components/ui/Controls";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_TALK_SECONDS_VALUES,
  type QuizshowRoundKind,
  type QuizshowRoundSettings,
  type QuizshowTalkSeconds,
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

/** Whether `typedText` reads as `value` (what typing it would have committed). */
function isTypedSecondsOf(typedText: string, value: number): boolean {
  return typedText !== "" && Number(typedText) === value;
}

function SecondsField({
  label,
  value,
  minimum,
  maximum,
  onChange,
}: SecondsFieldProps) {
  const [typedText, setTypedText] = useState<string | null>(null);
  // A committed change the typed text does not read as (an undo, a reload)
  // drops the typed copy at once, focused or not.
  const [typedForValue, setTypedForValue] = useState(value);
  if (typedForValue !== value) {
    setTypedForValue(value);
    if (typedText !== null && !isTypedSecondsOf(typedText, value)) {
      setTypedText(null);
    }
  }
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
  const hintId = useId();
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <label className={styles.toggleLabel} htmlFor={toggleId}>
          {label}
        </label>
        {hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
      <Toggle
        id={toggleId}
        label={label}
        checked={isOn}
        aria-describedby={hint ? hintId : undefined}
        onChange={onChange}
      />
    </div>
  );
}

/** "Talk it over": seconds the teams talk before answers open (contract 6.20). */
function TalkSecondsField({
  value,
  onChange,
}: {
  value: QuizshowTalkSeconds;
  onChange: (talkSeconds: QuizshowTalkSeconds) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const labelId = useId();
  const hintId = useId();
  return (
    <div className={styles.fieldGroup}>
      <span id={labelId} className={styles.groupLabel}>
        {t("quizshow:rounds.talkSeconds.label")}
      </span>
      <p id={hintId} className={styles.hint}>
        {t("quizshow:rounds.talkSeconds.hint")}
      </p>
      <RadioCardGroup
        value={String(value)}
        ariaLabel={t("quizshow:rounds.talkSeconds.label")}
        ariaLabelledBy={labelId}
        ariaDescribedBy={hintId}
        className={styles.optionGrid}
        optionClassName={styles.choice}
        onChange={(picked) => {
          const talkSeconds = QUIZSHOW_TALK_SECONDS_VALUES.find(
            (seconds) => String(seconds) === picked,
          );
          if (talkSeconds !== undefined) onChange(talkSeconds);
        }}
        options={QUIZSHOW_TALK_SECONDS_VALUES.map((seconds) => ({
          id: String(seconds),
          render:
            seconds === 0
              ? t("quizshow:rounds.talkSeconds.off")
              : t("quizshow:rounds.talkSeconds.seconds", {
                  seconds: format.number(seconds),
                }),
        }))}
      />
    </div>
  );
}

interface QuizshowRoundSettingsFieldsProps {
  kind: QuizshowRoundKind;
  settings: QuizshowRoundSettings;
  /**
   * The first non-wheel row of the quiz, the only one a warm-up can open
   * (contract 6.19). The warm-up switch shows nowhere else.
   */
  isFirstPlayableRow?: boolean;
  onChange: (settings: QuizshowRoundSettings) => void;
}

export function QuizshowRoundSettingsFields({
  kind,
  settings,
  isFirstPlayableRow = false,
  onChange,
}: QuizshowRoundSettingsFieldsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isQuizRound = kind === "quiz";
  // A row that holds a warm-up always shows its switch, so the host can turn
  // off one a move, an add or a kind change left on another row
  // (warm_up_not_first).
  const isWarmUpShown =
    settings.isWarmUp || (isFirstPlayableRow && isQuizRound);
  const jokerToggle = (
    // A warm-up scores nothing, so the save turns jokers off on it (contract 6.19).
    <Collapse isOpen={!settings.isWarmUp}>
      <ToggleRow
        label={t("quizshow:rounds.joker.label")}
        hint={t("quizshow:rounds.joker.hint")}
        isOn={settings.isJokerAllowed}
        onChange={(isJokerAllowed) => onChange({ ...settings, isJokerAllowed })}
      />
    </Collapse>
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
        <Collapse isOpen={isWarmUpShown}>
          <ToggleRow
            label={t("quizshow:rounds.warmUp.label")}
            hint={t("quizshow:rounds.warmUp.hint")}
            isOn={settings.isWarmUp}
            onChange={(isWarmUp) =>
              onChange({
                ...settings,
                isWarmUp,
                isJokerAllowed: isWarmUp ? false : settings.isJokerAllowed,
              })
            }
          />
        </Collapse>
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
            <TalkSecondsField
              value={settings.talkSeconds}
              onChange={(talkSeconds) => onChange({ ...settings, talkSeconds })}
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
