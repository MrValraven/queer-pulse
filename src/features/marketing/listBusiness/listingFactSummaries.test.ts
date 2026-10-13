import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import { blankDraft } from "./listingFormDraft";
import {
  isNewListingDraft,
  listingFactSummaries,
} from "./listingFactSummaries";

const t: TFunction = (key, options) =>
  options?.time === undefined ? key : `${key}|${String(options.time)}`;

describe("listingFactSummaries", () => {
  it("prints what a save would send, in the reader's words", () => {
    const summaries = listingFactSummaries(t, {
      ...blankDraft(),
      cats: ["nightlife"],
      mobile: false,
      attributes: ["dj-nights", "terrace"],
      highlights: ["terrace"],
      entryMode: "membersOnly",
      coverPolicy: "freeBefore",
      coverFreeBefore: "23:00",
      payments: ["cash"],
      issuesNifInvoices: false,
      inclusionPractices: ["harm-reduction"],
      langs: ["pt", "en"],
      langsOther: "Galego",
    });
    expect(summaries).toEqual({
      attributes:
        "marketing:listingAttribute.djNights · marketing:listingAttribute.terrace",
      highlights: "marketing:listingAttribute.terrace",
      entry: "marketing:listingFacts.entry.membersOnly",
      cover: "marketing:listingFacts.cover.freeBefore|23:00",
      payments: "marketing:listingFacts.payment.cashOnly",
      nif: "marketing:listingFacts.nif.no",
      practices: "marketing:listingFacts.practice.harmReduction",
      languages:
        "marketing:listingFacts.language.pt · marketing:listingFacts.language.en · Galego",
    });
  });

  it("prints nothing for a question left unanswered", () => {
    const summaries = listingFactSummaries(t, {
      ...blankDraft(),
      cats: ["food"],
    });
    expect(Object.values(summaries).every((value) => value === "")).toBe(true);
  });

  it("names Free before a set time while the time is missing or invalid", () => {
    for (const coverFreeBefore of ["", "25:00"]) {
      const summaries = listingFactSummaries(t, {
        ...blankDraft(),
        cats: ["nightlife"],
        coverPolicy: "freeBefore",
        coverFreeBefore,
      });
      expect(summaries.cover, coverFreeBefore).toBe(
        "marketing:listingFacts.cover.freeBeforeChoice",
      );
    }
  });

  // A bar that became a café: DJ nights and harm reduction were ticked
  // under Nightlife, which the draft no longer picks.
  const carriedFields = {
    cats: ["food"],
    attributes: ["dj-nights", "terrace"],
    highlights: ["dj-nights", "terrace"],
    inclusionPractices: ["harm-reduction"],
  };

  it("prints only what a create sends for a new draft", () => {
    const summaries = listingFactSummaries(t, {
      ...blankDraft(),
      ...carriedFields,
    });
    expect(summaries.attributes).toBe("marketing:listingAttribute.terrace");
    expect(summaries.highlights).toBe("marketing:listingAttribute.terrace");
    expect(summaries.practices).toBe("");
  });

  it("keeps the carried facts on an edit, as an update sends them", () => {
    const summaries = listingFactSummaries(t, {
      ...blankDraft(),
      ...carriedFields,
      managementRole: "owner",
    });
    expect(summaries.attributes).toBe(
      "marketing:listingAttribute.djNights · marketing:listingAttribute.terrace",
    );
    expect(summaries.highlights).toBe(
      "marketing:listingAttribute.djNights · marketing:listingAttribute.terrace",
    );
    expect(summaries.practices).toBe(
      "marketing:listingFacts.practice.harmReduction",
    );
  });
});

describe("isNewListingDraft", () => {
  it("reads a draft with no management role as a create", () => {
    expect(isNewListingDraft(blankDraft())).toBe(true);
    expect(isNewListingDraft({ managementRole: "owner" })).toBe(false);
    expect(isNewListingDraft({ managementRole: "co_manager" })).toBe(false);
  });
});
