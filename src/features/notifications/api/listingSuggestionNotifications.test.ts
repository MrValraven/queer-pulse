import { describe, expect, it } from "vitest";
import { businessPath } from "../../../app/routeMap";
import { createFormatters } from "../../../shared/i18n/format";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { listingCorrectionContactPath } from "../../marketing/contactPrefill";
import {
  formatNotification,
  type NotificationKind,
} from "./formatNotification";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/**
 * PRD-433. The four suggested-listing kinds' EN catalog strings, exactly as
 * written to the i18n scratch file the coordinator merges into
 * `catalogs/{en,pt}/notifications.ts`. Duplicated here so this test passes
 * before that merge lands, the same reason `goTogetherNotifications.test.ts`
 * carries its own strings.
 */
const SUGGESTION_STRINGS: Record<string, string> = {
  "notifications:type.listing_suggestion_live.text":
    "{listingName} is now live in the directory. Thanks for the suggestion.",
  "notifications:type.listing_suggestion_live.meta": "Suggested listing",
  "notifications:type.listing_suggestion_live.listingNameFallback":
    "The place you suggested",
  "notifications:type.listing_suggestion_needs_info.text":
    "{listingName} needs more information before it can go live. Send us what you know about it.",
  "notifications:type.listing_suggestion_needs_info.meta": "Suggested listing",
  "notifications:type.listing_suggestion_needs_info.listingNameFallback":
    "The place you suggested",
  "notifications:type.listing_suggestion_sent_back.text":
    "{listingName} is back in review.",
  "notifications:type.listing_suggestion_sent_back.meta": "Suggested listing",
  "notifications:type.listing_suggestion_sent_back.listingNameFallback":
    "The place you suggested",
  "notifications:type.listing_suggestion_removed.text":
    "{listingName} was removed from the directory.",
  "notifications:type.listing_suggestion_removed.meta": "Suggested listing",
  "notifications:type.listing_suggestion_removed.listingNameFallback":
    "The place you suggested",
};

/** Real `{token}` interpolation over the strings above. */
const t: TFunction = (key: string, values?: TranslateOptions) =>
  interpolate(SUGGESTION_STRINGS[key] ?? key, values);

/** Echoes the key back, for the href and category checks. */
const echoT: TFunction = (key) => key;

const fmt = createFormatters("en");

const SUGGESTION_KINDS: NotificationKind[] = [
  "listing_suggestion_live",
  "listing_suggestion_needs_info",
  "listing_suggestion_sent_back",
  "listing_suggestion_removed",
];

const HELD_BACK_KINDS: NotificationKind[] = [
  "listing_suggestion_needs_info",
  "listing_suggestion_sent_back",
  "listing_suggestion_removed",
];

/** A notification shaped exactly as the backend serves it. */
function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "5b2d7e10-3c4a-4f8e-9a61-2d7c8e9f0a1b",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "listing_suggestion_live",
    payload: {
      source: "listing",
      listingSlug: "lux-cafe",
      listingName: "Lux Café",
    },
    read: false,
    createdAt: "2026-09-29T10:30:00.000Z",
    ...overrides,
  };
}

describe("suggested-listing notifications (PRD-433)", () => {
  it("renders every kind with the listing's name and a short label", () => {
    for (const kind of SUGGESTION_KINDS) {
      const { text, meta, category } = formatNotification(
        kind,
        { listingName: "Lux Café" },
        t,
      );
      expect(text).toContain("Lux Café");
      expect(text).not.toContain("{listingName}");
      expect(meta).toBe("Suggested listing");
      expect(category).toBe("platform");
    }
  });

  it("names the place generically when a row carries no listing name", () => {
    for (const kind of SUGGESTION_KINDS) {
      const { text } = formatNotification(kind, {}, t);
      expect(text.startsWith("The place you suggested")).toBe(true);
      expect(text).not.toContain("{listingName}");
    }
  });

  it("carries the moderator's reason on the row and keeps the label short", () => {
    for (const kind of HELD_BACK_KINDS) {
      const { meta, reason } = formatNotification(
        kind,
        { listingName: "Lux Café", reason: "  Which street is it on?  " },
        t,
      );
      expect(reason).toBe("Which street is it on?");
      expect(meta).toBe("Suggested listing");
    }
  });

  it("opens the public listing page for a live suggestion", () => {
    const view = notificationDtoToView(dto(), echoT, fmt);
    expect(view.sourceHref).toBe(businessPath("lux-cafe"));
  });

  it("opens the contact form prefilled for a correction on the other three", () => {
    for (const kind of HELD_BACK_KINDS) {
      const view = notificationDtoToView(
        dto({
          type: kind,
          payload: {
            source: "listing",
            listingRef: "QPL-2026-0007",
            listingName: "Lux Café",
          },
        }),
        echoT,
        fmt,
      );
      expect(view.sourceHref).toBe(
        listingCorrectionContactPath("QPL-2026-0007"),
      );
    }
  });

  it("reads a needs-info reason under the question lead-in", () => {
    const payload = {
      source: "listing",
      listingRef: "QPL-2026-0007",
      listingName: "Lux Café",
      reason: "Which street is it on?",
    };
    const question = notificationDtoToView(
      dto({ type: "listing_suggestion_needs_info", payload }),
      echoT,
      fmt,
    );
    expect(question.reason).toBe("Which street is it on?");
    expect(question.reasonLeadKey).toBe("notifications:row.reasonLeadQuestion");
    // A send-back or removal reason keeps the moderators' lead-in.
    const sentBack = notificationDtoToView(
      dto({ type: "listing_suggestion_sent_back", payload }),
      echoT,
      fmt,
    );
    expect(sentBack.reasonLeadKey).toBeUndefined();
  });

  it("has no destination when a held-back row lost its ref", () => {
    const view = notificationDtoToView(
      dto({
        type: "listing_suggestion_removed",
        payload: { source: "listing", listingName: "Lux Café" },
      }),
      echoT,
      fmt,
    );
    expect(view.sourceHref).toBeUndefined();
  });
});
