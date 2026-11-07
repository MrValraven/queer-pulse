import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  VJ_LIMITS,
  type VjAttachSuccess,
  type VjScreenStatusPayload,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { vjLocalNow } from "../realtime/vjClockSync";
import type {
  VjAckFor,
  VjClientFrameName,
  VjClientPayload,
} from "../realtime/vjFrames";
import type {
  VjConnectionState,
  VjTransport,
  VjTransportOptions,
} from "../realtime/vjTransport";
import { VJ_CONNECTION_REFUSAL_KEY } from "../vjErrors";
import { useVjStage } from "./useVjStage";

type CapturedOptions = VjTransportOptions & { isDemoMode: boolean };

const harness = vi.hoisted(() => ({
  isDemoMode: false,
  factory: null as null | ((options: unknown) => unknown),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: harness.isDemoMode }),
}));
vi.mock("../realtime/createVjTransport", () => ({
  createVjTransport: (options: unknown) => {
    if (harness.factory === null) throw new Error("no transport factory");
    return harness.factory(options);
  },
}));

const EPOCH_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SCREEN_ID = "22222222-2222-4222-8222-22222222222a";
const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const SERVER_AHEAD_MS = 10_000;

interface FakeTransport extends VjTransport {
  options: CapturedOptions;
  sent: { name: VjClientFrameName; payload: unknown }[];
  statuses: VjScreenStatusPayload[];
  /** Answers for the next sends, in order. */
  answers: unknown[];
}

let fakeTransports: FakeTransport[] = [];

function createFakeTransport(options: CapturedOptions): FakeTransport {
  const fake: FakeTransport = {
    options,
    sent: [],
    statuses: [],
    answers: [],
    connect() {},
    send<Name extends VjClientFrameName>(
      name: Name,
      payload: VjClientPayload<Name>,
    ): Promise<VjAckFor<Name>> {
      fake.sent.push({ name, payload });
      const answer = fake.answers.shift() ?? {
        ok: true,
        serverNow: 0,
        revision: fake.sent.length,
        isNoop: false,
        applyAt: null,
      };
      return Promise.resolve(answer as VjAckFor<Name>);
    },
    sendScreenStatus(payload) {
      fake.statuses.push(payload);
    },
    dispose() {},
  };
  fakeTransports.push(fake);
  return fake;
}

function lastTransport(): FakeTransport {
  const transport = fakeTransports.at(-1);
  if (transport === undefined) throw new Error("no transport built");
  return transport;
}

function stateAt(revision: number): VjStageState {
  return { ...createVjStageState(EPOCH_A, 0), revision };
}

function reportConnection(transport: FakeTransport, next: VjConnectionState) {
  act(() => transport.options.onConnection(next));
}

function attachTransport(
  transport: FakeTransport,
  overrides: Partial<VjAttachSuccess> = {},
) {
  reportConnection(transport, {
    status: "attached",
    refusal: null,
    attach: {
      role: "remote",
      connectionExpiresAt: 0,
      stageEpoch: EPOCH_A,
      isRestored: false,
      isLead: null,
      screenNumber: null,
      ...overrides,
    },
  });
}

function pushFrame(
  transport: FakeTransport,
  state: VjStageState,
  applyAt: number | null,
) {
  act(() =>
    transport.options.onFrame({
      event: "stage:state",
      payload: { state, cause: "command", sourceClientId: null, applyAt },
    }),
  );
}

/** One clock:sync answer whose server clock runs `aheadMs` past this device. */
function feedClockSample(transport: FakeTransport, aheadMs: number) {
  const localNow = vjLocalNow();
  act(() =>
    transport.options.onClockSample?.({
      sentAt: localNow,
      receivedAt: localNow,
      serverNow: localNow + aheadMs,
    }),
  );
}

