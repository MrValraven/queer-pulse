import {
  DEFAULT_STUDIO_PLAYBACK,
  STUDIO_CROSSFADE_MAX_SECONDS,
  type StudioPlaybackPreferencesDTO,
  type StudioPlaybackUpdateDTO,
} from "./studio.types";
import { applyPlaybackPatch } from "./studioPlaybackPatch";

// The demo member's player settings, in memory for the session, so the
// settings page and the player read the same row with no network. The demo
// row starts with listening history on and no notice stamp
// (listeningNoticeSeenAt null), as the defaults hold.

let demoPlayback: StudioPlaybackPreferencesDTO = { ...DEFAULT_STUDIO_PLAYBACK };

const wholeSecondsInRange = (seconds: number) =>
  Math.min(STUDIO_CROSSFADE_MAX_SECONDS, Math.max(0, Math.round(seconds)));

export function demoGetStudioPlayback(): StudioPlaybackPreferencesDTO {
  return { ...demoPlayback };
}

/** As the server: a partial write, crossfade kept to whole seconds 0 to 12.
 *  `hasSeenListeningNotice: true` stamps listeningNoticeSeenAt once and the
 *  first stamp stays. */
export function demoPutStudioPlayback(
  patch: StudioPlaybackUpdateDTO,
): StudioPlaybackPreferencesDTO {
  const merged = applyPlaybackPatch(demoPlayback, patch, new Date());
  demoPlayback = {
    ...merged,
    crossfadeSeconds: wholeSecondsInRange(merged.crossfadeSeconds),
  };
  return { ...demoPlayback };
}

/** Test seam: back to the defaults. */
export function resetDemoPlayback(): void {
  demoPlayback = { ...DEFAULT_STUDIO_PLAYBACK };
}
