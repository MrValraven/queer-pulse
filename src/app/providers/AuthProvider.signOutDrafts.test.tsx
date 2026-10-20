import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGatheringDraftKey } from "../../features/gatherings/createGatheringDraftStorage";

/**
 * Sign-out forgets the create wizard's stored drafts (ruling F4). Demo mode
 * only, as in `AuthProvider.test.tsx`: the live branch calls the same clear
 * before its own work, and demo touches no network.
 */
async function loadDemoAuth() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "");
  vi.stubEnv("VITE_DEMO", "1");
  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { AuthProvider } = await import("./AuthProvider");
  const { useAuth } = await import("./authContext");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DemoModeProvider>
      <AuthProvider>{children}</AuthProvider>
    </DemoModeProvider>
  );
  return { useAuth, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AuthProvider sign-out and gathering drafts", () => {
  it("keeps a stored draft while the member stays signed in", async () => {
    const draftKey = createGatheringDraftKey("demo");
    window.localStorage.setItem(draftKey, "{}");
    const { useAuth, wrapper } = await loadDemoAuth();

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loggedIn).toBe(true);
    expect(window.localStorage.getItem(draftKey)).toBe("{}");
  });

  it("forgets every stored draft on sign-out", async () => {
    const memberDraftKey = createGatheringDraftKey("demo");
    const anonDraftKey = createGatheringDraftKey(null);
    window.localStorage.setItem(memberDraftKey, "{}");
    window.localStorage.setItem(anonDraftKey, "{}");
    const { useAuth, wrapper } = await loadDemoAuth();
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.signOut());

    expect(result.current.loggedIn).toBe(false);
    expect(window.localStorage.getItem(memberDraftKey)).toBeNull();
    expect(window.localStorage.getItem(anonDraftKey)).toBeNull();
  });

  it("forgets every creator draft copy on sign-out", async () => {
    window.localStorage.setItem("qp-listing-edit-draft.v1.casa", "{}");
    window.sessionStorage.setItem("qp.community-draft.demo", "{}");
    const { useAuth, wrapper } = await loadDemoAuth();
    const { queryClient } = await import("../../shared/api/queryClient");
    const { demoSaveCreatorDraft, demoGetCreatorDraft } =
      await import("../../features/creatorDrafts/api/creatorDrafts.demoStore");
    await demoSaveCreatorDraft(
      { kind: "event", listingRef: null },
      {
        payload: { title: "Picnic" },
        payloadVersion: 1,
        baseRevision: null,
        progress: null,
        missing: null,
      },
    );
    queryClient.setQueryData(["creator-draft", "event", "", true], {
      payload: { title: "Picnic" },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.signOut());

    expect(
      queryClient.getQueryData(["creator-draft", "event", "", true]),
    ).toBeUndefined();
    await expect(
      demoGetCreatorDraft({ kind: "event", listingRef: null }),
    ).resolves.toBeNull();
    expect(
      window.localStorage.getItem("qp-listing-edit-draft.v1.casa"),
    ).toBeNull();
    expect(window.sessionStorage.getItem("qp.community-draft.demo")).toBeNull();
  });
});
