import { describe, expect, it } from "vitest";
import { emptyDraft, ownerStewardFrom } from "./useCommunityForm";
import type { CommunityDraft } from "./startCommunity.data";
import {
  firstOpenChapter,
  firstOpenQuickStep,
  isQuickStep,
  quickMissingByStep,
} from "./quickStartCommunity.model";

const draft = emptyDraft(ownerStewardFrom(null));

/** A draft with every quick step answered. */
const completeDraft: CommunityDraft = {
  ...draft,
  name: "Trans Book Club",
  type: "arts",
  tagline: "Reading together on Sundays",
  purpose: "A monthly book club",
  whoFor: "Trans readers in Lisbon",
  accessTier: "request",
  handle: "trans-book-club",
  consent: true,
};

describe("quick start community model", () => {
  it("asks for name, category and tagline on step one", () => {
    expect(quickMissingByStep(draft)[1]).toEqual([
      "communities:start.missing.name",
      "communities:start.missing.category",
      "communities:start.missing.tagline",
    ]);
  });

  it("asks for purpose and who it is for on step two", () => {
    expect(quickMissingByStep(draft)[2]).toEqual([
      "communities:start.missing.purpose",
      "communities:start.missing.whoFor",
    ]);
  });

  it("asks for access, handle and consent on step three", () => {
    // The empty draft holds the preset shared values, so no rules key shows.
    expect(quickMissingByStep(draft)[3]).toEqual([
      "communities:start.missing.access",
      "communities:start.missing.handle",
      "communities:start.missing.consent",
    ]);
  });

  it("asks for a shared value on step three when the draft holds none", () => {
    const missing = quickMissingByStep({ ...draft, rules: [] });
    expect(missing[3][0]).toBe("communities:start.missing.rules");
    expect(missing[3]).toHaveLength(4);
  });

  it("opens on the first step with something missing", () => {
    const missing = quickMissingByStep({
      ...draft,
      name: "Club",
      type: "social",
      tagline: "Friends on Fridays",
    });
    expect(missing[1]).toEqual([]);
    expect(firstOpenQuickStep(missing)).toBe(2);
  });

  it("opens on step three when nothing is missing", () => {
    const missing = quickMissingByStep(completeDraft);
    expect(missing).toEqual({ 1: [], 2: [], 3: [] });
    expect(firstOpenQuickStep(missing)).toBe(3);
  });

  it("finds the first wizard chapter with something missing", () =>
    expect(firstOpenChapter({ 0: [], 1: [], 2: ["x"], 6: ["y"] })).toBe(2));

  it("lands on the confirm chapter when nothing is missing", () =>
    expect(firstOpenChapter({ 0: [], 1: [] })).toBe(8));

  it("accepts only 1, 2 and 3 as a quick step", () => {
    expect(isQuickStep(1)).toBe(true);
    expect(isQuickStep(2)).toBe(true);
    expect(isQuickStep(3)).toBe(true);
    expect(isQuickStep(0)).toBe(false);
    expect(isQuickStep(4)).toBe(false);
    expect(isQuickStep("2")).toBe(false);
    expect(isQuickStep(null)).toBe(false);
  });
});
