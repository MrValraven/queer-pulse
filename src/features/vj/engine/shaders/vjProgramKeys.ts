/**
 * Every GPU program the VJ engine compiles, by key (engine plan, Shared
 * vocabulary). The shader modules under `engine/shaders/` each answer a
 * partial record of these keys; `vjShaderSources.ts` joins them.
 */

export const VJ_PROGRAM_KEYS = [
  "source.clip",
  "source.ring",
  "source.backdrop",
  "generator.gradientField",
  "generator.plasma",
  "generator.starfield",
  "generator.prideFlagWave",
  "generator.tunnel",
  "transition.fade",
  "transition.dipBlack",
  "transition.dipWhite",
  "transition.wipeLeft",
  "transition.wipeRight",
  "transition.wipeRadial",
  "transition.iris",
  "transition.zoomBlur",
  "transition.glitch",
  "transition.lumaFade",
  "mix",
  "colour",
  "geometry",
  "texture.vhs",
  "texture.filmGrain",
  "texture.scanlines",
  "texture.crt",
  "texture.rgbSplit",
  "texture.pixelate",
  "texture.halftone",
  "texture.glitch",
  "texture.dreamBlur",
  "texture.dreamCombine",
  "texture.vignette",
  "texture.lightLeaks",
  "time.echo",
  "output",
] as const;
export type VjProgramKey = (typeof VJ_PROGRAM_KEYS)[number];

export interface VjShaderSource {
  fragment: string;
  /** Every non-sampler uniform the fragment declares, frame uniforms excluded. */
  uniforms: readonly string[];
  /** Sampler uniforms in texture-unit order: index 0 binds unit 0. */
  samplers: readonly string[];
}
