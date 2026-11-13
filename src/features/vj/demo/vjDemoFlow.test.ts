// End to end over the demo: a screen tab and a remote tab, each a real
// useVjStage over its own VjDemoTransport, talking through one in-memory
// channel hub (the BroadcastChannel stand-in), with the screen tab hosting
// the demo server and the demo store on an in-memory storage. Fake timers
// drive heartbeats, clock sync, quantized applyAt, the server timers and the
// client frame queue; the local clock runs LOCAL_AHEAD_MS ahead of the
// server so every clock offset is exact.

import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalVjStageState,
  createVjStageState,
  vjEffectSettingOf,
  vjNextBoundaryAt,
  vjSceneLookOf,
  VJ_CONTRACT_VERSION,
  VJ_LIMITS,
  type VjLibraryChange,
  type VjScreenIdentifyFrame,
  type VjStageFrame,
  type VjStageRestore,
  type VjStageState,
  type VjTempo,
} from "../../../shared/contracts/vj";
import {
  useVjStage,
  type VjStageAttach,
  type VjStageCommands,
  type VjStageController,
} from "../live/useVjStage";
import type { VjServerFrame } from "../realtime/vjFrames";
import type { VjTransportOptions } from "../realtime/vjTransport";
import { VJ_DEMO_HEARTBEAT_MS } from "../vj.constants";
import {
  createVjDemoChannelHub,
  type VjDemoChannel,
  type VjDemoMessage,
} from "./vjDemoChannel";
import type { VjDemoLockSeam } from "./vjDemoHosting";
import {
  configureVjDemoStore,
  demoCreateVjScene,
  demoDeleteVjClip,
  demoSetVjPackEvent,
  vjDemoLibraryLookup,
} from "./vjDemoStore";
import { restoreVjDemoStage } from "./vjDemoStageRestore";
import { VjDemoTransport } from "./vjDemoTransport";

type CapturedOptions = VjTransportOptions & { isDemoMode: boolean };

const harness = vi.hoisted(() => ({
  factory: null as null | ((options: unknown) => unknown),
  /** How far every tab's local clock runs ahead of the server clock. */
  localAheadMs: 40,
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
vi.mock("../realtime/createVjTransport", () => ({
  createVjTransport: (options: unknown) => {
    if (harness.factory === null) throw new Error("no transport factory");
    return harness.factory(options);
  },
}));
// The local clock both the demo transport and the frame queue read: the
// fake wall clock plus a fixed lead, so offsets and due times are integers.
vi.mock("../realtime/vjClockSync", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../realtime/vjClockSync")>()),
  vjLocalNow: () => Date.now() + harness.localAheadMs,
}));

const LOCAL_AHEAD_MS = harness.localAheadMs;
const SCREEN_ID = "22222222-2222-4222-8222-22222222222a";
const SCREEN_B_ID = "22222222-2222-4222-8222-22222222222b";
// Seed ids of vjDemo.data.ts.
const WARM_UP_PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const NEON_GRID_ID = "00000000-0000-4000-8000-0000000000c1";
const WARM_HAZE_ID = "00000000-0000-4000-8000-0000000000c2";
const FRIDAY_SET_ID = "00000000-0000-4000-8000-0000000000b1";

interface VjTabRecorder {
  tabId: string;
  frames: VjServerFrame[];
}

interface VjFlowTab extends VjTabRecorder {
  hook: RenderHookResult<VjStageController, unknown>;
}

let hub = createVjDemoChannelHub();
let storeChannel: VjDemoChannel = hub.open();
let recorders: VjTabRecorder[] = [];
let mountedTabs: VjFlowTab[] = [];

/** A Web Lock stand-in: the first request hosts at once; a request while it
 *  is held is dropped, and a release lets the next request host. */
function createGrantFirstLock(): VjDemoLockSeam {
  let isHeld = false;
  return {
    request(onGranted) {
      if (isHeld) return () => undefined;
      isHeld = true;
      onGranted();
      return () => {
        isHeld = false;
      };
    },
  };
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

/** Advances fake time inside act, then lets the hub's queued deliveries run. */
async function flushDemo(milliseconds = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
    for (let round = 0; round < 20; round += 1) await Promise.resolve();
  });
}

