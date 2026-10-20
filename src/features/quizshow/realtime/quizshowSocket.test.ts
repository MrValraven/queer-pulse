import type { Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../shared/api/config";
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
} from "./quizshowSocket";

const apiClientMock = vi.hoisted(() => ({
  mintSocketTicket: vi.fn(),
  refreshSession: vi.fn(),
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

function setup() {
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
  });
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
  loggerMock.logWarn.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

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
    });
    expect(harness.fakeSocket.disconnect).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(vi.getTimerCount()).toBe(0);
    expect(harness.fakeSocket.connect).not.toHaveBeenCalled();
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    expect(statusesOf(harness.actions).at(-1)?.status).toBe("refused");
  });

  it("refreshes the session and reconnects after a server drop, backing off", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.serverDrop("io server disconnect");
    expect(statusesOf(harness.actions).at(-1)?.status).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(1_999);
    expect(apiClientMock.refreshSession).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(1);

    harness.fakeSocket.serverDrop("io server disconnect");
    await vi.advanceTimersByTimeAsync(3_999);
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(2);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(2);

    apiClientMock.refreshSession.mockResolvedValue(false);
    harness.fakeSocket.serverDrop("io server disconnect");
    await vi.advanceTimersByTimeAsync(8_000);
    await flushPromises();
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(3);
    expect(harness.fakeSocket.connect).toHaveBeenCalledTimes(2);
    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "refused",
      refusalCode: "UNAUTHORIZED",
    });
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

  it("ends refused when the refresh fails", async () => {
    const harness = setup();
    apiClientMock.refreshSession.mockResolvedValue(false);
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
    });
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(vi.getTimerCount()).toBe(0);
    expect(apiClientMock.refreshSession).toHaveBeenCalledTimes(1);
  });

  it("stops for good after the session ends", async () => {
    const harness = setup();
    await connectAndAttach(harness);

    harness.fakeSocket.trigger("session:end", { status: "finished" });
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

    harness.fakeSocket.trigger("session:end", { status: "finished" });
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

  it("shows a failed connect as reconnecting", async () => {
    const harness = setup();
    harness.client.connect();
    await flushPromises();

    harness.fakeSocket.trigger("connect_error", new Error("offline"));

    expect(statusesOf(harness.actions).at(-1)).toEqual({
      status: "reconnecting",
      refusalCode: null,
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
    await vi.advanceTimersByTimeAsync(MINUTE_MS - 200);
    expect(pingsOf(harness.fakeSocket)).toHaveLength(6);
    answerLatestPing(900);
    await vi.advanceTimersByTimeAsync(200);
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

    for (const eventName of QUIZSHOW_SERVER_FRAME_NAMES) {
      harness.fakeSocket.trigger(eventName, {
        marker: `secret-${eventName}`,
        screenName: "Secret Screen Name",
      });
    }
    harness.fakeSocket.trigger("exception", {
      status: "error",
      code: "BAD_REQUEST",
      message: "Secret Screen Name is too long",
    });

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
