import { readFileSync } from "node:fs";
import { FiMonitor } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_SECTIONS,
  visibleAdminNavSections,
} from "../shared/components/layout/adminNav.data";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";
import { elevatingCapabilities, isGatedPath, requiredRole } from "./authGate";
import { routes } from "./routeMap";

const VJ_PATHS = [
  routes.adminVj,
  routes.adminVjScreen,
  routes.adminVjRemote,
] as const;

function navDestinations(options: {
  isFullConsole: boolean;
  isAdmin: boolean;
  staffRoles: StaffRoleId[];
}): string[] {
  return visibleAdminNavSections(options).flatMap((section) =>
    section.items.map((item) => item.to),
  );
}

describe("VJ console gate", () => {
  it("keeps the library, screen and remote for admins", () => {
    expect(VJ_PATHS).toEqual([
      "/admin/vj",
      "/admin/vj/screen",
      "/admin/vj/remote",
    ]);
    for (const vjPath of VJ_PATHS) {
      expect(requiredRole(vjPath)).toBe("admin");
      expect(isGatedPath(vjPath)).toBe(true);
    }
  });

  it("opens the library, screen and remote to the vj_operator grant alone", () => {
    for (const vjPath of VJ_PATHS) {
      expect(elevatingCapabilities(vjPath)).toEqual(["vj_operator"]);
    }
  });

  it("keeps every other admin page closed to vj_operator", () => {
    for (const otherPath of [
      routes.admin,
      routes.adminStudio,
      routes.adminMembers,
      routes.adminMusicEvents,
      routes.adminLeads,
    ]) {
      expect(elevatingCapabilities(otherPath)).not.toContain("vj_operator");
    }
  });

  it("files the nav item under the vj_operator grant", () => {
    const item = ADMIN_NAV_SECTIONS.flatMap((section) => section.items).find(
      (candidate) => candidate.to === routes.adminVj,
    );
    expect(item?.labelKey).toBe("shared:adminNav.items.vj");
    expect(item?.icon).toBe(FiMonitor);
    expect(item?.isAdminOnly).toBeUndefined();
    expect(item?.capabilities).toEqual(["vj_operator"]);
  });

  it("puts it on an admin's rail and a grant holder's, and off a moderator's", () => {
    expect(
      navDestinations({ isFullConsole: true, isAdmin: true, staffRoles: [] }),
    ).toContain(routes.adminVj);
    expect(
      navDestinations({ isFullConsole: true, isAdmin: false, staffRoles: [] }),
    ).not.toContain(routes.adminVj);
    expect(
      navDestinations({
        isFullConsole: true,
        isAdmin: false,
        staffRoles: ["vj_operator"],
      }),
    ).toContain(routes.adminVj);
    expect(
      navDestinations({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["music_manager_producer"],
      }),
    ).not.toContain(routes.adminVj);
  });

  it("gives a vj_operator-only holder a rail of VJ alone", () => {
    expect(
      navDestinations({
        isFullConsole: false,
        isAdmin: false,
        staffRoles: ["vj_operator"],
      }),
    ).toEqual([routes.adminVj]);
  });

  it("keeps every VJ page out of search engines", () => {
    const robots = readFileSync("public/robots.txt", "utf8");
    expect(robots.match(/^Disallow: \/admin$/gm)).toHaveLength(2);
  });
});
