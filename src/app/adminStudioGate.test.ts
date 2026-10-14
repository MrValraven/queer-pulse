import { describe, expect, it } from "vitest";
import { ADMIN_NAV_SECTIONS } from "../shared/components/layout/adminNav.data";
import { requiredRole } from "./authGate";
import { routes } from "./routeMap";

describe("Studio discovery console gate", () => {
  it("admits moderators at /admin/studio, as its controllers do", () => {
    expect(requiredRole(routes.adminStudio)).toBe("mod");
  });

  it("offers the nav item to every staff tier with no grant attached", () => {
    const item = ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
      (candidate) => candidate.to === routes.adminStudio,
    );
    expect(item?.labelKey).toBe("shared:adminNav.items.studio");
    expect(item?.capabilities).toBeUndefined();
    expect(item?.isAdminOnly).toBeUndefined();
  });
});
