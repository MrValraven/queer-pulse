import { describe, expect, it } from "vitest";
import { insertAtSelection } from "./insertAtSelection";

describe("insertAtSelection", () => {
  it("inserts at the caret", () => {
    expect(insertAtSelection("Hi !", 3, 3, "{name}")).toEqual({
      value: "Hi {name}!",
      caret: 9,
    });
  });

  it("replaces a selection", () => {
    expect(insertAtSelection("Hi you", 3, 6, "{name}")).toEqual({
      value: "Hi {name}",
      caret: 9,
    });
  });

  it("clamps out-of-range positions", () => {
    expect(insertAtSelection("Hi", 10, 12, "{name}")).toEqual({
      value: "Hi{name}",
      caret: 8,
    });
  });
});
