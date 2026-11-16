import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import {
  matchesPath,
  navItemPathOf,
  useAdminNavSections,
} from "./useAdminNavSections";

/** The Leads item's destination: the list opened on the viewer's and nobody's leads. */
const LEADS_NAV_TO = `${routes.adminLeads}?assignedTo=me_or_unassigned`;

function routerAt(pathname: string) {
  return function RouterWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>;
  };
}

describe("useAdminNavSections leads", () => {
  it("matches the list and a lead page against the Leads item's path", () => {
    expect(matchesPath("/admin/leads", LEADS_NAV_TO)).toBe(true);
    expect(matchesPath("/admin/leads/demo-lead-cave-23", LEADS_NAV_TO)).toBe(
      true,
    );
    expect(matchesPath("/admin/leadsy", LEADS_NAV_TO)).toBe(false);
    expect(navItemPathOf(LEADS_NAV_TO)).toBe("/admin/leads");
    expect(navItemPathOf("/admin/members")).toBe("/admin/members");
  });

  it("opens the Communities section on a lead page", () => {
    window.localStorage.clear();
    const { result } = renderHook(() => useAdminNavSections(), {
      wrapper: routerAt("/admin/leads/demo-lead-cave-23"),
    });
    expect(result.current.isSectionOpen("communities", false)).toBe(true);
  });
});
