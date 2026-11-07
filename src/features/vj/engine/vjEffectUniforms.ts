/**
 * Uniform values for the effect programs (engine plan, Per-program uniforms
 * and Amount curves). An amount uniform carries the effect's amount while it
 * is on and 0 while it is off, so the fused programs skip it; a variant int
 * carries the index the shader branches on. Colour arrays built from the
 * palette are cached per palette, so a frame reuses them.
 */
import {
  VJ_EFFECT_CATALOG,
  VJ_PRIDE_FLAGS,
  VJ_COLOR_TOKENS,
  VJ_DUOTONE_PAIRS,
  type VjColorToken,
  type VjDuotonePair,
  type VjEffectId,
  type VjEffectSetting,
  type VjEffectSettings,
  type VjPrideFlag,
} from "../../../shared/contracts/vj";
import type { VjUniformValue } from "./gl/vjGlProgram";
import { VJ_GLSL_MAX_FLAG_STRIPES } from "./shaders/vjGlslCommon";
import { vjEffectAmountOf, vjEffectVariantOf } from "./vjEffectRegistry";
import type { VjPalette, VjRgb } from "./vjPalette";

const flagColourCache = new WeakMap<readonly VjRgb[], Float32Array>();

/** A flag's stripes as `VJ_GLSL_MAX_FLAG_STRIPES` vec3s, zero padded; cached per stripe list. */
export function vjFlagColourArray(stripes: readonly VjRgb[]): Float32Array {
  const cached = flagColourCache.get(stripes);
  if (cached !== undefined) return cached;
  const colours = new Float32Array(VJ_GLSL_MAX_FLAG_STRIPES * 3);
  stripes.slice(0, VJ_GLSL_MAX_FLAG_STRIPES).forEach((stripe, stripeIndex) => {
    colours.set(stripe, stripeIndex * 3);
  });
  flagColourCache.set(stripes, colours);
  return colours;
}

/** The flag a variant names; rainbow for anything else. */
export function vjPrideFlagOf(variant: string | null): VjPrideFlag {
  return VJ_PRIDE_FLAGS.find((flag) => flag === variant) ?? "rainbow";
}

function colorTokenOf(variant: string | null): VjColorToken {
  return (
    VJ_COLOR_TOKENS.find((colorToken) => colorToken === variant) ?? "coral"
  );
}

function duotonePairOf(variant: string | null): VjDuotonePair {
  return VJ_DUOTONE_PAIRS.find((pair) => pair === variant) ?? "plum-coral";
}

/**
 * The fused `colour` program. `gates` come from the compositor and the flash
 * governor: `invertBeatGate` is 1 in the first half of a granted beat for the
 * `beat` variant, and `invertRamp` (0..1) eases a denied `steady` toggle.
 */
export function colourUniformsOf(
  settings: VjEffectSettings,
  palette: VjPalette,
  gates: { invertBeatGate: number; invertRamp: number },
): Record<string, VjUniformValue> {
  const invertGate =
    vjEffectVariantOf(settings, "invert") === "beat"
      ? gates.invertBeatGate
      : gates.invertRamp;
  const [duotoneDark, duotoneLight] =
    palette.duotones[duotonePairOf(vjEffectVariantOf(settings, "duotone"))];
  const prideStripes =
    palette.flags[vjPrideFlagOf(vjEffectVariantOf(settings, "prideGrade"))];
  return {
    uMonochrome: vjEffectAmountOf(settings, "monochrome"),
    uInvert: vjEffectAmountOf(settings, "invert") * invertGate,
    uSaturate: vjEffectAmountOf(settings, "saturate"),
    uContrast: vjEffectAmountOf(settings, "contrast"),
    uTintAmount: vjEffectAmountOf(settings, "tint"),
    uTintColour:
      palette.colours[colorTokenOf(vjEffectVariantOf(settings, "tint"))],
    uDuotoneAmount: vjEffectAmountOf(settings, "duotone"),
    uDuotoneDark: duotoneDark,
    uDuotoneLight: duotoneLight,
    uPrideAmount: vjEffectAmountOf(settings, "prideGrade"),
    uPrideColours: vjFlagColourArray(prideStripes),
    uPrideColourCount: Math.min(prideStripes.length, VJ_GLSL_MAX_FLAG_STRIPES),
    uThermal: vjEffectAmountOf(settings, "thermal"),
    uHueCycle: vjEffectAmountOf(settings, "hueCycle"),
    uHueShift: vjEffectAmountOf(settings, "hueShift"),
  };
}

