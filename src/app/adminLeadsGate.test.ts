import { FiUsers } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_SECTIONS,
  visibleAdminNavSections,
} from "../shared/components/layout/adminNav.data";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
import { adminLeadPath } from "../features/admin/leads/leadPaths";
import { elevatingCapabilities, requiredRole } from "./authGate";
import { routes } from "./routeMap";

function navDestinations(options: {
  isFullConsole: boolean;
  isAdmin: boolean;
  staffRoles: StaffRoleId[];
}): string[] {
  return visibleAdminNavSections(options).flatMap((section) =>
    section.items.map((item) => item.to),
  );
}

describe("Leads directory gate", () => {
  it("keeps /admin/leads behind the admin tier", () => {
    expect(routes.adminLeads).toBe("/admin/leads");
    expect(requiredRole(routes.adminLeads)).toBe("admin");
  });

  it("opens the list and a lead to the music grant", () => {
    expect(elevatingCapabilities(routes.adminLeads)).toEqual([
      "music_manager_producer",
    ]);
    expect(elevatingCapabilities(adminLeadPath("demo-lead-cave-23"))).toEqual([
      "music_manager_producer",
    ]);
  });

  it("builds a lead path with the id encoded", () => {
    expect(adminLeadPath("demo-lead-cave-23")).toBe(
      "/admin/leads/demo-lead-cave-23",
    );
    expect(adminLeadPath("a/b")).toBe("/admin/leads/a%2Fb");
  });

  it("puts Leads on a grant holder's rail with the badge", () => {
    expect(
      navDestinations({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["music_manager_producer"],
      }),
    ).toContain(routes.adminLeads);
    const item = ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
      (candidate) => candidate.to === routes.adminLeads,
    );
    expect(item?.labelKey).toBe("shared:adminNav.items.leads");
    expect(item?.badge).toBe("leads");
    expect(item?.icon).toBe(FiUsers);
    expect(item?.capabilities).toEqual(["music_manager_producer"]);
  });

  it("leaves it off a moderator's rail", () => {
    expect(
      navDestinations({ isFullConsole: true, isAdmin: false, staffRoles: [] }),
    ).not.toContain(routes.adminLeads);
  });

  it("leaves it off a partnerships grant holder's rail", () => {
    expect(
      navDestinations({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["partnerships"],
      }),
    ).not.toContain(routes.adminLeads);
  });
});
