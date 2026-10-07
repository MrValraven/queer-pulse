import { describe, expect, it } from "vitest";
import type { Formatters } from "../../../shared/i18n/format";
import { blankDraft } from "../listBusiness/listingFormDraft";
import { normalizeOnlineDetails } from "../listBusiness/listingOnline.data";
import {
  cardDtoToPlace,
  detailDtoToPlace,
  submittedToPlace,
} from "./directory.adapters";
import type { DirectoryCardDTO, DirectoryDetailDTO } from "./directory.api";

function makeCard(overrides: Partial<DirectoryCardDTO> = {}): DirectoryCardDTO {
  return {
    id: "listing-1",
    slug: "fio-solto",
    name: "Fio Solto",
    cat: "books-music",
    hood: "",
    blurb: "Zines",
    tint: "coral",
    av: "FS",
    owned: true,
    queerOwnedVerified: false,
    memberFirst: null,
    latitude: null,
    longitude: null,
    safeSpaceStatus: "none",
    safeSpaceTier: null,
    ...overrides,
  };
}

const formatters = {
  date: () => "",
  time: () => "",
} as unknown as Formatters;

describe("cardDtoToPlace for online listings", () => {
  it("carries the city, the shop flag, the 18+ flag and the summary", () => {
    const place = cardDtoToPlace(
      makeCard({
        online: true,
        city: "Porto",
        isAdultsOnly: true,
        onlineSummary: {
          mainLink: { url: "fiosolto.pt", kind: "shop" },
          fulfilment: ["shipsEu"],
          sessionFormats: [],
        },
      }),
    );
    expect(place).toMatchObject({
      online: true,
      city: "Porto",
      isAdultsOnly: true,
      hasOnlineShop: false,
      onlineSummary: {
        mainLink: { url: "fiosolto.pt", kind: "shop" },
        fulfilment: ["shipsEu"],
      },
    });
  });

  it("reads a payload from before the fields as a plain place", () => {
    const place = cardDtoToPlace(makeCard());
    expect(place.hasOnlineShop).toBe(false);
    expect(place.isAdultsOnly).toBe(false);
    expect(place.onlineSummary).toBeNull();
    expect(place.city).toBeUndefined();
  });
});

describe("detailDtoToPlace for online listings", () => {
  it("derives the card summary from the full block when the payload has none", () => {
    const detail = {
      ...makeCard({ online: true }),
      onlineDetails: {
        mainLink: { url: "fiosolto.pt", kind: "shop" },
        moreLinks: [],
        fulfilment: ["digital"],
        pickupNote: "",
        shipsFrom: "",
        isVatIncluded: false,
        payments: [],
        sessionFormats: [],
        registration: { body: "", number: "" },
        replyNote: "",
      },
      shopItems: [
        { id: "a", name: "Zine", price: "6 EUR", link: "", photo: null },
      ],
      tagline: "",
      city: "",
      timezone: null,
      pills: [],
      gallery: [],
      whatItIs: [],
      goodFor: [],
      hoursType: "appointment",
      hoursNote: "",
      owner: {
        name: "",
        initials: "",
        tint: "coral",
        role: "",
        bio: "",
        inQueerPulse: false,
        first: "",
      },
      social: { instagram: "", website: "", email: "", phone: "" },
      address: "",
      rating: { score: "0", count: 0 },
      reviews: [],
      upcoming: [],
      photos: { wide: null, d1: null, d2: null, vibe: null },
      alt: { wide: "", d1: "", d2: "", vibe: "" },
      hours: {},
      langs: [],
      savedCount: 0,
      safeSpaceVerifier: null,
      safeSpaceReVerifiedAt: null,
      safeSpaceSub: null,
      safeSpacePromises: [],
      safeSpaceVouches: [],
      safeSpaceRemoval: null,
    } as DirectoryDetailDTO;
    const place = detailDtoToPlace(detail, formatters);
    expect(place.onlineSummary?.fulfilment).toEqual(["digital"]);
    expect(place.shopItems).toEqual([
      { id: "a", name: "Zine", price: "6 EUR", link: "", photo: null },
    ]);
  });
});

describe("submittedToPlace for the three kinds", () => {
  const details = normalizeOnlineDetails({
    mainLink: { url: "fiosolto.pt", kind: "shop" },
    fulfilment: ["shipsPortugal", "pickupLisbon"],
    pickupNote: "Saturdays",
  });
  const pending = {
    ...blankDraft(),
    ref: "QPL-2026-0001",
    status: "review" as const,
    slug: "fio-solto",
    submittedBy: "sam",
    name: "Fio Solto",
  };

  it("gives an online listing its city, summary and 18+ flag", () => {
    const place = submittedToPlace({
      ...pending,
      online: true,
      city: "Porto",
      cats: ["intimacy"],
      onlineDetails: details,
    });
    expect(place).toMatchObject({
      online: true,
      city: "Porto",
      isAdultsOnly: true,
    });
    expect(place.onlineSummary?.mainLink?.url).toBe("fiosolto.pt");
    expect(place.onlineDetails?.pickupNote).toBe("Saturdays");
  });

  it("strips pick-up from a place that also sells online", () => {
    const place = submittedToPlace({
      ...pending,
      cats: ["culture"],
      hasOnlineShop: true,
      onlineDetails: details,
    });
    expect(place.hasOnlineShop).toBe(true);
    expect(place.onlineDetails?.fulfilment).toEqual(["shipsPortugal"]);
  });

  it("gives a plain place no online block", () => {
    const place = submittedToPlace({
      ...pending,
      cats: ["culture"],
      onlineDetails: details,
    });
    expect(place.onlineDetails).toBeNull();
    expect(place.onlineSummary).toBeNull();
  });
});
