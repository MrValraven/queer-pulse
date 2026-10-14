import { describe, expect, it } from "vitest";
import {
  hasReachedPlayed,
  isStudioEpisodeSpeed,
  minutesLeft,
  resumeTargetSeconds,
  skipTargetSeconds,
} from "./studioEpisodeRules";

describe("resumeTargetSeconds", () => {
  it("resumes a load that started at 0", () => {
    expect(resumeTargetSeconds(600, 2400, 0)).toBe(600);
    expect(resumeTargetSeconds(600, 2400, 0.4)).toBe(600);
  });

  it("lets a &t= link win", () => {
    expect(resumeTargetSeconds(600, 2400, 90)).toBeNull();
    expect(resumeTargetSeconds(600, 2400, 1)).toBeNull();
  });

  it("starts over when fewer than 30 seconds remain", () => {
    expect(resumeTargetSeconds(2371, 2400, 0)).toBe(2371);
    expect(resumeTargetSeconds(2372, 2400, 0)).toBeNull();
  });

  it("has nothing to resume without a saved place", () => {
    expect(resumeTargetSeconds(undefined, 2400, 0)).toBeNull();
    expect(resumeTargetSeconds(0, 2400, 0)).toBeNull();
  });
});

describe("played, minutes left and skips", () => {
  it("counts as played from 90% of the duration", () => {
    expect(hasReachedPlayed(899, 1000)).toBe(false);
    expect(hasReachedPlayed(900, 1000)).toBe(true);
    expect(hasReachedPlayed(900, null)).toBe(false);
  });

  it("rounds the minutes left up", () => {
    expect(minutesLeft(600, 1320)).toBe(12);
    expect(minutesLeft(1300, 1320)).toBe(1);
    expect(minutesLeft(undefined, 1320)).toBeNull();
  });

  it("skips back 15 and forward 30, inside the episode", () => {
    expect(skipTargetSeconds(100, "back", 2400)).toBe(85);
    expect(skipTargetSeconds(10, "back", 2400)).toBe(0);
    expect(skipTargetSeconds(100, "forward", 2400)).toBe(130);
    expect(skipTargetSeconds(2390, "forward", 2400)).toBe(2400);
  });

  it("knows the five speeds", () => {
    expect(isStudioEpisodeSpeed(1.25)).toBe(true);
    expect(isStudioEpisodeSpeed(3)).toBe(false);
    expect(isStudioEpisodeSpeed("1")).toBe(false);
  });
});
