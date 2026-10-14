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

const requested = {
  creditedPersonaName: "Mariana Sol",
  requestingPersonaName: "NIGHTFORM",
  requestingPersonaHandle: "nightform",
  trackTitle: "Pedro on the 25",
  releaseTitle: "Pedro on the 25",
  role: "co-writer",
};

const accepted = {
  requestingPersonaName: "Mariana Sol",
  creditedPersonaName: "NIGHTFORM",
  creditedPersonaHandle: "nightform",
  trackId: "track-6",
  trackTitle: "Carta para a santa",
  releaseTitle: "Cidade dos santos",
  role: "producer",
};

function dto(type: string, payload: Record<string, unknown>): NotificationDTO {
  return {
    id: "0f5a7c2e-1b3d-4e6f-8a9b-c0d1e2f3a4b5",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type,
    payload,
    read: false,
    createdAt: "2026-10-13T10:30:00.000Z",
  };
}

describe("studio_credit_requested", () => {
  it("names both personas, the role and the track, filed under community", () => {
    const en = formatNotification(
      "studio_credit_requested",
      requested,
      makeT("en"),
    );
    expect(en.text).toBe(
      "NIGHTFORM credited Mariana Sol as Co-writer on Pedro on the 25.",
    );
    expect(en.meta).toBe("Credit request");
    expect(en.category).toBe("community");
    const pt = formatNotification(
      "studio_credit_requested",
      requested,
      makeT("pt"),
    );
    expect(pt.text).toBe(
      "NIGHTFORM creditou Mariana Sol como Coautoria em Pedro on the 25.",
    );
  });

  it("names every role from the notifications catalog alone in both languages", () => {
    for (const role of [
      "featured",
      "producer",
      "co-writer",
      "mixing",
      "mastering",
      "remix",
      "cover-art",
      "other",
    ]) {
      for (const language of ["en", "pt"] as const) {
        const result = formatNotification(
          "studio_credit_requested",
          { ...requested, role },
          makeT(language),
        );
        expect(result.text).not.toMatch(/ como {2}| as {2}/);
        expect(result.text).toContain("Mariana Sol");
      }
    }
  });

  it("counts a bundled row as several requests to the persona", () => {
    const en = formatNotification(
      "studio_credit_requested",
      requested,
      makeT("en"),
      undefined,
      2,
    );
    expect(en.text).toBe("Mariana Sol has 3 new credit requests.");
    const pt = formatNotification(
      "studio_credit_requested",
      requested,
      makeT("pt"),
      undefined,
      2,
    );
    expect(pt.text).toBe("Mariana Sol tem 3 pedidos de crédito novos.");
    const view = notificationDtoToView(
      { ...dto("studio_credit_requested", requested), otherActorCount: 2 },
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.hasOwnBundleCount).toBe(true);
  });

  it("counts one other actor as two requests", () => {
    const en = formatNotification(
      "studio_credit_requested",
      requested,
      makeT("en"),
      undefined,
      1,
    );
    expect(en.text).toBe("Mariana Sol has 2 new credit requests.");
  });

  it("still reads a whole sentence with an unknown role and no names", () => {
    const result = formatNotification(
      "studio_credit_requested",
      { role: "lighting" },
      makeT("en"),
    );
    expect(result.text).toBe(
      "A persona credited your persona as a collaborator on a track.",
    );
  });

  it("opens the credits inbox and offers Review credit", () => {
    expect(lifecycleSourceHref("studio_credit_requested", requested)).toEqual({
      href: "/studio/credits",
    });
    const view = notificationDtoToView(
      dto("studio_credit_requested", requested),
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.actions?.[0]).toMatchObject({
      label: "Review credit",
      href: "/studio/credits",
    });
  });
});

describe("studio_credit_accepted", () => {
  it("names the persona, the role and the track", () => {
    const result = formatNotification(
      "studio_credit_accepted",
      accepted,
      makeT("en"),
    );
    expect(result.text).toBe(
      "NIGHTFORM accepted the credit as Producer on Carta para a santa.",
    );
    expect(result.meta).toBe("Credit accepted");
  });

  it("opens the track, or the inbox when the row has no track id", () => {
    expect(lifecycleSourceHref("studio_credit_accepted", accepted)).toEqual({
      href: "/studio/track?id=track-6",
    });
    expect(
      lifecycleSourceHref("studio_credit_accepted", {
        ...accepted,
        trackId: undefined,
      }),
    ).toEqual({ href: "/studio/credits" });
  });
});