const MIRROR_MODES: Readonly<Record<string, number>> = {
  horizontal: 1,
  vertical: 2,
  quad: 3,
};
const MASK_SHAPES: Readonly<Record<string, number>> = {
  circle: 1,
  heart: 2,
  star: 3,
};
const TILE_COUNTS: Readonly<Record<string, number>> = { "2x2": 2, "3x3": 3 };

/** An int uniform from the effect's variant while it is on, else 0. */
function variantIntOf(
  settings: VjEffectSettings,
  effectId: VjEffectId,
  valueOf: (variant: string) => number | undefined,
): number {
  if (vjEffectAmountOf(settings, effectId) <= 0) return 0;
  const variant = vjEffectVariantOf(settings, effectId);
  return variant === null ? 0 : (valueOf(variant) ?? 0);
}

/** The fused `geometry` program; mode and shape ints are 0 while their effect is off. */
export function geometryUniformsOf(
  settings: VjEffectSettings,
): Record<string, VjUniformValue> {
  return {
    uKenBurns: vjEffectAmountOf(settings, "kenBurns"),
    uZoomPulse: vjEffectAmountOf(settings, "zoomPulse"),
    uRotate: vjEffectAmountOf(settings, "rotate"),
    uTileCount: variantIntOf(
      settings,
      "tile",
      (variant) => TILE_COUNTS[variant],
    ),
    uMirrorMode: variantIntOf(
      settings,
      "mirror",
      (variant) => MIRROR_MODES[variant],
    ),
    uKaleidoSegments: variantIntOf(settings, "kaleidoscope", (variant) =>
      Number.parseInt(variant, 10),
    ),
    uKaleidoAmount: vjEffectAmountOf(settings, "kaleidoscope"),
    uMaskShape: variantIntOf(
      settings,
      "mask",
      (variant) => MASK_SHAPES[variant],
    ),
    uMaskAmount: vjEffectAmountOf(settings, "mask"),
  };
}

/** The governed glitch burst, and the drive a `beat` rgbSplit follows. */
export interface VjTextureGates {
  seed: number;
  burst: number;
  isLumaShiftGranted: boolean;
  /** uDrive of this frame (mic level, else the beat pulse); a `beat` rgbSplit scales by it. */
  drive?: number;
}

/** The amount a texture effect draws with, from its setting and catalog entry. */
function textureAmountOf(
  effectId: VjEffectId,
  setting: VjEffectSetting,
): number {
  if (!setting.isOn) return 0;
  const entry = VJ_EFFECT_CATALOG[effectId];
  return entry.isAmountAdjustable ? setting.amount : entry.defaultAmount;
}

/**
 * One texture program's uniforms. `dream` answers its combine amount; the
 * pass graph adds the blur direction and radius per blur step.
 */
export function textureUniformsOf(
  effectId: VjEffectId,
  setting: VjEffectSetting,
  palette: VjPalette,
  glitch: VjTextureGates,
): Record<string, VjUniformValue> {
  const amount = textureAmountOf(effectId, setting);
  switch (effectId) {
    case "vhs":
      return { uVhsAmount: amount };
    case "filmGrain":
      return { uGrainAmount: amount };
    case "scanlines":
      return { uScanlinesAmount: amount };
    case "crt":
      return { uCrtAmount: amount };
    case "rgbSplit": {
      const isBeat = setting.variant === "beat";
      return {
        uRgbSplitAmount: amount,
        uRgbSplitDrive: isBeat ? (glitch.drive ?? 1) : 1,
      };
    }
    case "pixelate":
      return { uPixelateAmount: amount };
    case "halftone":
      return { uHalftoneAmount: amount };
    case "glitch":
      return {
        uGlitchAmount: amount,
        uGlitchSeed: glitch.seed,
        uGlitchBurst: glitch.burst,
        uGlitchLumaShift: glitch.isLumaShiftGranted ? 1 : 0,
      };
    case "dream":
      return { uDreamAmount: amount };
    case "vignette":
      return { uVignetteAmount: amount };
    case "lightLeaks":
      return {
        uLightLeaksAmount: amount,
        uLeakColourA: palette.colours.amber,
        uLeakColourB: palette.colours.rose,
      };
    default:
      return {};
  }
}
