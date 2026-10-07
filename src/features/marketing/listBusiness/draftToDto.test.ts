import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import { draftToDto, draftToUpdateDto } from "./draftToDto";
import { normalizeOnlineDetails } from "./listingOnline.data";

describe("draftToDto", () => {
  it("on a suggest draft carries nothing about the suggester", () => {
    const draft = { ...blankDraft(), path: "suggest" as const, name: "Bar" };
    const dto = draftToDto(draft) as unknown as Record<string, unknown>;
    expect(dto.ownerName).toBeUndefined();
    expect(dto.ownerBio).toBeUndefined();
    expect(dto.rel).toBeUndefined();
    expect(dto.visibility).toBeUndefined();
    expect(dto.linkToProfile).toBeUndefined();
    expect(dto.consentOuting).toBeUndefined();
    expect(dto.consentGuide).toBeUndefined();
    expect(dto.ownerRole).toBeUndefined();
    expect(dto.affirmingBaselineAccepted).toBeUndefined();
    expect(dto.path).toBe("suggest");
    expect(dto.name).toBe("Bar");
  });

  it("never carries ownership tags on a suggestion: that could out someone", () => {
    const draft = {
      ...blankDraft(),
      path: "suggest" as const,
      ownedBy: ["trans" as const],
    };
    const dto = draftToDto(draft) as unknown as Record<string, unknown>;
    expect(dto.ownedBy).toBeUndefined();
  });

  it("sends the owner's tags canonical, and an empty list when none", () => {
    const { ownedBy: _ownedBy, ...legacyDraft } = {
      ...blankDraft(),
      path: "claim" as const,
    };
    expect(draftToDto(legacyDraft)).toHaveProperty("ownedBy", []);
    expect(
      draftToDto({ ...legacyDraft, ownedBy: ["nonbinary", "women"] }),
    ).toHaveProperty("ownedBy", ["women", "nonbinary"]);
  });

  it("on a claim draft keeps the owner's name and the affirming agreement", () => {
    const draft = {
      ...blankDraft(),
      path: "claim" as const,
      name: "Bar",
      ownerName: "Alex",
      affirmingBaselineAccepted: true,
    };
    // `dto` is typed `CreateListingDto | SuggestListingDto`; a claim draft
    // always produces the former, but `toHaveProperty` checks the value at
    // runtime without narrowing the union, so the assertion stays as strict
    // as a direct `.ownerName` read.
    const dto = draftToDto(draft);
    expect(dto).toHaveProperty("ownerName", "Alex");
    expect(dto).toHaveProperty("affirmingBaselineAccepted", true);
  });
});

describe("draftToUpdateDto", () => {
  it("on an owner draft has no path key", () => {
    const draft = { ...blankDraft(), path: "claim" as const };
    const payload = draftToUpdateDto(draft) as unknown as Record<
      string,
      unknown
    >;
    expect(payload.path).toBeUndefined();
  });

  it("on a co-manager draft has no path key and no ownerName key", () => {
    const draft = {
      ...blankDraft(),
      path: "claim" as const,
      managementRole: "co_manager" as const,
    };
    const payload = draftToUpdateDto(draft) as unknown as Record<
      string,
      unknown
    >;
    expect(payload.path).toBeUndefined();
    expect(payload.ownerName).toBeUndefined();
  });

  it("never sends ownership tags from a co-manager: they are the owner's", () => {
    const draft = {
      ...blankDraft(),
      path: "claim" as const,
      managementRole: "co_manager" as const,
      ownedBy: ["women" as const],
    };
    const payload = draftToUpdateDto(draft) as unknown as Record<
      string,
      unknown
    >;
    expect(payload.ownedBy).toBeUndefined();
  });
});

describe("draftToDto for the three kinds", () => {
  const sellingFields = {
    hasOnlineShop: true,
    onlineDetails: normalizeOnlineDetails({
      mainLink: { url: "fiosolto.pt", kind: "shop" },
      fulfilment: ["shipsPortugal", "pickupLisbon"],
      pickupNote: "Saturdays",
      payments: ["mbway"],
    }),
    shopItems: [
      { id: "a", name: "Zine", price: "6 EUR", link: "", photo: null },
    ],
    pricingMode: "shop" as const,
  };

  it("sends an online listing with no place fields and its city", () => {
    const dto = draftToDto({
      ...blankDraft(),
      ...sellingFields,
      path: "claim",
      online: true,
      cats: ["books-music"],
      city: " Porto ",
      hood: "Graça",
      address: "Rua X 1",
      hoursNote: "Closed Mondays",
    }) as unknown as Record<string, unknown>;
    expect(dto).toMatchObject({
      online: true,
      hasOnlineShop: false,
      city: "Porto",
      hood: "",
      address: "",
      hoursNote: "",
      hoursExceptions: [],
      pricingMode: "shop",
    });
    expect((dto.onlineDetails as { pickupNote: string }).pickupNote).toBe(
      "Saturdays",
    );
    expect(dto.shopItems).toHaveLength(1);
  });

  it("sends a plain place with an empty online block and no shop", () => {
    const dto = draftToDto({
      ...blankDraft(),
      ...sellingFields,
      hasOnlineShop: false,
      path: "claim",
      cats: ["food"],
    }) as unknown as Record<string, unknown>;
    expect(dto.hasOnlineShop).toBe(false);
    expect((dto.onlineDetails as { mainLink: unknown }).mainLink).toBeNull();
    expect(dto.shopItems).toEqual([]);
    expect(dto.pricingMode).toBe("menu");
    expect(dto.city).toBe("");
  });

  it("strips pick-up from a place that also sells online", () => {
    const dto = draftToDto({
      ...blankDraft(),
      ...sellingFields,
      path: "claim",
      cats: ["culture"],
    }) as unknown as {
      onlineDetails: { fulfilment: string[]; pickupNote: string };
    };
    expect(dto.onlineDetails.fulfilment).toEqual(["shipsPortugal"]);
    expect(dto.onlineDetails.pickupNote).toBe("");
  });

  it("sends the 18+ acknowledgement only while intimacy is picked", () => {
    const base = {
      ...blankDraft(),
      path: "claim" as const,
      online: true,
      adultTermsAccepted: true,
    };
    expect(draftToDto({ ...base, cats: ["intimacy"] })).toHaveProperty(
      "adultTermsAccepted",
      true,
    );
    expect(draftToDto({ ...base, cats: ["apparel"] })).not.toHaveProperty(
      "adultTermsAccepted",
    );
    // Staff bodies refuse the key outright (admin DTOs omit it).
    expect(
      draftToDto({ ...base, cats: ["intimacy"], isStaffAuthored: true }),
    ).not.toHaveProperty("adultTermsAccepted");
  });

  it("never sends the 18+ acknowledgement on a suggestion", () => {
    const suggestion = {
      ...blankDraft(),
      path: "suggest" as const,
      online: true,
      cats: ["intimacy"],
      adultTermsAccepted: true,
    };
    expect(draftToDto(suggestion)).not.toHaveProperty("adultTermsAccepted");
  });

  it("never sends the draft-only answers", () => {
    const dto = draftToDto({
      ...blankDraft(),
      path: "claim",
      isWhereFoundAnswered: true,
      inactiveModeCats: ["culture"],
    });
    expect(dto).not.toHaveProperty("isWhereFoundAnswered");
    expect(dto).not.toHaveProperty("inactiveModeCats");
  });
});
