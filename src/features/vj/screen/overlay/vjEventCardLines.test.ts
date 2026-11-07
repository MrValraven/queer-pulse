import { describe, expect, it } from "vitest";
import type { VjEventCardDTO } from "../../../../shared/contracts/vj";
import { vjEventCardLinesOf } from "./vjEventCardLines";

function card(changes: Partial<VjEventCardDTO> = {}): VjEventCardDTO {
  return {
    eventId: "event-1",
    title: "Sapphic Saturday",
    // Saturday 7 November 2026, 21:30 UTC.
    startAt: "2026-11-07T21:30:00.000Z",
    endAt: null,
    timezone: "Europe/Lisbon",
    area: "Intendente",
    isOnline: false,
    publicUrl: "https://queerpulse.example/events/sapphic-saturday",
    ...changes,
  };
}

describe("vjEventCardLinesOf", () => {
  it("formats the date in the event's time zone", () => {
    const lisbon = vjEventCardLinesOf(card(), "en");
    expect(lisbon.title).toBe("Sapphic Saturday");
    expect(lisbon.dateLine).toContain("Saturday");
    expect(lisbon.dateLine).toContain("November 7");
    expect(lisbon.dateLine).toContain("9:30");

    const newYork = vjEventCardLinesOf(
      card({ timezone: "America/New_York" }),
      "en",
    );
    expect(newYork.dateLine).toContain("4:30");

    // Late enough in Lisbon to fall on the next day in Tokyo.
    const tokyo = vjEventCardLinesOf(card({ timezone: "Asia/Tokyo" }), "en");
    expect(tokyo.dateLine).toContain("Sunday");
    expect(tokyo.dateLine).toContain("November 8");

    const portuguese = vjEventCardLinesOf(card(), "pt-PT");
    expect(portuguese.dateLine).toContain("novembro");
    expect(portuguese.dateLine).toContain("21:30");
  });

  it("says Online for an online event", () => {
    const lines = vjEventCardLinesOf(
      card({ isOnline: true, area: "Intendente" }),
      "en",
    );
    expect(lines.isOnline).toBe(true);
    expect(lines.placeLine).toBeNull();
  });

  it("uses the area for an in-person event", () => {
    expect(vjEventCardLinesOf(card(), "en").placeLine).toBe("Intendente");
    expect(vjEventCardLinesOf(card({ area: null }), "en").placeLine).toBeNull();
    expect(vjEventCardLinesOf(card({ area: "  " }), "en").placeLine).toBeNull();
    expect(vjEventCardLinesOf(card(), "en").isOnline).toBe(false);
  });
});
