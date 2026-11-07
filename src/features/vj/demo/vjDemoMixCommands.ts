// Contract 7.5 mix and screen override commands for the demo server, pure:
// stage:setMix, stage:swapMix and stage:setScreenOverride. Mirrors
// ruleSetMix, ruleSwapMix and ruleSetScreenOverride of
// queerpulse-backend/src/vj/stage/vj-source-rules.ts (with checkVjMixFields
// of vj-field-checks.ts) in the same check order: the field rules,
// isImmediate, then the library reads. A rule with no library read after its
// field rules leaves isImmediate to the dispatcher, which reads it last.

import {
  VJ_BLEND_MODES,
  VJ_LIMITS,
  roundVjAmount,
  type VjMix,
  type VjScreenOverride,
  type VjSocketErrorCode,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  vjDemoChange,
  withVjLiveClip,
  withVjMixCleared,
  type VjDemoCommandContext,
  type VjDemoCommandOutcome,
} from "./vjDemoCommandKit";
import { isVjUuid } from "./vjDemoRules";
import { readVjImmediateFlag } from "./vjDemoStageCommands";
import {
  UNIT_AMOUNT_RANGE,
  hasExactlyVjKeys,
  isNumberInRange,
  isOneOf,
  isVjRecord,
  readVjGeneratorChoice,
} from "./vjDemoStageInput";

/** The `stage:setMix` patch fields (contract 7.5). */
const VJ_SET_MIX_FIELDS = ["clipId", "amount", "blendMode"] as const;

/** The three fields of a screen override, exactly (contract 3.4). */
const VJ_SCREEN_OVERRIDE_KEYS = [
  "clipId",
  "generatorId",
  "generatorVariant",
] as const;

/** Whether any of the fields is present; an undefined value counts as absent. */
function hasAnyVjField(
  record: Record<string, unknown>,
  fields: readonly string[],
): boolean {
  return fields.some((field) => record[field] !== undefined);
}

/** The `stage:setMix` field rules in order: `clipId` a uuid or null
 *  (lowercased), `amount` a finite number in 0..1 (rounded to 0.01),
 *  `blendMode` one of the blend modes. Absent fields stay out of the patch. */
function readVjMixPatch(
  record: Record<string, unknown>,
): Partial<VjMix> | { error: VjSocketErrorCode } {
  const patch: Partial<VjMix> = {};
  if (record.clipId !== undefined) {
    if (record.clipId === null) {
      patch.clipId = null;
    } else if (isVjUuid(record.clipId)) {
      patch.clipId = record.clipId.toLowerCase();
    } else {
      return { error: "vj_clip_not_found" };
    }
  }
  if (record.amount !== undefined) {
    if (!isNumberInRange(record.amount, UNIT_AMOUNT_RANGE)) {
      return { error: "vj_mix_amount_invalid" };
    }
    patch.amount = roundVjAmount(record.amount);
  }
  if (record.blendMode !== undefined) {
    if (!isOneOf(VJ_BLEND_MODES, record.blendMode)) {
      return { error: "vj_blend_mode_invalid" };
    }
    patch.blendMode = record.blendMode;
  }
  return patch;
}

/** `stage:setMix`: the field rules, isImmediate, then the clip read for a
 *  non-null clip id. Setting `clipId` to null also sets `amount` to 0, even
 *  when the same patch sends an amount. */
export function applySetMix(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_SET_MIX_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  const patch = readVjMixPatch(record);
  if ("error" in patch) return patch;
  const immediate = readVjImmediateFlag("stage:setMix", record);
  if ("error" in immediate) return immediate;
  const clipId = patch.clipId ?? null;
  if (clipId !== null && !context.library.hasClip(clipId)) {
    return { error: "vj_clip_not_found" };
  }
  const mix: VjMix = { ...state.mix, ...patch };
  if (patch.clipId === null) mix.amount = 0;
  return vjDemoChange({ ...state, mix });
}

/** `stage:swapMix`: the mix clip goes live through `withVjLiveClip` (the
 *  generator clears, the sequence grows, liveSince restamps, the history
 *  fronts it) and the mix empties, keeping its blend mode. */
export function applySwapMix(state: VjStageState): VjDemoCommandOutcome {
  const mixClipId = state.mix.clipId;
  if (mixClipId === null) return { error: "vj_mix_empty" };
  const swapped = withVjLiveClip(state, mixClipId);
  return vjDemoChange(
    { ...swapped, mix: withVjMixCleared(state.mix) },
    { isAlwaysChange: true, stamps: { isLiveSourceSet: true } },
  );
}

/** The override field rules in the contract 7.5 order: exactly the three
 *  fields with exactly one source, the generator checks, the clip id shape. A
 *  clip override carries a null variant. */
function readVjScreenOverride(
  value: unknown,
): VjScreenOverride | { error: VjSocketErrorCode } {
  if (!isVjRecord(value) || !hasExactlyVjKeys(value, VJ_SCREEN_OVERRIDE_KEYS)) {
    return { error: "vj_override_invalid" };
  }
  const hasClip = value.clipId !== null;
  const hasGenerator = value.generatorId !== null;
  if (hasClip === hasGenerator) return { error: "vj_override_invalid" };
  if (hasGenerator) {
    const choice = readVjGeneratorChoice(
      value.generatorId,
      value.generatorVariant,
      true,
    );
    if ("error" in choice) return choice;
    return { clipId: null, ...choice };
  }
  if (value.generatorVariant !== null) {
    return { error: "vj_generator_variant_invalid" };
  }
  if (!isVjUuid(value.clipId)) return { error: "vj_clip_not_found" };
  return {
    clipId: value.clipId.toLowerCase(),
    generatorId: null,
    generatorVariant: null,
  };
}

/** The overrides without the screen's entry. */
function withoutScreenOverride(
  screenOverrides: Readonly<Record<string, VjScreenOverride>>,
  screenId: string,
): Record<string, VjScreenOverride> {
  return Object.fromEntries(
    Object.entries(screenOverrides).filter(
      ([overrideScreenId]) => overrideScreenId !== screenId,
    ),
  );
}

/** `stage:setScreenOverride`: the screen must be one of
 *  `context.connectedScreenIds`; null removes its entry (a missing entry
 *  removed is a noop); else the override rules, at most
 *  `VJ_LIMITS.screenOverridesMax` entries, isImmediate, then the clip read
 *  when the override names a clip. */
export function applySetScreenOverride(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  if (!isVjUuid(record.screenId)) return { error: "vj_screen_not_attached" };
  const screenId = record.screenId.toLowerCase();
  if (!context.connectedScreenIds.has(screenId)) {
    return { error: "vj_screen_not_attached" };
  }
  if (record.override === null) {
    return vjDemoChange({
      ...state,
      screenOverrides: withoutScreenOverride(state.screenOverrides, screenId),
    });
  }
  const override = readVjScreenOverride(record.override);
  if ("error" in override) return override;
  const isNewEntry = !Object.hasOwn(state.screenOverrides, screenId);
  if (
    isNewEntry &&
    Object.keys(state.screenOverrides).length >= VJ_LIMITS.screenOverridesMax
  ) {
    return { error: "vj_overrides_too_many" };
  }
  const immediate = readVjImmediateFlag("stage:setScreenOverride", record);
  if ("error" in immediate) return immediate;
  if (override.clipId !== null && !context.library.hasClip(override.clipId)) {
    return { error: "vj_clip_not_found" };
  }
  return vjDemoChange({
    ...state,
    screenOverrides: { ...state.screenOverrides, [screenId]: override },
  });
}
