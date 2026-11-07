import {
  VJ_EFFECT_IDS,
  type VjClipDTO,
  type VjEffectId,
  type VjGeneratorId,
  type VjSceneLook,
} from "../../../../shared/contracts/vj";

/** What a scene puts on screen when recalled. A clip that left the library
 *  keeps its id with a null title and thumbnail. */
export type VjSceneSourceSummary =
  | {
      kind: "clip";
      clipId: string;
      title: string | null;
      thumbnailUrl: string | null;
    }
  | { kind: "generator"; generatorId: VjGeneratorId }
  | { kind: "keepsLive" };

/** The parts of a scene's look a library row names. */
export interface VjSceneSummary {
  source: VjSceneSourceSummary;
  effectIds: VjEffectId[];
  hasText: boolean;
  hasMix: boolean;
}

function sourceSummaryOf(
  look: VjSceneLook,
  clipsById: ReadonlyMap<string, VjClipDTO>,
): VjSceneSourceSummary {
  const { source } = look;
  if (source === null) return { kind: "keepsLive" };
  if (source.kind === "generator") {
    return { kind: "generator", generatorId: source.generatorId };
  }
  const clip = clipsById.get(source.clipId);
  return {
    kind: "clip",
    clipId: source.clipId,
    title: clip?.title ?? null,
    thumbnailUrl: clip?.thumbnailUrl ?? null,
  };
}

/**
 * A scene's look in the few words a row shows: its source, the effects that
 * are on (in catalog order, so every row lists them the same way), and
 * whether it shows text or a mix layer. Pure: the caller turns ids into copy
 * through `vj:effect.name.*` and `vj:generator.name.*`.
 */
export function vjSceneSummaryOf(
  look: VjSceneLook,
  clipsById: ReadonlyMap<string, VjClipDTO>,
): VjSceneSummary {
  const { settings } = look.effects;
  return {
    source: sourceSummaryOf(look, clipsById),
    effectIds: VJ_EFFECT_IDS.filter(
      (effectId) => settings[effectId]?.isOn === true,
    ),
    hasText: look.overlay.isVisible,
    hasMix: look.mix.clipId !== null,
  };
}
