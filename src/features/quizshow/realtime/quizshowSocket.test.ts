import type { Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../shared/api/config";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_ACK_TIMEOUT_MS,
  QUIZSHOW_REAUTH_ACK_TIMEOUT_MS,
  QUIZSHOW_REAUTH_MIN_DELAY_MS,
  QUIZSHOW_TICKET_MINT_RETRY_MS,
} from "../quizshow.constants";
import type { QuizshowClientAction } from "./quizshowClientStore";
import { QUIZSHOW_SERVER_FRAME_NAMES } from "./quizshowFrames";
import {
  QuizshowSendTimeoutError,
  QuizshowSocketClient,
  type QuizshowSocketClientOptions,
} from "./quizshowSocket";

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

const START_TIME = new Date("2026-10-19T20:00:00.000Z");
const MINUTE_MS = 60_000;

type AckResponder = (name: string, payload: unknown) => Promise<unknown>;

interface AckCall {
  name: string;
  payload: unknown;
  timeoutMs: number;
}

function defaultAckResponder(name: string): Promise<unknown> {
  if (name === "quizshow:attach") {
    return Promise.resolve({
      ok: true,
      role: "player",
      connectionExpiresAt: Date.now() + 15 * MINUTE_MS,
    });
  }
  if (name === "session:reauth") {
    return Promise.resolve({
      ok: true,
      exp: Math.floor((Date.now() + 15 * MINUTE_MS) / 1000),
    });
  }
  return Promise.resolve({ ok: true });
}

