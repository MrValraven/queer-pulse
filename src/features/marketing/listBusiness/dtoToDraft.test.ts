import { describe, expect, it } from "vitest";
import { emptyHours, hoursForPayload } from "./listBusiness.data";
import { draftToDto } from "./draftToDto";
import { dtoToDraft } from "./dtoToDraft";
import type { ListingDTO } from "./api/listings.api";

// Minimal DTO factory — only fields dtoToDraft reads plus the server-only extras it must drop.
function makeDto(overrides: Partial<ListingDTO> = {}): ListingDTO {
  return {
    ref: "QPL-2026-0007",
    slug: "atelier-pulso",
    status: "live",
    submittedBy: {
      slug: "ines",
      firstName: "Inês",
      lastName: "",
    },
    createdAt: "2026-07-01T00:00:00.000Z",
    operatingState: {
      state: "open",
      note: null,
      setAt: null,
      movedToAddress: null,
    },
    movedToListingId: null,
    detailsConfirmedAt: null,
    path: "claim",
    name: "Atelier Pulso",
    cats: ["Studio"],
    hood: "Arroios",
    badge: "owned",
    evidence: "",
    price: "",
    blurb: "A queer art studio",
    tagline: "",
    whatItIs: [],
    tags: [],
    goodFor: [],
    langs: [],
    online: false,
    address: "Rua X 1",
    geocoded: true,
    latitude: 38.7167,
    longitude: -9.149,
    hours: {},
    hoursNote: "",
    social: { instagram: "", website: "", email: "", phone: "" },
    photos: { wide: null, d1: null, d2: null, vibe: null },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    rel: "own",
    ownerName: "Inês",
    ownerRole: "Founder",
    ownerBio: "",
    visibility: "public",
    linkToProfile: true,
    consentOuting: true,
    consentGuide: true,
    queerOwnedVerified: false,
    ...overrides,
  };
}

describe("dtoToDraft", () => {
  it("keeps latitude/longitude and copies draft fields", () => {
    const draft = dtoToDraft(makeDto());
    expect(draft.name).toBe("Atelier Pulso");
    expect(draft.latitude).toBe(38.7167);
    expect(draft.longitude).toBe(-9.149);
    expect(draft.consentOuting).toBe(true);
  });

  it("coerces null photos to empty strings", () => {
    const draft = dtoToDraft(makeDto());
    expect(draft.photos).toEqual({ wide: "", d1: "", d2: "", vibe: "" });
  });

  it("reads an absent ownership list (a row from before it existed) as none", () => {
    expect(dtoToDraft(makeDto()).ownedBy).toEqual([]);
  });

  it("keeps only known ownership tags, in canonical order", () => {
    const draft = dtoToDraft(
      makeDto({
        ownedBy: ["nonbinary", "future-tag", "women", "women"] as never,
      }),
    );
    expect(draft.ownedBy).toEqual(["women", "nonbinary"]);
    expect(draftToDto(draft)).toHaveProperty("ownedBy", ["women", "nonbinary"]);
  });

  it("blanks the ownership list for a co-manager, who never received it", () => {
    const draft = dtoToDraft({
      ...makeDto({ ownedBy: ["trans"] }),
      managementRole: "co_manager",
    } as never);
    expect(draft.ownedBy).toEqual([]);
  });

  it("drops server-only fields (no ref/status/slug/submittedBy/createdAt)", () => {
    const draft = dtoToDraft(makeDto()) as unknown as Record<string, unknown>;
    expect(draft.ref).toBeUndefined();
    expect(draft.status).toBeUndefined();
    expect(draft.slug).toBeUndefined();
    expect(draft.submittedBy).toBeUndefined();
    expect(draft.createdAt).toBeUndefined();
  });
});

describe("hoursForPayload", () => {
  it("empties a closed day's intervals, which the API rejects otherwise", () => {
    const payload = hoursForPayload({
      ...emptyHours(),
      Mon: { open: false, intervals: [{ from: "09:00", to: "18:00" }] },
    });
    expect(payload.Mon).toEqual({ open: false, intervals: [] });
  });

  it("leaves an open day's intervals alone", () => {
    const payload = hoursForPayload({
      ...emptyHours(),
      Fri: { open: true, intervals: [{ from: "18:00", to: "02:00" }] },
    });
    expect(payload.Fri).toEqual({
      open: true,
      intervals: [{ from: "18:00", to: "02:00" }],
    });
  });

  it("empties every closed day a blank draft starts with", () => {
    const payload = hoursForPayload(emptyHours());
    for (const day of Object.values(payload)) {
      expect(day.intervals).toEqual([]);
    }
  });
});

