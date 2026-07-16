import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * realtime.ts reads `API_BASE_URL`/`apiAvailable` from config.ts at module load
 * (frozen consts), so every test follows client.test.ts's pattern:
 *   1. vi.resetModules() to re-evaluate config,
 *   2. vi.stubEnv("VITE_API_URL", …) BEFORE the dynamic import,
 *   3. dynamic `import("./realtime")` for a pristine module.
 *
 * socket.io-client, auth and demo-mode are mocked so the suite asserts *what the
 * module wires up* without a server, a provider tree, or a network.
 */

const state = vi.hoisted(() => ({ demoMode: false, loggedIn: true }));

const socket = vi.hoisted(() => ({
  on: vi.fn(),
  disconnect: vi.fn(),
}));

// Typed with the real `io` arity so `mock.calls[0][1]` reads the options object.
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

/** Mount the provider with one consumer holding the connection open. */
function mount({ RealtimeProvider, useRealtimeConnection }: RealtimeModule) {
  function Consumer() {
    useRealtimeConnection();
    return null;
  }
  return render(
    <RealtimeProvider>
      <Consumer />
    </RealtimeProvider>,
  );
}

/** Names passed to socket.on(...) during connect. */
function subscribedEvents(): string[] {
  return socket.on.mock.calls.map((call) => call[0] as string);
}

beforeEach(() => {
  state.demoMode = false;
  state.loggedIn = true;
  ioMock.mockReset();
  ioMock.mockReturnValue(socket);
  socket.on.mockClear();
  socket.disconnect.mockClear();
  vi.resetModules();
});

describe("socket construction", () => {
  it("opens exactly one socket.io connection to the /chat namespace", async () => {
    const mod = await loadRealtime("http://api.test");
    mount(mod);
    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledWith("http://api.test/chat", {
      withCredentials: true,
      transports: ["websocket"],
    });
  });

  it("sends cookies (the access_token cookie IS the gateway's auth)", async () => {
    const mod = await loadRealtime();
    mount(mod);
    const opts = ioMock.mock.calls[0]?.[1] as { withCredentials?: boolean };
    expect(opts.withCredentials).toBe(true);
  });

  it("disconnects the socket when the last consumer unmounts", async () => {
    const mod = await loadRealtime();
    const view = mount(mod);
    view.unmount();
    expect(socket.disconnect).toHaveBeenCalled();
  });
});

describe("no socket without demand", () => {
  it("opens NO socket in demo mode", async () => {
    state.demoMode = true;
    const mod = await loadRealtime("http://api.test");
    mount(mod);
    expect(ioMock).not.toHaveBeenCalled();
  });

  it("opens NO socket when logged out", async () => {
    state.loggedIn = false;
    const mod = await loadRealtime("http://api.test");
    mount(mod);
    expect(ioMock).not.toHaveBeenCalled();
  });

  it("opens NO socket when no backend is configured", async () => {
    const mod = await loadRealtime("");
    mount(mod);
    expect(ioMock).not.toHaveBeenCalled();
  });

  it("opens NO socket when nothing calls useRealtimeConnection", async () => {
    const { RealtimeProvider } = await loadRealtime("http://api.test");
    render(
      <RealtimeProvider>
        <div />
      </RealtimeProvider>,
    );
    expect(ioMock).not.toHaveBeenCalled();
  });
});

describe("subscribed events", () => {
  // Source of truth: queerpulse-backend/src/chat/chat.gateway.ts.
  it("subscribes to the gateway's real event names", async () => {
    const mod = await loadRealtime();
    mount(mod);
    const events = subscribedEvents();
    expect(events).toContain("message:new");
    expect(events).toContain("read");
    expect(events).toContain("notification:new");
    expect(events).toContain("exception");
  });

  it("subscribes to socket.io lifecycle events for connection status", async () => {
    const mod = await loadRealtime();
    mount(mod);
    const events = subscribedEvents();
    expect(events).toContain("connect");
    expect(events).toContain("disconnect");
    expect(events).toContain("connect_error");
  });

  it("does NOT subscribe to the old invented names the backend never emits", async () => {
    const mod = await loadRealtime();
    mount(mod);
    const events = subscribedEvents();
    // `message.created` is the backend's INTERNAL event-emitter topic
    // (messaging.events.ts), never a socket event. The rest never existed.
    expect(events).not.toContain("message.created");
    expect(events).not.toContain("message.read");
    expect(events).not.toContain("notification.new");
    expect(events).not.toContain("connection.severed");
  });
});

describe("cache invalidation", () => {
  /** Grab the handler registered for `event`, plus a spy on the query client. */
  async function wire(event: string) {
    const mod = await loadRealtime();
    const { queryClient } = await import("./queryClient");
    const spy = vi.spyOn(queryClient, "invalidateQueries");
    mount(mod);
    const call = socket.on.mock.calls.find((c) => c[0] === event);
    return { handler: call?.[1] as (data: unknown) => void, spy };
  }

  it("message:new refreshes that thread and the conversation list", async () => {
    const { handler, spy } = await wire("message:new");
    handler({ conversationId: "c-1" });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["messages", "c-1"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["conversations"] });
  });

  it("read refreshes the conversation list", async () => {
    const { handler, spy } = await wire("read");
    handler({ conversationId: "c-1", userId: "u-1", lastReadAt: "2026-07-16" });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["conversations"] });
  });

  it("notification:new refreshes notifications", async () => {
    const { handler, spy } = await wire("notification:new");
    handler({ notification: { id: "n-1" } });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });
});
