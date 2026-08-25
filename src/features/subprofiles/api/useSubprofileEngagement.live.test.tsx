import { act, renderHook } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API } from "../../../test/msw/handlers";
import { TestProviders } from "../../../test/TestProviders";
import { useEndorsement } from "./useEndorsement";

/**
 * LIVE-mode engagement suite for the endorse/follow mutation hooks, driven
 * through the pre-registered subprofile MSW handlers (POST/DELETE
 * `/subprofiles/:id/endorse` + `/follow`), which flip the shared in-memory demo
 * state. Both the demo and live branches mutate that same registry, so every
 * test runs a FULL endorse→withdraw / follow→unfollow cycle back to its
 * baseline count — making the assertions independent of test order. The paired
 * demo test registers no extra handler, so `onUnhandledRequest: "error"` proves
 * the demo branch never touches the network.
 *
 * Persona baselines (from `subprofiles.data.ts`): NIGHTFORM `sp-diogo-nightform`
 * endorsementCount 3; GRAIN `sp-andre-grain` followerCount 23.
 */

const NIGHTFORM_ID = "sp-diogo-nightform";
const GRAIN_ID = "sp-andre-grain";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
});

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { useEndorsement: useEndorsementLive } =
    await import("./useEndorsement");
  const { useFollow: useFollowLive } = await import("./useFollow");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return {
    useEndorsement: useEndorsementLive,
    useFollow: useFollowLive,
    wrapper,
  };
}

describe("useEndorsement (demo mode)", () => {
  it("endorses then withdraws against the mock registry, no network", async () => {
    const { result } = renderHook(() => useEndorsement(NIGHTFORM_ID), {
      wrapper: TestProviders,
    });

    let endorsed;
    await act(async () => {
      endorsed = await result.current.endorse.mutateAsync({
        currentEndorsementCount: 3,
      });
    });
    expect(endorsed).toEqual({ endorsementCount: 4, viewerEndorsed: true });

    let withdrawn;
    await act(async () => {
      withdrawn = await result.current.withdraw.mutateAsync({
        currentEndorsementCount: 4,
      });
    });
    expect(withdrawn).toEqual({ endorsementCount: 3, viewerEndorsed: false });
  });
});

describe("useEndorsement (live mode via MSW)", () => {
  it("POSTs then DELETEs /subprofiles/:id/endorse, returning the server counts", async () => {
    const { useEndorsement: useEndorsementLive, wrapper } = await loadLive();
    const { result } = renderHook(() => useEndorsementLive(NIGHTFORM_ID), {
      wrapper,
    });

    let endorsed;
    await act(async () => {
      endorsed = await result.current.endorse.mutateAsync({
        currentEndorsementCount: 3,
      });
    });
    expect(endorsed).toEqual({ endorsementCount: 4, viewerEndorsed: true });

    let withdrawn;
    await act(async () => {
      withdrawn = await result.current.withdraw.mutateAsync({
        currentEndorsementCount: 4,
      });
    });
    expect(withdrawn).toEqual({ endorsementCount: 3, viewerEndorsed: false });
  });
});

describe("useFollow (live mode via MSW)", () => {
  it("POSTs then DELETEs /subprofiles/:id/follow, returning the server counts", async () => {
    const { useFollow: useFollowLive, wrapper } = await loadLive();
    const { result } = renderHook(() => useFollowLive(GRAIN_ID), { wrapper });

    let followed;
    await act(async () => {
      followed = await result.current.follow.mutateAsync({
        currentFollowerCount: 23,
      });
    });
    expect(followed).toEqual({ followerCount: 24, viewerFollowing: true });

    let unfollowed;
    await act(async () => {
      unfollowed = await result.current.unfollow.mutateAsync({
        currentFollowerCount: 24,
      });
    });
    expect(unfollowed).toEqual({ followerCount: 23, viewerFollowing: false });
  });
});
