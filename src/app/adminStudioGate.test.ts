import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_SECTIONS,
  visibleAdminNavSections,
} from "../shared/components/layout/adminNav.data";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
import { requiredRole } from "./authGate";
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

describe("Studio discovery console gate", () => {
  it("admits moderators at /admin/studio, as its controllers do", () => {
    expect(requiredRole(routes.adminStudio)).toBe("mod");
  });

  it("offers the nav item to staff and to the music manager grant", () => {
    const item = ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
      (candidate) => candidate.to === routes.adminStudio,
    );
    expect(item?.labelKey).toBe("shared:adminNav.items.studio");
    expect(item?.capabilities).toEqual(["music_manager_producer"]);
    expect(item?.isAdminOnly).toBeUndefined();
  });

  it("keeps Studio discovery on a moderator's rail with no grant", () => {
    expect(
      navDestinations({ isFullConsole: true, isAdmin: false, staffRoles: [] }),
    ).toContain(routes.adminStudio);
  });

  it("puts Studio discovery on a music manager's rail", () => {
    const destinations = navDestinations({
      isFullConsole: false,
      isAdmin: false,
      staffRoles: ["music_manager_producer"],
    });
    expect(destinations).toContain(routes.adminStudio);
    expect(destinations).toContain(routes.adminMusicEvents);
  });

  it("leaves Studio discovery off another grant holder's rail", () => {
    expect(
      navDestinations({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["editorial"],
      }),
    ).not.toContain(routes.adminStudio);
  });
});
