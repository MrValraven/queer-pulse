import { describe, expect, it, vi } from "vitest";
import {
  VJ_LIMITS,
  createVjSetlistPlayback,
  createVjStageState,
  type VjLibraryChange,
  type VjSceneLook,
  type VjSetlistRead,
  type VjSetlistReadPosition,
  type VjStageFrame,
  type VjStageRestore,
  vjSetlistTimerTargetAt,
} from "../../../shared/contracts/vj";
import { VJ_SCREEN_OFFLINE_RETENTION_MS } from "../vj.constants";
import {
  createVjDemoStage,
  reduceVjDemoStage,
  type VjDemoStage,
  type VjDemoStageEvent,
} from "./vjDemoStage";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import type { VjDemoSetlistLoopingWrite } from "./vjDemoSceneCommands";
import { landVjDemoChange, serverVjDemoChange } from "./vjDemoStageFrames";
import { restoreVjDemoStage } from "./vjDemoStageRestore";

/** A Loop write that always lands. */
const NO_LOOPING_WRITE: VjDemoSetlistLoopingWrite = () => null;

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

const ALL_CLIPS = [CLIP_GRID, CLIP_HAZE, CLIP_DOTS];

/** The clip ids of the pack among the listed ones. */
function clipsInPack(packId: string, clipIds: string[]): Set<string> {
  const packClipIds = PACK_CLIPS[packId] ?? [];
  return new Set(clipIds.filter((clipId) => packClipIds.includes(clipId)));
}

const library: VjDemoLibraryLookup = {
  hasPack: (packId) => packId in PACK_CLIPS,
  hasClip: (clipId) => ALL_CLIPS.includes(clipId),
  isClipInPack: (packId, clipId) => clipsInPack(packId, [clipId]).size > 0,
  readPackForStage: (packId) =>
    packId in PACK_CLIPS ? { eventId: null } : null,
  existingClipIds: (clipIds) =>
    new Set(clipIds.filter((clipId) => ALL_CLIPS.includes(clipId))),
  clipIdsInPack: clipsInPack,
  readPackClipForAdvance: (packId, clipId) =>
    clipsInPack(packId, [clipId]).size > 0 ? { isFavorite: false } : null,
  readSceneLook: () => null,
  readSetlist: () => null,
  readSetlistFollow: () => null,
};

function run(stage: VjDemoStage, event: VjDemoStageEvent, now = 1_000) {
  return reduceVjDemoStage(stage, event, {
    now,
    library,
    writeSetlistLooping: NO_LOOPING_WRITE,
  });
}

