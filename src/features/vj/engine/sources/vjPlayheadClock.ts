/**
 * The playhead of one source on our own clock: forward, frozen, stuttering,
 * reverse or ping-pong inside a loop window (contract 3.2 time effects and
 * 6.1 playback defaults). GIFs run on it for every frame; videos run on it
 * while a time effect replays the frame ring.
 *
 * `advanceVjPlayhead` runs once per animation frame per source. It answers
 * the same object when nothing moved (frozen) so a held frame allocates
 * nothing.
 */
import {
  VJ_EFFECT_CATALOG,
  type VjEffectId,
  type VjEffectSettings,
  type VjLoopMode,
  type VjSpeed,
} from "../../../../shared/contracts/vj";
import { vjEffectivePlaybackRate } from "../../live/vjEffectsStyle";

export type VjPlayheadMode =
  "forward" | "frozen" | "stutter" | "reverse" | "pingPong";

export interface VjPlayheadEffects {
  mode: VjPlayheadMode;
  /** Media milliseconds per wall clock millisecond. */
  rate: number;
  /** Length of the repeated slice in beats: `1 - 0.75 * amount` (contract 3.2). */
  stutterSliceBeats: number;
}

export interface VjPlayhead {
  positionMs: number;
  direction: 1 | -1;
  /** Where the slice being repeated starts; null while the stutter is off. */
  stutterAnchorMs: number | null;
  /** `floor(beats / stutterSliceBeats)` of the last frame; null while the stutter is off. */
  stutterSliceIndex: number | null;
}

export interface VjPlayheadWindow {
  startMs: number;
  endMs: number;
}

/** Each stutter slice plays this many times before the anchor moves on. */
export const VJ_STUTTER_SLICE_REPEATS = 2;

const MIN_STUTTER_SLICE_BEATS = 0.25;

export function initialVjPlayhead(startMs = 0): VjPlayhead {
  return {
    positionMs: Number.isFinite(startMs) ? startMs : 0,
    direction: 1,
    stutterAnchorMs: null,
    stutterSliceIndex: null,
  };
}

function isEffectOn(settings: VjEffectSettings, effectId: VjEffectId): boolean {
  return settings[effectId]?.isOn === true;
}

function stutterSliceBeatsOf(settings: VjEffectSettings): number {
  const rawAmount =
    settings.stutter?.amount ?? VJ_EFFECT_CATALOG.stutter.defaultAmount;
  const amount = Number.isFinite(rawAmount)
    ? Math.min(1, Math.max(0, rawAmount))
    : VJ_EFFECT_CATALOG.stutter.defaultAmount;
  return Math.max(MIN_STUTTER_SLICE_BEATS, 1 - 0.75 * amount);
}

function playheadModeOf(
  settings: VjEffectSettings,
  loopMode: VjLoopMode,
): VjPlayheadMode {
  if (isEffectOn(settings, "freeze")) return "frozen";
  if (isEffectOn(settings, "stutter")) return "stutter";
  if (isEffectOn(settings, "reverse")) return "reverse";
  if (isEffectOn(settings, "pingPong")) return "pingPong";
  return loopMode === "pingPong" ? "pingPong" : "forward";
}

/**
 * Precedence of contract 3.2: freeze, then stutter, then the playhead group
 * (reverse, pingPong), then the clip's loopMode. The rate is the clip's
 * default speed times the stage speed, clamped to 0.25..4 (contract 6.1).
 */
export function vjPlayheadEffectsOf(
  settings: VjEffectSettings,
  stageSpeed: VjSpeed,
  clip: { defaultSpeed: VjSpeed; loopMode: VjLoopMode },
): VjPlayheadEffects {
  return {
    mode: playheadModeOf(settings, clip.loopMode),
    rate: vjEffectivePlaybackRate(clip.defaultSpeed, stageSpeed),
    stutterSliceBeats: stutterSliceBeatsOf(settings),
  };
}

/** The frame ring replays recent video frames for these modes. */
export function needsVjFrameRing(effects: VjPlayheadEffects): boolean {
  return (
    effects.mode === "reverse" ||
    effects.mode === "pingPong" ||
    effects.mode === "stutter"
  );
}

/** Wraps a position into [startMs, endMs), whichever side it left by. */
function wrapIntoWindow(
  positionMs: number,
  startMs: number,
  spanMs: number,
): number {
  const offsetMs = (positionMs - startMs) % spanMs;
  return startMs + (offsetMs < 0 ? offsetMs + spanMs : offsetMs);
}

function playheadAt(
  positionMs: number,
  direction: 1 | -1,
  stutterAnchorMs: number | null = null,
  stutterSliceIndex: number | null = null,
): VjPlayhead {
  return { positionMs, direction, stutterAnchorMs, stutterSliceIndex };
}

