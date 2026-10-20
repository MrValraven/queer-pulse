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
import { formatNotification } from "./formatNotification";
import { lifecycleSourceHref } from "./notificationKindHrefs";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

const catalogsByLanguage: Record<Language, Record<string, Catalog>> = {
  en: {},
  pt: {},
};

beforeAll(async () => {
  for (const language of ["en", "pt"] as const) {
    catalogsByLanguage[language].notifications = await loadNamespace(
      language,
      "notifications",
    );
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

const invitePayload = {
  playlistId: "playlist-9",
  playlistName: "Pride warm-up",
};
const addedPayload = {
  playlistId: "playlist-7",
  playlistName: "Tour diary",
  personaName: "Mariana Sol",
};
const catarina = {
  slug: "catarina-vaz",
  firstName: "Catarina",
  lastName: "Vaz",
  avatarUrl: null,
};

function dto(type: string, payload: Record<string, unknown>): NotificationDTO {
  return {
    id: "6c1f3a2e-9b4d-4e5f-8a7b-1c2d3e4f5a6b",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type,
    payload,
    read: false,
    createdAt: "2026-10-14T10:30:00.000Z",
  };
}

describe("collaborative playlist notifications", () => {
  it("names the playlist on an invite in both languages, filed under community", () => {
    const en = formatNotification(
      "studio_playlist_editor_invite",
      invitePayload,
      makeT("en"),
    );
    expect(en.text).toBe(
      "You've been invited to edit the playlist Pride warm-up.",
    );
    expect(en.meta).toBe("Playlist invite");
    expect(en.category).toBe("community");
    expect(
      formatNotification(
        "studio_playlist_editor_invite",
        invitePayload,
        makeT("pt"),
      ).text,
    ).toBe("Foste convidade para editar a playlist Pride warm-up.");
  });

  it("names the counterpart as a profile link and keeps the playlist name", () => {
    const view = notificationDtoToView(
      {
        ...dto("studio_playlist_editor_invite_accepted", invitePayload),
        actor: catarina,
      },
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.actor).toMatchObject({
      name: "Catarina Vaz",
      href: "/members/catarina-vaz",
      textKey:
        "notifications:type.studio_playlist_editor_invite_accepted.textNamed",
    });
    expect(view.actor?.textValues?.playlistName).toBe("Pride warm-up");
  });

  it("names the persona on a co-owner pick", () => {
    expect(
      formatNotification(
        "studio_playlist_editor_added",
        addedPayload,
        makeT("en"),
      ).text,
    ).toBe("You can now edit Tour diary, a playlist shown as Mariana Sol.");
    expect(
      formatNotification(
        "studio_playlist_editor_added",
        addedPayload,
        makeT("pt"),
      ).text,
    ).toBe("Agora podes editar Tour diary, uma playlist de Mariana Sol.");
  });

  it("reads a row missing its names as a whole sentence", () => {
    expect(
      formatNotification(
        "studio_playlist_editor_invite_declined",
        { playlistId: "playlist-9" },
        makeT("en"),
      ).text,
    ).toBe("Someone declined your invite to edit your playlist.");
  });

  it("opens the playlist, or the library for a row without one", () => {
    expect(
      lifecycleSourceHref("studio_playlist_editor_added", addedPayload),
    ).toEqual({ href: "/studio/collection?id=playlist-7" });
    expect(lifecycleSourceHref("studio_playlist_editor_invite", {})).toEqual({
      href: "/studio/library",
    });
    expect(
      notificationDtoToView(
        dto("studio_playlist_editor_invite", invitePayload),
        makeT("en"),
        createFormatters("en"),
      ).sourceHref,
    ).toBe("/studio/collection?id=playlist-9");
  });
});
