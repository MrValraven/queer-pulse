import { describe, expect, it } from "vitest";
import {
  VJ_REMOTE_COMMAND_NAMES,
  createVjStageState,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjCommandFrameName } from "../realtime/vjFrames";
import type {
  VjDemoCommandContext,
  VjDemoLibraryLookup,
} from "./vjDemoCommandKit";
import {
  VJ_DEMO_COMMAND_RULES,
  applyVjStageCommand,
  isVjDemoLookSwitch,
  readVjImmediateFlag,
  type VjStageCommandResult,
} from "./vjDemoStageCommands";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const PACK_LINKED = "11111111-1111-4111-8111-1111111111a1";
const PACK_UNLINKED = "11111111-1111-4111-8111-1111111111a2";
const PACK_MISSING = "11111111-1111-4111-8111-1111111111a9";
const EVENT_ID = "44444444-4444-4444-8444-444444444444";
const CLIP_IDS = Array.from(
  { length: 10 },
  (_unused, index) => `00000000-0000-4000-8000-0000000000c${index}`,
);
/** The demo clip id at the index. */
function clipAt(index: number): string {
  const clipId = CLIP_IDS[index];
  if (clipId === undefined) throw new Error(`No demo clip at ${index}`);
  return clipId;
}
const CLIP_MISSING = "00000000-0000-4000-8000-0000000000ff";
const NOW = 50_000;

const PACKS = new Map<string, { eventId: string | null }>([
  [PACK_LINKED, { eventId: EVENT_ID }],
  [PACK_UNLINKED, { eventId: null }],
]);

function demoLibrary(): VjDemoLibraryLookup {
  const clipIds = new Set(CLIP_IDS);
  return {
    hasPack: (packId) => PACKS.has(packId),
    hasClip: (clipId) => clipIds.has(clipId),
    isClipInPack: (_packId, clipId) => clipIds.has(clipId),
    readPackForStage: (packId) => PACKS.get(packId) ?? null,
    existingClipIds: (ids) => new Set(ids.filter((id) => clipIds.has(id))),
    clipIdsInPack: (_packId, ids) =>
      new Set(ids.filter((id) => clipIds.has(id))),
    readPackClipForAdvance: () => ({ isFavorite: false }),
    readSceneLook: () => null,
    readSetlistItem: () => null,
    setlistItemCount: () => null,
  };
}

const CONTEXT: VjDemoCommandContext = {
  now: NOW,
  library: demoLibrary(),
  connectedScreenIds: new Set<string>(),
  isLeadMicOn: false,
};

function freshState(): VjStageState {
  return { ...createVjStageState(STAGE_EPOCH, 0), revision: 3 };
}

function run(
  name: VjCommandFrameName,
  payload: Record<string, unknown>,
  state: VjStageState = freshState(),
): VjStageCommandResult {
  return applyVjStageCommand(state, name, payload, CONTEXT);
}

function errorOf(result: VjStageCommandResult): string | null {
  return "error" in result ? result.error : null;
}

function applied(result: VjStageCommandResult) {
  if ("error" in result) {
    throw new Error(`Expected a change, got ${result.error}`);
  }
  return result;
}

