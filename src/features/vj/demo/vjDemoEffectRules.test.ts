import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_IDS,
  type VjEffectSettings,
} from "../../../shared/contracts/vj";
import {
  applyVjEffectSettingsPatch,
  canonicalVjEffectSettings,
  checkVjEffectSettingsPatch,
  countVjEffectsOn,
  readCompleteVjEffectSetting,
  readStoredVjEffectSettings,
} from "./vjDemoEffectRules";

/** Nine effects without variants or playhead group, each turned on. */
const NINE_EFFECTS_ON = {
  monochrome: { isOn: true },
  saturate: { isOn: true },
  contrast: { isOn: true },
  thermal: { isOn: true },
  hueCycle: { isOn: true },
  hueShift: { isOn: true },
  vhs: { isOn: true },
  filmGrain: { isOn: true },
  scanlines: { isOn: true },
};

describe("applyVjEffectSettingsPatch: step 3", () => {
  it("refuses settings that are no plain object", () => {
    expect(applyVjEffectSettingsPatch({}, [])).toEqual({
      error: "vj_effect_unknown",
    });
    expect(applyVjEffectSettingsPatch({}, "glitch")).toEqual({
      error: "vj_effect_unknown",
    });
  });

  it("refuses more keys than the catalog holds", () => {
    const patch: Record<string, unknown> = {};
    for (const effectId of VJ_EFFECT_IDS) patch[effectId] = null;
    patch.extra = null;
    expect(applyVjEffectSettingsPatch({}, patch)).toEqual({
      error: "vj_effect_unknown",
    });
  });

  it("refuses an id outside the catalog", () => {
    expect(applyVjEffectSettingsPatch({}, { sparkle: { isOn: true } })).toEqual(
      { error: "vj_effect_unknown" },
    );
  });
});

describe("applyVjEffectSettingsPatch: step 4", () => {
  it("refuses an entry that is no object or carries an extra field", () => {
    expect(applyVjEffectSettingsPatch({}, { glitch: true })).toEqual({
      error: "vj_effect_unknown",
    });
    expect(
      applyVjEffectSettingsPatch({}, { glitch: { isOn: true, speed: 2 } }),
    ).toEqual({ error: "vj_effect_unknown" });
  });

  it("refuses a flag that is no boolean", () => {
    expect(applyVjEffectSettingsPatch({}, { glitch: { isOn: 1 } })).toEqual({
      error: "vj_effect_flag_invalid",
    });
  });

  it("refuses an amount outside 0 to 1 or not finite", () => {
    expect(applyVjEffectSettingsPatch({}, { glitch: { amount: 1.5 } })).toEqual(
      { error: "vj_effect_amount_invalid" },
    );
    expect(
      applyVjEffectSettingsPatch({}, { glitch: { amount: Number.NaN } }),
    ).toEqual({ error: "vj_effect_amount_invalid" });
    expect(
      applyVjEffectSettingsPatch({}, { glitch: { amount: "0.5" } }),
    ).toEqual({ error: "vj_effect_amount_invalid" });
  });

  it("refuses a fixed amount that differs from its default", () => {
    expect(applyVjEffectSettingsPatch({}, { mirror: { amount: 0.5 } })).toEqual(
      { error: "vj_effect_amount_invalid" },
    );
    expect(applyVjEffectSettingsPatch({}, { mirror: { amount: 1 } })).toEqual({
      settings: {},
    });
  });

  it("refuses a variant outside the entry's list", () => {
    expect(
      applyVjEffectSettingsPatch({}, { tint: { variant: "neon" } }),
    ).toEqual({ error: "vj_effect_variant_invalid" });
    expect(applyVjEffectSettingsPatch({}, { tint: { variant: null } })).toEqual(
      { error: "vj_effect_variant_invalid" },
    );
    expect(
      applyVjEffectSettingsPatch({}, { glitch: { variant: "steady" } }),
    ).toEqual({ error: "vj_effect_variant_invalid" });
  });

  it("checks entries in catalog order and answers the first bad one", () => {
    expect(
      applyVjEffectSettingsPatch(
        {},
        { glitch: { isOn: "yes" }, invert: { variant: "pulse" } },
      ),
    ).toEqual({ error: "vj_effect_variant_invalid" });
  });

  it("undefined fields read as absent", () => {
    expect(
      applyVjEffectSettingsPatch(
        {},
        { glitch: { isOn: true, amount: undefined, variant: undefined } },
      ),
    ).toEqual({
      settings: { glitch: { isOn: true, amount: 0.4, variant: null } },
    });
  });
});

