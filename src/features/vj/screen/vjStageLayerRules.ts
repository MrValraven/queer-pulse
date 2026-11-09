/**
 * Pure rules the two DOM stage renderers share: the backup renderer
 * (VjStageRenderer) and the simple renderer the remote picks
 * (VjSimpleRenderer).
 */
import type { VjResolvedTransition } from "../engine/vjEngineLook";
import type {
  VjLayerMachineState,
  VjLayerSlot,
  VjRenderableClip,
  VjRenderableSource,
} from "./vjLayerMachine";

/**
 * The transition a renderer arriving in a hand-off gives its first target:
 * the leaving renderer still draws the picture, so the arriving one shows it
 * at once.
 */
export const VJ_FIRST_TARGET_CUT: VjResolvedTransition = {
  mode: "cut",
  durationMs: 0,
};

/** A target is identified by its source key and its URL: a re-tap of the live source is the same key. */
export function vjTargetKeyOf(
  target: VjRenderableSource | null,
): string | null {
  return target ? `${target.clipId}|${target.sourceUrl}` : null;
}

/** The simple renderer's transition: a cut stays a cut, every other id crossfades over its resolved length. */
export function vjSimpleTransitionOf(
  transition: VjResolvedTransition,
): VjResolvedTransition {
  if (transition.mode === "cut") return transition;
  return { mode: "fade", durationMs: transition.durationMs };
}

/** The simple renderer draws no generator: it keeps the last clip it showed, or black with none. */
export function vjSimpleTargetOf(
  target: VjRenderableSource | null,
  lastClip: VjRenderableClip | null,
): VjRenderableClip | null {
  if (target === null) return null;
  if (target.mediaKind === "generator") return lastClip;
  return target;
}

/** The clip the simple renderer pre-rolls for the queue head: a generator, which it never draws, pre-rolls nothing. */
export function vjSimpleUpcomingOf(
  upcoming: VjRenderableSource | null,
): VjRenderableClip | null {
  if (upcoming === null || upcoming.mediaKind === "generator") return null;
  return upcoming;
}

/**
 * The layer phase the clip layer draws: a primed pre-roll keeps its video
 * mounted and hidden the way a loading one is, so the target that arms it
 * starts on a decoded frame.
 */
export function vjSimpleSlotOf(slot: VjLayerSlot): VjLayerSlot {
  return slot.phase === "primed" ? { clip: slot.clip, phase: "loading" } : slot;
}

/** True while the layers have a target in flight: a pre-roll waits behind it. */
export function isVjLayerTargetInFlight(layers: VjLayerMachineState): boolean {
  return layers.incoming?.isArmed === true;
}

/**
 * True once the stage draws what it was asked for: black when it has no
 * target, or a shown front with the curtain down.
 */
export function isVjLayersShowing(
  layers: VjLayerMachineState,
  hasTarget: boolean,
): boolean {
  return !hasTarget || (layers.front !== null && !layers.isBlackRequested);
}