describe("stage:setPack", () => {
  it("answers vj_pack_not_found for a malformed id before isImmediate", () => {
    expect(
      errorOf(run("stage:setPack", { packId: "pack", isImmediate: true })),
    ).toBe("vj_pack_not_found");
    expect(errorOf(run("stage:setPack", {}))).toBe("vj_pack_not_found");
  });

  it("answers isImmediate before the pack read", () => {
    expect(
      errorOf(
        run("stage:setPack", { packId: PACK_MISSING, isImmediate: true }),
      ),
    ).toBe("vj_immediate_not_allowed");
  });

  it("answers vj_pack_not_found for an unknown pack", () => {
    expect(errorOf(run("stage:setPack", { packId: PACK_MISSING }))).toBe(
      "vj_pack_not_found",
    );
  });

  it("a pack change clears skipped clips and hides the card when the pack links no event", () => {
    const state: VjStageState = {
      ...freshState(),
      activePackId: PACK_LINKED,
      eventCard: { isVisible: true, kind: "qr" },
      shuffle: { ...freshState().shuffle, excludedClipIds: [clipAt(0)] },
    };
    const result = applied(
      run("stage:setPack", { packId: PACK_UNLINKED.toUpperCase() }, state),
    );
    expect(result.state.activePackId).toBe(PACK_UNLINKED);
    expect(result.state.shuffle.excludedClipIds).toEqual([]);
    expect(result.state.eventCard.isVisible).toBe(false);
    expect(result.state.clipSequence).toBe(state.clipSequence + 1);
  });

  it("keeps the card when the new pack links an event", () => {
    const state: VjStageState = {
      ...freshState(),
      activePackId: PACK_UNLINKED,
      eventCard: { isVisible: true, kind: "nextEvent" },
    };
    const result = applied(
      run("stage:setPack", { packId: PACK_LINKED }, state),
    );
    expect(result.state.eventCard).toEqual({
      isVisible: true,
      kind: "nextEvent",
    });
  });

  it("hides the card when the pack is cleared", () => {
    const state: VjStageState = {
      ...freshState(),
      activePackId: PACK_LINKED,
      eventCard: { isVisible: true, kind: "qr" },
    };
    const result = applied(run("stage:setPack", { packId: null }, state));
    expect(result.state.activePackId).toBeNull();
    expect(result.state.eventCard.isVisible).toBe(false);
  });

  it("the same pack again is a noop", () => {
    const state: VjStageState = { ...freshState(), activePackId: PACK_LINKED };
    const result = applied(
      run("stage:setPack", { packId: PACK_LINKED }, state),
    );
    expect(result.isNoop).toBe(true);
    expect(result.state).toBe(state);
  });
});

describe("stage:goClip", () => {
  it("answers vj_clip_not_found for a malformed or unknown clip", () => {
    expect(errorOf(run("stage:goClip", { clipId: 7 }))).toBe(
      "vj_clip_not_found",
    );
    expect(errorOf(run("stage:goClip", { clipId: CLIP_MISSING }))).toBe(
      "vj_clip_not_found",
    );
  });

  it("isImmediate on goClip answers vj_immediate_not_allowed", () => {
    expect(
      errorOf(run("stage:goClip", { clipId: clipAt(0), isImmediate: true })),
    ).toBe("vj_immediate_not_allowed");
    expect(
      errorOf(run("stage:goClip", { clipId: CLIP_MISSING, isImmediate: true })),
    ).toBe("vj_immediate_not_allowed");
  });

  it("isImmediate as a string answers vj_effect_flag_invalid", () => {
    expect(
      errorOf(run("stage:goClip", { clipId: clipAt(0), isImmediate: "true" })),
    ).toBe("vj_effect_flag_invalid");
  });

  it("accepts isImmediate false", () => {
    const result = applied(
      run("stage:goClip", { clipId: clipAt(0), isImmediate: false }),
    );
    expect(result.isImmediate).toBe(false);
    expect(result.state.liveClipId).toBe(clipAt(0));
  });

  it("goClip clears a live generator and fronts recentClipIds at most 8", () => {
    const state: VjStageState = {
      ...freshState(),
      liveGeneratorId: "prideFlagWave",
      liveGeneratorVariant: "trans",
      recentClipIds: CLIP_IDS.slice(1, 9),
    };
    const result = applied(
      run("stage:goClip", { clipId: clipAt(5).toUpperCase() }, state),
    );
    expect(result.state.liveClipId).toBe(clipAt(5));
    expect(result.state.liveGeneratorId).toBeNull();
    expect(result.state.liveGeneratorVariant).toBeNull();
    expect(result.state.recentClipIds).toHaveLength(8);
    expect(result.state.recentClipIds[0]).toBe(clipAt(5));
    expect(
      result.state.recentClipIds.filter((clipId) => clipId === clipAt(5)),
    ).toHaveLength(1);
    expect(result.stamps.isLiveSourceSet).toBe(true);
  });

  it("a re-tap of the live clip still changes the stage", () => {
    const state: VjStageState = { ...freshState(), liveClipId: clipAt(0) };
    const result = applied(run("stage:goClip", { clipId: clipAt(0) }, state));
    expect(result.isNoop).toBe(false);
    expect(result.state.clipSequence).toBe(state.clipSequence + 1);
  });

  it("null goes to black", () => {
    const state: VjStageState = { ...freshState(), liveClipId: clipAt(0) };
    const result = applied(run("stage:goClip", { clipId: null }, state));
    expect(result.state.liveClipId).toBeNull();
    expect(result.state.recentClipIds).toEqual(state.recentClipIds);
  });
});

