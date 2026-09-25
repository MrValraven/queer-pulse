import { describe, expect, it } from "vitest";
import { formatPushCopy } from "./pushMessages";

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
    expect(result.title).toBe("Ana"); // plain fallback — no titleKey given
    expect(result.body).toBe(
      "This is a test — your notifications are working.",
    );
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
