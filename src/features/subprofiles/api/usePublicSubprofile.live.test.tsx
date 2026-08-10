import { renderHook, waitFor } from "@testing-library/react";
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
import type { PublicSubprofileArgs } from "./usePublicSubprofile";

/**
 * LIVE-mode suite for `usePublicSubprofile`'s Phase 1b discriminated union,
 * driven through the by-handle + nested-single-item MSW handlers (both now
 * resolve the Shared Contract's 200/403 `{restrictedState}`/404 shape off the
 * demo registry as an anonymous viewer — see `publicAccessResponse` in
 * `test/msw/subprofiles.handlers.ts`). Mirrors the live-mode harness in
 * `useSubprofile.live.test.tsx`: `vi.resetModules()` +
 * `vi.stubEnv("VITE_API_URL", ...)` before dynamically re-importing.
 *
 * `useAuth` is mocked directly (the repo's established pattern — see
 * `useFeed.live.test.tsx`) instead of wrapping in the real `AuthProvider`:
 * that provider unconditionally fires `/csrf-token` + `/auth/me` in live
 * mode, which this suite has no need of — the live branch of
 * `usePublicSubprofile` never reads `viewerSlug` itself (the owner/co-owner
 * check happens server-side), so a fixed "signed out" mock is all it needs.
 */
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ user: null }),
}));

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
  const { usePublicSubprofile } = await import("./usePublicSubprofile");
  const { DemoModeProvider } = await import(
    "../../../app/providers/DemoModeProvider"
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return { usePublicSubprofile, wrapper };
}

async function resolve(args: PublicSubprofileArgs) {
  const { usePublicSubprofile, wrapper } = await loadLive();
  const { result } = renderHook(() => usePublicSubprofile(args), { wrapper });
  await waitFor(() => expect(result.current.state).not.toBe("loading"));
  return result.current;
}

describe("usePublicSubprofile (live mode via MSW, by-handle)", () => {
  it("maps a 200 to state:ok with the adapted view", async () => {
    const outcome = await resolve({ handle: "nightform" });
    expect(outcome.state).toBe("ok");
    if (outcome.state === "ok") {
      expect(outcome.data.displayName).toBe("NIGHTFORM");
      expect(outcome.data.status).toBe("published");
    }
  });

  it("maps a 403 {restrictedState:'private'} to state:restricted", async () => {
    const outcome = await resolve({ handle: "anika-journal" });
    expect(outcome).toEqual({ state: "restricted", restricted: "private" });
  });

  it("maps a 403 {restrictedState:'members_only'} to state:restricted", async () => {
    const outcome = await resolve({ handle: "afterhours-jordan" });
    expect(outcome).toEqual({
      state: "restricted",
      restricted: "members_only",
    });
  });

  it("maps a 403 {restrictedState:'removed'} to state:restricted", async () => {
    const outcome = await resolve({ handle: "casa-corvo-antiga" });
    expect(outcome).toEqual({ state: "restricted", restricted: "removed" });
  });

  it("maps a 404 to state:not-found", async () => {
    const outcome = await resolve({ handle: "does-not-exist-at-all" });
    expect(outcome).toEqual({ state: "not-found" });
  });
});

describe("usePublicSubprofile (live mode via MSW, nested single-item route)", () => {
  it("calls the new GET /profiles/:slug/subprofiles/:subslug route, not the bulk list", async () => {
    const outcome = await resolve({ ownerSlug: "rui", subslug: "engineering" });
    expect(outcome.state).toBe("ok");
    if (outcome.state === "ok") {
      expect(outcome.data.displayName).toBe("Rui Marçal");
    }
  });

  it("maps a 404 on the nested route to state:not-found", async () => {
    const outcome = await resolve({
      ownerSlug: "rui",
      subslug: "does-not-exist",
    });
    expect(outcome).toEqual({ state: "not-found" });
  });
});
