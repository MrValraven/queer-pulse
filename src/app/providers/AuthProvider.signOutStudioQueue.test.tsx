import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Sign-out forgets the Studio queue saved in this tab (contract C.4). Demo
 *  mode, as in AuthProvider.signOutDrafts.test.tsx: the live branch runs the
 *  same clear before its own work. */
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
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AuthProvider sign-out and the Studio queue", () => {
  it("forgets every saved Studio queue on sign-out", async () => {
    window.sessionStorage.setItem("studio.queue.demo", "{}");
    window.sessionStorage.setItem("studio.queue.someone-else", "{}");
    const { useAuth, wrapper } = await loadDemoAuth();
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.signOut());

    expect(window.sessionStorage.getItem("studio.queue.demo")).toBeNull();
    expect(
      window.sessionStorage.getItem("studio.queue.someone-else"),
    ).toBeNull();
  });
});
