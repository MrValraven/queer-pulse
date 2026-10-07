import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ANCHOR, type ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { newMenuItemRow } from "./listingMenu.data";
import { normalizeOnlineDetails } from "./listingOnline.data";
import { onlineMissingFields } from "./listingOnlineMissing";
import { useListingFormMissing } from "./useListingFormMissing";

function draftWith(fields: Partial<ListingDraft>): ListingDraft {
  return { ...blankDraft(), isWhereFoundAnswered: true, ...fields };
}

const anchorsOf = (fields: { anchor: string }[]) =>
  fields.map((field) => field.anchor);

const withMainLink = normalizeOnlineDetails({
  mainLink: { url: "fiosolto.pt", kind: "shop" },
});

describe("onlineMissingFields", () => {
  it("holds step 0 until where people find it is answered", () => {
    expect(anchorsOf(onlineMissingFields(blankDraft()).step0)).toEqual([
      ANCHOR.whereFound,
    ]);
    const { isWhereFoundAnswered: _absent, ...legacy } = blankDraft();
    expect(onlineMissingFields(legacy).step0).toEqual([]);
  });

  it("asks a main link of every listing that sells online, on both paths", () => {
    for (const path of ["claim", "suggest"] as const) {
      const online = draftWith({ path, online: true, cats: ["apparel"] });
      expect(anchorsOf(onlineMissingFields(online).step3), path).toContain(
        ANCHOR.mainLink,
      );
    }
    const placeWithShop = draftWith({ path: "suggest", hasOnlineShop: true });
    expect(anchorsOf(onlineMissingFields(placeWithShop).step3)).toContain(
      ANCHOR.mainLink,
    );
    const plainPlace = draftWith({ path: "claim" });
    expect(onlineMissingFields(plainPlace).step3).toEqual([]);
  });

  it("flags a main link that is no web address", () => {
    const draft = draftWith({
      online: true,
      onlineDetails: normalizeOnlineDetails({
        mainLink: { url: "not a link", kind: "shop" },
      }),
    });
    expect(onlineMissingFields(draft).step3).toEqual([
      {
        labelKey: "marketing:listBusiness.missing.onlineLinkFormat",
        anchor: ANCHOR.mainLink,
      },
    ]);
  });

  it("asks a claimed online listing how people get it, which a session format also answers", () => {
    const claimed = draftWith({
      path: "claim",
      online: true,
      cats: ["therapy"],
      onlineDetails: withMainLink,
    });
    expect(anchorsOf(onlineMissingFields(claimed).step3)).toEqual([
      ANCHOR.fulfilment,
    ]);
    const withSession = {
      ...claimed,
      onlineDetails: { ...withMainLink, sessionFormats: ["video" as const] },
    };
    expect(onlineMissingFields(withSession).step3).toEqual([]);
    const withShipping = {
      ...claimed,
      onlineDetails: { ...withMainLink, fulfilment: ["shipsEu" as const] },
    };
    expect(onlineMissingFields(withShipping).step3).toEqual([]);
  });

  it("does not count a session format the categories do not ask for", () => {
    const apparel = draftWith({
      path: "claim",
      online: true,
      cats: ["apparel"],
      onlineDetails: { ...withMainLink, sessionFormats: ["video"] },
    });
    expect(anchorsOf(onlineMissingFields(apparel).step3)).toEqual([
      ANCHOR.fulfilment,
    ]);
  });

  it("exempts a suggestion and a staff draft from how people get it", () => {
    const suggestion = draftWith({
      path: "suggest",
      online: true,
      cats: ["apparel"],
      onlineDetails: withMainLink,
    });
    expect(onlineMissingFields(suggestion).step3).toEqual([]);
    const staff = { ...suggestion, isStaffAuthored: true };
    expect(onlineMissingFields(staff).step3).toEqual([]);
  });

  it("asks a place that sells online nothing about how people get it", () => {
    const placeWithShop = draftWith({
      path: "claim",
      hasOnlineShop: true,
      onlineDetails: withMainLink,
    });
    expect(onlineMissingFields(placeWithShop).step3).toEqual([]);
  });

  it("asks for the 18+ rules while intimacy is picked", () => {
    const adult = draftWith({ online: true, cats: ["intimacy"] });
    expect(anchorsOf(onlineMissingFields(adult).step1)).toEqual([
      ANCHOR.adultTerms,
    ]);
    expect(
      onlineMissingFields({ ...adult, adultTermsAccepted: true }).step1,
    ).toEqual([]);
  });

  it("flags intimacy as not offered on a staff create and on a suggestion create", () => {
    const adult = draftWith({ online: true, cats: ["intimacy"] });
    const staffCreate = {
      ...adult,
      isStaffAuthored: true,
      path: "suggest" as const,
    };
    expect(anchorsOf(onlineMissingFields(staffCreate).step1)).toEqual([
      ANCHOR.cats,
    ]);
    const suggestionCreate = { ...adult, path: "suggest" as const };
    expect(anchorsOf(onlineMissingFields(suggestionCreate).step1)).toEqual([
      ANCHOR.cats,
    ]);
    // A ticked box from an earlier claim answer counts for nothing here.
    expect(
      anchorsOf(
        onlineMissingFields({ ...suggestionCreate, adultTermsAccepted: true })
          .step1,
      ),
    ).toEqual([ANCHOR.cats]);
  });

  it("lets a staff edit keep intimacy on a listing that holds the stamp", () => {
    const stampedEdit = draftWith({
      online: true,
      cats: ["intimacy"],
      isStaffAuthored: true,
      path: "suggest",
      managementRole: "co_manager",
      adultTermsAccepted: true,
    });
    expect(onlineMissingFields(stampedEdit).step1).toEqual([]);
  });

  it("flags a category the listing's kind does not offer", () => {
    const legacyOnline = draftWith({ online: true, cats: ["culture"] });
    expect(anchorsOf(onlineMissingFields(legacyOnline).step1)).toEqual([
      ANCHOR.cats,
    ]);
  });

  it("flags a half-filled extra link, a missing registration number and a nameless shop item", () => {
    const draft = draftWith({
      online: true,
      cats: ["therapy"],
      onlineDetails: normalizeOnlineDetails({
        mainLink: { url: "fiosolto.pt", kind: "shop" },
        moreLinks: [{ url: "", platform: "etsy" }],
        registration: { body: "opp", number: "" },
      }),
      pricingMode: "shop",
      shopItems: [{ id: "a", name: "", price: "6 EUR", link: "", photo: null }],
    });
    const fields = onlineMissingFields(draft);
    expect(anchorsOf(fields.step3)).toEqual([
      ANCHOR.moreLinks,
      ANCHOR.registration,
    ]);
    expect(anchorsOf(fields.step1)).toEqual([ANCHOR.services]);
  });
});

describe("useListingFormMissing priced lists", () => {
  it("checks the menu of a place whose stored shop mode no longer applies", () => {
    const draft = draftWith({
      online: false,
      hasOnlineShop: false,
      pricingMode: "shop",
      cats: ["food"],
      menu: {
        sections: [
          {
            id: "section",
            title: "Coffee",
            items: [{ ...newMenuItemRow(), name: "Bica", price: "" }],
          },
        ],
        file: null,
        link: "",
      },
    });
    const { result } = renderHook(() => useListingFormMissing(draft));
    const stepOneKeys = (result.current[1] ?? []).map(
      (field) => field.labelKey,
    );
    expect(stepOneKeys).toContain("marketing:listBusiness.missing.menu");
    expect(stepOneKeys).not.toContain(
      "marketing:listBusiness.missing.shopItems",
    );
  });
});
