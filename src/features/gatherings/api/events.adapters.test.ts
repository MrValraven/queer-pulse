import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import { useGatheringForm } from "../useGatheringForm";
import {
  attendeeToRow,
  cardToCalendarEvent,
  closingInstant,
  detailToGathering,
  formToCreateEventDto,
} from "./events.adapters";

/**
 * What the create-gathering wizard actually puts on the wire for a schedule.
 *
 * `endAt` used to be derived from the START's date plus the two clock times,
 * which could only ever express "the same night" or "the next morning". The
 * form now carries the end date itself, so these cases assert that the host's
 * own answer survives the trip through `formToCreateEventDto` rather than
 * being re-guessed there.
 *
 * The form is driven through the real hook instead of a hand-built literal:
 * `GatheringForm` is the hook's return type, so a fixture would go stale the
 * moment a field is added, and the auto-adjust rules are part of what produces
 * the payload under test.
 */

/** A local `"YYYY-MM-DD"` a whole number of days from today. */
function futureDate(daysFromToday: number): string {
  const day = new Date();
  day.setHours(12, 0, 0, 0);
  day.setDate(day.getDate() + daysFromToday);
  const year = String(day.getFullYear()).padStart(4, "0");
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

/** The local calendar day an ISO timestamp falls on, as `"YYYY-MM-DD"`. The
 *  payload is UTC, so this has to read it back the way the host's clock does. */
function localDayOf(isoTimestamp: string): string {
  const moment = new Date(isoTimestamp);
  const year = String(moment.getFullYear()).padStart(4, "0");
  const month = String(moment.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(moment.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

describe("formToCreateEventDto schedule", () => {
  it("sends an end one calendar day later for a 23:00 to 04:00 night", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("23:00"));
    act(() => result.current.setEndTime("04:00"));

    const dto = formToCreateEventDto(result.current);

    expect(localDayOf(dto.startAt)).toBe(futureDate(10));
    expect(dto.endAt).toBeDefined();
    expect(localDayOf(dto.endAt!)).toBe(futureDate(11));
    expect(new Date(dto.endAt!).getTime()).toBeGreaterThan(
      new Date(dto.startAt).getTime(),
    );
  });

  it("sends an end three calendar days later for a three-day festival", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndDate(futureDate(13)));

    const dto = formToCreateEventDto(result.current);

    expect(localDayOf(dto.startAt)).toBe(futureDate(10));
    expect(localDayOf(dto.endAt!)).toBe(futureDate(13));
  });

  it("agrees with the wizard's own gate when the end date is cleared", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setEndTime("02:00"));
    act(() => result.current.setEndDate(""));

    // A start, two times that wrap past midnight, and no end date. The gate
    // (`evaluateSchedule`) and the payload builder (`combineEndDateTime`) each
    // fall back to "the start day, rolled forward", so the wizard has to let
    // this through AND the wire has to carry the next day. The gate saying no
    // to a payload this function builds correctly is a dead end the host
    // cannot read.
    expect(result.current.endDate).toBe("");
    expect(result.current.scheduleValid).toBe(true);
    expect(result.current.spanDays).toBe(1);

    const dto = formToCreateEventDto(result.current);

    expect(localDayOf(dto.startAt)).toBe(futureDate(10));
    expect(localDayOf(dto.endAt!)).toBe(futureDate(11));
    expect(new Date(dto.endAt!).getTime()).toBeGreaterThan(
      new Date(dto.startAt).getTime(),
    );
  });

  it("still rolls a wrapping night forward when no end date was supplied", () => {
    const { result } = renderHook(() => useGatheringForm());

    // A form that skipped `setDate` (a seeded duplicate, say) has no end date,
    // so the adapter's own fallback has to keep the payload well-formed, with
    // the end after its start.
    const dto = formToCreateEventDto({
      ...result.current,
      date: futureDate(10),
      time: "22:00",
      endDate: "",
      endTime: "01:00",
    });

    expect(localDayOf(dto.endAt!)).toBe(futureDate(11));
    expect(new Date(dto.endAt!).getTime()).toBeGreaterThan(
      new Date(dto.startAt).getTime(),
    );
  });
});