function advanceTime(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

function renderSyncedRemote() {
  const rendered = renderHook(() => useVjStage({ role: "remote" }));
  const transport = lastTransport();
  attachTransport(transport);
  feedClockSample(transport, SERVER_AHEAD_MS);
  pushFrame(transport, stateAt(1), null);
  return { ...rendered, transport };
}

function renderScreen() {
  const rendered = renderHook(() =>
    useVjStage({
      role: "screen",
      screenId: SCREEN_ID,
      getRestoreState: () => null,
    }),
  );
  return { ...rendered, transport: lastTransport() };
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "Date", "performance"],
  });
  fakeTransports = [];
  harness.isDemoMode = false;
  harness.factory = (options) =>
    createFakeTransport(options as CapturedOptions);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useVjStage client queue (C 7.4)", () => {
  it("state waits for applyAt while latestState shows the new state at once", () => {
    const { result, transport } = renderSyncedRemote();
    const applyAt = result.current.serverNow() + 500;

    pushFrame(transport, stateAt(2), applyAt);
    expect(result.current.state?.revision).toBe(1);
    expect(result.current.latestState?.revision).toBe(2);

    advanceTime(499);
    expect(result.current.state?.revision).toBe(1);

    advanceTime(2);
    expect(result.current.state?.revision).toBe(2);
    expect(result.current.lastCause).toBe("command");
  });

  it("upcoming names the earliest waiting frame and clears when it applies", () => {
    const { result, transport } = renderSyncedRemote();
    const serverNow = result.current.serverNow();

    pushFrame(transport, stateAt(2), serverNow + 300);
    pushFrame(transport, stateAt(3), serverNow + 600);
    expect(result.current.upcoming).toEqual({
      state: stateAt(2),
      applyAt: serverNow + 300,
    });

    advanceTime(301);
    expect(result.current.state?.revision).toBe(2);
    expect(result.current.upcoming?.state.revision).toBe(3);

    advanceTime(300);
    expect(result.current.state?.revision).toBe(3);
    expect(result.current.upcoming).toBeNull();
  });

  it("a frame without applyAt flushes the waiting ones", () => {
    const { result, transport } = renderSyncedRemote();

    pushFrame(transport, stateAt(2), result.current.serverNow() + 500);
    pushFrame(transport, stateAt(3), null);
    expect(result.current.state?.revision).toBe(3);
    expect(result.current.upcoming).toBeNull();

    advanceTime(600);
    expect(result.current.state?.revision).toBe(3);
  });

  it("an ack snap waits behind a queued frame", async () => {
    const { result, transport } = renderSyncedRemote();
    pushFrame(transport, stateAt(2), result.current.serverNow() + 500);
    transport.answers.push({
      ok: false,
      code: "vj_stale_command",
      message: "stale",
      state: stateAt(3),
      serverNow: 0,
    });

    const outcome = await act(() => result.current.commands.goClip(CLIP_GRID));

    expect(outcome).toMatchObject({ ok: false, errorKey: null });
    expect(result.current.state?.revision).toBe(1);
    expect(result.current.latestState?.revision).toBe(3);
    expect(result.current.upcoming?.state.revision).toBe(2);

    advanceTime(501);
    expect(result.current.state?.revision).toBe(3);
    expect(result.current.lastCause).toBeNull();
    expect(result.current.upcoming).toBeNull();
  });

  it("a refusal's newer state waits for its revision's frame and lands on that frame's applyAt", async () => {
    const { result, transport } = renderSyncedRemote();
    transport.answers.push({
      ok: false,
      code: "vj_stale_clip_sequence",
      message: "stale",
      state: stateAt(2),
      serverNow: 0,
    });

    await act(() => result.current.commands.goClip(CLIP_GRID));
    expect(result.current.state?.revision).toBe(1);
    expect(result.current.latestState?.revision).toBe(2);

    const applyAt = result.current.serverNow() + 500;
    pushFrame(transport, stateAt(2), applyAt);
    advanceTime(VJ_LIMITS.quantizeMinLeadMs + 1);
    expect(result.current.state?.revision).toBe(1);

    advanceTime(500 - VJ_LIMITS.quantizeMinLeadMs);
    expect(result.current.state?.revision).toBe(2);
    expect(result.current.lastCause).toBe("command");
    expect(result.current.upcoming).toBeNull();
  });

  it("a refusal's newer state applies on its own once the shortest quantize lead passes", async () => {
    const { result, transport } = renderSyncedRemote();
    transport.answers.push({
      ok: false,
      code: "vj_stale_command",
      message: "stale",
      state: stateAt(2),
      serverNow: 0,
    });

    await act(() => result.current.commands.goClip(CLIP_GRID));
    advanceTime(VJ_LIMITS.quantizeMinLeadMs - 1);
    expect(result.current.state?.revision).toBe(1);

    advanceTime(2);
    expect(result.current.state?.revision).toBe(2);
    expect(result.current.lastCause).toBeNull();
  });

  it("a new transport clears the queue and keeps the clock", () => {
    const { result, transport, rerender } = renderSyncedRemote();
    pushFrame(transport, stateAt(2), result.current.serverNow() + 500);

    harness.isDemoMode = true;
    rerender();

    expect(fakeTransports).toHaveLength(2);
    expect(result.current.state).toBeNull();
    expect(result.current.upcoming).toBeNull();
    expect(result.current.clockOffsetMs).toBeCloseTo(SERVER_AHEAD_MS, 2);
    expect(result.current.isClockSynced).toBe(true);
  });
});

