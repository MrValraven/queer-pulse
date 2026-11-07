import type { Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../shared/api/config";
import {
  createVjStageState,
  VJ_CONTRACT_VERSION,
  type VjAttachPayload,
  type VjAttachRole,
  type VjClockSample,
  type VjStageRestore,
} from "../../../shared/contracts/vj";
import {
  VJ_ACK_TIMEOUT_MS,
  VJ_CLOCK_SYNC_BURST_COUNT,
  VJ_CLOCK_SYNC_BURST_SPACING_MS,
  VJ_CLOCK_SYNC_INTERVAL_MS,
  VJ_REAUTH_ACK_TIMEOUT_MS,
  VJ_RECONNECT_BASE_DELAY_MS,
} from "../vj.constants";
import type { VjScreenStatusPayload, VjServerFrame } from "./vjFrames";
import { VjSocketClient, type VjSocketClientOptions } from "./vjSocket";
import type { VjConnectionState } from "./vjTransport";

const apiClientMock = vi.hoisted(() => ({
  mintSocketTicket: vi.fn(),
  refreshSession: vi.fn(),
  readLastRefreshSettlement: vi.fn(),
}));
const loggerMock = vi.hoisted(() => ({
  logWarn: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock("../../../shared/api/client", () => apiClientMock);
vi.mock("../../../shared/api/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/config")>()),
  API_BASE_URL: "https://api.example.test",
  apiAvailable: true,
}));
vi.mock("../../../shared/observability/logger", () => loggerMock);

const START_TIME = new Date("2026-11-05T21:00:00.000Z");
const MINUTE_MS = 60_000;
const SCREEN_ID = "6f1d2c3b-4a5e-4f60-8a71-92b3c4d5e6f7";
/** The fake server's clock runs this far ahead of the test's wall clock. */
const SERVER_AHEAD_MS = 1_500;
const BURST_LENGTH_MS =
  (VJ_CLOCK_SYNC_BURST_COUNT - 1) * VJ_CLOCK_SYNC_BURST_SPACING_MS;
const REMOTE_ATTACH: VjAttachPayload = {
  role: "remote",
  contractVersion: VJ_CONTRACT_VERSION,
};

function serverNowOf(): number {
  return Date.now() + SERVER_AHEAD_MS;
}

type AckResponder = (name: string, payload: unknown) => Promise<unknown>;

interface AckCall {
  name: string;
  payload: unknown;
  timeoutMs: number;
}

function attachAckFor(payload: unknown): Record<string, unknown> {
  const isScreen =
    typeof payload === "object" &&
    payload !== null &&
    (payload as { role?: unknown }).role === "screen";
  return {
    ok: true,
    serverNow: serverNowOf(),
    role: isScreen ? "screen" : "remote",
    connectionExpiresAt: Date.now() + 15 * MINUTE_MS,
    stageEpoch: "epoch-1",
    isRestored: false,
    isLead: isScreen ? true : null,
    screenNumber: isScreen ? 1 : null,
  };
}

const defaultAckResponder: AckResponder = (name, payload) => {
  if (name === "vj:attach") return Promise.resolve(attachAckFor(payload));
  if (name === "session:reauth") {
    return Promise.resolve({
      ok: true,
      exp: Math.floor((Date.now() + 15 * MINUTE_MS) / 1000),
      serverNow: serverNowOf(),
    });
  }
  if (name === "clock:sync") {
    return Promise.resolve({ ok: true, serverNow: serverNowOf() });
  }
  return Promise.resolve({
    ok: true,
    revision: 1,
    isNoop: false,
    applyAt: null,
    serverNow: serverNowOf(),
  });
};

