/**
 * VJ wire contract (C 3), frontend mirror of
 * `queerpulse-backend/src/vj/vj.contract.ts` and `vj-response.ts`. Names and
 * values match it; edit both together.
 *
 * The v1 to v2 upgrade of stage state fields (C 3.6 table, C 7.13, C 9.1).
 */

import type { VjEffectId, VjEffectSetting } from "./vj.effects";
import { VJ_LIMITS } from "./vj.lists";
import { createVjSetlistPlayback } from "./vj.sequence";
import { createVjStageState } from "./vj.state";

/** A plain object read as a record; anything else answers null. */
function asVjRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

/** The v1 effect flags and the v2 settings each maps to (C 3.6 table), in
 *  catalog order. v1 mirrored with a flip; v2 `mirror` `horizontal` is its
 *  closest look. */
const VJ_V1_EFFECT_FLAGS: ReadonlyArray<{
  flag: "isMonochrome" | "isHueCycling" | "isMirrored";
  effectId: VjEffectId;
  setting: VjEffectSetting;
}> = [
  {
    flag: "isMonochrome",
    effectId: "monochrome",
    setting: { isOn: true, amount: 1, variant: null },
  },
  {
    flag: "isHueCycling",
    effectId: "hueCycle",
    setting: { isOn: true, amount: 0.5, variant: null },
  },
  {
    flag: "isMirrored",
    effectId: "mirror",
    setting: { isOn: true, amount: 1, variant: "horizontal" },
  },
];

/** The fields v2 added to the state, filled from `createVjStageState` when a
 *  v1 record lacks them. */
const VJ_V2_STAGE_FIELDS = [
  "liveGeneratorId",
  "liveGeneratorVariant",
  "countdown",
  "logo",
  "eventCard",
  "mix",
  "tempo",
  "recentClipIds",
  "screenOverrides",
  "activeSetlistId",
  "setlistIndex",
] as const;

/** Whether an unknown state record still has a v1 shape anywhere. */
function isVjStageFieldsV1(value: Record<string, unknown>): boolean {
  const transition = asVjRecord(value.transition);
  const overlay = asVjRecord(value.overlay);
  const effects = asVjRecord(value.effects);
  const shuffle = asVjRecord(value.shuffle);
  return (
    !("tempo" in value) ||
    (transition !== null && !("length" in transition)) ||
    (overlay !== null && !("position" in overlay)) ||
    (effects !== null &&
      (!("settings" in effects) ||
        VJ_V1_EFFECT_FLAGS.some(({ flag }) => flag in effects))) ||
    (shuffle !== null && ("bpm" in shuffle || !("source" in shuffle)))
  );
}

/** Row `transition: { mode, fadeMs }`: the fade length becomes an ms length. */
function upgradeVjTransitionV1(upgraded: Record<string, unknown>): void {
  const transition = asVjRecord(upgraded.transition);
  if (transition === null || "length" in transition) {
    return;
  }
  upgraded.transition = {
    mode: transition.mode,
    length: { unit: "ms", value: transition.fadeMs },
  };
}

/** Row `overlay` without `position`: a ticker sits at the bottom, the rest
 *  in the centre, at size l in cream with no auto-hide. */
function upgradeVjOverlayV1(upgraded: Record<string, unknown>): void {
  const overlay = asVjRecord(upgraded.overlay);
  if (overlay === null || "position" in overlay) {
    return;
  }
  upgraded.overlay = {
    ...overlay,
    position: overlay.style === "ticker" ? "bottom" : "center",
    size: "l",
    colorToken: "cream",
    hideAt: null,
  };
}

/** Rows for the three v1 effect flags: each true flag becomes its setting,
 *  every flag is removed, and `settings` is `{}` when all were false. */
function upgradeVjEffectsV1(upgraded: Record<string, unknown>): void {
  const effects = asVjRecord(upgraded.effects);
  if (effects === null) {
    return;
  }
  const upgradedEffects: Record<string, unknown> = { ...effects };
  const settings: Record<string, VjEffectSetting> = {};
  for (const { flag, effectId, setting } of VJ_V1_EFFECT_FLAGS) {
    if (effects[flag] === true) {
      settings[effectId] = { ...setting };
    }
    delete upgradedEffects[flag];
  }
  if (!("settings" in effects)) {
    upgradedEffects.settings = settings;
  }
  upgraded.effects = upgradedEffects;
}

/** Rows `shuffle.bpm` and `shuffle` without `source`: the bpm moves to a
 *  fresh `tempo` when none exists (the default bpm when it is not a finite
 *  number), and the shuffle gains the pack source and no exclusions. */
function upgradeVjShuffleAndTempoV1(
  upgraded: Record<string, unknown>,
  now: number,
): void {
  const shuffle = asVjRecord(upgraded.shuffle);
  if (shuffle === null) {
    return;
  }
  const { bpm, ...shuffleWithoutBpm } = shuffle;
  if (!("tempo" in upgraded) && "bpm" in shuffle) {
    upgraded.tempo = {
      bpm:
        typeof bpm === "number" && Number.isFinite(bpm)
          ? bpm
          : VJ_LIMITS.bpmDefault,
      downbeatAt: now,
      quantize: "off",
      source: "manual",
    };
  }
  upgraded.shuffle =
    "source" in shuffle
      ? shuffleWithoutBpm
      : { ...shuffleWithoutBpm, source: "pack", excludedClipIds: [] };
}

/** Row "missing v2 fields": each takes its `createVjStageState` default, and
 *  `liveSince` is now when a clip was live, else null. */
function fillMissingVjStageFieldsV2(
  upgraded: Record<string, unknown>,
  now: number,
): void {
  const stageEpoch =
    typeof upgraded.stageEpoch === "string" ? upgraded.stageEpoch : "";
  const defaults = createVjStageState(stageEpoch, now) as unknown as Record<
    string,
    unknown
  >;
  for (const field of VJ_V2_STAGE_FIELDS) {
    if (!(field in upgraded)) {
      upgraded[field] = defaults[field];
    }
  }
  if (!("liveSince" in upgraded)) {
    upgraded.liveSince = typeof upgraded.liveClipId === "string" ? now : null;
  }
}

/** Maps v1 state fields to v2 on an unknown record; a v2 record comes back unchanged.
 *  The result still goes through each side's validators. A record counts as
 *  v1 when it lacks `tempo` or any nested object keeps a v1 shape; only then
 *  are missing v2 fields filled, so a v2 restore payload (which leaves out
 *  liveSince, recentClipIds and screenOverrides) passes through untouched. */
export function upgradeVjStageFieldsV1(
  value: Record<string, unknown>,
  now: number,
): Record<string, unknown> {
  if (!isVjStageFieldsV1(value)) {
    return value;
  }
  const upgraded: Record<string, unknown> = { ...value };
  upgradeVjTransitionV1(upgraded);
  upgradeVjOverlayV1(upgraded);
  upgradeVjEffectsV1(upgraded);
  upgradeVjShuffleAndTempoV1(upgraded, now);
  fillMissingVjStageFieldsV2(upgraded, now);
  return upgraded;
}

/** Fills setlistPlayback on a record saved before sequences; any other record comes back unchanged.
 *  A second pass after upgradeVjStageFieldsV1: a v2 record has `tempo`, so the
 *  v1 pass returns it untouched, and this pass fills the new field for v1 and
 *  v2 records alike. */
export function upgradeVjStageFieldsV2(
  value: Record<string, unknown>,
): Record<string, unknown> {
  if ("setlistPlayback" in value) {
    return value;
  }
  return { ...value, setlistPlayback: createVjSetlistPlayback(false) };
}