/** The demo server reads Date.now(), so server time is the fake wall clock. */
async function advanceToServerTime(serverMs: number) {
  await flushDemo(serverMs - Date.now());
}

function screenAttach(
  screenId: string,
  getRestoreState: () => VjStageRestore | null = () => null,
): VjStageAttach {
  return { role: "screen", screenId, getRestoreState };
}

/** Mounts one tab's useVjStage; the transport it creates is the newest recorder. */
function mountTab(attach: VjStageAttach): VjFlowTab {
  const hook = renderHook(() => useVjStage(attach));
  const recorder = recorders.at(-1);
  if (recorder === undefined) throw new Error("useVjStage opened no transport");
  const tab: VjFlowTab = { ...recorder, hook };
  mountedTabs.push(tab);
  return tab;
}

function stageOf(tab: VjFlowTab): VjStageController {
  return tab.hook.result.current;
}

/** The screen tab first (it hosts), then the remote, both attached. */
async function openStage(): Promise<{ screen: VjFlowTab; remote: VjFlowTab }> {
  const screen = mountTab(screenAttach(SCREEN_ID));
  const remote = mountTab({ role: "remote" });
  // The remote opens after the host's first heartbeat and attaches on the next.
  await flushDemo(VJ_DEMO_HEARTBEAT_MS);
  expect(stageOf(screen).isConnected).toBe(true);
  expect(stageOf(remote).isConnected).toBe(true);
  return { screen, remote };
}

function stageFramesOf(tab: VjFlowTab): VjStageFrame[] {
  return tab.frames.flatMap((frame) =>
    frame.event === "stage:state" ? [frame.payload] : [],
  );
}

function lastStageFrameOf(tab: VjFlowTab): VjStageFrame | undefined {
  return stageFramesOf(tab).at(-1);
}

/** Sends from a tab's commands and lets the ack and the frames behind it land. */
async function sendFrom<Outcome>(
  tab: VjFlowTab,
  send: (commands: VjStageCommands) => Promise<Outcome>,
): Promise<Outcome> {
  const outcome = await act(() => send(stageOf(tab).commands));
  await flushDemo();
  return outcome;
}

/** Sends a command that must change the stage; answers its applyAt. */
async function applyAtOfAccepted(
  tab: VjFlowTab,
  send: (commands: VjStageCommands) => ReturnType<VjStageCommands["goClip"]>,
): Promise<number | null> {
  const outcome = await sendFrom(tab, send);
  expect(outcome).toMatchObject({ ok: true, isNoop: false });
  return outcome.ok ? outcome.applyAt : null;
}

/** The bar a quantized change sent at `sentAt` lands on (C 7.4). */
function nextBarAt(tempo: VjTempo, sentAt: number): number {
  return vjNextBoundaryAt(tempo, "bar", sentAt + VJ_LIMITS.quantizeMinLeadMs);
}

/** What a screen keeps to seed a stage the server lost (C 7.13). */
function restoreOf(state: VjStageState): VjStageRestore {
  return {
    stageEpoch: state.stageEpoch,
    revision: state.revision,
    activePackId: state.activePackId,
    liveClipId: state.liveClipId,
    liveGeneratorId: state.liveGeneratorId,
    liveGeneratorVariant: state.liveGeneratorVariant,
    transition: state.transition,
    overlay: state.overlay,
    countdown: state.countdown,
    logo: state.logo,
    eventCard: state.eventCard,
    effects: state.effects,
    mix: state.mix,
    tempo: state.tempo,
    shuffle: state.shuffle,
    activeSetlistId: state.activeSetlistId,
    setlistIndex: state.setlistIndex,
    setlistPlayback: state.setlistPlayback,
  };
}