function createFakeSocket() {
  const handlers = new Map<string, Array<(...args: unknown[]) => void>>();
  const fakeSocket = {
    connected: false,
    emits: [] as Array<{ name: string; payload: unknown }>,
    ackCalls: [] as AckCall[],
    ackResponder: defaultAckResponder as AckResponder,
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

const createdClients: QuizshowSocketClient[] = [];

type SetupOverrides = Partial<
  Pick<QuizshowSocketClientOptions, "role" | "deviceTicket" | "currentPhaseId">
>;

function setup(overrides: SetupOverrides = {}) {
  const fakeSocket = createFakeSocket();
  const ioFactory = vi.fn(
    (_url: string, _options: object) => fakeSocket as unknown as Socket,
  );
  const actions: QuizshowClientAction[] = [];
  const offsets: number[] = [];
  const client = new QuizshowSocketClient({
    sessionId: "session-1",
    role: "player",
    onAction: (action) => actions.push(action),
    onClockOffset: (offsetMs) => offsets.push(offsetMs),
    loadIo: () => Promise.resolve(ioFactory),
    ...overrides,
  });
  // Disposed after each test, so no client keeps its wake listeners on the shared document.
  createdClients.push(client);
  return { fakeSocket, ioFactory, actions, offsets, client };
}

async function connectAndAttach(harness: ReturnType<typeof setup>) {
  harness.client.connect();
  await flushPromises();
  harness.fakeSocket.serverConnect();
  await flushPromises();
}

function statusesOf(actions: readonly QuizshowClientAction[]) {
  return actions.flatMap((action) =>
    action.event === "local:status" ? [action.payload] : [],
  );
}

function pingsOf(fakeSocket: ReturnType<typeof createFakeSocket>) {
  return fakeSocket.emits.filter((emitted) => emitted.name === "time:ping");
}

function attachCallsOf(fakeSocket: ReturnType<typeof createFakeSocket>) {
  return fakeSocket.ackCalls.filter((call) => call.name === "quizshow:attach");
}

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

/** The next refresh resolves false and records `outcome` as settled when it runs. */
function failNextRefreshWith(
  outcome:
    | { kind: "rejected"; status: number }
    | { kind: "networkFailed" }
    | { kind: "lockTimedOut" },
) {
  apiClientMock.refreshSession.mockImplementationOnce(() => {
    apiClientMock.readLastRefreshSettlement.mockReturnValue({
      outcome,
      settledAt: Date.now(),
    });
    return Promise.resolve(false);
  });
}

/** A server drop right after an `exception` carrying `code`. */
function dropWithCode(
  fakeSocket: ReturnType<typeof createFakeSocket>,
  code: string,
) {
  fakeSocket.trigger("exception", { status: "error", code, message: code });
  fakeSocket.serverDrop("io server disconnect");
}

/** Getter spies a test installs (navigator.onLine, document.visibilityState); undone after each test. */
const spyRestorers: Array<() => void> = [];

afterEach(() => {
  for (const createdClient of createdClients.splice(0)) createdClient.dispose();
  for (const restore of spyRestorers.splice(0)) restore();
  vi.useRealTimers();
});

function setOnline(isOnline: boolean) {
  const spy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);
  spyRestorers.push(() => spy.mockRestore());
}

function setPageVisible() {
  const spy = vi
    .spyOn(document, "visibilityState", "get")
    .mockReturnValue("visible");
  spyRestorers.push(() => spy.mockRestore());
}

function sessionPingsOf(fakeSocket: ReturnType<typeof createFakeSocket>) {
  return fakeSocket.ackCalls.filter((call) => call.name === "session:ping");
}

describe("QuizshowSocketClient connection", () => {
  it("opens a websocket to /quizshow with credentials", async () => {
    const harness = setup();
    harness.client.connect();
    await flushPromises();

    expect(harness.ioFactory).toHaveBeenCalledTimes(1);
    expect(harness.ioFactory).toHaveBeenCalledWith(`${API_BASE_URL}/quizshow`, {
      withCredentials: true,
      transports: ["websocket"],
    });
    expect(statusesOf(harness.actions)[0]).toEqual({
      status: "connecting",
      refusalCode: null,
      retryCause: null,
    });
  });

  it("attaches with the session and role on connect, and again after a reconnect", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    expect(attachCallsOf(harness.fakeSocket)).toEqual([
      {
        name: "quizshow:attach",
        payload: { sessionId: "session-1", as: "player" },
        timeoutMs: QUIZSHOW_ACK_TIMEOUT_MS,
      },
    ]);

    harness.fakeSocket.serverDrop("transport close");
    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: null,
    });
    harness.fakeSocket.serverConnect();
    await flushPromises();

    expect(attachCallsOf(harness.fakeSocket)).toHaveLength(2);
    expect(attachCallsOf(harness.fakeSocket)[1]?.payload).toEqual({
      sessionId: "session-1",
      as: "player",
    });
  });

  it("refuses for good when the attach ack says the player was removed", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = () =>
      Promise.resolve({
        ok: false,
        code: "quizshow_player_removed",
        message: "removed",
      });
    await connectAndAttach(harness);

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "refused",
      refusalCode: "quizshow_player_removed",
      retryCause: null,
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(vi.getTimerCount()).toBe(0);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    expect(statusesOf(harness.actions).at(-1)?.status).toBe("refused");
  });

  it("reconnects after a server drop with backoff and no refresh", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.serverDrop("io server disconnect");
    expect(statusesOf(harness.actions).at(-1)?.status).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(1_999);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);

    harness.fakeSocket.serverDrop("io server disconnect");
    await vi.advanceTimersByTimeAsync(3_999);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(2);
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
  });

  it("refreshes the session before reconnecting after a TOKEN_EXPIRED drop", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    dropWithCode(harness.fakeSocket, "TOKEN_EXPIRED");
    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: "UNAUTHORIZED",
    });
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
  });

  it("reconnects without a refresh after a SERVER_ERROR drop", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    dropWithCode(harness.fakeSocket, "SERVER_ERROR");
    expect(statusesOf(harness.actions).at(-1)?.retryCause).toBe("SERVER_ERROR");
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
  });

  it("refreshes and reconnects after an UNAUTHORIZED handshake", async () => {
    const harness = setup();
    harness.client.connect();
    await flushPromises();

    harness.fakeSocket.connected = true;
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
    harness.fakeSocket.serverDrop("io server disconnect");
    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: "UNAUTHORIZED",
    });

    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);

    harness.fakeSocket.serverConnect();
    await flushPromises();
    expect(attachCallsOf(harness.fakeSocket)).toHaveLength(1);
    expect(
      statusesOf(harness.actions).some(
        (statusPayload) => statusPayload.status === "refused",
      ),
    ).toBe(false);
  });

  it("ends refused when the server rejects the refresh", async () => {
    const harness = setup();
    failNextRefreshWith({ kind: "rejected", status: 401 });
    harness.client.connect();
    await flushPromises();

    harness.fakeSocket.connected = true;
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
    harness.fakeSocket.serverDrop("io server disconnect");
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "refused",
      refusalCode: "UNAUTHORIZED",
      retryCause: null,
    });
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(vi.getTimerCount()).toBe(0);
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
  });

  it("shows a failed connect as reconnecting", async () => {
    const harness = setup();
    harness.client.connect();
    await flushPromises();

    harness.fakeSocket.trigger("connect_error", new Error("offline"));

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: null,
    });
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
  });

  it("leaves other drops to socket.io and stops the clock while down", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.serverDrop("transport close");
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(pingsOf(harness.fakeSocket)).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("QuizshowSocketClient refresh outcomes", () => {
  async function dropForRefresh(harness: ReturnType<typeof setup>) {
    await connectAndAttach(harness);
    dropWithCode(harness.fakeSocket, "UNAUTHORIZED");
  }

  it("ends refused when the refresh is rejected with 403", async () => {
    const harness = setup();
    failNextRefreshWith({ kind: "rejected", status: 403 });
    await dropForRefresh(harness);
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "refused",
      refusalCode: "UNAUTHORIZED",
      retryCause: null,
    });
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
  });

  it("tries the refresh again with backoff after a network failure", async () => {
    const harness = setup();
    failNextRefreshWith({ kind: "networkFailed" });
    await dropForRefresh(harness);
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: "UNAUTHORIZED",
    });
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3_999);
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(2);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
  });

  it("names the server or the rate limit while it retries a 5xx or 429 refresh", async () => {
    const serverHarness = setup();
    failNextRefreshWith({ kind: "rejected", status: 503 });
    await dropForRefresh(serverHarness);
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();
    expect(statusesOf(serverHarness.actions).at(-1)?.retryCause).toBe(
      "SERVER_ERROR",
    );

    const limitedHarness = setup();
    failNextRefreshWith({ kind: "rejected", status: 429 });
    await dropForRefresh(limitedHarness);
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();
    expect(statusesOf(limitedHarness.actions).at(-1)?.retryCause).toBe(
      "RATE_LIMITED",
    );
    for (const harness of [serverHarness, limitedHarness]) {
      expect(
        statusesOf(harness.actions).some(
          (statusPayload) => statusPayload.status === "refused",
        ),
      ).toBe(false);
    }
  });

  it("tries again when the cross-tab lock wait was abandoned", async () => {
    const harness = setup();
    failNextRefreshWith({ kind: "lockTimedOut" });
    await dropForRefresh(harness);
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: "UNAUTHORIZED",
    });
  });

  it("reads a rejection settled before this refresh as no answer", async () => {
    const harness = setup();
    apiClientMock.refreshSession.mockResolvedValueOnce(false);
    apiClientMock.readLastRefreshSettlement.mockReturnValue({
      outcome: { kind: "rejected", status: 401 },
      settledAt: START_TIME.getTime() - MINUTE_MS,
    });
    await dropForRefresh(harness);
    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();

    expect(statusesOf(harness.actions).at(-1)?.status).toBe("reconnecting");
  });
});

