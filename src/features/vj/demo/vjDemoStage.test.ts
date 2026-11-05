import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjStageFrame,
  type VjStageRestore,
} from "../../../shared/contracts/vj";
import {
  createVjDemoStage,
  reduceVjDemoStage,
  type VjDemoStage,
  type VjDemoStageEvent,
} from "./vjDemoStage";
import { restoreVjStage } from "./vjDemoStageCommands";
import type { VjDemoLibraryLookup } from "./vjDemoStore";

const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const PACK_PEAK = "00000000-0000-4000-8000-0000000000a2";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIP_DOTS = "00000000-0000-4000-8000-0000000000c3";
const UNKNOWN_ID = "00000000-0000-4000-8000-0000000000f9";
const CLIENT_ID = "11111111-1111-4111-8111-111111111111";
const SCREEN_A = "22222222-2222-4222-8222-22222222222a";
const SCREEN_B = "22222222-2222-4222-8222-22222222222b";
const SCREEN_C = "22222222-2222-4222-8222-22222222222c";
const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";

const PACK_CLIPS: Record<string, string[]> = {
  [PACK_WARM]: [CLIP_GRID, CLIP_HAZE],
  [PACK_PEAK]: [CLIP_DOTS],
};

const library: VjDemoLibraryLookup = {
  hasPack: (packId) => packId in PACK_CLIPS,
  hasClip: (clipId) => [CLIP_GRID, CLIP_HAZE, CLIP_DOTS].includes(clipId),
  isClipInPack: (packId, clipId) => (PACK_CLIPS[packId] ?? []).includes(clipId),
};

function run(stage: VjDemoStage, event: VjDemoStageEvent, now = 1_000) {
  return reduceVjDemoStage(stage, event, { now, library });
}

function attachRemote(stage: VjDemoStage, tabId = "remote-tab") {
  return run(stage, { kind: "attach", tabId, payload: { role: "remote" } })
    .stage;
}

function attachScreen(
  stage: VjDemoStage,
  tabId: string,
  screenId: string,
  options: { now?: number; restoreState?: VjStageRestore | null } = {},
) {
  return run(
    stage,
    {
      kind: "attach",
      tabId,
      payload: {
        role: "screen",
        screenId,
        restoreState: options.restoreState ?? null,
      },
    },
    options.now ?? 1_000,
  );
}

function command(
  stage: VjDemoStage,
  name: string,
  payload: Record<string, unknown>,
  commandSequence: number,
  now = 1_000,
) {
  return run(
    stage,
    {
      kind: "frame",
      tabId: "remote-tab",
      name,
      payload: { ...payload, clientId: CLIENT_ID, commandSequence },
    },
    now,
  );
}

function advance(
  stage: VjDemoStage,
  tabId: string,
  expectedClipSequence: number,
  clipId: string,
) {
  return run(stage, {
    kind: "frame",
    tabId,
    name: "screen:advance",
    payload: { expectedClipSequence, clipId },
  });
}

function restoreOf(overrides: Partial<VjStageRestore>): VjStageRestore {
  const saved = createVjStageState("44444444-4444-4444-8444-444444444444", 0);
  return { ...saved, revision: 5, ...overrides };
}

function freshStage(): VjDemoStage {
  return createVjDemoStage(STAGE_EPOCH, 0);
}

