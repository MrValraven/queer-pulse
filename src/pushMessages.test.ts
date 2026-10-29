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

describe("formatPushCopy: Studio milestone shares (dashboard Part 1)", () => {
  const cases = [
    [
      "push:messages.studio.milestone",
      {},
      "Shared a milestone from Studio",
      "Partilhou um marco do Studio",
    ],
    [
      "push:messages.studio.milestoneWithNote",
      { note: "yes" },
      "Shared a milestone from Studio: yes",
      "Partilhou um marco do Studio: yes",
    ],
    [
      "push:messages.group.studio.milestone",
      { name: "Ana" },
      "Ana shared a milestone from Studio",
      "Ana partilhou um marco do Studio",
    ],
    [
      "push:messages.group.studio.milestoneWithNote",
      { name: "Ana", note: "yes" },
      "Ana shared a milestone from Studio: yes",
      "Ana partilhou um marco do Studio: yes",
    ],
    [
      "push:messages.group.mention.studio.milestone",
      { name: "Ana" },
      "Ana mentioned you and shared a milestone from Studio",
      "Ana mencionou-te e partilhou um marco do Studio",
    ],
    [
      "push:messages.group.mention.studio.milestoneWithNote",
      { name: "Ana", note: "yes" },
      "Ana mentioned you and shared a milestone from Studio: yes",
      "Ana mencionou-te e partilhou um marco do Studio: yes",
    ],
  ] as const;

  function resolved(
    key: string,
    params: Record<string, string>,
    language: "en" | "pt",
  ): string {
    const source = {
      title: "fallback title",
      body: "fallback body",
      l10n: { bodyKey: key, params },
    };
    return formatPushCopy(source, language).body;
  }

  for (const [key, params, english, portuguese] of cases) {
    it(`resolves ${key} in EN and PT`, () => {
      expect(resolved(key, params, "en")).toBe(english);
      expect(resolved(key, params, "pt")).toBe(portuguese);
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

describe("studio release push copy", () => {
  it("names the persona and the release in both languages", () => {
    const source = {
      title: "New from an artist you follow",
      body: "Mariana Sol released Cidade dos santos",
      l10n: {
        titleKey: "push:studioReleasePublished.title",
        bodyKey: "push:studioReleasePublished.body",
        params: { persona: "Mariana Sol", title: "Cidade dos santos" },
      },
    };
    expect(formatPushCopy(source, "en")).toEqual({
      title: "New from an artist you follow",
      body: "Mariana Sol released Cidade dos santos",
    });
    expect(formatPushCopy(source, "pt")).toEqual({
      title: "Novidade de quem segues",
      body: "Mariana Sol lançou Cidade dos santos",
    });
  });
});

describe("studio credit push copy", () => {
  it("names the personas and the track in both languages", () => {
    const requestedSource = {
      title: "New credit request",
      body: "NIGHTFORM credited Mariana Sol on Pedro on the 25",
      l10n: {
        titleKey: "push:studioCreditRequested.title",
        bodyKey: "push:studioCreditRequested.body",
        params: {
          requester: "NIGHTFORM",
          persona: "Mariana Sol",
          track: "Pedro on the 25",
        },
      },
    };
    expect(formatPushCopy(requestedSource, "pt")).toEqual({
      title: "Novo pedido de crédito",
      body: "NIGHTFORM creditou Mariana Sol em Pedro on the 25",
    });
    const acceptedSource = {
      title: "Credit accepted",
      body: "NIGHTFORM accepted your credit on Carta para a santa",
      l10n: {
        titleKey: "push:studioCreditAccepted.title",
        bodyKey: "push:studioCreditAccepted.body",
        params: { persona: "NIGHTFORM", track: "Carta para a santa" },
      },
    };
    expect(formatPushCopy(acceptedSource, "en")).toEqual({
      title: "Credit accepted",
      body: "NIGHTFORM accepted your credit on Carta para a santa",
    });
    expect(formatPushCopy(acceptedSource, "pt")).toEqual({
      title: "Crédito aceite",
      body: "NIGHTFORM aceitou o teu crédito em Carta para a santa",
    });
  });
});

describe("studio purchase push copy", () => {
  const params = { artist: "Mariana Sol", item: "Cidade dos santos" };
  const cases = [
    {
      key: "studioPurchaseClaimed",
      en: {
        title: "New payment to confirm",
        body: "Cidade dos santos: a buyer says they paid Mariana Sol. Confirm it in Studio.",
      },
      pt: {
        title: "Novo pagamento para confirmar",
        body: "Cidade dos santos: alguém diz que pagou a Mariana Sol. Confirma no Studio.",
      },
    },
    {
      key: "studioPurchaseConfirmed",
      en: {
        title: "Payment confirmed",
        body: "Mariana Sol confirmed your payment for Cidade dos santos. Your download is ready.",
      },
      pt: {
        title: "Pagamento confirmado",
        body: "Mariana Sol confirmou o teu pagamento de Cidade dos santos. O teu download está pronto.",
      },
    },
    {
      key: "studioPurchaseDeclined",
      en: {
        title: "Payment not confirmed",
        body: "Mariana Sol could not confirm your payment for Cidade dos santos. Open Studio to see why.",
      },
      pt: {
        title: "Pagamento não confirmado",
        body: "Mariana Sol não conseguiu confirmar o teu pagamento de Cidade dos santos. Abre o Studio para ver porquê.",
      },
    },
  ];

  it.each(cases)(
    "resolves $key in both languages with both params",
    (entry) => {
      const source = {
        title: "x",
        body: "y",
        l10n: {
          titleKey: `push:${entry.key}.title`,
          bodyKey: `push:${entry.key}.body`,
          params,
        },
      };
      expect(formatPushCopy(source, "en")).toEqual(entry.en);
      expect(formatPushCopy(source, "pt")).toEqual(entry.pt);
    },
  );
});

describe("persona post push copy", () => {
  it("titles the push with the persona and shows the excerpt in both languages", () => {
    const source = {
      title: "Fallback title",
      body: "Fallback body",
      l10n: {
        titleKey: "push:personaPost.title",
        bodyKey: "push:personaPost.body",
        params: { persona: "NIGHTFORM", excerpt: "New single in nine days" },
      },
    };
    expect(formatPushCopy(source, "en")).toEqual({
      title: "NIGHTFORM",
      body: "New single in nine days",
    });
    expect(formatPushCopy(source, "pt")).toEqual({
      title: "NIGHTFORM",
      body: "New single in nine days",
    });
  });
});

describe("studio episode push copy", () => {
  it("names the show, the persona and the episode in both languages", () => {
    const source = {
      title: "New episode of Late Bloomers",
      body: "Late Bloomers: Chosen family dinners",
      l10n: {
        titleKey: "push:studioEpisodePublished.title",
        bodyKey: "push:studioEpisodePublished.body",
        params: {
          show: "Late Bloomers",
          persona: "Late Bloomers",
          episode: "Chosen family dinners",
        },
      },
    };
    expect(formatPushCopy(source, "en")).toEqual({
      title: "New episode of Late Bloomers",
      body: "Late Bloomers: Chosen family dinners",
    });
    expect(formatPushCopy(source, "pt")).toEqual({
      title: "Novo episódio de Late Bloomers",
      body: "Late Bloomers: Chosen family dinners",
    });
  });
});

describe("Studio share push copy", () => {
  const kinds = ["track", "release", "playlist"] as const;
  const keysOf = (kind: (typeof kinds)[number]) =>
    [
      "push:messages.studio",
      "push:messages.group.studio",
      "push:messages.group.mention.studio",
    ].flatMap((prefix) => [`${prefix}.${kind}`, `${prefix}.${kind}WithNote`]);

  it("has all 18 keys in both languages", () => {
    const keys = kinds.flatMap(keysOf);
    expect(keys).toHaveLength(18);
    for (const key of keys) {
      expect(CATALOG.en[key]).toBeDefined();
      expect(CATALOG.pt[key]).toBeDefined();
    }
  });

  it("names the kind and the note and no title", () => {
    expect(
      formatPushCopy(
        {
          title: "Ana",
          body: "Shared a track from Studio: ouve isto",
          l10n: {
            bodyKey: "push:messages.studio.trackWithNote",
            params: { note: "ouve isto" },
          },
        },
        "pt",
      ).body,
    ).toBe("Partilhou uma faixa do Studio: ouve isto");
  });

  it("names the sender in a group", () => {
    expect(
      formatPushCopy(
        {
          title: "Porto Mentoring Circle",
          body: "Maria shared a playlist from Studio",
          l10n: {
            bodyKey: "push:messages.group.studio.playlist",
            params: { name: "Maria" },
          },
        },
        "en",
      ).body,
    ).toBe("Maria shared a playlist from Studio");
  });

  it("folds a mention into the same push", () => {
    expect(
      formatPushCopy(
        {
          title: "Porto Mentoring Circle",
          body: "Maria mentioned you and shared a release from Studio",
          l10n: {
            bodyKey: "push:messages.group.mention.studio.release",
            params: { name: "Maria" },
          },
        },
        "pt",
      ).body,
    ).toBe("Maria mencionou-te e partilhou um lançamento do Studio");
  });
});

describe("collaborative playlist push copy", () => {
  it("names the owner and the playlist in both languages", () => {
    const inviteSource = {
      title: "Playlist invite",
      body: "Catarina Vaz invited you to edit Pride warm-up",
      l10n: {
        titleKey: "push:studioPlaylistEditorInvite.title",
        bodyKey: "push:studioPlaylistEditorInvite.body",
        params: { name: "Catarina Vaz", playlist: "Pride warm-up" },
      },
    };
    expect(formatPushCopy(inviteSource, "en")).toEqual({
      title: "Playlist invite",
      body: "Catarina Vaz invited you to edit Pride warm-up",
    });
    expect(formatPushCopy(inviteSource, "pt")).toEqual({
      title: "Convite para playlist",
      body: "Catarina Vaz convidou-te para editar Pride warm-up",
    });
    const addedSource = {
      title: "You can edit a playlist",
      body: "Rita Varela added you as an editor of Tour diary (Mariana Sol)",
      l10n: {
        titleKey: "push:studioPlaylistEditorAdded.title",
        bodyKey: "push:studioPlaylistEditorAdded.body",
        params: {
          name: "Rita Varela",
          playlist: "Tour diary",
          persona: "Mariana Sol",
        },
      },
    };
    expect(formatPushCopy(addedSource, "en")).toEqual({
      title: "You can edit a playlist",
      body: "Rita Varela added you as an editor of Tour diary (Mariana Sol)",
    });
    expect(formatPushCopy(addedSource, "pt")).toEqual({
      title: "Podes editar uma playlist",
      body: "Rita Varela deu-te acesso para editar Tour diary (Mariana Sol)",
    });
  });

  it("resolves the three team pushes in EN and PT", () => {
    const params = { persona: "Agulha Lenta", listing: "Tinta Viva" };
    const copyFor = (kind: string, language: "en" | "pt") =>
      formatPushCopy(
        {
          title: "x",
          body: "y",
          l10n: {
            titleKey: `push:${kind}.title`,
            bodyKey: `push:${kind}.body`,
            params,
          },
        },
        language,
      );
    expect(copyFor("listingTeamRequest", "en")).toEqual({
      title: "Team request",
      body: "Agulha Lenta asked to join the team at Tinta Viva",
    });
    expect(copyFor("listingTeamRequest", "pt")).toEqual({
      title: "Pedido para a equipa",
      body: "Agulha Lenta pediu para entrar na equipa de Tinta Viva",
    });
    expect(copyFor("listingTeamInvite", "en")).toEqual({
      title: "Team invite",
      body: "Tinta Viva invited Agulha Lenta to join the team",
    });
    expect(copyFor("listingTeamInvite", "pt")).toEqual({
      title: "Convite para a equipa",
      body: "Tinta Viva convidou Agulha Lenta para a equipa",
    });
    expect(copyFor("listingTeamAccepted", "en")).toEqual({
      title: "Team link confirmed",
      body: "Agulha Lenta is now on the team at Tinta Viva",
    });
    expect(copyFor("listingTeamAccepted", "pt")).toEqual({
      title: "Ligação à equipa confirmada",
      body: "Agulha Lenta faz agora parte da equipa de Tinta Viva",
    });
  });
});

describe("Pulse Live push copy", () => {
  const pulseLiveLocalization = {
    titleKey: "push:quizshow.starting.title",
    bodyKey: "push:quizshow.starting.body",
    params: { event: "Pride Quiz", code: "QZ7KP4" },
  };

  it("words the Pulse Live push in English", () => {
    expect(
      formatPushCopy(
        { title: "x", body: "y", l10n: pulseLiveLocalization },
        "en",
      ),
    ).toEqual({
      title: "Pulse Live is starting",
      body: "Pride Quiz live game is starting, join with code QZ7KP4",
    });
  });

  it("words it in Portuguese", () => {
    expect(
      formatPushCopy(
        { title: "x", body: "y", l10n: pulseLiveLocalization },
        "pt",
      ),
    ).toEqual({
      title: "O Pulse Live está a começar",
      body: "O jogo ao vivo de Pride Quiz está a começar, entra com o código QZ7KP4",
    });
  });
});
