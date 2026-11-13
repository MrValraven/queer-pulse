import { useId, useState, type KeyboardEvent } from "react";
import { ApiError } from "../../../../shared/api/client";
import {
  DEFAULT_VJ_STEP_DURATION,
  VJ_LIMITS,
  VJ_STEP_BEAT_COUNTS,
  type VjStepDuration,
  type VjStepDurationKind,
} from "../../../../shared/contracts/vj";
import {
  Collapse,
  FormField,
  SegmentedControl,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjReasonLine } from "../../VjReasonLine";
import { vjStepDurationTextOf } from "./vjSetlistSlots";
import styles from "./VjSetlists.module.css";

/** The beat count a switch to Beats starts on when no beat length was set:
 *  four bars of four. */
const DEFAULT_BEAT_COUNT = 16;

/** A seconds value out of range never leaves the browser; it reads like the
 *  server's own refusal, so the reason line names the range the same way. */
const STEP_DURATION_REFUSAL = new ApiError(
  400,
  "VJ_SETLIST_STEP_DURATION_INVALID",
  { statusCode: 400, code: "VJ_SETLIST_STEP_DURATION_INVALID" },
);

type VjDurationMode = "default" | "custom";

export interface VjStepDurationPickerProps {
  /** The length chosen. Null picks the default, and only makes sense with
   *  `defaultDuration` set. */
  value: VjStepDuration | null;
  /** Called once per committed choice: a valid length, or null for the
   *  default. A seconds value commits on blur or Enter; nothing out of range
   *  is ever passed. A choice equal to `value` is not passed. */
  onChange: (duration: VjStepDuration | null) => void;
  /** The sequence default. When set, the picker offers "Default (8 s)" next
   *  to Custom length (a step's length); leave it out for the default itself. */
  defaultDuration?: VjStepDuration;
  /** The accessible name of the Default and Custom group, or of the whole
   *  picker when there is no default to choose. */
  label: string;
  className?: string;
}

function isSameDuration(
  first: VjStepDuration | null,
  second: VjStepDuration | null,
): boolean {
  if (first === null || second === null) return first === second;
  return first.kind === second.kind && first.value === second.value;
}

/** The whole seconds in the field, or null when it holds anything else. */
function secondsOfText(text: string): number | null {
  const trimmedText = text.trim();
  if (!/^\d+$/.test(trimmedText)) return null;
  const seconds = Number(trimmedText);
  return seconds >= VJ_LIMITS.setlistStepSecondsMin &&
    seconds <= VJ_LIMITS.setlistStepSecondsMax
    ? seconds
    : null;
}

/**
 * One step length: the sequence default, or a custom length in seconds
 * (2 to 600) or beats (4, 8, 16, 32 or 64). Shared by the library editor and
 * the remote steps panel. Each part folds open as it applies. A switch
 * between Seconds and Beats keeps the last value of each, so switching back
 * gives it again. The Default and Custom group carries `label`, or the
 * whole picker does when there is no default to choose; the Seconds and
 * Beats group is "Length in". Escape in the seconds field puts the saved
 * value back.
 */
