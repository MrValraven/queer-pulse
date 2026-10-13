import { describe, expect, it } from "vitest";
import type { Formatters } from "../../../shared/i18n/format";
import { listingDtoToPreviewPlace } from "../../admin/api/listingPreviewPlace";
import { DIRECTORY_PLACES } from "../directoryPlaces";
import { listingDraftToPreviewSource } from "../listBusiness/editor/listingDraftPreviewSource";
import type { PendingListing } from "../listBusiness/listBusiness.data";
import { blankDraft } from "../listBusiness/listingFormDraft";
import {
  cardDtoToPlace,
  detailDtoToPlace,
  submittedToPlace,
} from "./directory.adapters";
import type { DirectoryCardDTO, DirectoryDetailDTO } from "./directory.api";

const fmt = {
  date: () => "Sun 21 Jun",
  time: () => "20:00",
} as unknown as Formatters;

const CARD: DirectoryCardDTO = {
  id: "uuid-1",
  slug: "galeria-lume",
  name: "Galeria Lume",
  cat: "culture",
  hood: "Marvila",
  blurb: "An artist-run gallery.",
  tint: "coral",
  av: "GL",
  owned: true,
  queerOwnedVerified: false,
  memberFirst: null,
  latitude: null,
  longitude: null,
  safeSpaceStatus: "none",
  safeSpaceTier: null,
};

describe("cardDtoToPlace and the attribute fields", () => {
  it("reads the card's fields, codes and vocabulary order", () => {
    const place = cardDtoToPlace({
      ...CARD,
      price: "€",
      attributes: ["exhibitions", "screenings"],
      highlights: ["exhibitions"],
      entryMode: "walkIn",
      payments: ["cash", "card", "paypal"],
      langs: ["en", "pt", "Português"],
      inclusionPractices: ["chosen-name"],
      hostsGatherings: true,
    });
    expect(place).toMatchObject({
      price: "€",
      attributes: ["exhibitions", "screenings"],
      highlights: ["exhibitions"],
      entryMode: "walkIn",
      payments: ["card", "cash"],
      langs: ["pt", "en"],
      inclusionPractices: ["chosen-name"],
      hostsGatherings: true,
    });
  });

  it("reads a card that carries none of the new fields as empty", () => {
    const place = cardDtoToPlace(CARD);
    expect(place.price).toBe("");
    expect(place).toMatchObject({
      attributes: [],
      highlights: [],
      entryMode: null,
      payments: [],
      langs: [],
      inclusionPractices: [],
      hostsGatherings: false,
    });
  });
});

describe("detailDtoToPlace and the attribute fields", () => {
  const base = {
    ...CARD,
    tagline: "",
    timezone: null,
    gallery: [],
    whatItIs: [],
    hoursType: "gallery",
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
    langs: ["Português", "Galego"],
    savedCount: 0,
    safeSpaceVerifier: null,
    safeSpaceReVerifiedAt: null,
    safeSpaceSub: null,
    safeSpacePromises: [],
    safeSpaceVouches: [],
    safeSpaceRemoval: null,
  } satisfies DirectoryDetailDTO;

  it("carries the detail-only fields, sensitive attributes included", () => {
    const place = detailDtoToPlace(
      {
        ...base,
        attributes: ["sexual-health-prep", "exhibitions"],
        coverPolicy: "freeBefore",
        coverFreeBefore: "23:00",
        issuesNifInvoices: false,
        saferSpacePolicyUrl: "https://galerialume.pt/politica",
        langsOther: "",
      },
      fmt,
    );
    expect(place).toMatchObject({
      attributes: ["sexual-health-prep", "exhibitions"],
      coverPolicy: "freeBefore",
      coverFreeBefore: "23:00",
      issuesNifInvoices: false,
      saferSpacePolicyUrl: "https://galerialume.pt/politica",
    });
  });

  it("heals language names from an older detail payload", () => {
    const place = detailDtoToPlace(base, fmt);
    expect(place.langs).toEqual(["pt"]);
    expect(place.langsOther).toBe("Galego");
    expect(place.coverPolicy).toBeNull();
    expect(place.issuesNifInvoices).toBeNull();
    expect(place.saferSpacePolicyUrl).toBeNull();
  });
});

describe("every category reaches the card", () => {
  it("passes the card's categories through", () => {
    const cats = ["food", "nightlife"];
    const place = cardDtoToPlace({ ...CARD, cat: "food", cats });
    expect(place.cats).toEqual(["food", "nightlife"]);
    expect(place.cats).not.toBe(cats);
  });

  it("leaves cats unset on a card from before the field", () => {
    expect(cardDtoToPlace(CARD)).not.toHaveProperty("cats");
  });

  const draft: PendingListing = {
    ...blankDraft(),
    ref: "QPL-2026-0104",
    status: "review",
    slug: "tasca-da-noite",
    submittedBy: "kai",
    name: "Tasca da Noite",
    cats: ["food", "nightlife"],
  };

  it("carries every category on a submitted listing", () => {
    expect(submittedToPlace(draft).cats).toEqual(["food", "nightlife"]);
  });

  it("carries every category in the full page preview", () => {
    const place = listingDtoToPreviewPlace(
      listingDraftToPreviewSource(draft, "tasca-da-noite", {
        wide: "",
        d1: "",
        d2: "",
        vibe: "",
      }),
    );
    expect(place.cats).toEqual(["food", "nightlife"]);
  });
});

describe("demo fixtures read like live payloads", () => {
  it("fills the attribute fields on at least one fixture of each kind", () => {
    for (const kind of ["place", "mobile", "online"] as const) {
      const fixture = DIRECTORY_PLACES.find(
        (place) =>
          (kind === "online"
            ? place.online === true
            : kind === "mobile"
              ? place.mobile === true
              : !place.online && !place.mobile) &&
          (place.attributes ?? []).length > 0,
      );
      expect(fixture, kind).toBeDefined();
    }
  });
});