describe("reduceVjDemoStage commands", () => {
  it("drops a stale command and hands back the state", () => {
    const stage = attachRemote(freshStage());
    const first = command(stage, "stage:goClip", { clipId: CLIP_GRID }, 2);
    expect(first.ack).toEqual({ ok: true, revision: 1, isNoop: false });
    const second = command(
      first.stage,
      "stage:goClip",
      { clipId: CLIP_GRID },
      2,
    );
    expect(second.ack).toMatchObject({
      ok: false,
      code: "vj_stale_command",
      state: { revision: 1 },
    });
    expect(second.outgoing).toEqual([]);
    expect(second.stage.state.revision).toBe(1);
  });

  it("bumps clipSequence on a re-tap and keeps the revision rule", () => {
    const stage = attachRemote(freshStage());
    const first = command(stage, "stage:goClip", { clipId: CLIP_GRID }, 1);
    const second = command(
      first.stage,
      "stage:goClip",
      { clipId: CLIP_GRID },
      2,
    );
    expect(second.stage.state.clipSequence).toBe(2);
    expect(second.stage.state.revision).toBe(2);
    expect(second.ack).toEqual({ ok: true, revision: 2, isNoop: false });
    expect(second.outgoing).toEqual([
      {
        name: "stage:state",
        payload: {
          state: second.stage.state,
          cause: "command",
          sourceClientId: CLIENT_ID,
        },
        targetTabId: null,
        targetRole: null,
      },
    ]);
  });

  it("acks a noop without broadcasting", () => {
    const stage = attachRemote(freshStage());
    const first = command(stage, "stage:setPack", { packId: PACK_WARM }, 1);
    const second = command(
      first.stage,
      "stage:setPack",
      { packId: PACK_WARM },
      2,
    );
    expect(second.ack).toEqual({ ok: true, revision: 1, isNoop: true });
    expect(second.outgoing).toEqual([]);
    expect(second.stage.state).toBe(first.stage.state);
  });

  it("refuses overlay text with a line break", () => {
    const stage = attachRemote(freshStage());
    const lineBreak = command(stage, "stage:setOverlay", { text: "a\nb" }, 1);
    expect(lineBreak.ack).toMatchObject({
      ok: false,
      code: "vj_overlay_text_invalid",
    });
    const separator = String.fromCodePoint(0x2028);
    const lineSeparator = command(
      stage,
      "stage:setOverlay",
      { text: `a${separator}b` },
      2,
    );
    expect(lineSeparator.ack).toMatchObject({
      code: "vj_overlay_text_invalid",
    });
    const tooLong = command(
      stage,
      "stage:setOverlay",
      { text: "x".repeat(81) },
      3,
    );
    expect(tooLong.ack).toMatchObject({ code: "vj_overlay_text_too_long" });
    const wideCharacters = String.fromCodePoint(0x1f308).repeat(80);
    const fits = command(
      stage,
      "stage:setOverlay",
      { text: wideCharacters },
      4,
    );
    expect(fits.ack).toMatchObject({ ok: true, isNoop: false });
    const blank = command(
      stage,
      "stage:setOverlay",
      { text: "   ", isVisible: true },
      5,
    );
    expect(blank.ack).toMatchObject({ code: "vj_overlay_text_blank" });
  });

  it("defaults the interval when the kind changes", () => {
    let stage = attachRemote(freshStage());
    stage = command(stage, "stage:setShuffle", { intervalValue: 30 }, 1).stage;
    expect(stage.state.shuffle.intervalValue).toBe(30);
    stage = command(
      stage,
      "stage:setShuffle",
      { intervalKind: "beats" },
      2,
    ).stage;
    expect(stage.state.shuffle).toMatchObject({
      intervalKind: "beats",
      intervalValue: 8,
    });
    stage = command(stage, "stage:setShuffle", { bpm: 123.456 }, 3).stage;
    expect(stage.state.shuffle.bpm).toBe(123.5);
    const outOfRange = command(stage, "stage:setShuffle", { bpm: 59 }, 4);
    expect(outOfRange.ack).toMatchObject({
      ok: false,
      code: "vj_bpm_out_of_range",
    });
    const badBeats = command(
      stage,
      "stage:setShuffle",
      { intervalValue: 5 },
      5,
    );
    expect(badBeats.ack).toMatchObject({ code: "vj_shuffle_interval_invalid" });
  });
});

