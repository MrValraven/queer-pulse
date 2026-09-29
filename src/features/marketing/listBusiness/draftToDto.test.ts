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
});
