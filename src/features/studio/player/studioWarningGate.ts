import type {
  StudioPlaybackSettings,
  StudioQueueItem,
} from "./studioPlayerContext";

/** What an automatic move checks before it loads a track (spec 6.3, D5). */
export interface StudioWarningGate {
  /** "Ask before warned tracks" is on. */
  isAsking: boolean;
  /** Tracks this tab already agreed to hear. */
  consentedTrackIds: ReadonlySet<string>;
}

/**
 * The tracks the member chose to hear in this tab: a direct Play, Play it,
 * a jump in the queue, Play next or Add to queue. Module scope like the
 * forum's `useContentWarningReveal`. It lives in memory only, stays in this
 * browser, and is cleared on sign-out and Quick Exit with the rest of the
 * listener memory.
 */
const consentedTrackIds = new Set<string>();

export function consentToWarnedTrack(trackId: string): void {
  consentedTrackIds.add(trackId);
}

export function hasWarningConsent(trackId: string): boolean {
  return consentedTrackIds.has(trackId);
}

/** Sign-out, Quick Exit and a member change. */
export function clearStudioWarningConsent(): void {
  consentedTrackIds.clear();
}

/** The gate for one move: the setting (missing reads as on) and a copy of
 *  the consent set, so the reducer stays pure. */
export function warningGateOf(
  settings: Pick<StudioPlaybackSettings, "askBeforeWarnings">,
): StudioWarningGate {
  return {
    isAsking: settings.askBeforeWarnings !== false,
    consentedTrackIds: new Set(consentedTrackIds),
  };
}

export function isWarnedItem(
  item: Pick<StudioQueueItem, "contentWarnings">,
): boolean {
  return (item.contentWarnings?.length ?? 0) > 0;
}

/** True when this move must stop and ask before the item. A move without a
 *  gate (a jump, Play it) never asks. */
export function isWarningGated(
  item: StudioQueueItem | null | undefined,
  gate: StudioWarningGate | undefined,
): boolean {
  if (!item || !gate?.isAsking) return false;
  return isWarnedItem(item) && !gate.consentedTrackIds.has(item.trackId);
}