/** Ping-pong as a triangle wave over a period of two spans. */
function advancePingPong(
  playhead: VjPlayhead,
  startMs: number,
  spanMs: number,
  stepMs: number,
): VjPlayhead {
  const offsetMs = Math.min(spanMs, Math.max(0, playhead.positionMs - startMs));
  const periodMs = 2 * spanMs;
  const phaseMs = playhead.direction === 1 ? offsetMs : periodMs - offsetMs;
  const nextPhaseMs = (((phaseMs + stepMs) % periodMs) + periodMs) % periodMs;
  return nextPhaseMs <= spanMs
    ? playheadAt(startMs + nextPhaseMs, 1)
    : playheadAt(startMs + periodMs - nextPhaseMs, -1);
}

/**
 * The slice grid sits on the beat clock: slice `n` spans beats
 * `n * sliceBeats` to `(n + 1) * sliceBeats`. Each slice plays
 * VJ_STUTTER_SLICE_REPEATS times from the anchor; at the first slice of a
 * new group the anchor moves on to the end of the slice just repeated (or
 * to the current position when the stutter starts or the beat clock jumped).
 */
function advanceStutter(
  playhead: VjPlayhead,
  startMs: number,
  spanMs: number,
  effects: VjPlayheadEffects,
  beats: number,
  beatPeriodMs: number,
): VjPlayhead {
  const sliceBeats = effects.stutterSliceBeats;
  const sliceIndex = Math.floor(beats / sliceBeats);
  const groupIndex = Math.floor(sliceIndex / VJ_STUTTER_SLICE_REPEATS);
  const sliceMediaMs = sliceBeats * beatPeriodMs * effects.rate;
  const previousSliceIndex = playhead.stutterSliceIndex;
  const previousAnchorMs = playhead.stutterAnchorMs;
  let anchorMs: number;
  if (previousAnchorMs === null || previousSliceIndex === null) {
    anchorMs = playhead.positionMs;
  } else {
    const previousGroupIndex = Math.floor(
      previousSliceIndex / VJ_STUTTER_SLICE_REPEATS,
    );
    if (groupIndex === previousGroupIndex) anchorMs = previousAnchorMs;
    else if (groupIndex === previousGroupIndex + 1)
      anchorMs = previousAnchorMs + sliceMediaMs;
    else anchorMs = playhead.positionMs;
  }
  anchorMs = wrapIntoWindow(anchorMs, startMs, spanMs);
  const offsetInSliceMs = (beats - sliceIndex * sliceBeats) * beatPeriodMs;
  const positionMs = wrapIntoWindow(
    anchorMs + offsetInSliceMs * effects.rate,
    startMs,
    spanMs,
  );
  return playheadAt(positionMs, 1, anchorMs, sliceIndex);
}

/**
 * Moves the playhead by `deltaMs` of wall time inside the window. Forward
 * wraps at the window end; reverse wraps from the start to the end;
 * ping-pong turns at both ends; frozen holds; stutter repeats a slice of
 * `stutterSliceBeats` beats on the beat clock (`beats` is the beat position
 * now, `beatPeriodMs` one beat). A window with no length holds its start.
 */
export function advanceVjPlayhead(
  playhead: VjPlayhead,
  window: VjPlayheadWindow,
  effects: VjPlayheadEffects,
  deltaMs: number,
  beats: number,
  beatPeriodMs: number,
): VjPlayhead {
  const spanMs = window.endMs - window.startMs;
  if (!Number.isFinite(spanMs) || spanMs <= 0) {
    return playheadAt(Number.isFinite(window.startMs) ? window.startMs : 0, 1);
  }
  if (effects.mode === "frozen") {
    return playhead.stutterAnchorMs === null &&
      playhead.stutterSliceIndex === null
      ? playhead
      : playheadAt(playhead.positionMs, playhead.direction);
  }
  const stepMs =
    Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs * effects.rate : 0;
  const hasBeatClock =
    Number.isFinite(beats) && Number.isFinite(beatPeriodMs) && beatPeriodMs > 0;
  switch (effects.mode) {
    case "stutter":
      if (hasBeatClock) {
        return advanceStutter(
          playhead,
          window.startMs,
          spanMs,
          effects,
          beats,
          beatPeriodMs,
        );
      }
      return playheadAt(
        wrapIntoWindow(playhead.positionMs + stepMs, window.startMs, spanMs),
        1,
      );
    case "reverse":
      return playheadAt(
        wrapIntoWindow(playhead.positionMs - stepMs, window.startMs, spanMs),
        -1,
      );
    case "pingPong":
      return advancePingPong(playhead, window.startMs, spanMs, stepMs);
    case "forward":
      return playheadAt(
        wrapIntoWindow(playhead.positionMs + stepMs, window.startMs, spanMs),
        1,
      );
  }
}
