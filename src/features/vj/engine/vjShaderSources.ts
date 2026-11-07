/**
 * Every program the engine compiles, joined from the shader modules under
 * `engine/shaders/` into one record keyed by `VjProgramKey` (engine plan,
 * Task E16). A key no module answers maps to an empty fragment, which fails
 * to compile: the program cache then treats it as a failed program (a
 * passthrough for an effect, the DOM fallback for a core program) and the
 * page keeps working. The program cache test pins that every key has a real
 * source.
 */
import { VJ_COLOUR_PROGRAMS } from "./shaders/vjGlslColour";
import { VJ_GENERATOR_PROGRAMS } from "./shaders/vjGlslGenerators";
import { VJ_GEOMETRY_PROGRAMS } from "./shaders/vjGlslGeometry";
import { VJ_MIX_PROGRAMS } from "./shaders/vjGlslMix";
import { VJ_OUTPUT_PROGRAMS } from "./shaders/vjGlslOutput";
import { VJ_SOURCE_PROGRAMS } from "./shaders/vjGlslSource";
import { VJ_TEXTURE_PROGRAMS } from "./shaders/vjGlslTexture";
import { VJ_TEXTURE_NEIGHBOUR_PROGRAMS } from "./shaders/vjGlslTextureNeighbours";
import { VJ_TIME_PROGRAMS } from "./shaders/vjGlslTime";
import { VJ_TRANSITION_PROGRAMS } from "./shaders/vjGlslTransitions";
import {
  VJ_PROGRAM_KEYS,
  type VjProgramKey,
  type VjShaderSource,
} from "./shaders/vjProgramKeys";

type VjPartialShaderSources = Readonly<
  Partial<Record<VjProgramKey, VjShaderSource>>
>;

const VJ_SHADER_MODULES: readonly VjPartialShaderSources[] = [
  VJ_SOURCE_PROGRAMS,
  VJ_GENERATOR_PROGRAMS,
  VJ_TRANSITION_PROGRAMS,
  VJ_MIX_PROGRAMS,
  VJ_COLOUR_PROGRAMS,
  VJ_GEOMETRY_PROGRAMS,
  VJ_TEXTURE_PROGRAMS,
  VJ_TEXTURE_NEIGHBOUR_PROGRAMS,
  VJ_TIME_PROGRAMS,
  VJ_OUTPUT_PROGRAMS,
];

const VJ_MISSING_SHADER_SOURCE: VjShaderSource = {
  fragment: "",
  uniforms: [],
  samplers: [],
};

function joinVjShaderSources(
  modules: readonly VjPartialShaderSources[],
): Readonly<Record<VjProgramKey, VjShaderSource>> {
  const joined = {} as Record<VjProgramKey, VjShaderSource>;
  for (const programKey of VJ_PROGRAM_KEYS) {
    const found = modules.find((module) => module[programKey] !== undefined);
    joined[programKey] = found?.[programKey] ?? VJ_MISSING_SHADER_SOURCE;
  }
  return joined;
}

export const VJ_SHADER_SOURCES: Readonly<Record<VjProgramKey, VjShaderSource>> =
  joinVjShaderSources(VJ_SHADER_MODULES);