describe("QuizshowSocketClient clock", () => {
  it("measures the clock from five pings and again after a reconnect", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    for (let pingIndex = 0; pingIndex < 5; pingIndex += 1) {
      await vi.advanceTimersByTimeAsync(pingIndex === 0 ? 0 : 200);
      const pings = pingsOf(harness.fakeSocket);
      expect(pings).toHaveLength(pingIndex + 1);
      const ping = pings.at(-1)?.payload as { clientSentAt: number };
      expect(ping.clientSentAt).toBe(START_TIME.getTime() + pingIndex * 200);
      harness.fakeSocket.trigger("time:pong", {
        clientSentAt: ping.clientSentAt,
        serverReceivedAt: ping.clientSentAt + 750,
        serverSentAt: ping.clientSentAt + 750,
      });
    }
    expect(harness.offsets).toEqual([750, 750, 750, 750, 750]);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(5);

    harness.fakeSocket.serverDrop("transport close");
    harness.fakeSocket.serverConnect();
    await flushPromises();
    await vi.advanceTimersByTimeAsync(800);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(10);
  });

  it("keeps the previous offset through a resync until the new round has three samples", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    const answerLatestPing = (offsetMs: number) => {
      const ping = pingsOf(harness.fakeSocket).at(-1)?.payload as {
        clientSentAt: number;
      };
      harness.fakeSocket.trigger("time:pong", {
        clientSentAt: ping.clientSentAt,
        serverReceivedAt: ping.clientSentAt + offsetMs,
        serverSentAt: ping.clientSentAt + offsetMs,
      });
    };

    await vi.advanceTimersByTimeAsync(0);
    answerLatestPing(750);
    await vi.advanceTimersByTimeAsync(200);
    answerLatestPing(750);
    // The first round reports every pong.
    expect(harness.offsets).toEqual([750, 750]);
    // The resync round's first ping is a zero delay timer set inside a tick,
    // which the fake clock runs 1ms later, so step 1ms past the minute and
    // 199ms on to the second ping.
    await vi.advanceTimersByTimeAsync(MINUTE_MS - 199);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(6);
    answerLatestPing(900);
    await vi.advanceTimersByTimeAsync(199);
    answerLatestPing(900);
    expect(harness.offsets).toEqual([750, 750]);
    await vi.advanceTimersByTimeAsync(200);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(8);
    answerLatestPing(900);
    expect(harness.offsets).toEqual([750, 750, 900]);
  });

  it("measures the clock again every minute", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    await vi.advanceTimersByTimeAsync(800);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(5);
    await vi.advanceTimersByTimeAsync(MINUTE_MS - 801);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(5);
    await vi.advanceTimersByTimeAsync(1 + 800);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(10);
    await vi.advanceTimersByTimeAsync(MINUTE_MS);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(15);
  });
});

