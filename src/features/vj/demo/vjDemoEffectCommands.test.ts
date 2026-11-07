import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_IDS,
  createVjStageState,
  isSameVjStageContent,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjDemoCommandOutcome } from "./vjDemoCommandKit";
import { applyResetLook, applySetEffects } from "./vjDemoEffectCommands";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const PACK_ID = "11111111-1111-4111-8111-1111111111a1";
const CLIP_ID = "00000000-0000-4000-8000-0000000000c1";
const MIX_CLIP_ID = "00000000-0000-4000-8000-0000000000c2";
const SCREEN_ID = "55555555-5555-4555-8555-555555555555";
const SETLIST_ID = "66666666-6666-4666-8666-666666666666";

function freshState(): VjStageState {
  return { ...createVjStageState(STAGE_EPOCH, 0), revision: 3 };
}

function errorOf(outcome: VjDemoCommandOutcome): string | null {
  return "error" in outcome ? outcome.error : null;
}

function nextOf(outcome: VjDemoCommandOutcome): VjStageState {
  if ("error" in outcome) {
    throw new Error(`Expected a change, got ${outcome.error}`);
  }
  return outcome.next;
}

/** A state with every field resetLook clears set away from its default. */
function busyState(): VjStageState {
  const state = freshState();
  const busy: VjStageState = {
    ...state,
    activePackId: PACK_ID,
    liveClipId: CLIP_ID,
    liveSince: 1_000,
    clipSequence: 4,
    recentClipIds: [CLIP_ID],
    effects: {
      speed: 2,
      settings: { glitch: { isOn: true, amount: 0.5, variant: null } },
      isStrobing: true,
      isBlackout: true,
      strobeStartedAt: 2_000,
    },
    overlay: {
      ...state.overlay,
      text: "Hello dancers",
      style: "ticker",
      colorToken: "coral",
      isVisible: true,
      hideAt: 9_000,
    },
    countdown: { isVisible: true, targetAt: 60_000, label: "Doors" },
    logo: { isVisible: true, corner: "topLeft" },
    eventCard: { isVisible: true, kind: "nextEvent" },
    mix: { clipId: MIX_CLIP_ID, amount: 0.4, blendMode: "screen" },
    tempo: { ...state.tempo, bpm: 128, quantize: "beat", source: "tap" },
    shuffle: { ...state.shuffle, isOn: true },
    screenOverrides: {
      [SCREEN_ID]: {
        clipId: CLIP_ID,
        generatorId: null,
        generatorVariant: null,
      },
    },
    activeSetlistId: SETLIST_ID,
    setlistIndex: 2,
  };
  return busy;
}

