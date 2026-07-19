import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const page = { items: [], total: 0, page: 1, pageSize: 20 };
const payload = {
  profile: { slug: "tiago-costa", limited: false, firstName: "Tiago" },
  saved: page,
  blocks: page,
  mutes: page,
};

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

/**
 * Fresh module graph per test (same convention as
 * `usePlatformStatus.live.test.tsx` / `useJobs.live.test.tsx`): `vi.resetModules()`
 * then `vi.doMock` the collaborators before dynamically re-importing the hook, so
 * each test's hook actually closes over its own mocked `useDemoMode`/`useAuth`
 * bindings instead of whatever the first import in the file saw (a static
 * `vi.mock` plus a later `vi.doMock` doesn't re-bind an already-imported module's
 * dependencies). `QueryClient`/`QueryClientProvider` stay statically imported at
 * the top of the file, matching the established pattern — react-query's module
 * identity is stable across `resetModules()` in this setup, so the wrapper's
 * `QueryClientProvider` and the freshly re-imported hook's internal
 * `useQueryClient` resolve the same context.
 */
async function loadHook(opts: {
  demoMode: boolean;
  loggedIn?: boolean;
  getBootstrapImpl?: () => Promise<typeof payload>;
}) {
  vi.resetModules();
  const getBootstrap = vi.fn(opts.getBootstrapImpl ?? (async () => payload));
  vi.doMock("./bootstrap.api", () => ({ getBootstrap }));
  vi.doMock("../../app/providers/DemoModeProvider", () => ({
    useDemoMode: () => ({ demoMode: opts.demoMode }),
  }));
  vi.doMock("../../app/providers/authContext", () => ({
    useAuth: () => ({
      loggedIn: opts.loggedIn ?? true,
      user: { profile: { slug: "tiago-costa" } },
    }),
  }));
  const { useSessionBootstrap, useSessionBootstrapSettled } = await import(
    "./useSessionBootstrap"
  );
  return { useSessionBootstrap, useSessionBootstrapSettled, getBootstrap };
}

describe("useSessionBootstrap", () => {
  // Seeding happens inside `queryFn` now (before the fetch promise resolves),
  // not in a `useEffect` after render — see the comment on `seedFromBootstrap`
  // in useSessionBootstrap.ts for why. These two tests don't need to change to
  // prove that: `waitFor` still just polls the cache until the seeded values
  // show up, regardless of which mechanism put them there.
  it("seeds the blocks and mutes caches under the keys SocialProvider reads", async () => {
    const { useSessionBootstrap } = await loadHook({ demoMode: false });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderHook(() => useSessionBootstrap(), { wrapper: wrapper(client) });

    await waitFor(() => {
      expect(client.getQueryData(["blocks", false])).toEqual(page);
      expect(client.getQueryData(["mutes", false])).toEqual(page);
    });
  });

  it("seeds the profile cache as an adapted view-model, not the raw DTO", async () => {
    const { useSessionBootstrap } = await loadHook({ demoMode: false });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderHook(() => useSessionBootstrap(), { wrapper: wrapper(client) });

    await waitFor(() => {
      const seeded = client.getQueryData(["profile", false, "tiago-costa"]);
      expect(seeded).toMatchObject({ limited: false });
      expect(seeded).toHaveProperty("member");
    });
  });

  it("does not fetch in demo mode", async () => {
    const { useSessionBootstrap, getBootstrap } = await loadHook({
      demoMode: true,
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderHook(() => useSessionBootstrap(), { wrapper: wrapper(client) });

    // A synchronous assertion right after `renderHook` would pass even if
    // gating were completely broken, since the mocked `getBootstrap` promise
    // hasn't had a chance to resolve either way at that instant. `waitFor`
    // makes this discriminating: it polls for `timeout` ms, so if `enabled`
    // were wrongly `true` here, `getBootstrap` would be called almost
    // immediately and this assertion would stop rejecting well inside the
    // window. Only because it keeps failing for the *whole* window can we
    // conclude gating actually held, rather than that we just checked too
    // early.
    await expect(
      waitFor(() => expect(getBootstrap).toHaveBeenCalled(), { timeout: 250 }),
    ).rejects.toThrow();
    expect(getBootstrap).not.toHaveBeenCalled();
  });
});

describe("useSessionBootstrapSettled", () => {
  it("is open (true) in demo mode, where bootstrap never runs", async () => {
    const { useSessionBootstrapSettled } = await loadHook({ demoMode: true });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useSessionBootstrapSettled(), {
      wrapper: wrapper(client),
    });

    // Must be true from the very first render, not eventually — the bootstrap
    // query is disabled and will never settle in demo mode, so a gate that
    // waited on it would hang forever and the consumers (blocks, mutes, own
    // profile) would never fetch. This is the case the fix is most likely to
    // get wrong.
    expect(result.current).toBe(true);
  });

  it("is open (true) when logged out, where bootstrap never runs either", async () => {
    const { useSessionBootstrapSettled } = await loadHook({
      demoMode: false,
      loggedIn: false,
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useSessionBootstrapSettled(), {
      wrapper: wrapper(client),
    });

    expect(result.current).toBe(true);
  });

  it("opens once bootstrap succeeds", async () => {
    const { useSessionBootstrapSettled } = await loadHook({
      demoMode: false,
      loggedIn: true,
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useSessionBootstrapSettled(), {
      wrapper: wrapper(client),
    });

    // Closed while the request is in flight — this is what actually makes the
    // gate useful: it holds the consumers off just long enough for the
    // seeding inside `queryFn` to land before their `enabled` can flip true.
    expect(result.current).toBe(false);

    await waitFor(() => expect(result.current).toBe(true));
  });

  it("opens even when bootstrap errors, so consumers fall back to their own endpoints", async () => {
    const { useSessionBootstrapSettled } = await loadHook({
      demoMode: false,
      loggedIn: true,
      getBootstrapImpl: async () => {
        throw new Error("bootstrap unavailable (404/500)");
      },
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useSessionBootstrapSettled(), {
      wrapper: wrapper(client),
    });

    expect(result.current).toBe(false);

    // Settled-not-succeeded: a rejected bootstrap must still open the gate.
    // If this only opened on success, a single 404/500 from an
    // independently-deployed backend would permanently stall blocks, mutes
    // and the member's own profile.
    await waitFor(() => expect(result.current).toBe(true));
  });
});
