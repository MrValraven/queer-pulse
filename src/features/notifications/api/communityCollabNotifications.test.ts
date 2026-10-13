import { beforeAll, describe, expect, it } from "vitest";
import { collabInvitePath } from "../../../app/routeMap";
import {
  catalogs,
  loadNamespace,
  loadPtNamespace,
} from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import { coHostInvitePath, gatheringPath } from "../../gatherings/data";
import { manageGatheringPath } from "../../gatherings/gatheringPaths";
import { formatNotification } from "./formatNotification";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

const resolvedCatalogs: Record<Language, Catalog> = {
  en: catalogs.en.notifications,
  pt: catalogs.pt.notifications,
};

beforeAll(async () => {
  resolvedCatalogs.en = await loadNamespace("en", "notifications");
  resolvedCatalogs.pt = await loadPtNamespace("notifications");
});

/** A `t` bound to the real catalogs: a missing key throws. */
function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const hit = resolveEntry(
      resolvedCatalogs[language],
      path,
      language,
      options,
    );
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

/** Echoes the key, for the row-mapping tests. */
const keyT: TFunction = (key) => key;
const fmt = createFormatters("en");

const invitePayload = {
  source: "community_collab_invite",
  inviteId: "invite-1",
  eventSlug: "end-of-month-run",
  eventTitle: "End-of-Month Run",
  communitySlug: "trans-hub",
  communityName: "Trans & Non-Binary Hub",
  leadCommunityName: "Queer Runners Lisboa",
};

function responsePayload(decision: "accepted" | "declined") {
  return {
    source: "community_collab_response",
    eventSlug: "end-of-month-run",
    eventTitle: "End-of-Month Run",
    communitySlug: "trans-hub",
    communityName: "Trans & Non-Binary Hub",
    decision,
  };
}

const actor = {
  slug: "ines",
  firstName: "Inês",
  lastName: "Tavares",
  avatarUrl: null,
};

function dto(overrides: Partial<NotificationDTO>): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "event_community_invite",
    payload: invitePayload,
    read: false,
    createdAt: "2026-10-08T10:30:00.000Z",
    ...overrides,
  };
}

describe("collab notification copy", () => {
  const t = makeT("en");

  it("files both kinds under events", () => {
    expect(
      formatNotification("event_community_invite", invitePayload, t).category,
    ).toBe("events");
    expect(
      formatNotification(
        "event_community_invite_response",
        responsePayload("accepted"),
        t,
      ).category,
    ).toBe("events");
  });

  it("reads the invite with the community's name", () => {
    expect(
      formatNotification("event_community_invite", invitePayload, t).text,
    ).toBe(
      "Trans & Non-Binary Hub has an invitation to host a gathering together.",
    );
  });

  it("words an accepted and a declined answer apart", () => {
    expect(
      formatNotification(
        "event_community_invite_response",
        responsePayload("accepted"),
        t,
      ).text,
    ).toBe(
      "Trans & Non-Binary Hub accepted your collab invite for End-of-Month Run.",
    );
    expect(
      formatNotification(
        "event_community_invite_response",
        responsePayload("declined"),
        t,
      ).meta,
    ).toBe("Collab declined");
  });

  it.each(["en", "pt"] as const)("has every collab key in %s", (language) => {
    const languageT = makeT(language);
    expect(() => {
      formatNotification("event_community_invite", invitePayload, languageT);
      for (const decision of ["accepted", "declined"] as const) {
        formatNotification(
          "event_community_invite_response",
          responsePayload(decision),
          languageT,
        );
      }
      formatNotification(
        "event_community_invite_response",
        { ...responsePayload("accepted"), decision: undefined },
        languageT,
      );
    }).not.toThrow();
  });
});

describe("collab notification rows", () => {
  it("opens the invite page from the invite, with named copy", () => {
    const view = notificationDtoToView(dto({ actor }), keyT, fmt);
    expect(view.sourceHref).toBe(collabInvitePath("invite-1"));
    expect(view.actor?.textKey).toBe(
      "notifications:type.event_community_invite.textNamed",
    );
  });

  it("opens the gathering from an answer and names the decision", () => {
    const view = notificationDtoToView(
      dto({
        type: "event_community_invite_response",
        payload: responsePayload("declined"),
        actor,
      }),
      keyT,
      fmt,
    );
    expect(view.sourceHref).toBe(gatheringPath("end-of-month-run"));
    expect(view.actor?.textKey).toBe(
      "notifications:type.event_community_invite_response.declined.textNamed",
    );
  });

  it("still opens a co-host invite and a lineup reply where they went before", () => {
    expect(
      notificationDtoToView(
        dto({
          type: "event_cohost_invite",
          payload: {
            source: "cohost_invite",
            eventSlug: "pride-picnic",
            inviteId: "cohost-1",
          },
        }),
        keyT,
        fmt,
      ).sourceHref,
    ).toBe(coHostInvitePath("pride-picnic", "cohost-1"));
    expect(
      notificationDtoToView(
        dto({
          type: "event_lineup_accepted",
          payload: { source: "lineup_reply", eventSlug: "pride-picnic" },
        }),
        keyT,
        fmt,
      ).sourceHref,
    ).toBe(manageGatheringPath("pride-picnic", "attendees"));
  });

  it("builds no link for an invite missing its id", () => {
    expect(
      notificationDtoToView(
        dto({ payload: { ...invitePayload, inviteId: undefined } }),
        keyT,
        fmt,
      ).sourceHref,
    ).toBeUndefined();
  });
});
