/**
 * Where each catalog generator renders (engine plan, Generators). Every
 * generator program declares the same uniforms: a variant index, four palette
 * colours and a flag's stripes. The values depend only on the variant and the
 * palette, so each record is built once per palette and reused every frame.
 */
import {
  VJ_GENERATOR_CATALOG,
  type VjGeneratorId,
} from "../../../shared/contracts/vj";
import type { VjUniformValue } from "./gl/vjGlProgram";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import { vjFlagColourArray, vjPrideFlagOf } from "./vjEffectUniforms";
import type { VjPalette } from "./vjPalette";

export interface VjGeneratorSpec {
  programKey: VjProgramKey;
  uniformsOf: (
    variant: string | null,
    palette: VjPalette,
  ) => Record<string, VjUniformValue>;
}

/** The four palette colours every generator mixes, in uPalette order. */
const GENERATOR_PALETTE_TOKENS = ["coral", "violet", "sky", "amber"] as const;

const paletteArrayCache = new WeakMap<VjPalette, Float32Array>();
const uniformCache = new WeakMap<
  VjPalette,
  Map<string, Record<string, VjUniformValue>>
>();

function generatorPaletteArray(palette: VjPalette): Float32Array {
  const cached = paletteArrayCache.get(palette);
  if (cached !== undefined) return cached;
  const colours = new Float32Array(GENERATOR_PALETTE_TOKENS.length * 3);
  GENERATOR_PALETTE_TOKENS.forEach((colorToken, colourIndex) => {
    colours.set(palette.colours[colorToken], colourIndex * 3);
  });
  paletteArrayCache.set(palette, colours);
  return colours;
}

/** The variant's index in the generator's catalog variants; 0 for none or an unknown one. */
function variantIndexOf(
  generatorId: VjGeneratorId,
  variant: string | null,
): number {
  if (variant === null) return 0;
  return Math.max(
    0,
    VJ_GENERATOR_CATALOG[generatorId].variants.indexOf(variant),
  );
}

function generatorUniformsOf(
  generatorId: VjGeneratorId,
  variant: string | null,
  palette: VjPalette,
): Record<string, VjUniformValue> {
  const cacheKey = `${generatorId}:${variant ?? ""}`;
  let byKey = uniformCache.get(palette);
  if (byKey === undefined) {
    byKey = new Map();
    uniformCache.set(palette, byKey);
  }
  const cached = byKey.get(cacheKey);
  if (cached !== undefined) return cached;
  const stripes = palette.flags[vjPrideFlagOf(variant)];
  const uniforms: Record<string, VjUniformValue> = {
    uVariant: variantIndexOf(generatorId, variant),
    uPalette: generatorPaletteArray(palette),
    uFlagColours: vjFlagColourArray(stripes),
    uFlagStripeCount: stripes.length,
  };
  byKey.set(cacheKey, uniforms);
  return uniforms;
}

function generatorSpec(
  generatorId: VjGeneratorId,
  programKey: VjProgramKey,
): VjGeneratorSpec {
  return {
    programKey,
    uniformsOf: (variant, palette) =>
      generatorUniformsOf(generatorId, variant, palette),
  };
}

export const VJ_GENERATOR_REGISTRY: Readonly<
  Record<VjGeneratorId, VjGeneratorSpec>
> = {
  gradientField: generatorSpec("gradientField", "generator.gradientField"),
  plasma: generatorSpec("plasma", "generator.plasma"),
  starfield: generatorSpec("starfield", "generator.starfield"),
  // The variant is the flag (liveGeneratorVariant or the override's generatorVariant).
  prideFlagWave: generatorSpec("prideFlagWave", "generator.prideFlagWave"),
  tunnel: generatorSpec("tunnel", "generator.tunnel"),
};
