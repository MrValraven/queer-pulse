import { createElement, type ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
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

const authState = { loggedIn: false, checking: false };
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({
    loggedIn: authState.loggedIn,
    checking: authState.checking,
  }),
}));

// No JSX here: this file is `.ts`. The hook translates its page and topic
// rows, so the wrapper carries the real I18nProvider under the query client.
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient() },
    createElement(I18nProvider, null, children),
  );

describe("useSearchData", () => {
  it("serves the mock corpus in demo mode", () => {
    demoState.demoMode = true;
    const { result } = renderHook(() => useSearchData(""), { wrapper });
    expect(result.current.signInRequired).toBe(false);
    // The translated quick destinations lead, and the mock corpus closes the
    // list unchanged.
    expect(result.current.data.some((item) => item.t === "page")).toBe(true);
    expect(result.current.data.slice(-SEARCH_DATA.length)).toEqual(SEARCH_DATA);
    expect(result.current.recents.length).toBeGreaterThan(0);
  });

  it("requires sign-in when logged out in live mode", () => {
    demoState.demoMode = false;
    authState.loggedIn = false;
    authState.checking = false;
    const { result } = renderHook(() => useSearchData("design"), { wrapper });
    expect(result.current.signInRequired).toBe(true);
    expect(result.current.data).toEqual([]);
  });
});