describe("QuizshowSocketClient reauth", () => {
  function reauthCallsOf(fakeSocket: ReturnType<typeof createFakeSocket>) {
    return fakeSocket.ackCalls.filter((call) => call.name === "session:reauth");
  }

  it("reauthenticates a minute before the connection expires", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS - 1);
    expect(apiClientMock.mintSocketTicket).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
    expect(reauthCallsOf(harness.fakeSocket)).toEqual([
      {
        name: "session:reauth",
        payload: { ticket: "ticket-1" },
        timeoutMs: QUIZSHOW_REAUTH_ACK_TIMEOUT_MS,
      },
    ]);

    // The ack's exp is 15 minutes out in epoch seconds, so the next round is at exp * 1000 - 60 s.
    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS - 1);
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(2);
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(2);
  });

  it("retries a rate limited reauth after ten seconds", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = (name) =>
      name === "session:reauth"
        ? Promise.resolve({
            ok: false,
            code: "RATE_LIMITED",
            message: "slow down",
          })
        : defaultAckResponder(name);
    await connectAndAttach(harness);

    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(9_999);
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(2);
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(2);
  });

  it("retries a failed ticket mint after five seconds, then once more after the minimum delay", async () => {
    const harness = setup();
    apiClientMock.mintSocketTicket.mockRejectedValue(new Error("offline"));
    await connectAndAttach(harness);

    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(QUIZSHOW_TICKET_MINT_RETRY_MS);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(QUIZSHOW_REAUTH_MIN_DELAY_MS - 1);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(3);
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(0);
  });

  it("tries one more reauth after the minimum delay when the reauth ack times out", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = (name) =>
      name === "session:reauth"
        ? Promise.reject(new Error("operation has timed out"))
        : defaultAckResponder(name);
    await connectAndAttach(harness);

    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(QUIZSHOW_REAUTH_MIN_DELAY_MS - 1);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(2);
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(2);
  });

  it("times the reauth on the server's clock once the first pong gives the offset", async () => {
    const serverAheadMs = 2 * MINUTE_MS;
    const harness = setup();
    harness.fakeSocket.ackResponder = (name) => {
      if (name === "quizshow:attach") {
        return Promise.resolve({
          ok: true,
          role: "player",
          connectionExpiresAt: Date.now() + serverAheadMs + 15 * MINUTE_MS,
        });
      }
      if (name === "session:reauth") {
        return Promise.resolve({
          ok: true,
          exp: Math.floor((Date.now() + serverAheadMs + 15 * MINUTE_MS) / 1000),
        });
      }
      return defaultAckResponder(name);
    };
    await connectAndAttach(harness);
    await vi.advanceTimersByTimeAsync(0);
    const ping = pingsOf(harness.fakeSocket).at(-1)?.payload as {
      clientSentAt: number;
    };
    harness.fakeSocket.trigger("time:pong", {
      clientSentAt: ping.clientSentAt,
      serverReceivedAt: ping.clientSentAt + serverAheadMs,
      serverSentAt: ping.clientSentAt + serverAheadMs,
    });
    expect(harness.offsets).toEqual([serverAheadMs]);

    // Expiry 17 minutes out on the server, which runs 2 minutes ahead: reauth at 14 minutes, 1 before.
    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS - 1);
    expect(apiClientMock.mintSocketTicket).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS - 1);
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(2);
  });

  it("stops rescheduling when a helper's reauth cannot move the expiry later", async () => {
    const ceilingMs = START_TIME.getTime() + 15 * MINUTE_MS;
    const harness = setup({ role: "host", deviceTicket: "helper-ticket-1" });
    harness.fakeSocket.ackResponder = (name) => {
      if (name === "quizshow:attach") {
        return Promise.resolve({
          ok: true,
          role: "host",
          connectionExpiresAt: ceilingMs,
        });
      }
      if (name === "session:reauth") {
        return Promise.resolve({ ok: true, exp: ceilingMs / 1000 });
      }
      return defaultAckResponder(name);
    };
    await connectAndAttach(harness);

    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(MINUTE_MS - 1);
    await flushPromises();
    expect(reauthCallsOf(harness.fakeSocket)).toHaveLength(1);
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
  });
});

