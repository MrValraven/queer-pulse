import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEMO_ISSUE, DEMO_ISSUES } from "../data/desk.data";
import { useIssueCloseDate } from "./useIssueCloseDate";

/**
 * Demo mode only: live mode's two branches (`getIssueClosesOn`,
 * `updateIssueClosesOn`) are plain fetch wrappers with no branching logic of
 * their own to protect here.
 */

const modeState = vi.hoisted(() => ({ isDemoMode: true }));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: modeState.isDemoMode }),
}));

const ORIGINAL_CLOSES_ON = DEMO_ISSUE.closesOn;
const ORIGINAL_DEMO_ISSUES = [...DEMO_ISSUES];

function renderCloseDate(
  issueNumber: string,
  options?: Parameters<typeof useIssueCloseDate>[1],
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useIssueCloseDate(issueNumber, options), {
    wrapper,
  });
}

beforeEach(() => {
  modeState.isDemoMode = true;
});

afterEach(() => {
  DEMO_ISSUE.closesOn = ORIGINAL_CLOSES_ON;
  DEMO_ISSUES.splice(0, DEMO_ISSUES.length, ...ORIGINAL_DEMO_ISSUES);
});

describe("useIssueCloseDate", () => {
  it("reads the demo issue's close date by default", async () => {
    const { result } = renderCloseDate(DEMO_ISSUE.number);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.closesOn).toBe(ORIGINAL_CLOSES_ON);
  });

  it("skips the GET when isQueryEnabled is false, but can still save", async () => {
    const { result } = renderCloseDate(DEMO_ISSUE.number, {
      isQueryEnabled: false,
    });

    // The query never starts, so `closesOn` stays at its unloaded default
    // instead of resolving to the demo fixture's real date.
    expect(result.current.isLoading).toBe(false);
    expect(result.current.closesOn).toBeNull();

    await act(async () => {
      await result.current.saveClosesOn("2026-11-01");
    });

    expect(DEMO_ISSUE.closesOn).toBe("2026-11-01");
  });
});
