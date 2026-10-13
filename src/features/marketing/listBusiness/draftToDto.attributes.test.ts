import { describe, expect, it } from "vitest";
import type { ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { draftToDto, draftToUpdateDto } from "./draftToDto";
import { healLegacyListingDraft } from "./listingLegacyAttributes";

/** Nightlife and health, so every attribute and practice here is offered and
 *  a create sends the same cleaned fields as an update. */
const NIGHT_FACTS: Partial<ListingDraft> = {
  cats: ["nightlife", "health"],
  attributes: ["dj-nights", "dancefloor", "sexual-health-prep"],
  highlights: ["dj-nights", "sexual-health-prep"],
  entryMode: "membersOnly",
  coverPolicy: "freeBefore",
  coverFreeBefore: "23:00",
  payments: ["cash", "card"],
  issuesNifInvoices: true,
  inclusionPractices: ["safer-space-policy", "harm-reduction"],
  saferSpacePolicyUrl: " clube.pt/politica ",
  langs: ["en", "pt"],
  langsOther: " Galego ",
};

const CLEANED = {
  attributes: ["dj-nights", "dancefloor", "sexual-health-prep"],
  highlights: ["dj-nights"],
  entryMode: "membersOnly",
  coverPolicy: "freeBefore",
  coverFreeBefore: "23:00",
  payments: ["card", "cash"],
  issuesNifInvoices: true,
  inclusionPractices: ["safer-space-policy", "harm-reduction"],
  saferSpacePolicyUrl: "clube.pt/politica",
  langs: ["pt", "en"],
  langsOther: "Galego",
};

/** A nightlife listing switched to food: "dj-nights" and "harm-reduction"
 *  are no longer offered. */
const SWITCHED_TO_FOOD: Partial<ListingDraft> = {
  cats: ["food"],
  attributes: ["dj-nights", "vegan-options"],
  highlights: ["dj-nights", "vegan-options"],
  inclusionPractices: ["chosen-name", "harm-reduction"],
};

describe("attribute and fact fields on every body", () => {
  it("sends them cleaned on a claim, a suggestion and an owner's update", () => {
    const draft: ListingDraft = {
      ...blankDraft(),
      path: "claim",
      ...NIGHT_FACTS,
    };
    expect(draftToDto(draft)).toMatchObject(CLEANED);
    expect(draftToDto({ ...draft, path: "suggest" })).toMatchObject(CLEANED);
    expect(
      draftToUpdateDto({ ...draft, managementRole: "owner" }),
    ).toMatchObject(CLEANED);
  });

  it("sends them from a co-manager too: they describe the business", () => {
    const draft: ListingDraft = {
      ...blankDraft(),
      path: "claim",
      managementRole: "co_manager",
      ...NIGHT_FACTS,
    };
    expect(draftToUpdateDto(draft)).toMatchObject(CLEANED);
  });

  it("never sends tags or goodFor, even from a draft that still holds them", () => {
    const legacy = {
      ...blankDraft(),
      path: "claim" as const,
      tags: ["Terrace"],
      goodFor: ["Dog-friendly"],
    };
    for (const body of [draftToDto(legacy), draftToUpdateDto(legacy)]) {
      expect("tags" in body).toBe(false);
      expect("goodFor" in body).toBe(false);
    }
  });

  it("sends a healed legacy draft with codes and its mapped attributes", () => {
    const healed = healLegacyListingDraft({
      ...blankDraft(),
      path: "claim",
      cats: ["culture"],
      tags: ["Free entry", "Exhibitions"],
      langs: ["Português", "Other"],
    });
    expect(draftToDto(healed)).toMatchObject({
      attributes: ["exhibitions"],
      highlights: ["exhibitions"],
      coverPolicy: "free",
      langs: ["pt"],
    });
  });

  it("drops an attribute, its highlight and a practice a category switch left behind from a create", () => {
    const switchedToFood: ListingDraft = {
      ...blankDraft(),
      path: "claim",
      ...SWITCHED_TO_FOOD,
    };
    const offered = {
      attributes: ["vegan-options"],
      highlights: ["vegan-options"],
      inclusionPractices: ["chosen-name"],
    };
    expect(draftToDto(switchedToFood)).toMatchObject(offered);
    expect(draftToDto({ ...switchedToFood, path: "suggest" })).toMatchObject(
      offered,
    );
  });

  it("drops premises-only attributes from an out-and-about create", () => {
    const body = draftToDto({
      ...blankDraft(),
      path: "claim",
      mobile: true,
      cats: ["food"],
      attributes: ["terrace", "vegan-options", "dog-friendly", "wifi"],
      highlights: ["terrace", "dog-friendly"],
    });
    expect(body).toMatchObject({
      attributes: ["vegan-options", "dog-friendly"],
      highlights: ["dog-friendly"],
    });
  });

  it("keeps a carried attribute, its highlight and a carried practice on an update", () => {
    const body = draftToUpdateDto({
      ...blankDraft(),
      path: "claim",
      managementRole: "owner",
      ...SWITCHED_TO_FOOD,
    });
    expect(body).toMatchObject({
      attributes: ["dj-nights", "vegan-options"],
      highlights: ["dj-nights", "vegan-options"],
      inclusionPractices: ["chosen-name", "harm-reduction"],
    });
  });

  it("sends no way in, cover or payments for an online listing", () => {
    const body = draftToDto({
      ...blankDraft(),
      path: "claim",
      online: true,
      cats: ["food"],
      entryMode: "walkIn",
      coverPolicy: "free",
      payments: ["card"],
    });
    expect(body).toMatchObject({
      entryMode: null,
      coverPolicy: null,
      coverFreeBefore: null,
      payments: [],
    });
  });
});
