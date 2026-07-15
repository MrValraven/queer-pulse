import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSearchData } from "./useSearchData";
import { SEARCH_DATA } from "../search.data";

// Drive the demo/live branch directly rather than through the real provider,
// which force-locks demo ON in the test env (no VITE_API_URL configured).
const demoState = { demoMode: true };
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({
    demoMode: demoState.demoMode,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

describe("useSearchData", () => {
  it("serves the mock corpus in demo mode", () => {
    demoState.demoMode = true;
    const { result } = renderHook(() => useSearchData());
    expect(result.current.comingSoon).toBe(false);
    expect(result.current.data).toBe(SEARCH_DATA);
    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.recents.length).toBeGreaterThan(0);
  });

  it("returns no data and flags coming-soon in live mode", () => {
    demoState.demoMode = false;
    const { result } = renderHook(() => useSearchData());
    expect(result.current.comingSoon).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.recents).toEqual([]);
  });
});