describe("applyVjEffectSettingsPatch: steps 5 and 6", () => {
  it("refuses two playhead effects turned on together", () => {
    expect(
      applyVjEffectSettingsPatch(
        {},
        { freeze: { isOn: true }, reverse: { isOn: true } },
      ),
    ).toEqual({ error: "vj_effect_exclusive_conflict" });
  });

  it("turning freeze on turns reverse off", () => {
    const current: VjEffectSettings = {
      reverse: { isOn: true, amount: 1, variant: null },
    };
    expect(
      applyVjEffectSettingsPatch(current, { freeze: { isOn: true } }),
    ).toEqual({
      settings: { freeze: { isOn: true, amount: 1, variant: null } },
    });
  });

  it("refuses a result with more than 8 effects on", () => {
    expect(applyVjEffectSettingsPatch({}, NINE_EFFECTS_ON)).toEqual({
      error: "vj_effects_too_many",
    });
  });

  it("null resets to the off default and drops the entry", () => {
    const current: VjEffectSettings = {
      tint: { isOn: true, amount: 0.8, variant: "jade" },
      glitch: { isOn: true, amount: 0.4, variant: null },
    };
    expect(applyVjEffectSettingsPatch(current, { tint: null })).toEqual({
      settings: { glitch: { isOn: true, amount: 0.4, variant: null } },
    });
  });

  it("rounds amounts to 0.01", () => {
    expect(
      applyVjEffectSettingsPatch({}, { glitch: { isOn: true, amount: 0.456 } }),
    ).toEqual({
      settings: { glitch: { isOn: true, amount: 0.46, variant: null } },
    });
  });

  it("merges over the current setting and keeps catalog order", () => {
    const current: VjEffectSettings = {
      beatPulse: { isOn: true, amount: 0.5, variant: null },
    };
    const result = applyVjEffectSettingsPatch(current, {
      monochrome: { isOn: true },
      beatPulse: { amount: 0.7 },
    });
    expect(result).toEqual({
      settings: {
        monochrome: { isOn: true, amount: 1, variant: null },
        beatPulse: { isOn: true, amount: 0.7, variant: null },
      },
    });
    if ("settings" in result) {
      expect(Object.keys(result.settings)).toEqual(["monochrome", "beatPulse"]);
    }
  });
});

describe("checkVjEffectSettingsPatch paths", () => {
  it("a settings key holding undefined reads as absent, as on the JSON wire", () => {
    expect(
      checkVjEffectSettingsPatch(
        { sparkle: undefined, glitch: { isOn: true, extra: undefined } },
        { isComplete: false },
      ),
    ).toEqual({ patch: { glitch: { isOn: true } } });
  });

  it("names the effect and field of the first bad entry", () => {
    expect(
      checkVjEffectSettingsPatch(
        { glitch: { isOn: true, amount: 2, variant: null } },
        { isComplete: true },
      ),
    ).toEqual({ error: "vj_effect_amount_invalid", path: "glitch.amount" });
    expect(
      checkVjEffectSettingsPatch({ glitch: null }, { isComplete: true }),
    ).toEqual({ error: "vj_effect_unknown", path: "glitch" });
  });
});

describe("readCompleteVjEffectSetting", () => {
  it("reads an entry with all three fields", () => {
    expect(
      readCompleteVjEffectSetting("tint", {
        isOn: true,
        amount: 0.333,
        variant: "coral",
      }),
    ).toEqual({ isOn: true, amount: 0.33, variant: "coral" });
  });

  it("refuses an entry missing a field", () => {
    expect(
      readCompleteVjEffectSetting("tint", { isOn: true, amount: 0.5 }),
    ).toEqual({ error: "vj_effect_variant_invalid" });
    expect(readCompleteVjEffectSetting("tint", null)).toEqual({
      error: "vj_effect_unknown",
    });
  });
});

describe("canonicalVjEffectSettings", () => {
  it("drops unknown ids and off defaults, rounds and orders by catalog", () => {
    const result = canonicalVjEffectSettings({
      beatPulse: { isOn: true, amount: 0.555, variant: null },
      sparkle: { isOn: true, amount: 1, variant: null },
      glitch: { isOn: false, amount: 0.4, variant: null },
      monochrome: { isOn: false, amount: 0.3, variant: null },
    });
    expect(result).toEqual({
      monochrome: { isOn: false, amount: 0.3, variant: null },
      beatPulse: { isOn: true, amount: 0.56, variant: null },
    });
    expect(Object.keys(result)).toEqual(["monochrome", "beatPulse"]);
  });

  it("counts the effects that are on", () => {
    expect(
      countVjEffectsOn({
        monochrome: { isOn: false, amount: 0.3, variant: null },
        glitch: { isOn: true, amount: 0.4, variant: null },
        beatPulse: { isOn: true, amount: 0.5, variant: null },
      }),
    ).toBe(2);
  });
});

describe("readStoredVjEffectSettings", () => {
  it("drops a bad entry and keeps a second playhead effect turned off", () => {
    expect(
      readStoredVjEffectSettings({
        sparkle: { isOn: true, amount: 1, variant: null },
        tint: { isOn: true, amount: 0.5 },
        freeze: { isOn: true, amount: 1, variant: null },
        reverse: { isOn: true, amount: 1, variant: null },
      }),
    ).toEqual({ freeze: { isOn: true, amount: 1, variant: null } });
  });

  it("keeps entries past the 8-on cap turned off", () => {
    const stored: Record<string, unknown> = {};
    for (const effectId of Object.keys(NINE_EFFECTS_ON)) {
      stored[effectId] = { isOn: true, amount: 0.2, variant: null };
    }
    const result = readStoredVjEffectSettings(stored);
    expect(countVjEffectsOn(result)).toBe(8);
    expect(result.scanlines).toEqual({
      isOn: false,
      amount: 0.2,
      variant: null,
    });
  });
});