function attachRemote(stage: VjDemoStage, tabId = "remote-tab") {
  return run(stage, {
    kind: "attach",
    tabId,
    payload: { role: "remote", contractVersion: 2 },
  }).stage;
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
        contractVersion: 2,
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
    expect(first.ack).toEqual({
      ok: true,
      serverNow: 1_000,
      revision: 1,
      isNoop: false,
      applyAt: null,
    });
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
    expect(second.ack).toEqual({
      ok: true,
      serverNow: 1_000,
      revision: 2,
      isNoop: false,
      applyAt: null,
    });
    expect(second.outgoing).toEqual([
      {
        name: "stage:state",
        payload: {
          state: second.stage.state,
          cause: "command",
          sourceClientId: CLIENT_ID,
          applyAt: null,
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
    expect(second.ack).toEqual({
      ok: true,
      serverNow: 1_000,
      revision: 1,
      isNoop: true,
      applyAt: null,
    });
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

  it("defaults the interval when the kind changes and rounds the tempo", () => {
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
    stage = command(stage, "stage:setTempo", { bpm: 123.456 }, 3).stage;
    expect(stage.state.tempo.bpm).toBe(123.5);
    const outOfRange = command(stage, "stage:setTempo", { bpm: 59 }, 4);
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
    const restored = restoreVjDemoStage(
      fresh,
      restoreOf({ activePackId: UNKNOWN_ID, liveClipId: UNKNOWN_ID }),
      library,
      1_000,
    );
    expect(restored.activePackId).toBeNull();
    expect(restored.liveClipId).toBeNull();
    const kept = restoreVjDemoStage(
      fresh,
      restoreOf({ activePackId: PACK_PEAK, liveClipId: CLIP_DOTS }),
      library,
      1_000,
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
});

describe("reduceVjDemoStage timers and library", () => {
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
      sceneId: null,
      setlistId: null,
      setlistIds: [],
      eventId: null,
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
    const tooLong = { length: { unit: "ms", value: 9_999 } };
    const refused = command(stage, "stage:setTransition", tooLong, 1);
    expect(refused.ack).toMatchObject({
      ok: false,
      code: "vj_fade_out_of_range",
    });
    const duplicate = command(refused.stage, "stage:setTransition", tooLong, 1);
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
      payload: {
        role: "screen",
        contractVersion: 2,
        screenId: SCREEN_A,
        restoreState: [],
      },
    });
    expect(result.ack).toMatchObject({ ok: true, isRestored: false });
    expect(result.stage.state.revision).toBe(0);
  });
});

describe("reduceVjDemoStage offline retention on an applied change", () => {
  const DISCONNECTED_AT = 2_000;

  /** A remote, screen A with a clip override, then screen A offline. */
  function stageWithOfflineOverride(): VjDemoStage {
    let stage = attachRemote(freshStage());
    stage = attachScreen(stage, "tab-a", SCREEN_A, { now: 0 }).stage;
    const override = {
      clipId: CLIP_GRID,
      generatorId: null,
      generatorVariant: null,
    };
    stage = command(
      stage,
      "stage:setScreenOverride",
      { screenId: SCREEN_A, override },
      1,
    ).stage;
    expect(Object.keys(stage.state.screenOverrides)).toEqual([SCREEN_A]);
    return run(stage, { kind: "detach", tabId: "tab-a" }, DISCONNECTED_AT)
      .stage;
  }

  it("drops the override of a screen offline past retention at the next change without a prune tick", () => {
    const stage = stageWithOfflineOverride();
    const result = command(
      stage,
      "stage:setOverlay",
      { text: "hello" },
      2,
      DISCONNECTED_AT + VJ_SCREEN_OFFLINE_RETENTION_MS + 1,
    );
    expect(result.ack).toMatchObject({ ok: true, isNoop: false });
    expect(result.stage.state.screenOverrides).toEqual({});
    expect(result.stage.screens).toHaveLength(0);
  });

  it("keeps the override while the screen is still inside its retention", () => {
    const stage = stageWithOfflineOverride();
    const result = command(
      stage,
      "stage:setOverlay",
      { text: "hello" },
      2,
      DISCONNECTED_AT + VJ_SCREEN_OFFLINE_RETENTION_MS,
    );
    expect(result.ack).toMatchObject({ ok: true, isNoop: false });
    expect(Object.keys(result.stage.state.screenOverrides)).toEqual([SCREEN_A]);
    expect(result.stage.screens).toHaveLength(1);
  });
});

// Sequences (contract 5.3 to 5.9, 10.3, 10.4) through the stage reducer.

const SETLIST_ID = "55555555-5555-4555-8555-5555555555b1";
const STEP_ONE = "77777777-7777-4777-8777-7777777777a1";
const STEP_TWO = "77777777-7777-4777-8777-7777777777a2";
const STEP_THREE = "77777777-7777-4777-8777-7777777777a3";
const FLASHING_STEP = "77777777-7777-4777-8777-7777777777a4";
const STEP_MS = 8_000;
const EARLY_MS = VJ_LIMITS.quantizedAdvanceEarlyMs;

/** A scene look whose invert effect flashes. */
const FLASHING_LOOK: VjSceneLook = {
  source: { kind: "clip", clipId: CLIP_DOTS },
  effects: {
    speed: 1,
    settings: { invert: { isOn: true, amount: 0.5, variant: null } },
  },
  transition: { mode: "fade", length: { unit: "beats", value: 4 } },
  overlay: {
    text: "",
    style: "ticker",
    isVisible: false,
    position: "top",
    size: "xl",
    colorToken: "coral",
  },
  mix: { clipId: null, amount: 0, blendMode: "screen" },
};

/** The one set list's steps, Loop and read failure, edited by each test. */
interface SequenceShelf {
  steps: Array<
    { itemId: string; clipId: string } | { itemId: string; look: VjSceneLook }
  >;
  isLooping: boolean;
  isGone: boolean;
  isReadFailing: boolean;
}

function sequenceShelf(): SequenceShelf {
  return {
    steps: [
      { itemId: STEP_ONE, clipId: CLIP_GRID },
      { itemId: STEP_TWO, clipId: CLIP_HAZE },
      { itemId: STEP_THREE, clipId: CLIP_DOTS },
    ],
    isLooping: false,
    isGone: false,
    isReadFailing: false,
  };
}

function shelfIndexOf(
  position: VjSetlistReadPosition,
  count: number,
): number | null {
  if (position.kind === "count") return null;
  if (position.kind === "last") return count > 0 ? count - 1 : null;
  if (position.index < count) return position.index;
  return position.wrapsToFirst && count > 0 ? 0 : null;
}

function readShelf(
  shelf: SequenceShelf,
  setlistId: string,
  position: VjSetlistReadPosition,
): VjSetlistRead | null {
  if (shelf.isReadFailing) throw new Error("storage unavailable");
  if (shelf.isGone || setlistId !== SETLIST_ID) return null;
  const index = shelfIndexOf(position, shelf.steps.length);
  const step = index === null ? undefined : shelf.steps[index];
  const duration = { kind: "seconds", value: STEP_MS / 1000 } as const;
  return {
    setlistId,
    isLooping: shelf.isLooping,
    stepDuration: duration,
    itemIds: shelf.steps.map((entry) => entry.itemId),
    step:
      step === undefined || index === null
        ? null
        : "clipId" in step
          ? {
              kind: "clip",
              itemId: step.itemId,
              index,
              clipId: step.clipId,
              duration,
            }
          : {
              kind: "scene",
              itemId: step.itemId,
              index,
              sceneId: "88888888-8888-4888-8888-888888888888",
              look: step.look,
              duration,
            },
  };
}

function sequenceLibrary(shelf: SequenceShelf): VjDemoLibraryLookup {
  return {
    ...library,
    readSetlist: (setlistId, position) => readShelf(shelf, setlistId, position),
    readSetlistFollow: (setlistId) => {
      const read = readShelf(shelf, setlistId, { kind: "count" });
      return read === null
        ? null
        : { itemIds: read.itemIds, isLooping: read.isLooping };
    },
  };
}

function runOn(
  shelf: SequenceShelf,
  stage: VjDemoStage,
  event: VjDemoStageEvent,
  now: number,
) {
  return reduceVjDemoStage(stage, event, {
    now,
    library: sequenceLibrary(shelf),
    writeSetlistLooping: NO_LOOPING_WRITE,
  });
}

let sequenceCounter = 0;

function sequenceCommand(
  shelf: SequenceShelf,
  stage: VjDemoStage,
  name: string,
  payload: Record<string, unknown>,
  now: number,
) {
  sequenceCounter += 1;
  return runOn(
    shelf,
    stage,
    {
      kind: "frame",
      tabId: "remote-tab",
      name,
      payload: {
        ...payload,
        clientId: CLIENT_ID,
        commandSequence: sequenceCounter,
      },
    },
    now,
  );
}

function stageFrameOf(result: {
  outgoing: Array<{ name: string; payload: unknown }>;
}) {
  const frame = result.outgoing.find(
    (outgoing) => outgoing.name === "stage:state",
  );
  return (frame?.payload ?? null) as VjStageFrame | null;
}

/** A remote attached and the set list playing from step 1 at `now`. */
function playingStage(shelf: SequenceShelf, now = 10_000): VjDemoStage {
  return sequenceCommand(
    shelf,
    attachRemote(freshStage()),
    "stage:setlistSelect",
    { setlistId: SETLIST_ID, index: null, isPlaying: true },
    now,
  ).stage;
}

function setlistChange(
  kind: VjLibraryChange["kind"],
  fields: Partial<VjLibraryChange> = {},
): VjLibraryChange {
  return {
    kind,
    packId: null,
    clipId: null,
    packIds: [],
    sceneId: null,
    setlistId: SETLIST_ID,
    setlistIds: [SETLIST_ID],
    eventId: null,
    ...fields,
  };
}

describe("reduceVjDemoStage sequence commands", () => {
  it("Play lands step 1 with both clock times and remembers the item ids", () => {
    const shelf = sequenceShelf();
    const stage = playingStage(shelf);
    expect(stage.state.liveClipId).toBe(CLIP_GRID);
    expect(stage.state.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: STEP_ONE,
      stepStartedAt: 10_000,
      stepEndsAt: 10_000 + STEP_MS,
      stepDurationMs: STEP_MS,
    });
    expect(stage.setlistItemIds).toEqual([STEP_ONE, STEP_TWO, STEP_THREE]);
  });

  it("a refused command keeps the item ids; Stop clears them with the playback", () => {
    const shelf = sequenceShelf();
    const stage = playingStage(shelf);
    const refused = sequenceCommand(
      shelf,
      stage,
      "stage:setlistSetPlaying",
      { isPlaying: "yes" },
      11_000,
    );
    expect(refused.stage.setlistItemIds).toEqual(stage.setlistItemIds);
    const stopped = sequenceCommand(
      shelf,
      stage,
      "stage:setlistSelect",
      { setlistId: null, index: null },
      11_000,
    );
    expect(stopped.stage.state.activeSetlistId).toBeNull();
    expect(stopped.stage.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(stopped.stage.setlistItemIds).toBeNull();
  });

  it("a manual pick takes the run over and the frame carries it", () => {
    const shelf = sequenceShelf();
    const result = sequenceCommand(
      shelf,
      playingStage(shelf),
      "stage:goClip",
      { clipId: CLIP_DOTS },
      12_000,
    );
    expect(result.stage.state.setlistPlayback).toMatchObject({
      status: "takenOver",
      itemId: STEP_ONE,
      stepEndsAt: null,
      stepDurationMs: null,
    });
    expect(stageFrameOf(result)?.state.setlistPlayback.status).toBe(
      "takenOver",
    );
  });

  it("Loop saves through the writer, then lands the Loop copy", () => {
    const shelf = sequenceShelf();
    const writeSetlistLooping = vi.fn(() => null);
    sequenceCounter += 1;
    const result = reduceVjDemoStage(
      playingStage(shelf),
      {
        kind: "frame",
        tabId: "remote-tab",
        name: "stage:setlistSetLooping",
        payload: {
          isLooping: true,
          clientId: CLIENT_ID,
          commandSequence: sequenceCounter,
        },
      },
      { now: 12_000, library: sequenceLibrary(shelf), writeSetlistLooping },
    );
    expect(writeSetlistLooping).toHaveBeenCalledWith(SETLIST_ID, true);
    expect(result.stage.state.setlistPlayback.isLooping).toBe(true);
    expect(result.ack).toMatchObject({ ok: true });
  });
});

describe("reduceVjDemoStage step timer (sequences contract 5.7, 10.4)", () => {
  it("advances at the step end with cause setlist and stamps the next clock, so the run keeps going", () => {
    const shelf = sequenceShelf();
    const stage = playingStage(shelf);
    const firstEnd = 10_000 + STEP_MS;
    const advanced = runOn(
      shelf,
      stage,
      { kind: "setlistTimer" },
      firstEnd - EARLY_MS,
    );
    const frame = stageFrameOf(advanced);
    expect(frame).toMatchObject({ cause: "setlist", applyAt: firstEnd });
    expect(advanced.stage.state.liveClipId).toBe(CLIP_HAZE);
    expect(advanced.stage.state.setlistIndex).toBe(1);
    expect(advanced.stage.state.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: STEP_TWO,
      stepStartedAt: firstEnd,
      stepEndsAt: firstEnd + STEP_MS,
    });
    const again = runOn(
      shelf,
      advanced.stage,
      { kind: "setlistTimer" },
      firstEnd + STEP_MS - EARLY_MS,
    );
    expect(again.stage.state.setlistPlayback).toMatchObject({
      itemId: STEP_THREE,
      stepEndsAt: firstEnd + 2 * STEP_MS,
    });
  });

  it("at the last step it finishes with Loop off and wraps to step 1 with Loop on", () => {
    const shelf = sequenceShelf();
    let stage = playingStage(shelf);
    let end = 10_000 + STEP_MS;
    for (let step = 0; step < 2; step += 1) {
      stage = runOn(
        shelf,
        stage,
        { kind: "setlistTimer" },
        end - EARLY_MS,
      ).stage;
      end += STEP_MS;
    }
    const finished = runOn(
      shelf,
      stage,
      { kind: "setlistTimer" },
      end - EARLY_MS,
    );
    expect(finished.stage.state.setlistIndex).toBe(2);
    expect(finished.stage.state.liveClipId).toBe(CLIP_DOTS);
    expect(finished.stage.state.setlistPlayback).toMatchObject({
      status: "finished",
      itemId: STEP_THREE,
      stepStartedAt: null,
      stepEndsAt: null,
    });
    shelf.isLooping = true;
    const wrapped = runOn(
      shelf,
      {
        ...stage,
        state: {
          ...stage.state,
          setlistPlayback: { ...stage.state.setlistPlayback, isLooping: true },
        },
      },
      { kind: "setlistTimer" },
      end - EARLY_MS,
    );
    expect(wrapped.stage.state.setlistIndex).toBe(0);
    expect(wrapped.stage.state.liveClipId).toBe(CLIP_GRID);
    expect(wrapped.stage.state.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: STEP_ONE,
      stepEndsAt: end + STEP_MS,
    });
  });

  it("stops before an unconfirmed flashing step with needsFlashConsent, the step on screen kept", () => {
    const shelf = sequenceShelf();
    shelf.steps.splice(1, 0, { itemId: FLASHING_STEP, look: FLASHING_LOOK });
    const stage = playingStage(shelf);
    const result = runOn(
      shelf,
      stage,
      { kind: "setlistTimer" },
      10_000 + STEP_MS - EARLY_MS,
    );
    expect(result.stage.state.liveClipId).toBe(CLIP_GRID);
    expect(result.stage.state.setlistIndex).toBe(0);
    expect(result.stage.state.setlistPlayback).toMatchObject({
      status: "needsFlashConsent",
      itemId: STEP_ONE,
      stepEndsAt: null,
    });
  });

  it("a read that throws lands nothing and asks for a retry after setlistTimerRetryMs", () => {
    const shelf = sequenceShelf();
    const stage = playingStage(shelf);
    shelf.isReadFailing = true;
    const fireAt = 10_000 + STEP_MS - EARLY_MS;
    const result = runOn(shelf, stage, { kind: "setlistTimer" }, fireAt);
    expect(result.stage).toBe(stage);
    expect(result.outgoing).toEqual([]);
    expect(result.setlistTimerRetryAt).toBe(
      fireAt + VJ_LIMITS.setlistTimerRetryMs,
    );
    shelf.isReadFailing = false;
    const retried = runOn(
      shelf,
      stage,
      { kind: "setlistTimer" },
      fireAt + 1_000,
    );
    expect(retried.stage.state.setlistPlayback.itemId).toBe(STEP_TWO);
  });

  it("a fire while nothing plays, or after the set list went, lands nothing", () => {
    const shelf = sequenceShelf();
    const stopped = attachRemote(freshStage());
    expect(
      runOn(shelf, stopped, { kind: "setlistTimer" }, 5_000).outgoing,
    ).toEqual([]);
    const stage = playingStage(shelf);
    shelf.isGone = true;
    const gone = runOn(shelf, stage, { kind: "setlistTimer" }, 17_700);
    expect(gone.stage).toBe(stage);
    expect(gone.setlistTimerRetryAt).toBeUndefined();
  });

  it("an edit that moved the index under the same clock is read at fire time", () => {
    const shelf = sequenceShelf();
    let stage = playingStage(shelf);
    stage = runOn(
      shelf,
      stage,
      { kind: "setlistTimer" },
      10_000 + STEP_MS - EARLY_MS,
    ).stage;
    expect(stage.state.setlistIndex).toBe(1);
    const stepEndsAt = stage.state.setlistPlayback.stepEndsAt;
    shelf.steps.splice(0, 1);
    stage = runOn(
      shelf,
      stage,
      { kind: "library", change: setlistChange("setlist_items_changed") },
      20_000,
    ).stage;
    expect(stage.state.setlistIndex).toBe(0);
    expect(stage.state.setlistPlayback.stepEndsAt).toBe(stepEndsAt);
    expect(stage.setlistItemIds).toEqual([STEP_TWO, STEP_THREE]);
    const advanced = runOn(
      shelf,
      stage,
      { kind: "setlistTimer" },
      (stepEndsAt ?? 0) - EARLY_MS,
    );
    expect(advanced.stage.state.setlistPlayback.itemId).toBe(STEP_THREE);
    expect(advanced.stage.state.setlistIndex).toBe(1);
  });

  it("a Loop toggle before the fire is what the fire reads", () => {
    const shelf = sequenceShelf();
    shelf.steps = shelf.steps.slice(0, 1);
    let stage = playingStage(shelf);
    shelf.isLooping = true;
    stage = runOn(
      shelf,
      stage,
      { kind: "library", change: setlistChange("setlist_updated") },
      12_000,
    ).stage;
    expect(stage.state.setlistPlayback.isLooping).toBe(true);
    const wrapped = runOn(
      shelf,
      stage,
      { kind: "setlistTimer" },
      10_000 + STEP_MS - EARLY_MS,
    );
    expect(wrapped.stage.state.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: STEP_ONE,
      stepEndsAt: 10_000 + 2 * STEP_MS,
    });
  });
});

