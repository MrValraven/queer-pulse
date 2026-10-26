import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import type { EventCardDTO } from "./events.api";
import { cardToCalendarEvent } from "./events.adapters";

/**
 * The card adapter is where a gathering's end instant reaches the hub.
 *
 * Without it a `CalendarEvent` carried a start and nothing else, so no board,
 * calendar cell or sidebar row could express a gathering that is still
 * running, and every consumer fell back to comparing the START against now.
 */

/** The adapter only translates chrome labels, so echoing the key is enough. */
const translate = ((key: string) => key) as TFunction;

function cardDto(overrides: Partial<EventCardDTO> = {}): EventCardDTO {
  return {
    slug: "overnight-party",
    title: "Overnight party",
    startAt: "2026-10-17T22:00:00.000Z",
    neighbourhood: "Anjos",
    ...overrides,
  };
}

describe("cardToCalendarEvent", () => {
  it("carries the end instant the API sent", () => {
    const event = cardToCalendarEvent(
      cardDto({ endAt: "2026-10-18T03:00:00.000Z" }),
      translate,
    );
    expect(event.endAt).toEqual(new Date("2026-10-18T03:00:00.000Z"));
    expect(event.date).toEqual(new Date("2026-10-17T22:00:00.000Z"));
  });

  it("leaves the end absent when the host set none", () => {
    const event = cardToCalendarEvent(cardDto(), translate);
    expect(event.endAt).toBeUndefined();
    expect("endAt" in event).toBe(false);
  });

  it("carries the hosting community the API named", () => {
    const event = cardToCalendarEvent(
      cardDto({
        hostingCommunity: {
          id: "community-1",
          slug: "queer-runners",
          name: "Queer Runners Lisboa",
        },
      }),
      translate,
    );
    expect(event.hostingCommunity).toEqual({
      id: "community-1",
      slug: "queer-runners",
      name: "Queer Runners Lisboa",
    });
  });

  it("leaves the hosting community unset when the server withheld it", () => {
    const event = cardToCalendarEvent(
      cardDto({ hostingCommunity: null }),
      translate,
    );
    expect("hostingCommunity" in event).toBe(false);
  });

  it("leaves the hosting community unset when an older server sent none", () => {
    const event = cardToCalendarEvent(cardDto(), translate);
    expect("hostingCommunity" in event).toBe(false);
  });

  it("marks a co-hosted gathering", () => {
    const event = cardToCalendarEvent(cardDto({ isCoHosted: true }), translate);
    expect(event.isCoHosted).toBe(true);
  });

  it("leaves the co-hosted flag unset when false or absent", () => {
    const falseEvent = cardToCalendarEvent(
      cardDto({ isCoHosted: false }),
      translate,
    );
    const absentEvent = cardToCalendarEvent(cardDto(), translate);
    expect("isCoHosted" in falseEvent).toBe(false);
    expect("isCoHosted" in absentEvent).toBe(false);
  });
});
