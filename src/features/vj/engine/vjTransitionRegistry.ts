/**
 * Where each catalog transition renders (engine plan, Transition registry).
 * `cut` has no program: the incoming source is promoted at once. The two
 * flash-capable transitions render as `fade` when the flash governor denies
 * them (design 5).
 */
import {
  vjTransitionLengthMs,
  type VjTempo,
  type VjTransition,
  type VjTransitionId,
} from "../../../shared/contracts/vj";
import type { VjResolvedTransition } from "./vjEngineLook";
import type { VjProgramKey } from "./shaders/vjProgramKeys";

export interface VjTransitionSpec {
  /** Null for `cut`, which promotes the incoming source with no pass. */
  programKey: VjProgramKey | null;
  /** The transition drawn instead when the flash governor denies this one; null when it never asks. */
  whenDenied: VjTransitionId | null;
}

export const VJ_TRANSITION_REGISTRY: Readonly<
  Record<VjTransitionId, VjTransitionSpec>
> = {
  fade: { programKey: "transition.fade", whenDenied: null },
  cut: { programKey: null, whenDenied: null },
  dipBlack: { programKey: "transition.dipBlack", whenDenied: null },
  dipWhite: { programKey: "transition.dipWhite", whenDenied: "fade" },
  wipeLeft: { programKey: "transition.wipeLeft", whenDenied: null },
  wipeRight: { programKey: "transition.wipeRight", whenDenied: null },
  wipeRadial: { programKey: "transition.wipeRadial", whenDenied: null },
  iris: { programKey: "transition.iris", whenDenied: null },
  zoomBlur: { programKey: "transition.zoomBlur", whenDenied: null },
  glitch: { programKey: "transition.glitch", whenDenied: "fade" },
  lumaFade: { programKey: "transition.lumaFade", whenDenied: null },
};

/** The transition's mode and its length in ms at this tempo (`vjTransitionLengthMs`; `cut` is 0). */
export function resolveVjTransition(
  transition: VjTransition,
  tempo: VjTempo,
): VjResolvedTransition {
  return {
    mode: transition.mode,
    durationMs: vjTransitionLengthMs(transition, tempo),
  };
}

/**
 * The program a running transition draws with: its own when the governor
 * granted it (or it never asks), else the program of its `whenDenied` mode.
 */
export function vjTransitionProgramKey(
  mode: VjTransitionId,
  isFlashGranted: boolean,
): VjProgramKey | null {
  const spec = VJ_TRANSITION_REGISTRY[mode];
  if (isFlashGranted || spec.whenDenied === null) return spec.programKey;
  return VJ_TRANSITION_REGISTRY[spec.whenDenied].programKey;
}
