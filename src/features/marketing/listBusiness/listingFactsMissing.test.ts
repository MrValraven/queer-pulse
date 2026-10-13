import { describe, expect, it } from "vitest";
import { ANCHOR, type ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import {
  factMissingFields,
  isSaferSpacePolicyUrlValid,
} from "./listingFactsMissing";

function draftWith(fields: Partial<ListingDraft>): ListingDraft {
  return { ...blankDraft(), ...fields };
}

describe("isSaferSpacePolicyUrlValid", () => {
  it("takes a domain with or without http(s), and refuses anything else", () => {
    expect(isSaferSpacePolicyUrlValid("lume.pt/policy")).toBe(true);
    expect(isSaferSpacePolicyUrlValid("http://lume.pt")).toBe(true);
    expect(isSaferSpacePolicyUrlValid("https://lume.pt/a-b")).toBe(true);
    expect(isSaferSpacePolicyUrlValid("our policy")).toBe(false);
    expect(isSaferSpacePolicyUrlValid("ftp://lume.pt")).toBe(false);
    expect(isSaferSpacePolicyUrlValid("https://ana:pw@lume.pt")).toBe(false);
    expect(isSaferSpacePolicyUrlValid("lume.pt/a b")).toBe(false);
    expect(isSaferSpacePolicyUrlValid("")).toBe(false);
  });

  it("counts the https:// the server adds against the 300-character ceiling", () => {
    // Both links below are 293 characters as typed. The one typed without a
    // protocol grows to 301 once the server adds https://.
    const withoutProtocol = `lume.pt/${"a".repeat(285)}`;
    const withProtocol = `https://lume.pt/${"a".repeat(277)}`;
    expect(withoutProtocol).toHaveLength(293);
    expect(withProtocol).toHaveLength(293);
    expect(isSaferSpacePolicyUrlValid(withoutProtocol)).toBe(false);
    expect(isSaferSpacePolicyUrlValid(withProtocol)).toBe(true);
  });

  it("takes exactly 300 characters once https:// is in place", () => {
    expect(isSaferSpacePolicyUrlValid(`lume.pt/${"a".repeat(284)}`)).toBe(true);
    expect(
      isSaferSpacePolicyUrlValid(`https://lume.pt/${"a".repeat(284)}`),
    ).toBe(true);
    expect(
      isSaferSpacePolicyUrlValid(`https://lume.pt/${"a".repeat(285)}`),
    ).toBe(false);
  });
});

describe("factMissingFields", () => {
  it("asks for the policy link once the practice is ticked, on both paths", () => {
    for (const path of ["claim", "suggest"] as const) {
      expect(
        factMissingFields(
          draftWith({ path, inclusionPractices: ["safer-space-policy"] }),
        ).step2,
        path,
      ).toEqual([
        {
          labelKey: "marketing:listBusiness.missing.saferSpacePolicyUrl",
          anchor: ANCHOR.saferSpacePolicyUrl,
        },
      ]);
    }
  });

  it("asks for the link format to be fixed when it is no URL", () => {
    expect(
      factMissingFields(
        draftWith({
          inclusionPractices: ["safer-space-policy"],
          saferSpacePolicyUrl: "on the wall by the door",
        }),
      ).step2,
    ).toEqual([
      {
        labelKey: "marketing:listBusiness.missing.saferSpacePolicyUrlFormat",
        anchor: ANCHOR.saferSpacePolicyUrl,
      },
    ]);
  });

  it("asks nothing once the practice has a valid link", () => {
    expect(
      factMissingFields(
        draftWith({
          inclusionPractices: ["safer-space-policy"],
          saferSpacePolicyUrl: "lume.pt/safer-space",
        }),
      ).step2,
    ).toEqual([]);
  });

  it("asks nothing about a link left behind by an unticked practice", () => {
    expect(
      factMissingFields(
        draftWith({
          inclusionPractices: ["chosen-name"],
          saferSpacePolicyUrl: "not a link",
        }),
      ).step2,
    ).toEqual([]);
  });

  it("asks for the time with Free before, only where the cover question applies", () => {
    const freeBefore: Partial<ListingDraft> = {
      coverPolicy: "freeBefore",
      coverFreeBefore: "",
    };
    expect(
      factMissingFields(draftWith({ cats: ["nightlife"], ...freeBefore }))
        .step3,
    ).toEqual([
      {
        labelKey: "marketing:listBusiness.missing.coverFreeBefore",
        anchor: ANCHOR.coverFreeBefore,
      },
    ]);
    expect(
      factMissingFields(
        draftWith({
          cats: ["nightlife"],
          coverPolicy: "freeBefore",
          coverFreeBefore: "23:00",
        }),
      ).step3,
    ).toEqual([]);
    expect(
      factMissingFields(draftWith({ cats: ["food"], ...freeBefore })).step3,
    ).toEqual([]);
    expect(
      factMissingFields(
        draftWith({ online: true, cats: ["food"], ...freeBefore }),
      ).step3,
    ).toEqual([]);
  });

  it("asks nothing about the time on an online nightlife listing", () => {
    // Online forces the cover pair null on the server, so nothing is asked.
    expect(
      factMissingFields(
        draftWith({
          online: true,
          cats: ["nightlife"],
          coverPolicy: "freeBefore",
          coverFreeBefore: "",
        }),
      ).step3,
    ).toEqual([]);
  });
});
