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

const payload = {
  subprofileName: "Mariana Sol",
  subprofileSlugOrHandle: "mariana-sol",
  releaseId: "release-1",
  releaseTitle: "Cidade dos santos",
  releaseType: "album",
};

function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "6c1d0f1e-2b3a-4c5d-8e9f-0a1b2c3d4e5f",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "studio_release_published",
    payload,
    read: false,
    createdAt: "2026-10-13T10:30:00.000Z",
    ...overrides,
  };
}

describe("formatNotification: studio_release_published", () => {
  it("names the persona and the release on a single row", () => {
    const result = formatNotification(
      "studio_release_published",
      payload,
      makeT("en"),
    );
    expect(result.text).toBe("Mariana Sol released Cidade dos santos.");
    expect(result.meta).toBe("Artist you follow");
    expect(result.category).toBe("community");
  });

  it("counts a bundle of releases from otherActorCount", () => {
    const en = formatNotification(
      "studio_release_published",
      payload,
      makeT("en"),
      undefined,
      2,
    );
    expect(en.text).toBe("Mariana Sol released 3 new releases.");
    const pt = formatNotification(
      "studio_release_published",
      payload,
      makeT("pt"),
      undefined,
      2,
    );
    expect(pt.text).toBe("Mariana Sol lançou 3 novos lançamentos.");
  });

  it("still reads as a sentence when the payload lost its fields", () => {
    const result = formatNotification(
      "studio_release_published",
      {},
      makeT("en"),
    );
    expect(result.text).toBe("Someone you follow released a new release.");
  });
});

describe("studio_release_published row", () => {
  it("opens the release and carries no 'and others' suffix", () => {
    const view = notificationDtoToView(
      dto({ otherActorCount: 2 }),
      (key) => key,
      createFormatters("en"),
    );
    expect(view.sourceHref).toBe("/studio/album?id=release-1");
    expect(view.hasOwnBundleCount).toBe(true);
    expect(view.actions?.[0]).toMatchObject({
      label: "notifications:actions.listenNow",
      href: "/studio/album?id=release-1",
    });
  });

  it("falls back to Studio home without a release id", () => {
    expect(lifecycleSourceHref("studio_release_published", {})).toEqual({
      href: "/studio",
    });
  });
});
