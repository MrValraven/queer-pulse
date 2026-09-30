import { beforeAll, describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
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
import { personaImportHref } from "./notificationKindHrefs";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/**
 * Podcast feed import: the `persona_import_ready` notification, sent to every
 * member of a persona when a scheduled check finds new episodes waiting for
 * review. Copy is pluralised on `newItemCount`, and the row opens the
 * persona's editor on its Import pane.
 */

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
  subprofileId: "sp-late-bloomers",
  subprofileName: "Late Bloomers",
  subprofileSlugOrHandle: "late-bloomers",
  feedId: "feed-1",
  feedTitle: "Late Bloomers",
  newItemCount: 3,
};

function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "persona_import_ready",
    payload,
    read: false,
    createdAt: "2026-07-16T10:30:00.000Z",
    ...overrides,
  };
}

describe("formatNotification: persona_import_ready", () => {
  it("names the persona and counts the episodes, plural in English", () => {
    const many = formatNotification(
      "persona_import_ready",
      payload,
      makeT("en"),
    );
    expect(many.text).toBe(
      "3 new episodes are ready to review on Late Bloomers.",
    );
    expect(many.meta).toBe("Podcast import");
    expect(many.category).toBe("community");
    expect(many.kind).toBe("persona_import_ready");

    const one = formatNotification(
      "persona_import_ready",
      { ...payload, newItemCount: 1 },
      makeT("en"),
    );
    expect(one.text).toBe("A new episode is ready to review on Late Bloomers.");
  });

  it("is pluralised in Portuguese too", () => {
    expect(
      formatNotification("persona_import_ready", payload, makeT("pt")).text,
    ).toBe("Há 3 episódios novos para rever em Late Bloomers.");
    expect(
      formatNotification(
        "persona_import_ready",
        { ...payload, newItemCount: 1 },
        makeT("pt"),
      ).text,
    ).toBe("Há um episódio novo para rever em Late Bloomers.");
  });

  it("still reads as a whole sentence when the count is missing", () => {
    const { newItemCount: _newItemCount, ...withoutCount } = payload;
    const result = formatNotification(
      "persona_import_ready",
      withoutCount,
      makeT("en"),
    );
    expect(result.text).toBe(
      "New episodes are ready to review on Late Bloomers.",
    );
  });
});

describe("persona_import_ready destination", () => {
  it("opens the persona's editor on its Import pane", () => {
    expect(personaImportHref(payload)).toBe(
      "/account/subprofiles/sp-late-bloomers/edit?pane=import",
    );
  });

  it("falls back to the personas dashboard without a persona id", () => {
    expect(personaImportHref({})).toBe(routes.subprofilesDashboard);
    expect(personaImportHref(null)).toBe(routes.subprofilesDashboard);
  });

  it("gives the row the same destination and one 'Review episodes' action", () => {
    const view = notificationDtoToView(
      dto(),
      (key) => key,
      createFormatters("en"),
    );
    expect(view.sourceHref).toBe(
      "/account/subprofiles/sp-late-bloomers/edit?pane=import",
    );
    expect(view.actions).toEqual([
      {
        label: "notifications:actions.reviewEpisodes",
        variant: "primary",
        href: "/account/subprofiles/sp-late-bloomers/edit?pane=import",
      },
    ]);
  });
});