function createFakeSocket() {
  const handlers = new Map<string, Array<(...args: unknown[]) => void>>();
  const fakeSocket = {
    connected: false,
    emits: [] as Array<{ name: string; payload: unknown }>,
    ackCalls: [] as AckCall[],
    ackResponder: defaultAckResponder,
    on: vi.fn((name: string, handler: (...args: unknown[]) => void) => {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    }),
    emit: vi.fn((name: string, payload: unknown) => {
      fakeSocket.emits.push({ name, payload });
    }),
    connect: vi.fn(),
    disconnect: vi.fn(() => {
      if (!fakeSocket.connected) return;
      fakeSocket.connected = false;
      fakeSocket.trigger("disconnect", "io client disconnect");
    }),
    timeout: vi.fn((timeoutMs: number) => ({
      emitWithAck: (name: string, payload: unknown) => {
        fakeSocket.ackCalls.push({ name, payload, timeoutMs });
        return fakeSocket.ackResponder(name, payload);
      },
    })),
    trigger(name: string, ...args: unknown[]) {
      for (const handler of handlers.get(name) ?? []) handler(...args);
    },
    serverConnect() {
      fakeSocket.connected = true;
      fakeSocket.trigger("connect");
    },
    serverDrop(reason: string) {
      fakeSocket.connected = false;
      fakeSocket.trigger("disconnect", reason);
    },
  };
  return fakeSocket;
}

async function flushPromises(): Promise<void> {
  for (let tick = 0; tick < 20; tick += 1) await Promise.resolve();
}

function restoreAt(revision: number): VjStageRestore {
  const state = createVjStageState("epoch-1", START_TIME.getTime());
  return {
    stageEpoch: state.stageEpoch,
    revision,
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
  };
}

function setup(
  buildAttachPayload: () => VjAttachPayload = () => REMOTE_ATTACH,
  role: VjAttachRole = "remote",
  extraOptions: Partial<VjSocketClientOptions> = {},
) {
  const fakeSocket = createFakeSocket();
  const ioFactory = vi.fn(
    (_url: string, _options: object) => fakeSocket as unknown as Socket,
  );
  const frames: VjServerFrame[] = [];
  const connections: VjConnectionState[] = [];
  const attachPayloadBuilder = vi.fn(buildAttachPayload);
  const client = new VjSocketClient({
    role,
    buildAttachPayload: attachPayloadBuilder,
    onFrame: (frame) => frames.push(frame),
    onConnection: (connection) => connections.push(connection),
    loadIo: () => Promise.resolve(ioFactory),
    ...extraOptions,
  });
  return {
    fakeSocket,
    ioFactory,
    frames,
    connections,
    attachPayloadBuilder,
    client,
  };
}

async function connectAndAttach(harness: ReturnType<typeof setup>) {
  harness.client.connect();
  await flushPromises();
  harness.fakeSocket.serverConnect();
  await flushPromises();
}

function callsNamed(
  fakeSocket: ReturnType<typeof createFakeSocket>,
  frameName: string,
) {
  return fakeSocket.ackCalls.filter((call) => call.name === frameName);
}

function attachCallsOf(fakeSocket: ReturnType<typeof createFakeSocket>) {
  return callsNamed(fakeSocket, "vj:attach");
}

function clockSyncCountOf(fakeSocket: ReturnType<typeof createFakeSocket>) {
  return callsNamed(fakeSocket, "clock:sync").length;
}

