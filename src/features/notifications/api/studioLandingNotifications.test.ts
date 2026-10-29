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

const requestedPayload = {
  subprofileId: "demo-persona-mariana-sol",
  personaName: "Mariana Sol",
  trackTitle: "Carta para a santa",
};

const livePayload = {
  subprofileId: "demo-persona-mariana-sol",
  mainPersonaName: "Mariana Sol",
  trackTitle: "Carta para a santa",
};

const DASHBOARD_HREF =
  "/studio/dashboard?persona=demo-persona-mariana-sol#landing-previews";

function dto(type: string, payload: Record<string, unknown>): NotificationDTO {
  return {
    id: "0f5a7c2e-1b3d-4e6f-8a9b-c0d1e2f3a4b5",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type,
    payload,
    read: false,
    createdAt: "2026-10-28T10:30:00.000Z",
  };
}

describe("studio_landing_preview_requested", () => {
  it("names the track and the persona in both languages", () => {
    const en = formatNotification(
      "studio_landing_preview_requested",
      requestedPayload,
      makeT("en"),
    );
    expect(en.text).toBe(
      "Our team would like to play Carta para a santa by Mariana Sol on the Studio page.",
    );
    expect(en.meta).toBe("Studio page request");
    expect(en.category).toBe("community");
    const pt = formatNotification(
      "studio_landing_preview_requested",
      requestedPayload,
      makeT("pt"),
    );
    expect(pt.text).toBe(
      "A nossa equipa gostava de tocar Carta para a santa de Mariana Sol na página do Studio.",
    );
    expect(pt.meta).toBe("Pedido da página do Studio");
  });

  it("reads a bundled row as a count of tracks with no others suffix", () => {
    const en = formatNotification(
      "studio_landing_preview_requested",
      requestedPayload,
      makeT("en"),
      undefined,
      2,
    );
    expect(en.text).toBe(
      "Our team would like to play 3 tracks by Mariana Sol on the Studio page.",
    );
    const pt = formatNotification(
      "studio_landing_preview_requested",
      requestedPayload,
      makeT("pt"),
      undefined,
      2,
    );
    expect(pt.text).toBe(
      "A nossa equipa gostava de tocar 3 faixas de Mariana Sol na página do Studio.",
    );
    const view = notificationDtoToView(
      {
        ...dto("studio_landing_preview_requested", requestedPayload),
        otherActorCount: 2,
      },
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.hasOwnBundleCount).toBe(true);
    expect(view.text).not.toMatch(/and 2 others/);
  });

  it("reads the fallbacks when the payload has no names", () => {
    const withoutTrack = formatNotification(
      "studio_landing_preview_requested",
      { subprofileId: "demo-persona-mariana-sol", personaName: "Mariana Sol" },
      makeT("en"),
    );
    expect(withoutTrack.text).toBe(
      "Our team would like to play a track by Mariana Sol on the Studio page.",
    );
    const withoutNames = formatNotification(
      "studio_landing_preview_requested",
      {},
      makeT("en"),
    );
    expect(withoutNames.text).toBe(
      "Our team would like to play a track by your persona on the Studio page.",
    );
  });

  it("opens the dashboard previews card and offers Answer the request", () => {
    expect(
      lifecycleSourceHref("studio_landing_preview_requested", requestedPayload),
    ).toEqual({ href: DASHBOARD_HREF });
    expect(lifecycleSourceHref("studio_landing_preview_requested", {})).toEqual(
      { href: "/studio/dashboard#landing-previews" },
    );
    const view = notificationDtoToView(
      dto("studio_landing_preview_requested", requestedPayload),
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.actions?.[0]).toMatchObject({
      label: "Answer the request",
      variant: "primary",
      href: DASHBOARD_HREF,
    });
  });
});

describe("studio_landing_preview_live", () => {
  it("names the track and the main persona in both languages", () => {
    const en = formatNotification(
      "studio_landing_preview_live",
      livePayload,
      makeT("en"),
    );
    expect(en.text).toBe(
      "Carta para a santa by Mariana Sol is approved for the Studio page.",
    );
    expect(en.meta).toBe("Approved for the Studio page");
    expect(en.category).toBe("community");
    const pt = formatNotification(
      "studio_landing_preview_live",
      livePayload,
      makeT("pt"),
    );
    expect(pt.text).toBe(
      "Carta para a santa de Mariana Sol está aprovada para a página do Studio.",
    );
  });

  it("reads a bundled row as a count of tracks with no others suffix", () => {
    const en = formatNotification(
      "studio_landing_preview_live",
      livePayload,
      makeT("en"),
      undefined,
      1,
    );
    expect(en.text).toBe("2 of your tracks are approved for the Studio page.");
    const view = notificationDtoToView(
      {
        ...dto("studio_landing_preview_live", livePayload),
        otherActorCount: 1,
      },
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.hasOwnBundleCount).toBe(true);
  });

  it("opens the dashboard previews card with no extra action", () => {
    expect(
      lifecycleSourceHref("studio_landing_preview_live", livePayload),
    ).toEqual({ href: DASHBOARD_HREF });
    expect(lifecycleSourceHref("studio_landing_preview_live", {})).toEqual({
      href: "/studio/dashboard#landing-previews",
    });
    const view = notificationDtoToView(
      dto("studio_landing_preview_live", livePayload),
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.actions).toBeUndefined();
  });
});

describe("studio_access_granted", () => {
  it("reads in both languages and files under platform", () => {
    const en = formatNotification("studio_access_granted", {}, makeT("en"));
    expect(en.text).toBe("Studio is open for you. Come and listen.");
    expect(en.meta).toBe("Studio access");
    expect(en.category).toBe("platform");
    const pt = formatNotification("studio_access_granted", {}, makeT("pt"));
    expect(pt.text).toBe("O Studio já está aberto para ti. Vem ouvir.");
  });

  it("opens Studio and offers Open Studio", () => {
    expect(lifecycleSourceHref("studio_access_granted", {})).toEqual({
      href: "/studio",
    });
    const view = notificationDtoToView(
      dto("studio_access_granted", {}),
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.actions?.[0]).toMatchObject({
      label: "Open Studio",
      variant: "primary",
      href: "/studio",
    });
    expect(view.hasOwnBundleCount).toBe(false);
  });
});
