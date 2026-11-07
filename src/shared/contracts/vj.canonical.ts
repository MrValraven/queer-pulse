/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 *
 * The effect setting reader, the quantize test, the canonical form of a
 * stage state and the scene look of a state (C 3.6, C 3.7).
 */

import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  type VjEffectCatalogEntry,
  type VjEffectId,
  type VjEffectSetting,
  type VjEffectSettings,
} from "./vj.effects";
import type {
  VjEffects,
  VjSceneLook,
  VjSceneSource,
  VjScreenOverride,
  VjStageState,
} from "./vj.state";

/** The setting an effect has now: its entry, or the catalog's off default. */
export function vjEffectSettingOf(
  effects: VjEffects,
  effectId: VjEffectId,
): VjEffectSetting {
  const entry = VJ_EFFECT_CATALOG[effectId];
  return (
    effects.settings[effectId] ?? {
      isOn: false,
      amount: entry.defaultAmount,
      variant: entry.defaultVariant,
    }
  );
}

/** Whether a change switches what the screens show, so quantize applies (C 7.4).
 *  A clipSequence bump with the same pack is a re-tap; a pack change alone shows nothing new. */
export function vjIsQuantizedChange(
  previous: VjStageState,
  next: VjStageState,
): boolean {
  return (
    previous.liveClipId !== next.liveClipId ||
    previous.liveGeneratorId !== next.liveGeneratorId ||
    previous.liveGeneratorVariant !== next.liveGeneratorVariant ||
    (previous.clipSequence !== next.clipSequence &&
      previous.activePackId === next.activePackId) ||
    previous.mix.clipId !== next.mix.clipId ||
    previous.overlay.isVisible !== next.overlay.isVisible ||
    JSON.stringify(previous.screenOverrides) !==
      JSON.stringify(next.screenOverrides)
  );
}

/** A uuid in canonical (lowercase) form; null stays null. */
function lowercaseVjId(id: string | null): string | null {
  return id === null ? null : id.toLowerCase();
}

/** Ascending code unit order, the same on every runtime (no locale). */
function compareVjIds(first: string, second: string): number {
  if (first < second) {
    return -1;
  }
  return first > second ? 1 : 0;
}

/** Whether a setting equals its catalog off default. */
function isVjOffDefaultSetting(
  setting: VjEffectSetting,
  entry: VjEffectCatalogEntry,
): boolean {
  return (
    !setting.isOn &&
    setting.amount === entry.defaultAmount &&
    setting.variant === entry.defaultVariant
  );
}

/** Effect settings in catalog order with the off defaults dropped, each a
 *  fresh literal. Ids outside the catalog are dropped too. */
function canonicalVjEffectSettings(
  settings: VjEffectSettings,
): VjEffectSettings {
  const canonicalSettings: VjEffectSettings = {};
  for (const effectId of VJ_EFFECT_IDS) {
    const setting = settings[effectId];
    if (
      setting === undefined ||
      isVjOffDefaultSetting(setting, VJ_EFFECT_CATALOG[effectId])
    ) {
      continue;
    }
    canonicalSettings[effectId] = {
      isOn: setting.isOn,
      amount: setting.amount,
      variant: setting.variant,
    };
  }
  return canonicalSettings;
}

/** Screen overrides keyed by lowercased screen id in ascending order, each
 *  override's clipId lowercased. */
function canonicalVjScreenOverrides(
  screenOverrides: Record<string, VjScreenOverride>,
): Record<string, VjScreenOverride> {
  const canonicalOverrides: Record<string, VjScreenOverride> = {};
  const entries = Object.entries(screenOverrides)
    .map(([screenId, override]): [string, VjScreenOverride] => [
      screenId.toLowerCase(),
      override,
    ])
    .sort(([firstId], [secondId]) => compareVjIds(firstId, secondId));
  for (const [screenId, override] of entries) {
    canonicalOverrides[screenId] = {
      clipId: lowercaseVjId(override.clipId),
      generatorId: override.generatorId,
      generatorVariant: override.generatorVariant,
    };
  }
  return canonicalOverrides;
}

/** Excluded clip ids lowercased, deduplicated and sorted ascending. */
function canonicalVjExcludedClipIds(clipIds: readonly string[]): string[] {
  const lowercased = clipIds.map((clipId) => clipId.toLowerCase());
  return [...new Set(lowercased)].sort(compareVjIds);
}

