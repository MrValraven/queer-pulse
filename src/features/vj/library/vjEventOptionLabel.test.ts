import { describe, expect, it } from "vitest";
import type { VjEventOptionDTO } from "../../../shared/contracts/vj";
import { vjEventSearchTextOf, vjEventWhenOf } from "./vjEventOptionLabel";

/** A Friday, 22:00 in UTC. */
const FRIDAY_NIGHT = "2026-11-13T22:00:00.000Z";

const SUPPER_CLUB: VjEventOptionDTO = {
  id: "00000000-0000-4000-8000-00000000ee01",
  title: "Queer Supper Club",
  startAt: FRIDAY_NIGHT,
  endAt: null,
  area: "Mouraria",
  isOnline: false,
};

describe("vjEventWhenOf", () => {
  it("writes the weekday, day, month and time", () => {
    expect(vjEventWhenOf(FRIDAY_NIGHT, "en", "UTC")).toBe("Fri 13 Nov, 22:00");
    expect(vjEventWhenOf("2026-11-14T09:05:00.000Z", "en", "UTC")).toBe(
      "Sat 14 Nov, 09:05",
    );
  });

  it("writes Portuguese dates for pt", () => {
    // ICU builds differ on the short weekday ("sexta" or "sex").
    expect(vjEventWhenOf(FRIDAY_NIGHT, "pt-PT", "UTC")).toMatch(
      /^sex(ta)? 13 nov, 22:00$/,
    );
  });

  it("answers an empty line for an unreadable date", () => {
    expect(vjEventWhenOf("not a date", "en", "UTC")).toBe("");
  });
});

describe("vjEventSearchTextOf", () => {
  it("searches by title, date and area", () => {
    const searchText = vjEventSearchTextOf(SUPPER_CLUB, "en", "UTC");
    expect(searchText).toContain("Queer Supper Club");
    expect(searchText).toContain("Fri 13 Nov");
    expect(searchText).toContain("Mouraria");
  });

  it("leaves out an unset area", () => {
    const searchText = vjEventSearchTextOf(
      { ...SUPPER_CLUB, area: null },
      "en",
      "UTC",
    );
    expect(searchText).toBe("Queer Supper Club Fri 13 Nov, 22:00");
  });
});
