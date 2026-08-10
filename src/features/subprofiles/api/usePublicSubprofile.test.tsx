import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { usePublicSubprofile } from "./usePublicSubprofile";

/**
 * DEMO-mode suite for `usePublicSubprofile`'s Phase 1b discriminated union —
 * `resolvePublicAccessDemo` mirroring the backend's `resolvePublicAccess` rule
 * order over the demo registry's dedicated restricted-state fixtures
 * (`subprofiles.data.ts`). Paired with `usePublicSubprofile.live.test.tsx`
 * (same four outcomes, over MSW instead of the mock registry) and
 * `SubprofilePage.test.tsx` (the same states, rendered end to end).
 */

beforeEach(() => {
  window.localStorage.clear();
});

describe("usePublicSubprofile (demo mode, by-handle)", () => {
  it("resolves an open, published, unlinked persona to state:ok", async () => {
    const { result } = renderHook(
      () => usePublicSubprofile({ handle: "nightform" }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current.state).toBe("ok");
    if (result.current.state === "ok") {
      expect(result.current.data.displayName).toBe("NIGHTFORM");
      expect(result.current.data.status).toBe("published");
    }
  });

  it("resolves a visibility:private persona to state:restricted/private for a visitor", async () => {
    const { result } = renderHook(
      () => usePublicSubprofile({ handle: "anika-journal" }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current).toEqual({ state: "restricted", restricted: "private" });
  });

  it("resolves a visibility:network persona to state:restricted/members_only for a signed-out visitor", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "false");
    const { result } = renderHook(
      () => usePublicSubprofile({ handle: "afterhours-jordan" }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current).toEqual({
      state: "restricted",
      restricted: "members_only",
    });
  });

  it("resolves a visibility:network persona to state:ok for a signed-in (any) member", async () => {
    // Phase 1b's simplified "network" gate: authenticated at all, not a
    // trust-graph check — TestProviders' default demo session is signed in.
    const { result } = renderHook(
      () => usePublicSubprofile({ handle: "afterhours-jordan" }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current.state).toBe("ok");
  });

  it("resolves a removedAt persona to state:restricted/removed", async () => {
    const { result } = renderHook(
      () => usePublicSubprofile({ handle: "casa-corvo-antiga" }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current).toEqual({ state: "restricted", restricted: "removed" });
  });

  it("resolves an unknown handle to state:not-found", async () => {
    const { result } = renderHook(
      () => usePublicSubprofile({ handle: "does-not-exist-at-all" }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current).toEqual({ state: "not-found" });
  });
});

describe("usePublicSubprofile (demo mode, owner-draft preview)", () => {
  it("resolves the signed-in owner's own draft to state:ok with status:draft", async () => {
    // TIAGO_DRAFT is unlinked with handle:null (assigned on publish); its
    // owner-preview address falls back to the internal slug ("code").
    const { result } = renderHook(() => usePublicSubprofile({ handle: "code" }), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current.state).toBe("ok");
    if (result.current.state === "ok") {
      expect(result.current.data.status).toBe("draft");
      expect(result.current.data.viewerIsMember).toBe(true);
    }
  });

  it("resolves the same draft to state:not-found for a signed-out visitor", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "false");
    const { result } = renderHook(() => usePublicSubprofile({ handle: "code" }), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.state).not.toBe("loading"));
    expect(result.current).toEqual({ state: "not-found" });
  });
});
