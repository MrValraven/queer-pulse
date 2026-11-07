/**
 * The measured safety net behind the flash governor (design 5, plan decision
 * 7). Every probe reading of the canvas output goes through
 * measureVjWindows; per window the net finds WCAG 2.3.1 transitions:
 * - general: a change of 0.1 or more in relative luminance from the last
 *   extreme, opposite in direction to the previous transition, with the
 *   darker side under 0.8;
 * - red: a change of 20 or more in red value from the last extreme, opposite
 *   in direction to the previous transition, with either side a saturated red.
 * Two opposing transitions make one flash, so the flashes in the last second
 * are half the transitions in it, rounded down. The answer carries the most
 * flashes any window saw in the last 1000 ms (both ends included).
 *
 * It acts one flash early: once any window reaches 3 flashes in a second the
 * output pass limits every pixel's change to VJ_SLEW_SRGB_PER_SECOND for the
 * next VJ_SMOOTHING_MS, measured from the last reading that reached 3.
 *
 * Mutable for the hot path: every buffer is allocated by createVjLuminanceNet
 * and observeVjProbe allocates nothing. The answer object is reused; read it
 * before the next call.
 */
import {
  VJ_PROBE_BYTE_LENGTH,
  VJ_WINDOW_COUNT,
  measureVjWindows,
} from "./vjLuminanceWindows";

export const VJ_SMOOTHING_MS = 1000;
export const VJ_SLEW_SRGB_PER_SECOND = 0.2;
/** Flashes in one second that start the smoothing (one under the WCAG limit). */
export const VJ_SMOOTHING_FLASH_TRIGGER = 3;
/** The window the flash counts look back over. */
export const VJ_NET_WINDOW_MS = 1000;
/** WCAG general flash: a relative luminance change of at least 10%. */
export const VJ_GENERAL_TRANSITION_MIN = 0.1;
/** WCAG general flash: the darker side is under 0.8. */
export const VJ_GENERAL_DARKER_SIDE_MAX = 0.8;
/** WCAG red flash: a red value change of at least 20. */
export const VJ_RED_TRANSITION_MIN = 20;
/** Transitions kept per window; the counts saturate at half of it. */
export const VJ_TRANSITION_RING_SIZE = 32;

/** Frame deltas the slew limit reads: under 1 ms or unknown reads as one 60 Hz frame. */
const DEFAULT_FRAME_DELTA_MS = 1000 / 60;
/** Longer frames are slewed as if 20 fps, so a stall never opens the limit. */
const MAX_FRAME_DELTA_MS = 50;
/** One RGBA8 channel step: the output targets store whole steps of this. */
export const VJ_RGBA8_STEP = 1 / 255;
/**
 * The limit sent on a frame whose allowance has not reached a whole step:
 * above zero so the limit stays on, under half a step so RGBA8 rounding
 * stores the previous frame unchanged.
 */
export const VJ_SLEW_HOLD_LIMIT = VJ_RGBA8_STEP / 4;
/** Absorbs float error when the allowance lands exactly on a step. */
const SLEW_STEP_EPSILON = 1e-6;

const DIRECTION_NONE = 0;
const DIRECTION_RISING = 1;
const DIRECTION_FALLING = -1;

/** One kind of transition (general or red) tracked for every window. */
interface VjTransitionTrack {
  /** Lowest value since the last rising transition (or since the start). */
  readonly low: Float64Array;
  /** Highest value since the last falling transition (or since the start). */
  readonly high: Float64Array;
  readonly isLowSaturated: Uint8Array;
  readonly isHighSaturated: Uint8Array;
  /** DIRECTION_NONE, DIRECTION_RISING or DIRECTION_FALLING. */
  readonly direction: Int8Array;
  /** VJ_TRANSITION_RING_SIZE transition times per window. */
  readonly transitionTimesMs: Float64Array;
  readonly nextSlot: Uint16Array;
  readonly minimumChange: number;
  readonly isRed: boolean;
}

export interface VjLuminanceNet {
  readonly general: VjTransitionTrack;
  readonly red: VjTransitionTrack;
  readonly windowLuminance: Float32Array;
  readonly windowRed: Float32Array;
  readonly windowSaturatedRed: Uint8Array;
  hasObserved: boolean;
  lastObservedAtMs: number;
  smoothingUntilMs: number;
  /** Slew allowance (sRGB units) built up across frames and not yet sent as a whole RGBA8 step. */
  slewAllowance: number;
  readonly answer: {
    generalFlashesLastSecond: number;
    redFlashesLastSecond: number;
    isSmoothing: boolean;
  };
}

function createTrack(minimumChange: number, isRed: boolean): VjTransitionTrack {
  return {
    low: new Float64Array(VJ_WINDOW_COUNT),
    high: new Float64Array(VJ_WINDOW_COUNT),
    isLowSaturated: new Uint8Array(VJ_WINDOW_COUNT),
    isHighSaturated: new Uint8Array(VJ_WINDOW_COUNT),
    direction: new Int8Array(VJ_WINDOW_COUNT),
    transitionTimesMs: new Float64Array(
      VJ_WINDOW_COUNT * VJ_TRANSITION_RING_SIZE,
    ).fill(Number.NEGATIVE_INFINITY),
    nextSlot: new Uint16Array(VJ_WINDOW_COUNT),
    minimumChange,
    isRed,
  };
}

