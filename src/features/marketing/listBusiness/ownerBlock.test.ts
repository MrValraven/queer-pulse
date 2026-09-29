import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import { isOwnerBlockHidden } from "./ownerBlock";

/**
 * The owner block hides the "About you" section, the consents, the affirming
 * baseline and the submitter recap rows. Final fix wave item #5: a suggestion
 * hides it only while nobody has claimed the listing yet: once claimed,
 * `dtoToDraft` sets `managementRole` and the new owner/co-manager answers all
 * of it themselves.
 */
describe("isOwnerBlockHidden", () => {
  it("hides the block for a staff-authored draft", () => {
    const draft = { ...blankDraft(), isStaffAuthored: true, path: "" as const };
    expect(isOwnerBlockHidden(draft)).toBe(true);
  });

  it("hides the block for a brand-new, still-unclaimed suggestion draft", () => {
    const draft = { ...blankDraft(), path: "suggest" as const };
    expect(draft.managementRole).toBeUndefined();
    expect(isOwnerBlockHidden(draft)).toBe(true);
  });

  it("shows the block for a suggestion draft once claimed by an owner", () => {
    const draft = {
      ...blankDraft(),
      path: "suggest" as const,
      managementRole: "owner" as const,
    };
    expect(isOwnerBlockHidden(draft)).toBe(false);
  });

  it("shows the block for a claim draft", () => {
    const draft = { ...blankDraft(), path: "claim" as const };
    expect(isOwnerBlockHidden(draft)).toBe(false);
  });
});
