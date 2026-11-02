import { describe, expect, it } from "vitest";
import { addEventMonthPath } from "./gatheringPaths";

describe("addEventMonthPath", () => {
  it("points at the month page with no template", () => {
    expect(addEventMonthPath()).toBe("/create-gathering/month");
  });

  it("carries the template slug in the from param", () => {
    expect(addEventMonthPath("drag-night-nov")).toBe(
      "/create-gathering/month?from=drag-night-nov",
    );
  });

  it("encodes a slug with reserved characters", () => {
    expect(addEventMonthPath("a&b")).toBe("/create-gathering/month?from=a%26b");
  });
});
