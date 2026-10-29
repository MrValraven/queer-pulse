import { describe, expect, it } from "vitest";
import { itemFieldMeta } from "./subprofileEditor.data";

describe("itemFieldMeta for the gigs date", () => {
  it.each(["musician", "dj", "vocalist"] as const)(
    "is a day picker for a %s gig",
    (kind) => {
      expect(itemFieldMeta("date", "gigs", kind)?.inputType).toBe("date");
    },
  );

  it("keeps the month picker for a drag artist's shows", () => {
    expect(itemFieldMeta("date", "shows", "drag")?.inputType).toBe("month");
  });
});
