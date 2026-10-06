import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import { draftToDto, draftToUpdateDto } from "./draftToDto";

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

<<<<<<< Updated upstream
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
=======
  // Final fix wave item #1: a suggestion is written by the suggester about
  // a business that has not joined yet, so a picked owner-identity tag must
  // never ship from it, even when the draft still carries one from before
  // the field was hidden.
  it("on a suggest draft sends no owner identity tags, even when the draft carries them", () => {
    const draft = {
      ...blankDraft(),
      path: "suggest" as const,
      name: "Bar",
      ownerIdentities: ["women" as const],
    };
    const dto = draftToDto(draft) as unknown as Record<string, unknown>;
    expect(dto.ownerIdentities).toEqual([]);
>>>>>>> Stashed changes
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
