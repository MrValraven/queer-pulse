import { describe, expect, it } from "vitest";
import {
  VJ_LIMITS,
  vjQuantizedApplyAt,
  type VjScreenStatus,
  type VjStageFrame,
} from "../../../shared/contracts/vj";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import {
  createVjDemoStage,
  reduceVjDemoStage,
  type VjDemoOutgoing,
  type VjDemoStage,
  type VjDemoStageEvent,
} from "./vjDemoStage";

const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIP_DOTS = "00000000-0000-4000-8000-0000000000c3";
const CLIENT_ID = "11111111-1111-4111-8111-111111111111";
const SCREEN_A = "22222222-2222-4222-8222-22222222222a";
const SCREEN_B = "22222222-2222-4222-8222-22222222222b";
const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const REMOTE_TAB = "remote-tab";

const ALL_CLIPS = [CLIP_GRID, CLIP_HAZE, CLIP_DOTS];
const PACK_CLIPS: Record<string, string[]> = {
  [PACK_WARM]: [CLIP_GRID, CLIP_HAZE],
};

/** The clip ids of the pack among the listed ones. */
function clipsInPack(packId: string, clipIds: string[]): Set<string> {
  const packClipIds = PACK_CLIPS[packId] ?? [];
  return new Set(clipIds.filter((clipId) => packClipIds.includes(clipId)));
}

/** Only CLIP_GRID is a favorite. */
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
    clipsInPack(packId, [clipId]).size > 0
      ? { isFavorite: clipId === CLIP_GRID }
      : null,
  readSceneLook: () => null,
  readSetlist: () => null,
  readSetlistFollow: () => null,
};

function run(stage: VjDemoStage, event: VjDemoStageEvent, now = 1_000) {
  return reduceVjDemoStage(stage, event, {
    now,
    library,
    writeSetlistLooping: () => null,
  });
}

function freshStage(): VjDemoStage {
  return createVjDemoStage(STAGE_EPOCH, 0);
}

function attachRemote(stage: VjDemoStage, tabId = REMOTE_TAB, now = 1_000) {
  return run(
    stage,
    { kind: "attach", tabId, payload: { role: "remote", contractVersion: 2 } },
    now,
  );
}

function attachScreen(
  stage: VjDemoStage,
  tabId: string,
  screenId: string,
  now = 1_000,
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
        restoreState: null,
      },
    },
    now,
  );
}

/** A stamped command from the remote tab; the sequence counts up per stage. */
function command(
  stage: VjDemoStage,
  name: string,
  payload: Record<string, unknown>,
  now = 1_000,
) {
  const commandSequence =
    (stage.clientSequences.find((entry) => entry.clientId === CLIENT_ID)
      ?.sequence ?? 0) + 1;
  return run(
    stage,
    {
      kind: "frame",
      tabId: REMOTE_TAB,
      name,
      payload: { ...payload, clientId: CLIENT_ID, commandSequence },
    },
    now,
  );
}

function frame(
  stage: VjDemoStage,
  tabId: string,
  name: string,
  payload: unknown,
  now = 1_000,
) {
  return run(stage, { kind: "frame", tabId, name, payload }, now);
}

function micStatus(bpm: number, beatAt: number) {
  return {
    isFullscreen: false,
    preload: { packId: null, clips: [] },
    mic: { level: 0.42, bpm, confidence: 0.9, beatAt },
  };
}

function stageFrameOf(outgoing: VjDemoOutgoing[]): VjStageFrame | undefined {
  const found = outgoing.find((entry) => entry.name === "stage:state");
  return found?.payload as VjStageFrame | undefined;
}

function screensOf(outgoing: VjDemoOutgoing[]): VjScreenStatus[] {
  const found = outgoing.find((entry) => entry.name === "screens:update");
  return (found?.payload as { screens: VjScreenStatus[] }).screens;
}

/** A remote and one screen, with the beat quantize on. */
function quantizedStage(): VjDemoStage {
  const stage = attachRemote(
    attachScreen(freshStage(), "tab-a", SCREEN_A).stage,
  ).stage;
  return command(stage, "stage:setTempo", { quantize: "beat" }).stage;
}

