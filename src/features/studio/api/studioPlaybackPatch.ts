import type {
  StudioPlaybackPreferencesDTO,
  StudioPlaybackUpdateDTO,
} from "./studio.types";

/** The row after a PUT: the flag stamps listeningNoticeSeenAt once and never
 *  reaches the row. Every other field in the patch replaces its value; the
 *  first stamp stays for good, as the server keeps it. */
export function applyPlaybackPatch(
  previous: StudioPlaybackPreferencesDTO,
  patch: StudioPlaybackUpdateDTO,
  now: Date,
): StudioPlaybackPreferencesDTO {
  const { hasSeenListeningNotice, ...fields } = patch;
  const merged: StudioPlaybackPreferencesDTO = { ...previous, ...fields };
  const isFirstStamp =
    hasSeenListeningNotice === true && previous.listeningNoticeSeenAt == null;
  return isFirstStamp
    ? { ...merged, listeningNoticeSeenAt: now.toISOString() }
    : merged;
}

/** Missing reads as on (an older server, or a fixture from before Part 2). */
export function isListeningHistoryOnIn(
  row: StudioPlaybackPreferencesDTO | undefined,
): boolean {
  return row?.isListeningHistoryOn ?? true;
}
