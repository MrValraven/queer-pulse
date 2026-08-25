import { createElement } from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Mirrors realtime.test.tsx's harness (module-load env stubbing + a mocked
 * socket.io-client), scoped to one behaviour: a `PLATFORM_LOCKED` exception
 * must turn off reconnection so a lockdown doesn't trigger a reconnect storm
 * (see the comment above `socket.on("exception", …)` in realtime.ts). A
 * A generic exception (e.g. an expired access token) takes the opposite path:
 * it PAUSES reconnection only while `refreshSession()` is in flight, so the
 * next attempt carries the new cookie instead of racing the dead one, then
 * turns it back on. The distinction that matters is permanence — a lockdown
 * stays off, an auth blip comes back.
 */

const state = vi.hoisted(() => ({ demoMode: false, loggedIn: true }));

const socket = vi.hoisted(() => ({
  on: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
  io: { reconnection: vi.fn<(enabled: boolean) => void>() },
}));

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

// The generic-exception path refreshes the session before reconnecting. Mock
// it so the test never reaches the network and can drive both outcomes.
const refreshSessionMock = vi.hoisted(() => vi.fn(() => Promise.resolve(true)));

vi.mock("./client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./client")>()),
  refreshSession: refreshSessionMock,
}));

type RealtimeModule = typeof import("./realtime");

async function loadRealtime(base = "http://api.test"): Promise<RealtimeModule> {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", base);
  return import("./realtime");
}

/**
 * Flush the microtask the dynamic `import("socket.io-client")` inside
 * `connectAsync()` adds, inside `act` — the socket (and its `on("exception", …)`
 * wiring) is now constructed a microtask past mount, not synchronously.
 */
async function settle(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/** Mount the provider with one consumer holding the connection open, then settle.
 * Written with `createElement` (no JSX) since this file is `.ts`, not `.tsx`. */
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

/** The handler registered via `socket.on("exception", …)`. */
function exceptionHandler(): (data: {
  status: string;
  message: unknown;
  code?: string;
}) => void {
  const call = socket.on.mock.calls.find((c) => c[0] === "exception");
  return call?.[1] as (data: {
    status: string;
    message: unknown;
    code?: string;
  }) => void;
}

beforeEach(() => {
  state.demoMode = false;
  state.loggedIn = true;
  ioMock.mockReset();
  ioMock.mockReturnValue(socket);
  socket.on.mockClear();
  socket.disconnect.mockClear();
  socket.connect.mockClear();
  socket.io.reconnection.mockClear();
  refreshSessionMock.mockClear();
  refreshSessionMock.mockResolvedValue(true);
  vi.resetModules();
});

describe("platform-lockdown exception handling", () => {
  it("disables reconnection when the exception carries PLATFORM_LOCKED", async () => {
    const mod = await loadRealtime();
    await mount(mod);
    const handler = exceptionHandler();
    handler({
      status: "error",
      message: "platform locked",
      code: "PLATFORM_LOCKED",
    });
    expect(socket.io.reconnection).toHaveBeenCalledWith(false);
  });

  it("pauses reconnection only for the refresh on a generic exception, then restores it", async () => {
    const mod = await loadRealtime();
    await mount(mod);
    const handler = exceptionHandler();
    handler({ status: "error", message: "Unauthorized" });
    await settle();

    expect(refreshSessionMock).toHaveBeenCalledTimes(1);
    // Off while the refresh is in flight, back on once it lands: the reconnect
    // must carry the fresh cookie, not race the dead one.
    expect(socket.io.reconnection.mock.calls.map(([on]) => on)).toEqual([
      false,
      true,
    ]);
    expect(socket.connect).toHaveBeenCalled();
  });

  it("stays disconnected when the refresh genuinely fails", async () => {
    refreshSessionMock.mockResolvedValue(false);
    const mod = await loadRealtime();
    await mount(mod);
    const handler = exceptionHandler();
    handler({ status: "error", message: "Unauthorized" });
    await settle();

    // No `reconnection(true)`: a dead session must not cost a JWT verify per
    // second per idle tab. The next HTTP 401 drives the auth reconcile.
    expect(socket.io.reconnection.mock.calls.map(([on]) => on)).toEqual([
      false,
    ]);
    expect(socket.connect).not.toHaveBeenCalled();
  });
});