describe("reduceVjDemoStage sequence library changes and restore", () => {
  it("setlist_deleted clears the selection, the playback and the item ids", () => {
    const shelf = sequenceShelf();
    shelf.isGone = true;
    const result = runOn(
      shelf,
      playingStage({ ...sequenceShelf() }),
      { kind: "library", change: setlistChange("setlist_deleted") },
      12_000,
    );
    expect(result.stage.state.activeSetlistId).toBeNull();
    expect(result.stage.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(result.stage.setlistItemIds).toBeNull();
    expect(stageFrameOf(result)?.cause).toBe("library");
  });

  it("an append after the step on screen changes no state yet is remembered", () => {
    const shelf = sequenceShelf();
    const stage = playingStage(shelf);
    shelf.steps.push({ itemId: FLASHING_STEP, look: FLASHING_LOOK });
    const result = runOn(
      shelf,
      stage,
      { kind: "library", change: setlistChange("setlist_items_changed") },
      12_000,
    );
    expect(result.stage.state).toBe(stage.state);
    expect(result.outgoing.map((outgoing) => outgoing.name)).toEqual([
      "library:changed",
    ]);
    expect(result.stage.setlistItemIds).toEqual([
      STEP_ONE,
      STEP_TWO,
      STEP_THREE,
      FLASHING_STEP,
    ]);
  });

  it("a restored run whose step end passed keeps it, remembers the item ids and advances once on the next fire", () => {
    const shelf = sequenceShelf();
    const saved = restoreOf({
      activeSetlistId: SETLIST_ID,
      setlistIndex: 1,
      setlistPlayback: {
        ...createVjSetlistPlayback(false),
        status: "playing",
        itemId: STEP_TWO,
        isFlashConfirmed: true,
        stepStartedAt: 1_000,
        stepEndsAt: 1_000 + STEP_MS,
        stepDurationMs: STEP_MS,
      },
    });
    const attached = reduceVjDemoStage(
      freshStage(),
      {
        kind: "attach",
        tabId: "tab-a",
        payload: {
          role: "screen",
          contractVersion: 2,
          screenId: SCREEN_A,
          restoreState: saved,
        },
      },
      {
        now: 30_000,
        library: sequenceLibrary(shelf),
        writeSetlistLooping: NO_LOOPING_WRITE,
      },
    );
    expect(attached.stage.state.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: STEP_TWO,
      isFlashConfirmed: false,
      stepEndsAt: 1_000 + STEP_MS,
    });
    expect(attached.stage.setlistItemIds).toEqual([
      STEP_ONE,
      STEP_TWO,
      STEP_THREE,
    ]);
    // The passed end gives a timer target already due, so it fires at once.
    expect(vjSetlistTimerTargetAt(attached.stage.state)).toBeLessThan(30_000);
    const advanced = runOn(
      shelf,
      attached.stage,
      { kind: "setlistTimer" },
      30_000,
    );
    expect(advanced.stage.state.setlistPlayback).toMatchObject({
      status: "playing",
      itemId: STEP_THREE,
      stepStartedAt: 30_000,
      stepEndsAt: 30_000 + STEP_MS,
    });
    // Once: the advance stamps a fresh clock, so the next target is a full
    // step away and the run goes on from step three.
    expect(vjSetlistTimerTargetAt(advanced.stage.state)).toBe(
      30_000 + STEP_MS - EARLY_MS,
    );
    expect(stageFrameOf(advanced)).toMatchObject({
      cause: "setlist",
      applyAt: null,
    });
  });

  it("a restore whose set list is gone seeds no selection and the default playback", () => {
    const shelf = sequenceShelf();
    shelf.isGone = true;
    const attached = reduceVjDemoStage(
      freshStage(),
      {
        kind: "attach",
        tabId: "tab-a",
        payload: {
          role: "screen",
          contractVersion: 2,
          screenId: SCREEN_A,
          restoreState: restoreOf({
            activeSetlistId: SETLIST_ID,
            setlistIndex: 0,
            setlistPlayback: {
              ...createVjSetlistPlayback(true),
              status: "paused",
              itemId: STEP_ONE,
              stepDurationMs: STEP_MS,
              pausedRemainingMs: 1_000,
            },
          }),
        },
      },
      {
        now: 30_000,
        library: sequenceLibrary(shelf),
        writeSetlistLooping: NO_LOOPING_WRITE,
      },
    );
    expect(attached.stage.state.activeSetlistId).toBeNull();
    expect(attached.stage.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(attached.stage.setlistItemIds).toBeNull();
  });
});

describe("reduceVjDemoStage Loop write and landing rules", () => {
  it("a replayed or older stage:setlistSetLooping is refused as stale and never calls the writer again", () => {
    const shelf = sequenceShelf();
    const stage = playingStage(shelf);
    const writeSetlistLooping = vi.fn<VjDemoSetlistLoopingWrite>(() => null);
    const looping = {
      kind: "frame" as const,
      tabId: "remote-tab",
      name: "stage:setlistSetLooping",
      payload: {
        isLooping: true,
        clientId: CLIENT_ID,
        commandSequence: 90_000,
      },
    };
    const context = {
      now: 12_000,
      library: sequenceLibrary(shelf),
      writeSetlistLooping,
    };
    const first = reduceVjDemoStage(stage, looping, context);
    expect(writeSetlistLooping).toHaveBeenCalledTimes(1);
    const replayed = reduceVjDemoStage(first.stage, looping, context);
    expect(replayed.ack).toMatchObject({
      ok: false,
      code: "vj_stale_command",
    });
    const older = reduceVjDemoStage(
      first.stage,
      { ...looping, payload: { ...looping.payload, commandSequence: 1 } },
      context,
    );
    expect(older.ack).toMatchObject({ ok: false, code: "vj_stale_command" });
    expect(writeSetlistLooping).toHaveBeenCalledTimes(1);
  });

  it("a failed Loop write refuses with its code and lands nothing", () => {
    const shelf = sequenceShelf();
    const stage = playingStage(shelf);
    sequenceCounter += 1;
    const result = reduceVjDemoStage(
      stage,
      {
        kind: "frame",
        tabId: "remote-tab",
        name: "stage:setlistSetLooping",
        payload: {
          isLooping: true,
          clientId: CLIENT_ID,
          commandSequence: sequenceCounter,
        },
      },
      {
        now: 12_000,
        library: sequenceLibrary(shelf),
        writeSetlistLooping: () => "vj_server_error",
      },
    );
    expect(result.ack).toMatchObject({ ok: false, code: "vj_server_error" });
    expect(result.stage.state).toBe(stage.state);
    expect(result.outgoing).toEqual([]);
  });

  it("landVjDemoChange places a change by scheduledAt only for the setlist cause", () => {
    const stage = freshStage();
    const accepted = {
      ...serverVjDemoChange({ ...stage.state, liveClipId: CLIP_GRID }),
      scheduledAt: 5_000,
    };
    for (const cause of [
      "command",
      "library",
      "shuffle",
      "mic_tempo",
    ] as const) {
      expect(
        landVjDemoChange(stage, accepted, cause, null, 4_000).success,
      ).toMatchObject({ isNoop: false, applyAt: null });
    }
    expect(
      landVjDemoChange(stage, accepted, "setlist", null, 4_000).success.applyAt,
    ).toBe(5_000);
  });
});