describe("reduceVjDemoStage screens and library", () => {
  it("adopts a screen's restore state only at revision 0", () => {
    const restoreState = restoreOf({
      liveClipId: CLIP_GRID,
      effects: {
        ...createVjStageState(STAGE_EPOCH, 0).effects,
        isStrobing: true,
        strobeStartedAt: 500,
      },
    });
    const first = attachScreen(freshStage(), "tab-a", SCREEN_A, {
      restoreState,
    });
    expect(first.ack).toMatchObject({
      ok: true,
      isRestored: true,
      isLead: true,
    });
    expect(first.stage.state).toMatchObject({
      stageEpoch: STAGE_EPOCH,
      revision: 1,
      clipSequence: 1,
      liveClipId: CLIP_GRID,
      effects: { isStrobing: false, strobeStartedAt: null },
    });
    const firstFrame = first.outgoing[0];
    expect(firstFrame).toMatchObject({
      name: "stage:state",
      targetTabId: null,
    });
    expect((firstFrame?.payload as VjStageFrame).cause).toBe("restore");

    const second = attachScreen(first.stage, "tab-b", SCREEN_B, {
      restoreState: restoreOf({ liveClipId: CLIP_HAZE }),
    });
    expect(second.ack).toMatchObject({
      ok: true,
      isRestored: false,
      isLead: false,
    });
    expect(second.stage.state).toBe(first.stage.state);
    expect(second.outgoing[0]).toMatchObject({
      name: "stage:state",
      targetTabId: "tab-b",
      payload: { cause: "attach" },
    });
  });

  it("drops a restored pack or clip that no longer exists", () => {
    const fresh = createVjStageState(STAGE_EPOCH, 0);
    const restored = restoreVjStage(
      fresh,
      restoreOf({ activePackId: UNKNOWN_ID, liveClipId: UNKNOWN_ID }),
      library,
    );
    expect(restored.activePackId).toBeNull();
    expect(restored.liveClipId).toBeNull();
    const kept = restoreVjStage(
      fresh,
      restoreOf({ activePackId: PACK_PEAK, liveClipId: CLIP_DOTS }),
      library,
    );
    expect(kept).toMatchObject({
      activePackId: PACK_PEAK,
      liveClipId: CLIP_DOTS,
    });
  });

  it("promotes the longest-connected screen when the lead leaves", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, { now: 1 }).stage;
    stage = attachScreen(stage, "tab-b", SCREEN_B, { now: 2 }).stage;
    stage = attachScreen(stage, "tab-c", SCREEN_C, { now: 3 }).stage;
    stage = attachRemote(stage);
    const result = run(stage, { kind: "detach", tabId: "tab-a" }, 4);
    expect(result.outgoing).toContainEqual({
      name: "screen:role",
      payload: { isLead: true },
      targetTabId: "tab-b",
      targetRole: null,
    });
    const update = result.outgoing.find(
      (frame) => frame.name === "screens:update",
    );
    expect(update?.targetRole).toBe("remote");
    expect(update?.payload).toMatchObject({
      screens: [
        { screenId: SCREEN_A, number: 1, isConnected: false, isLead: false },
        { screenId: SCREEN_B, number: 2, isConnected: true, isLead: true },
        { screenId: SCREEN_C, number: 3, isConnected: true, isLead: false },
      ],
    });
  });

  it("lets only the lead advance and checks the clip sequence", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, { now: 1 }).stage;
    stage = attachScreen(stage, "tab-b", SCREEN_B, { now: 2 }).stage;
    stage = attachRemote(stage);
    expect(advance(stage, "tab-a", 0, CLIP_GRID).ack).toMatchObject({
      code: "vj_shuffle_off",
      state: { revision: 0 },
    });
    stage = command(stage, "stage:setShuffle", { isOn: true }, 1).stage;
    expect(advance(stage, "tab-a", 0, CLIP_GRID).ack).toMatchObject({
      code: "vj_no_active_pack",
    });
    stage = command(stage, "stage:setPack", { packId: PACK_WARM }, 2).stage;
    const current = stage.state.clipSequence;
    const follower = advance(stage, "tab-b", current, CLIP_GRID);
    expect(follower.ack).toMatchObject({
      code: "vj_not_lead",
      state: { clipSequence: current },
    });
    expect(advance(stage, "tab-a", current - 1, CLIP_GRID).ack).toMatchObject({
      code: "vj_stale_clip_sequence",
      state: { clipSequence: current },
    });
    expect(advance(stage, "tab-a", current, CLIP_DOTS).ack).toMatchObject({
      code: "vj_clip_not_in_pack",
    });
    const applied = advance(stage, "tab-a", current, CLIP_HAZE);
    expect(applied.ack).toMatchObject({ ok: true, isNoop: false });
    expect(applied.stage.state).toMatchObject({
      liveClipId: CLIP_HAZE,
      clipSequence: current + 1,
    });
    expect(applied.outgoing[0]?.payload).toMatchObject({
      cause: "shuffle",
      sourceClientId: null,
    });
  });

  it("replaces an older tab that holds the same screen id", () => {
    const first = attachScreen(freshStage(), "tab-one", SCREEN_A);
    const second = attachScreen(first.stage, "tab-two", SCREEN_A, {
      now: 2_000,
    });
    expect(second.outgoing).toContainEqual({
      name: "exception",
      payload: {
        status: "error",
        code: "BAD_REQUEST",
        message: "replaced",
        domainCode: "vj_screen_replaced",
      },
      targetTabId: "tab-one",
      targetRole: null,
    });
    const entries = second.stage.screens.filter(
      (entry) => entry.screenId === SCREEN_A,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ tabId: "tab-two", number: 1 });
    expect(second.stage.attached["tab-one"]).toBeUndefined();
    expect(second.stage.attached["tab-two"]).toBe("screen");
  });

  it("turns the strobe off on the timeout", () => {
    let stage = attachRemote(freshStage());
    stage = command(
      stage,
      "stage:setStrobe",
      { isStrobing: true },
      1,
      5_000,
    ).stage;
    expect(stage.state.effects.strobeStartedAt).toBe(5_000);
    const result = run(stage, { kind: "strobeTimeout" }, 15_000);
    expect(result.stage.state.effects).toMatchObject({
      isStrobing: false,
      strobeStartedAt: null,
    });
    expect(result.stage.state.revision).toBe(2);
    expect(result.outgoing[0]?.payload).toMatchObject({
      cause: "strobe_timeout",
    });
  });

  it("sends the screen to black when the live clip is deleted", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A).stage;
    stage = attachRemote(stage);
    stage = command(stage, "stage:goClip", { clipId: CLIP_GRID }, 1).stage;
    const change = {
      kind: "clip_deleted" as const,
      packId: null,
      clipId: CLIP_GRID,
      packIds: [PACK_WARM],
    };
    const result = run(stage, { kind: "library", change });
    expect(result.outgoing[0]).toEqual({
      name: "library:changed",
      payload: change,
      targetTabId: null,
      targetRole: null,
    });
    expect(result.stage.state).toMatchObject({
      liveClipId: null,
      clipSequence: 2,
      revision: 2,
    });
    expect(result.outgoing[1]?.payload).toMatchObject({
      cause: "library",
      sourceClientId: null,
    });
  });
});

