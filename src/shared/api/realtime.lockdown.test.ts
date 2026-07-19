import { createElement } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Mirrors realtime.test.tsx's harness (module-load env stubbing + a mocked
 * socket.io-client), scoped to one behaviour: a `PLATFORM_LOCKED` exception
 * must turn off reconnection so a lockdown doesn't trigger a reconnect storm
 * (see the comment above `socket.on("exception", …)` in realtime.ts). A
 * generic exception (e.g. an expired access token) must leave reconnection
 * untouched, since that path relies on the client reconnecting with a
 * freshly-refreshed cookie.
 */

const state = vi.hoisted(() => ({ demoMode: false, loggedIn: true }));

const socket = vi.hoisted(() => ({
  on: vi.fn(),
  disconnect: vi.fn(),
  io: { reconnection: vi.fn() },
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

type RealtimeModule = typeof import("./realtime");

async function loadRealtime(base = "http://api.test"): Promise<RealtimeModule> {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", base);
  return import("./realtime");
}

/** Mount the provider with one consumer holding the connection open. Written
 * with `createElement` (no JSX) since this file is `.ts`, not `.tsx`. */
function mount({ RealtimeProvider, useRealtimeConnection }: RealtimeModule) {
  function Consumer() {
    useRealtimeConnection();
    return null;
  }
  return render(createElement(RealtimeProvider, null, createElement(Consumer)));
}

/** The handler registered via `socket.on("exception", …)`. */
function exceptionHandler(): (data: { status: string; message: unknown; code?: string }) => void {
  const call = socket.on.mock.calls.find((c) => c[0] === "exception");
  return call?.[1] as (data: { status: string; message: unknown; code?: string }) => void;
}

beforeEach(() => {
  state.demoMode = false;
  state.loggedIn = true;
  ioMock.mockReset();
  ioMock.mockReturnValue(socket);
  socket.on.mockClear();
  socket.disconnect.mockClear();
  socket.io.reconnection.mockClear();
  vi.resetModules();
});

describe("platform-lockdown exception handling", () => {
  it("disables reconnection when the exception carries PLATFORM_LOCKED", async () => {
    const mod = await loadRealtime();
    mount(mod);
    const handler = exceptionHandler();
    handler({ status: "error", message: "platform locked", code: "PLATFORM_LOCKED" });
    expect(socket.io.reconnection).toHaveBeenCalledWith(false);
  });

  it("leaves reconnection untouched for a generic exception", async () => {
    const mod = await loadRealtime();
    mount(mod);
    const handler = exceptionHandler();
    handler({ status: "error", message: "Unauthorized" });
    expect(socket.io.reconnection).not.toHaveBeenCalled();
  });
});