describe("stage:goGenerator", () => {
  it("answers vj_generator_invalid for an unknown or absent generator", () => {
    expect(errorOf(run("stage:goGenerator", { generatorId: "lava" }))).toBe(
      "vj_generator_invalid",
    );
    expect(errorOf(run("stage:goGenerator", {}))).toBe("vj_generator_invalid");
  });

  it("answers vj_generator_variant_invalid for a variant the generator lacks", () => {
    expect(
      errorOf(
        run("stage:goGenerator", {
          generatorId: "prideFlagWave",
          variant: "plaid",
        }),
      ),
    ).toBe("vj_generator_variant_invalid");
    expect(
      errorOf(
        run("stage:goGenerator", { generatorId: "plasma", variant: "rainbow" }),
      ),
    ).toBe("vj_generator_variant_invalid");
    expect(
      errorOf(
        run("stage:goGenerator", { generatorId: null, variant: "rainbow" }),
      ),
    ).toBe("vj_generator_variant_invalid");
  });

  it("an absent variant takes the catalog default", () => {
    const result = applied(
      run("stage:goGenerator", { generatorId: "prideFlagWave" }),
    );
    expect(result.state.liveGeneratorId).toBe("prideFlagWave");
    expect(result.state.liveGeneratorVariant).toBe("rainbow");
  });

  it("a generator clears the live clip", () => {
    const state: VjStageState = { ...freshState(), liveClipId: clipAt(0) };
    const result = applied(
      run("stage:goGenerator", { generatorId: "plasma" }, state),
    );
    expect(result.state.liveClipId).toBeNull();
    expect(result.state.liveGeneratorId).toBe("plasma");
    expect(result.state.liveGeneratorVariant).toBeNull();
    expect(result.stamps.isLiveSourceSet).toBe(true);
  });

  it("goGenerator twice with the same variant still bumps clipSequence", () => {
    const payload = { generatorId: "prideFlagWave", variant: "trans" };
    const first = applied(run("stage:goGenerator", payload));
    const second = applied(run("stage:goGenerator", payload, first.state));
    expect(second.isNoop).toBe(false);
    expect(second.state.clipSequence).toBe(first.state.clipSequence + 1);
  });

  it("null goes to black and clears both sources", () => {
    const state: VjStageState = {
      ...freshState(),
      liveGeneratorId: "prideFlagWave",
      liveGeneratorVariant: "bi",
    };
    const result = applied(
      run("stage:goGenerator", { generatorId: null, variant: null }, state),
    );
    expect(result.state.liveGeneratorId).toBeNull();
    expect(result.state.liveGeneratorVariant).toBeNull();
    expect(result.state.liveClipId).toBeNull();
  });
});

describe("stage:setTransition", () => {
  it("answers each code in check order", () => {
    expect(errorOf(run("stage:setTransition", {}))).toBe("vj_patch_empty");
    expect(
      errorOf(
        run("stage:setTransition", { mode: "spin", length: { unit: "x" } }),
      ),
    ).toBe("vj_transition_mode_invalid");
    expect(errorOf(run("stage:setTransition", { length: 800 }))).toBe(
      "vj_transition_length_invalid",
    );
    expect(
      errorOf(
        run("stage:setTransition", {
          length: { unit: "ms", value: 800, extra: 1 },
        }),
      ),
    ).toBe("vj_transition_length_invalid");
    expect(
      errorOf(
        run("stage:setTransition", { length: { unit: "bars", value: 1 } }),
      ),
    ).toBe("vj_transition_length_invalid");
    expect(
      errorOf(
        run("stage:setTransition", { length: { unit: "ms", value: 4001 } }),
      ),
    ).toBe("vj_fade_out_of_range");
    expect(
      errorOf(
        run("stage:setTransition", { length: { unit: "beats", value: 3 } }),
      ),
    ).toBe("vj_transition_length_invalid");
  });

  it("sets the mode and a beat length", () => {
    const result = applied(
      run("stage:setTransition", {
        mode: "iris",
        length: { unit: "beats", value: 4 },
      }),
    );
    expect(result.state.transition).toEqual({
      mode: "iris",
      length: { unit: "beats", value: 4 },
    });
  });
});

