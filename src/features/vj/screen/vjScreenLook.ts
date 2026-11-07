/**
 * What this screen shows (contract 3.4 `screenOverrides`): this screen's
 * override entry replaces only its live source, a clip or a generator with
 * its variant. Effects and the mix clip stay shared by every screen. Without
 * an entry, the live generator wins over the clip, and the clip is the one the
 * program displays (the stage's, or a local shuffle pick).
 */
import type { VjGeneratorId, VjStageState } from "../../../shared/contracts/vj";
import {
  vjGeneratorSourceKey,
  type VjRenderableGenerator,
} from "./vjLayerMachine";

export type VjScreenLiveSource =
  | { kind: "clip"; clipId: string }
  | {
      kind: "generator";
      generatorId: VjGeneratorId;
      generatorVariant: string | null;
    }
  | null;

export interface VjScreenLook {
  live: VjScreenLiveSource;
  /** `state.mix.clipId` whatever the override. */
  mixClipId: string | null;
  /** True while this screen's override entry decides its live source. */
  isOverridden: boolean;
}

/** This screen's override as a live source; null with no usable entry. */
function overrideSourceOf(
  state: VjStageState,
  screenId: string,
): VjScreenLiveSource {
  const override = state.screenOverrides[screenId];
  if (override === undefined) return null;
  if (override.clipId !== null) {
    return { kind: "clip", clipId: override.clipId };
  }
  if (override.generatorId !== null) {
    return {
      kind: "generator",
      generatorId: override.generatorId,
      generatorVariant: override.generatorVariant,
    };
  }
  return null;
}

/** The main look's live source: the live generator, else the program's clip, else black. */
function mainSourceOf(
  state: VjStageState,
  programClipId: string | null,
): VjScreenLiveSource {
  if (state.liveGeneratorId !== null) {
    return {
      kind: "generator",
      generatorId: state.liveGeneratorId,
      generatorVariant: state.liveGeneratorVariant,
    };
  }
  return programClipId === null
    ? null
    : { kind: "clip", clipId: programClipId };
}

export function resolveVjScreenLook(
  state: VjStageState,
  screenId: string,
  programClipId: string | null,
): VjScreenLook {
  const overrideSource = overrideSourceOf(state, screenId);
  return {
    live: overrideSource ?? mainSourceOf(state, programClipId),
    mixClipId: state.mix.clipId,
    isOverridden: overrideSource !== null,
  };
}

/** The renderer's source for a generator: ready at once, holding no object URL. */
export function vjRenderableGeneratorOf(
  generatorId: VjGeneratorId,
  generatorVariant: string | null,
): VjRenderableGenerator {
  return {
    clipId: vjGeneratorSourceKey(generatorId, generatorVariant),
    generatorId,
    generatorVariant,
    mediaKind: "generator",
    sourceUrl: "",
  };
}
