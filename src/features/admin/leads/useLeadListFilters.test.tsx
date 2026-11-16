import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useLeadListFilters } from "./useLeadListFilters";

// The In charge view lives in the URL as `assignedTo`. TestProviders forces
// demo mode and carries the router.

function renderAt(entry: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders initialEntries={[entry]}>{children}</TestProviders>
  );
  return renderHook(
    () => ({ controls: useLeadListFilters(), location: useLocation() }),
    { wrapper },
  );
}

describe("useLeadListFilters In charge view", () => {
  it("reads each In charge view from the URL", () => {
    const { result } = renderAt("/admin/leads?assignedTo=me_or_unassigned");
    expect(result.current.controls.filters.assignedTo).toBe("me_or_unassigned");
    expect(result.current.controls.hasFilters).toBe(true);
  });

  it("reads an unknown view and the plain list as Everyone", () => {
    expect(
      renderAt("/admin/leads?assignedTo=mine").result.current.controls.filters
        .assignedTo,
    ).toBeNull();
    const plain = renderAt("/admin/leads").result.current.controls;
    expect(plain.filters.assignedTo).toBeNull();
    expect(plain.hasFilters).toBe(false);
  });

  it("writes the view and removes it for Everyone", () => {
    const { result } = renderAt("/admin/leads");
    act(() => result.current.controls.setAssignedTo("unassigned"));
    expect(result.current.location.search).toBe("?assignedTo=unassigned");
    act(() => result.current.controls.setAssignedTo(null));
    expect(result.current.location.search).toBe("");
  });

  it("clears the view with Clear filters", () => {
    const { result } = renderAt("/admin/leads?assignedTo=me&type=dj");
    act(() => result.current.controls.clearFilters());
    expect(result.current.location.search).toBe("");
    expect(result.current.controls.filters.assignedTo).toBeNull();
  });
});
