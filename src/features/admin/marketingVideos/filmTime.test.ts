import { describe, expect, it } from "vitest";
import { formatClock, secondsLeft } from "./filmTime";
import {
  MARKETING_VIDEOS,
  estimatedRenderMinutes,
} from "./marketingVideos.data";

describe("formatClock", () => {
  it("shows minutes and padded seconds", () => {
    expect(formatClock(64.8)).toBe("1:05");
    expect(formatClock(48)).toBe("0:48");
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(-3)).toBe("0:00");
  });
});

describe("secondsLeft", () => {
  it("waits for a few frames before estimating", () => {
    expect(secondsLeft(5, 1440, 2)).toBeNull();
  });

  it("projects the remaining frames at the pace so far", () => {
    expect(secondsLeft(360, 1440, 60)).toBe(180);
  });
});

describe("estimatedRenderMinutes", () => {
  it("allows more time for the motion-blurred film", () => {
    const byId = Object.fromEntries(
      MARKETING_VIDEOS.map((video) => [
        video.id,
        estimatedRenderMinutes(video),
      ]),
    );
    expect(byId.pro).toBeGreaterThan(byId.upbeat ?? 0);
    expect(byId.cinematic).toBeGreaterThanOrEqual(1);
  });
});