describe("stage:setOverlay", () => {
  it("answers each code in check order", () => {
    expect(errorOf(run("stage:setOverlay", {}))).toBe("vj_patch_empty");
    expect(errorOf(run("stage:setOverlay", { text: 4, style: "x" }))).toBe(
      "vj_overlay_text_invalid",
    );
    expect(errorOf(run("stage:setOverlay", { text: "a".repeat(81) }))).toBe(
      "vj_overlay_text_too_long",
    );
    expect(errorOf(run("stage:setOverlay", { style: "x", size: "x" }))).toBe(
      "vj_overlay_style_invalid",
    );
    expect(
      errorOf(run("stage:setOverlay", { position: "left", size: "x" })),
    ).toBe("vj_overlay_position_invalid");
    expect(errorOf(run("stage:setOverlay", { size: "xxl" }))).toBe(
      "vj_overlay_size_invalid",
    );
    expect(errorOf(run("stage:setOverlay", { colorToken: "teal" }))).toBe(
      "vj_color_token_invalid",
    );
    expect(
      errorOf(run("stage:setOverlay", { isVisible: "yes", hideAfterMs: 1 })),
    ).toBe("vj_effect_flag_invalid");
    expect(errorOf(run("stage:setOverlay", { hideAfterMs: 999 }))).toBe(
      "vj_overlay_hide_out_of_range",
    );
    expect(errorOf(run("stage:setOverlay", { hideAfterMs: 1500.5 }))).toBe(
      "vj_overlay_hide_out_of_range",
    );
    expect(
      errorOf(run("stage:setOverlay", { isVisible: true, isImmediate: true })),
    ).toBe("vj_overlay_text_blank");
  });

  it("answers isImmediate after the field rules", () => {
    expect(
      errorOf(run("stage:setOverlay", { text: "Hello", isImmediate: true })),
    ).toBe("vj_immediate_not_allowed");
  });

  it("overlay auto-hide stamps from hideAfterMs, null clears it, absent keeps it", () => {
    const shown = applied(
      run("stage:setOverlay", {
        text: "  Welcome  ",
        isVisible: true,
        hideAfterMs: 5000,
      }),
    );
    expect(shown.state.overlay.text).toBe("Welcome");
    expect(shown.stamps.overlayHideAfterMs).toBe(5000);
    const visible: VjStageState = {
      ...shown.state,
      overlay: { ...shown.state.overlay, hideAt: NOW + 5000 },
    };
    const kept = applied(run("stage:setOverlay", { style: "neon" }, visible));
    expect(kept.stamps.overlayHideAfterMs).toBeUndefined();
    expect(kept.state.overlay.hideAt).toBe(NOW + 5000);
    const cleared = applied(
      run("stage:setOverlay", { hideAfterMs: null }, visible),
    );
    expect(cleared.isNoop).toBe(false);
    expect(cleared.stamps.overlayHideAfterMs).toBeNull();
    expect(cleared.state.overlay.hideAt).toBeNull();
  });

  it("a hidden result clears hideAt", () => {
    const state: VjStageState = {
      ...freshState(),
      overlay: {
        ...freshState().overlay,
        text: "Hello",
        isVisible: true,
        hideAt: NOW + 2000,
      },
    };
    const result = applied(
      run("stage:setOverlay", { isVisible: false, hideAfterMs: 3000 }, state),
    );
    expect(result.state.overlay.hideAt).toBeNull();
    expect(result.stamps.overlayHideAfterMs).toBeNull();
  });

  it("an unchanged overlay patch is a noop", () => {
    const state = freshState();
    const result = applied(
      run("stage:setOverlay", { style: state.overlay.style }, state),
    );
    expect(result.isNoop).toBe(true);
    expect(result.state).toBe(state);
  });

  it("a hideAfterMs number on a visible overlay always changes the stage", () => {
    const state: VjStageState = {
      ...freshState(),
      overlay: { ...freshState().overlay, text: "Hi", isVisible: true },
    };
    const result = applied(
      run("stage:setOverlay", { hideAfterMs: 2000 }, state),
    );
    expect(result.isNoop).toBe(false);
    expect(result.stamps.overlayHideAfterMs).toBe(2000);
  });
});

