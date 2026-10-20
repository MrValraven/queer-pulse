import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

/** Sign-out forgets which warned tracks this tab agreed to hear (spec 6.3),
 *  so the next member here is asked again. Demo mode, as in
 *  AuthProvider.signOutStudioQueue.test.tsx. The consent module is imported
 *  after resetModules, so it is the instance AuthProvider uses. */
async function loadDemoAuth() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "");
  vi.stubEnv("VITE_DEMO", "1");
  const { DemoModeProvider } = await import("./DemoModeProvider");
  const { AuthProvider } = await import("./AuthProvider");
  const { useAuth } = await import("./authContext");
  const consent =
    await import("../../features/studio/player/studioWarningGate");
  const reveals = await import("../../features/forum/forumWarnings.helpers");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DemoModeProvider>
      <AuthProvider>{children}</AuthProvider>
    </DemoModeProvider>
  );
  return { useAuth, wrapper, consent, reveals };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AuthProvider sign-out and the warning consent", () => {
  it("forgets every warned track this tab agreed to hear", async () => {
    const { useAuth, wrapper, consent } = await loadDemoAuth();
    consent.consentToWarnedTrack("warned-track");
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.signOut());

    expect(consent.hasWarningConsent("warned-track")).toBe(false);
  });

  it("covers the lyrics and show notes this tab uncovered, and keeps forum reveals", async () => {
    const { useAuth, wrapper, reveals } = await loadDemoAuth();
    const studioKey = `${reveals.STUDIO_TRACK_REVEAL_PREFIX}warned-track`;
    const studioReveal = renderHook(() =>
      reveals.useContentWarningReveal(studioKey),
    );
    const forumReveal = renderHook(() =>
      reveals.useContentWarningReveal("forum-thread"),
    );
    act(() => studioReveal.result.current.reveal());
    act(() => forumReveal.result.current.reveal());
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.signOut());

    const studioAfter = renderHook(() =>
      reveals.useContentWarningReveal(studioKey),
    );
    const forumAfter = renderHook(() =>
      reveals.useContentWarningReveal("forum-thread"),
    );
    expect(studioAfter.result.current.isRevealed).toBe(false);
    expect(forumAfter.result.current.isRevealed).toBe(true);
  });
});
