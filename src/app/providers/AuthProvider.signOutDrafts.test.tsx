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
});
