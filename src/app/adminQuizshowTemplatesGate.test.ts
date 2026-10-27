import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_SECTIONS,
  visibleAdminNavSections,
  type AdminNavFeature,
} from "../shared/components/layout/adminNav.data";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
import {
  elevatingCapabilities,
  isQuizshowStaffPath,
  requiredRole,
} from "./authGate";
import { routes } from "./routeMap";

const TEMPLATE_PATH = `${routes.adminQuizshowTemplates}/t-1`;

function navDestinations(options: {
  isFullConsole: boolean;
  isAdmin: boolean;
  staffRoles: StaffRoleId[];
  visibleFeatures: AdminNavFeature[];
}): string[] {
  return visibleAdminNavSections(options).flatMap((section) =>
    section.items.map((item) => item.to),
  );
}

describe("Pulse Live quiz templates console gate", () => {
  it("admits moderators at both templates pages", () => {
    expect(requiredRole(routes.adminQuizshowTemplates)).toBe("mod");
    expect(requiredRole(TEMPLATE_PATH)).toBe("mod");
  });

  it("lets no staff grant open the templates", () => {
    expect(elevatingCapabilities(routes.adminQuizshowTemplates)).toEqual([]);
    expect(elevatingCapabilities(TEMPLATE_PATH)).toEqual([]);
  });

  it("files Quiz templates under Editorial after Studio discovery", () => {
    const editorial = ADMIN_NAV_SECTIONS.find(
      (section) => section.id === "editorial",
    );
    const destinations = editorial?.items.map((item) => item.to) ?? [];
    const studioIndex = destinations.indexOf(routes.adminStudio);
    expect(studioIndex).toBeGreaterThanOrEqual(0);
    expect(destinations[studioIndex + 1]).toBe(routes.adminQuizshowTemplates);

    const item = editorial?.items[studioIndex + 1];
    expect(item?.labelKey).toBe("shared:adminNav.items.quizTemplates");
    expect(item?.feature).toBe("quizshow");
    expect(item?.capabilities).toBeUndefined();
    expect(item?.isAdminOnly).toBeUndefined();
  });

  it("shows Quiz templates to a moderator with Pulse Live access", () => {
    const destinations = navDestinations({
      isFullConsole: true,
      isAdmin: false,
      staffRoles: [],
      visibleFeatures: ["quizshow"],
    });
    expect(destinations).toContain(routes.adminQuizshowTemplates);
  });

  it("hides Quiz templates from a moderator without Pulse Live access", () => {
    const destinations = navDestinations({
      isFullConsole: true,
      isAdmin: false,
      staffRoles: [],
      visibleFeatures: [],
    });
    expect(destinations).not.toContain(routes.adminQuizshowTemplates);
    expect(destinations).toContain(routes.adminStudio);
  });

  it("hides Quiz templates from an admin without Pulse Live access", () => {
    const destinations = navDestinations({
      isFullConsole: true,
      isAdmin: true,
      staffRoles: [],
      visibleFeatures: [],
    });
    expect(destinations).not.toContain(routes.adminQuizshowTemplates);
    expect(destinations).toContain(routes.adminStudio);
  });

  it("hides Quiz templates from a Pulse Live grant holder without a staff role", () => {
    const destinations = navDestinations({
      isFullConsole: false,
      isAdmin: false,
      staffRoles: ["editorial"],
      visibleFeatures: ["quizshow"],
    });
    expect(destinations).not.toContain(routes.adminQuizshowTemplates);
    expect(destinations).toContain(routes.adminMagazineSubmissions);
  });

  it("treats the templates pages as Pulse Live staff paths", () => {
    expect(isQuizshowStaffPath(routes.adminQuizshowTemplates)).toBe(true);
    expect(isQuizshowStaffPath(TEMPLATE_PATH)).toBe(true);
    expect(isQuizshowStaffPath("/admin/studio")).toBe(false);
  });
});
