import { describe, expect, it } from "vitest";
import { formatItemDate } from "./date";

describe("formatItemDate", () => {
  it("formats a picked day as a short date", () => {
    expect(formatItemDate("2026-10-17", "en-GB")).toBe("17 Oct 2026");
  });

  it("formats a picked month as month and year", () => {
    expect(formatItemDate("2025-07", "en-GB")).toBe("July 2025");
  });

  it("leaves free text exactly as written", () => {
    expect(formatItemDate("Sundays, fortnightly", "en-GB")).toBe(
      "Sundays, fortnightly",
    );
  });
});