export function VjStepDurationPicker({
  value,
  onChange,
  defaultDuration,
  label,
  className,
}: VjStepDurationPickerProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const hasDefaultChoice = defaultDuration !== undefined;
  const isUsingDefault = hasDefaultChoice && value === null;
  const shownDuration = value ?? defaultDuration ?? DEFAULT_VJ_STEP_DURATION;

  const [rememberedSeconds, setRememberedSeconds] = useState(
    shownDuration.kind === "seconds"
      ? shownDuration.value
      : VJ_LIMITS.setlistStepSecondsDefault,
  );
  const [rememberedBeats, setRememberedBeats] = useState(
    shownDuration.kind === "beats" ? shownDuration.value : DEFAULT_BEAT_COUNT,
  );
  const shownSecondsText = String(
    shownDuration.kind === "seconds" ? shownDuration.value : rememberedSeconds,
  );
  // The field's own text while typing; a new committed value replaces it.
  const [draftText, setDraftText] = useState(shownSecondsText);
  const [draftSourceText, setDraftSourceText] = useState(shownSecondsText);
  if (draftSourceText !== shownSecondsText) {
    setDraftSourceText(shownSecondsText);
    setDraftText(shownSecondsText);
  }
  // The range line shows after a refused value. The field reads invalid
  // while it still holds that value (after Enter); a blur puts the saved
  // value back, and the field reads valid again.
  const [isRangeRefused, setIsRangeRefused] = useState(false);
  const [isFieldInvalid, setIsFieldInvalid] = useState(false);
  const clearRefusal = () => {
    setIsRangeRefused(false);
    setIsFieldInvalid(false);
  };

  const choose = (duration: VjStepDuration | null) => {
    if (!isSameDuration(duration, value)) onChange(duration);
  };

  const chooseMode = (mode: string) => {
    clearRefusal();
    if (mode === ("default" satisfies VjDurationMode)) choose(null);
    else choose(shownDuration);
  };

  const chooseKind = (kind: string) => {
    clearRefusal();
    if (kind === shownDuration.kind) return;
    if (shownDuration.kind === "seconds") {
      setRememberedSeconds(shownDuration.value);
    } else {
      setRememberedBeats(shownDuration.value);
    }
    choose(
      kind === ("beats" satisfies VjStepDurationKind)
        ? { kind: "beats", value: rememberedBeats }
        : { kind: "seconds", value: rememberedSeconds },
    );
  };

  /** Commits the field. A value out of range is refused: Enter keeps it in
   *  the field to fix, a blur puts the saved value back. */
  const commitSeconds = (isLeavingField: boolean) => {
    const seconds = secondsOfText(draftText);
    if (seconds === null) {
      setIsRangeRefused(true);
      setIsFieldInvalid(!isLeavingField);
      if (isLeavingField) setDraftText(shownSecondsText);
      return;
    }
    clearRefusal();
    setDraftText(String(seconds));
    choose({ kind: "seconds", value: seconds });
  };

  const handleSecondsKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitSeconds(false);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      clearRefusal();
      setDraftText(shownSecondsText);
    }
  };

  const modeOptions =
    defaultDuration !== undefined
      ? [
          {
            value: "default" satisfies VjDurationMode,
            label: t("vj:setlistItems.lengthDefault", {
              length: vjStepDurationTextOf(defaultDuration, t),
            }),
          },
          {
            value: "custom" satisfies VjDurationMode,
            label: t("vj:setlistItems.lengthCustom"),
          },
        ]
      : [];

  return (
    <div
      // With no default to choose, the whole picker is the group `label`
      // names; with one, the Default and Custom choice carries it.
      role={hasDefaultChoice ? undefined : "group"}
      aria-label={hasDefaultChoice ? undefined : label}
      className={[styles.durationPicker, className].filter(Boolean).join(" ")}
    >
      {hasDefaultChoice && (
        <SegmentedControl
          label={label}
          options={modeOptions}
          value={isUsingDefault ? "default" : "custom"}
          onChange={chooseMode}
        />
      )}
      <Collapse isOpen={!isUsingDefault}>
        <div className={styles.durationCustom}>
          <SegmentedControl
            label={t("vj:duration.kindLabel")}
            options={[
              { value: "seconds", label: t("vj:duration.kindSeconds") },
              { value: "beats", label: t("vj:duration.kindBeats") },
            ]}
            value={shownDuration.kind}
            onChange={chooseKind}
          />
          <Collapse isOpen={shownDuration.kind === "seconds"}>
            <FormField
              className={styles.durationSeconds}
              label={t("vj:duration.valueLabel")}
              helper={t("vj:duration.secondsRange", {
                min: VJ_LIMITS.setlistStepSecondsMin,
                max: VJ_LIMITS.setlistStepSecondsMax,
              })}
            >
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="done"
                value={draftText}
                aria-invalid={isFieldInvalid}
                aria-describedby={isRangeRefused ? reasonId : undefined}
                onChange={(event) => {
                  setDraftText(event.target.value);
                  clearRefusal();
                }}
                onBlur={() => commitSeconds(true)}
                onKeyDown={handleSecondsKey}
              />
            </FormField>
          </Collapse>
          <Collapse isOpen={shownDuration.kind === "beats"}>
            {/* The same field label as Seconds; the group takes the same
                words as its name. */}
            <FormField label={t("vj:duration.valueLabel")}>
              <SegmentedControl
                label={t("vj:duration.valueLabel")}
                options={VJ_STEP_BEAT_COUNTS.map((beatCount) => ({
                  value: String(beatCount),
                  // The button shows the bare number and is named "16 beats".
                  label: (
                    <>
                      <span aria-hidden="true">{beatCount}</span>
                      <span className="visuallyHidden">
                        {t("vj:duration.beatCount", { count: beatCount })}
                      </span>
                    </>
                  ),
                }))}
                value={
                  shownDuration.kind === "beats"
                    ? String(shownDuration.value)
                    : ""
                }
                onChange={(beatText) =>
                  choose({ kind: "beats", value: Number(beatText) })
                }
              />
            </FormField>
          </Collapse>
          <VjReasonLine
            id={reasonId}
            error={isRangeRefused ? STEP_DURATION_REFUSAL : null}
          />
        </div>
      </Collapse>
    </div>
  );
}
