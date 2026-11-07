import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  vjBeatMs,
  vjLastDownbeatAt,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type {
  VjDemoCommandContext,
  VjDemoCommandOutcome,
  VjDemoLibraryLookup,
} from "./vjDemoCommandKit";
import { applyVjStageCommand } from "./vjDemoStageCommands";
import { applySetShuffle, applySetTempo } from "./vjDemoTempoCommands";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const PACK_ID = "11111111-1111-4111-8111-1111111111a1";
const CLIP_IN_PACK_LOW = "00000000-0000-4000-8000-0000000000c1";
const CLIP_IN_PACK_HIGH = "00000000-0000-4000-8000-0000000000c2";
const CLIP_OUTSIDE_PACK = "00000000-0000-4000-8000-0000000000ff";
const NOW = 500_000;

function demoLibrary(): VjDemoLibraryLookup {
  const clipIdsInPack = new Set([CLIP_IN_PACK_LOW, CLIP_IN_PACK_HIGH]);
  return {
    hasPack: (packId) => packId === PACK_ID,
    hasClip: () => true,
    isClipInPack: (_packId, clipId) => clipIdsInPack.has(clipId),
    readPackForStage: () => ({ eventId: null }),
    existingClipIds: (clipIds) => new Set(clipIds),
    clipIdsInPack: (_packId, clipIds) =>
      new Set(clipIds.filter((clipId) => clipIdsInPack.has(clipId))),
    readPackClipForAdvance: () => ({ isFavorite: false }),
    readSceneLook: () => null,
    readSetlistItem: () => null,
    setlistItemCount: () => null,
  };
}

function contextOf(isLeadMicOn = false): VjDemoCommandContext {
  return {
    now: NOW,
    library: demoLibrary(),
    connectedScreenIds: new Set<string>(),
    isLeadMicOn,
  };
}

/** A stage whose grid started 10 s before now at 120 bpm (one bar is 2000 ms). */
function freshState(): VjStageState {
  const state = createVjStageState(STAGE_EPOCH, 0);
  return {
    ...state,
    tempo: { ...state.tempo, bpm: 120, downbeatAt: NOW - 10_000 },
  };
}

function withActivePack(state: VjStageState = freshState()): VjStageState {
  return { ...state, activePackId: PACK_ID };
}

function errorOf(outcome: VjDemoCommandOutcome): string | null {
  return "error" in outcome ? outcome.error : null;
}

function nextOf(outcome: VjDemoCommandOutcome): VjStageState {
  if ("error" in outcome) throw new Error(`Refused with ${outcome.error}`);
  return outcome.next;
}

function tempo(
  record: Record<string, unknown>,
  options: { isLeadMicOn?: boolean; state?: VjStageState } = {},
): VjDemoCommandOutcome {
  return applySetTempo(
    options.state ?? freshState(),
    record,
    contextOf(options.isLeadMicOn),
  );
}

describe("applySetTempo codes in check order", () => {
  it("answers vj_patch_empty with none of the four fields", () => {
    expect(errorOf(tempo({}))).toBe("vj_patch_empty");
    expect(errorOf(tempo({ bpm: undefined }))).toBe("vj_patch_empty");
  });

  it("answers vj_bpm_out_of_range for a bpm outside 60..200 or not finite", () => {
    expect(errorOf(tempo({ bpm: 59.9 }))).toBe("vj_bpm_out_of_range");
    expect(errorOf(tempo({ bpm: 200.1 }))).toBe("vj_bpm_out_of_range");
    expect(errorOf(tempo({ bpm: "120" }))).toBe("vj_bpm_out_of_range");
    expect(errorOf(tempo({ bpm: Number.NaN }))).toBe("vj_bpm_out_of_range");
  });

  it("checks bpm before downbeatAt", () => {
    expect(errorOf(tempo({ bpm: 10, downbeatAt: "soon" }))).toBe(
      "vj_bpm_out_of_range",
    );
  });

  it("answers vj_downbeat_out_of_range for a downbeat 61 s away or not an integer", () => {
    expect(errorOf(tempo({ downbeatAt: NOW + 61_000 }))).toBe(
      "vj_downbeat_out_of_range",
    );
    expect(errorOf(tempo({ downbeatAt: NOW - 61_000 }))).toBe(
      "vj_downbeat_out_of_range",
    );
    expect(errorOf(tempo({ downbeatAt: NOW + 0.5 }))).toBe(
      "vj_downbeat_out_of_range",
    );
  });

  it("accepts a downbeat exactly 60 s away", () => {
    expect(errorOf(tempo({ downbeatAt: NOW + 60_000 }))).toBeNull();
    expect(errorOf(tempo({ downbeatAt: NOW - 60_000 }))).toBeNull();
  });

  it("answers vj_quantize_invalid before vj_tempo_source_invalid", () => {
    expect(errorOf(tempo({ quantize: "half" }))).toBe("vj_quantize_invalid");
    expect(errorOf(tempo({ quantize: "half", source: "midi" }))).toBe(
      "vj_quantize_invalid",
    );
    expect(errorOf(tempo({ source: "midi" }))).toBe("vj_tempo_source_invalid");
  });

  it("mic with a bpm answers vj_tempo_source_conflict", () => {
    expect(
      errorOf(tempo({ source: "mic", bpm: 128 }, { isLeadMicOn: true })),
    ).toBe("vj_tempo_source_conflict");
    expect(
      errorOf(tempo({ source: "mic", downbeatAt: NOW }, { isLeadMicOn: true })),
    ).toBe("vj_tempo_source_conflict");
  });

  it("mic while the lead mic is off answers vj_mic_unavailable", () => {
    expect(errorOf(tempo({ source: "mic" }))).toBe("vj_mic_unavailable");
    expect(errorOf(tempo({ source: "mic", bpm: 128 }))).toBe(
      "vj_tempo_source_conflict",
    );
  });

  it("isImmediate answers vj_immediate_not_allowed after the field rules", () => {
    const run = (payload: Record<string, unknown>) =>
      applyVjStageCommand(freshState(), "stage:setTempo", payload, contextOf());
    const refusalOf = (payload: Record<string, unknown>) => {
      const result = run(payload);
      return "error" in result ? result.error : null;
    };
    expect(refusalOf({ bpm: 128, isImmediate: true })).toBe(
      "vj_immediate_not_allowed",
    );
    expect(refusalOf({ bpm: 300, isImmediate: true })).toBe(
      "vj_bpm_out_of_range",
    );
    expect(refusalOf({ bpm: 128, isImmediate: "yes" })).toBe(
      "vj_effect_flag_invalid",
    );
    expect(refusalOf({ bpm: 128, isImmediate: false })).toBeNull();
  });
});

