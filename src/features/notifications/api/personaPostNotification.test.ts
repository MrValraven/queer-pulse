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
  subprofileName: "NIGHTFORM",
  subprofileSlugOrHandle: "nightform",
  postId: "post-1",
  excerpt: "New single in nine days",
};

function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "7d2e1f0a-3b4c-4d5e-8f90-1a2b3c4d5e6f",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "persona_post",
    payload,
    read: false,
    createdAt: "2026-10-13T10:30:00.000Z",
    ...overrides,
  };
}

describe("formatNotification: persona_post", () => {
  it("names the persona and quotes the excerpt on a single row", () => {
    const result = formatNotification("persona_post", payload, makeT("en"));
    expect(result.text).toBe(
      "NIGHTFORM posted an update: New single in nine days",
    );
    expect(result.meta).toBe("Persona you follow");
    expect(result.category).toBe("community");
    const pt = formatNotification("persona_post", payload, makeT("pt"));
    expect(pt.text).toBe(
      "NIGHTFORM publicou uma novidade: New single in nine days",
    );
  });

  it("counts a bundle of posts from otherActorCount", () => {
    const en = formatNotification(
      "persona_post",
      payload,
      makeT("en"),
      undefined,
      2,
    );
    expect(en.text).toBe("NIGHTFORM posted 3 updates.");
    const pt = formatNotification(
      "persona_post",
      payload,
      makeT("pt"),
      undefined,
      2,
    );
    expect(pt.text).toBe("NIGHTFORM publicou 3 novidades.");
  });

  it("still reads as a sentence when the payload lost its fields", () => {
    const result = formatNotification("persona_post", {}, makeT("en"));
    expect(result.text).toBe(
      "Someone you follow posted an update: open it to read the rest",
    );
  });
});

describe("persona_post row", () => {
  it("opens the persona's Updates block and carries no 'and others' suffix", () => {
    const view = notificationDtoToView(
      dto({ otherActorCount: 2 }),
      (key) => key,
      createFormatters("en"),
    );
    expect(view.sourceHref).toBe("/p/nightform#updates");
    expect(view.hasOwnBundleCount).toBe(true);
    expect(view.actions?.[0]).toMatchObject({
      label: "notifications:actions.readUpdate",
      href: "/p/nightform#updates",
    });
  });

  it("falls back to the persona directory without an address", () => {
    expect(lifecycleSourceHref("persona_post", {})).toEqual({
      href: "/subprofiles",
    });
  });
});
