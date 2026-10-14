import {
  DEFAULT_STUDIO_PLAYBACK,
  STUDIO_CROSSFADE_MAX_SECONDS,
  type StudioPlaybackPreferencesDTO,
} from "./studio.types";

// The demo member's player settings, in memory for the session, so the
// settings page and the player read the same row with no network.

let demoPlayback: StudioPlaybackPreferencesDTO = { ...DEFAULT_STUDIO_PLAYBACK };

const wholeSecondsInRange = (seconds: number) =>
  Math.min(STUDIO_CROSSFADE_MAX_SECONDS, Math.max(0, Math.round(seconds)));

export function demoGetStudioPlayback(): StudioPlaybackPreferencesDTO {
  return { ...demoPlayback };
}

/** As the server: a partial write, crossfade kept to whole seconds 0 to 12. */
export function demoPutStudioPlayback(
  patch: Partial<StudioPlaybackPreferencesDTO>,
): StudioPlaybackPreferencesDTO {
  demoPlayback = {
    ...demoPlayback,
    ...patch,
    crossfadeSeconds: wholeSecondsInRange(
      patch.crossfadeSeconds ?? demoPlayback.crossfadeSeconds,
    ),
  };
  return { ...demoPlayback };
}

/** Test seam: back to the defaults. */
export function resetDemoPlayback(): void {
  demoPlayback = { ...DEFAULT_STUDIO_PLAYBACK };
}
