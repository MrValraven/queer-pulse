import { useEffect, useState, type CSSProperties } from "react";
import { FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import { StudioIconSwap } from "./StudioIconSwap";
import styles from "./StudioPlayerControls.module.css";

const SLIDER_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);
/** A little past the 250ms --dur-base glide, for when transitionend never
 *  comes. */
const GLIDE_FALLBACK_MS = 300;

/** Desktop volume and mute (spec 7.11); phones use the hardware buttons. */
export function StudioVolumeControl() {
  const { t } = useTranslation();
  const { preferences, setVolume, toggleMute } = useStudioPlayer();
  const percent = Math.round(preferences.volume * 100);
  const shownPercent = preferences.isMuted ? 0 : percent;
  const iconKind =
    shownPercent === 0 ? "muted" : shownPercent < 50 ? "low" : "high";
  const Icon =
    iconKind === "muted"
      ? FiVolumeX
      : iconKind === "low"
        ? FiVolume1
        : FiVolume2;
  /** True for the one glide a mute toggle starts; any direct input on the
   *  slider ends it, so a drag never trails the pointer. */
  const [isAnimatingFill, setIsAnimatingFill] = useState(false);
  // A hidden slider (1180px and below) never fires transitionend, so the
  // glide flag also clears itself just after the --dur-base glide would end.
  useEffect(() => {
    if (!isAnimatingFill) return;
    const glideTimeoutId = window.setTimeout(
      () => setIsAnimatingFill(false),
      GLIDE_FALLBACK_MS,
    );
    return () => window.clearTimeout(glideTimeoutId);
  }, [isAnimatingFill]);
  return (
    <div className={styles.volume}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={
          preferences.isMuted
            ? t("studio:player.unmute")
            : t("studio:player.mute")
        }
        onClick={() => {
          // At a level of 0 the toggle moves nothing, so no glide starts.
          if (percent > 0) setIsAnimatingFill(true);
          toggleMute();
        }}
      >
        <StudioIconSwap iconKey={iconKind}>
          <Icon aria-hidden />
        </StudioIconSwap>
      </button>
      <input
        type="range"
        className={styles.volumeSlider}
        min={0}
        max={100}
        step={1}
        value={shownPercent}
        style={{ "--volume-fill": shownPercent / 100 } as CSSProperties}
        data-animating={isAnimatingFill ? "" : undefined}
        aria-label={t("studio:player.volume")}
        aria-valuetext={t("studio:player.volumeValue", {
          percent: shownPercent,
        })}
        onTransitionEnd={(event) => {
          if (event.propertyName === "--volume-fill") setIsAnimatingFill(false);
        }}
        onTransitionCancel={(event) => {
          if (event.propertyName === "--volume-fill") setIsAnimatingFill(false);
        }}
        onPointerDown={() => setIsAnimatingFill(false)}
        onKeyDown={(event) => {
          setIsAnimatingFill(false);
          // The slider steps itself; the window-level arrow shortcuts stay out.
          if (SLIDER_KEYS.has(event.key)) event.stopPropagation();
        }}
        onChange={(event) => {
          const nextPercent = Number(event.target.value);
          // Plan 2's setVolume unmutes on any level above 0, so this handler
          // never calls toggleMute after it (that would mute again).
          if (!preferences.isMuted) {
            setVolume(nextPercent / 100);
            return;
          }
          // Muted, the slider sits at 0. Moving it to 0 keeps the mute and
          // the remembered level. A one-step nudge from 0 (an arrow key)
          // unmutes at the remembered level; a drag or a press on the track
          // unmutes at the chosen point.
          if (nextPercent === 0) return;
          setVolume(
            nextPercent <= 1
              ? Math.max(preferences.volume, nextPercent / 100)
              : nextPercent / 100,
          );
        }}
      />
    </div>
  );
}
