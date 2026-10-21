import { useSyncExternalStore } from "react";
import type { StudioFailureReason } from "../studioReason";

/**
 * What the player bar says beside the play state: a buffering wait, why the
 * last play failed, a refused autoplay and an offline pause. One store for
 * the one app-wide player. The engine and the playback commands write it;
 * the bar, the mini player and Now playing read it. Nothing in it leaves
 * the browser.
 */
export interface StudioPlaybackSignals {
  /** The active deck waits for data while it should be playing. */
  isBuffering: boolean;
  /** Why the current track can't play; null while nothing failed. */
  failureReason: StudioFailureReason | null;
  /** The browser refused to start without a tap. */
  isAutoplayBlocked: boolean;
  /** Paused because the device went offline; it resumes once back, if
   *  that is soon enough. */
  isPausedForOffline: boolean;
  /** When the offline pause began (Date.now()); null with no such pause. */
  offlinePausedAtMs: number | null;
}

export const IDLE_PLAYBACK_SIGNALS: StudioPlaybackSignals = {
  isBuffering: false,
  failureReason: null,
  isAutoplayBlocked: false,
  isPausedForOffline: false,
  offlinePausedAtMs: null,
};

/** How long after an offline pause coming back online still resumes on its
 *  own. Later, the member presses play themselves. */
export const OFFLINE_AUTO_RESUME_WINDOW_MS = 3 * 60_000;

let currentSignals: StudioPlaybackSignals = IDLE_PLAYBACK_SIGNALS;
/** The reason the active deck's media element gave for its last error. */
let lastMediaFailureReason: StudioFailureReason | null = null;
const signalListeners = new Set<() => void>();

function subscribeSignals(listener: () => void): () => void {
  signalListeners.add(listener);
  return () => signalListeners.delete(listener);
}

export function readPlaybackSignals(): StudioPlaybackSignals {
  return currentSignals;
}

/** Merges a patch; listeners hear only a real change. */
export function setPlaybackSignals(
  patch: Partial<StudioPlaybackSignals>,
): void {
  const next = { ...currentSignals, ...patch };
  const hasChanged = (
    Object.keys(next) as (keyof StudioPlaybackSignals)[]
  ).some((signalName) => next[signalName] !== currentSignals[signalName]);
  if (!hasChanged) return;
  currentSignals = next;
  signalListeners.forEach((listener) => listener());
}

/** The member pressed play or pause themselves: an offline pause no longer
 *  resumes on its own. */
export function noteMemberPlayToggle(): void {
  setPlaybackSignals({ isPausedForOffline: false, offlinePausedAtMs: null });
}

/** A stop, a sign-out or an emptied queue: nothing is left to explain. */
export function resetPlaybackSignals(): void {
  lastMediaFailureReason = null;
  setPlaybackSignals(IDLE_PLAYBACK_SIGNALS);
}

export function useStudioPlaybackSignals(): StudioPlaybackSignals {
  return useSyncExternalStore(
    subscribeSignals,
    readPlaybackSignals,
    () => IDLE_PLAYBACK_SIGNALS,
  );
}

function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** HTMLMediaElement error codes (MediaError). */
const MEDIA_ERROR_NETWORK = 2;
export const MEDIA_ERROR_SOURCE_NOT_SUPPORTED = 4;

/** A media element's error code as a reason a member can act on. A network
 *  error reads as offline while the device is offline. A source the element
 *  refuses after the silent refresh and the plain retry is a file that is
 *  gone or broken. Decode errors stay "unknown". */
export function studioMediaFailureReasonOf(
  errorCode: number | undefined,
): StudioFailureReason {
  if (isDeviceOffline()) return "offline";
  if (errorCode === MEDIA_ERROR_NETWORK) return "unreachable";
  if (errorCode === MEDIA_ERROR_SOURCE_NOT_SUPPORTED) return "notFound";
  return "unknown";
}

/** The engine notes the active deck's error before it reports `failed`. */
export function noteMediaFailure(reason: StudioFailureReason): void {
  lastMediaFailureReason = reason;
}

/** The reason the last media failure gave, read once. */
export function takeMediaFailureReason(): StudioFailureReason {
  const reason = lastMediaFailureReason;
  lastMediaFailureReason = null;
  return reason ?? (isDeviceOffline() ? "offline" : "unknown");
}
