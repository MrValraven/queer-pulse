import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { MAX_GATHERING_SPAN_DAYS } from "../createGathering.data";
import { useGatheringForm } from "../useGatheringForm";
import {
  scheduleInstants,
  schedulePairErrorKey,
  type SchedulePairState,
} from "./schedulePair";

const ENDS_BEFORE_START = "gatherings:create.step2.endsBeforeStart";
const SPAN_TOO_LONG = "gatherings:create.step2.spanTooLong";

/** A far-future start, so `dateValid`'s "still in the future" check passes
 *  and the END pair alone decides each test below. */
const START_DATE = "2030-05-10";

function scheduleState(
  overrides: Partial<SchedulePairState>,
): SchedulePairState {
  return {
    date: START_DATE,
    time: "19:00",
    endDate: START_DATE,
    endTime: "22:00",
    scheduleValid: true,
    ...overrides,
  };
}

describe("schedulePairErrorKey", () => {
  it("says nothing on a brand new wizard, which has no start date yet", () => {
    // The bug this test exists for. `endTime` is PREFILLED at "22:00" and the
    // start date is empty, so there is no start instant, `scheduleValid` is
    // false, and a guard on the end time alone painted a fresh step 2 in the
    // danger colour and announced that the gathering ended before it began.
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.date).toBe("");
    expect(result.current.endTime).toBeTruthy();
    expect(result.current.scheduleValid).toBe(false);
    expect(schedulePairErrorKey(result.current)).toBeNull();
  });

  it("says nothing about the end pair while only the start date is missing", () => {
    expect(
      schedulePairErrorKey(
        scheduleState({ date: "", endDate: "", scheduleValid: false }),
      ),
    ).toBeNull();
  });

  it("says nothing when there is no end time, which is allowed", () => {
    expect(
      schedulePairErrorKey(scheduleState({ endTime: "", scheduleValid: true })),
    ).toBeNull();
  });

  it("says nothing about a schedule the wizard accepts", () => {
    expect(schedulePairErrorKey(scheduleState({}))).toBeNull();
  });

  it("names the ordering fix for an end at or before the start", () => {
    expect(
      schedulePairErrorKey(
        scheduleState({ endTime: "17:00", scheduleValid: false }),
      ),
    ).toBe(ENDS_BEFORE_START);
    // Exactly equal counts as before, the same way `evaluateSchedule` reads it.
    expect(
      schedulePairErrorKey(
        scheduleState({ endTime: "19:00", scheduleValid: false }),
      ),
    ).toBe(ENDS_BEFORE_START);
  });

  it("names the length fix for a span past the cap, which is the OTHER message", () => {
    // Well past 14 days, so the end lands after the start and only the cap can
    // be what `scheduleValid` is false about.
    expect(
      schedulePairErrorKey(
        scheduleState({ endDate: "2030-06-20", scheduleValid: false }),
      ),
    ).toBe(SPAN_TOO_LONG);
  });

  it("picks the message from the ORDERING and leaves the cap to the form", () => {
    // The 14-day cap lives in `useGatheringForm`, which measures elapsed
    // milliseconds exactly the way the backend does. This function is handed
    // that verdict as `scheduleValid` and only decides which sentence answers
    // it, so the two stay in agreement whatever the cap becomes.
    expect(MAX_GATHERING_SPAN_DAYS).toBe(14);
    const invalidPair = { endDate: "2030-05-25", scheduleValid: false };
    expect(schedulePairErrorKey(scheduleState(invalidPair))).toBe(
      SPAN_TOO_LONG,
    );
    expect(
      schedulePairErrorKey(scheduleState({ ...invalidPair, endTime: "17:00" })),
    ).toBe(SPAN_TOO_LONG);
    expect(
      schedulePairErrorKey(
        scheduleState({
          ...invalidPair,
          endDate: START_DATE,
          endTime: "17:00",
        }),
      ),
    ).toBe(ENDS_BEFORE_START);
  });
});

describe("scheduleInstants", () => {
  it("moves an end with no end date to the next day when it is at or before the start", () => {
    const { startInstant, endInstant } = scheduleInstants(
      scheduleState({ time: "23:00", endDate: "", endTime: "02:00" }),
    );
    expect(startInstant).not.toBeNull();
    expect(endInstant?.getDate()).toBe(11);
    expect(endInstant?.getHours()).toBe(2);
  });

  it("keeps an end the host dated themselves exactly where they put it", () => {
    const { endInstant } = scheduleInstants(
      scheduleState({ time: "23:00", endDate: START_DATE, endTime: "02:00" }),
    );
    expect(endInstant?.getDate()).toBe(10);
  });
});
