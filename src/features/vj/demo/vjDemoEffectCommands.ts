// Contract 7.6 effect commands of the demo stage, pure: `stage:setEffects`
// and `stage:resetLook`. Mirrors ruleSetEffects of
// queerpulse-backend/src/vj/stage/vj-effects-rules.ts and ruleResetLook of
// vj-look-rules.ts in the same check order. isImmediate is read last by the
// dispatcher (vjDemoStageCommands.ts); neither rule reads the library.

import {
  VJ_SPEEDS,
  type VjEffects,
  type VjSpeed,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { vjDemoChange, type VjDemoCommandOutcome } from "./vjDemoCommandKit";
import { applyVjEffectSettingsPatch } from "./vjDemoEffectRules";
import { isOneOf } from "./vjDemoStageInput";

/** The `stage:setEffects` fields that make a patch; isImmediate alone is empty. */
const VJ_SET_EFFECTS_PATCH_FIELDS = [
  "speed",
  "isBlackout",
  "settings",
] as const;

/** `stage:setEffects`: an empty patch first, then speed, blackout, the
 *  settings entries in catalog order, playhead exclusivity and the 8-on cap
 *  (C 7.6 steps 1 to 6). An undefined field counts as absent. The settings
 *  come back canonical. */
export function applySetEffects(
  state: VjStageState,
  record: Record<string, unknown>,
): VjDemoCommandOutcome {
  const hasPatchField = VJ_SET_EFFECTS_PATCH_FIELDS.some(
    (field) => record[field] !== undefined,
  );
  if (!hasPatchField) return { error: "vj_patch_empty" };
  const effects: VjEffects = { ...state.effects };
  if (record.speed !== undefined) {
    if (!isOneOf<VjSpeed>(VJ_SPEEDS, record.speed)) {
      return { error: "vj_speed_invalid" };
    }
    effects.speed = record.speed;
  }
  if (record.isBlackout !== undefined) {
    if (typeof record.isBlackout !== "boolean") {
      return { error: "vj_effect_flag_invalid" };
    }
    effects.isBlackout = record.isBlackout;
  }
  if (record.settings !== undefined) {
    const settingsCheck = applyVjEffectSettingsPatch(
      state.effects.settings,
      record.settings,
    );
    if ("error" in settingsCheck) return settingsCheck;
    effects.settings = settingsCheck.settings;
  }
  return vjDemoChange({ ...state, effects });
}

/** `stage:resetLook`: clears the C 7.6 field list in one change (effect
 *  settings, speed, strobe, overlay visibility and hideAt, countdown, logo,
 *  event card, the mix). Blackout, overlay text and styling, overrides,
 *  tempo, shuffle, the live source and the set list stay. A stage with
 *  nothing to clear comes back unchanged, so the dispatcher answers a noop. */
export function applyResetLook(state: VjStageState): VjDemoCommandOutcome {
  return vjDemoChange(
    {
      ...state,
      effects: {
        ...state.effects,
        settings: {},
        speed: 1,
        isStrobing: false,
        strobeStartedAt: null,
      },
      overlay: { ...state.overlay, isVisible: false, hideAt: null },
      countdown: { ...state.countdown, isVisible: false },
      logo: { ...state.logo, isVisible: false },
      eventCard: { ...state.eventCard, isVisible: false },
      mix: { clipId: null, amount: 0, blendMode: "normal" },
    },
    { stamps: { overlayHideAfterMs: null } },
  );
}