describe("reduceVjDemoStage live parity", () => {
  it("answers vj_stale_command to a duplicate of a field-refused command", () => {
    const stage = attachRemote(freshStage());
    const refused = command(stage, "stage:setTransition", { fadeMs: 9_999 }, 1);
    expect(refused.ack).toMatchObject({
      ok: false,
      code: "vj_fade_out_of_range",
    });
    const duplicate = command(
      refused.stage,
      "stage:setTransition",
      { fadeMs: 9_999 },
      1,
    );
    expect(duplicate.ack).toMatchObject({
      ok: false,
      code: "vj_stale_command",
      state: { revision: 0 },
    });
  });

  it("checks the lead before the shuffle on an advance", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, { now: 1 }).stage;
    stage = attachScreen(stage, "tab-b", SCREEN_B, { now: 2 }).stage;
    expect(stage.state.shuffle.isOn).toBe(false);
    expect(advance(stage, "tab-b", 0, CLIP_GRID).ack).toMatchObject({
      code: "vj_not_lead",
    });
  });

  it("trims overlay text before the control character check", () => {
    const stage = attachRemote(freshStage());
    const result = command(stage, "stage:setOverlay", { text: "  hello\n" }, 1);
    expect(result.ack).toMatchObject({ ok: true, isNoop: false });
    expect(result.stage.state.overlay.text).toBe("hello");
  });

  it("prunes an offline screen by its disconnect time and never reuses its number", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, { now: 0 }).stage;
    stage = run(stage, { kind: "detach", tabId: "tab-a" }, 500_000).stage;
    const kept = run(stage, { kind: "pruneOffline" }, 1_000_000);
    expect(kept.stage.screens).toHaveLength(1);
    const pruned = run(stage, { kind: "pruneOffline" }, 1_200_000);
    expect(pruned.stage.screens).toHaveLength(0);
    const next = attachScreen(pruned.stage, "tab-b", SCREEN_B, {
      now: 1_200_001,
    });
    expect(next.stage.screens[0]?.number).toBe(2);
  });

  it("breaks a connectedAt tie by attach order", () => {
    let stage = attachScreen(freshStage(), "tab-b", SCREEN_B, { now: 5 }).stage;
    stage = attachScreen(stage, "tab-a", SCREEN_A, { now: 5 }).stage;
    const lead = stage.screens.find((entry) => entry.tabId === "tab-b");
    expect(advance(stage, "tab-a", 0, CLIP_GRID).ack).toMatchObject({
      code: "vj_not_lead",
    });
    expect(lead?.connectionOrder).toBe(1);
  });

  it("drops a malformed screen:status without touching lastSeenAt", () => {
    const stage = attachScreen(freshStage(), "tab-a", SCREEN_A, {
      now: 10,
    }).stage;
    const malformed = run(
      stage,
      {
        kind: "frame",
        tabId: "tab-a",
        name: "screen:status",
        payload: {
          isFullscreen: true,
          preload: { packId: null, clips: [{ clipId: "nope" }] },
        },
      },
      99,
    );
    expect(malformed.outgoing).toEqual([]);
    expect(malformed.stage.screens[0]?.lastSeenAt).toBe(10);
    const clip = {
      clipId: CLIP_GRID.toUpperCase(),
      state: "ready",
      progress: 1,
    };
    const accepted = run(
      stage,
      {
        kind: "frame",
        tabId: "tab-a",
        name: "screen:status",
        payload: {
          isFullscreen: true,
          preload: { packId: PACK_WARM, clips: [clip] },
        },
      },
      99,
    );
    expect(accepted.stage.screens[0]).toMatchObject({
      lastSeenAt: 99,
      isFullscreen: true,
      preload: {
        packId: PACK_WARM,
        clips: [{ clipId: CLIP_GRID, failure: null }],
      },
    });
  });

  it("lowercases pack and clip ids", () => {
    let stage = attachRemote(freshStage());
    stage = command(
      stage,
      "stage:setPack",
      { packId: PACK_WARM.toUpperCase() },
      1,
    ).stage;
    stage = command(
      stage,
      "stage:goClip",
      { clipId: CLIP_HAZE.toUpperCase() },
      2,
    ).stage;
    expect(stage.state).toMatchObject({
      activePackId: PACK_WARM,
      liveClipId: CLIP_HAZE,
    });
  });

  it("ignores an array sent as restoreState", () => {
    const result = run(freshStage(), {
      kind: "attach",
      tabId: "tab-a",
      payload: { role: "screen", screenId: SCREEN_A, restoreState: [] },
    });
    expect(result.ack).toMatchObject({ ok: true, isRestored: false });
    expect(result.stage.state.revision).toBe(0);
  });
});
