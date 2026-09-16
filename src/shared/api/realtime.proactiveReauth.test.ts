import { createElement } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * ENG-219 (frontend half): the realtime client mints a single-use socket
 * ticket and emits `session:reauth` PROACTIVELY, before the access token it
 * is trusting is due to expire, instead of waiting for the reactive
 * `TOKEN_EXPIRED` drop-and-reconnect path (that path is exercised separately
 * in `realtime.lockdown.test.ts` and is left untouched by this file).
 *
 * Mirrors `realtime.lockdown.test.ts`'s harness (module-load env stubbing +
 * a mocked `socket.io-client`), extended with a `timeout().emit()` mock so
 * the ack-bearing `session:reauth` frame can be driven and inspected, and
 * with fake timers so the proactive schedule (minutes out in real time)
 * advances instantly.
 */

const state = vi.hoisted(() => ({ demoMode: false, loggedIn: true }));

const { socket, timeoutEmit } = vi.hoisted(() => {
  const timeoutEmit = vi.fn();
  const socket = {
    on: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    connected: true,
    io: { reconnection: vi.fn() },
    timeout: vi.fn(() => ({ emit: timeoutEmit })),
  };
  return { socket, timeoutEmit };
});

const ioMock = vi.hoisted(() =>
  vi.fn<(url: string, opts: unknown) => typeof socket>(() => socket),
);

vi.mock("socket.io-client", () => ({ io: ioMock }));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({
    demoMode: state.demoMode,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn: state.loggedIn }),
}));

const mintSocketTicketMock = vi.hoisted(() => vi.fn());
const refreshSessionMock = vi.hoisted(() => vi.fn(() => Promise.resolve(true)));

vi.mock("./client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./client")>()),
  mintSocketTicket: mintSocketTicketMock,
  refreshSession: refreshSessionMock,
}));

type RealtimeModule = typeof import("./realtime");

async function loadRealtime(base = "http://api.test"): Promise<RealtimeModule> {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", base);
  return import("./realtime");
}

/** Flushes the microtask the dynamic `import("socket.io-client")` inside
 *  `connectAsync()` adds, using the installed FAKE timers rather than a real
 *  `setTimeout` (this suite runs under `vi.useFakeTimers()` throughout). */
