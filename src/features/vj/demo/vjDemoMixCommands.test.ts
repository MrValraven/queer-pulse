import { describe, expect, it } from "vitest";
import {
  VJ_LIMITS,
  createVjStageState,
  type VjScreenOverride,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type {
  VjDemoCommandContext,
  VjDemoCommandOutcome,
  VjDemoLibraryLookup,
} from "./vjDemoCommandKit";
import {
  applySetMix,
  applySetScreenOverride,
  applySwapMix,
} from "./vjDemoMixCommands";
import { applyVjStageCommand } from "./vjDemoStageCommands";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const CLIP_KNOWN = "00000000-0000-4000-8000-0000000000c1";
const CLIP_OTHER = "00000000-0000-4000-8000-0000000000c2";
const CLIP_LIVE = "00000000-0000-4000-8000-0000000000c3";
const CLIP_MISSING = "00000000-0000-4000-8000-0000000000ff";
const SCREEN_ONLINE = "55555555-5555-4555-8555-5555555555a1";
const SCREEN_OFFLINE = "55555555-5555-4555-8555-5555555555a9";
const NOW = 50_000;

const KNOWN_CLIP_IDS = new Set([CLIP_KNOWN, CLIP_OTHER, CLIP_LIVE]);

function demoLibrary(): VjDemoLibraryLookup {
  return {
    hasPack: () => false,
    hasClip: (clipId) => KNOWN_CLIP_IDS.has(clipId),
    isClipInPack: () => false,
    readPackForStage: () => null,
    existingClipIds: (clipIds) =>
      new Set(clipIds.filter((clipId) => KNOWN_CLIP_IDS.has(clipId))),
    clipIdsInPack: () => new Set<string>(),
    readPackClipForAdvance: () => null,
    readSceneLook: () => null,
    readSetlist: () => null,
    readSetlistFollow: () => null,
  };
}

const CONTEXT: VjDemoCommandContext = {
  now: NOW,
  library: demoLibrary(),
  connectedScreenIds: new Set([SCREEN_ONLINE]),
  isLeadMicOn: false,
};

/** The context with these screen ids connected. */
function contextWithScreens(screenIds: string[]): VjDemoCommandContext {
  return { ...CONTEXT, connectedScreenIds: new Set(screenIds) };
}

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

/** A uuid for the screen at the index, distinct from the fixtures above. */
function screenIdAt(index: number): string {
  return `66666666-6666-4666-8666-${index.toString().padStart(12, "0")}`;
}

const CLIP_OVERRIDE: VjScreenOverride = {
  clipId: CLIP_KNOWN,
  generatorId: null,
  generatorVariant: null,
};

describe("stage:setMix", () => {
  it("answers vj_patch_empty with none of clipId, amount and blendMode", () => {
    expect(errorOf(applySetMix(freshState(), {}, CONTEXT))).toBe(
      "vj_patch_empty",
    );
    expect(
      errorOf(applySetMix(freshState(), { amount: undefined }, CONTEXT)),
    ).toBe("vj_patch_empty");
  });

  it("answers vj_clip_not_found for a malformed clip id before the amount", () => {
    expect(
      errorOf(
        applySetMix(freshState(), { clipId: "clip", amount: 2 }, CONTEXT),
      ),
    ).toBe("vj_clip_not_found");
  });

  it("answers vj_mix_amount_invalid for an amount outside 0..1 or not finite", () => {
    for (const amount of [-0.1, 1.01, Number.NaN, "0.5"]) {
      expect(errorOf(applySetMix(freshState(), { amount }, CONTEXT))).toBe(
        "vj_mix_amount_invalid",
      );
    }
  });

  it("answers vj_blend_mode_invalid for an unknown blend mode", () => {
    expect(
      errorOf(applySetMix(freshState(), { blendMode: "overlay" }, CONTEXT)),
    ).toBe("vj_blend_mode_invalid");
  });

  it("answers isImmediate after the field rules and before the clip read", () => {
    expect(
      errorOf(
        applySetMix(freshState(), { amount: 3, isImmediate: true }, CONTEXT),
      ),
    ).toBe("vj_mix_amount_invalid");
    expect(
      errorOf(
        applySetMix(
          freshState(),
          { clipId: CLIP_MISSING, isImmediate: true },
          CONTEXT,
        ),
      ),
    ).toBe("vj_immediate_not_allowed");
    expect(
      errorOf(
        applySetMix(
          freshState(),
          { clipId: CLIP_MISSING, isImmediate: "yes" },
          CONTEXT,
        ),
      ),
    ).toBe("vj_effect_flag_invalid");
  });

  it("answers vj_clip_not_found for an unknown clip", () => {
    expect(
      errorOf(applySetMix(freshState(), { clipId: CLIP_MISSING }, CONTEXT)),
    ).toBe("vj_clip_not_found");
  });

  it("sets the clip lowercased and rounds the amount to 0.01", () => {
    const next = nextOf(
      applySetMix(
        freshState(),
        { clipId: CLIP_KNOWN.toUpperCase(), amount: 0.333, blendMode: "add" },
        CONTEXT,
      ),
    );
    expect(next.mix).toEqual({
      clipId: CLIP_KNOWN,
      amount: 0.33,
      blendMode: "add",
    });
  });

  it("keeps the fields a patch leaves out", () => {
    const state: VjStageState = {
      ...freshState(),
      mix: { clipId: CLIP_KNOWN, amount: 0.4, blendMode: "screen" },
    };
    expect(nextOf(applySetMix(state, { amount: 0.6 }, CONTEXT)).mix).toEqual({
      clipId: CLIP_KNOWN,
      amount: 0.6,
      blendMode: "screen",
    });
  });

  it("clipId null also zeroes the amount even when an amount is sent", () => {
    const state: VjStageState = {
      ...freshState(),
      mix: { clipId: CLIP_KNOWN, amount: 0.4, blendMode: "screen" },
    };
    expect(
      nextOf(applySetMix(state, { clipId: null, amount: 0.8 }, CONTEXT)).mix,
    ).toEqual({ clipId: null, amount: 0, blendMode: "screen" });
  });

  it("an unchanged mix patch is a noop through the dispatcher", () => {
    const result = applyVjStageCommand(
      freshState(),
      "stage:setMix",
      { blendMode: "normal" },
      CONTEXT,
    );
    expect("error" in result ? result.error : result.isNoop).toBe(true);
  });
});

describe("stage:swapMix", () => {
  it("answers vj_mix_empty when the mix has no clip", () => {
    expect(errorOf(applySwapMix(freshState()))).toBe("vj_mix_empty");
  });

  it("answers vj_immediate_not_allowed through the dispatcher after vj_mix_empty", () => {
    const emptyResult = applyVjStageCommand(
      freshState(),
      "stage:swapMix",
      { isImmediate: true },
      CONTEXT,
    );
    expect("error" in emptyResult ? emptyResult.error : null).toBe(
      "vj_mix_empty",
    );
    const state: VjStageState = {
      ...freshState(),
      mix: { clipId: CLIP_KNOWN, amount: 0.5, blendMode: "add" },
    };
    const result = applyVjStageCommand(
      state,
      "stage:swapMix",
      { isImmediate: true },
      CONTEXT,
    );
    expect("error" in result ? result.error : null).toBe(
      "vj_immediate_not_allowed",
    );
  });

  it("swap promotes the mix clip and keeps the blend mode", () => {
    const state: VjStageState = {
      ...freshState(),
      liveClipId: null,
      liveGeneratorId: "prideFlagWave",
      liveGeneratorVariant: "rainbow",
      recentClipIds: [CLIP_LIVE, CLIP_KNOWN],
      mix: { clipId: CLIP_KNOWN, amount: 0.7, blendMode: "difference" },
    };
    const outcome = applySwapMix(state);
    if ("error" in outcome) throw new Error(outcome.error);
    expect(outcome.next.liveClipId).toBe(CLIP_KNOWN);
    expect(outcome.next.liveGeneratorId).toBeNull();
    expect(outcome.next.liveGeneratorVariant).toBeNull();
    expect(outcome.next.clipSequence).toBe(state.clipSequence + 1);
    expect(outcome.next.recentClipIds).toEqual([CLIP_KNOWN, CLIP_LIVE]);
    expect(outcome.next.mix).toEqual({
      clipId: null,
      amount: 0,
      blendMode: "difference",
    });
    expect(outcome.stamps.isLiveSourceSet).toBe(true);
    expect(outcome.isAlwaysChange).toBe(true);
  });
});

describe("stage:setScreenOverride refusals", () => {
  it("answers vj_screen_not_attached for a malformed screen id", () => {
    expect(
      errorOf(
        applySetScreenOverride(
          freshState(),
          { screenId: "screen", override: CLIP_OVERRIDE },
          CONTEXT,
        ),
      ),
    ).toBe("vj_screen_not_attached");
  });

  it("an override for an offline screen is refused", () => {
    expect(
      errorOf(
        applySetScreenOverride(
          freshState(),
          { screenId: SCREEN_OFFLINE, override: CLIP_OVERRIDE },
          CONTEXT,
        ),
      ),
    ).toBe("vj_screen_not_attached");
  });

  it("answers vj_override_invalid for a missing, extra or blank field and for both or neither source", () => {
    const invalidOverrides: unknown[] = [
      undefined,
      "clip",
      [],
      { clipId: CLIP_KNOWN, generatorId: null },
      { ...CLIP_OVERRIDE, extra: true },
      { clipId: null, generatorId: null, generatorVariant: null },
      { clipId: CLIP_KNOWN, generatorId: "plasma", generatorVariant: null },
    ];
    for (const override of invalidOverrides) {
      expect(
        errorOf(
          applySetScreenOverride(
            freshState(),
            { screenId: SCREEN_ONLINE, override },
            CONTEXT,
          ),
        ),
      ).toBe("vj_override_invalid");
    }
  });

  it("answers vj_generator_invalid for an unknown generator", () => {
    expect(
      errorOf(
        applySetScreenOverride(
          freshState(),
          {
            screenId: SCREEN_ONLINE,
            override: {
              clipId: null,
              generatorId: "lava",
              generatorVariant: null,
            },
          },
          CONTEXT,
        ),
      ),
    ).toBe("vj_generator_invalid");
  });

  it("answers vj_generator_variant_invalid for a bad generator variant or a clip with a variant", () => {
    const badOverrides: unknown[] = [
      { clipId: null, generatorId: "prideFlagWave", generatorVariant: "plaid" },
      { clipId: null, generatorId: "prideFlagWave", generatorVariant: null },
      { clipId: null, generatorId: "plasma", generatorVariant: "rainbow" },
      { clipId: CLIP_KNOWN, generatorId: null, generatorVariant: "rainbow" },
    ];
    for (const override of badOverrides) {
      expect(
        errorOf(
          applySetScreenOverride(
            freshState(),
            { screenId: SCREEN_ONLINE, override },
            CONTEXT,
          ),
        ),
      ).toBe("vj_generator_variant_invalid");
    }
  });

  it("answers vj_clip_not_found for a malformed clip id", () => {
    expect(
      errorOf(
        applySetScreenOverride(
          freshState(),
          {
            screenId: SCREEN_ONLINE,
            override: { ...CLIP_OVERRIDE, clipId: "clip" },
            isImmediate: true,
          },
          CONTEXT,
        ),
      ),
    ).toBe("vj_clip_not_found");
  });

  it("answers vj_overrides_too_many for a 17th entry and still replaces an existing one", () => {
    const screenIds = Array.from(
      { length: VJ_LIMITS.screenOverridesMax + 1 },
      (_unused, index) => screenIdAt(index),
    );
    const screenOverrides = Object.fromEntries(
      screenIds
        .slice(0, VJ_LIMITS.screenOverridesMax)
        .map((screenId) => [screenId, CLIP_OVERRIDE]),
    );
    const state: VjStageState = { ...freshState(), screenOverrides };
    const context = contextWithScreens(screenIds);
    const lastScreenId = screenIds[VJ_LIMITS.screenOverridesMax] ?? "";
    expect(
      errorOf(
        applySetScreenOverride(
          state,
          { screenId: lastScreenId, override: CLIP_OVERRIDE },
          context,
        ),
      ),
    ).toBe("vj_overrides_too_many");
    const firstScreenId = screenIds[0] ?? "";
    const next = nextOf(
      applySetScreenOverride(
        state,
        {
          screenId: firstScreenId,
          override: { ...CLIP_OVERRIDE, clipId: CLIP_OTHER },
        },
        context,
      ),
    );
    expect(next.screenOverrides[firstScreenId]?.clipId).toBe(CLIP_OTHER);
  });

  it("answers isImmediate after the cap and before the clip read", () => {
    expect(
      errorOf(
        applySetScreenOverride(
          freshState(),
          {
            screenId: SCREEN_ONLINE,
            override: { ...CLIP_OVERRIDE, clipId: CLIP_MISSING },
            isImmediate: true,
          },
          CONTEXT,
        ),
      ),
    ).toBe("vj_immediate_not_allowed");
  });

  it("answers vj_clip_not_found for an unknown clip", () => {
    expect(
      errorOf(
        applySetScreenOverride(
          freshState(),
          {
            screenId: SCREEN_ONLINE,
            override: { ...CLIP_OVERRIDE, clipId: CLIP_MISSING },
          },
          CONTEXT,
        ),
      ),
    ).toBe("vj_clip_not_found");
  });
});

describe("stage:setScreenOverride changes", () => {
  it("stores a clip override lowercased under the lowercased screen id", () => {
    const next = nextOf(
      applySetScreenOverride(
        freshState(),
        {
          screenId: SCREEN_ONLINE.toUpperCase(),
          override: { ...CLIP_OVERRIDE, clipId: CLIP_KNOWN.toUpperCase() },
        },
        CONTEXT,
      ),
    );
    expect(next.screenOverrides).toEqual({ [SCREEN_ONLINE]: CLIP_OVERRIDE });
  });

  it("stores a generator override with its variant", () => {
    const override: VjScreenOverride = {
      clipId: null,
      generatorId: "prideFlagWave",
      generatorVariant: "rainbow",
    };
    const next = nextOf(
      applySetScreenOverride(
        freshState(),
        { screenId: SCREEN_ONLINE, override },
        CONTEXT,
      ),
    );
    expect(next.screenOverrides[SCREEN_ONLINE]).toEqual(override);
  });

  it("null removes the screen's entry", () => {
    const state: VjStageState = {
      ...freshState(),
      screenOverrides: { [SCREEN_ONLINE]: CLIP_OVERRIDE },
    };
    const next = nextOf(
      applySetScreenOverride(
        state,
        { screenId: SCREEN_ONLINE, override: null },
        CONTEXT,
      ),
    );
    expect(next.screenOverrides).toEqual({});
  });

  it("removing an override that is not there is a noop", () => {
    const result = applyVjStageCommand(
      freshState(),
      "stage:setScreenOverride",
      { screenId: SCREEN_ONLINE, override: null },
      CONTEXT,
    );
    expect("error" in result ? result.error : result.isNoop).toBe(true);
  });
});
