// Effect setting rules of the demo stage (C 7.6 steps 3 to 6), the demo
// mirror of the backend `vj-field-checks.ts` (checkVjEffectSettingsPatch,
// mergeVjEffectSettings, canonicalVjEffectSettings) and of the lenient
// settings reader its restore and scene reads share. Same check order, same
// codes, same field paths. Pure functions over plain values.

import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  VJ_LIMITS,
  roundVjAmount,
  type VjEffectId,
  type VjEffectSetting,
  type VjEffectSettingPatch,
  type VjEffectSettings,
  type VjSocketErrorCode,
} from "../../../shared/contracts/vj";
import {
  UNIT_AMOUNT_RANGE,
  isNumberInRange,
  isOneOf,
  isVjRecord,
} from "./vjDemoStageInput";

export type VjDemoRuleError = { error: VjSocketErrorCode };

/** A refusal with the dot path of the first bad field in schema names
 *  (`""` when the whole value is bad); the scene look turns it into its
 *  `lookField`. */
export type VjDemoFieldError = VjDemoRuleError & { path: string };

/** A `stage:setEffects` settings patch after its field rules; null resets an
 *  effect to its off default. */
export type VjEffectSettingsPatch = Partial<
  Record<VjEffectId, VjEffectSettingPatch | null>
>;

/** The fields one effect setting may carry. */
const EFFECT_SETTING_FIELDS = ["isOn", "amount", "variant"] as const;

/** The keys whose value is present. An undefined value counts as absent:
 *  the demo channel's structured clone keeps such keys, the live socket's
 *  JSON drops them before the backend reads the payload. */
function presentKeys(value: Record<string, unknown>): string[] {
  return Object.keys(value).filter((key) => value[key] !== undefined);
}

function refuseField(error: VjSocketErrorCode, path: string): VjDemoFieldError {
  return { error, path };
}

/** The catalog's off default of an effect, a fresh literal. */
function offDefaultSetting(effectId: VjEffectId): VjEffectSetting {
  const entry = VJ_EFFECT_CATALOG[effectId];
  return {
    isOn: false,
    amount: entry.defaultAmount,
    variant: entry.defaultVariant,
  };
}

/** Whether a value is one of an effect's variants (null exactly when it has none). */
function isEffectVariant(effectId: VjEffectId, value: unknown): boolean {
  const variants = VJ_EFFECT_CATALOG[effectId].variants;
  if (variants.length === 0) return value === null;
  return isOneOf<string>(variants, value);
}

/** C 7.6 step 4 for one entry: a null reset, or a plain object whose keys
 *  are a subset of the three fields, each checked in turn (an undefined field
 *  counts as absent). isComplete requires all three fields and refuses a null
 *  entry. */
function checkEffectSettingEntry(
  effectId: VjEffectId,
  value: unknown,
  isComplete: boolean,
): { entry: VjEffectSettingPatch | null } | VjDemoFieldError {
  if (value === null && !isComplete) return { entry: null };
  if (
    !isVjRecord(value) ||
    presentKeys(value).some(
      (field) => !isOneOf<string>(EFFECT_SETTING_FIELDS, field),
    )
  ) {
    return refuseField("vj_effect_unknown", effectId);
  }
  const catalogEntry = VJ_EFFECT_CATALOG[effectId];
  const entry: VjEffectSettingPatch = {};
  if (value.isOn !== undefined || isComplete) {
    if (typeof value.isOn !== "boolean") {
      return refuseField("vj_effect_flag_invalid", `${effectId}.isOn`);
    }
    entry.isOn = value.isOn;
  }
  if (value.amount !== undefined || isComplete) {
    if (!isNumberInRange(value.amount, UNIT_AMOUNT_RANGE)) {
      return refuseField("vj_effect_amount_invalid", `${effectId}.amount`);
    }
    const amount = roundVjAmount(value.amount);
    if (
      !catalogEntry.isAmountAdjustable &&
      amount !== catalogEntry.defaultAmount
    ) {
      return refuseField("vj_effect_amount_invalid", `${effectId}.amount`);
    }
    entry.amount = amount;
  }
  if (value.variant !== undefined || isComplete) {
    if (!isEffectVariant(effectId, value.variant)) {
      return refuseField("vj_effect_variant_invalid", `${effectId}.variant`);
    }
    entry.variant = value.variant as string | null;
  }
  return { entry };
}

/** C 7.6 steps 3 and 4. isComplete (scene looks, restore) requires all three
 *  fields per entry and refuses null entries. */
export function checkVjEffectSettingsPatch(
  value: unknown,
  options: { isComplete: boolean },
): { patch: VjEffectSettingsPatch } | VjDemoFieldError {
  if (!isVjRecord(value)) return refuseField("vj_effect_unknown", "");
  const keys = presentKeys(value);
  if (
    keys.length > VJ_EFFECT_IDS.length ||
    keys.some((key) => !isOneOf<string>(VJ_EFFECT_IDS, key))
  ) {
    return refuseField("vj_effect_unknown", "");
  }
  const patch: VjEffectSettingsPatch = {};
  for (const effectId of VJ_EFFECT_IDS) {
    if (value[effectId] === undefined) continue;
    const entryCheck = checkEffectSettingEntry(
      effectId,
      value[effectId],
      options.isComplete,
    );
    if ("error" in entryCheck) return entryCheck;
    patch[effectId] = entryCheck.entry;
  }
  return { patch };
}

/** Ids of `playhead` effects the patch turns on, in catalog order. */
function playheadIdsTurnedOn(patch: VjEffectSettingsPatch): VjEffectId[] {
  return VJ_EFFECT_IDS.filter(
    (effectId) =>
      VJ_EFFECT_CATALOG[effectId].exclusiveGroup === "playhead" &&
      patch[effectId]?.isOn === true,
  );
}

