import { FiClipboard } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_SECTIONS,
  CULTURAL_PRODUCTION_NAV_TO,
  visibleAdminNavSections,
} from "../shared/components/layout/adminNav.data";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
import { culturalGuidePath } from "../features/admin/culturalProduction/culturalProductionPaths";
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

function culturalProductionItem() {
  return ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
    (candidate) => candidate.to.startsWith(routes.adminCulturalProduction),
  );
}

function reachesCulturalProduction(
  options: Parameters<typeof navDestinations>[0],
): boolean {
  return navDestinations(options).some((to) =>
    to.startsWith(routes.adminCulturalProduction),
  );
}

const GUIDE_PATH = culturalGuidePath("demo-guide-quiz-en");

describe("Cultural Production gate", () => {
  it("keeps the page at the mod tier", () => {
    expect(routes.adminCulturalProduction).toBe("/admin/cultural-production");
    expect(routes.adminCulturalGuide).toBe(
      "/admin/cultural-production/guides/:guideId",
    );
    expect(requiredRole(routes.adminCulturalProduction)).toBe("mod");
    expect(requiredRole(GUIDE_PATH)).toBe("mod");
  });

  it("opens the page and a guide to both grants", () => {
    expect(elevatingCapabilities(routes.adminCulturalProduction)).toEqual([
      "cultural_producer",
      "music_manager_producer",
    ]);
    expect(elevatingCapabilities(GUIDE_PATH)).toEqual([
      "cultural_producer",
      "music_manager_producer",
    ]);
  });

  it("puts Cultural Production on a cultural_producer holder's rail with the badge", () => {
    expect(
      reachesCulturalProduction({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["cultural_producer"],
      }),
    ).toBe(true);
    expect(culturalProductionItem()).toMatchObject({
      labelKey: "shared:adminNav.items.culturalProduction",
      badge: "culturalProduction",
      tone: "warn",
      icon: FiClipboard,
      capabilities: ["cultural_producer", "music_manager_producer"],
    });
  });

  it("puts Cultural Production on a music_manager_producer holder's rail with the badge", () => {
    expect(
      reachesCulturalProduction({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["music_manager_producer"],
      }),
    ).toBe(true);
    expect(culturalProductionItem()?.badge).toBe("culturalProduction");
  });

  it("shows it to a moderator without a grant", () => {
    expect(
      reachesCulturalProduction({
        isFullConsole: true,
        isAdmin: false,
        staffRoles: [],
      }),
    ).toBe(true);
  });

  it("keeps it off a plain member's rail", () => {
    expect(
      reachesCulturalProduction({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: [],
      }),
    ).toBe(false);
    expect(
      reachesCulturalProduction({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["partnerships"],
      }),
    ).toBe(false);
  });

  it("gives the nav item the same grants as the route gate", () => {
    expect(culturalProductionItem()?.capabilities).toEqual(
      elevatingCapabilities(routes.adminCulturalProduction),
    );
  });

  it("links the item to my tasks", () => {
    expect(CULTURAL_PRODUCTION_NAV_TO).toBe(
      "/admin/cultural-production?tab=tasks&assignedTo=me",
    );
    expect(culturalProductionItem()?.to).toBe(CULTURAL_PRODUCTION_NAV_TO);
  });
});
