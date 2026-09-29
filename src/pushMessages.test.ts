import { describe, expect, it } from "vitest";
import {
  CATALOG,
  EVENT_REMINDER_ACTION_DETAILS_KEY,
  formatPushActions,
  formatPushCopy,
} from "./pushMessages";

describe("formatPushCopy", () => {
  const base = { title: "Ana", body: "hi" };

  it("resolves a known key in EN with params interpolated", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            titleKey: "push:connection.request.title",
            bodyKey: "push:connection.request.body",
            params: { name: "Ana" },
          },
        },
        "en",
      ),
    ).toEqual({
      title: "New connection request",
      body: "Ana wants to connect with you.",
    });
  });

  it("resolves the same key in PT", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            titleKey: "push:connection.request.title",
            bodyKey: "push:connection.request.body",
            params: { name: "Ana" },
          },
        },
        "pt",
      ),
    ).toEqual({
      title: "Novo pedido de conexão",
      body: "Ana quer ligar-se a ti.",
    });
  });

  it("falls back to the plain title/body when there is no l10n block", () => {
    expect(formatPushCopy(base, "pt")).toEqual({ title: "Ana", body: "hi" });
  });

  it("falls back to the plain title/body when the key isn't in the catalog", () => {
    expect(
      formatPushCopy(
        { ...base, l10n: { bodyKey: "push:does.not.exist" } },
        "en",
      ),
    ).toEqual({ title: "Ana", body: "hi" });
  });

  it("leaves an unknown token intact rather than blanking it", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            bodyKey: "push:connection.request.body",
            params: {},
          },
        },
        "en",
      ).body,
    ).toBe("{name} wants to connect with you.");
  });

  it("supports mixed title-only / body-only l10n, resolving only the given side", () => {
    const result = formatPushCopy(
      { ...base, l10n: { bodyKey: "push:test.body" } },
      "en",
    );
    expect(result.title).toBe("Ana"); // plain fallback: no titleKey given
    expect(result.body).toBe("This is a test. Your notifications are working.");
  });

  it("resolves the messages.coalesced count/name summary", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            bodyKey: "push:messages.coalesced",
            params: { count: "3", name: "Priya" },
          },
        },
        "en",
      ).body,
    ).toBe("3 new messages from Priya");
  });

  it("titles a staff reply with the first name and the business", () => {
    expect(
      formatPushCopy(
        {
          title: "Café Lisboa",
          body: "See you Saturday",
          l10n: {
            titleKey: "push:messages.staffTitle",
            params: { name: "Rui", business: "Café Lisboa" },
          },
        },
        "en",
      ).title,
    ).toBe("Rui from Café Lisboa");
  });

  it("keeps an attachment body key beside the staff title", () => {
    const copy = formatPushCopy(
      {
        title: "Café Lisboa",
        body: "Photo",
        l10n: {
          titleKey: "push:messages.staffTitle",
          bodyKey: "push:messages.attachment.photo",
          params: { name: "Rui", business: "Café Lisboa" },
        },
      },
      "en",
    );
    expect(copy.title).toBe("Rui from Café Lisboa");
    expect(copy.body).not.toContain("{");
  });

  it("falls back to the plain title when a title token has no value", () => {
    expect(
      formatPushCopy(
        {
          title: "Café Lisboa",
          body: "x",
          l10n: {
            titleKey: "push:messages.staffTitle",
            params: { count: "3", name: "Rui" },
          },
        },
        "pt",
      ).title,
    ).toBe("Café Lisboa");
  });
});

describe("formatPushCopy: section 4 keys", () => {
  const expectedCopy: Record<string, { en: string; pt: string }> = {
    "push:messages.coalescedGroup": {
      en: "3 new messages in Terrace crew",
      pt: "3 novas mensagens em Terrace crew",
    },
    "push:messages.attachment.photo": { en: "Photo", pt: "Foto" },
    "push:messages.attachment.gif": { en: "GIF", pt: "GIF" },
    "push:messages.attachment.document": { en: "Document", pt: "Documento" },
    "push:messages.attachment.sticker": { en: "Sticker", pt: "Sticker" },
    "push:messages.group.attachment.photo": {
      en: "Bo: Photo",
      pt: "Bo: Foto",
    },
    "push:messages.group.attachment.gif": { en: "Bo: GIF", pt: "Bo: GIF" },
    "push:messages.group.attachment.document": {
      en: "Bo: Document",
      pt: "Bo: Documento",
    },
    "push:messages.group.attachment.sticker": {
      en: "Bo: Sticker",
      pt: "Bo: Sticker",
    },
    "push:preview.hidden.messages": {
      en: "3 new messages.",
      pt: "3 mensagens novas.",
    },
    "push:security.newSignIn.body": {
      en: "A new device signed in to your account.",
      pt: "Um novo dispositivo iniciou sessão na tua conta.",
    },
    "push:groupAdded.title": {
      en: "Added to a group",
      pt: "Adicionaram-te a um grupo",
    },
    "push:groupAdded.body": {
      en: "Bo added you to Terrace crew.",
      pt: "Bo adicionou-te a Terrace crew.",
    },
    "push:groupAdded.bodyUntitled": {
      en: "Bo added you to a group.",
      pt: "Bo adicionou-te a um grupo.",
    },
    "push:listingOwnerOffer.title": {
      en: "Ownership offer",
      pt: "Oferta de propriedade",
    },
    "push:listingOwnerOffer.body": {
      en: "Bo has offered you ownership of Casa Rosa.",
      pt: "Bo ofereceu-te a propriedade de Casa Rosa.",
    },
    "push:messages.staffTitle": {
      en: "Bo from Casa Rosa",
      pt: "Bo, de Casa Rosa",
    },
  };
  const params = {
    business: "Casa Rosa",
    count: "3",
    group: "Terrace crew",
    listingName: "Casa Rosa",
    name: "Bo",
  };

  for (const [key, copy] of Object.entries(expectedCopy)) {
    it(`resolves ${key} in EN and PT`, () => {
      const source = {
        title: "fallback title",
        body: "fallback body",
        l10n: { bodyKey: key, params },
      };
      expect(formatPushCopy(source, "en").body).toBe(copy.en);
      expect(formatPushCopy(source, "pt").body).toBe(copy.pt);
    });
  }
});

