import { describe, expect, it } from "vitest";
import type { Conversation } from "../data";
import { shouldShowCounterpartPresence } from "./mailboxPresence";

describe("shouldShowCounterpartPresence", () => {
  it("shows a person's presence", () => {
    expect(shouldShowCounterpartPresence({ id: "a" } as Conversation)).toBe(
      true,
    );
  });

  it("shows presence for a counterpart speaking as their own profile", () => {
    expect(
      shouldShowCounterpartPresence({
        id: "a",
        counterpartIdentityKind: "profile",
      } as Conversation),
    ).toBe(true);
  });

  it("never shows presence for a deleted business", () => {
    expect(
      shouldShowCounterpartPresence({
        id: "c",
        isCounterpartFormerBusiness: true,
        online: true,
      } as Conversation),
    ).toBe(false);
  });

  it("never shows presence for a business, persona or company", () => {
    for (const kind of ["listing", "subprofile", "company"] as const) {
      expect(
        shouldShowCounterpartPresence({
          id: "b",
          counterpartIdentityKind: kind,
          online: true,
        } as Conversation),
      ).toBe(false);
    }
  });
});
