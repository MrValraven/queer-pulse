/**
 * The flash governor (design 5, contract 3.2, WCAG 2.3.1): one budget of 3
 * flash events per rolling second, shared by every flash-capable event the
 * screen can draw. The strobe, the `dipWhite` and `glitch` transitions, the
 * `invert` beat flashes and toggles, `glitch` bursts that shift mean
 * luminance, `beatPulse` bumps and audio-reactive brightness all draw from it.
 * While the strobe runs it owns the whole budget: every other kind is denied
 * and renders at sub-flash amplitude.
 *
 * Pure and deterministic: the budget is an immutable value and every answer
 * depends only on the arguments. The compositor and the DOM renderer each hold
 * one budget per screen.
 *
 * Safety margin: a grant holds the budget for one second plus
 * VJ_FLASH_FRAME_MARGIN_MS, so a frame of paint delay on the first of four
 * events can never squeeze all four into one second. Four grants are
 * therefore always more than 1050 ms apart from first to last.
 */
import {
  VJ_EFFECT_CATALOG,
  VJ_TRANSITION_CATALOG,
  type VjEffectId,
  type VjTransitionId,
} from "../../../../shared/contracts/vj";

export const VJ_FLASH_BUDGET_PER_SECOND = 3;
export const VJ_FLASH_WINDOW_MS = 1000;
/** Three 60 Hz frames: covers paint jitter between two granted events. */
export const VJ_FLASH_FRAME_MARGIN_MS = 50;
/** How long one grant holds a place in the budget. */
export const VJ_FLASH_HOLD_MS = VJ_FLASH_WINDOW_MS + VJ_FLASH_FRAME_MARGIN_MS;
/** Brightness change kept under the 10% WCAG threshold, with margin. */
export const VJ_SUB_FLASH_GAIN = 0.08;

export type VjFlashKind =
  | "strobe"
  | "dipWhiteTransition"
  | "glitchTransition"
  | "invertBeat"
  | "invertToggle"
  | "glitchBurst"
  | "beatPulse"
  | "audioBrightness";

export const VJ_FLASH_KINDS: readonly VjFlashKind[] = [
  "strobe",
  "dipWhiteTransition",
  "glitchTransition",
  "invertBeat",
  "invertToggle",
  "glitchBurst",
  "beatPulse",
  "audioBrightness",
];

/** The catalog entry each kind draws for; the strobe is a stage flag with no entry. */
export type VjFlashKindSource =
  | { catalog: "stage" }
  | { catalog: "effect"; id: VjEffectId }
  | { catalog: "transition"; id: VjTransitionId };

export const VJ_FLASH_KIND_SOURCES: Readonly<
  Record<VjFlashKind, VjFlashKindSource>
> = {
  strobe: { catalog: "stage" },
  dipWhiteTransition: { catalog: "transition", id: "dipWhite" },
  glitchTransition: { catalog: "transition", id: "glitch" },
  invertBeat: { catalog: "effect", id: "invert" },
  invertToggle: { catalog: "effect", id: "invert" },
  glitchBurst: { catalog: "effect", id: "glitch" },
  beatPulse: { catalog: "effect", id: "beatPulse" },
  audioBrightness: { catalog: "effect", id: "beatPulse" },
};

export interface VjFlashBudget {
  /** Times of the grants still holding the budget, oldest first. */
  readonly grantedAtMs: readonly number[];
  readonly isStrobeRunning: boolean;
}

export const EMPTY_VJ_FLASH_BUDGET: VjFlashBudget = Object.freeze({
  grantedAtMs: Object.freeze([]),
  isStrobeRunning: false,
});

/** True when the catalog marks this effect's brightness changes as flashes. */
export function isVjFlashCapableEffect(effectId: VjEffectId): boolean {
  return VJ_EFFECT_CATALOG[effectId].isFlashCapable;
}

/** The kind a transition requests, or null when the catalog says it never flashes. */
export function vjTransitionFlashKind(
  mode: VjTransitionId,
): VjFlashKind | null {
  if (!VJ_TRANSITION_CATALOG[mode].isFlashCapable) return null;
  for (const kind of VJ_FLASH_KINDS) {
    const source = VJ_FLASH_KIND_SOURCES[kind];
    if (source.catalog === "transition" && source.id === mode) return kind;
  }
  // A flash-capable transition with no kind of its own still spends the
  // budget, under the closest kind.
  return "dipWhiteTransition";
}

export function setVjStrobeRunning(
  budget: VjFlashBudget,
  isStrobeRunning: boolean,
): VjFlashBudget {
  if (budget.isStrobeRunning === isStrobeRunning) return budget;
  return { grantedAtMs: budget.grantedAtMs, isStrobeRunning };
}

/**
 * Grants still holding the budget at nowMs. A grant stamped more than one
 * hold ahead of nowMs means the caller's clock jumped back; it is restamped
 * at nowMs so it keeps holding for a full hold and then frees.
 */
function heldGrantsAt(
  grantedAtMs: readonly number[],
  nowMs: number,
): readonly number[] {
  let isChanged = false;
  const held: number[] = [];
  for (const grantedAt of grantedAtMs) {
    if (nowMs - grantedAt > VJ_FLASH_HOLD_MS) {
      isChanged = true;
      continue;
    }
    if (grantedAt - nowMs > VJ_FLASH_HOLD_MS) {
      isChanged = true;
      held.push(nowMs);
      continue;
    }
    held.push(grantedAt);
  }
  return isChanged ? held : grantedAtMs;
}

/**
 * Asks for one flash at nowMs. Granted when fewer than 3 grants hold the
 * budget and, for every kind except the strobe, the strobe is not running.
 * Old grants drop on every call, granted or not. A time that is not a finite
 * number is always denied.
 */
export function requestVjFlash(
  budget: VjFlashBudget,
  kind: VjFlashKind,
  nowMs: number,
): { isGranted: boolean; budget: VjFlashBudget } {
  if (!Number.isFinite(nowMs)) return { isGranted: false, budget };
  const held = heldGrantsAt(budget.grantedAtMs, nowMs);
  const isBlockedByStrobe = budget.isStrobeRunning && kind !== "strobe";
  const hasRoom = held.length < VJ_FLASH_BUDGET_PER_SECOND;
  if (isBlockedByStrobe || !hasRoom) {
    const prunedBudget =
      held === budget.grantedAtMs
        ? budget
        : { grantedAtMs: held, isStrobeRunning: budget.isStrobeRunning };
    return { isGranted: false, budget: prunedBudget };
  }
  return {
    isGranted: true,
    budget: {
      grantedAtMs: [...held, nowMs],
      isStrobeRunning: budget.isStrobeRunning,
    },
  };
}

/**
 * A granted gain passes through. A denied one stays within VJ_SUB_FLASH_GAIN
 * of 1, a brightness change under the 10% WCAG threshold. A gain that is not
 * a finite number reads as 1.
 */
export function governedVjGain(
  requestedGain: number,
  isGranted: boolean,
): number {
  if (!Number.isFinite(requestedGain)) return 1;
  if (isGranted) return requestedGain;
  return Math.min(
    1 + VJ_SUB_FLASH_GAIN,
    Math.max(1 - VJ_SUB_FLASH_GAIN, requestedGain),
  );
}