describe("QuizshowSocketClient frames and sends", () => {
  it("rejects a send that times out or goes out while disconnected", async () => {
    const harness = setup();
    await expect(
      harness.client.send("settings:avatar", { isAvatarShown: true }),
    ).rejects.toBeInstanceOf(QuizshowSendTimeoutError);

    await connectAndAttach(harness);
    harness.fakeSocket.ackResponder = (name) =>
      name === "settings:avatar"
        ? Promise.reject(new Error("operation has timed out"))
        : defaultAckResponder(name);
    await expect(
      harness.client.send("settings:avatar", { isAvatarShown: true }),
    ).rejects.toBeInstanceOf(QuizshowSendTimeoutError);
    expect(harness.fakeSocket.ackCalls.at(-1)?.timeoutMs).toBe(
      QUIZSHOW_ACK_TIMEOUT_MS,
    );

    harness.fakeSocket.ackResponder = defaultAckResponder;
    await expect(
      harness.client.send("host:end", { phaseId: "5" }),
    ).resolves.toEqual({
      ok: true,
    });
  });

  it("passes every server frame through as an action and logs no payload", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    // The exception goes first: session:end in the frame list ends the
    // session, and the client ignores exceptions after that.
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "BAD_REQUEST",
      message: "Secret Screen Name is too long",
    });
    for (const eventName of QUIZSHOW_SERVER_FRAME_NAMES) {
      harness.fakeSocket.trigger(eventName, {
        marker: `secret-${eventName}`,
        screenName: "Secret Screen Name",
      });
    }

    const frames = harness.actions.filter(
      (action) => action.event !== "local:status",
    );
    expect(frames).toEqual(
      QUIZSHOW_SERVER_FRAME_NAMES.map((eventName) => ({
        event: eventName,
        payload: {
          marker: `secret-${eventName}`,
          screenName: "Secret Screen Name",
        },
      })),
    );
    expect(loggerMock.logWarn).toHaveBeenCalledWith(
      "quizshow: gateway exception",
      { code: "BAD_REQUEST" },
    );
    const logged = JSON.stringify(loggerMock.logWarn.mock.calls);
    expect(logged).not.toContain("Secret Screen Name");
    expect(logged).not.toContain("secret-");
  });

  it("ignores late events after dispose", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    const actionCount = harness.actions.length;

    harness.client.dispose();
    harness.fakeSocket.trigger("lobby:update", { players: [] });
    harness.fakeSocket.serverDrop("io server disconnect");
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);

    expect(harness.actions).toHaveLength(actionCount);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("QuizshowSocketClient time probe", () => {
  it("acks a time:probe at once and keeps it out of the store", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    const actionCount = harness.actions.length;
    const ack = vi.fn();

    harness.fakeSocket.trigger("time:probe", { sentAt: Date.now() }, ack);

    expect(ack).toHaveBeenCalledTimes(1);
    expect(ack).toHaveBeenCalledWith({});
    expect(harness.actions).toHaveLength(actionCount);
  });
});