describe("applySetEffects check order (C 7.6)", () => {
  it("answers vj_patch_empty with none of speed, isBlackout, settings", () => {
    expect(errorOf(applySetEffects(freshState(), {}))).toBe("vj_patch_empty");
    expect(errorOf(applySetEffects(freshState(), { isImmediate: true }))).toBe(
      "vj_patch_empty",
    );
    expect(errorOf(applySetEffects(freshState(), { speed: undefined }))).toBe(
      "vj_patch_empty",
    );
  });

  it("answers vj_speed_invalid before the blackout rule", () => {
    expect(
      errorOf(applySetEffects(freshState(), { speed: 3, isBlackout: "yes" })),
    ).toBe("vj_speed_invalid");
    expect(errorOf(applySetEffects(freshState(), { speed: "1" }))).toBe(
      "vj_speed_invalid",
    );
  });

  it("answers vj_effect_flag_invalid for a non-boolean blackout before the settings", () => {
    expect(
      errorOf(
        applySetEffects(freshState(), { isBlackout: 1, settings: "glitch" }),
      ),
    ).toBe("vj_effect_flag_invalid");
  });

  it("answers vj_effect_unknown for settings that are not a plain object", () => {
    expect(errorOf(applySetEffects(freshState(), { settings: [] }))).toBe(
      "vj_effect_unknown",
    );
    expect(errorOf(applySetEffects(freshState(), { settings: null }))).toBe(
      "vj_effect_unknown",
    );
  });

  it("answers vj_effect_unknown for more than 34 keys or a key outside the catalog", () => {
    const tooMany: Record<string, unknown> = { extraEffect: null };
    for (const effectId of VJ_EFFECT_IDS) tooMany[effectId] = null;
    expect(errorOf(applySetEffects(freshState(), { settings: tooMany }))).toBe(
      "vj_effect_unknown",
    );
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { sparkle: { isOn: true } },
        }),
      ),
    ).toBe("vj_effect_unknown");
  });

  it("answers vj_effect_unknown for an entry with a field outside isOn, amount, variant", () => {
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { glitch: { isOn: true, speed: 2 } },
        }),
      ),
    ).toBe("vj_effect_unknown");
  });

  it("answers vj_effect_flag_invalid for a non-boolean isOn", () => {
    expect(
      errorOf(
        applySetEffects(freshState(), { settings: { glitch: { isOn: 1 } } }),
      ),
    ).toBe("vj_effect_flag_invalid");
  });

  it("answers vj_effect_amount_invalid outside 0..1 or off the default of a fixed amount", () => {
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { monochrome: { amount: 1.2 } },
        }),
      ),
    ).toBe("vj_effect_amount_invalid");
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { monochrome: { amount: Number.NaN } },
        }),
      ),
    ).toBe("vj_effect_amount_invalid");
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { freeze: { amount: 0.5 } },
        }),
      ),
    ).toBe("vj_effect_amount_invalid");
  });

  it("answers vj_effect_variant_invalid for a variant the entry does not list", () => {
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { invert: { variant: "pulse" } },
        }),
      ),
    ).toBe("vj_effect_variant_invalid");
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { invert: { variant: null } },
        }),
      ),
    ).toBe("vj_effect_variant_invalid");
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { monochrome: { variant: "steady" } },
        }),
      ),
    ).toBe("vj_effect_variant_invalid");
  });

  it("answers vj_effect_exclusive_conflict for two playhead effects turned on", () => {
    expect(
      errorOf(
        applySetEffects(freshState(), {
          settings: { freeze: { isOn: true }, reverse: { isOn: true } },
        }),
      ),
    ).toBe("vj_effect_exclusive_conflict");
  });

  it("answers vj_effects_too_many past 8 effects on", () => {
    const settings: Record<string, unknown> = {};
    for (const effectId of VJ_EFFECT_IDS.slice(0, 9)) {
      settings[effectId] = { isOn: true };
    }
    expect(errorOf(applySetEffects(freshState(), { settings }))).toBe(
      "vj_effects_too_many",
    );
  });
});

describe("applySetEffects changes", () => {
  it("sets speed and blackout and leaves the other effect fields", () => {
    const next = nextOf(
      applySetEffects(freshState(), { speed: 0.5, isBlackout: true }),
    );
    expect(next.effects).toEqual({
      speed: 0.5,
      settings: {},
      isStrobing: false,
      isBlackout: true,
      strobeStartedAt: null,
    });
  });

  it("a held pad sends isOn true then false and both change the state", () => {
    const state = freshState();
    const pressed = nextOf(
      applySetEffects(state, { settings: { glitch: { isOn: true } } }),
    );
    expect(pressed.effects.settings.glitch?.isOn).toBe(true);
    expect(isSameVjStageContent(pressed, state)).toBe(false);
    const released = nextOf(
      applySetEffects(pressed, { settings: { glitch: { isOn: false } } }),
    );
    expect(released.effects.settings.glitch).toBeUndefined();
    expect(isSameVjStageContent(released, pressed)).toBe(false);
  });

  it("turning freeze on turns reverse off", () => {
    const withReverse = nextOf(
      applySetEffects(freshState(), { settings: { reverse: { isOn: true } } }),
    );
    const next = nextOf(
      applySetEffects(withReverse, { settings: { freeze: { isOn: true } } }),
    );
    expect(next.effects.settings.freeze?.isOn).toBe(true);
    expect(next.effects.settings.reverse).toBeUndefined();
  });

  it("null resets an effect to its off default and drops the entry", () => {
    const withGlitch = nextOf(
      applySetEffects(freshState(), {
        settings: { glitch: { isOn: true, amount: 0.9 } },
      }),
    );
    const next = nextOf(
      applySetEffects(withGlitch, { settings: { glitch: null } }),
    );
    expect(next.effects.settings).toEqual({});
  });

  it("rounds amounts to 0.01 and keeps the settings canonical", () => {
    const next = nextOf(
      applySetEffects(freshState(), {
        settings: { monochrome: { isOn: true, amount: 0.333 } },
      }),
    );
    expect(next.effects.settings.monochrome).toEqual({
      isOn: true,
      amount: 0.33,
      variant: null,
    });
  });

  it("an undefined field reads as absent", () => {
    const next = nextOf(
      applySetEffects(freshState(), {
        speed: undefined,
        isBlackout: true,
        settings: undefined,
      }),
    );
    expect(next.effects.speed).toBe(1);
    expect(next.effects.isBlackout).toBe(true);
  });

  it("never asks for an always-change or a stamp", () => {
    const outcome = applySetEffects(freshState(), { isBlackout: true });
    if ("error" in outcome) throw new Error(outcome.error);
    expect(outcome.isAlwaysChange).toBe(false);
    expect(outcome.stamps.isLiveSourceSet).toBe(false);
    expect(outcome.stamps.isStrobeStarted).toBe(false);
  });
});

