import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGatheringForm } from "../useGatheringForm";
import { formToCreateEventDto } from "./events.adapters";

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

    // A form that never went through `setDate` (a seeded duplicate, say) has
    // no end date, so the adapter's own fallback has to keep the payload
    // well-formed rather than sending an end before its start.
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