describe("QuizshowSocketClient wake resync", () => {
  it("forces a reconnect when the wake ping times out", async () => {
    const harness = setup({ currentPhaseId: () => "phase-1" });
    await connectAndAttach(harness);
    harness.fakeSocket.ackResponder = (name) =>
      name === "session:ping"
        ? Promise.reject(new Error("operation has timed out"))
        : defaultAckResponder(name);
    setPageVisible();

    document.dispatchEvent(new Event("visibilitychange"));
    await flushPromises();

    expect(sessionPingsOf(harness.fakeSocket)).toEqual([
      {
        name: "session:ping",
        payload: {},
        timeoutMs: QUIZSHOW_LIMITS.sessionPingTimeoutMs,
      },
    ]);
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
  });

  it("forces a reconnect when the ping's phase differs from the store's", async () => {
    const harness = setup({ currentPhaseId: () => "phase-1" });
    await connectAndAttach(harness);
    harness.fakeSocket.ackResponder = (name) =>
      name === "session:ping"
        ? Promise.resolve({ ok: true, serverNow: Date.now(), phaseId: "p-2" })
        : defaultAckResponder(name);

    window.dispatchEvent(new Event("online"));
    await flushPromises();

    expect(sessionPingsOf(harness.fakeSocket)).toHaveLength(1);
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
  });

  it("stays connected when the ping's phase matches the store's", async () => {
    const harness = setup({ currentPhaseId: () => "phase-1" });
    await connectAndAttach(harness);
    harness.fakeSocket.ackResponder = (name) =>
      name === "session:ping"
        ? Promise.resolve({
            ok: true,
            serverNow: Date.now(),
            phaseId: "phase-1",
          })
        : defaultAckResponder(name);

    window.dispatchEvent(new Event("online"));
    await flushPromises();

    expect(sessionPingsOf(harness.fakeSocket)).toHaveLength(1);
    expect(harness.fakeSocket.disconnect).not.toHaveBeenCalled();
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
  });

  it("connects at once when the device wakes while down", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    harness.fakeSocket.serverDrop("transport close");

    window.dispatchEvent(new Event("online"));
    await flushPromises();

    expect(sessionPingsOf(harness.fakeSocket)).toHaveLength(0);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
  });

  it("removes the same wake listeners it added on dispose", async () => {
    const documentAddSpy = vi.spyOn(document, "addEventListener");
    const documentRemoveSpy = vi.spyOn(document, "removeEventListener");
    const windowAddSpy = vi.spyOn(window, "addEventListener");
    const windowRemoveSpy = vi.spyOn(window, "removeEventListener");
    spyRestorers.push(() => {
      documentAddSpy.mockRestore();
      documentRemoveSpy.mockRestore();
      windowAddSpy.mockRestore();
      windowRemoveSpy.mockRestore();
    });
    const harness = setup();
    await connectAndAttach(harness);
    const visibilityHandler = documentAddSpy.mock.calls.find(
      ([eventName]) => eventName === "visibilitychange",
    )?.[1];
    const onlineHandler = windowAddSpy.mock.calls.find(
      ([eventName]) => eventName === "online",
    )?.[1];
    expect(visibilityHandler).toBeTypeOf("function");
    expect(onlineHandler).toBeTypeOf("function");

    harness.client.dispose();
    expect(documentRemoveSpy).toHaveBeenCalledWith(
      "visibilitychange",
      visibilityHandler,
    );
    expect(windowRemoveSpy).toHaveBeenCalledWith("online", onlineHandler);
    setPageVisible();
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("online"));
    await flushPromises();

    expect(sessionPingsOf(harness.fakeSocket)).toHaveLength(0);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
  });
});

