import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  goTogetherSlugsToSwitchOn,
  switchOnGoTogetherForSlugs,
} from "./goTogetherPublish";

/**
 * Switching Go together on right after publish: which dates get it, and when
 * a failure is worth a toast. The save call is mocked; the error-code reader
 * stays real.
 */

const { saveGoTogetherHostConfig } = vi.hoisted(() => ({
  saveGoTogetherHostConfig: vi.fn<(slug: string) => Promise<unknown>>(),
}));

vi.mock("../api/goTogether.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/goTogether.api")>()),
  saveGoTogetherHostConfig,
}));

afterEach(() => {
  saveGoTogetherHostConfig.mockReset();
});

const HOUR_MS = 60 * 60 * 1000;
const NOW_MS = Date.UTC(2026, 9, 1, 12, 0);

function startIn(leadMs: number): string {
  return new Date(NOW_MS + leadMs).toISOString();
}

describe("goTogetherSlugsToSwitchOn", () => {
  it("switches it on for every date of a series", () => {
    expect(
      goTogetherSlugsToSwitchOn({
        slug: "book-club",
        occurrenceSlugs: ["book-club", "book-club-2", "book-club-3"],
        firstStartAt: startIn(3 * 24 * HOUR_MS),
        nowMs: NOW_MS,
      }),
    ).toEqual(["book-club", "book-club-2", "book-club-3"]);
  });

  it("falls back to the one slug when the server sends no list", () => {
    expect(
      goTogetherSlugsToSwitchOn({
        slug: "picnic",
        occurrenceSlugs: undefined,
        firstStartAt: startIn(3 * 24 * HOUR_MS),
        nowMs: NOW_MS,
      }),
    ).toEqual(["picnic"]);
  });

  it("skips a first date that starts within 6 hours", () => {
    expect(
      goTogetherSlugsToSwitchOn({
        slug: "picnic",
        occurrenceSlugs: undefined,
        firstStartAt: startIn(5 * HOUR_MS),
        nowMs: NOW_MS,
      }),
    ).toEqual([]);
    expect(
      goTogetherSlugsToSwitchOn({
        slug: "book-club",
        occurrenceSlugs: ["book-club", "book-club-2"],
        firstStartAt: startIn(6 * HOUR_MS),
        nowMs: NOW_MS,
      }),
    ).toEqual(["book-club-2"]);
  });

  it("returns nothing in demo, where the create returns no slug", () => {
    expect(
      goTogetherSlugsToSwitchOn({
        slug: undefined,
        occurrenceSlugs: undefined,
        firstStartAt: startIn(3 * 24 * HOUR_MS),
        nowMs: NOW_MS,
      }),
    ).toEqual([]);
  });
});

describe("switchOnGoTogetherForSlugs", () => {
  it("saves each slug enabled with no questions and the default cutoff", async () => {
    saveGoTogetherHostConfig.mockResolvedValue({});

    await expect(
      switchOnGoTogetherForSlugs(["book-club", "book-club-2"]),
    ).resolves.toBe(false);

    expect(saveGoTogetherHostConfig).toHaveBeenCalledTimes(2);
    expect(saveGoTogetherHostConfig).toHaveBeenCalledWith("book-club", {
      enabled: true,
      hostQuestions: [],
      meetingPointNote: null,
    });
    expect(saveGoTogetherHostConfig).toHaveBeenCalledWith("book-club-2", {
      enabled: true,
      hostQuestions: [],
      meetingPointNote: null,
    });
  });

  it("asks for a toast when a save fails", async () => {
    saveGoTogetherHostConfig
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new ApiError(500, "Server error"));

    await expect(
      switchOnGoTogetherForSlugs(["book-club", "book-club-2"]),
    ).resolves.toBe(true);
  });

  it("stays quiet when opt-in has already closed", async () => {
    saveGoTogetherHostConfig.mockRejectedValue(
      new ApiError(409, "Opt-in closed", {
        code: "GO_TOGETHER_UNAVAILABLE",
        reason: "closed",
      }),
    );

    await expect(switchOnGoTogetherForSlugs(["picnic"])).resolves.toBe(false);
  });
});
