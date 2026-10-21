import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import type { StudioPlayButtonState } from "./kit/StudioPlayButton";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromRelease } from "./player/studioQueue";

export interface StudioReleasePlay {
  state: StudioPlayButtonState;
  toggle: () => void;
  /** The action a press takes now ("Play Night Bus" or "Pause Night Bus"). */
  label: string;
  /** Why Play is blocked, shown beside it; none while the hidden-track note
   *  says it instead. */
  blockedReason?: string;
  /** Every playable track is explicit and hidden, so Play has nothing to
   *  start; the hero says why. */
  isAllHidden: boolean;
  /** The tracks Play would start, in release order: what Play next and Add
   *  to queue take for the whole release. */
  audibleTrackIds: string[];
}

/**
 * The release's one Play: the hero and the sticky header share it, so both
 * toggle the same queue. It starts only the tracks with audio that the
 * member has not hidden, and a preview streams through its private link.
 */
export function useStudioReleasePlay(
  release: StudioReleaseView,
  previewToken?: string,
): StudioReleasePlay {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const hideExplicit = useStudioHideExplicit();
  const isPreview = previewToken !== undefined || release.isPreview;
  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isLoading = isCurrent && player.status === "loading";
  // The server refuses every stream on a taken-down release, owners included.
  const isStreamable = release.status !== "taken_down";
  const hiddenTrackIds = new Set(
    hideExplicit
      ? release.tracks
          .filter((track) => track.isExplicit)
          .map((track) => track.id)
      : [],
  );
  const audibleQueue = queueFromRelease(release, previewToken).filter(
    (item) => !hiddenTrackIds.has(item.trackId),
  );
  const hasHiddenAudibleTrack =
    audibleQueue.length < release.playableTrackCount;
  const isBlocked = !isStreamable || audibleQueue.length === 0;

  function toggle() {
    if (isBlocked) return;
    if (isCurrent) player.togglePlay();
    else if (isPreview || hasHiddenAudibleTrack)
      void player.playTracks(audibleQueue);
    else void player.playRelease(release.id);
  }

  const state: StudioPlayButtonState = isBlocked
    ? "blocked"
    : isLoading
      ? "loading"
      : isPlaying
        ? "playing"
        : "idle";
  const isAllHidden =
    isStreamable &&
    hideExplicit &&
    audibleQueue.length === 0 &&
    release.playableTrackCount > 0;
  const blockedReason =
    !isBlocked || isAllHidden
      ? undefined
      : t(
          isStreamable
            ? "studio:hero.blocked.noAudio"
            : "studio:hero.blocked.takenDown",
        );
  return {
    state,
    toggle,
    blockedReason,
    label: t(
      isPlaying || isLoading
        ? "studio:card.pauseRelease"
        : "studio:card.playRelease",
      { title: release.title },
    ),
    isAllHidden,
    audibleTrackIds: audibleQueue.map((item) => item.trackId),
  };
}
