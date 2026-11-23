import { beforeAll, describe, expect, it } from "vitest";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import { communityPath } from "../../../app/routeMap";
import {
  communityBadgeRowVerbKey,
  communityGiftReportSubject,
} from "../communityBadgeNotifications";
import { DEMO_BADGE_EARNED_NOTIFICATION_ID } from "../communityBadgeNotifications.data";
import { buildNotifications, DEMO_UNREAD_IDS } from "../notificationsList.data";
import { formatNotification } from "./formatNotification";
import { notificationReasonOf } from "./notificationReason";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

const catalogsByLanguage: Record<Language, Record<string, Catalog>> = {
  en: {},
  pt: {},
};

beforeAll(async () => {
  for (const language of ["en", "pt"] as const) {
    // The demo list also carries the staff moderation-health row, which reads
    // the admin namespace.
    for (const namespace of [
      "notifications",
      "communities",
      "admin",
    ] as const) {
      catalogsByLanguage[language][namespace] = await loadNamespace(
        language,
        namespace,
      );
    }
  }
});

function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { namespace, path } = parseKey(key);
    const catalog = catalogsByLanguage[language][namespace];
    const hit = catalog
      ? resolveEntry(catalog, path, language, options)
      : undefined;
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

const english = (key: string, options?: TranslateOptions) =>
  makeT("en")(key, options);
const portuguese = (key: string, options?: TranslateOptions) =>
  makeT("pt")(key, options);
const fmt = createFormatters("en");

/** A notification shaped as the backend serves it. */
function dto(type: string, payload: Record<string, unknown>): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type,
    payload,
    read: false,
    createdAt: "2026-07-16T10:30:00.000Z",
  };
}

const earnedPayload = {
  communitySlug: "club",
  communityName: "Corredores",
  badgeId: "b1",
  badgeName: "Regular",
  starterKey: "regular",
};