describe("applyResetLook (C 7.6)", () => {
  it("reset look clears settings, speed, strobe, overlay, countdown, logo, card and mix", () => {
    const next = nextOf(applyResetLook(busyState()));
    expect(next.effects.settings).toEqual({});
    expect(next.effects.speed).toBe(1);
    expect(next.effects.isStrobing).toBe(false);
    expect(next.effects.strobeStartedAt).toBeNull();
    expect(next.overlay.isVisible).toBe(false);
    expect(next.overlay.hideAt).toBeNull();
    expect(next.countdown.isVisible).toBe(false);
    expect(next.logo.isVisible).toBe(false);
    expect(next.eventCard.isVisible).toBe(false);
    expect(next.mix).toEqual({ clipId: null, amount: 0, blendMode: "normal" });
  });

  it("reset look keeps blackout, text, overrides, tempo, shuffle and the live source", () => {
    const state = busyState();
    const next = nextOf(applyResetLook(state));
    expect(next.effects.isBlackout).toBe(true);
    expect(next.overlay.text).toBe(state.overlay.text);
    expect(next.overlay.style).toBe(state.overlay.style);
    expect(next.overlay.colorToken).toBe(state.overlay.colorToken);
    expect(next.countdown.targetAt).toBe(state.countdown.targetAt);
    expect(next.countdown.label).toBe(state.countdown.label);
    expect(next.logo.corner).toBe(state.logo.corner);
    expect(next.eventCard.kind).toBe(state.eventCard.kind);
    expect(next.screenOverrides).toEqual(state.screenOverrides);
    expect(next.tempo).toEqual(state.tempo);
    expect(next.shuffle).toEqual(state.shuffle);
    expect(next.transition).toEqual(state.transition);
    expect(next.activePackId).toBe(state.activePackId);
    expect(next.liveClipId).toBe(state.liveClipId);
    expect(next.liveSince).toBe(state.liveSince);
    expect(next.clipSequence).toBe(state.clipSequence);
    expect(next.recentClipIds).toEqual(state.recentClipIds);
    expect(next.activeSetlistId).toBe(state.activeSetlistId);
    expect(next.setlistIndex).toBe(state.setlistIndex);
  });

  it("reset look clears the overlay hide stamp and asks for no always-change", () => {
    const outcome = applyResetLook(busyState());
    if ("error" in outcome) throw new Error(outcome.error);
    expect(outcome.stamps.overlayHideAfterMs).toBeNull();
    expect(outcome.isAlwaysChange).toBe(false);
  });

  it("reset look with nothing to clear is a noop", () => {
    const state = freshState();
    const outcome = applyResetLook(state);
    if ("error" in outcome) throw new Error(outcome.error);
    expect(outcome.isAlwaysChange).toBe(false);
    expect(isSameVjStageContent(outcome.next, state)).toBe(true);
  });

  it("reset look with blackout on alone is a noop", () => {
    const state = freshState();
    const blackoutState: VjStageState = {
      ...state,
      effects: { ...state.effects, isBlackout: true },
    };
    const outcome = applyResetLook(blackoutState);
    if ("error" in outcome) throw new Error(outcome.error);
    expect(isSameVjStageContent(outcome.next, blackoutState)).toBe(true);
  });
});
