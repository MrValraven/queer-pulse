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
  releaseId: "show-1",
  trackId: "episode-7",
  releaseTitle: "Late Bloomers",
  trackTitle: "Chosen family dinners",
  subprofileName: "Late Bloomers",
  subprofileSlugOrHandle: "late-bloomers",
};

const differentName = { ...payload, subprofileName: "Tiago" };

function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "1d2e3f40-5a6b-4c7d-8e9f-0a1b2c3d4e5f",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "studio_episode_published",
    payload,
    read: false,
    createdAt: "2026-10-14T07:00:00.000Z",
    ...overrides,
  };
}

describe("formatNotification: studio_episode_published", () => {
  it("names the persona, the episode and the show", () => {
    const result = formatNotification(
      "studio_episode_published",
      differentName,
      makeT("en"),
    );
    expect(result.text).toBe(
      "Tiago published Chosen family dinners on Late Bloomers.",
    );
    expect(result.meta).toBe("Podcast you follow");
    expect(result.category).toBe("community");
    expect(
      formatNotification("studio_episode_published", differentName, makeT("pt"))
        .text,
    ).toBe("Tiago publicou Chosen family dinners em Late Bloomers.");
  });

  it("counts a bundle from otherActorCount", () => {
    const en = formatNotification(
      "studio_episode_published",
      differentName,
      makeT("en"),
      undefined,
      2,
    );
    expect(en.text).toBe("Tiago published 3 new episodes of Late Bloomers.");
  });

  it("drops the repeated name when the persona is the show", () => {
    const sameName = { ...payload, trackTitle: "Chosen family dinners" };
    expect(
      formatNotification("studio_episode_published", sameName, makeT("en"))
        .text,
    ).toBe("Late Bloomers published Chosen family dinners.");
    expect(
      formatNotification(
        "studio_episode_published",
        sameName,
        makeT("en"),
        undefined,
        2,
      ).text,
    ).toBe("Late Bloomers published 3 new episodes.");
  });

  it("keeps the show name when it differs from the persona", () => {
    expect(
      formatNotification(
        "studio_episode_published",
        { ...payload, subprofileName: "Tiago" },
        makeT("en"),
      ).text,
    ).toBe("Tiago published Chosen family dinners on Late Bloomers.");
  });

  it("still reads as a sentence when the payload lost its fields", () => {
    expect(
      formatNotification("studio_episode_published", {}, makeT("en")).text,
    ).toBe("Someone you follow published a new episode on a show you follow.");
  });
});

describe("studio_episode_published row", () => {
  it("opens the episode and carries no 'and others' suffix", () => {
    const view = notificationDtoToView(
      dto({ otherActorCount: 1 }),
      (key) => key,
      createFormatters("en"),
    );
    expect(view.sourceHref).toBe("/studio/track?id=episode-7");
    expect(view.hasOwnBundleCount).toBe(true);
    expect(view.actions?.[0]).toMatchObject({
      label: "notifications:actions.listenNow",
      href: "/studio/track?id=episode-7",
    });
  });

  it("falls back to the show, then to Studio", () => {
    expect(
      lifecycleSourceHref("studio_episode_published", { releaseId: "show-1" }),
    ).toEqual({ href: "/studio/album?id=show-1" });
    expect(lifecycleSourceHref("studio_episode_published", {})).toEqual({
      href: "/studio",
    });
  });
});