describe("formToCreateEventDto family and format", () => {
  it("sends the curated format key and its family", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("19:00"));
    act(() => result.current.selectFormat("eat", "supper-club"));

    const dto = formToCreateEventDto(result.current);
    expect(dto.eventType).toBe("supper-club");
    expect(dto.gatheringFamily).toBe("eat");
  });

  it("sends the host's own words, trimmed, for something else", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("19:00"));
    act(() => result.current.selectFormat("make", "other"));
    act(() => result.current.setOtherText("  Risograph afternoon  "));

    const dto = formToCreateEventDto(result.current);
    expect(dto.eventType).toBe("Risograph afternoon");
    expect(dto.gatheringFamily).toBe("make");
  });

  it("omits formatDetails entirely when the host answered nothing", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("19:00"));
    act(() => result.current.selectFormat("learn", "book-club"));

    const dto = formToCreateEventDto(result.current);
    expect("formatDetails" in dto).toBe(false);
  });

  it("sends only the details the chosen family asks for", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("19:00"));
    act(() => result.current.selectFormat("move", "walk-or-hike"));
    act(() => result.current.setFormatDetail("terrain", "steep"));
    act(() => result.current.setFormatDetail("isBeginnerFriendly", true));

    const dto = formToCreateEventDto(result.current);
    expect(dto.formatDetails).toEqual({
      terrain: "steep",
      isBeginnerFriendly: true,
    });
  });

  it("sends the family's attendee-count default", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.setTime("19:00"));
    act(() => result.current.selectFormat("care", "support-circle"));

    const dto = formToCreateEventDto(result.current);
    expect(dto.showAttendeeCount).toBe(false);
  });
});

describe("formToCreateEventDto care and access", () => {
  it("always sends the cutoff, cost kind, RSVP questions and waitlist, and nothing empty", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    // A price typed while the gathering is still free stays off the wire.
    act(() => result.current.setCost("10 EUR"));

    const dto = formToCreateEventDto(result.current);
    expect(dto.costKind).toBe("free");
    expect(dto.rsvpCutoff).toBe("one-hour-before");
    expect(dto.rsvpQuestions).toEqual({
      dietary: false,
      pronouns: false,
      access: true,
    });
    expect(dto.allowWaitlist).toBe(true);
    expect("cost" in dto).toBe(false);
    expect("themes" in dto).toBe(false);
    expect("contentNotes" in dto).toBe(false);
    expect("houseRules" in dto).toBe(false);
    expect("customRsvpQuestion" in dto).toBe(false);
    expect("coverImageUrl" in dto).toBe(false);
  });

  it("sends what the host filled in, trimmed", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.selectFormat("eat", "supper-club"));
    act(() => result.current.setCostKind("fixed"));
    act(() => result.current.setCost(" 12 EUR "));
    act(() => result.current.toggleTheme("sapphic"));
    act(() => result.current.toggleContentNote("alcohol-present"));
    act(() => result.current.setHouseRules("  No photos  "));
    act(() => result.current.setCustomRsvpQuestion(" Allergies? "));
    act(() => result.current.toggleRsvpQuestion("pronouns"));
    act(() => result.current.setAllowWaitlist(false));
    act(() => result.current.setCoverImageUrl("event-covers/cover.webp"));
    act(() => result.current.setCoverPreviewUrl("blob:local-preview"));
    act(() =>
      result.current.toggleCohost({
        slug: "ari",
        name: "Ari",
        initials: "A",
        avatarUrl: null,
      }),
    );

    const dto = formToCreateEventDto(result.current);
    expect(dto.cost).toBe("12 EUR");
    expect(dto.costKind).toBe("fixed");
    expect(dto.rsvpCutoff).toBe("day-before");
    expect(dto.themes).toEqual(["sapphic"]);
    expect(dto.contentNotes).toEqual(["alcohol-present"]);
    expect(dto.houseRules).toBe("No photos");
    expect(dto.customRsvpQuestion).toBe("Allergies?");
    expect(dto.rsvpQuestions).toEqual({
      dietary: false,
      pronouns: true,
      access: true,
    });
    expect(dto.allowWaitlist).toBe(false);
    expect(dto.coverImageUrl).toBe("event-covers/cover.webp");
    // Display-only state and post-publish invites stay off the create.
    expect(JSON.stringify(dto)).not.toContain("blob:local-preview");
    expect(JSON.stringify(dto)).not.toContain("ari");
  });

  it("sends When it ends as an explicit null cutoff", () => {
    const { result } = renderHook(() => useGatheringForm());

    act(() => result.current.setDate(futureDate(10)));
    act(() => result.current.selectFormat("eat", "potluck"));
    act(() => result.current.setRsvpCutoff(null));

    const dto = formToCreateEventDto(result.current);
    expect("rsvpCutoff" in dto).toBe(true);
    expect(dto.rsvpCutoff).toBeNull();
    expect(JSON.stringify(dto)).toContain('"rsvpCutoff":null');
  });
});

/** The detail and card adapters resolve one chrome label; tests do not need
 *  it translated. */
const passthroughTranslate: TFunction = (key) => key;