describe("menu round trip", () => {
  it("adopts a menu with ids and sends it back without them", () => {
    const draft = dtoToDraft(
      makeDto({
        cats: ["food"],
        pricingMode: "menu",
        menu: {
          sections: [
            {
              title: "Coffee",
              items: [
                {
                  name: "Bica",
                  price: "0.90 EUR",
                  description: "",
                  dietary: ["vegan"],
                },
              ],
            },
          ],
          file: null,
          link: "",
        },
      }),
    );
    expect(draft.pricingMode).toBe("menu");
    expect(draft.menu?.sections[0]?.items[0]?.id).toBeTruthy();
    const payload = draftToDto(draft);
    expect(payload.menu).toEqual({
      sections: [
        {
          title: "Coffee",
          items: [
            {
              name: "Bica",
              price: "0.90 EUR",
              description: "",
              dietary: ["vegan"],
            },
          ],
        },
      ],
      file: null,
      link: "",
    });
  });

  it("sends a file's url and fileName back without its contentType", () => {
    const draft = dtoToDraft(
      makeDto({
        cats: ["food"],
        pricingMode: "menu",
        menu: {
          sections: [],
          file: {
            url: "https://api.test/files/listing-menus/a/b.pdf",
            contentType: "application/pdf",
            fileName: "Menu.pdf",
          },
          link: "",
        },
      }),
    );
    const payload = draftToDto(draft);
    expect(payload.menu?.file).toEqual({
      url: "https://api.test/files/listing-menus/a/b.pdf",
      fileName: "Menu.pdf",
    });
  });

  it("defaults a DTO with no mode from its category", () => {
    expect(dtoToDraft(makeDto({ cats: ["food"] })).pricingMode).toBe("menu");
  });

  it("round-trips a legacy DTO with no menu and no pricingMode at all", () => {
    const legacyDto = makeDto({ cats: ["food"] }) as unknown as Record<
      string,
      unknown
    >;
    delete legacyDto.menu;
    delete legacyDto.pricingMode;

    const draft = dtoToDraft(legacyDto as unknown as ListingDTO);
    expect(() => draftToDto(draft)).not.toThrow();

    const payload = draftToDto(draft);
    expect(payload.pricingMode).toBe("menu");
    expect(payload.menu).toEqual({ sections: [], file: null, link: "" });
  });

  it("drops half-filled rows from the hidden list only", () => {
    const draft = dtoToDraft(makeDto({ cats: ["food"], pricingMode: "menu" }));
    draft.services = [
      { id: "a", name: "Tasting", price: "", note: "" },
      { id: "b", name: "Workshop", price: "20 EUR", note: "" },
    ];
    const payload = draftToDto(draft);
    expect(payload.services).toEqual([
      { name: "Workshop", price: "20 EUR", note: "" },
    ]);
  });
});

describe("dtoToDraft round trips for the three kinds", () => {
  const onlineDetails = {
    mainLink: { url: "fiosolto.pt", kind: "shop" as const },
    moreLinks: [{ url: "etsy.com/shop/fiosolto", platform: "etsy" as const }],
    fulfilment: ["shipsPortugal" as const],
    pickupNote: "",
    shipsFrom: "portugal" as const,
    isVatIncluded: false,
    payments: ["mbway" as const],
    sessionFormats: [],
    registration: { body: "" as const, number: "" },
    replyNote: "Packed Tuesdays",
    adultTermsAcceptedAt: null,
  };

  it("brings an online listing back unchanged through the save body", () => {
    const dto = makeDto({
      online: true,
      cats: ["books-music"],
      hood: "",
      address: "",
      city: "Porto",
      onlineDetails,
      shopItems: [
        { id: "item-1", name: "Zine", price: "6 EUR", link: "", photo: null },
      ],
      pricingMode: "shop",
    });
    const body = draftToDto(dtoToDraft(dto)) as unknown as Record<
      string,
      unknown
    >;
    const { adultTermsAcceptedAt: _stamp, ...publicDetails } = onlineDetails;
    expect(body.onlineDetails).toEqual(publicDetails);
    expect(body.shopItems).toEqual(dto.shopItems);
    expect(body.city).toBe("Porto");
    expect(body.pricingMode).toBe("shop");
  });

  it("brings a place that also sells online back with its shop flag", () => {
    const dto = makeDto({ hasOnlineShop: true, onlineDetails });
    const draft = dtoToDraft(dto);
    expect(draft.hasOnlineShop).toBe(true);
    expect(draftToDto(draft)).toHaveProperty("hasOnlineShop", true);
  });

  it("reads a payload from before the fields as a plain place", () => {
    const draft = dtoToDraft(makeDto());
    expect(draft.hasOnlineShop).toBe(false);
    expect(draft.shopItems).toEqual([]);
    expect(draft.onlineDetails?.mainLink.url).toBe("");
    expect(draft.city).toBe("");
    expect(draft.isWhereFoundAnswered).toBeUndefined();
  });

  it("loads the 18+ acknowledgement from the server's stamp", () => {
    const dto = makeDto({
      online: true,
      cats: ["intimacy"],
      onlineDetails: {
        ...onlineDetails,
        adultTermsAcceptedAt: "2026-10-07T10:00:00.000Z",
      },
    });
    expect(dtoToDraft(dto).adultTermsAccepted).toBe(true);
  });
});
