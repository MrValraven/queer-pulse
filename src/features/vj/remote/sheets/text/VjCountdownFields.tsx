import { useId, useState, type ReactNode } from "react";
import { Button, Collapse } from "../../../../../shared/components/ui";
import {
  VJ_LIMITS,
  type VjCountdown,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjStageCommands } from "../../../live/vjStageCommands";
import {
  VJ_COUNTDOWN_MINUTE_CHOICES,
  vjClockTimeOf,
  vjCountdownDurationMs,
  type VjCountdownTargetInput,
} from "./vjCountdownTarget";
import { VjChoiceChips, VjOneLineField } from "./VjOverlayFields";
import styles from "./VjTextSheetV2.module.css";

export type VjCountdownPatch = Parameters<VjStageCommands["setCountdown"]>[0];

type VjMinuteChoice = (typeof VJ_COUNTDOWN_MINUTE_CHOICES)[number];

const LABEL_ERROR_VALUES = { max: VJ_LIMITS.countdownLabelMax };

/** The reason line for a target the remote refuses before it sends anything. */
const TARGET_REASON_KEYS = {
  past: "vj:countdown.pastTime",
  tooFar: "vj:error.socket.countdownOutOfRange",
} as const;

/**
 * The Countdown section: a label, then when it ends, as minutes from now or
 * an end time later today. Both become `durationMs` on this device's clock,
 * so a time already past is named here and nothing is sent.
 */
export function VjCountdownFields({
  countdown,
  isHeld,
  onSend,
  onReason,
  alert,
}: {
  countdown: VjCountdown;
  isHeld: boolean;
  onSend: (patch: VjCountdownPatch) => void;
  /** Shows a reason line found on this device, with nothing sent. */
  onReason: (key: string) => void;
  /** The section's reason line, under the actions. */
  alert: ReactNode;
}) {
  const { t } = useTranslation();
  const timeId = useId();
  const [label, setLabel] = useState(countdown.label);
  const [minutes, setMinutes] = useState<VjMinuteChoice>(5);
  const [clockValue, setClockValue] = useState("");

  const clockTime = vjClockTimeOf(clockValue);
  const target: VjCountdownTargetInput =
    clockTime === null
      ? { mode: "minutes", minutes }
      : { mode: "clock", ...clockTime };
  const isLabelOver =
    Array.from(label.trim()).length > VJ_LIMITS.countdownLabelMax;
  const isShowHeld = isHeld || isLabelOver;

  const showCountdown = () => {
    if (isShowHeld) return;
    const durationMs = vjCountdownDurationMs(target, Date.now());
    if (typeof durationMs === "string") {
      onReason(TARGET_REASON_KEYS[durationMs]);
      return;
    }
    onSend({ isVisible: true, durationMs, label: label.trim() });
  };

  return (
    <div className={styles.fields} data-vj-text-fields="countdown">
      <VjOneLineField
        label={t("vj:countdown.label")}
        value={label}
        max={VJ_LIMITS.countdownLabelMax}
        overLine={t(
          "vj:error.socket.countdownLabelTooLong",
          LABEL_ERROR_VALUES,
        )}
        placeholder={t("vj:countdown.labelPlaceholder")}
        onChange={setLabel}
        onSubmit={showCountdown}
      />
      <VjChoiceChips
        title={t("vj:countdown.title")}
        options={VJ_COUNTDOWN_MINUTE_CHOICES}
        value={target.mode === "minutes" ? minutes : null}
        labelOf={(count) => t("vj:countdown.minutes", { count })}
        onChoose={(choice) => {
          setMinutes(choice);
          setClockValue("");
        }}
        isHeld={isHeld}
        isTitleHidden
      />
      <div className={styles.group}>
        <label htmlFor={timeId} className={styles.groupTitle}>
          {t("vj:countdown.timeLabel")}
        </label>
        <input
          id={timeId}
          type="time"
          className={styles.timeInput}
          value={clockValue}
          data-is-chosen={target.mode === "clock"}
          onChange={(event) => setClockValue(event.target.value)}
        />
      </div>
      <div className={styles.actions}>
        <Button
          variant="stage"
          className={styles.actionButton}
          aria-disabled={isShowHeld}
          onClick={showCountdown}
        >
          {t(countdown.isVisible ? "vj:countdown.update" : "vj:countdown.show")}
        </Button>
        <Collapse isOpen={countdown.isVisible}>
          <Button
            variant="stage-ghost"
            className={styles.actionButton}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld) onSend({ isVisible: false });
            }}
          >
            {t("vj:countdown.hide")}
          </Button>
        </Collapse>
      </div>
      {alert}
    </div>
  );
}