const GO_CLIP_PAYLOAD = {
  clipId: "clip-1",
  clientId: "client-1",
  commandSequence: 1,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(START_TIME);
  apiClientMock.mintSocketTicket.mockReset();
  apiClientMock.mintSocketTicket.mockResolvedValue({
    ticket: "ticket-1",
    ttlMs: 30_000,
  });
  apiClientMock.refreshSession.mockReset();
  apiClientMock.refreshSession.mockResolvedValue(true);
  apiClientMock.readLastRefreshSettlement.mockReset();
  apiClientMock.readLastRefreshSettlement.mockReturnValue(null);
  loggerMock.logWarn.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("VjSocketClient attach", () => {
  it("attaches as a remote on connect and reports attached", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    expect(harness.ioFactory).toHaveBeenCalledWith(`${API_BASE_URL}/vj`, {
      withCredentials: true,
      transports: ["websocket"],
    });
    expect(attachCallsOf(harness.fakeSocket)).toEqual([
      {
        name: "vj:attach",
        payload: REMOTE_ATTACH,
        timeoutMs: VJ_ACK_TIMEOUT_MS,
      },
    ]);
    expect(harness.connections[0]).toEqual({
      status: "connecting",
      refusal: null,
      attach: null,
    });
    expect(harness.connections.at(-1)).toMatchObject({
      status: "attached",
      refusal: null,
      attach: { role: "remote", stageEpoch: "epoch-1", isLead: null },
    });
  });

  it("builds the attach payload again on every reconnect", async () => {
    const revisions = [3, 4];
    let buildCount = 0;
    const harness = setup(() => {
      const revision = revisions[Math.min(buildCount, 1)] ?? 0;
      buildCount += 1;
      return {
        role: "screen",
        contractVersion: VJ_CONTRACT_VERSION,
        screenId: SCREEN_ID,
        restoreState: restoreAt(revision),
      };
    }, "screen");
    await connectAndAttach(harness);
    harness.fakeSocket.serverDrop("transport close");
    expect(harness.connections.at(-1)?.status).toBe("reconnecting");
    harness.fakeSocket.serverConnect();
    await flushPromises();

    const attachCalls = attachCallsOf(harness.fakeSocket);
    expect(attachCalls).toHaveLength(2);
    expect(attachCalls[0]?.payload).toMatchObject({
      role: "screen",
      screenId: SCREEN_ID,
      restoreState: { revision: 3 },
    });
    expect(attachCalls[1]?.payload).toMatchObject({
      restoreState: { revision: 4 },
    });
    expect(harness.attachPayloadBuilder).toHaveBeenCalledTimes(2);
    expect(harness.connections.at(-1)?.status).toBe("attached");
  });

  it("drops and reconnects with backoff when the attach is rate limited", async () => {
    const harness = setup();
    let attachCount = 0;
    harness.fakeSocket.ackResponder = (name, payload) => {
      if (name !== "vj:attach") return defaultAckResponder(name, payload);
      attachCount += 1;
      if (attachCount > 1) return defaultAckResponder(name, payload);
      return Promise.resolve({
        ok: false,
        code: "vj_rate_limited",
        message: "Too many attaches",
        serverNow: serverNowOf(),
      });
    };
    await connectAndAttach(harness);

    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.connections.at(-1)?.status).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(VJ_RECONNECT_BASE_DELAY_MS - 1);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
  });

  it("refuses not_admin when the attach ack says vj_not_admin", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = () =>
      Promise.resolve({
        ok: false,
        code: "vj_not_admin",
        message: "Admins only",
        serverNow: serverNowOf(),
      });
    await connectAndAttach(harness);

    expect(harness.connections.at(-1)).toEqual({
      status: "refused",
      refusal: "not_admin",
      attach: null,
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalled();
  });
});

describe("VjSocketClient send", () => {
  it("refuses to send while disconnected", async () => {
    const harness = setup();
    await expect(
      harness.client.send("stage:goClip", GO_CLIP_PAYLOAD),
    ).rejects.toMatchObject({ name: "VjSendError", reason: "disconnected" });

    await connectAndAttach(harness);
    harness.fakeSocket.serverDrop("transport close");
    await expect(
      harness.client.send("stage:goClip", GO_CLIP_PAYLOAD),
    ).rejects.toMatchObject({ name: "VjSendError", reason: "disconnected" });
    expect(
      harness.fakeSocket.ackCalls.some((call) => call.name === "stage:goClip"),
    ).toBe(false);
  });

  it("rejects with timeout when the ack is late", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    harness.fakeSocket.ackResponder = () =>
      Promise.reject(new Error("operation has timed out"));

    await expect(
      harness.client.send("stage:goClip", GO_CLIP_PAYLOAD),
    ).rejects.toMatchObject({ name: "VjSendError", reason: "timeout" });
  });

  it("returns the ack of an attached send", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    await expect(
      harness.client.send("stage:goClip", GO_CLIP_PAYLOAD),
    ).resolves.toEqual({
      ok: true,
      revision: 1,
      isNoop: false,
      applyAt: null,
      serverNow: serverNowOf(),
    });
    expect(callsNamed(harness.fakeSocket, "stage:goClip")).toEqual([
      {
        name: "stage:goClip",
        payload: GO_CLIP_PAYLOAD,
        timeoutMs: VJ_ACK_TIMEOUT_MS,
      },
    ]);
  });

  it("sends screen status without an ack only while attached", async () => {
    const harness = setup(
      () => ({
        role: "screen",
        contractVersion: VJ_CONTRACT_VERSION,
        screenId: SCREEN_ID,
        restoreState: null,
      }),
      "screen",
    );
    const statusPayload: VjScreenStatusPayload = {
      isFullscreen: true,
      preload: { packId: null, clips: [] },
    };
    let resolveAttach: (ack: unknown) => void = () => undefined;
    harness.fakeSocket.ackResponder = (name, payload) => {
      if (name !== "vj:attach") return defaultAckResponder(name, payload);
      return new Promise((resolve) => {
        resolveAttach = () => resolve(attachAckFor(payload));
      });
    };

    harness.client.sendScreenStatus(statusPayload);
    await connectAndAttach(harness);
    harness.client.sendScreenStatus(statusPayload);
    expect(harness.fakeSocket.emit).not.toHaveBeenCalled();

    resolveAttach(null);
    await flushPromises();
    harness.client.sendScreenStatus(statusPayload);

    expect(harness.fakeSocket.emit).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.emit).toHaveBeenCalledWith(
      "screen:status",
      statusPayload,
    );
    expect(
      harness.fakeSocket.ackCalls.some((call) => call.name === "screen:status"),
    ).toBe(false);
  });
});

