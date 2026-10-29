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

const claimed = {
  purchaseId: "p1",
  subprofileId: "sp1",
  artistName: "Mariana Sol",
  itemKind: "release",
  itemTitle: "Cidade dos santos",
  amountCents: 800,
};

const buyer = {
  purchaseId: "p1",
  artistName: "Mariana Sol",
  itemKind: "release",
  itemTitle: "Cidade dos santos",
};

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

function text(notification: NotificationDTO, language: Language = "en") {
  return notificationDtoToView(
    notification,
    makeT(language),
    createFormatters(language),
  ).text;
}

describe("studio purchase notifications", () => {
  it("tells every persona member a payment waits, bundled per persona", () => {
    expect(text(dto("studio_purchase_claimed", claimed))).toBe(
      "Someone says they paid Mariana Sol for Cidade dos santos. Check it and confirm.",
    );
    expect(
      text({ ...dto("studio_purchase_claimed", claimed), otherActorCount: 2 }),
    ).toBe("You have 3 payments to confirm for Mariana Sol.");
    expect(lifecycleSourceHref("studio_purchase_claimed", claimed)).toEqual({
      href: "/studio/payments?persona=sp1",
    });
    expect(
      lifecycleSourceHref("studio_purchase_claimed", {
        ...claimed,
        subprofileId: undefined,
      }),
    ).toEqual({ href: "/studio/payments" });
    const view = notificationDtoToView(
      { ...dto("studio_purchase_claimed", claimed), otherActorCount: 2 },
      makeT("en"),
      createFormatters("en"),
    );
    expect(view.hasOwnBundleCount).toBe(true);
  });

  it("never prints the amount in the bell", () => {
    expect(text(dto("studio_purchase_claimed", claimed))).not.toMatch(/800|€/);
  });

  it("sends the buyer's three kinds to their purchases page", () => {
    for (const type of [
      "studio_purchase_confirmed",
      "studio_purchase_declined",
      "studio_purchase_expired",
    ]) {
      expect(lifecycleSourceHref(type, { purchaseId: "p1" })).toEqual({
        href: "/account/music-purchases",
      });
    }
  });

  it("names the decline reason, and a reason this build does not know reads the fallback", () => {
    expect(
      text(
        dto("studio_purchase_declined", {
          ...buyer,
          declineReason: "amount_different",
        }),
      ),
    ).toBe(
      "Mariana Sol declined your payment for Cidade dos santos: the amount was different.",
    );
    expect(
      text(
        dto("studio_purchase_declined", { ...buyer, declineReason: "rude" }),
      ),
    ).toContain("see your purchases for the reason");
    expect(text(dto("studio_purchase_declined", buyer))).toContain(
      "see your purchases for the reason",
    );
  });

  it("falls back to neutral phrases for a payload missing its names", () => {
    expect(text(dto("studio_purchase_confirmed", { purchaseId: "p1" }))).toBe(
      "An artist confirmed your payment for this music. It's ready to download.",
    );
  });

  it("reads every kind as a full Portuguese sentence", () => {
    const declinedPayload = { ...buyer, declineReason: "amount_different" };
    expect(text(dto("studio_purchase_claimed", claimed), "pt")).toBe(
      "Alguém diz que pagou Cidade dos santos a Mariana Sol. Verifica e confirma.",
    );
    expect(
      text(
        { ...dto("studio_purchase_claimed", claimed), otherActorCount: 2 },
        "pt",
      ),
    ).toBe("Tens 3 pagamentos por confirmar de Mariana Sol.");
    expect(text(dto("studio_purchase_confirmed", buyer), "pt")).toBe(
      "Mariana Sol confirmou o teu pagamento por Cidade dos santos. Já podes transferir.",
    );
    expect(text(dto("studio_purchase_declined", declinedPayload), "pt")).toBe(
      "Mariana Sol recusou o teu pagamento por Cidade dos santos: o valor era diferente.",
    );
    expect(text(dto("studio_purchase_expired", buyer), "pt")).toBe(
      "O teu pedido por Cidade dos santos de Mariana Sol expirou ao fim de 30 dias sem resposta.",
    );
  });

  it("reads the Portuguese fallbacks for a payload missing its names", () => {
    expect(
      text(dto("studio_purchase_confirmed", { purchaseId: "p1" }), "pt"),
    ).toBe(
      "Uma pessoa artista confirmou o teu pagamento por esta música. Já podes transferir.",
    );
    expect(
      text(dto("studio_purchase_declined", { purchaseId: "p1" }), "pt"),
    ).toBe(
      "Uma pessoa artista recusou o teu pagamento por esta música: vê o motivo nas tuas compras.",
    );
  });

  it("offers Review payments to a persona member and Open your purchases to the buyer", () => {
    const claimedView = notificationDtoToView(
      dto("studio_purchase_claimed", claimed),
      makeT("en"),
      createFormatters("en"),
    );
    expect(claimedView.actions?.[0]).toMatchObject({
      label: "Review payments",
      href: "/studio/payments?persona=sp1",
    });
    const confirmedView = notificationDtoToView(
      dto("studio_purchase_confirmed", buyer),
      makeT("en"),
      createFormatters("en"),
    );
    expect(confirmedView.actions?.[0]).toMatchObject({
      label: "Open your purchases",
      href: "/account/music-purchases",
    });
  });
});
