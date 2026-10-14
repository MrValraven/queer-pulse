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

const payload = { releaseId: "release-1", releaseTitle: "Bairro antigo" };

function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "8b1d0f1e-2b3a-4c5d-8e9f-0a1b2c3d4e5f",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "studio_release_taken_down",
    payload,
    read: false,
    createdAt: "2026-10-13T10:30:00.000Z",
    ...overrides,
  };
}

describe("formatNotification: Studio takedown notices", () => {
  it("names the release in a takedown notice, on the platform tab", () => {
    const result = formatNotification(
      "studio_release_taken_down",
      payload,
      makeT("en"),
    );
    expect(result.text).toBe("Bairro antigo was taken down after a report.");
    expect(result.meta).toBe("Studio release");
    expect(result.category).toBe("platform");
  });

  it("reads one sentence for a dispute decision, whatever the outcome", () => {
    for (const outcome of ["upheld", "rejected"]) {
      expect(
        formatNotification(
          "studio_release_dispute_decided",
          { ...payload, outcome },
          makeT("en"),
        ).text,
      ).toBe("Our team decided on your dispute about Bairro antigo.");
    }
    expect(
      formatNotification("studio_release_dispute_decided", payload, makeT("pt"))
        .text,
    ).toBe("A nossa equipa decidiu sobre a tua contestação de Bairro antigo.");
  });

  it("still reads as a sentence when the payload lost its title", () => {
    expect(
      formatNotification("studio_release_taken_down", {}, makeT("en")).text,
    ).toBe("One of your releases was taken down after a report.");
    expect(
      formatNotification("studio_release_dispute_decided", {}, makeT("en"))
        .text,
    ).toBe("Our team decided on your dispute about your release.");
  });
});

describe("Studio takedown notice rows", () => {
  it("open the release, where the reason and the reply are", () => {
    expect(lifecycleSourceHref("studio_release_taken_down", payload)).toEqual({
      href: "/studio/album?id=release-1",
    });
    expect(lifecycleSourceHref("studio_release_dispute_decided", {})).toEqual({
      href: "/studio",
    });
  });

  it("carry no actor and no bundle count", () => {
    const view = notificationDtoToView(
      dto(),
      (key) => key,
      createFormatters("en"),
    );
    expect(view.sourceHref).toBe("/studio/album?id=release-1");
    expect(view.actor).toBeUndefined();
    expect(view.hasOwnBundleCount).toBe(false);
  });
});