describe("detailToGathering care and access", () => {
  it("narrows every vocabulary and keeps the server's closing instant", () => {
    const gathering = detailToGathering(
      {
        slug: "supper",
        title: "Supper",
        startAt: "2026-10-10T19:00:00.000Z",
        themes: ["sapphic", "not-a-theme"],
        contentNotes: ["loud-sound", "loud-sound", "unknown"],
        houseRules: "No photos",
        costKind: "pay-what-you-can",
        rsvpCutoff: "day-before",
        rsvpClosesAt: "2026-10-09T19:00:00.000Z",
        rsvpQuestions: { dietary: false, pronouns: true, access: true },
        customRsvpQuestion: "Anything else?",
      },
      passthroughTranslate,
    );

    expect(gathering.themes).toEqual(["sapphic"]);
    expect(gathering.contentNotes).toEqual(["loud-sound"]);
    expect(gathering.houseRules).toBe("No photos");
    expect(gathering.costKind).toBe("pay-what-you-can");
    expect(gathering.rsvpCutoff).toBe("day-before");
    expect(gathering.rsvpClosesAt?.toISOString()).toBe(
      "2026-10-09T19:00:00.000Z",
    );
    expect(gathering.rsvpQuestions).toEqual({
      dietary: false,
      pronouns: true,
      access: true,
    });
    expect(gathering.customRsvpQuestion).toBe("Anything else?");
  });

  it("reads a detail from before the fields existed the way R8 says", () => {
    const gathering = detailToGathering(
      { slug: "old", title: "Old", startAt: "2026-10-10T19:00:00.000Z" },
      passthroughTranslate,
    );

    expect(gathering.themes).toEqual([]);
    expect(gathering.contentNotes).toEqual([]);
    expect(gathering.houseRules).toBeNull();
    expect(gathering.costKind).toBeNull();
    expect(gathering.rsvpCutoff).toBeNull();
    expect(gathering.rsvpClosesAt).toBeNull();
    expect(gathering.rsvpQuestions).toEqual({
      dietary: true,
      pronouns: false,
      access: true,
    });
    expect(gathering.customRsvpQuestion).toBeNull();
  });
});

describe("cardToCalendarEvent care and access", () => {
  it("carries known themes and the cost kind, and nothing when absent", () => {
    const card = cardToCalendarEvent(
      {
        slug: "supper",
        title: "Supper",
        startAt: "2026-10-10T19:00:00.000Z",
        themes: ["trans-led", "nope"],
        costKind: "fixed",
      },
      passthroughTranslate,
    );
    expect(card.themes).toEqual(["trans-led"]);
    expect(card.costKind).toBe("fixed");

    const bareCard = cardToCalendarEvent(
      { slug: "bare", title: "Bare", startAt: "2026-10-10T19:00:00.000Z" },
      passthroughTranslate,
    );
    expect("themes" in bareCard).toBe(false);
    expect("costKind" in bareCard).toBe(false);
  });
});

describe("cardToCalendarEvent host", () => {
  it("carries the host's slug when the card names a host, and nothing without one", () => {
    const card = cardToCalendarEvent(
      {
        slug: "supper",
        title: "Supper",
        startAt: "2026-10-10T19:00:00.000Z",
        host: { slug: "ari-sousa", firstName: "Ari", lastName: "Sousa" },
      },
      passthroughTranslate,
    );
    expect(card.hostSlug).toBe("ari-sousa");

    const hostlessCard = cardToCalendarEvent(
      { slug: "bare", title: "Bare", startAt: "2026-10-10T19:00:00.000Z" },
      passthroughTranslate,
    );
    expect("hostSlug" in hostlessCard).toBe(false);
  });
});

describe("closingInstant", () => {
  it("keeps the server's instant, null included", () => {
    expect(
      closingInstant({
        slug: "open",
        title: "Open",
        startAt: "2026-10-10T19:00:00.000Z",
        rsvpCutoff: "day-before",
        rsvpClosesAt: null,
      }),
    ).toBeNull();
    expect(
      closingInstant({
        slug: "server",
        title: "Server",
        startAt: "2026-10-10T19:00:00.000Z",
        rsvpCutoff: "day-before",
        rsvpClosesAt: "2026-10-09T18:00:00.000Z",
      })?.toISOString(),
    ).toBe("2026-10-09T18:00:00.000Z");
  });

  it("works the instant out from the cutoff when the field is absent", () => {
    expect(
      closingInstant({
        slug: "older",
        title: "Older",
        startAt: "2026-10-10T19:00:00.000Z",
        rsvpCutoff: "day-before",
      })?.toISOString(),
    ).toBe("2026-10-09T19:00:00.000Z");
    expect(
      closingInstant({
        slug: "atStart",
        title: "When it starts",
        startAt: "2026-10-10T19:00:00.000Z",
        rsvpCutoff: "at-start",
      })?.toISOString(),
    ).toBe("2026-10-10T19:00:00.000Z");
    expect(
      closingInstant({
        slug: "untilEnd",
        title: "When it ends",
        startAt: "2026-10-10T19:00:00.000Z",
      }),
    ).toBeNull();
  });
});

describe("attendeeToRow RSVP answers", () => {
  it("carries the attendee's pronouns and custom answer", () => {
    const row = attendeeToRow(
      {
        slug: "ari",
        firstName: "Ari",
        lastName: "Sousa",
        status: "going",
        pronouns: "they/them",
        customAnswer: "No nuts, please",
      },
      0,
    );

    expect(row.pronouns).toBe("they/them");
    expect(row.customAnswer).toBe("No nuts, please");
  });
});