export function createVjLuminanceNet(): VjLuminanceNet {
  return {
    general: createTrack(VJ_GENERAL_TRANSITION_MIN, false),
    red: createTrack(VJ_RED_TRANSITION_MIN, true),
    windowLuminance: new Float32Array(VJ_WINDOW_COUNT),
    windowRed: new Float32Array(VJ_WINDOW_COUNT),
    windowSaturatedRed: new Uint8Array(VJ_WINDOW_COUNT),
    hasObserved: false,
    lastObservedAtMs: Number.NEGATIVE_INFINITY,
    smoothingUntilMs: Number.NEGATIVE_INFINITY,
    slewAllowance: 0,
    answer: {
      generalFlashesLastSecond: 0,
      redFlashesLastSecond: 0,
      isSmoothing: false,
    },
  };
}

function resetTrack(track: VjTransitionTrack): void {
  track.direction.fill(DIRECTION_NONE);
  track.transitionTimesMs.fill(Number.NEGATIVE_INFINITY);
  track.nextSlot.fill(0);
}

/** Starts a window's extremes at its first reading. */
function seedTrack(
  track: VjTransitionTrack,
  windowIndex: number,
  value: number,
  isSaturated: number,
): void {
  track.low[windowIndex] = value;
  track.high[windowIndex] = value;
  track.isLowSaturated[windowIndex] = isSaturated;
  track.isHighSaturated[windowIndex] = isSaturated;
  track.direction[windowIndex] = DIRECTION_NONE;
}

/** Whether a change between these two sides is a WCAG transition of this track's kind. */
function isQualifyingPair(
  track: VjTransitionTrack,
  darkerValue: number,
  isEitherSideSaturated: boolean,
): boolean {
  return track.isRed
    ? isEitherSideSaturated
    : darkerValue < VJ_GENERAL_DARKER_SIDE_MAX;
}

function recordTransition(
  track: VjTransitionTrack,
  windowIndex: number,
  atMs: number,
): void {
  const slot = track.nextSlot[windowIndex] ?? 0;
  track.transitionTimesMs[windowIndex * VJ_TRANSITION_RING_SIZE + slot] = atMs;
  track.nextSlot[windowIndex] = (slot + 1) % VJ_TRANSITION_RING_SIZE;
}

/** Feeds one window's reading to a track; records a transition when one completes. */
function stepTrack(
  track: VjTransitionTrack,
  windowIndex: number,
  value: number,
  isSaturated: number,
  atMs: number,
): void {
  const direction = track.direction[windowIndex] ?? DIRECTION_NONE;
  const low = track.low[windowIndex] ?? 0;
  const high = track.high[windowIndex] ?? 0;
  const canRise = direction !== DIRECTION_RISING;
  const canFall = direction !== DIRECTION_FALLING;
  if (
    canRise &&
    value - low >= track.minimumChange &&
    isQualifyingPair(
      track,
      low,
      isSaturated === 1 || track.isLowSaturated[windowIndex] === 1,
    )
  ) {
    track.direction[windowIndex] = DIRECTION_RISING;
    track.high[windowIndex] = value;
    track.isHighSaturated[windowIndex] = isSaturated;
    recordTransition(track, windowIndex, atMs);
    return;
  }
  if (
    canFall &&
    high - value >= track.minimumChange &&
    isQualifyingPair(
      track,
      value,
      isSaturated === 1 || track.isHighSaturated[windowIndex] === 1,
    )
  ) {
    track.direction[windowIndex] = DIRECTION_FALLING;
    track.low[windowIndex] = value;
    track.isLowSaturated[windowIndex] = isSaturated;
    recordTransition(track, windowIndex, atMs);
    return;
  }
  // Extend the extreme the next transition is measured from.
  if (canFall && value > high) {
    track.high[windowIndex] = value;
    track.isHighSaturated[windowIndex] = isSaturated;
  }
  if (canRise && value < low) {
    track.low[windowIndex] = value;
    track.isLowSaturated[windowIndex] = isSaturated;
  }
}

/** Most flashes any window saw in the last VJ_NET_WINDOW_MS, both ends included. */
function mostFlashesLastSecond(track: VjTransitionTrack, atMs: number): number {
  let mostTransitions = 0;
  for (let windowIndex = 0; windowIndex < VJ_WINDOW_COUNT; windowIndex += 1) {
    const ringStart = windowIndex * VJ_TRANSITION_RING_SIZE;
    let transitions = 0;
    for (let slot = 0; slot < VJ_TRANSITION_RING_SIZE; slot += 1) {
      const transitionAtMs =
        track.transitionTimesMs[ringStart + slot] ?? Number.NEGATIVE_INFINITY;
      if (atMs - transitionAtMs <= VJ_NET_WINDOW_MS) {
        transitions += 1;
      }
    }
    if (transitions > mostTransitions) mostTransitions = transitions;
  }
  return Math.floor(mostTransitions / 2);
}

