/**
 * The effect pad press machine (contract 7.6, design 7, plan Decisions 1).
 *
 * An off pad follows the latch rule: a press shorter than
 * VJ_PAD_LATCH_MAX_MS latches the effect and sends no release; a longer hold
 * is momentary and sends off on release. A latched pad unlatches on a short
 * press, and held still for VJ_PAD_TUNE_HOLD_MS it opens its tuner, so the
 * release sends nothing.
 */
import { VJ_PAD_LATCH_MAX_MS } from "../../vj.constants";

/** A latched pad held still this long opens its tuner. */
export const VJ_PAD_TUNE_HOLD_MS = 500;
/** A touch press waits this long so a sideways scroll of the pads row fires nothing. */
export const VJ_PAD_TOUCH_SLOP_MS = 40;
/** A pointer that travels this far during a press counts as moved. */
export const VJ_PAD_MOVE_CANCEL_PX = 8;

export interface VjPadPress {
  wasOn: boolean;
  startedAt: number;
}

export type VjPadSend = "on" | "off" | null;

export type VjPadPressResult =
  "latched" | "momentaryEnded" | "unlatched" | "tuned" | "cancelled";

/** Off pad: "on". Latched pad: null (its release decides). */
export function vjPadPressDown(wasOn: boolean): VjPadSend {
  return wasOn ? null : "on";
}

export function vjPadPressUp(
  press: VjPadPress,
  releasedAt: number,
  hasOpenedTuner: boolean,
): { send: VjPadSend; result: VjPadPressResult } {
  if (press.wasOn) {
    return hasOpenedTuner
      ? { send: null, result: "tuned" }
      : { send: "off", result: "unlatched" };
  }
  const heldMs = releasedAt - press.startedAt;
  return heldMs < VJ_PAD_LATCH_MAX_MS
    ? { send: null, result: "latched" }
    : { send: "off", result: "momentaryEnded" };
}

/** A latched pad held still for 500 ms. */
export function vjShouldOpenTuner(
  press: VjPadPress,
  now: number,
  hasMoved: boolean,
): boolean {
  if (!press.wasOn || hasMoved) {
    return false;
  }
  return now - press.startedAt >= VJ_PAD_TUNE_HOLD_MS;
}

/** A scroll took the pointer: undo an "on" this press sent. */
export function vjPadPressCancel(
  press: VjPadPress,
  hasSentOn: boolean,
): { send: VjPadSend; result: "cancelled" } {
  const shouldSendOff = hasSentOn && !press.wasOn;
  return { send: shouldSendOff ? "off" : null, result: "cancelled" };
}