describe("formatPushCopy: forum thread verdicts (ENG-413)", () => {
  const expectedCopy: Record<string, { en: string; pt: string }> = {
    "push:forumThreadReviewed.approved.title": {
      en: "Your thread is live",
      pt: "O teu tópico está publicado",
    },
    "push:forumThreadReviewed.approved.body": {
      en: "Night walks is on the forum now.",
      pt: "Night walks já está no fórum.",
    },
    "push:forumThreadReviewed.rejected.title": {
      en: "About your thread",
      pt: "Sobre o teu tópico",
    },
    "push:forumThreadReviewed.rejected.body": {
      en: "Night walks was not published. Tap to read why.",
      pt: "Night walks não foi publicado. Toca para leres porquê.",
    },
  };

  for (const [key, copy] of Object.entries(expectedCopy)) {
    it(`resolves ${key} in EN and PT`, () => {
      const source = {
        title: "fallback title",
        body: "fallback body",
        l10n: { bodyKey: key, params: { title: "Night walks" } },
      };
      expect(formatPushCopy(source, "en").body).toBe(copy.en);
      expect(formatPushCopy(source, "pt").body).toBe(copy.pt);
    });
  }
});

describe("push copy catalog", () => {
  it("holds the same keys in EN and PT", () => {
    expect(Object.keys(CATALOG.pt).sort()).toEqual(
      Object.keys(CATALOG.en).sort(),
    );
  });

  it("uses no em dash in any EN or PT string (DES-402)", () => {
    const emDash = String.fromCharCode(0x2014);
    for (const lang of ["en", "pt"] as const) {
      for (const [key, text] of Object.entries(CATALOG[lang])) {
        expect({ lang, key, hasEmDash: text.includes(emDash) }).toEqual({
          lang,
          key,
          hasEmDash: false,
        });
      }
    }
  });

  it("reads the event reminder body as the backend fallback sentence", () => {
    const source = {
      title: "Picnic",
      body: "Starting soon. Tap to see the details.",
      l10n: { bodyKey: "push:event.reminder.body" },
    };
    expect(formatPushCopy(source, "en").body).toBe(
      "Starting soon. Tap to see the details.",
    );
    expect(formatPushCopy(source, "pt").body).toBe(
      "A começar em breve. Toca para ver os detalhes.",
    );
  });
});

describe("formatPushActions (ENG-414)", () => {
  const detailsAction = {
    action: "view",
    title: "Details",
    titleKey: EVENT_REMINDER_ACTION_DETAILS_KEY,
  };

  it("localises an action title from its titleKey", () => {
    expect(formatPushActions([detailsAction], "pt")).toEqual([
      { action: "view", title: "Detalhes" },
    ]);
    expect(formatPushActions([detailsAction], "en")).toEqual([
      { action: "view", title: "Details" },
    ]);
  });

  it("keeps the English title when the action has no titleKey", () => {
    expect(
      formatPushActions([{ action: "view", title: "Open" }], "pt"),
    ).toEqual([{ action: "view", title: "Open" }]);
  });

  it("keeps the English title when the titleKey is not in the catalog", () => {
    expect(
      formatPushActions(
        [{ action: "view", title: "Open", titleKey: "push:unknown.key" }],
        "pt",
      ),
    ).toEqual([{ action: "view", title: "Open" }]);
  });

  it("falls back to the EN catalog for an unknown language", () => {
    const unknownLang = "fr" as unknown as "en";
    expect(formatPushActions([detailsAction], unknownLang)).toEqual([
      { action: "view", title: "Details" },
    ]);
  });

  it("returns undefined when the payload has no actions", () => {
    expect(formatPushActions(undefined, "pt")).toBeUndefined();
  });
});