describe("demo stage v2 clock and acks", () => {
  it("clock:sync answers before attach", () => {
    const stage = freshStage();
    const result = frame(stage, "lonely-tab", "clock:sync", {}, 777);
    expect(result.ack).toEqual({ ok: true, serverNow: 777 });
    expect(result.outgoing).toEqual([]);
    expect(result.stage).toBe(stage);
  });

  it("every ack carries serverNow", () => {
    const now = 4_321;
    const remote = attachRemote(freshStage(), REMOTE_TAB, now);
    expect(remote.ack).toMatchObject({ ok: true, serverNow: now });
    const screen = attachScreen(remote.stage, "tab-a", SCREEN_A, now);
    expect(screen.ack).toMatchObject({ ok: true, serverNow: now });
    const accepted = command(
      screen.stage,
      "stage:goClip",
      {
        clipId: CLIP_GRID,
      },
      now,
    );
    expect(accepted.ack).toMatchObject({ ok: true, serverNow: now });
    const refused = command(
      accepted.stage,
      "stage:goClip",
      {
        clipId: "nope",
      },
      now,
    );
    expect(refused.ack).toMatchObject({ ok: false, serverNow: now });
    const advance = frame(
      refused.stage,
      "tab-a",
      "screen:advance",
      {
        expectedClipSequence: 0,
        clipId: CLIP_GRID,
      },
      now,
    );
    expect(advance.ack).toMatchObject({
      code: "vj_shuffle_off",
      serverNow: now,
    });
    const reauth = frame(refused.stage, REMOTE_TAB, "session:reauth", {}, now);
    expect(reauth.ack).toMatchObject({ ok: true, serverNow: now });
    const unattached = frame(freshStage(), "tab-x", "stage:goClip", {}, now);
    expect(unattached.ack).toMatchObject({
      code: "vj_not_attached",
      serverNow: now,
    });
  });
});

describe("demo stage v2 quantize", () => {
  it("a quantized clip change carries applyAt in its frame and ack", () => {
    const stage = quantizedStage();
    const expected = vjQuantizedApplyAt(stage.state.tempo, 1_000);
    expect(expected).not.toBeNull();
    const result = command(stage, "stage:goClip", { clipId: CLIP_GRID });
    expect(result.ack).toMatchObject({ ok: true, applyAt: expected });
    expect(stageFrameOf(result.outgoing)?.applyAt).toBe(expected);
    expect(result.stage.pendingApplyAt).toBe(expected);
    expect(result.stage.state.liveSince).toBe(expected);
  });

  it("an effect change during a pending clip takes the pending applyAt", () => {
    const clip = command(quantizedStage(), "stage:goClip", {
      clipId: CLIP_GRID,
    });
    const pending = clip.stage.pendingApplyAt;
    const speed = command(clip.stage, "stage:setEffects", { speed: 2 }, 1_010);
    expect(speed.ack).toMatchObject({ ok: true, applyAt: pending });
    expect(stageFrameOf(speed.outgoing)?.applyAt).toBe(pending);
  });

  it("blackout with isImmediate lands at once", () => {
    const clip = command(quantizedStage(), "stage:goClip", {
      clipId: CLIP_GRID,
    });
    const blackout = command(
      clip.stage,
      "stage:setEffects",
      { isBlackout: true, isImmediate: true },
      1_010,
    );
    expect(blackout.ack).toMatchObject({ ok: true, applyAt: null });
    expect(stageFrameOf(blackout.outgoing)?.applyAt).toBeNull();
    expect(blackout.stage.pendingApplyAt).toBeNull();
    expect(blackout.stage.state.effects.isBlackout).toBe(true);
  });

  it("a noop answers applyAt null and keeps the pending applyAt", () => {
    const clip = command(quantizedStage(), "stage:goClip", {
      clipId: CLIP_GRID,
    });
    const noop = command(clip.stage, "stage:setEffects", { speed: 1 }, 1_010);
    expect(noop.ack).toMatchObject({ ok: true, isNoop: true, applyAt: null });
    expect(noop.outgoing).toEqual([]);
    expect(noop.stage.pendingApplyAt).toBe(clip.stage.pendingApplyAt);
  });
});

