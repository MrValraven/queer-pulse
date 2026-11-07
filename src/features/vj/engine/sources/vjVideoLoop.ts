/**
 * The loop window of a video clip (contract 2 loop points, 6.1 playback
 * defaults). Both points null means the whole clip; `in` alone loops from
 * there to the end; `out` alone loops from 0. A span under
 * `VJ_LIMITS.loopMinLengthMs`, or points out of order, play the whole clip.
 */
import { VJ_LIMITS, type VjLoopMode } from "../../../../shared/contracts/vj";

export interface VjLoopWindow {
  inSec: number;
  outSec: number;
  mode: VjLoopMode;
}

/** The loop acts this long before loop out, so the seek lands before the video passes it. */
export const VJ_LOOP_SEEK_LEAD_SEC = 0.05;

export type VjVideoLoopAction =
  { kind: "none" } | { kind: "seekToIn" } | { kind: "turnBackward" };

const NO_LOOP_ACTION: VjVideoLoopAction = { kind: "none" };
const SEEK_TO_IN_ACTION: VjVideoLoopAction = { kind: "seekToIn" };
const TURN_BACKWARD_ACTION: VjVideoLoopAction = { kind: "turnBackward" };

function isPointMs(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= 0;
}

function wholeClipWindow(
  durationMs: number | null,
  mode: VjLoopMode,
): VjLoopWindow | null {
  // A forward whole-clip loop is the native `loop` attribute's job; a
  // ping-pong over a clip of unknown length has no end to turn at.
  if (mode === "loop" || !isPointMs(durationMs) || durationMs <= 0) return null;
  return { inSec: 0, outSec: durationMs / 1000, mode };
}

/**
 * The window a video loops in, or null when the native `loop` plays it
 * (a forward loop over the whole clip).
 */
export function vjLoopWindowOf(clip: {
  durationMs: number | null;
  loopInMs: number | null;
  loopOutMs: number | null;
  loopMode: VjLoopMode;
}): VjLoopWindow | null {
  const { durationMs, loopMode } = clip;
  const hasDuration = isPointMs(durationMs) && durationMs > 0;
  const hasIn = isPointMs(clip.loopInMs);
  const hasOut = isPointMs(clip.loopOutMs);
  if (!hasIn && !hasOut) return wholeClipWindow(durationMs, loopMode);
  const inMs = hasIn ? (clip.loopInMs as number) : 0;
  const rawOutMs = hasOut ? (clip.loopOutMs as number) : durationMs;
  if (rawOutMs === null || !Number.isFinite(rawOutMs))
    return wholeClipWindow(durationMs, loopMode);
  const outMs = hasDuration ? Math.min(rawOutMs, durationMs) : rawOutMs;
  if (outMs - inMs < VJ_LIMITS.loopMinLengthMs)
    return wholeClipWindow(durationMs, loopMode);
  if (hasDuration && inMs === 0 && outMs === durationMs)
    return wholeClipWindow(durationMs, loopMode);
  return { inSec: inMs / 1000, outSec: outMs / 1000, mode: loopMode };
}

/**
 * What the video source does at this media time: `loop` seeks back to loop
 * in at `outSec - VJ_LOOP_SEEK_LEAD_SEC`; `pingPong` turns backward there
 * (the frame ring replays the way back). A video sitting before loop in
 * seeks to it. The answers are shared constants, so a frame allocates
 * nothing.
 */
export function vjVideoLoopAction(
  window: VjLoopWindow,
  mediaTimeSec: number,
): VjVideoLoopAction {
  if (!Number.isFinite(mediaTimeSec)) return NO_LOOP_ACTION;
  if (mediaTimeSec >= window.outSec - VJ_LOOP_SEEK_LEAD_SEC) {
    return window.mode === "pingPong"
      ? TURN_BACKWARD_ACTION
      : SEEK_TO_IN_ACTION;
  }
  if (mediaTimeSec < window.inSec - VJ_LOOP_SEEK_LEAD_SEC)
    return SEEK_TO_IN_ACTION;
  return NO_LOOP_ACTION;
}
