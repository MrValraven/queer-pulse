import type { CSSProperties } from "react";
import {
  VJ_LIMITS,
  VJ_TRANSITION_BEAT_COUNTS,
  type VjTransitionLength,
} from "../../../../shared/contracts/vj";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { VJ_FADE_SLIDER_THROTTLE_MS } from "../../vj.constants";
import type { VjSendRefusal } from "../hooks/useVjOptimisticValue";
import { useVjThrottledDraft } from "../hooks/useVjThrottledDraft";
import { useVjMidiLearnTarget } from "../midi/useVjMidiLearnTarget";
import styles from "./VjDockRows.module.css";

/** The ms slider moves in tenths of a second. */
const VJ_LENGTH_MS_STEP = 100;

export interface VjLengthControlProps {
  /** The length shown now (the stage's, or a pending pick). */
  length: VjTransitionLength;
  isBlocked: boolean;
  stateRevision: number | null;
  onPickBeats: (count: number) => void;
  sendMs: (value: number) => Promise<VjCommandOutcome>;
  onRefused?: (refusal: VjSendRefusal) => void;
  /** The status line naming why the controls are blocked and, while help is
   *  on, the length's help caption, for aria-describedby. */
  describedBy?: string;
}

/**
 * The transition length: beat chips (1, 2, 4, 8, 16) while the length counts
 * beats, a 0 to 4 s slider while it counts milliseconds. The slider sends
 * through a throttled draft (at most one value per 100 ms while dragging, the
 * final value on release). MIDI learn can pick either as the length target.
 */
export function VjLengthControl(props: VjLengthControlProps) {
  return props.length.unit === "beats" ? (
    <VjBeatLengthChips {...props} />
  ) : (
    <VjMsLengthSlider {...props} />
  );
}

function VjBeatLengthChips({
  length,
  isBlocked,
  onPickBeats,
  describedBy,
}: VjLengthControlProps) {
  const { t } = useTranslation();
  const { learnProps } = useVjMidiLearnTarget({ kind: "transitionLength" });
  const lengthLabel = t("vj:transition.lengthBeats", { count: length.value });
  return (
    <div
      className={styles.beatChips}
      role="group"
      aria-label={t("vj:transition.lengthAria", { value: lengthLabel })}
      data-vj-length="beats"
    >
      {VJ_TRANSITION_BEAT_COUNTS.map((count) => (
        <button
          key={count}
          type="button"
          className={`${styles.chip} ${styles.beatChip}`}
          aria-pressed={length.value === count}
          aria-label={t("vj:transition.lengthBeats", { count })}
          aria-disabled={isBlocked || undefined}
          aria-describedby={describedBy}
          onClick={() => {
            if (!isBlocked && length.value !== count) onPickBeats(count);
          }}
          {...learnProps}
        >
          {count}
        </button>
      ))}
    </div>
  );
}

function VjMsLengthSlider({
  length,
  isBlocked,
  stateRevision,
  sendMs,
  onRefused,
  describedBy,
}: VjLengthControlProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { learnProps } = useVjMidiLearnTarget({ kind: "transitionLength" });
  const draft = useVjThrottledDraft<number>({
    serverValue: length.value,
    stateRevision,
    throttleMs: VJ_FADE_SLIDER_THROTTLE_MS,
    send: sendMs,
    isBlocked,
    onRefused,
  });
  const secondsLabel = t("vj:remote.fadeSeconds", {
    seconds: format.number(draft.value / 1000, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
  });
  const fillPercent = (draft.value / VJ_LIMITS.fadeMsMax) * 100;
  return (
    <div className={styles.msControl} data-vj-length="ms">
      <input
        type="range"
        className={styles.range}
        min={0}
        max={VJ_LIMITS.fadeMsMax}
        step={VJ_LENGTH_MS_STEP}
        value={draft.value}
        style={{ "--fill": `${fillPercent}%` } as CSSProperties}
        aria-label={t("vj:transition.lengthAria", { value: secondsLabel })}
        aria-valuetext={secondsLabel}
        aria-disabled={isBlocked || undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          if (!isBlocked) draft.change(Number(event.currentTarget.value));
        }}
        onPointerUp={draft.release}
        onPointerCancel={draft.release}
        onKeyUp={draft.release}
        onBlur={draft.release}
        {...learnProps}
      />
      <span className={styles.msReadout} aria-hidden="true">
        {secondsLabel}
      </span>
    </div>
  );
}
