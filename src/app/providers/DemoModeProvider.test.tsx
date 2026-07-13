import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

/**
 * `apiAvailable` is frozen from `import.meta.env.VITE_API_URL` at config.ts load,
 * so each branch resets modules and stubs the env BEFORE importing the provider.
 */
async function load(apiUrl: string) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", apiUrl);
  const mod = await import("./DemoModeProvider");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <mod.DemoModeProvider>{children}</mod.DemoModeProvider>
  );
  return { ...mod, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("DemoModeProvider — no backend configured", () => {
  it("forces demo mode ON and reports unavailable", async () => {
    const { useDemoMode, wrapper } = await load("");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(true);
    expect(result.current.available).toBe(false);
  });

  it("ignores setDemoMode(false) when no backend is available", async () => {
    const { useDemoMode, wrapper } = await load("");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    act(() => result.current.setDemoMode(false));
    expect(result.current.demoMode).toBe(true); // locked on
  });
});

describe("DemoModeProvider — backend configured", () => {
  it("defaults OFF (live) and reports available", async () => {
    const { useDemoMode, wrapper } = await load("http://api.test");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(false);
    expect(result.current.available).toBe(true);
  });

  it("toggles and persists to localStorage", async () => {
    const { useDemoMode, wrapper } = await load("http://api.test");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    act(() => result.current.toggle());
    expect(result.current.demoMode).toBe(true);
    expect(window.localStorage.getItem("qp.demoMode.v1")).toBe("true");
  });

  it("reads the persisted value on mount", async () => {
    window.localStorage.setItem("qp.demoMode.v1", "true");
    const { useDemoMode, wrapper } = await load("http://api.test");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(true);
  });
});
