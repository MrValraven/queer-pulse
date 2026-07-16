import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

/**
 * Demo mode is an explicit build-time opt-in (`VITE_DEMO=1`) and is frozen from
 * `import.meta.env` at config.ts load, so each branch resets modules and stubs
 * the env BEFORE importing the provider.
 *
 * The contract under test is the inversion: demo must NEVER be inferred from a
 * missing `VITE_API_URL`. That inference used to force demo on and lock it,
 * which auto-signed-in every anonymous visitor as the mock DEMO_USER.
 */
async function load(apiUrl: string, demo: string) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", apiUrl);
  vi.stubEnv("VITE_DEMO", demo);
  const mod = await import("./DemoModeProvider");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <mod.DemoModeProvider>{children}</mod.DemoModeProvider>
  );
  return { ...mod, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("DemoModeProvider — no demo opt-in (a normal build)", () => {
  it("stays live even when no backend is configured", async () => {
    // The regression that matters: empty VITE_API_URL must not mean demo.
    const { useDemoMode, wrapper } = await load("", "");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(false);
    expect(result.current.available).toBe(false); // toggle disabled
  });

  it("cannot be switched into demo at runtime", async () => {
    const { useDemoMode, wrapper } = await load("http://api.test", "");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    act(() => result.current.setDemoMode(true));
    expect(result.current.demoMode).toBe(false); // locked off
  });

  it("ignores a stale persisted demo flag from an older build", async () => {
    window.localStorage.setItem("qp.demoMode.v1", "true");
    const { useDemoMode, wrapper } = await load("http://api.test", "");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(false);
  });
});

describe("DemoModeProvider — VITE_DEMO=1, no backend (standalone prototype)", () => {
  it("forces demo mode ON so the prototype runs with no API", async () => {
    const { useDemoMode, wrapper } = await load("", "1");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(true);
    expect(result.current.available).toBe(false); // nothing to switch to
  });

  it("ignores setDemoMode(false) — there is no live API to switch to", async () => {
    const { useDemoMode, wrapper } = await load("", "1");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    act(() => result.current.setDemoMode(false));
    expect(result.current.demoMode).toBe(true); // locked on
  });
});

describe("DemoModeProvider — VITE_DEMO=1 + backend (dev sandbox)", () => {
  it("defaults OFF (live) and reports the toggle available", async () => {
    const { useDemoMode, wrapper } = await load("http://api.test", "1");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(false);
    expect(result.current.available).toBe(true);
  });

  it("toggles and persists to localStorage", async () => {
    const { useDemoMode, wrapper } = await load("http://api.test", "1");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    act(() => result.current.toggle());
    expect(result.current.demoMode).toBe(true);
    expect(window.localStorage.getItem("qp.demoMode.v1")).toBe("true");
  });

  it("reads the persisted value on mount", async () => {
    window.localStorage.setItem("qp.demoMode.v1", "true");
    const { useDemoMode, wrapper } = await load("http://api.test", "1");
    const { result } = renderHook(() => useDemoMode(), { wrapper });
    expect(result.current.demoMode).toBe(true);
  });
});
