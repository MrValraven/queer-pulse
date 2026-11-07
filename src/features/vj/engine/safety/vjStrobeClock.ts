/**
 * The engine's strobe clock: the v1 strobe rules (`live/vjStrobe.ts`,
 * `screen/useVjStrobeFlash.ts`) moved onto the beat and the frame loop.
 * - Flash starts land on beats: every beat when a beat lasts
 *   VJ_STROBE_MIN_PERIOD_MS plus one frame or more, otherwise every second
 *   (or third) beat (the frame of margin keeps frame jitter near 150 BPM from
 *   pushing every other beat start under the floor and skipping it),
 *   and never closer than VJ_STROBE_MIN_PERIOD_MS to the last start, so at
 *   most 3 flashes show in any one-second window at any tempo, even with a
 *   frame of paint delay (four starts span at least 1200 ms).
 * - The run switches itself off VJ_LIMITS.strobeMaxDurationMs after this
 *   screen applied isStrobing: true, on this clock, whatever the input says
 *   after that. A repeated true keeps the original start.
 * - Only an enabled screen (the lead) flashes. The 10 s run counts either way,
 *   and a screen enabled halfway through a run waits a full
 *   VJ_STROBE_MIN_PERIOD_MS before its first flash. A strobe switched off and
 *   on again keeps the spacing from its last flash.
 * A beat period or index that is not a usable number falls back to time-based
 * flashes every VJ_STROBE_MIN_PERIOD_MS.
 *
 * Pure and deterministic: tickVjStrobe reads only its arguments and the clock
 * it mutates, and allocates nothing but its answer.
 */
import { VJ_LIMITS } from "../../../../shared/contracts/vj";
import {
  VJ_STROBE_FLASH_MS,
  VJ_STROBE_MIN_PERIOD_MS,
} from "../../live/vjStrobe";

export interface VjStrobeClock {
  /** When this screen applied isStrobing: true, or null while the strobe is off. */
  appliedAtMs: number | null;
  /** Start of the last flash, kept across runs for the spacing floor. */
  lastFlashStartMs: number;
  /** The flash stays up until this time. */
  flashUpUntilMs: number;
  /** The beat index of the last tick, to find each beat's first tick. */
  lastBeatIndex: number | null;
  wasEnabled: boolean;
  wasStrobing: boolean;
}

export interface VjStrobeTickInput {
  isStrobing: boolean;
  /** True on the lead screen only. */
  isEnabled: boolean;
  /** performance.now() time of this frame. */
  nowMs: number;
  /** Whole beats since the tempo's downbeat on the synced clock. */
  beatIndex: number;
  beatPeriodMs: number;
}

export interface VjStrobeTick {
  /** The white flash shows on this frame. */
  isFlashUp: boolean;
  /** The 10 s run has ended while the input still says isStrobing. */
  isRunOver: boolean;
  /** A flash started on this frame: request a "strobe" grant from the governor. */
  didStartFlash: boolean;
}

export function createVjStrobeClock(): VjStrobeClock {
  return {
    appliedAtMs: null,
    lastFlashStartMs: Number.NEGATIVE_INFINITY,
    flashUpUntilMs: Number.NEGATIVE_INFINITY,
    lastBeatIndex: null,
    wasEnabled: false,
    wasStrobing: false,
  };
}

/** One 60 Hz frame of margin over the floor, for frame-time jitter. */
export const VJ_STROBE_FRAME_MARGIN_MS = 1000 / 60;
/** A beat at least this long carries a flash on every beat (about 144 BPM). */
const VJ_STROBE_EVERY_BEAT_MIN_MS =
  VJ_STROBE_MIN_PERIOD_MS + VJ_STROBE_FRAME_MARGIN_MS;

/**
 * Beats between two flash starts: 1 when a beat lasts at least the floor
 * plus one frame, otherwise enough beats to span that.
 */
export function vjStrobeBeatsPerFlash(beatPeriodMs: number): number {
  if (beatPeriodMs >= VJ_STROBE_EVERY_BEAT_MIN_MS) return 1;
  return Math.ceil(VJ_STROBE_EVERY_BEAT_MIN_MS / beatPeriodMs);
}

function isUsableBeat(beatIndex: number, beatPeriodMs: number): boolean {
  return (
    Number.isFinite(beatPeriodMs) &&
    beatPeriodMs > 0 &&
    Number.isFinite(beatIndex)
  );
}

/** Whether this tick is the first of a beat that may carry a flash. */
function isFlashBeat(
  clock: VjStrobeClock,
  beatIndex: number,
  beatPeriodMs: number,
): boolean {
  if (!isUsableBeat(beatIndex, beatPeriodMs)) return true;
  const wholeBeat = Math.floor(beatIndex);
  if (wholeBeat === clock.lastBeatIndex) return false;
  const beatsPerFlash = vjStrobeBeatsPerFlash(beatPeriodMs);
  return ((wholeBeat % beatsPerFlash) + beatsPerFlash) % beatsPerFlash === 0;
}

const STROBE_OFF: VjStrobeTick = Object.freeze({
  isFlashUp: false,
  isRunOver: false,
  didStartFlash: false,
});

/** Advances the clock to input.nowMs and answers this frame's strobe. */
export function tickVjStrobe(
  clock: VjStrobeClock,
  input: VjStrobeTickInput,
): VjStrobeTick {
  const { isStrobing, isEnabled, nowMs, beatIndex, beatPeriodMs } = input;
  if (!Number.isFinite(nowMs)) return STROBE_OFF;

  const wasRunning = clock.wasStrobing && clock.appliedAtMs !== null;
  if (isStrobing && !clock.wasStrobing) clock.appliedAtMs = nowMs;
  if (!isStrobing) clock.appliedAtMs = null;

  const isRunOver =
    clock.appliedAtMs !== null &&
    nowMs - clock.appliedAtMs >= VJ_LIMITS.strobeMaxDurationMs;
  const isRunActive = isStrobing && !isRunOver;

  // Taking over a running strobe: wait a full period, as if a flash just started.
  if (isEnabled && !clock.wasEnabled && wasRunning && isRunActive) {
    clock.lastFlashStartMs = nowMs;
  }

  let didStartFlash = false;
  if (isRunActive && isEnabled) {
    const isOnFlashBeat = isFlashBeat(clock, beatIndex, beatPeriodMs);
    if (
      isOnFlashBeat &&
      nowMs - clock.lastFlashStartMs >= VJ_STROBE_MIN_PERIOD_MS
    ) {
      clock.lastFlashStartMs = nowMs;
      clock.flashUpUntilMs = nowMs + VJ_STROBE_FLASH_MS;
      didStartFlash = true;
    }
  } else {
    clock.flashUpUntilMs = Number.NEGATIVE_INFINITY;
  }

  clock.lastBeatIndex = isUsableBeat(beatIndex, beatPeriodMs)
    ? Math.floor(beatIndex)
    : null;
  clock.wasEnabled = isEnabled;
  clock.wasStrobing = isStrobing;

  return {
    isFlashUp: isRunActive && isEnabled && nowMs < clock.flashUpUntilMs,
    isRunOver: isStrobing && isRunOver,
    didStartFlash,
  };
}