describe("QuizshowSocketClient device tickets", () => {
  it("sends a TV's ticket in the handshake and runs no member reauth", async () => {
    const harness = setup({ role: "screen", deviceTicket: "device-ticket-1" });
    await connectAndAttach(harness);

    expect(harness.ioFactory).toHaveBeenCalledWith(`${API_BASE_URL}/quizshow`, {
      withCredentials: true,
      transports: ["websocket"],
      auth: { deviceTicket: "device-ticket-1" },
    });
    expect(attachCallsOf(harness.fakeSocket)[0]?.payload).toEqual({
      sessionId: "session-1",
      as: "screen",
    });

    await vi.advanceTimersByTimeAsync(30 * MINUTE_MS);
    expect(apiClientMock.mintSocketTicket).not.toHaveBeenCalled();
    expect(
      harness.fakeSocket.ackCalls.some(
        (call) => call.name === "session:reauth",
      ),
    ).toBe(false);
  });

  it("refuses with the ticket expired code when the TV's ticket expires", async () => {
    const harness = setup({ role: "screen", deviceTicket: "device-ticket-1" });
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "TOKEN_EXPIRED",
      message: "Token expired",
    });

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "refused",
      refusalCode: "quizshow_device_ticket_expired",
      retryCause: null,
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
  });

  it("sends a helper's ticket in the attach payload and keeps the member reauth", async () => {
    const harness = setup({ role: "host", deviceTicket: "helper-ticket-1" });
    await connectAndAttach(harness);

    expect(harness.ioFactory).toHaveBeenCalledWith(`${API_BASE_URL}/quizshow`, {
      withCredentials: true,
      transports: ["websocket"],
    });
    expect(attachCallsOf(harness.fakeSocket)[0]?.payload).toEqual({
      sessionId: "session-1",
      as: "host",
      deviceTicket: "helper-ticket-1",
    });

    await vi.advanceTimersByTimeAsync(14 * MINUTE_MS);
    await flushPromises();
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
  });
});

