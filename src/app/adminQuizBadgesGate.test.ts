import { describe, expect, it } from "vitest";
import { ADMIN_NAV_SECTIONS } from "../shared/components/layout/adminNav.data";
import { isQuizshowStaffPath, requiredRole } from "./authGate";
import { adminQuizshowEventBadgesPath, routes } from "./routeMap";

describe("Pulse Live win badges console gate", () => {
  it("treats the badge library, events list and a setup page as Pulse Live staff paths", () => {
    expect(isQuizshowStaffPath(routes.adminQuizshowBadges)).toBe(true);
    expect(isQuizshowStaffPath(routes.adminQuizshowEvents)).toBe(true);
    expect(isQuizshowStaffPath(adminQuizshowEventBadgesPath("e1"))).toBe(true);
    expect(isQuizshowStaffPath("/admin/studio")).toBe(false);
  });

  it("lets moderators reach them", () => {
    expect(requiredRole(routes.adminQuizshowBadges)).toBe("mod");
    expect(requiredRole(routes.adminQuizshowEvents)).toBe("mod");
    expect(requiredRole(adminQuizshowEventBadgesPath("e1"))).toBe("mod");
  });

  it("encodes the event id in the setup path", () => {
    expect(adminQuizshowEventBadgesPath("a/b")).toBe(
      "/admin/quizshow/events/a%2Fb/badges",
    );
  });

  it("puts both nav items after the templates item behind the quizshow feature", () => {
    const editorial = ADMIN_NAV_SECTIONS.find(
      (section) => section.id === "editorial",
    );
    const destinations = editorial?.items.map((item) => item.to) ?? [];
    const templatesIndex = destinations.indexOf(routes.adminQuizshowTemplates);
    expect(templatesIndex).toBeGreaterThanOrEqual(0);
    expect(destinations[templatesIndex + 1]).toBe(routes.adminQuizshowBadges);
    expect(destinations[templatesIndex + 2]).toBe(routes.adminQuizshowEvents);

    const badgesItem = editorial?.items[templatesIndex + 1];
    const eventsItem = editorial?.items[templatesIndex + 2];
    expect(badgesItem?.labelKey).toBe("shared:adminNav.items.quizBadges");
    expect(eventsItem?.labelKey).toBe("shared:adminNav.items.quizEvents");
    for (const item of [badgesItem, eventsItem]) {
      expect(item?.feature).toBe("quizshow");
      expect(item?.capabilities).toBeUndefined();
      expect(item?.isAdminOnly).toBeUndefined();
    }
  });
});