/**
 * Feeds one probe reading taken at atMs (performance.now() time) and answers
 * the flash counts and whether the output pass should slew. A reading that is
 * too short or a time that is not finite changes nothing. A time earlier than
 * the last reading means the clock went back: the transitions are forgotten
 * and the smoothing holds for a full VJ_SMOOTHING_MS to cover what was lost.
 */
export function observeVjProbe(
  net: VjLuminanceNet,
  pixels: Uint8Array,
  atMs: number,
): {
  generalFlashesLastSecond: number;
  redFlashesLastSecond: number;
  isSmoothing: boolean;
} {
  if (!Number.isFinite(atMs) || pixels.length < VJ_PROBE_BYTE_LENGTH) {
    return net.answer;
  }
  if (net.hasObserved && atMs < net.lastObservedAtMs) {
    resetTrack(net.general);
    resetTrack(net.red);
    net.hasObserved = false;
    net.smoothingUntilMs = atMs + VJ_SMOOTHING_MS;
  }
  measureVjWindows(
    pixels,
    net.windowLuminance,
    net.windowRed,
    net.windowSaturatedRed,
  );
  for (let windowIndex = 0; windowIndex < VJ_WINDOW_COUNT; windowIndex += 1) {
    const luminance = net.windowLuminance[windowIndex] ?? 0;
    const redValue = net.windowRed[windowIndex] ?? 0;
    const isSaturated = net.windowSaturatedRed[windowIndex] ?? 0;
    if (net.hasObserved) {
      stepTrack(net.general, windowIndex, luminance, 0, atMs);
      stepTrack(net.red, windowIndex, redValue, isSaturated, atMs);
    } else {
      seedTrack(net.general, windowIndex, luminance, 0);
      seedTrack(net.red, windowIndex, redValue, isSaturated);
    }
  }
  net.hasObserved = true;
  net.lastObservedAtMs = atMs;

  const generalFlashes = mostFlashesLastSecond(net.general, atMs);
  const redFlashes = mostFlashesLastSecond(net.red, atMs);
  if (
    generalFlashes >= VJ_SMOOTHING_FLASH_TRIGGER ||
    redFlashes >= VJ_SMOOTHING_FLASH_TRIGGER
  ) {
    net.smoothingUntilMs = atMs + VJ_SMOOTHING_MS;
  }
  net.answer.generalFlashesLastSecond = generalFlashes;
  net.answer.redFlashesLastSecond = redFlashes;
  net.answer.isSmoothing = atMs < net.smoothingUntilMs;
  return net.answer;
}

/**
 * Whether the smoothing still holds at nowMs, for frames between two probe
 * readings. A time that is not a number answers true: slewing is the safe side.
 */
export function isVjLuminanceNetSmoothing(
  net: VjLuminanceNet,
  nowMs: number,
): boolean {
  return !(nowMs >= net.smoothingUntilMs);
}

/**
 * The output pass's per-frame slew limit in sRGB units (uSlewLimit). Always
 * above zero, since zero turns the limit off: an unknown or non-positive
 * delta reads as one 60 Hz frame, and a long frame is capped at 50 ms so a
 * stall never lets a full swing through in one frame.
 */
export function vjSlewLimitPerFrame(frameDeltaMs: number): number {
  const deltaMs =
    Number.isFinite(frameDeltaMs) && frameDeltaMs > 0
      ? Math.min(frameDeltaMs, MAX_FRAME_DELTA_MS)
      : DEFAULT_FRAME_DELTA_MS;
  return (VJ_SLEW_SRGB_PER_SECOND * deltaMs) / 1000;
}

/**
 * The output pass's uSlewLimit for this frame, in whole RGBA8 steps. The
 * output targets are RGBA8, so a per-frame limit under one step (0.2/s at
 * 120 Hz is about 0.43 of a step) rounds back to the previous value and the
 * picture freezes, then cuts when the smoothing ends. This builds the
 * allowance up across frames and spends it in whole steps, so the speed is
 * VJ_SLEW_SRGB_PER_SECOND at any refresh rate. A frame with less than one
 * step held back sends VJ_SLEW_HOLD_LIMIT. Answers 0 (limit off) and drops
 * the allowance once the smoothing has ended.
 */
export function vjOutputSlewLimit(
  net: VjLuminanceNet,
  nowMs: number,
  frameDeltaMs: number,
): number {
  if (!isVjLuminanceNetSmoothing(net, nowMs)) {
    net.slewAllowance = 0;
    return 0;
  }
  net.slewAllowance += vjSlewLimitPerFrame(frameDeltaMs);
  const wholeSteps = Math.floor(
    net.slewAllowance / VJ_RGBA8_STEP + SLEW_STEP_EPSILON,
  );
  if (wholeSteps < 1) return VJ_SLEW_HOLD_LIMIT;
  net.slewAllowance = Math.max(
    0,
    net.slewAllowance - wholeSteps * VJ_RGBA8_STEP,
  );
  return wholeSteps * VJ_RGBA8_STEP;
}