/** Every message on the hub, both directions. */
function spyOnHub() {
  const messages: VjDemoMessage[] = [];
  const channel = hub.open();
  channel.subscribe((message) => messages.push(message));
  const indexOfFirst = (tabId: string, name: string) =>
    messages.findIndex(
      (message) =>
        message.direction === "toServer" &&
        message.tabId === tabId &&
        message.name === name,
    );
  return { messages, indexOfFirst, close: () => channel.close() };
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
    ],
  });
  hub = createVjDemoChannelHub();
  storeChannel = hub.open();
  configureVjDemoStore({
    storage: createMemoryStorage(),
    channel: storeChannel,
    now: () => Date.now(),
  });
  recorders = [];
  mountedTabs = [];
  const lock = createGrantFirstLock();
  harness.factory = (options) => {
    const { isDemoMode, ...transportOptions } = options as CapturedOptions;
    expect(isDemoMode).toBe(true);
    const recorder: VjTabRecorder = {
      tabId: `${transportOptions.role}-tab-${recorders.length + 1}`,
      frames: [],
    };
    recorders.push(recorder);
    return new VjDemoTransport({
      ...transportOptions,
      tabId: recorder.tabId,
      onFrame: (frame) => {
        recorder.frames.push(frame);
        transportOptions.onFrame(frame);
      },
      channelFactory: () => hub.open(),
      lock,
    });
  };
});

afterEach(() => {
  for (const tab of mountedTabs.splice(0)) tab.hook.unmount();
  harness.factory = null;
  storeChannel.close();
  configureVjDemoStore({});
  vi.useRealTimers();
});

describe("VJ demo flow: attach and clock sync", () => {
  it("attaches a screen and a remote on contract version 2 with synced clocks", async () => {
    const spy = spyOnHub();
    const { screen, remote } = await openStage();

    const attachPayloads = spy.messages
      .filter(
        (message) =>
          message.direction === "toServer" && message.name === "vj:attach",
      )
      .map((message) => message.payload);
    expect(attachPayloads).toEqual([
      {
        role: "screen",
        contractVersion: VJ_CONTRACT_VERSION,
        screenId: SCREEN_ID,
        restoreState: null,
      },
      { role: "remote", contractVersion: VJ_CONTRACT_VERSION },
    ]);
    expect(VJ_CONTRACT_VERSION).toBe(2);
    // C 7.3: each tab samples the server clock before it attaches.
    for (const tab of [screen, remote]) {
      const firstSync = spy.indexOfFirst(tab.tabId, "clock:sync");
      expect(firstSync).toBeGreaterThanOrEqual(0);
      expect(firstSync).toBeLessThan(spy.indexOfFirst(tab.tabId, "vj:attach"));
    }

    expect(stageOf(screen).isLead).toBe(true);
    expect(stageOf(screen).screenNumber).toBe(1);
    expect(stageOf(remote).screenNumber).toBeNull();
    expect(stageOf(remote).screens).toMatchObject([
      { screenId: SCREEN_ID, number: 1, isConnected: true, isLead: true },
    ]);
    for (const tab of [screen, remote]) {
      const stage = stageOf(tab);
      expect(stage.isClockSynced).toBe(true);
      expect(stage.clockOffsetMs).toBe(-LOCAL_AHEAD_MS);
      expect(stage.serverNow()).toBe(Date.now());
      expect(stage.toLocalTime(Date.now())).toBe(Date.now() + LOCAL_AHEAD_MS);
      expect(stage.state).toMatchObject({ revision: 0, liveClipId: null });
    }
    expect(stageOf(remote).state?.stageEpoch).toBe(
      stageOf(screen).state?.stageEpoch,
    );
    spy.close();
  });
});

