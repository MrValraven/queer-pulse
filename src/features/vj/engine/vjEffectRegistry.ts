/**
 * Where each catalog effect renders in the engine (engine plan, Effect
 * registry). Flags, defaults and variants stay in `VJ_EFFECT_CATALOG`; this
 * registry adds only the stage and the GPU programs each id draws through.
 */
import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  type VjEffectId,
  type VjEffectSettings,
} from "../../../shared/contracts/vj";
import type { VjProgramKey } from "./shaders/vjProgramKeys";

export type VjEffectStage =
  "colour" | "texture" | "geometry" | "playhead" | "time" | "output";

export interface VjEffectSpec {
  effectId: VjEffectId;
  stage: VjEffectStage;
  /** The programs this effect draws through, in pass order; empty when it acts on the playhead alone. */
  programKeys: readonly VjProgramKey[];
  /** True when the effect is one function inside a program it shares with its stage. */
  isFused: boolean;
}

function fusedSpec(
  effectId: VjEffectId,
  stage: "colour" | "geometry",
): VjEffectSpec {
  return { effectId, stage, programKeys: [stage], isFused: true };
}

function ownSpec(
  effectId: VjEffectId,
  stage: VjEffectStage,
  programKeys: readonly VjProgramKey[],
): VjEffectSpec {
  return { effectId, stage, programKeys, isFused: false };
}

/** Every effect id with its stage and programs, in catalog order. */
export const VJ_EFFECT_REGISTRY: Readonly<Record<VjEffectId, VjEffectSpec>> = {
  monochrome: fusedSpec("monochrome", "colour"),
  invert: fusedSpec("invert", "colour"),
  saturate: fusedSpec("saturate", "colour"),
  contrast: fusedSpec("contrast", "colour"),
  tint: fusedSpec("tint", "colour"),
  duotone: fusedSpec("duotone", "colour"),
  prideGrade: fusedSpec("prideGrade", "colour"),
  thermal: fusedSpec("thermal", "colour"),
  hueCycle: fusedSpec("hueCycle", "colour"),
  hueShift: fusedSpec("hueShift", "colour"),
  vhs: ownSpec("vhs", "texture", ["texture.vhs"]),
  filmGrain: ownSpec("filmGrain", "texture", ["texture.filmGrain"]),
  scanlines: ownSpec("scanlines", "texture", ["texture.scanlines"]),
  crt: ownSpec("crt", "texture", ["texture.crt"]),
  rgbSplit: ownSpec("rgbSplit", "texture", ["texture.rgbSplit"]),
  pixelate: ownSpec("pixelate", "texture", ["texture.pixelate"]),
  halftone: ownSpec("halftone", "texture", ["texture.halftone"]),
  glitch: ownSpec("glitch", "texture", ["texture.glitch"]),
  dream: ownSpec("dream", "texture", [
    "texture.dreamBlur",
    "texture.dreamCombine",
  ]),
  vignette: ownSpec("vignette", "texture", ["texture.vignette"]),
  lightLeaks: ownSpec("lightLeaks", "texture", ["texture.lightLeaks"]),
  mirror: fusedSpec("mirror", "geometry"),
  kaleidoscope: fusedSpec("kaleidoscope", "geometry"),
  tile: fusedSpec("tile", "geometry"),
  kenBurns: fusedSpec("kenBurns", "geometry"),
  rotate: fusedSpec("rotate", "geometry"),
  zoomPulse: fusedSpec("zoomPulse", "geometry"),
  mask: fusedSpec("mask", "geometry"),
  freeze: ownSpec("freeze", "playhead", []),
  // A video plays reverse, ping-pong and stutter from the GPU frame ring.
  reverse: ownSpec("reverse", "playhead", ["source.ring"]),
  pingPong: ownSpec("pingPong", "playhead", ["source.ring"]),
  stutter: ownSpec("stutter", "playhead", ["source.ring"]),
  echo: ownSpec("echo", "time", ["time.echo"]),
  beatPulse: ownSpec("beatPulse", "output", ["output"]),
};

/**
 * The amount an effect draws with: 0 while off, the catalog default for a
 * fixed-amount effect, else the setting's amount.
 */
export function vjEffectAmountOf(
  settings: VjEffectSettings,
  effectId: VjEffectId,
): number {
  const setting = settings[effectId];
  if (setting === undefined || !setting.isOn) return 0;
  const entry = VJ_EFFECT_CATALOG[effectId];
  return entry.isAmountAdjustable ? setting.amount : entry.defaultAmount;
}

/** The variant an effect draws with: the setting's when it is one of the entry's, else the catalog default. */
export function vjEffectVariantOf(
  settings: VjEffectSettings,
  effectId: VjEffectId,
): string | null {
  const entry = VJ_EFFECT_CATALOG[effectId];
  const variant = settings[effectId]?.variant ?? null;
  if (variant !== null && entry.variants.includes(variant)) return variant;
  return entry.defaultVariant;
}

/** Effects that are on with an amount above 0, in `VJ_EFFECT_IDS` order. */
export function activeVjEffects(settings: VjEffectSettings): VjEffectId[] {
  return VJ_EFFECT_IDS.filter(
    (effectId) => vjEffectAmountOf(settings, effectId) > 0,
  );
}

/** True when any effect of the stage is on with an amount above 0. */
export function hasActiveVjStage(
  settings: VjEffectSettings,
  stage: VjEffectStage,
): boolean {
  return VJ_EFFECT_IDS.some(
    (effectId) =>
      VJ_EFFECT_REGISTRY[effectId].stage === stage &&
      vjEffectAmountOf(settings, effectId) > 0,
  );
}
