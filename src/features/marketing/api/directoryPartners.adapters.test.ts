import { describe, expect, it } from "vitest";
import type { DirectoryCardDTO } from "./directory.api";
import {
  partnerCardToPlace,
  partnersForView,
} from "./directoryPartners.adapters";
import type { DirectoryPartnerCardDTO } from "./directoryPartners.api";

const cardFixture: DirectoryCardDTO = {
  id: "listing-1",
  slug: "livraria-bertha",
  name: "Livraria Bertha",
  cat: "culture",
  hood: "Príncipe Real",
  blurb: "Books",
  tint: "coral",
  av: "LB",
  owned: true,
  queerOwnedVerified: false,
  memberFirst: null,
  latitude: null,
  longitude: null,
  safeSpaceStatus: "none",
  safeSpaceTier: null,
};

function makePartnerCard(
  overrides: Partial<DirectoryPartnerCardDTO> = {},
): DirectoryPartnerCardDTO {
  return { ...cardFixture, partnerNote: null, ...overrides };
}

describe("partnerCardToPlace", () => {
  it("keeps the note and the card fields", () => {
    const partner = partnerCardToPlace({
      ...cardFixture,
      slug: "fio-solto",
      online: true,
      partnerNote: "Members get 10% off",
    });
    expect(partner.place.slug).toBe("fio-solto");
    expect(partner.place.online).toBe(true);
    expect(partner.note).toBe("Members get 10% off");
  });

  it("reads a missing note as null", () => {
    const cardWithoutNote = { ...cardFixture } as DirectoryPartnerCardDTO;
    expect(partnerCardToPlace(cardWithoutNote).note).toBeNull();
  });
});

describe("partnersForView", () => {
  it("shows every partner on the list view, online sellers on the online view, none on the map", () => {
    const partners = [
      makePartnerCard({
        slug: "place-only",
        online: false,
        hasOnlineShop: false,
      }),
      makePartnerCard({ slug: "online-only", online: true }),
      makePartnerCard({
        slug: "shop-too",
        online: false,
        hasOnlineShop: true,
      }),
    ].map(partnerCardToPlace);
    expect(partnersForView(partners, "list")).toHaveLength(3);
    expect(
      partnersForView(partners, "online").map(({ place }) => place.slug),
    ).toEqual(["online-only", "shop-too"]);
    expect(partnersForView(partners, "map")).toEqual([]);
  });
});