describe("VjSocketClient frames and exceptions", () => {
  it("forwards stage, role, screens and library frames", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    const stageFrame = {
      state: createVjStageState("epoch-1", START_TIME.getTime()),
      cause: "command",
      sourceClientId: "client-1",
    };
    const libraryChange = {
      kind: "clip_created",
      packId: null,
      clipId: "clip-1",
      packIds: [],
    };
    harness.fakeSocket.trigger("stage:state", stageFrame);
    harness.fakeSocket.trigger("screen:role", { isLead: true });
    harness.fakeSocket.trigger("screens:update", { screens: [] });
    harness.fakeSocket.trigger("library:changed", libraryChange);
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "RATE_LIMITED",
      message: "slow down",
    });

    expect(harness.frames).toEqual([
      { event: "stage:state", payload: stageFrame },
      { event: "screen:role", payload: { isLead: true } },
      { event: "screens:update", payload: { screens: [] } },
      { event: "library:changed", payload: libraryChange },
    ]);
    expect(harness.connections.at(-1)?.status).toBe("attached");
  });

  it("stops for good on a vj_not_admin exception", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "FORBIDDEN",
      message: "Admins only",
      domainCode: "vj_not_admin",
    });

    expect(harness.connections.at(-1)).toEqual({
      status: "refused",
      refusal: "not_admin",
      attach: null,
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalled();

    harness.fakeSocket.serverConnect();
    await flushPromises();
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(attachCallsOf(harness.fakeSocket)).toHaveLength(1);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(harness.connections.at(-1)?.status).toBe("refused");
  });

  it("stops for good when another tab replaces this screen", async () => {
    const harness = setup(
      () => ({
        role: "screen",
        contractVersion: VJ_CONTRACT_VERSION,
        screenId: SCREEN_ID,
        restoreState: null,
      }),
      "screen",
    );
    await connectAndAttach(harness);
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "BAD_REQUEST",
      message: "property foo should not exist",
    });
    expect(harness.connections.at(-1)?.status).toBe("attached");

    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "BAD_REQUEST",
      message: "Replaced",
      domainCode: "vj_screen_replaced",
    });

    expect(harness.connections.at(-1)).toEqual({
      status: "refused",
      refusal: "screen_replaced",
      attach: null,
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
  });
});

