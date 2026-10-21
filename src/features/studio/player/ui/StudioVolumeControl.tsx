import { useEffect, useRef, useState } from "react";
import { FiVolume1, FiVolume2, FiVolumeX } from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import { StudioIconSwap } from "./StudioIconSwap";
import { StudioRangeSlider } from "./range/StudioRangeSlider";
import styles from "./StudioPlayerControls.module.css";
import { useStudioShortcutHint } from "./useStudioShortcutHint";

/** A little past the 250ms --dur-base glide, for when transitionend never
 *  comes. */
const GLIDE_FALLBACK_MS = 300;

/** Desktop volume and mute (spec 7.11); phones use the hardware buttons. */
export function StudioVolumeControl() {
  const { t } = useTranslation();
  const { preferences, setVolume, toggleMute } = useStudioPlayer();
  const hintFor = useStudioShortcutHint();
  const muteLabel = preferences.isMuted
    ? t("studio:player.unmute")
    : t("studio:player.mute");
  const muteHint = hintFor(muteLabel, "mute");
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
  /** The level and mute state from before a drag began. */
  const gestureOriginRef = useRef<{ volume: number; isMuted: boolean } | null>(
    null,
  );
  const hasGestureEndedRef = useRef(false);
  // A cancelled drag (Escape or pointercancel) ends the preview, then commits
  // the origin value in the same tick. A commit that arrives after the end
  // and before the microtask clears the snapshot restores it exactly.
  const trackGesture = (previewPercent: number | null) => {
    if (previewPercent !== null) {
      hasGestureEndedRef.current = false;
      gestureOriginRef.current ??= {
        volume: preferences.volume,
        isMuted: preferences.isMuted,
      };
      return;
    }
    hasGestureEndedRef.current = true;
    queueMicrotask(() => {
      if (!hasGestureEndedRef.current) return;
      gestureOriginRef.current = null;
      hasGestureEndedRef.current = false;
    });
  };
  /** Any direct input on the slider ends the mute glide, then applies the
   *  level. */
  const applyVolumePercent = (nextPercent: number) => {
    setIsAnimatingFill(false);
    const gestureOrigin = gestureOriginRef.current;
    if (gestureOrigin && hasGestureEndedRef.current) {
      gestureOriginRef.current = null;
      hasGestureEndedRef.current = false;
      setVolume(gestureOrigin.volume);
      if (gestureOrigin.isMuted) toggleMute();
      return;
    }
    // Pointer values arrive as floats; a press at 0.4% counts as 0.
    const roundedPercent = Math.round(nextPercent);
    // Plan 2's setVolume unmutes on any level above 0, so this never calls
    // toggleMute after it (that would mute again).
    if (!preferences.isMuted) {
      setVolume(roundedPercent / 100);
      return;
    }
    // Muted, the slider sits at 0. Moving it to 0 keeps the mute and the
    // remembered level. A one-step nudge from 0 (an arrow key) unmutes at
    // the remembered level; a drag or a press on the track unmutes at the
    // chosen point.
    if (roundedPercent === 0) return;
    setVolume(
      roundedPercent <= 1
        ? Math.max(preferences.volume, roundedPercent / 100)
        : roundedPercent / 100,
    );
  };
  return (
    <div className={styles.volume}>
      <IconButton
        className={styles.iconButton}
        aria-label={muteLabel}
        aria-keyshortcuts={muteHint.ariaKeyShortcuts}
        tooltip={muteHint.tooltip}
        onClick={() => {
          // At a level of 0 the toggle moves nothing, so no glide starts.
          if (percent > 0) setIsAnimatingFill(true);
          toggleMute();
        }}
      >
        <StudioIconSwap iconKey={iconKind}>
          <Icon aria-hidden />
        </StudioIconSwap>
      </IconButton>
      <StudioRangeSlider
        variant="volume"
        min={0}
        max={100}
        value={shownPercent}
        commitMode="continuous"
        keySteps={{ arrow: 1, page: 10 }}
        inputStep={1}
        onCommit={applyVolumePercent}
        onPreviewChange={trackGesture}
        ariaLabel={t("studio:player.volume")}
        ariaValueText={t("studio:player.volumeValue", {
          percent: shownPercent,
        })}
        isGliding={isAnimatingFill}
        onGlideEnd={() => setIsAnimatingFill(false)}
        className={styles.volumeRange}
      />
    </div>
  );
}
