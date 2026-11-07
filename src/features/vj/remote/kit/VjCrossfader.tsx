import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { roundVjAmount } from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VJ_DRAG_THROTTLE_MS } from "../../vj.constants";
import {
  createVjTrailingSender,
  type VjTrailingSender,
} from "../rules/vjThrottle";
import styles from "./VjRemoteKit.module.css";

/** The slider runs on whole percent steps, which map to the 0.01 amount step. */
const VJ_CROSSFADER_STEPS = 100;

function toSliderValue(amount: number): number {
  return Math.round(roundVjAmount(amount) * VJ_CROSSFADER_STEPS);
}

function toAmount(sliderValue: number): number {
  return roundVjAmount(sliderValue / VJ_CROSSFADER_STEPS);
}

/** The drag stream: at most one value per VJ_DRAG_THROTTLE_MS while the
 *  fader moves, and the final value always goes out on release. The newest
 *  onChange is read through a ref, so the sender lives for the whole mount. */
function useVjCrossfaderStream(
  onChange: (value: number) => void,
  isBlocked: boolean,
) {
  const onChangeRef = useRef(onChange);
  const isBlockedRef = useRef(isBlocked);
  useEffect(() => {
    onChangeRef.current = onChange;
    isBlockedRef.current = isBlocked;
  });
  const senderRef = useRef<VjTrailingSender<number> | null>(null);
  function getSender(): VjTrailingSender<number> {
    senderRef.current ??= createVjTrailingSender<number>({
      intervalMs: VJ_DRAG_THROTTLE_MS,
      // A trailing value due after the fader turned blocked stays unsent.
      send: (value) => {
        if (!isBlockedRef.current) onChangeRef.current(value);
      },
    });
    return senderRef.current;
  }
  useEffect(() => () => senderRef.current?.cancel(), []);
  return {
    push: (value: number) => getSender().push(value, performance.now()),
    flush: () => senderRef.current?.flushNow(),
    cancel: () => senderRef.current?.cancel(),
  };
}

export interface VjCrossfaderProps {
  /** The mix share, 0 (all live) to 1 (all mix clip). */
  value: number;
  /** A moved value, throttled to one per VJ_DRAG_THROTTLE_MS. */
  onChange: (value: number) => void;
  /** The drag ended (pointer up or cancel, key up, blur), after the final
   *  value went out through onChange. */
  onRelease: () => void;
  /** Offline or held: the fader keeps focus and moves nowhere. */
  isBlocked: boolean;
  describedBy?: string;
  /** False when the mix layer is empty: the fader dims and says so. */
  hasMixClip: boolean;
}

/**
 * The live and mix crossfader: a native range (a real slider for assistive
 * tech, with the mix share spoken as a percent), a 44px thumb, Live on the
 * start edge and Mix on the end edge. While the finger is down it shows its
 * own position and streams values through the send throttle; on release it
 * sends the final value and hands the display back to `value`.
 */
export function VjCrossfader({
  value,
  onChange,
  onRelease,
  isBlocked,
  describedBy,
  hasMixClip,
}: VjCrossfaderProps) {
  const { t } = useTranslation();
  const noClipId = useId();
  const stream = useVjCrossfaderStream(onChange, isBlocked);
  const [draftValue, setDraftValue] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  const shownValue =
    !isBlocked && draftValue !== null ? draftValue : toSliderValue(value);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isBlocked) return;
    const sliderValue = Number(event.currentTarget.value);
    isDraggingRef.current = true;
    setDraftValue(sliderValue);
    stream.push(toAmount(sliderValue));
  };

  const handleRelease = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setDraftValue(null);
    if (isBlocked) {
      stream.cancel();
      return;
    }
    stream.flush();
    onRelease();
  };

  const describedByIds =
    [describedBy, hasMixClip ? null : noClipId].filter(Boolean).join(" ") ||
    undefined;
  const rangeStyle = { "--fill": `${shownValue}%` } as CSSProperties;

  return (
    <div
      className={styles.crossfader}
      data-vj-crossfader=""
      data-has-mix-clip={hasMixClip ? "true" : "false"}
    >
      <span className={styles.endLabel} aria-hidden="true">
        {t("vj:mix.liveSide")}
      </span>
      <input
        type="range"
        className={styles.range}
        min={0}
        max={VJ_CROSSFADER_STEPS}
        step={1}
        value={shownValue}
        style={rangeStyle}
        aria-label={t("vj:mix.crossfader")}
        aria-valuenow={shownValue}
        aria-valuetext={t("vj:mix.crossfaderValue", { percent: shownValue })}
        aria-disabled={isBlocked || undefined}
        aria-describedby={describedByIds}
        onChange={handleChange}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
        onKeyUp={handleRelease}
        onBlur={handleRelease}
      />
      <span className={styles.endLabel} aria-hidden="true">
        {t("vj:mix.mixSide")}
      </span>
      {/* Always in the DOM and read only as the slider's description,
          which points at it while the mix layer is empty. */}
      <span id={noClipId} className={styles.visuallyHidden} aria-hidden="true">
        {t("vj:mix.noClip")}
      </span>
    </div>
  );
}