describe("community badge notifications", () => {
  it("names the translated starter badge in the earned row", () => {
    const formatted = formatNotification(
      "community_badge_earned",
      earnedPayload,
      portuguese,
    );
    expect(formatted.text).toContain("Habitual");
    expect(formatted.text).toContain("Corredores");
  });

  it("names a renamed starter as stored", () => {
    const formatted = formatNotification(
      "community_badge_earned",
      { ...earnedPayload, badgeName: "Regulars" },
      portuguese,
    );
    expect(formatted.text).toContain("Regulars");
    expect(formatted.text).not.toContain("Habitual");
  });

  it("reads as a whole sentence with no badge or community name", () => {
    for (const type of ["community_badge_earned", "community_gift_received"]) {
      const formatted = formatNotification(type, {}, english);
      expect(formatted.text.trim()).not.toBe("");
      expect(formatted.text).not.toContain("{badgeName}");
      expect(formatted.text).not.toContain("{communityName}");
      expect(formatted.text).not.toContain("{giftName}");
    }
  });

  it("names the gift and the community in the gift row", () => {
    const formatted = formatNotification(
      "community_gift_received",
      { communitySlug: "club", communityName: "Corredores", giftKey: "heart" },
      english,
    );
    expect(formatted.text).toContain("Heart");
    expect(formatted.text).toContain("Corredores");
  });

  it("carries the gift note as the row's note", () => {
    expect(
      notificationReasonOf("community_gift_received", { note: " Thanks " }),
    ).toBe("Thanks");
  });

  it("links the earned row to the sheet on that badge", () => {
    const view = notificationDtoToView(
      dto("community_badge_earned", earnedPayload),
      english,
      fmt,
    );
    expect(view.sourceHref).toBe(
      `${communityPath("club")}?badges=open&badge=b1`,
    );
  });

  it("opens the sheet on the list when the earned row has no badge id", () => {
    const view = notificationDtoToView(
      dto("community_badge_earned", { communitySlug: "club" }),
      english,
      fmt,
    );
    expect(view.sourceHref).toBe(`${communityPath("club")}?badges=open`);
    expect(view.actions).toBeUndefined();
  });

  it("links the gift row to the shelf", () => {
    const view = notificationDtoToView(
      dto("community_gift_received", {
        communitySlug: "club",
        giftKey: "heart",
      }),
      english,
      fmt,
    );
    expect(view.sourceHref).toBe(`${communityPath("club")}?badges=gifts`);
    expect(view.actions).toHaveLength(1);
    expect(view.actions?.[0]?.variant).toBe("ghost");
  });

  it("offers Report gift on a gift row that names its gift", () => {
    const view = notificationDtoToView(
      dto("community_gift_received", {
        communitySlug: "club",
        giftKey: "heart",
        giftId: "gift-1",
      }),
      english,
      fmt,
    );
    expect(view.actions).toHaveLength(2);
    expect(view.actions?.[1]).toMatchObject({
      label: "Report gift",
      variant: "ghost",
      reportGift: { giftId: "gift-1", giftName: "Heart" },
    });
  });

  it("offers Report gift with no community to open", () => {
    const view = notificationDtoToView(
      dto("community_gift_received", { giftKey: "heart", giftId: "gift-1" }),
      english,
      fmt,
    );
    expect(view.actions).toHaveLength(1);
    expect(view.actions?.[0]?.reportGift?.giftId).toBe("gift-1");
  });

  it("never offers Report gift when the payload has no gift id", () => {
    for (const giftId of [undefined, "", 42]) {
      const view = notificationDtoToView(
        dto("community_gift_received", {
          communitySlug: "club",
          giftKey: "heart",
          giftId,
        }),
        english,
        fmt,
      );
      expect(view.actions?.some((action) => action.reportGift)).toBe(false);
    }
  });

  it("offers Wear this badge on the earned row", () => {
    const view = notificationDtoToView(
      dto("community_badge_earned", earnedPayload),
      english,
      fmt,
    );
    expect(view.actions?.[0]).toMatchObject({
      label: "Wear this badge",
      variant: "primary",
      wearBadge: {
        communitySlug: "club",
        badgeId: "b1",
        toast: "You're wearing Regular in Corredores now.",
      },
    });
    expect(view.actions?.[1]?.variant).toBe("ghost");
  });

  it("renders a gift row whose sender is gone", () => {
    const view = notificationDtoToView(
      {
        ...dto("community_gift_received", {
          communitySlug: "club",
          giftKey: "heart",
          communityName: "Corredores",
        }),
        actor: null,
      },
      english,
      fmt,
    );
    expect(view.actor).toBeUndefined();
    expect(view.text).toContain("Heart");
    expect(view.actions).toHaveLength(1);
  });

  it("adds the two demo rows with the earned one unread", () => {
    const rows = buildNotifications(english, fmt);
    const earned = rows.find(
      (row) => row.id === DEMO_BADGE_EARNED_NOTIFICATION_ID,
    );
    expect(earned?.unread).toBe(true);
    expect(earned?.actions?.[0]?.wearBadge?.badgeId).toBe(
      "demo-badge-queer-runners-regular",
    );
    expect(rows.some((row) => row.id === 41 && !row.unread)).toBe(true);
    const giftRow = rows.find((row) => row.id === 41);
    expect(giftRow?.actions?.[1]?.reportGift?.giftId).toMatch(/^demo-gift-/);
    expect(DEMO_UNREAD_IDS).toContain(DEMO_BADGE_EARNED_NOTIFICATION_ID);
  });

  it("names the demo community Queer Runners Lisboa in both rows", () => {
    const rows = buildNotifications(english, fmt);
    for (const id of [DEMO_BADGE_EARNED_NOTIFICATION_ID, 41]) {
      expect(rows.find((row) => row.id === id)?.text).toContain(
        "Queer Runners Lisboa",
      );
    }
  });

  it("names the gift and its sender in the report dialog title", () => {
    expect(communityGiftReportSubject(english, "Heart", "Carla")).toBe(
      "the Heart gift from Carla",
    );
    expect(communityGiftReportSubject(english, "Heart", undefined)).toBe(
      "the Heart gift from a deleted member",
    );
  });

  it("names where a community badge row opens for its overlay link", () => {
    expect(
      communityBadgeRowVerbKey(`${communityPath("club")}?badges=open&badge=b1`),
    ).toBe("notifications:actions.openBadges");
    expect(
      communityBadgeRowVerbKey(`${communityPath("club")}?badges=gifts`),
    ).toBe("notifications:actions.openGifts");
    expect(communityBadgeRowVerbKey("/forum/thread-1")).toBeUndefined();
    expect(communityBadgeRowVerbKey(undefined)).toBeUndefined();
  });
});
