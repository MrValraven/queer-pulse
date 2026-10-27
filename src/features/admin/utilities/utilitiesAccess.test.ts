import { describe, expect, it } from "vitest";
import { elevatingCapabilities, requiredRole } from "../../../app/authGate";
import { routes } from "../../../app/routeMap";
import { visibleAdminNavSections } from "../../../shared/components/layout/adminNav.data";

function navDestinations(options: {
  isFullConsole: boolean;
  isAdmin: boolean;
  staffRoles: Parameters<typeof visibleAdminNavSections>[0]["staffRoles"];
}): string[] {
  return visibleAdminNavSections(options).flatMap((section) =>
    section.items.map((item) => item.to),
  );
}

describe("Utilities access", () => {
  it("admits moderators to the hub and the PDF tool", () => {
    expect(requiredRole(routes.adminUtilities)).toBe("mod");
    expect(requiredRole(routes.adminUtilitiesPdf)).toBe("mod");
  });

  it("lets no staff grant open the utilities", () => {
    expect(elevatingCapabilities(routes.adminUtilities)).toEqual([]);
    expect(elevatingCapabilities(routes.adminUtilitiesPdf)).toEqual([]);
  });

  it("shows the Utilities link to a moderator", () => {
    const destinations = navDestinations({
      isFullConsole: true,
      isAdmin: false,
      staffRoles: [],
    });
    expect(destinations).toContain(routes.adminUtilities);
  });

  it("hides the Utilities link from a member who holds only a staff grant", () => {
    const destinations = navDestinations({
      isFullConsole: false,
      isAdmin: false,
      staffRoles: ["product_manager", "housing_moderator", "editorial"],
    });
    expect(destinations).not.toContain(routes.adminUtilities);
  });
});