describe("applySetTempo results", () => {
  it("bpm alone keeps the bar position", () => {
    const state = freshState();
    const next = nextOf(tempo({ bpm: 128.04 }, { state }));
    expect(next.tempo.bpm).toBe(128);
    expect(next.tempo.downbeatAt).toBe(vjLastDownbeatAt(state.tempo, NOW));
    expect(next.tempo.downbeatAt).toBe(NOW);
    expect(next.tempo.source).toBe("manual");
  });

  it("re-anchors on the last 1 when now sits inside a bar", () => {
    const state = freshState();
    const insideBar = NOW + vjBeatMs(120) * 2;
    const next = nextOf(
      applySetTempo(state, { bpm: 90 }, { ...contextOf(), now: insideBar }),
    );
    expect(next.tempo.downbeatAt).toBe(NOW);
    expect(next.tempo.bpm).toBe(90);
  });

  it("rounds the bpm to one decimal", () => {
    expect(nextOf(tempo({ bpm: 127.96 })).tempo.bpm).toBe(128);
    expect(nextOf(tempo({ bpm: 99.94 })).tempo.bpm).toBe(99.9);
  });

  it("the 1 button sends downbeatAt and keeps bpm", () => {
    const next = nextOf(tempo({ downbeatAt: NOW + 123 }));
    expect(next.tempo.downbeatAt).toBe(NOW + 123);
    expect(next.tempo.bpm).toBe(120);
    expect(next.tempo.source).toBe("manual");
  });

  it("tap sets source tap", () => {
    const next = nextOf(
      tempo({ bpm: 126, downbeatAt: NOW - 40, source: "tap" }),
    );
    expect(next.tempo).toEqual({
      bpm: 126,
      downbeatAt: NOW - 40,
      quantize: "off",
      source: "tap",
    });
  });

  it("mic with the lead mic on sets source mic and keeps the grid", () => {
    const state = freshState();
    const next = nextOf(tempo({ source: "mic" }, { state, isLeadMicOn: true }));
    expect(next.tempo).toEqual({ ...state.tempo, source: "mic" });
  });

  it("a quantize toggle keeps the source and the grid", () => {
    const tapped = freshState();
    const state = {
      ...tapped,
      tempo: { ...tapped.tempo, source: "tap" as const },
    };
    const next = nextOf(tempo({ quantize: "bar" }, { state }));
    expect(next.tempo).toEqual({ ...state.tempo, quantize: "bar" });
  });

  it("a bpm without a source moves a mic tempo back to manual", () => {
    const base = freshState();
    const state = { ...base, tempo: { ...base.tempo, source: "mic" as const } };
    expect(nextOf(tempo({ bpm: 130 }, { state })).tempo.source).toBe("manual");
  });
});

function shuffle(
  record: Record<string, unknown>,
  state: VjStageState = freshState(),
): VjDemoCommandOutcome {
  return applySetShuffle(state, record, contextOf());
}