describe("VJ demo flow: a quantized clip", () => {
  it("lands goClip on the next bar on both tabs while the remote controls show it at once", async () => {
    const { screen, remote } = await openStage();
    const packApplyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.setPack(WARM_UP_PACK_ID),
    );
    // A pack change alone shows nothing new, so it never waits for the grid.
    expect(packApplyAt).toBeNull();
    expect(stageOf(screen).state?.activePackId).toBe(WARM_UP_PACK_ID);
    await applyAtOfAccepted(remote, (commands) =>
      commands.setTempo({ quantize: "bar" }),
    );
    const tempo = stageOf(remote).latestState?.tempo;
    expect(tempo?.quantize).toBe("bar");

    const sentAt = Date.now();
    const applyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.goClip(NEON_GRID_ID),
    );
    expect(applyAt).toBe(tempo === undefined ? null : nextBarAt(tempo, sentAt));
    if (applyAt === null) return;
    expect(applyAt).toBeGreaterThanOrEqual(
      sentAt + VJ_LIMITS.quantizeMinLeadMs,
    );

    for (const tab of [screen, remote]) {
      expect(lastStageFrameOf(tab)).toMatchObject({
        cause: "command",
        sourceClientId: stageOf(remote).clientId,
        applyAt,
        state: { liveClipId: NEON_GRID_ID },
      });
      expect(stageOf(tab).latestState?.liveClipId).toBe(NEON_GRID_ID);
      expect(stageOf(tab).state?.liveClipId).toBeNull();
      expect(stageOf(tab).upcoming).toMatchObject({
        applyAt,
        state: { liveClipId: NEON_GRID_ID },
      });
    }

    await advanceToServerTime(applyAt - 1);
    expect(stageOf(screen).state?.liveClipId).toBeNull();
    expect(stageOf(remote).state?.liveClipId).toBeNull();

    await advanceToServerTime(applyAt);
    for (const tab of [screen, remote]) {
      const stage = stageOf(tab);
      expect(stage.state?.liveClipId).toBe(NEON_GRID_ID);
      expect(stage.state?.liveSince).toBe(applyAt);
      expect(stage.lastCause).toBe("command");
      expect(stage.upcoming).toBeNull();
    }
    expect(stageOf(screen).state?.revision).toBe(
      stageOf(remote).state?.revision,
    );
  });
});

describe("VJ demo flow: effect pads and the strobe", () => {
  it("turns an effect pad on and off on both tabs", async () => {
    const { screen, remote } = await openStage();
    const onApplyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.setEffects({ settings: { tint: { isOn: true } } }),
    );
    expect(onApplyAt).toBeNull();
    for (const tab of [screen, remote]) {
      const effects = stageOf(tab).state?.effects;
      expect(effects && vjEffectSettingOf(effects, "tint").isOn).toBe(true);
    }

    const offApplyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.setEffects({ settings: { tint: null } }),
    );
    expect(offApplyAt).toBeNull();
    for (const tab of [screen, remote]) {
      const effects = stageOf(tab).state?.effects;
      expect(effects && vjEffectSettingOf(effects, "tint").isOn).toBe(false);
      expect(effects?.settings.tint).toBeUndefined();
      expect(lastStageFrameOf(tab)?.applyAt).toBeNull();
    }
  });

  it("lands the strobe's 10 s cap at once while a quantized clip still waits", async () => {
    const { screen, remote } = await openStage();
    await applyAtOfAccepted(remote, (commands) =>
      commands.setPack(WARM_UP_PACK_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setTempo({ quantize: "bar" }),
    );
    const strobeApplyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.setStrobe(true),
    );
    expect(strobeApplyAt).toBeNull();
    expect(stageOf(screen).state?.effects.isStrobing).toBe(true);
    const strobeStartedAt = stageOf(screen).state?.effects.strobeStartedAt;
    expect(strobeStartedAt).toBe(Date.now());
    if (strobeStartedAt === null || strobeStartedAt === undefined) return;
    const strobeEndsAt = strobeStartedAt + VJ_LIMITS.strobeMaxDurationMs;

    await advanceToServerTime(strobeEndsAt - 100);
    expect(stageOf(screen).state?.effects.isStrobing).toBe(true);
    const clipApplyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.goClip(NEON_GRID_ID),
    );
    expect(clipApplyAt).toBeGreaterThan(strobeEndsAt);
    expect(stageOf(remote).upcoming?.applyAt).toBe(clipApplyAt);
    expect(stageOf(remote).state?.liveClipId).toBeNull();

    await advanceToServerTime(strobeEndsAt);
    expect(Date.now()).toBeLessThan(clipApplyAt ?? 0);
    for (const tab of [screen, remote]) {
      expect(lastStageFrameOf(tab)).toMatchObject({
        cause: "strobe_timeout",
        sourceClientId: null,
        applyAt: null,
        state: {
          liveClipId: NEON_GRID_ID,
          effects: { isStrobing: false, strobeStartedAt: null },
        },
      });
      const stage = stageOf(tab);
      // The timeout carries the waiting clip with it, so nothing waits now.
      expect(stage.lastCause).toBe("strobe_timeout");
      expect(stage.state?.effects.isStrobing).toBe(false);
      expect(stage.state?.liveClipId).toBe(NEON_GRID_ID);
      expect(stage.upcoming).toBeNull();
    }
  });
});

