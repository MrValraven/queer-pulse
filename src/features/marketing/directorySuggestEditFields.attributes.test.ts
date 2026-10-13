import { describe, expect, it } from "vitest";
import {
  suggestEditFieldOptions,
  suggestEditValueShape,
} from "./directorySuggestEditFields.data";

describe("the Details and amenities bucket", () => {
  it("is offered to every kind, just before Something else", () => {
    for (const isOnline of [false, true]) {
      for (const hasNoAddress of [false, true]) {
        const options = suggestEditFieldOptions({ isOnline, hasNoAddress });
        expect(options.slice(-2)).toEqual(["attributes", "other"]);
      }
    }
  });

  it("takes prose only, so no proposedValue is ever sent with it", () => {
    expect(suggestEditValueShape("attributes")).toBeNull();
  });
});
