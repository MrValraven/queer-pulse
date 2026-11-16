import { FiUserCheck } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import { createFormatters } from "../../../shared/i18n/format";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { adminLeadPath } from "../../admin/leads/leadPaths";
import { formatNotification } from "./formatNotification";
import { lifecycleSourceHref } from "./notificationKindHrefs";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/** The notice a staff member gets when someone puts them in charge of a lead. */
const STRINGS: Record<string, string> = {
  "notifications:type.lead_assigned.text": "You were put in charge of a lead.",
  "notifications:type.lead_assigned.textNamed":
    "<profile>{name}</profile> put you in charge of a lead.",
  "notifications:type.lead_assigned.meta": "Leads",
};
const t: TFunction = (key: string, values?: TranslateOptions) =>
  interpolate(STRINGS[key] ?? key, values);
const fmt = createFormatters("en");

function dto(overrides: Partial<NotificationDTO>): NotificationDTO {
  return {
    id: "5d8e3f21-6b5c-4a9f-8d32-1e7f8a9b0c2d",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "lead_assigned",
    payload: { leadId: "lead-1" },
    read: false,
    createdAt: "2026-11-16T09:00:00.000Z",
    ...overrides,
  };
}

describe("lead assigned notifications", () => {
  it("reads one sentence that names no lead and files under platform", () => {
    const formatted = formatNotification(
      "lead_assigned",
      { leadId: "lead-1", leadName: "Cave 23" },
      t,
      fmt,
    );
    expect(formatted.text).toBe("You were put in charge of a lead.");
    expect(formatted.text).not.toContain("Cave 23");
    expect(formatted.meta).toBe("Leads");
    expect(formatted.category).toBe("platform");
  });

  it("names the assigner when the backend resolved one", () => {
    const view = notificationDtoToView(
      dto({
        actor: {
          slug: "marta-lobo",
          firstName: "Marta",
          lastName: "Lobo",
          avatarUrl: null,
        },
      }),
      t,
      fmt,
    );
    expect(view.actor?.textKey).toBe(
      "notifications:type.lead_assigned.textNamed",
    );
    expect(view.avatar?.initials).toBe("ML");
  });

  it("shows the user check icon when no assigner resolved", () => {
    const view = notificationDtoToView(dto({}), t, fmt);
    expect(view.icon?.Glyph).toBe(FiUserCheck);
    expect(view.type).toBe("platform");
  });

  it("opens the lead, or the leads list without an id", () => {
    expect(lifecycleSourceHref("lead_assigned", { leadId: "lead/1" })).toEqual({
      href: "/admin/leads/lead%2F1",
    });
    expect(lifecycleSourceHref("lead_assigned", {})).toEqual({
      href: routes.adminLeads,
    });
    expect(notificationDtoToView(dto({}), t, fmt).sourceHref).toBe(
      adminLeadPath("lead-1"),
    );
  });
});