describe("applySetShuffle codes in check order", () => {
  it("answers vj_patch_empty with none of the fields", () => {
    expect(errorOf(shuffle({}))).toBe("vj_patch_empty");
    expect(errorOf(shuffle({ bpm: 128 }))).toBe("vj_patch_empty");
  });

  it("answers vj_effect_flag_invalid for a non-boolean isOn first", () => {
    expect(errorOf(shuffle({ isOn: "yes", intervalKind: "bars" }))).toBe(
      "vj_effect_flag_invalid",
    );
  });

  it("answers vj_shuffle_interval_invalid for a bad kind or value", () => {
    expect(errorOf(shuffle({ intervalKind: "bars" }))).toBe(
      "vj_shuffle_interval_invalid",
    );
    expect(errorOf(shuffle({ intervalValue: 61 }))).toBe(
      "vj_shuffle_interval_invalid",
    );
    expect(errorOf(shuffle({ intervalKind: "beats", intervalValue: 12 }))).toBe(
      "vj_shuffle_interval_invalid",
    );
  });

  it("answers vj_shuffle_source_invalid after the timing rules", () => {
    expect(errorOf(shuffle({ source: "recent" }))).toBe(
      "vj_shuffle_source_invalid",
    );
    expect(errorOf(shuffle({ intervalValue: 1, source: "recent" }))).toBe(
      "vj_shuffle_interval_invalid",
    );
  });

  it("answers vj_excluded_clips_invalid for a list that is not uuids or over 200", () => {
    const state = withActivePack();
    expect(errorOf(shuffle({ excludedClipIds: "all" }, state))).toBe(
      "vj_excluded_clips_invalid",
    );
    expect(errorOf(shuffle({ excludedClipIds: ["clip-one"] }, state))).toBe(
      "vj_excluded_clips_invalid",
    );
    const tooMany = Array.from({ length: 201 }, () => CLIP_IN_PACK_LOW);
    expect(errorOf(shuffle({ excludedClipIds: tooMany }, state))).toBe(
      "vj_excluded_clips_invalid",
    );
  });

  it("answers vj_no_active_pack for a non-empty list with no pack", () => {
    expect(errorOf(shuffle({ excludedClipIds: [CLIP_IN_PACK_LOW] }))).toBe(
      "vj_no_active_pack",
    );
  });

  it("answers vj_immediate_not_allowed before the pack lookup", () => {
    const outcome = shuffle(
      { excludedClipIds: [CLIP_OUTSIDE_PACK], isImmediate: true },
      withActivePack(),
    );
    expect(errorOf(outcome)).toBe("vj_immediate_not_allowed");
  });

  it("skipped clips outside the pack are refused and inside are sorted", () => {
    const state = withActivePack();
    expect(
      errorOf(
        shuffle(
          { excludedClipIds: [CLIP_IN_PACK_LOW, CLIP_OUTSIDE_PACK] },
          state,
        ),
      ),
    ).toBe("vj_clip_not_in_pack");
    const next = nextOf(
      shuffle(
        {
          excludedClipIds: [
            CLIP_IN_PACK_HIGH.toUpperCase(),
            CLIP_IN_PACK_LOW,
            CLIP_IN_PACK_HIGH,
          ],
        },
        state,
      ),
    );
    expect(next.shuffle.excludedClipIds).toEqual([
      CLIP_IN_PACK_LOW,
      CLIP_IN_PACK_HIGH,
    ]);
  });
});

describe("applySetShuffle results", () => {
  it("an empty list clears the skipped clips, with or without a pack", () => {
    const base = withActivePack();
    const state = {
      ...base,
      shuffle: { ...base.shuffle, excludedClipIds: [CLIP_IN_PACK_LOW] },
    };
    expect(
      nextOf(shuffle({ excludedClipIds: [] }, state)).shuffle.excludedClipIds,
    ).toEqual([]);
    const packless = { ...state, activePackId: null };
    expect(errorOf(shuffle({ excludedClipIds: [] }, packless))).toBeNull();
  });

  it("a kind change keeps a value that fits and else takes 8", () => {
    const base = freshState();
    const fitting = {
      ...base,
      shuffle: { ...base.shuffle, intervalValue: 16 },
    };
    expect(
      nextOf(shuffle({ intervalKind: "beats" }, fitting)).shuffle.intervalValue,
    ).toBe(16);
    const misfit = { ...base, shuffle: { ...base.shuffle, intervalValue: 12 } };
    expect(
      nextOf(shuffle({ intervalKind: "beats" }, misfit)).shuffle.intervalValue,
    ).toBe(8);
  });

  it("sets isOn and source", () => {
    const next = nextOf(shuffle({ isOn: true, source: "favorites" }));
    expect(next.shuffle.isOn).toBe(true);
    expect(next.shuffle.source).toBe("favorites");
  });

  it("a bpm field on setShuffle is ignored", () => {
    const next = nextOf(shuffle({ isOn: true, bpm: 140 }));
    expect(next.shuffle).not.toHaveProperty("bpm");
    expect(next.tempo.bpm).toBe(120);
  });
});