/** The canonical form of a state (C 3.6): every nested object rebuilt as a
 *  fresh literal in C 3.4 field order, settings in catalog order with off
 *  defaults dropped, overrides sorted by screen id, excluded ids lowercased,
 *  deduplicated and sorted, every uuid lowercased. Amounts stay as they are
 *  (writes round them). */
export function canonicalVjStageState(state: VjStageState): VjStageState {
  return {
    stageEpoch: state.stageEpoch.toLowerCase(),
    revision: state.revision,
    clipSequence: state.clipSequence,
    activePackId: lowercaseVjId(state.activePackId),
    liveClipId: lowercaseVjId(state.liveClipId),
    liveGeneratorId: state.liveGeneratorId,
    liveGeneratorVariant: state.liveGeneratorVariant,
    liveSince: state.liveSince,
    transition: {
      mode: state.transition.mode,
      length: {
        unit: state.transition.length.unit,
        value: state.transition.length.value,
      },
    },
    overlay: {
      text: state.overlay.text,
      style: state.overlay.style,
      isVisible: state.overlay.isVisible,
      position: state.overlay.position,
      size: state.overlay.size,
      colorToken: state.overlay.colorToken,
      hideAt: state.overlay.hideAt,
    },
    countdown: {
      isVisible: state.countdown.isVisible,
      targetAt: state.countdown.targetAt,
      label: state.countdown.label,
    },
    logo: { isVisible: state.logo.isVisible, corner: state.logo.corner },
    eventCard: {
      isVisible: state.eventCard.isVisible,
      kind: state.eventCard.kind,
    },
    effects: {
      speed: state.effects.speed,
      settings: canonicalVjEffectSettings(state.effects.settings),
      isStrobing: state.effects.isStrobing,
      isBlackout: state.effects.isBlackout,
      strobeStartedAt: state.effects.strobeStartedAt,
    },
    mix: {
      clipId: lowercaseVjId(state.mix.clipId),
      amount: state.mix.amount,
      blendMode: state.mix.blendMode,
    },
    tempo: {
      bpm: state.tempo.bpm,
      downbeatAt: state.tempo.downbeatAt,
      quantize: state.tempo.quantize,
      source: state.tempo.source,
    },
    shuffle: {
      isOn: state.shuffle.isOn,
      intervalKind: state.shuffle.intervalKind,
      intervalValue: state.shuffle.intervalValue,
      source: state.shuffle.source,
      excludedClipIds: canonicalVjExcludedClipIds(
        state.shuffle.excludedClipIds,
      ),
    },
    recentClipIds: state.recentClipIds.map((clipId) => clipId.toLowerCase()),
    screenOverrides: canonicalVjScreenOverrides(state.screenOverrides),
    activeSetlistId: lowercaseVjId(state.activeSetlistId),
    setlistIndex: state.setlistIndex,
    updatedAt: state.updatedAt,
  };
}

/** Whether two states hold the same content: their canonical JSON compared
 *  with `revision` and `updatedAt` taken out. */
export function isSameVjStageContent(
  first: VjStageState,
  second: VjStageState,
): boolean {
  const comparableJsonOf = (state: VjStageState): string =>
    JSON.stringify({
      ...canonicalVjStageState(state),
      revision: 0,
      updatedAt: 0,
    });
  return comparableJsonOf(first) === comparableJsonOf(second);
}

/** The live source a scene saves: the live clip, the live generator, or null
 *  when nothing is live. */
function vjSceneSourceOf(state: VjStageState): VjSceneSource | null {
  if (state.liveClipId !== null) {
    return { kind: "clip", clipId: state.liveClipId };
  }
  if (state.liveGeneratorId !== null) {
    return {
      kind: "generator",
      generatorId: state.liveGeneratorId,
      generatorVariant: state.liveGeneratorVariant,
    };
  }
  return null;
}

/** The look a remote saves: the live source (null when nothing is live), the effects, transition, overlay and mix. */
export function vjSceneLookOf(state: VjStageState): VjSceneLook {
  return {
    source: vjSceneSourceOf(state),
    effects: {
      speed: state.effects.speed,
      settings: canonicalVjEffectSettings(state.effects.settings),
    },
    transition: {
      mode: state.transition.mode,
      length: {
        unit: state.transition.length.unit,
        value: state.transition.length.value,
      },
    },
    overlay: {
      text: state.overlay.text,
      style: state.overlay.style,
      isVisible: state.overlay.isVisible,
      position: state.overlay.position,
      size: state.overlay.size,
      colorToken: state.overlay.colorToken,
    },
    mix: {
      clipId: state.mix.clipId,
      amount: state.mix.amount,
      blendMode: state.mix.blendMode,
    },
  };
}
