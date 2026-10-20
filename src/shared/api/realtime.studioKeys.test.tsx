import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { studioSafetyKeys } from "../../features/studio/api/studioSafetyQueryKeys";
import { studioKeys } from "../../features/studio/api/studioQueryKeys";

/**
 * realtime.ts writes the Studio query keys out literally so this shared
 * module does not import the Studio API. This suite drives real notices
 * through the socket handler and pins each invalidated key to the key
 * factory, so a change to a factory fails here instead of silently breaking
 * the live refresh. Same module-reset harness as realtime.detailRefresh.
 */

const state = vi.hoisted(() => ({ demoMode: false, loggedIn: true }));

const socket = vi.hoisted(() => ({
  on: vi.fn(),
  disconnect: vi.fn(),
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

async function loadRealtime(): Promise<RealtimeModule> {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://api.test");
  return import("./realtime");
}

async function settle(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function wire() {
  const mod = await loadRealtime();
  const { queryClient } = await import("./queryClient");
  function Consumer() {
    mod.useRealtimeConnection();
    return null;
  }
  render(
    <mod.RealtimeProvider>
      <Consumer />
    </mod.RealtimeProvider>,
  );
  await settle();
  const handler = socket.on.mock.calls.find(
    (call) => call[0] === "notification:new",
  )?.[1] as (notification: unknown) => void;
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const invalidatedKeys = () =>
    invalidate.mock.calls.map(
      ([filters]) => (filters as { queryKey: unknown[] }).queryKey,
    );
  return { handler, invalidatedKeys };
}

function notice(type: string, payload: Record<string, unknown>) {
  return {
    id: "n-1",
    type,
    read: true,
    createdAt: "2026-10-19T10:00:00Z",
    payload,
  };
}

beforeEach(() => {
  state.demoMode = false;
  state.loggedIn = true;
  ioMock.mockReset();
  ioMock.mockReturnValue(socket);
  socket.on.mockClear();
  socket.disconnect.mockClear();
});

describe("realtime Studio keys match the key factories", () => {
  it("a take-down notice refreshes studioKeys.release", async () => {
    const { handler, invalidatedKeys } = await wire();
    handler(notice("studio_release_taken_down", { releaseId: "r-1" }));
    expect(invalidatedKeys()).toContainEqual([
      ...studioKeys.release(false, "r-1"),
    ]);
  });

  it("an owner claim notice refreshes studioKeys.release and studioKeys.track", async () => {
    const { handler, invalidatedKeys } = await wire();
    handler(
      notice("studio_copyright_claim_accepted", {
        releaseId: "r-2",
        trackId: "t-2",
      }),
    );
    const keys = invalidatedKeys();
    expect(keys).toContainEqual([...studioKeys.release(false, "r-2")]);
    expect(keys).toContainEqual([...studioKeys.track(false, "t-2")]);
  });

  it("a claimant notice refreshes studioSafetyKeys.myClaims", async () => {
    const { handler, invalidatedKeys } = await wire();
    handler(
      notice("studio_copyright_claim_declined", {
        releaseId: "r-3",
        trackId: "t-3",
      }),
    );
    expect(invalidatedKeys()).toContainEqual([
      ...studioSafetyKeys.myClaims(false),
    ]);
  });
});
