import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

/**
 * Demo-mode AuthProvider only. Env is left empty so `apiAvailable` is false and
 * demo mode is forced on — the live path (bootstrapCsrf → fetchMe) never runs,
 * so no network is touched. AuthProvider needs DemoModeProvider above it.
 */
async function loadDemoAuth() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "");
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

describe("AuthProvider (demo mode)", () => {
  it("exposes the mock DEMO_USER when logged in", async () => {
    const { useAuth, wrapper } = await loadDemoAuth();
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loggedIn).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe("you@queerpulse.test");
    expect(result.current.role).toBe("member");
    expect(result.current.status).toBe("active");
  });

  it("clears the user after signOut", async () => {
    const { useAuth, wrapper } = await loadDemoAuth();
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.signOut());
    expect(result.current.loggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("restores the mock user after signOut → signIn", async () => {
    const { useAuth, wrapper } = await loadDemoAuth();
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.signOut());
    expect(result.current.user).toBeNull();
    act(() => result.current.signIn());
    expect(result.current.loggedIn).toBe(true);
    expect(result.current.user?.email).toBe("you@queerpulse.test");
  });

  it("starts logged out when localStorage says so", async () => {
    window.localStorage.setItem("qp_logged_in", "false");
    const { useAuth, wrapper } = await loadDemoAuth();
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loggedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
