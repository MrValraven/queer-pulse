import { useSearchParams } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatTrackTime, type StudioTrackView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import type { StudioPlayButtonState } from "./kit/StudioPlayButton";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { parseStartSeconds } from "./player/studioTimestampLink";

export interface StudioTrackPlay {
  state: StudioPlayButtonState;
  toggle: () => void;
  label: string;
  blockedReason?: string;
  /** "Hide explicit tracks" hides this one: the hero offers no Play. */
  isHidden: boolean;
  /** "1:23" while a shared timestamp link (?t=) still applies. */
  startLabel: string | null;
}

/**
 * The track page's one Play, shared by the hero and the sticky header. A
 * shared timestamp link (?t=) applies until this track is the current one;
 * a hidden track or one without audio has no play to carry it.
 */
export function useStudioTrackPlay(track: StudioTrackView): StudioTrackPlay {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const [searchParams] = useSearchParams();
  const isHidden = useStudioHideExplicit() && track.isExplicit;
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isLoading = isCurrent && player.status === "loading";
  const startAtSeconds =
    isCurrent || isHidden || !track.hasAudio
      ? null
      : parseStartSeconds(searchParams, track.durationSeconds);
  const startLabel =
    startAtSeconds === null ? null : (formatTrackTime(startAtSeconds) ?? null);
  const isBlocked = !track.hasAudio;

  function toggle() {
    if (isBlocked) return;
    if (isCurrent) player.togglePlay();
    else if (startAtSeconds === null)
      void player.playRelease(track.releaseId, track.id);
    else void player.playRelease(track.releaseId, track.id, startAtSeconds);
  }

  const label = startLabel
    ? t("studio:player.playFromAria", { title: track.title, time: startLabel })
    : t(
        isPlaying || isLoading
          ? "studio:release.pauseTrack"
          : "studio:release.playTrack",
        { title: track.title },
      );
  return {
    state: isBlocked
      ? "blocked"
      : isLoading
        ? "loading"
        : isPlaying
          ? "playing"
          : "idle",
    toggle,
    label,
    blockedReason: isBlocked
      ? t("studio:hero.blocked.trackNoAudio")
      : undefined,
    isHidden,
    startLabel,
  };
}
