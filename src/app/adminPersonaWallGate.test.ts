import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_SECTIONS,
  visibleAdminNavSections,
} from "../shared/components/layout/adminNav.data";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
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

describe("Directory wall console gate", () => {
  it("keeps /admin/personas/wall for admins", () => {
    expect(routes.adminPersonaWall).toBe("/admin/personas/wall");
    expect(requiredRole(routes.adminPersonaWall)).toBe("admin");
  });

  it("opens it to no staff grant", () => {
    expect(elevatingCapabilities(routes.adminPersonaWall)).toEqual([]);
  });

  it("marks the nav item Admin only", () => {
    const item = ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
      (candidate) => candidate.to === routes.adminPersonaWall,
    );
    expect(item?.labelKey).toBe("admin:personaWall.navLabel");
    expect(item?.isAdminOnly).toBe(true);
    expect(item?.capabilities).toBeUndefined();
  });

  it("puts it on an admin's rail", () => {
    expect(
      navDestinations({ isFullConsole: true, isAdmin: true, staffRoles: [] }),
    ).toContain(routes.adminPersonaWall);
  });

  it("leaves it off a moderator's rail", () => {
    expect(
      navDestinations({ isFullConsole: true, isAdmin: false, staffRoles: [] }),
    ).not.toContain(routes.adminPersonaWall);
  });

  it("leaves it off a directory moderator's rail", () => {
    expect(
      navDestinations({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["directory_moderator"],
      }),
    ).not.toContain(routes.adminPersonaWall);
  });
});