describe("demo stage v2 identify and advance", () => {
  it("identify reaches one screen or all and counts them", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, 1).stage;
    stage = attachScreen(stage, "tab-b", SCREEN_B, 2).stage;
    stage = attachRemote(stage).stage;
    const all = frame(stage, REMOTE_TAB, "screen:identify", { screenId: null });
    expect(all.ack).toEqual({ ok: true, serverNow: 1_000, identifiedCount: 2 });
    const durationMs = VJ_LIMITS.identifyDurationMs;
    expect(all.outgoing).toEqual([
      {
        name: "screen:identify",
        payload: { number: 1, durationMs },
        targetTabId: "tab-a",
        targetRole: null,
      },
      {
        name: "screen:identify",
        payload: { number: 2, durationMs },
        targetTabId: "tab-b",
        targetRole: null,
      },
    ]);
    expect(all.stage.state).toBe(stage.state);
    const one = frame(stage, REMOTE_TAB, "screen:identify", {
      screenId: SCREEN_B.toUpperCase(),
    });
    expect(one.ack).toMatchObject({ identifiedCount: 1 });
    expect(one.outgoing.map((entry) => entry.targetTabId)).toEqual(["tab-b"]);
    const fromScreen = frame(stage, "tab-a", "screen:identify", {
      screenId: null,
    });
    expect(fromScreen.ack).toMatchObject({ code: "vj_wrong_role" });
  });

  it("identify for an offline screen is refused", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, 1).stage;
    stage = attachScreen(stage, "tab-b", SCREEN_B, 2).stage;
    stage = attachRemote(stage).stage;
    stage = run(stage, { kind: "detach", tabId: "tab-b" }).stage;
    const result = frame(stage, REMOTE_TAB, "screen:identify", {
      screenId: SCREEN_B,
    });
    expect(result.ack).toMatchObject({
      ok: false,
      code: "vj_screen_not_attached",
    });
    expect(result.outgoing).toEqual([]);
  });

  it("advance refuses a skipped clip and a non-favorite in favorites mode with state", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A).stage;
    stage = attachRemote(stage).stage;
    stage = command(stage, "stage:setPack", { packId: PACK_WARM }).stage;
    stage = command(stage, "stage:setShuffle", {
      isOn: true,
      excludedClipIds: [CLIP_HAZE],
    }).stage;
    const sequence = stage.state.clipSequence;
    const skipped = frame(stage, "tab-a", "screen:advance", {
      expectedClipSequence: sequence,
      clipId: CLIP_HAZE,
    });
    expect(skipped.ack).toMatchObject({
      code: "vj_clip_excluded",
      state: { clipSequence: sequence },
    });
    stage = command(stage, "stage:setShuffle", {
      excludedClipIds: [],
      source: "favorites",
    }).stage;
    const notFavorite = frame(stage, "tab-a", "screen:advance", {
      expectedClipSequence: sequence,
      clipId: CLIP_HAZE,
    });
    expect(notFavorite.ack).toMatchObject({
      code: "vj_clip_not_favorite",
      state: { clipSequence: sequence },
    });
    const favorite = frame(stage, "tab-a", "screen:advance", {
      expectedClipSequence: sequence,
      clipId: CLIP_GRID,
    });
    expect(favorite.ack).toMatchObject({ ok: true, isNoop: false });
    expect(stageFrameOf(favorite.outgoing)).toMatchObject({
      cause: "shuffle",
      sourceClientId: null,
      state: { liveClipId: CLIP_GRID, recentClipIds: [CLIP_GRID] },
    });
  });
});

describe("demo stage v2 mic tempo", () => {
  it("a lead mic report adopts the tempo when the remote chose mic", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A).stage;
    stage = attachRemote(stage).stage;
    const before = frame(
      stage,
      "tab-a",
      "screen:status",
      micStatus(128, 1_000),
    );
    expect(stageFrameOf(before.outgoing)).toBeUndefined();
    stage = command(before.stage, "stage:setTempo", { source: "mic" }).stage;
    expect(stage.state.tempo.source).toBe("mic");
    const now = 10_000;
    const adopted = frame(
      stage,
      "tab-a",
      "screen:status",
      micStatus(128, now),
      now,
    );
    expect(adopted.stage.state.tempo).toMatchObject({
      bpm: 128,
      source: "mic",
    });
    expect(adopted.stage.lastMicAdoptionAt).toBe(now);
    expect(stageFrameOf(adopted.outgoing)).toMatchObject({
      cause: "mic_tempo",
      sourceClientId: null,
      applyAt: null,
    });
    const tooSoon = frame(
      adopted.stage,
      "tab-a",
      "screen:status",
      micStatus(140, now + 500),
      now + 500,
    );
    expect(stageFrameOf(tooSoon.outgoing)).toBeUndefined();
    expect(tooSoon.stage.state.tempo.bpm).toBe(128);
  });

  it("a follower's mic is relayed and never adopted", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, 1).stage;
    stage = attachScreen(stage, "tab-b", SCREEN_B, 2).stage;
    stage = attachRemote(stage).stage;
    stage = frame(stage, "tab-a", "screen:status", micStatus(124, 1_000)).stage;
    stage = command(stage, "stage:setTempo", { source: "mic" }).stage;
    const follower = frame(
      stage,
      "tab-b",
      "screen:status",
      { ...micStatus(140, 10_000), nextClipId: CLIP_GRID },
      10_000,
    );
    expect(stageFrameOf(follower.outgoing)).toBeUndefined();
    expect(follower.stage.state.tempo.bpm).toBe(stage.state.tempo.bpm);
    const followerStatus = screensOf(follower.outgoing).find(
      (screen) => screen.screenId === SCREEN_B,
    );
    expect(followerStatus).toMatchObject({
      mic: { level: 0.42, detectedBpm: 140, confidence: 0.9 },
      nextClipId: null,
    });
    expect(
      follower.stage.screens.find((entry) => entry.screenId === SCREEN_B)
        ?.nextClipId,
    ).toBeNull();
  });
});

