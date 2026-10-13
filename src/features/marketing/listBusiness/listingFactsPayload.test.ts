import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import type { ListingDraft } from "./listBusiness.data";
import {
  listingFactsForPayload,
  type ListingFactsSource,
} from "./listingFactsPayload";

function draftWith(fields: Partial<ListingDraft>): ListingDraft {
  return { ...blankDraft(), ...fields };
}

describe("listingFactsForPayload", () => {
  it("sends no way in, cover or payments for an online listing", () => {
    const facts = listingFactsForPayload(
      draftWith({
        online: true,
        cats: ["food"],
        entryMode: "walkIn",
        coverPolicy: "free",
        payments: ["card"],
        issuesNifInvoices: true,
      }),
    );
    expect(facts.entryMode).toBeNull();
    expect(facts.coverPolicy).toBeNull();
    expect(facts.payments).toEqual([]);
    expect(facts.issuesNifInvoices).toBe(true);
  });

  it("sends a cover answer only with nightlife or culture", () => {
    expect(
      listingFactsForPayload(draftWith({ cats: ["food"], coverPolicy: "free" }))
        .coverPolicy,
    ).toBeNull();
    expect(
      listingFactsForPayload(
        draftWith({ cats: ["culture"], coverPolicy: "free" }),
      ).coverPolicy,
    ).toBe("free");
  });

  it("sends the free-before time only with Free before, and null without a valid one", () => {
    expect(
      listingFactsForPayload(
        draftWith({
          cats: ["nightlife"],
          coverPolicy: "freeBefore",
          coverFreeBefore: "23:30",
        }),
      ).coverFreeBefore,
    ).toBe("23:30");
    expect(
      listingFactsForPayload(
        draftWith({
          cats: ["nightlife"],
          coverPolicy: "cover",
          coverFreeBefore: "23:30",
        }),
      ).coverFreeBefore,
    ).toBeNull();
    expect(
      listingFactsForPayload(
        draftWith({
          cats: ["nightlife"],
          coverPolicy: "freeBefore",
          coverFreeBefore: "",
        }),
      ).coverFreeBefore,
    ).toBeNull();
  });

  it("keeps highlights that are ticked and not sensitive, three at most", () => {
    const facts = listingFactsForPayload(
      draftWith({
        attributes: [
          "terrace",
          "wifi",
          "dog-friendly",
          "kid-friendly",
          "sexual-health-prep",
        ],
        highlights: [
          "sexual-health-prep",
          "halal",
          "terrace",
          "wifi",
          "dog-friendly",
          "kid-friendly",
        ],
      }),
    );
    expect(facts.highlights).toEqual(["terrace", "wifi", "dog-friendly"]);
  });

  it("caps attributes at forty, once each, in the order ticked", () => {
    const facts = listingFactsForPayload(
      draftWith({
        attributes: [
          "wifi",
          "wifi",
          ...Array.from({ length: 45 }, (_, index) => `slug-${index}`),
        ],
      }),
    );
    expect(facts.attributes[0]).toBe("wifi");
    expect(facts.attributes).toHaveLength(40);
  });

  it("sends the policy link only with the practice, trimmed, and null otherwise", () => {
    expect(
      listingFactsForPayload(
        draftWith({
          inclusionPractices: ["safer-space-policy"],
          saferSpacePolicyUrl: "  lume.pt/policy ",
        }),
      ).saferSpacePolicyUrl,
    ).toBe("lume.pt/policy");
    expect(
      listingFactsForPayload(
        draftWith({
          inclusionPractices: ["chosen-name"],
          saferSpacePolicyUrl: "lume.pt/policy",
        }),
      ).saferSpacePolicyUrl,
    ).toBeNull();
  });

  it("sends language codes in canonical order and trims the free text to 80", () => {
    const facts = listingFactsForPayload(
      draftWith({
        langs: ["en", "Português", "pt"],
        langsOther: ` ${"a".repeat(90)} `,
      }),
    );
    expect(facts.langs).toEqual(["pt", "en"]);
    expect(facts.langsOther).toHaveLength(80);
  });

  it("reads a draft from before the fields existed as all empty", () => {
    const facts = listingFactsForPayload({ ...blankDraft(), cats: ["food"] });
    expect(facts).toEqual({
      attributes: [],
      highlights: [],
      entryMode: null,
      coverPolicy: null,
      coverFreeBefore: null,
      payments: [],
      issuesNifInvoices: null,
      inclusionPractices: [],
      saferSpacePolicyUrl: null,
      langs: [],
      langsOther: "",
    });
  });

  it("reads a stored draft whose text slots hold no string as empty", () => {
    const malformed: unknown = {
      ...blankDraft(),
      inclusionPractices: ["safer-space-policy"],
      saferSpacePolicyUrl: 42,
      langsOther: { name: "Galego" },
    };
    const facts = listingFactsForPayload(malformed as ListingFactsSource);
    expect(facts.saferSpacePolicyUrl).toBeNull();
    expect(facts.langsOther).toBe("");
  });
});