describe("stage:setStrobe", () => {
  it("answers vj_effect_flag_invalid for a non-boolean before isImmediate", () => {
    expect(
      errorOf(run("stage:setStrobe", { isStrobing: "on", isImmediate: 1 })),
    ).toBe("vj_effect_flag_invalid");
  });

  it("turning it on marks the strobe start", () => {
    const result = applied(run("stage:setStrobe", { isStrobing: true }));
    expect(result.state.effects.isStrobing).toBe(true);
    expect(result.stamps.isStrobeStarted).toBe(true);
  });

  it("on while on is a noop that keeps the first start", () => {
    const state: VjStageState = {
      ...freshState(),
      effects: {
        ...freshState().effects,
        isStrobing: true,
        strobeStartedAt: NOW - 3000,
      },
    };
    const result = applied(run("stage:setStrobe", { isStrobing: true }, state));
    expect(result.isNoop).toBe(true);
    expect(result.state.effects.strobeStartedAt).toBe(NOW - 3000);
  });

  it("stops at once with isImmediate and refuses it when starting", () => {
    const state: VjStageState = {
      ...freshState(),
      effects: { ...freshState().effects, isStrobing: true },
    };
    const stopped = applied(
      run("stage:setStrobe", { isStrobing: false, isImmediate: true }, state),
    );
    expect(stopped.isImmediate).toBe(true);
    expect(stopped.state.effects.isStrobing).toBe(false);
    expect(
      errorOf(run("stage:setStrobe", { isStrobing: true, isImmediate: true })),
    ).toBe("vj_immediate_not_allowed");
  });
});

describe("readVjImmediateFlag", () => {
  it("reads an absent flag as false", () => {
    expect(readVjImmediateFlag("stage:goClip", {})).toEqual({
      isImmediate: false,
    });
  });

  it("answers vj_effect_flag_invalid for a non-boolean", () => {
    expect(
      readVjImmediateFlag("stage:resetLook", { isImmediate: null }),
    ).toEqual({ error: "vj_effect_flag_invalid" });
  });

  it("allows true on blackout alone, a strobe stop and reset look", () => {
    expect(
      readVjImmediateFlag("stage:setEffects", {
        isBlackout: true,
        isImmediate: true,
      }),
    ).toEqual({ isImmediate: true });
    expect(
      readVjImmediateFlag("stage:setStrobe", {
        isStrobing: false,
        isImmediate: true,
      }),
    ).toEqual({ isImmediate: true });
    expect(
      readVjImmediateFlag("stage:resetLook", { isImmediate: true }),
    ).toEqual({ isImmediate: true });
  });

  it("refuses true on blackout with a speed or settings, and on every other command", () => {
    expect(
      readVjImmediateFlag("stage:setEffects", {
        isBlackout: true,
        speed: 2,
        isImmediate: true,
      }),
    ).toEqual({ error: "vj_immediate_not_allowed" });
    expect(
      readVjImmediateFlag("stage:setEffects", {
        isBlackout: false,
        settings: {},
        isImmediate: true,
      }),
    ).toEqual({ error: "vj_immediate_not_allowed" });
    expect(
      readVjImmediateFlag("stage:setEffects", {
        speed: 2,
        isImmediate: true,
      }),
    ).toEqual({ error: "vj_immediate_not_allowed" });
    expect(
      readVjImmediateFlag("stage:recallScene", { isImmediate: true }),
    ).toEqual({ error: "vj_immediate_not_allowed" });
  });

  it("accepts false on every command", () => {
    for (const name of VJ_REMOTE_COMMAND_NAMES) {
      expect(readVjImmediateFlag(name, { isImmediate: false })).toEqual({
        isImmediate: false,
      });
    }
  });
});

describe("the dispatcher", () => {
  it("maps every remote command name to a rule", () => {
    expect(Object.keys(VJ_DEMO_COMMAND_RULES).sort()).toEqual(
      [...VJ_REMOTE_COMMAND_NAMES].sort(),
    );
  });

  it("marks recalls, set list steps and a select with an index as look switches", () => {
    expect(isVjDemoLookSwitch("stage:recallScene", {})).toBe(true);
    expect(isVjDemoLookSwitch("stage:setlistNext", {})).toBe(true);
    expect(isVjDemoLookSwitch("stage:setlistPrevious", {})).toBe(true);
    expect(isVjDemoLookSwitch("stage:setlistSelect", { index: 0 })).toBe(true);
    expect(isVjDemoLookSwitch("stage:setlistSelect", { index: null })).toBe(
      false,
    );
    expect(isVjDemoLookSwitch("stage:goClip", {})).toBe(false);
  });

  it("returns the change unsettled", () => {
    const state = freshState();
    const result = applied(run("stage:goClip", { clipId: clipAt(1) }, state));
    expect(result.state.revision).toBe(state.revision);
    expect(result.state.updatedAt).toBe(state.updatedAt);
    expect(result.state.liveSince).toBe(state.liveSince);
    expect(result.isLookSwitch).toBe(false);
  });

  it("reads a non-object payload as an empty patch", () => {
    expect(
      errorOf(
        applyVjStageCommand(freshState(), "stage:setOverlay", "text", CONTEXT),
      ),
    ).toBe("vj_patch_empty");
  });
});