describe("demo stage v2 timers and library", () => {
  it("the overlay timer hides the text and the countdown timer hides the countdown", () => {
    let stage = attachRemote(freshStage()).stage;
    stage = command(stage, "stage:setOverlay", {
      text: "hello",
      isVisible: true,
      hideAfterMs: 5_000,
    }).stage;
    expect(stage.state.overlay.hideAt).toBe(6_000);
    const hidden = run(stage, { kind: "overlayTimeout" }, 6_000);
    expect(hidden.stage.state.overlay).toMatchObject({
      isVisible: false,
      hideAt: null,
      text: "hello",
    });
    expect(stageFrameOf(hidden.outgoing)?.cause).toBe("overlay_timeout");
    const again = run(hidden.stage, { kind: "overlayTimeout" }, 6_001);
    expect(again.outgoing).toEqual([]);

    stage = command(hidden.stage, "stage:setCountdown", {
      durationMs: 60_000,
      label: "Doors",
      isVisible: true,
    }).stage;
    const ended = run(stage, { kind: "countdownEnd" }, 71_000);
    expect(ended.stage.state.countdown).toMatchObject({
      isVisible: false,
      targetAt: 61_000,
      label: "Doors",
    });
    expect(stageFrameOf(ended.outgoing)?.cause).toBe("countdown_end");
  });

  it("a clip delete clears it from mix, overrides, history and skipped clips", () => {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A).stage;
    stage = attachRemote(stage).stage;
    stage = command(stage, "stage:setPack", { packId: PACK_WARM }).stage;
    stage = command(stage, "stage:goClip", { clipId: CLIP_GRID }).stage;
    stage = command(stage, "stage:goClip", { clipId: CLIP_HAZE }).stage;
    stage = command(stage, "stage:setMix", {
      clipId: CLIP_GRID,
      amount: 0.5,
      blendMode: "screen",
    }).stage;
    stage = command(stage, "stage:setScreenOverride", {
      screenId: SCREEN_A,
      override: {
        clipId: CLIP_GRID,
        generatorId: null,
        generatorVariant: null,
      },
    }).stage;
    stage = command(stage, "stage:setShuffle", {
      excludedClipIds: [CLIP_GRID],
    }).stage;
    expect(stage.state.recentClipIds).toEqual([CLIP_HAZE, CLIP_GRID]);
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
    expect(result.outgoing[0]).toMatchObject({
      name: "library:changed",
      payload: change,
    });
    expect(result.stage.state).toMatchObject({
      liveClipId: CLIP_HAZE,
      mix: { clipId: null, amount: 0, blendMode: "screen" },
      screenOverrides: {},
      recentClipIds: [CLIP_HAZE],
      shuffle: { excludedClipIds: [] },
    });
    expect(stageFrameOf(result.outgoing)?.cause).toBe("library");
  });

  it("an unrelated library change is relayed and leaves the stage", () => {
    const stage = attachRemote(freshStage()).stage;
    const change = {
      kind: "packs_reordered" as const,
      packId: null,
      clipId: null,
      packIds: [PACK_WARM],
      sceneId: null,
      setlistId: null,
      setlistIds: [],
      eventId: null,
    };
    const result = run(stage, { kind: "library", change });
    expect(result.outgoing.map((entry) => entry.name)).toEqual([
      "library:changed",
    ]);
    expect(result.stage).toBe(stage);
  });
});

