import { FiUsers } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_SECTIONS,
  visibleAdminNavSections,
} from "../shared/components/layout/adminNav.data";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
import { adminLeadPath } from "../features/admin/leads/leadPaths";
import { LEAD_LIST_PARAM } from "../features/admin/leads/leadsList.data";
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

/** The Leads item's destination: the list opened on the viewer's and nobody's leads. */
const LEADS_NAV_TO = `${routes.adminLeads}?assignedTo=me_or_unassigned`;

function leadsItem() {
  return ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
    (candidate) => candidate.to.startsWith(routes.adminLeads),
  );
}

function reachesLeads(options: Parameters<typeof navDestinations>[0]): boolean {
  return navDestinations(options).some((to) =>
    to.startsWith(routes.adminLeads),
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
      reachesLeads({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["music_manager_producer"],
      }),
    ).toBe(true);
    expect(leadsItem()).toMatchObject({
      labelKey: "shared:adminNav.items.leads",
      badge: "leads",
      icon: FiUsers,
      capabilities: ["music_manager_producer"],
    });
  });

  it("opens Leads on the mine and unassigned view", () => {
    expect(leadsItem()?.to).toBe(LEADS_NAV_TO);
    expect(
      new URLSearchParams(LEADS_NAV_TO.split("?")[1]).get(
        LEAD_LIST_PARAM.assignedTo,
      ),
    ).toBe("me_or_unassigned");
  });

  it("leaves it off a moderator's and a partnerships holder's rail", () => {
    expect(
      reachesLeads({ isFullConsole: true, isAdmin: false, staffRoles: [] }),
    ).toBe(false);
    expect(
      reachesLeads({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["partnerships"],
      }),
    ).toBe(false);
  });
});
