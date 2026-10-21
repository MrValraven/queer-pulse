import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_CROSSFADE_MAX_SECONDS } from "./api/studio.types";
import s from "./StudioCrossfadeSetting.module.css";

export interface StudioCrossfadeSettingProps {
  /** The stored crossfade length. */
  seconds: number;
  /** Until the stored value has loaded the slider does nothing. */
  isLoading?: boolean;
  /** Called once the slider is let go on a new length. */
  onCommit: (seconds: number) => void;
  /** Shows the heading and body above the slider (Settings). The player
   *  panel passes false and supplies its own heading. */
  hasHeading?: boolean;
  /** The id of a hint the caller shows beside the slider (the player
   *  panel's), added to the slider's description. */
  describedById?: string;
}

/**
 * The one crossfade control, used by Studio Settings and the player panel.
 * It moves freely and saves once let go, so a drag across the range sends
 * one write.
 */
export function StudioCrossfadeSetting({
  seconds,
  isLoading = false,
  onCommit,
  hasHeading = true,
  describedById,
}: StudioCrossfadeSettingProps) {
  const { t } = useTranslation();
  const bodyId = useId();
  const loadingId = useId();
  const [draftSeconds, setDraftSeconds] = useState<number | null>(null);
  const shownSeconds = draftSeconds ?? seconds;
  const isOff = shownSeconds === 0;
  const isAwaitingStoredValue = useRef(false);
  // After a commit the draft stays on screen until the stored value moves
  // (the optimistic write, then a rollback if the save is refused), so the
  // thumb never falls back to the old value for a frame.
  useEffect(() => {
    if (!isAwaitingStoredValue.current) return;
    isAwaitingStoredValue.current = false;
    setDraftSeconds(null);
  }, [seconds]);
  const commit = () => {
    if (draftSeconds === null) return;
    if (draftSeconds === seconds) {
      setDraftSeconds(null);
      return;
    }
    isAwaitingStoredValue.current = true;
    onCommit(draftSeconds);
  };
  const describedBy =
    [
      hasHeading ? bodyId : null,
      describedById ?? null,
      isLoading ? loadingId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className={s.root}>
      {hasHeading && (
        <div className={s.text}>
          <h3>{t("studio:settingsLive.crossfade.heading")}</h3>
          <p id={bodyId}>{t("studio:settingsLive.crossfade.body")}</p>
        </div>
      )}
      <div className={s.rangeRow}>
        <input
          type="range"
          className={s.range}
          min={0}
          max={STUDIO_CROSSFADE_MAX_SECONDS}
          step={1}
          value={shownSeconds}
          style={
            {
              "--fill": `${(shownSeconds / STUDIO_CROSSFADE_MAX_SECONDS) * 100}%`,
            } as CSSProperties
          }
          aria-disabled={isLoading || undefined}
          aria-describedby={describedBy}
          aria-label={t("studio:settingsLive.crossfade.sliderLabel")}
          aria-valuetext={
            isOff
              ? t("studio:settingsLive.crossfade.off")
              : t("studio:settingsLive.crossfade.valueText", {
                  count: shownSeconds,
                })
          }
          onChange={(event) => {
            if (!isLoading) setDraftSeconds(Number(event.target.value));
          }}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
        <span className={s.rangeValue} aria-hidden>
          {isOff
            ? t("studio:settingsLive.crossfade.off")
            : t("studio:settingsLive.crossfade.seconds", {
                count: shownSeconds,
              })}
        </span>
        {isLoading && (
          <span id={loadingId} className={s.srOnly}>
            {t("studio:settingsLive.loadingReason")}
          </span>
        )}
      </div>
    </div>
  );
}