describe("QuizshowSocketClient session end", () => {
  it("stops for good after an abandoned session ends", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "abandoned" });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    harness.fakeSocket.serverDrop("transport close");
    harness.fakeSocket.serverConnect();
    await flushPromises();

    expect(attachCallsOf(harness.fakeSocket)).toHaveLength(1);
    expect(
      statusesOf(harness.actions).some(
        (statusPayload) =>
          statusPayload.status === "refused" ||
          statusPayload.status === "reconnecting",
      ),
    ).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ignores socket exceptions after the session has ended", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "abandoned" });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "FORBIDDEN",
      message: "Forbidden",
    });

    expect(
      statusesOf(harness.actions).some(
        (statusPayload) => statusPayload.status === "refused",
      ),
    ).toBe(false);
    expect(loggerMock.logWarn).not.toHaveBeenCalledWith(
      "quizshow: gateway exception",
      expect.anything(),
    );
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it("keeps the socket after a finished end until the rematch", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "finished" });
    expect(harness.fakeSocket.disconnect).not.toHaveBeenCalled();
    // The rematch window and the reauth schedule.
    expect(vi.getTimerCount()).toBe(2);
    await vi.advanceTimersByTimeAsync(20 * MINUTE_MS);
    await flushPromises();
    // The held socket still reauthenticates before its access token expires.
    expect(apiClientMock.mintSocketTicket).toHaveBeenCalledTimes(1);
    expect(
      harness.fakeSocket.ackCalls.filter(
        (call) => call.name === "session:reauth",
      ),
    ).toHaveLength(1);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(0);

    harness.fakeSocket.trigger("session:rematch", {
      fromSessionId: "session-1",
    });
    expect(harness.actions.at(-1)).toEqual({
      event: "session:rematch",
      payload: { fromSessionId: "session-1" },
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(
      statusesOf(harness.actions).some(
        (statusPayload) => statusPayload.status === "reconnecting",
      ),
    ).toBe(false);
  });

  it("closes the kept socket when the rematch window passes", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "finished" });
    await vi.advanceTimersByTimeAsync(QUIZSHOW_LIMITS.rematchWindowMs - 1);
    expect(harness.fakeSocket.disconnect).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stays down after the server drops a kept socket", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "finished" });
    harness.fakeSocket.serverDrop("io server disconnect");
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);

    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps a held socket down after a transport close", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "finished" });
    harness.fakeSocket.serverDrop("transport close");
    harness.fakeSocket.serverConnect();
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    await flushPromises();

    // The disconnect stops socket.io's own reconnect.
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(attachCallsOf(harness.fakeSocket)).toHaveLength(1);
    expect(apiClientMock.mintSocketTicket).not.toHaveBeenCalled();
    expect(
      statusesOf(harness.actions).some(
        (statusPayload) => statusPayload.status === "reconnecting",
      ),
    ).toBe(false);
  });

  it("disconnects a paired TV at a finished end", async () => {
    const harness = setup({ role: "screen", deviceTicket: "device-ticket-1" });
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "finished" });

    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("QuizshowSocketClient retry cause", () => {
  it("names offline as the cause when the device is offline", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    setOnline(false);

    harness.fakeSocket.serverDrop("transport close");

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: "offline",
    });
  });

  it("names the transport code a failed connect carries", async () => {
    const harness = setup();
    harness.client.connect();
    await flushPromises();

    harness.fakeSocket.trigger(
      "connect_error",
      Object.assign(new Error("rate limited"), {
        data: { code: "RATE_LIMITED" },
      }),
    );

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
      retryCause: "RATE_LIMITED",
    });
  });

  it("names an exception's code only for the server drop right after it", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "SERVER_ERROR",
      message: "Internal server error",
    });
    harness.fakeSocket.serverDrop("transport close");
    expect(statusesOf(harness.actions).at(-1)?.retryCause).toBeNull();

    harness.fakeSocket.serverConnect();
    await flushPromises();
    harness.fakeSocket.serverDrop("io server disconnect");
    expect(statusesOf(harness.actions).at(-1)?.retryCause).toBeNull();
  });

  it("names offline after an exception when the device is offline", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    setOnline(false);

    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "SERVER_ERROR",
      message: "Internal server error",
    });
    harness.fakeSocket.serverDrop("transport close");

    expect(statusesOf(harness.actions).at(-1)?.retryCause).toBe("offline");
  });
});

describe("QuizshowSocketClient wake resync skips", () => {
  it("sends no wake ping after a refusal", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = () =>
      Promise.resolve({
        ok: false,
        code: "quizshow_player_removed",
        message: "removed",
      });
    await connectAndAttach(harness);

    window.dispatchEvent(new Event("online"));
    await flushPromises();

    expect(sessionPingsOf(harness.fakeSocket)).toHaveLength(0);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
  });

  it("sends no wake ping after an end, held or closed", async () => {
    const heldHarness = setup();
    await connectAndAttach(heldHarness);
    heldHarness.fakeSocket.trigger("session:end", { status: "finished" });
    const closedHarness = setup();
    await connectAndAttach(closedHarness);
    closedHarness.fakeSocket.trigger("session:end", { status: "abandoned" });

    setPageVisible();
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("online"));
    await flushPromises();

    for (const harness of [heldHarness, closedHarness]) {
      expect(sessionPingsOf(harness.fakeSocket)).toHaveLength(0);
      expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    }
  });

  it("sends no wake ping before the attach ack", async () => {
    const harness = setup();
    harness.fakeSocket.ackResponder = () => new Promise(() => undefined);
    await connectAndAttach(harness);

    window.dispatchEvent(new Event("online"));
    await flushPromises();

    expect(sessionPingsOf(harness.fakeSocket)).toHaveLength(0);
    expect(harness.fakeSocket.disconnect).not.toHaveBeenCalled();
  });

  it("waits for a pending reconnect when the device wakes while down", async () => {
    const harness = setup();
    await connectAndAttach(harness);
    dropWithCode(harness.fakeSocket, "TOKEN_EXPIRED");

    window.dispatchEvent(new Event("online"));
    await flushPromises();
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2_000);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);
  });
});
