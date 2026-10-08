import { describe, expect, it } from "vitest";
import { suggestEditFieldOptions } from "./directorySuggestEditFields.data";

describe("suggestEditFieldOptions", () => {
  it("offers every bucket for a place", () => {
    expect(
      suggestEditFieldOptions({ isOnline: false, hasNoAddress: false }),
    ).toEqual(["hours", "address", "phone", "website", "description", "other"]);
  });

  it("leaves the address out for a business with no meeting point, and keeps its hours", () => {
    const options = suggestEditFieldOptions({
      isOnline: false,
      hasNoAddress: true,
    });
    expect(options).not.toContain("address");
    expect(options).toContain("hours");
  });

  it("leaves hours and address out online, as before", () => {
    expect(
      suggestEditFieldOptions({ isOnline: true, hasNoAddress: false }),
    ).toEqual(["phone", "website", "description", "other"]);
  });
});