describe("VjSocketClient reconnect", () => {
  it("refreshes the session after a server drop and reconnects", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    harness.fakeSocket.serverDrop("io server disconnect");
    expect(harness.connections.at(-1)?.status).toBe("reconnecting");

    await vi.advanceTimersByTimeAsync(VJ_RECONNECT_BASE_DELAY_MS - 1);
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();

    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
    harness.fakeSocket.serverConnect();
    await flushPromises();
    expect(attachCallsOf(harness.fakeSocket)).toHaveLength(2);
    expect(harness.connections.at(-1)?.status).toBe("attached");
  });

  it("keeps reconnecting when the refresh fails for the network", async () => {
    const harness = setup();
    apiClientMock.refreshSession.mockResolvedValue(false);
    apiClientMock.readLastRefreshSettlement.mockReturnValue({
      outcome: { kind: "networkFailed" },
      settledAt: START_TIME.getTime(),
    });
    await connectAndAttach(harness);
    harness.fakeSocket.serverDrop("io server disconnect");

    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(harness.connections.at(-1)).toEqual({
      status: "reconnecting",
      refusal: null,
      attach: null,
    });

    await vi.advanceTimersByTimeAsync(3_999);
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(2);
    expect(
      harness.connections.some((connection) => connection.status === "refused"),
    ).toBe(false);
  });

  it("stops with unauthorized when the refresh is rejected", async () => {
    const harness = setup();
    apiClientMock.refreshSession.mockResolvedValue(false);
    apiClientMock.readLastRefreshSettlement.mockReturnValue({
      outcome: { kind: "rejected", status: 401 },
      settledAt: START_TIME.getTime(),
    });
    await connectAndAttach(harness);
    harness.fakeSocket.serverDrop("io server disconnect");

    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(harness.connections.at(-1)).toEqual({
      status: "refused",
      refusal: "unauthorized",
      attach: null,
    });
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
  });

  it("reauths a minute before the connection expires", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS - 1);
    expect(apiClientMock.mintSocketTicket).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();

    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
    expect(callsNamed(harness.fakeSocket, "session:reauth")).toEqual([
      {
        name: "session:reauth",
        payload: { ticket: "ticket-1" },
        timeoutMs: VJ_REAUTH_ACK_TIMEOUT_MS,
      },
    ]);
  });

  it("clears every timer and disconnects on dispose", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    harness.client.dispose();

    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(20 * MINUTE_MS);
    expect(apiClientMock.mintSocketTicket).not.toHaveBeenCalled();
    await expect(
      harness.client.send("stage:goClip", GO_CLIP_PAYLOAD),
    ).rejects.toMatchObject({ reason: "disconnected" });
  });
});

describe("VjSocketClient clock sync", () => {
  it("starts clock sync on connect before attach", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    expect(harness.fakeSocket.ackCalls.slice(0, 2)).toEqual([
      { name: "clock:sync", payload: {}, timeoutMs: VJ_ACK_TIMEOUT_MS },
      {
        name: "vj:attach",
        payload: REMOTE_ATTACH,
        timeoutMs: VJ_ACK_TIMEOUT_MS,
      },
    ]);
    await vi.advanceTimersByTimeAsync(BURST_LENGTH_MS);
    expect(clockSyncCountOf(harness.fakeSocket)).toBe(
      VJ_CLOCK_SYNC_BURST_COUNT,
    );
    await vi.advanceTimersByTimeAsync(VJ_CLOCK_SYNC_INTERVAL_MS);
    expect(clockSyncCountOf(harness.fakeSocket)).toBe(
      VJ_CLOCK_SYNC_BURST_COUNT + 1,
    );
  });

  it("reports a clock sample for every acked frame, refusals included", async () => {
    let localClockMs = 0;
    const samples: VjClockSample[] = [];
    const harness = setup(() => REMOTE_ATTACH, "remote", {
      localNow: () => {
        localClockMs += 10;
        return localClockMs;
      },
      onClockSample: (sample) => samples.push(sample),
    });
    await connectAndAttach(harness);
    harness.fakeSocket.ackResponder = () =>
      Promise.resolve({
        ok: false,
        code: "vj_stale_command",
        message: "Stale",
        serverNow: 9_000,
      });

    const ack = await harness.client.send("stage:goClip", GO_CLIP_PAYLOAD);

    expect(ack.ok).toBe(false);
    expect(samples).toHaveLength(harness.fakeSocket.ackCalls.length);
    expect(samples.slice(0, 2).map((sample) => sample.serverNow)).toEqual([
      serverNowOf(),
      serverNowOf(),
    ]);
    expect(samples.at(-1)).toEqual({
      sentAt: localClockMs - 10,
      receivedAt: localClockMs,
      serverNow: 9_000,
    });
    for (const sample of samples) {
      expect(sample.receivedAt).toBeGreaterThan(sample.sentAt);
    }
  });

  it("reports no sample for an ack without serverNow", async () => {
    const samples: VjClockSample[] = [];
    const harness = setup(() => REMOTE_ATTACH, "remote", {
      onClockSample: (sample) => samples.push(sample),
    });
    await connectAndAttach(harness);
    const samplesAfterAttach = samples.length;
    harness.fakeSocket.ackResponder = () =>
      Promise.resolve({ ok: true, revision: 2, isNoop: false, applyAt: null });

    await harness.client.send("stage:goClip", GO_CLIP_PAYLOAD);

    expect(samples).toHaveLength(samplesAfterAttach);
  });

  it("drops a clock sync timeout quietly", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = (name, payload) =>
      name === "clock:sync"
        ? Promise.reject(new Error("operation has timed out"))
        : defaultAckResponder(name, payload);
    await connectAndAttach(harness);
    await vi.advanceTimersByTimeAsync(BURST_LENGTH_MS);

    expect(clockSyncCountOf(harness.fakeSocket)).toBe(
      VJ_CLOCK_SYNC_BURST_COUNT,
    );
    expect(loggerMock.logWarn).not.toHaveBeenCalled();
    expect(harness.connections.at(-1)?.status).toBe("attached");
  });

  it("stops clock sync on disconnect and dispose", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    harness.fakeSocket.serverDrop("transport close");
    await vi.advanceTimersByTimeAsync(2 * VJ_CLOCK_SYNC_INTERVAL_MS);
    expect(clockSyncCountOf(harness.fakeSocket)).toBe(1);

    harness.fakeSocket.serverConnect();
    await flushPromises();
    expect(clockSyncCountOf(harness.fakeSocket)).toBe(2);

    harness.client.dispose();
    await vi.advanceTimersByTimeAsync(2 * VJ_CLOCK_SYNC_INTERVAL_MS);
    expect(clockSyncCountOf(harness.fakeSocket)).toBe(2);
  });
});

