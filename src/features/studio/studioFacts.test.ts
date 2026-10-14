import { describe, expect, it } from "vitest";
import { releaseFactsLine } from "./studioFacts";

const t = (key: string, options?: { count?: number }) =>
  key === "studio:facts.trackCount"
    ? `${options?.count} tracks`
    : key === "studio:facts.episodeCount"
      ? `${options?.count} episodes`
      : key === "studio:facts.minutes"
        ? `${options?.count} min`
        : key;

describe("releaseFactsLine", () => {
  it("leaves the count out for a scheduled show with no episodes", () => {
    const line = releaseFactsLine(
      {
        typeLabelKey: "Podcast",
        trackCount: 0,
        totalDurationSeconds: 0,
        isShow: true,
      },
      t,
    );
    expect(line).toBe("Podcast");
    expect(line).not.toContain("0");
  });

  it("keeps the count for a music release", () => {
    const line = releaseFactsLine(
      { typeLabelKey: "EP", trackCount: 5, totalDurationSeconds: 1320 },
      t,
    );
    expect(line).toBe("EP · 5 tracks · 22 min");
  });

  it("counts episodes for a show with episodes", () => {
    const line = releaseFactsLine(
      {
        typeLabelKey: "Podcast",
        trackCount: 3,
        totalDurationSeconds: 8040,
        isShow: true,
      },
      t,
    );
    expect(line).toBe("Podcast · 3 episodes · 134 min");
  });
});
