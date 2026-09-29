import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  MemoryRouter,
  useLocation,
  useNavigationType,
  useSearchParams,
} from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useDeskScopePick, withIssueScope } from "./useDeskScopePick";

function routerAt(entry: string) {
  return function RouterWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
  };
}

function useScopePickHarness() {
  const [, setSearchParams] = useSearchParams();
  return {
    selectIssueScope: useDeskScopePick(setSearchParams),
    location: useLocation(),
    navigationType: useNavigationType(),
  };
}

describe("withIssueScope", () => {
  it("sets the issue and the issue scope and keeps every other param", () => {
    const nextParams = withIssueScope(
      new URLSearchParams("track=unassigned&focus=late&issue=12"),
      "14",
    );
    expect(nextParams.get("issue")).toBe("14");
    expect(nextParams.get("track")).toBe("issue");
    expect(nextParams.get("focus")).toBe("late");
  });
});

describe("useDeskScopePick", () => {
  it("writes the issue and track=issue together in one pick", () => {
    const { result } = renderHook(() => useScopePickHarness(), {
      wrapper: routerAt("/magazine/editor?track=everything&focus=late"),
    });

    act(() => result.current.selectIssueScope("14"));

    const params = new URLSearchParams(result.current.location.search);
    expect(params.get("issue")).toBe("14");
    expect(params.get("track")).toBe("issue");
    expect(params.get("focus")).toBe("late");
  });

  it("replaces the history entry", () => {
    const { result } = renderHook(() => useScopePickHarness(), {
      wrapper: routerAt("/magazine/editor?track=unassigned"),
    });

    act(() => result.current.selectIssueScope("09"));

    expect(result.current.navigationType).toBe("REPLACE");
  });

  it("switches from one issue to another without losing the scope", () => {
    const { result } = renderHook(() => useScopePickHarness(), {
      wrapper: routerAt("/magazine/editor?track=issue&issue=12"),
    });

    act(() => result.current.selectIssueScope("13"));

    const params = new URLSearchParams(result.current.location.search);
    expect(params.get("issue")).toBe("13");
    expect(params.get("track")).toBe("issue");
  });
});