/** C 7.6 steps 5 and 6: playhead exclusivity, the merge over
 *  vjEffectSettingOf, the 8-on cap; the result is canonical. */
export function mergeVjEffectSettings(
  current: VjEffectSettings,
  patch: VjEffectSettingsPatch,
): { settings: VjEffectSettings } | VjDemoFieldError {
  const playheadIds = playheadIdsTurnedOn(patch);
  if (playheadIds.length > 1) {
    return refuseField("vj_effect_exclusive_conflict", "");
  }
  const turnedOnPlayheadId = playheadIds[0] ?? null;
  const merged: VjEffectSettings = {};
  let onCount = 0;
  for (const effectId of VJ_EFFECT_IDS) {
    const base = current[effectId] ?? offDefaultSetting(effectId);
    const entryPatch = patch[effectId];
    const setting: VjEffectSetting =
      entryPatch === null
        ? offDefaultSetting(effectId)
        : {
            isOn: entryPatch?.isOn ?? base.isOn,
            amount: entryPatch?.amount ?? base.amount,
            variant:
              entryPatch?.variant === undefined
                ? base.variant
                : entryPatch.variant,
          };
    if (
      turnedOnPlayheadId !== null &&
      effectId !== turnedOnPlayheadId &&
      VJ_EFFECT_CATALOG[effectId].exclusiveGroup === "playhead"
    ) {
      setting.isOn = false;
    }
    if (setting.isOn) onCount += 1;
    merged[effectId] = setting;
  }
  if (onCount > VJ_LIMITS.effectsOnMax) {
    return refuseField("vj_effects_too_many", "");
  }
  return { settings: canonicalVjEffectSettings(merged) };
}

/** C 7.6 steps 3 to 6 over the current settings; the result is canonical and amounts rounded to 0.01. */
export function applyVjEffectSettingsPatch(
  current: VjEffectSettings,
  patch: unknown,
): { settings: VjEffectSettings } | VjDemoRuleError {
  const patchCheck = checkVjEffectSettingsPatch(patch, { isComplete: false });
  if ("error" in patchCheck) return { error: patchCheck.error };
  const mergeCheck = mergeVjEffectSettings(current, patchCheck.patch);
  if ("error" in mergeCheck) return { error: mergeCheck.error };
  return { settings: mergeCheck.settings };
}

/** One complete entry (scene look, restore): all three fields present, C 7.6 step 4 rules. */
export function readCompleteVjEffectSetting(
  effectId: VjEffectId,
  value: unknown,
): VjEffectSetting | VjDemoRuleError {
  const entryCheck = checkEffectSettingEntry(effectId, value, true);
  if ("error" in entryCheck) return { error: entryCheck.error };
  const entry = entryCheck.entry as VjEffectSetting;
  return { isOn: entry.isOn, amount: entry.amount, variant: entry.variant };
}

/** Whether a value has the shape of a setting (the field rules are not run). */
function isSettingShaped(value: unknown): value is VjEffectSetting {
  return (
    isVjRecord(value) &&
    typeof value.isOn === "boolean" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    (typeof value.variant === "string" || value.variant === null)
  );
}

/** Catalog order, off defaults dropped, unknown ids dropped, amounts rounded. */
export function canonicalVjEffectSettings(
  settings: Record<string, unknown> | VjEffectSettings,
): VjEffectSettings {
  const source = settings as Record<string, unknown>;
  const canonicalSettings: VjEffectSettings = {};
  for (const effectId of VJ_EFFECT_IDS) {
    const setting = source[effectId];
    if (!isSettingShaped(setting)) continue;
    const entry = VJ_EFFECT_CATALOG[effectId];
    const amount = roundVjAmount(setting.amount);
    const isOffDefault =
      !setting.isOn &&
      amount === entry.defaultAmount &&
      setting.variant === entry.defaultVariant;
    if (isOffDefault) continue;
    canonicalSettings[effectId] = {
      isOn: setting.isOn,
      amount,
      variant: setting.variant,
    };
  }
  return canonicalSettings;
}

export function countVjEffectsOn(settings: VjEffectSettings): number {
  return VJ_EFFECT_IDS.filter((effectId) => settings[effectId]?.isOn === true)
    .length;
}

/** Stored settings read leniently (C 7.13 restore, C 3.7 scene reads), in
 *  catalog order: an unknown id or an entry failing the complete-entry rules
 *  is dropped; an entry past the 8-on cap, or a second playhead effect on,
 *  is kept turned off. Catalog order decides which stay on. */
export function readStoredVjEffectSettings(value: unknown): VjEffectSettings {
  if (!isVjRecord(value)) return {};
  const settings: VjEffectSettings = {};
  let onCount = 0;
  let hasPlayheadOn = false;
  for (const effectId of VJ_EFFECT_IDS) {
    if (value[effectId] === undefined) continue;
    const setting = readCompleteVjEffectSetting(effectId, value[effectId]);
    if ("error" in setting) continue;
    const isPlayhead =
      VJ_EFFECT_CATALOG[effectId].exclusiveGroup === "playhead";
    const isOn =
      setting.isOn &&
      onCount < VJ_LIMITS.effectsOnMax &&
      !(isPlayhead && hasPlayheadOn);
    if (isOn) {
      onCount += 1;
      hasPlayheadOn = hasPlayheadOn || isPlayhead;
    }
    settings[effectId] = {
      isOn,
      amount: setting.amount,
      variant: setting.variant,
    };
  }
  return canonicalVjEffectSettings(settings);
}
