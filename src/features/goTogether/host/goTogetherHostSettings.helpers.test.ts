import { describe, expect, it } from "vitest";
import type { HostConfigDTO } from "../api/goTogether.types";
import {
  cutoffBodyPart,
  epochToZonedInputValue,
  savedConfigBody,
  shouldResendSavedCutoff,
} from "./goTogetherHostSettings.helpers";

/**
 * When a save carries `cutoffAt`. The server re-applies its default to any
 * PUT without one, so the rule decides between keeping the host's time and
 * letting the server work it out again.
 */

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const NOW_MS = Date.UTC(2026, 9, 1, 12, 0);

function configForStart(
  startMs: number,
  cutoffMs: number,
): Pick<HostConfigDTO, "cutoffAt" | "earliestCutoffAt" | "latestCutoffAt"> {
  return {
    cutoffAt: new Date(cutoffMs).toISOString(),
    earliestCutoffAt: new Date(startMs - 7 * DAY_MS).toISOString(),
    latestCutoffAt: new Date(startMs - 6 * HOUR_MS).toISOString(),
  };
}

const START_MS = NOW_MS + 10 * DAY_MS;
const DEFAULT_CUTOFF_MS = START_MS - 48 * HOUR_MS;
const HOST_CHOSEN_CUTOFF_MS = START_MS - 72 * HOUR_MS;

function untouched(config: ReturnType<typeof configForStart>) {
  return cutoffBodyPart({
    config,
    isCutoffTouched: false,
    cutoffValue: "",
    timeZone: undefined,
    nowMs: NOW_MS,
  });
}

describe("cutoffBodyPart", () => {
  it("resends an untouched cutoff the host chose earlier", () => {
    const config = configForStart(START_MS, HOST_CHOSEN_CUTOFF_MS);
    expect(untouched(config)).toEqual({ cutoffAt: config.cutoffAt });
  });

  it("leaves out an untouched cutoff at the 48 hour default", () => {
    expect(untouched(configForStart(START_MS, DEFAULT_CUTOFF_MS))).toEqual({});
  });

  it("leaves out an untouched cutoff the gathering moved away from", () => {
    // Saved against the old start; the gathering then moved 3 days earlier,
    // so the old cutoff is now later than opt-in closes.
    const movedEarlier = configForStart(
      START_MS - 3 * DAY_MS,
      DEFAULT_CUTOFF_MS,
    );
    expect(untouched(movedEarlier)).toEqual({});
    // Moved 9 days later: the old cutoff is now more than 7 days before.
    const movedLater = configForStart(
      START_MS + 9 * DAY_MS,
      HOST_CHOSEN_CUTOFF_MS,
    );
    expect(untouched(movedLater)).toEqual({});
  });

  it("leaves out an untouched cutoff already in the past", () => {
    const config = configForStart(NOW_MS + 2 * DAY_MS, NOW_MS - HOUR_MS);
    expect(untouched(config)).toEqual({});
  });

  it("sends nothing when the host cleared the field", () => {
    const part = cutoffBodyPart({
      config: configForStart(START_MS, HOST_CHOSEN_CUTOFF_MS),
      isCutoffTouched: true,
      cutoffValue: "",
      timeZone: undefined,
      nowMs: NOW_MS,
    });
    expect(part).toEqual({});
  });

  it("sends the host's value when they changed the field", () => {
    const chosenMs = START_MS - 4 * DAY_MS;
    const part = cutoffBodyPart({
      config: configForStart(START_MS, DEFAULT_CUTOFF_MS),
      isCutoffTouched: true,
      cutoffValue: epochToZonedInputValue(chosenMs, "Europe/Lisbon"),
      timeZone: "Europe/Lisbon",
      nowMs: NOW_MS,
    });
    expect(part).toEqual({ cutoffAt: new Date(chosenMs).toISOString() });
  });

  it("refuses a changed value outside the range", () => {
    const part = cutoffBodyPart({
      config: configForStart(START_MS, DEFAULT_CUTOFF_MS),
      isCutoffTouched: true,
      cutoffValue: epochToZonedInputValue(START_MS - HOUR_MS, undefined),
      timeZone: undefined,
      nowMs: NOW_MS,
    });
    expect(part).toBe(false);
  });
});

describe("savedConfigBody", () => {
  it("drops a saved cutoff the gathering moved away from, so the switch still saves", () => {
    const config: HostConfigDTO = {
      ...configForStart(START_MS - 3 * DAY_MS, HOST_CHOSEN_CUTOFF_MS + DAY_MS),
      enabled: false,
      hostQuestions: [],
      meetingPointNote: null,
      isLocked: false,
    };
    expect(shouldResendSavedCutoff(config, NOW_MS)).toBe(false);
    expect(savedConfigBody(config, NOW_MS)).toEqual({
      enabled: false,
      hostQuestions: [],
      meetingPointNote: null,
    });
  });
});