describe("VJ demo flow: scenes and set lists", () => {
  it("saves a scene in the library and recalls it on the next bar", async () => {
    const { screen, remote } = await openStage();
    const heardChanges: VjLibraryChange[] = [];
    const unsubscribe = stageOf(remote).subscribeLibrary((change) =>
      heardChanges.push(change),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setPack(WARM_UP_PACK_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.goClip(NEON_GRID_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setEffects({ settings: { tint: { isOn: true, amount: 0.8 } } }),
    );
    const savedState = stageOf(remote).latestState;
    expect(savedState?.liveClipId).toBe(NEON_GRID_ID);
    if (savedState === null) return;
    const scene = demoCreateVjScene({
      name: "Neon tint",
      packId: WARM_UP_PACK_ID,
      look: vjSceneLookOf(savedState),
    });
    await flushDemo();
    expect(heardChanges).toContainEqual(
      expect.objectContaining({ kind: "scene_created", sceneId: scene.id }),
    );

    await applyAtOfAccepted(remote, (commands) =>
      commands.goClip(WARM_HAZE_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setEffects({ settings: { tint: null } }),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setTempo({ quantize: "bar" }),
    );
    const tempo = stageOf(remote).latestState?.tempo;
    const sentAt = Date.now();
    const applyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.recallScene(scene.id),
    );
    expect(applyAt).toBe(tempo === undefined ? null : nextBarAt(tempo, sentAt));
    if (applyAt === null) return;
    expect(stageOf(remote).latestState?.liveClipId).toBe(NEON_GRID_ID);
    expect(lastStageFrameOf(screen)?.applyAt).toBe(applyAt);
    expect(lastStageFrameOf(remote)?.applyAt).toBe(applyAt);
    expect(stageOf(screen).state?.liveClipId).toBe(WARM_HAZE_ID);

    await advanceToServerTime(applyAt);
    for (const tab of [screen, remote]) {
      const state = stageOf(tab).state;
      expect(state?.liveClipId).toBe(NEON_GRID_ID);
      expect(state?.effects.settings.tint).toMatchObject({
        isOn: true,
        amount: 0.8,
      });
    }
    unsubscribe();
  });

  it("recalls Warm up from Friday set, then Next lands Peak on the next bar", async () => {
    const { screen, remote } = await openStage();
    const selectApplyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.setlistSelect(FRIDAY_SET_ID, 0),
    );
    expect(selectApplyAt).toBeNull();
    expect(stageOf(screen).state).toMatchObject({
      activeSetlistId: FRIDAY_SET_ID,
      setlistIndex: 0,
      liveClipId: WARM_HAZE_ID,
      effects: { settings: { tint: { isOn: true, variant: "coral" } } },
    });

    await applyAtOfAccepted(remote, (commands) =>
      commands.setTempo({ quantize: "bar" }),
    );
    const tempo = stageOf(remote).latestState?.tempo;
    const sentAt = Date.now();
    const applyAt = await applyAtOfAccepted(remote, (commands) =>
      commands.setlistNext({ isFlashConfirmed: true }),
    );
    expect(applyAt).toBe(tempo === undefined ? null : nextBarAt(tempo, sentAt));
    if (applyAt === null) return;
    expect(stageOf(remote).latestState).toMatchObject({
      setlistIndex: 1,
      liveClipId: null,
      liveGeneratorId: "prideFlagWave",
      liveGeneratorVariant: "rainbow",
    });
    expect(stageOf(remote).state?.liveClipId).toBe(WARM_HAZE_ID);
    expect(lastStageFrameOf(screen)?.applyAt).toBe(applyAt);

    await advanceToServerTime(applyAt);
    for (const tab of [screen, remote]) {
      expect(stageOf(tab).state).toMatchObject({
        setlistIndex: 1,
        liveClipId: null,
        liveGeneratorId: "prideFlagWave",
        effects: {
          settings: {
            kaleidoscope: { isOn: true, variant: "6" },
            beatPulse: { isOn: true },
          },
        },
      });
      expect(stageOf(tab).state?.effects.settings.tint).toBeUndefined();
    }
  });
});

describe("VJ demo flow: screens and the library", () => {
  it("identify reaches the named screen tab only", async () => {
    const screen = mountTab(screenAttach(SCREEN_ID));
    const screenB = mountTab(screenAttach(SCREEN_B_ID));
    const remote = mountTab({ role: "remote" });
    await flushDemo(VJ_DEMO_HEARTBEAT_MS);
    expect(stageOf(screenB).screenNumber).toBe(2);
    const heard = new Map<string, VjScreenIdentifyFrame[]>();
    for (const tab of [screen, screenB, remote]) {
      const frames: VjScreenIdentifyFrame[] = [];
      heard.set(tab.tabId, frames);
      stageOf(tab).subscribeIdentify((frame) => frames.push(frame));
    }

    const everyScreen = await sendFrom(remote, (commands) =>
      commands.identifyScreen(null),
    );
    expect(everyScreen).toEqual({ ok: true, identifiedCount: 2 });
    const durationMs = VJ_LIMITS.identifyDurationMs;
    expect(heard.get(screen.tabId)).toEqual([{ number: 1, durationMs }]);
    expect(heard.get(screenB.tabId)).toEqual([{ number: 2, durationMs }]);

    const screenTwo = await sendFrom(remote, (commands) =>
      commands.identifyScreen(SCREEN_B_ID),
    );
    expect(screenTwo).toEqual({ ok: true, identifiedCount: 1 });
    expect(heard.get(screen.tabId)).toHaveLength(1);
    expect(heard.get(screenB.tabId)).toEqual([
      { number: 2, durationMs },
      { number: 2, durationMs },
    ]);
    expect(heard.get(remote.tabId)).toEqual([]);
    expect(
      remote.frames.some((frame) => frame.event === "screen:identify"),
    ).toBe(false);
  });

  it("deleting the live clip in the library clears it from both tabs", async () => {
    const { screen, remote } = await openStage();
    await applyAtOfAccepted(remote, (commands) =>
      commands.setPack(WARM_UP_PACK_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.goClip(NEON_GRID_ID),
    );
    expect(stageOf(screen).state?.liveClipId).toBe(NEON_GRID_ID);
    const heardChanges: VjLibraryChange[] = [];
    const unsubscribe = stageOf(screen).subscribeLibrary((change) =>
      heardChanges.push(change),
    );

    demoDeleteVjClip(NEON_GRID_ID);
    await flushDemo();

    expect(heardChanges).toContainEqual(
      expect.objectContaining({ kind: "clip_deleted", clipId: NEON_GRID_ID }),
    );
    for (const tab of [screen, remote]) {
      expect(lastStageFrameOf(tab)).toMatchObject({
        cause: "library",
        applyAt: null,
        state: { liveClipId: null, liveSince: null },
      });
      expect(stageOf(tab).state?.liveClipId).toBeNull();
      expect(stageOf(tab).lastCause).toBe("library");
    }
    unsubscribe();
  });

  it("shows the event card for Warm-up and hides it when the pack is unlinked", async () => {
    const { screen, remote } = await openStage();
    await applyAtOfAccepted(remote, (commands) =>
      commands.setPack(WARM_UP_PACK_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setEventCard({ isVisible: true }),
    );
    expect(stageOf(screen).state?.eventCard.isVisible).toBe(true);

    demoSetVjPackEvent(WARM_UP_PACK_ID, { eventId: null });
    await flushDemo();

    for (const tab of [screen, remote]) {
      expect(stageOf(tab).state?.eventCard.isVisible).toBe(false);
      expect(stageOf(tab).lastCause).toBe("library");
    }
  });
});

describe("VJ demo flow: show timers, reset and reload", () => {
  it("hides a countdown 10 s after zero and keeps its target", async () => {
    const { screen, remote } = await openStage();
    await applyAtOfAccepted(remote, (commands) =>
      commands.setCountdown({ isVisible: true, durationMs: 5_000 }),
    );
    const targetAt = stageOf(screen).state?.countdown.targetAt;
    expect(targetAt).toBe(Date.now() + 5_000);
    if (targetAt === null || targetAt === undefined) return;
    const hidesAt = targetAt + VJ_LIMITS.countdownHoldMs;

    await advanceToServerTime(hidesAt - 1);
    expect(stageOf(screen).state?.countdown.isVisible).toBe(true);
    await advanceToServerTime(hidesAt);
    expect(stageOf(screen).state?.countdown).toMatchObject({
      isVisible: false,
      targetAt,
    });
    expect(stageOf(screen).lastCause).toBe("countdown_end");
  });

  it("reset look clears the effects and keeps blackout", async () => {
    const { screen, remote } = await openStage();
    await applyAtOfAccepted(remote, (commands) =>
      commands.setEffects({
        isBlackout: true,
        settings: { tint: { isOn: true } },
      }),
    );
    await applyAtOfAccepted(remote, (commands) => commands.resetLook());
    expect(stageOf(screen).state?.effects).toMatchObject({
      isBlackout: true,
      settings: {},
    });
  });

  it("a reloaded screen restores the stage through restoreVjDemoStage", async () => {
    const { screen, remote } = await openStage();
    await applyAtOfAccepted(remote, (commands) =>
      commands.setPack(WARM_UP_PACK_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.goClip(NEON_GRID_ID),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setEffects({ settings: { tint: { isOn: true } } }),
    );
    await applyAtOfAccepted(remote, (commands) =>
      commands.setTempo({ bpm: 128 }),
    );
    const before = stageOf(screen).state;
    if (before === null) throw new Error("the screen never applied a state");
    const restore = restoreOf(before);

    // The screen tab hosts, so its reload takes the stage down with it.
    screen.hook.unmount();
    const reloadedAt = Date.now();
    const reloaded = mountTab(screenAttach(SCREEN_ID, () => restore));
    await flushDemo();

    const connection = stageOf(reloaded).connection;
    expect(connection).toMatchObject({
      status: "attached",
      attach: { isRestored: true, isLead: true, screenNumber: 1 },
    });
    const stageEpoch = connection.attach?.stageEpoch ?? "";
    expect(stageEpoch).not.toBe(before.stageEpoch);
    const expected = canonicalVjStageState(
      restoreVjDemoStage(
        createVjStageState(stageEpoch, reloadedAt),
        restore,
        vjDemoLibraryLookup,
        reloadedAt,
      ),
    );
    expect(stageOf(reloaded).state).toEqual(expected);
    expect(stageOf(reloaded).lastCause).toBe("restore");
    expect(expected).toMatchObject({
      revision: 1,
      clipSequence: 1,
      activePackId: WARM_UP_PACK_ID,
      liveClipId: NEON_GRID_ID,
      recentClipIds: [NEON_GRID_ID],
      tempo: { bpm: 128 },
      effects: { settings: { tint: { isOn: true } } },
    });

    // The remote hears the new host, attaches again and follows the restore.
    expect(stageOf(remote).isConnected).toBe(true);
    expect(stageOf(remote).state).toMatchObject({
      stageEpoch,
      revision: 1,
      liveClipId: NEON_GRID_ID,
    });
  });
});
