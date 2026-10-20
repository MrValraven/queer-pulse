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
  subprofileId: "sp-1",
  personaName: "Agulha Lenta",
  listingName: "Navalha",
  listingSlug: "navalha",
  roleLabel: null,
};
const requestPayload = {
  listingRef: "QPL-2026-0042",
  personaName: "Agulha Lenta",
  listingName: "Navalha",
  listingSlug: "navalha",
  roleLabel: null,
};

function dto(type: string, payload: Record<string, unknown>): NotificationDTO {
  return {
    id: "6c1f3a2e-9b4d-4e5f-8a7b-1c2d3e4f5a6b",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type,
    payload,
    read: false,
    createdAt: "2026-10-19T10:30:00.000Z",
  };
}

const TEAM_SECTION_HREF =
  "/local/directory/list/QPL-2026-0042/edit#lb-editor-team";
const WORKS_AT_HREF = "/account/subprofiles/sp-1/edit?pane=works-at";

describe("listing team notifications", () => {
  it("names the listing and the persona on an invite in both languages, filed under community", () => {
    const en = formatNotification(
      "listing_team_invite",
      invitePayload,
      makeT("en"),
    );
    expect(en.text).toBe("Navalha invited Agulha Lenta to its team.");
    expect(en.meta).toBe("Team invite");
    expect(en.category).toBe("community");
    expect(
      formatNotification("listing_team_invite", invitePayload, makeT("pt"))
        .text,
    ).toBe("Navalha convidou Agulha Lenta para a equipa.");
  });

  it("reads a row missing its names as a whole sentence", () => {
    expect(
      formatNotification("listing_team_request", {}, makeT("en")).text,
    ).toBe("A persona asked to join the team at your business.");
  });

  it("opens the Works at pane from an invite", () => {
    expect(
      lifecycleSourceHref("listing_team_invite", { subprofileId: "sp-1" })
        ?.href,
    ).toBe(WORKS_AT_HREF);
  });

  it("opens the Team section from a request", () => {
    expect(
      lifecycleSourceHref("listing_team_request", {
        listingRef: "QPL-2026-0042",
      })?.href,
    ).toBe(TEAM_SECTION_HREF);
    expect(
      lifecycleSourceHref("listing_team_request", {})?.href,
    ).toBeUndefined();
  });

  it("sends an accepted link to the side that started it", () => {
    expect(
      lifecycleSourceHref("listing_team_accepted", {
        initiatedBy: "listing",
        listingRef: "QPL-2026-0042",
      })?.href,
    ).toBe(TEAM_SECTION_HREF);
    expect(
      lifecycleSourceHref("listing_team_accepted", {
        initiatedBy: "persona",
        subprofileId: "sp-1",
      })?.href,
    ).toBe(WORKS_AT_HREF);
    expect(
      lifecycleSourceHref("listing_team_accepted", {
        initiatedBy: "persona",
        personaHandle: "agulha-lenta",
      })?.href,
    ).toBe("/p/agulha-lenta");
  });

  it("offers Review invite and Review request as the row action", () => {
    const formatters = createFormatters("en");
    const invite = notificationDtoToView(
      dto("listing_team_invite", invitePayload),
      makeT("en"),
      formatters,
    );
    expect(invite.actions?.[0]).toMatchObject({
      label: "Review invite",
      href: WORKS_AT_HREF,
    });
    const request = notificationDtoToView(
      dto("listing_team_request", requestPayload),
      makeT("en"),
      formatters,
    );
    expect(request.actions?.[0]).toMatchObject({
      label: "Review request",
      href: TEAM_SECTION_HREF,
    });
  });

  it("carries no person on any of the three rows", () => {
    const formatters = createFormatters("en");
    for (const [type, payload] of [
      ["listing_team_invite", invitePayload],
      ["listing_team_request", requestPayload],
      ["listing_team_accepted", { ...requestPayload, initiatedBy: "listing" }],
    ] as const) {
      const view = notificationDtoToView(
        dto(type, payload),
        makeT("en"),
        formatters,
      );
      expect(view.actor).toBeUndefined();
    }
  });
});
