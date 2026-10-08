import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useDirectoryFilterParams } from "./useDirectoryFilters";

function renderParams(initialUrl: string) {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries: [initialUrl] }, children);
  return renderHook(() => useDirectoryFilterParams(), { wrapper });
}

describe("the Out and about filter", () => {
  it("reads ?mobile=1 on the list and the map", () => {
    expect(
      renderParams("/local/directory?mobile=1").result.current.isOutAndAbout,
    ).toBe(true);
    expect(
      renderParams("/local/directory?view=map&mobile=1").result.current
        .isOutAndAbout,
    ).toBe(true);
  });

  it("reads a stale link as off on the Online tab", () => {
    expect(
      renderParams("/local/directory?view=online&mobile=1").result.current
        .isOutAndAbout,
    ).toBe(false);
  });

  it("drops the param on a switch to Online, so coming back finds it off", () => {
    const { result } = renderParams("/local/directory?mobile=1");
    act(() => result.current.selectView("online"));
    act(() => result.current.selectView("list"));
    expect(result.current.isOutAndAbout).toBe(false);
  });

  it("turns on and off, and Clear filters clears it", () => {
    const { result } = renderParams("/local/directory");
    act(() => result.current.setOutAndAbout(true));
    expect(result.current.isOutAndAbout).toBe(true);
    act(() => result.current.clearFilters());
    expect(result.current.isOutAndAbout).toBe(false);
  });
});
