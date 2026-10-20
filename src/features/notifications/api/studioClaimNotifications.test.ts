import { beforeAll, describe, expect, it } from "vitest";
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
import { formatNotification } from "./formatNotification";
import { lifecycleSourceHref } from "./notificationKindHrefs";
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

const ownerPayload = {
  claimId: "claim-1",
  trackId: "track-1",
  releaseId: "release-1",
  trackTitle: "Vela acesa",
};

describe("formatNotification: Studio claim notices", () => {
  it("tells the owners their track is offline, on the platform tab", () => {
    const result = formatNotification(
      "studio_copyright_claim_accepted",
      ownerPayload,
      makeT("en"),
    );
    expect(result.text).toBe(
      "Vela acesa is offline while our team reviews a copyright claim.",
    );
    expect(result.category).toBe("platform");
  });

  it("picks the decided sentence by audience and outcome", () => {
    const decided = (recipientRole: string, outcome: string) =>
      formatNotification(
        "studio_copyright_claim_decided",
        { ...ownerPayload, recipientRole, outcome },
        makeT("en"),
      ).text;
    expect(decided("owner", "upheld")).toBe(
      "Our team upheld the copyright claim about Vela acesa.",
    );
    expect(decided("owner", "rejected")).toBe(
      "Our team rejected the copyright claim about Vela acesa. It's back online.",
    );
    expect(decided("claimant", "upheld")).toContain("your copyright claim");
    expect(decided("someone", "upheld")).toBe(
      formatNotification(
        "studio_copyright_claim_decided",
        { trackTitle: "Vela acesa" },
        makeT("en"),
      ).text,
    );
  });

  it("names the change our team made to a track", () => {
    expect(
      formatNotification(
        "studio_track_marked",
        { ...ownerPayload, change: "explicit" },
        makeT("en"),
      ).text,
    ).toBe("Our team marked Vela acesa explicit.");
    expect(
      formatNotification(
        "studio_track_marked",
        { ...ownerPayload, change: "content_warning" },
        makeT("en"),
      ).text,
    ).toBe("Our team added a content warning to Vela acesa.");
  });

  it("still reads as a sentence without the track title, in both languages", () => {
    for (const language of ["en", "pt"] as const)
      for (const type of [
        "studio_copyright_claim_accepted",
        "studio_copyright_claim_declined",
        "studio_copyright_claim_countered",
        "studio_copyright_claim_decided",
        "studio_copyright_claim_withdrawn",
        "studio_track_marked",
      ])
        expect(
          formatNotification(type, {}, makeT(language)).text,
        ).not.toContain("{trackTitle}");
  });
});

describe("Studio claim notice links", () => {
  it("opens the track page for owners and the claims list for the claimant", () => {
    expect(
      lifecycleSourceHref("studio_copyright_claim_accepted", ownerPayload),
    ).toEqual({ href: "/studio/track?id=track-1" });
    expect(
      lifecycleSourceHref("studio_copyright_claim_countered", {
        claimId: "claim-1",
        trackTitle: "Vela acesa",
      }),
    ).toEqual({ href: "/studio/claims?claim=claim-1" });
    expect(
      lifecycleSourceHref("studio_copyright_claim_decided", {
        ...ownerPayload,
        recipientRole: "owner",
        outcome: "upheld",
      }),
    ).toEqual({ href: "/studio/track?id=track-1" });
    expect(
      lifecycleSourceHref("studio_copyright_claim_decided", {
        claimId: "claim-1",
        recipientRole: "claimant",
        outcome: "upheld",
      }),
    ).toEqual({ href: "/studio/claims?claim=claim-1" });
  });

  it("carries no actor and no bundle count", () => {
    const dto: NotificationDTO = {
      id: "8b1d0f1e-2b3a-4c5d-8e9f-0a1b2c3d4e5f",
      userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
      type: "studio_track_marked",
      payload: { ...ownerPayload, change: "explicit" },
      read: false,
      createdAt: "2026-10-14T10:30:00.000Z",
    };
    const view = notificationDtoToView(
      dto,
      (key) => key,
      createFormatters("en"),
    );
    expect(view.sourceHref).toBe("/studio/track?id=track-1");
    expect(view.actor).toBeUndefined();
    expect(view.hasOwnBundleCount).toBe(false);
  });
});
