/**
 * How the DOM fallback draws a transition and the mix layer (contract 3.3,
 * engine plan decision 11). Every DOM-capable transition maps to CSS; any
 * other id draws as the fade. The wipes run the same way as the WebGL shaders:
 * `wipeLeft` moves the edge from the right side to the left, `wipeRight` from
 * the left side to the right, `iris` opens a circle from the centre and
 * `wipeRadial` sweeps clockwise from the top.
 */
import {
  VJ_TRANSITION_CATALOG,
  type VjBlendMode,
  type VjTransitionId,
} from "../../../shared/contracts/vj";

/**
 * "fade": opacity. "cut": no animation. "dip": the outgoing source fades to
 * the dip colour, then the incoming one fades out of it. "clip": an animated
 * clip-path from clipFrom to clipTo. "sweep": a conic mask turning once.
 */
export type VjDomTransitionKind = "fade" | "cut" | "dip" | "clip" | "sweep";

export interface VjDomTransition {
  kind: VjDomTransitionKind;
  dipColor: "black" | "white" | null;
  clipFrom: string | null;
  clipTo: string | null;
}

const FADE: VjDomTransition = {
  kind: "fade",
  dipColor: null,
  clipFrom: null,
  clipTo: null,
};

/** The clip-path of a fully uncovered layer. */
const CLIP_OPEN = "inset(0 0 0 0)";
/** 71% of the circle() reference radius reaches the corners of any box. */
const IRIS_OPEN_RADIUS = "71%";

const VJ_DOM_TRANSITIONS: Readonly<
  Partial<Record<VjTransitionId, VjDomTransition>>
> = {
  fade: FADE,
  cut: { kind: "cut", dipColor: null, clipFrom: null, clipTo: null },
  dipBlack: { kind: "dip", dipColor: "black", clipFrom: null, clipTo: null },
  dipWhite: { kind: "dip", dipColor: "white", clipFrom: null, clipTo: null },
  wipeLeft: {
    kind: "clip",
    dipColor: null,
    clipFrom: "inset(0 0 0 100%)",
    clipTo: CLIP_OPEN,
  },
  wipeRight: {
    kind: "clip",
    dipColor: null,
    clipFrom: "inset(0 100% 0 0)",
    clipTo: CLIP_OPEN,
  },
  iris: {
    kind: "clip",
    dipColor: null,
    clipFrom: "circle(0% at 50% 50%)",
    clipTo: `circle(${IRIS_OPEN_RADIUS} at 50% 50%)`,
  },
  wipeRadial: { kind: "sweep", dipColor: null, clipFrom: null, clipTo: null },
};

/** The CSS the incoming layer animates for a DOM-capable transition; any other id answers the fade. */
export function vjDomTransitionOf(mode: VjTransitionId): VjDomTransition {
  if (!VJ_TRANSITION_CATALOG[mode].isDomCapable) return FADE;
  return VJ_DOM_TRANSITIONS[mode] ?? FADE;
}

const VJ_DOM_BLEND_MODES: Readonly<Record<VjBlendMode, string>> = {
  normal: "normal",
  screen: "screen",
  multiply: "multiply",
  difference: "difference",
  add: "plus-lighter",
  lighten: "lighten",
};

/** CSS mix-blend-mode; "add" is "plus-lighter". */
export function vjDomBlendOf(blendMode: VjBlendMode): string {
  return VJ_DOM_BLEND_MODES[blendMode];
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * The crossfader on the DOM (decision 11). `normal` is a linear mix: the clip
 * at opacity amount over the live source. Every other mode ramps the blended
 * clip in over amount 0 to 0.5 and fades the live source out over 0.5 to 1;
 * the clip blends inside an isolated group, so over a faded base it shows as
 * itself and amount 1 shows only the mix clip.
 */
export function vjDomMixOpacities(
  amount: number,
  blendMode: VjBlendMode,
): { layerOpacity: number; baseOpacity: number } {
  const unitAmount = clampUnit(amount);
  if (blendMode === "normal") {
    return { layerOpacity: unitAmount, baseOpacity: 1 };
  }
  return {
    layerOpacity: clampUnit(unitAmount * 2),
    baseOpacity: 1 - clampUnit((unitAmount - 0.5) * 2),
  };
}
