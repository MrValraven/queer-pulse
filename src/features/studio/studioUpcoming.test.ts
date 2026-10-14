import { describe, expect, it } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import { outDateOf } from "./studioUpcoming";

describe("outDateOf", () => {
  it("reads a publish time as a weekday date and a 24-hour time", () => {
    const line = outDateOf(
      new Date(2026, 9, 20, 18, 0).toISOString(),
      createFormatters("en"),
    );
    expect(line?.date).toMatch(/Tue,? (Oct 20|20 Oct)/);
    expect(line?.time).toBe("18:00");
  });

  it("reads nothing without a time, or with a broken one", () => {
    expect(outDateOf(null, createFormatters("en"))).toBeNull();
    expect(outDateOf("not a date", createFormatters("en"))).toBeNull();
  });
});