describe("demo stage v2 attach", () => {
  it("attach with contract version 1 answers vj_client_outdated", () => {
    const result = run(freshStage(), {
      kind: "attach",
      tabId: "tab-a",
      payload: {
        role: "screen",
        contractVersion: 1,
        screenId: SCREEN_A,
        restoreState: null,
      },
    });
    expect(result.ack).toMatchObject({
      ok: false,
      code: "vj_client_outdated",
      serverNow: 1_000,
    });
    expect(result.stage.attached["tab-a"]).toBeUndefined();
    expect(result.stage.screens).toEqual([]);
    const missing = run(freshStage(), {
      kind: "attach",
      tabId: REMOTE_TAB,
      payload: { role: "remote" },
    });
    expect(missing.ack).toMatchObject({ code: "vj_client_outdated" });
    const attached = attachRemote(freshStage()).stage;
    const twice = run(attached, {
      kind: "attach",
      tabId: REMOTE_TAB,
      payload: { role: "remote", contractVersion: 1 },
    });
    expect(twice.ack).toMatchObject({ code: "vj_already_attached" });
  });

  it("the attach ack carries screenNumber", () => {
    const first = attachScreen(freshStage(), "tab-a", SCREEN_A, 1);
    expect(first.ack).toMatchObject({ ok: true, screenNumber: 1 });
    const second = attachScreen(first.stage, "tab-b", SCREEN_B, 2);
    expect(second.ack).toMatchObject({ ok: true, screenNumber: 2 });
    const remote = attachRemote(second.stage);
    expect(remote.ack).toMatchObject({
      ok: true,
      role: "remote",
      screenNumber: null,
      isLead: null,
    });
  });

  it("the attach frame carries a pending applyAt", () => {
    const clip = command(quantizedStage(), "stage:goClip", {
      clipId: CLIP_GRID,
    });
    const pending = clip.stage.pendingApplyAt;
    expect(pending).not.toBeNull();
    const early = attachRemote(clip.stage, "remote-two", 1_010);
    expect(stageFrameOf(early.outgoing)).toMatchObject({
      cause: "attach",
      applyAt: pending,
    });
    const late = attachRemote(clip.stage, "remote-two", (pending ?? 0) + 1);
    expect(stageFrameOf(late.outgoing)?.applyAt).toBeNull();
  });
});

describe("demo stage render mode", () => {
  function twoScreensAndRemote(): VjDemoStage {
    let stage = attachScreen(freshStage(), "tab-a", SCREEN_A, 1).stage;
    stage = attachScreen(stage, "tab-b", SCREEN_B, 2).stage;
    return attachRemote(stage).stage;
  }

  it("setRenderMode reaches every connected screen and counts them", () => {
    const stage = twoScreensAndRemote();
    const result = frame(stage, REMOTE_TAB, "screens:setRenderMode", {
      mode: "simple",
    });
    expect(result.ack).toEqual({ ok: true, serverNow: 1_000, reachedCount: 2 });
    expect(result.outgoing).toEqual([
      {
        name: "screen:renderMode",
        payload: { mode: "simple" },
        targetTabId: "tab-a",
        targetRole: null,
      },
      {
        name: "screen:renderMode",
        payload: { mode: "simple" },
        targetTabId: "tab-b",
        targetRole: null,
      },
    ]);
    expect(result.stage.state).toBe(stage.state);
  });

  it("setRenderMode skips a detached screen and refuses when none is connected", () => {
    let stage = twoScreensAndRemote();
    stage = run(stage, { kind: "detach", tabId: "tab-b" }).stage;
    const one = frame(stage, REMOTE_TAB, "screens:setRenderMode", {
      mode: "effects",
    });
    expect(one.ack).toMatchObject({ ok: true, reachedCount: 1 });
    expect(one.outgoing.map((entry) => entry.targetTabId)).toEqual(["tab-a"]);
    stage = run(stage, { kind: "detach", tabId: "tab-a" }).stage;
    const none = frame(stage, REMOTE_TAB, "screens:setRenderMode", {
      mode: "effects",
    });
    expect(none.ack).toMatchObject({
      ok: false,
      code: "vj_no_screens_connected",
    });
    expect(none.outgoing).toEqual([]);
  });

  it("setRenderMode refuses an unknown mode and a screen sender", () => {
    const stage = twoScreensAndRemote();
    const unknownMode = frame(stage, REMOTE_TAB, "screens:setRenderMode", {
      mode: "dom",
    });
    expect(unknownMode.ack).toMatchObject({
      ok: false,
      code: "vj_render_mode_invalid",
    });
    expect(unknownMode.outgoing).toEqual([]);
    const fromScreen = frame(stage, "tab-a", "screens:setRenderMode", {
      mode: "simple",
    });
    expect(fromScreen.ack).toMatchObject({ code: "vj_wrong_role" });
  });
});
