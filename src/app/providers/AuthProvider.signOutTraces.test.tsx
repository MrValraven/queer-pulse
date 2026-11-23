import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Sign-out forgets the traces a shared device would otherwise hand the next
 * member: the unpublished story draft (SEC-46), the recent global searches
 * (SEC-49) and the invoice tools' issuer details (SEC-51). Demo mode only,
 * as in `AuthProvider.signOutDrafts.test.tsx`: the live branch runs the same
 * wipe before its own work, and demo touches no network.
 */
const STORY_DRAFT_KEY = "qp-story-draft-v1";
const SEARCH_RECENTS_KEY = "qp:search:recents";
const ISSUER_KEY = "qp.economy.issuer";

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
  window.localStorage.setItem(STORY_DRAFT_KEY, '{"form":{}}');
  window.localStorage.setItem(SEARCH_RECENTS_KEY, '["clinic"]');
  window.localStorage.setItem(ISSUER_KEY, '{"nif":"123456789"}');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AuthProvider sign-out and per-member traces", () => {
  it("keeps the story draft, recents and issuer while signed in", async () => {
    const { useAuth, wrapper } = await loadDemoAuth();

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loggedIn).toBe(true);
    expect(window.localStorage.getItem(STORY_DRAFT_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(SEARCH_RECENTS_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(ISSUER_KEY)).not.toBeNull();
  });

  it("forgets the story draft, recents and issuer on sign-out", async () => {
    const { useAuth, wrapper } = await loadDemoAuth();
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.signOut());

    expect(result.current.loggedIn).toBe(false);
    expect(window.localStorage.getItem(STORY_DRAFT_KEY)).toBeNull();
    expect(window.localStorage.getItem(SEARCH_RECENTS_KEY)).toBeNull();
    expect(window.localStorage.getItem(ISSUER_KEY)).toBeNull();
  });
});
