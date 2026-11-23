import { describe, expect, it } from "vitest";
import { communityPath } from "../../../app/routeMap";
import { createFormatters } from "../../../shared/i18n/format";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { COMMUNITY_INVITATIONS_PATH } from "../../communities/communityInvitations.path";
import { formatNotification } from "./formatNotification";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/**
 * PRD-514. The two ownership offer kinds: the offered member's row opens the
 * inbox, the owner's decline row opens the community's danger pane, both name
 * the other member and the community. A key-echo `t` keeps the assertions on
 * keys and tokens, independent of the catalog text.
 */
const t: TFunction = (key: string, options?: TranslateOptions) =>
  options ? `${key} ${JSON.stringify(options)}` : key;
const fmt = createFormatters("en");

const PAYLOAD = {
  actorId: "0b6f2b0e-4a1f-4d61-9d0c-6c8e1a3f2b10",
  source: "community",
  communitySlug: "queer-runners",
  communityName: "Queer Runners Lisboa",
};

function dto(type: string, overrides: Partial<NotificationDTO> = {}) {
  const base: NotificationDTO = {
    id: "5d0c4d1e-2b8a-4c3f-9e7d-1a2b3c4d5e6f",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type,
    payload: PAYLOAD,
    read: false,
    createdAt: "2026-11-23T10:30:00.000Z",
  };
  return { ...base, ...overrides };
}

describe("community ownership offer notifications", () => {
  it("files both kinds under the community tab with their own copy", () => {
    for (const type of [
      "community_ownership_offered",
      "community_ownership_offer_declined",
    ]) {
      const formatted = formatNotification(type, PAYLOAD, t, fmt);
      expect(formatted.kind).toBe(type);
      expect(formatted.category).toBe("community");
      expect(formatted.text).toContain(`notifications:type.${type}.text`);
      expect(formatted.text).toContain("Queer Runners Lisboa");
    }
  });

  it("names the actor when one resolved and falls back to a whole sentence when not", () => {
    const named = formatNotification(
      "community_ownership_offered",
      PAYLOAD,
      t,
      fmt,
      undefined,
      "Mónica Resende",
    );
    expect(named.textValues?.name).toBe("Mónica Resende");
    const unnamed = formatNotification(
      "community_ownership_offer_declined",
      PAYLOAD,
      t,
      fmt,
    );
    expect(unnamed.textValues?.name).toBe(
      "notifications:type.community_ownership_offer_declined.nameFallback",
    );
  });

  it("reads the community fallback when the payload lost its name", () => {
    const formatted = formatNotification(
      "community_ownership_offered",
      { ...PAYLOAD, communityName: "" },
      t,
      fmt,
    );
    expect(formatted.textValues?.communityName).toBe(
      "notifications:type.community_ownership_offered.communityNameFallback",
    );
  });

  it("opens the inbox for an offer and the danger pane for a decline", () => {
    expect(
      notificationDtoToView(dto("community_ownership_offered"), t, fmt)
        .sourceHref,
    ).toBe(COMMUNITY_INVITATIONS_PATH);
    expect(
      notificationDtoToView(dto("community_ownership_offer_declined"), t, fmt)
        .sourceHref,
    ).toBe(`${communityPath("queer-runners")}?tab=modtools&mod=danger`);
  });

  it("uses the named sentence with the profile link when the actor resolved", () => {
    const view = notificationDtoToView(
      dto("community_ownership_offered", {
        actor: {
          slug: "monica",
          firstName: "Mónica",
          lastName: "Resende",
          avatarUrl: null,
        },
      }),
      t,
      fmt,
    );
    expect(view.actor?.textKey).toBe(
      "notifications:type.community_ownership_offered.textNamed",
    );
    expect(view.actor?.textValues?.communityName).toBe("Queer Runners Lisboa");
  });
});