describe("useVjStage synced clock", () => {
  it("feeds every ack sample into the clock and exposes serverNow, toLocalTime and isClockSynced", () => {
    const { result } = renderHook(() => useVjStage({ role: "remote" }));
    const transport = lastTransport();
    expect(transport.options.onClockSample).toBeTypeOf("function");
    expect(result.current.isClockSynced).toBe(false);
    expect(result.current.clockOffsetMs).toBeNull();

    feedClockSample(transport, SERVER_AHEAD_MS);

    expect(result.current.isClockSynced).toBe(true);
    expect(result.current.clockOffsetMs).toBeCloseTo(SERVER_AHEAD_MS, 2);
    expect(result.current.clock.offsetMs()).toBeCloseTo(SERVER_AHEAD_MS, 2);
    expect(result.current.serverNow()).toBeCloseTo(
      vjLocalNow() + SERVER_AHEAD_MS,
      2,
    );
    expect(result.current.toLocalTime(50_000)).toBeCloseTo(
      50_000 - SERVER_AHEAD_MS,
      2,
    );
  });

  it("an offset nudge under the notify threshold keeps the controller object", () => {
    const { result, rerender } = renderHook(() =>
      useVjStage({ role: "remote" }),
    );
    const transport = lastTransport();
    feedClockSample(transport, SERVER_AHEAD_MS);
    const controller = result.current;

    // Two samples 6 ms apart: the target is 3 ms away and the offset slews 1.5 ms.
    feedClockSample(transport, SERVER_AHEAD_MS + 6);
    rerender();

    expect(result.current.clock.offsetMs()).toBeCloseTo(
      SERVER_AHEAD_MS + 1.5,
      2,
    );
    expect(result.current.clockOffsetMs).toBeCloseTo(SERVER_AHEAD_MS, 2);
    expect(result.current).toBe(controller);
  });

  it("seedClockOffset sets clockOffsetMs before any sample", () => {
    const { result } = renderHook(() => useVjStage({ role: "remote" }));
    const transport = lastTransport();

    act(() => result.current.seedClockOffset(2_500));
    expect(result.current.clockOffsetMs).toBe(2_500);
    expect(result.current.isClockSynced).toBe(false);

    feedClockSample(transport, 7_000);
    expect(result.current.clockOffsetMs).toBeCloseTo(7_000, 2);
    expect(result.current.isClockSynced).toBe(true);
  });
});

describe("useVjStage v2 attach, identify and status", () => {
  it("attach payloads carry contractVersion 2 for both roles", () => {
    renderHook(() => useVjStage({ role: "remote" }));
    expect(lastTransport().options.buildAttachPayload()).toEqual({
      role: "remote",
      contractVersion: 2,
    });

    renderScreen();
    expect(lastTransport().options.buildAttachPayload()).toEqual({
      role: "screen",
      contractVersion: 2,
      screenId: SCREEN_ID,
      restoreState: null,
    });
  });

  it("screenNumber follows the attach ack and clears on detach", () => {
    const { result, transport } = renderScreen();
    expect(result.current.screenNumber).toBeNull();

    attachTransport(transport, {
      role: "screen",
      isLead: true,
      screenNumber: 2,
    });
    expect(result.current.screenNumber).toBe(2);

    reportConnection(transport, {
      status: "reconnecting",
      refusal: null,
      attach: null,
    });
    expect(result.current.screenNumber).toBeNull();

    attachTransport(transport, {
      role: "screen",
      isLead: false,
      screenNumber: 3,
    });
    expect(result.current.screenNumber).toBe(3);
  });

  it("identify listeners hear screen:identify", () => {
    const { result, transport } = renderScreen();
    attachTransport(transport, {
      role: "screen",
      isLead: true,
      screenNumber: 2,
    });
    const listener = vi.fn();
    const unsubscribe = result.current.subscribeIdentify(listener);
    const frame = { number: 2, durationMs: 3_000 };

    act(() =>
      transport.options.onFrame({ event: "screen:identify", payload: frame }),
    );
    expect(listener).toHaveBeenCalledWith(frame);

    unsubscribe();
    act(() =>
      transport.options.onFrame({ event: "screen:identify", payload: frame }),
    );
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("sendStatus forwards health, nextClipId and mic", () => {
    const { result, transport } = renderScreen();
    attachTransport(transport, {
      role: "screen",
      isLead: true,
      screenNumber: 1,
    });
    const status: VjScreenStatusPayload = {
      isFullscreen: true,
      preload: { packId: PACK_WARM, clips: [] },
      health: {
        renderer: "webgl2",
        fps: 59.8,
        droppedFrames: 3,
        cacheBytes: 1_024,
        isEffectLoadHigh: false,
      },
      nextClipId: CLIP_HAZE,
      mic: { level: 0.4, bpm: 124, confidence: 0.8, beatAt: 1_000 },
    };

    result.current.sendStatus(status);

    expect(transport.statuses).toEqual([status]);
  });

  it("a client_outdated refusal answers every command offline with its key", async () => {
    const { result, transport } = renderScreen();
    reportConnection(transport, {
      status: "refused",
      refusal: "client_outdated",
      attach: null,
    });
    const offline = {
      ok: false,
      code: "offline",
      errorKey: VJ_CONNECTION_REFUSAL_KEY.client_outdated,
    };

    expect(result.current.refusal).toBe("client_outdated");
    expect(await result.current.commands.goClip(CLIP_GRID)).toEqual(offline);
    expect(await result.current.commands.setPack(PACK_WARM)).toEqual(offline);
    expect(await result.current.commands.resetLook()).toEqual(offline);
    expect(await result.current.commands.identifyScreen(null)).toEqual(offline);
    expect(await result.current.advance(1, CLIP_GRID)).toEqual(offline);
    expect(transport.sent).toHaveLength(0);
  });
});