async function settle(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

/** Written with `createElement` (no JSX) since this file is `.ts`, not
 *  `.tsx`, mirroring `realtime.lockdown.test.ts`'s identical harness. */
async function mount({
  RealtimeProvider,
  useRealtimeConnection,
}: RealtimeModule) {
  function Consumer() {
    useRealtimeConnection();
    return null;
  }
  const view = render(
    createElement(RealtimeProvider, null, createElement(Consumer)),
  );
  await settle();
  return view;
}

/** The handler registered via `socket.on("presence:snapshot", …)`, the
 *  contract's own definition of "authenticated" (see realtime.ts), and what
 *  arms the FIRST proactive `session:reauth` schedule (`handleSessionLive`). */
function presenceSnapshotHandler(): (data: { online: string[] }) => void {
  const call = socket.on.mock.calls.find((c) => c[0] === "presence:snapshot");
  return call?.[1] as (data: { online: string[] }) => void;
}

/** The most recent `session:reauth` ack callback `timeoutEmit` was invoked
 *  with, or `undefined` if `session:reauth` was never emitted. */
function latestReauthAckCallback():
  | ((error: Error | null, ack?: { ok: boolean; code?: string }) => void)
  | undefined {
  const call = [...timeoutEmit.mock.calls]
    .reverse()
    .find((c) => c[0] === "session:reauth");
  return call?.[2] as
    | ((error: Error | null, ack?: { ok: boolean; code?: string }) => void)
    | undefined;
}

/** Advances the confirmed-live connection close enough to the assumed
 *  15-minute access-token TTL that the FIRST proactive `session:reauth`
 *  schedule (armed by `handleSessionLive`, some margin short of that TTL)
 *  has fired. */
async function advancePastFirstProactiveSchedule(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15 * 60 * 1000);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  state.demoMode = false;
  state.loggedIn = true;
  ioMock.mockReset();
  ioMock.mockReturnValue(socket);
  socket.on.mockClear();
  socket.disconnect.mockClear();
  socket.connect.mockClear();
  socket.connected = true;
  socket.io.reconnection.mockClear();
  timeoutEmit.mockClear();
  mintSocketTicketMock.mockReset();
  mintSocketTicketMock.mockResolvedValue({ ticket: "st_test", ttlMs: 30_000 });
  refreshSessionMock.mockClear();
  refreshSessionMock.mockResolvedValue(true);
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("proactive session:reauth scheduling", () => {
  it("mints a ticket and emits session:reauth on its own, before the socket would ever hit TOKEN_EXPIRED", async () => {
    const mod = await loadRealtime();
    await mount(mod);
    act(() => {
      presenceSnapshotHandler()({ online: [] });
    });
    await settle();

    await advancePastFirstProactiveSchedule();

    expect(mintSocketTicketMock).toHaveBeenCalledTimes(1);
    expect(timeoutEmit).toHaveBeenCalledWith(
      "session:reauth",
      { ticket: "st_test" },
      expect.any(Function),
    );
    // The reactive TOKEN_EXPIRED path (a separate `exception` frame the
    // gateway would only send once the token ACTUALLY expires) never fires
    // here: the proactive attempt pre-empted it.
    expect(socket.disconnect).not.toHaveBeenCalled();
  });

  it("retries after a RATE_LIMITED ack instead of giving up", async () => {
    const mod = await loadRealtime();
    await mount(mod);
    act(() => {
      presenceSnapshotHandler()({ online: [] });
    });
    await settle();
    await advancePastFirstProactiveSchedule();
    expect(timeoutEmit).toHaveBeenCalledTimes(1);

    const ackCallback = latestReauthAckCallback();
    expect(ackCallback).toBeDefined();
    await act(async () => {
      ackCallback?.(null, { ok: false, code: "RATE_LIMITED" });
      // The retry delay is well under a minute; a generous advance covers it
      // without depending on the exact constant.
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(timeoutEmit).toHaveBeenCalledTimes(2);
    expect(mintSocketTicketMock).toHaveBeenCalledTimes(2);
  });

  it("falls back cleanly (no throw, no self-triggered retry) when the ack rejects with a code the server already dropped the socket for", async () => {
    const mod = await loadRealtime();
    await mount(mod);
    act(() => {
      presenceSnapshotHandler()({ online: [] });
    });
    await settle();
    await advancePastFirstProactiveSchedule();
    expect(timeoutEmit).toHaveBeenCalledTimes(1);

    const ackCallback = latestReauthAckCallback();
    // Mirrors what `ChatGateway.handleReauth` actually sends back for a
    // rejected credential: this ack ALWAYS arrives alongside a real
    // `exception` + `disconnect` pair on the wire (the existing reactive
    // path, covered by realtime.lockdown.test.ts), which this harness does
    // not simulate. The assertion here is only that THIS ack, on its own,
    // never throws and never re-arms another proactive attempt by itself.
    await act(async () => {
      expect(() =>
        ackCallback?.(null, { ok: false, code: "TOKEN_EXPIRED" }),
      ).not.toThrow();
      await vi.advanceTimersByTimeAsync(15 * 60 * 1000);
    });

    // No second mint/emit was self-scheduled off this rejection.
    expect(timeoutEmit).toHaveBeenCalledTimes(1);
    expect(mintSocketTicketMock).toHaveBeenCalledTimes(1);
  });

  it("mints and emits even on a mid-tab-background late timer fire, as long as the socket is still connected", async () => {
    const mod = await loadRealtime();
    await mount(mod);
    act(() => {
      presenceSnapshotHandler()({ online: [] });
    });
    await settle();

    // A backgrounded tab can throttle timers well past their nominal delay.
    // Advancing far beyond the schedule simulates that; the guard only cares
    // whether the (same, still-connected) socket is still this client's own.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    });

    expect(timeoutEmit).toHaveBeenCalledWith(
      "session:reauth",
      { ticket: "st_test" },
      expect.any(Function),
    );
  });

  it("does nothing noisy when the timer fires after the socket has already disconnected", async () => {
    const mod = await loadRealtime();
    await mount(mod);
    act(() => {
      presenceSnapshotHandler()({ online: [] });
    });
    await settle();

    // Simulate the socket having gone away entirely before the proactive
    // timer fires (a genuine drop, or this client having gone terminal).
    socket.connected = false;

    await act(async () => {
      await expect(
        vi.advanceTimersByTimeAsync(15 * 60 * 1000),
      ).resolves.not.toThrow();
    });

    expect(mintSocketTicketMock).not.toHaveBeenCalled();
    expect(timeoutEmit).not.toHaveBeenCalled();
  });
});
