import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import { emptyOnlineDetailsDraft } from "./listingOnline.data";
import { newShopItemRow } from "./listingShop.data";
import {
  whereFoundChoiceOf,
  withListingKind,
  withWhereFoundChoice,
} from "./listingKind";

describe("withListingKind", () => {
  it("keeps the categories both kinds offer and stashes the rest", () => {
    const place = { ...blankDraft(), cats: ["food", "culture"] };
    const online = withListingKind(place, true);
    expect(online.online).toBe(true);
    expect(online.cats).toEqual(["food"]);
    expect(online.inactiveModeCats).toEqual(["food", "culture"]);
  });

  it("brings the other kind's categories back on the way back", () => {
    const place = { ...blankDraft(), cats: ["culture"] };
    const online = { ...withListingKind(place, true), cats: ["books-music"] };
    const backToPlace = withListingKind(online, false);
    expect(backToPlace.cats).toEqual(["culture"]);
    expect(withListingKind(backToPlace, true).cats).toEqual(["books-music"]);
  });

  it("carries food across when the stash it switches back to is empty", () => {
    const online = withListingKind(blankDraft(), true);
    expect(online.inactiveModeCats).toEqual([]);
    const pickedFood = { ...online, cats: ["food"] };
    const backToPlace = withListingKind(pickedFood, false);
    expect(backToPlace.cats).toEqual(["food"]);
    expect(backToPlace.inactiveModeCats).toEqual(["food"]);
  });

  it("keeps the address, pin, neighbourhood and hours in the draft", () => {
    const place = {
      ...blankDraft(),
      hood: "Graça",
      address: "Rua X 1",
      latitude: 38.7,
      longitude: -9.1,
    };
    const online = withListingKind(place, true);
    expect(online).toMatchObject({
      hood: "Graça",
      address: "Rua X 1",
      latitude: 38.7,
      longitude: -9.1,
    });
    expect(online.hours).toBe(place.hours);
  });

  it("re-defaults an untouched pricing mode for the new kind", () => {
    const foodPlace = {
      ...blankDraft(),
      cats: ["food"],
      pricingMode: "menu" as const,
    };
    expect(withListingKind(foodPlace, true).pricingMode).toBe("services");
  });

  it("keeps the online block by ticking the online shop when a main link is set", () => {
    const onlineDetails = {
      ...emptyOnlineDetailsDraft(),
      mainLink: { url: "shop.example.com", kind: "shop" as const },
    };
    const online = { ...blankDraft(), online: true, onlineDetails };
    const place = withListingKind(online, false);
    expect(place.online).toBe(false);
    expect(place.hasOnlineShop).toBe(true);
    expect(place.onlineDetails).toBe(onlineDetails);
  });

  it("ticks the online shop when a shop item is started", () => {
    const shopItems = [{ ...newShopItemRow(), name: "Zine" }];
    const online = { ...blankDraft(), online: true, shopItems };
    const place = withListingKind(online, false);
    expect(place.hasOnlineShop).toBe(true);
    expect(place.shopItems).toBe(shopItems);
  });

  it("leaves the online shop alone when the online block is empty", () => {
    const online = {
      ...blankDraft(),
      online: true,
      onlineDetails: emptyOnlineDetailsDraft(),
      shopItems: [newShopItemRow()],
    };
    expect(withListingKind(online, false).hasOnlineShop).toBe(
      online.hasOnlineShop,
    );
  });

  it("returns the same draft when the kind does not change", () => {
    const place = blankDraft();
    expect(withListingKind(place, false)).toBe(place);
  });
});

describe("the Path step's question", () => {
  it("reads a brand-new draft as unanswered", () => {
    expect(whereFoundChoiceOf(blankDraft())).toBe("");
  });

  it("reads a draft from before the question as answered by its online flag", () => {
    const { isWhereFoundAnswered: _absent, ...legacy } = {
      ...blankDraft(),
      online: true,
    };
    expect(whereFoundChoiceOf(legacy)).toBe("online");
  });

  it("records an answer and switches the kind", () => {
    const answered = withWhereFoundChoice(blankDraft(), "online");
    expect(answered.isWhereFoundAnswered).toBe(true);
    expect(answered.online).toBe(true);
  });
});