describe("VjSocketClient v2 attach", () => {
  it("attach payloads carry contractVersion 2", async () => {
    const screenAttach: VjAttachPayload = {
      role: "screen",
      contractVersion: VJ_CONTRACT_VERSION,
      screenId: SCREEN_ID,
      restoreState: restoreAt(7),
    };
    const harness = setup(() => screenAttach, "screen");
    await connectAndAttach(harness);

    const attachCalls = attachCallsOf(harness.fakeSocket);
    expect(attachCalls).toHaveLength(1);
    expect(attachCalls[0]?.payload).toBe(screenAttach);
    expect(attachCalls[0]?.payload).toMatchObject({ contractVersion: 2 });
    expect(harness.connections.at(-1)).toMatchObject({
      status: "attached",
      attach: { role: "screen", screenNumber: 1 },
    });
    expect(harness.connections.at(-1)?.attach).not.toHaveProperty("serverNow");
  });

  it("refuses with client_outdated and does not reconnect", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = (name, payload) =>
      name === "vj:attach"
        ? Promise.resolve({
            ok: false,
            code: "vj_client_outdated",
            message: "Reload",
            serverNow: serverNowOf(),
          })
        : defaultAckResponder(name, payload);
    await connectAndAttach(harness);

    expect(harness.connections.at(-1)).toEqual({
      status: "refused",
      refusal: "client_outdated",
      attach: null,
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalled();
    const syncsAtRefusal = clockSyncCountOf(harness.fakeSocket);
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(attachCallsOf(harness.fakeSocket)).toHaveLength(1);
    expect(clockSyncCountOf(harness.fakeSocket)).toBe(syncsAtRefusal);
  });

  it("forwards screen:identify frames", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    const identifyFrame = { number: 2, durationMs: 3_000 };
    harness.fakeSocket.trigger("screen:identify", identifyFrame);

    expect(harness.frames).toEqual([
      { event: "screen:identify", payload: identifyFrame },
    ]);
  });
});

describe("VjSocketClient logging", () => {
  it("logs codes and ids only", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    harness.fakeSocket.ackResponder = () =>
      Promise.resolve({
        ok: false,
        code: "vj_overlay_text_too_long",
        message: "Overlay text is too long",
        serverNow: serverNowOf(),
      });

    const ack = await harness.client.send("stage:setOverlay", {
      text: "Last song",
      style: "big",
      isVisible: true,
      clientId: "client-1",
      commandSequence: 2,
    });
    expect(ack.ok).toBe(false);
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "FORBIDDEN",
      message: "Admins only",
      domainCode: "vj_not_admin",
    });

    expect(loggerMock.logWarn).toHaveBeenCalled();
    for (const callArguments of loggerMock.logWarn.mock.calls) {
      expect(JSON.stringify(callArguments)).not.toContain("Last song");
    }
    expect(loggerMock.logWarn).toHaveBeenCalledWith("vj: frame refused", {
      frame: "stage:setOverlay",
      code: "vj_overlay_text_too_long",
    });
  });
});
