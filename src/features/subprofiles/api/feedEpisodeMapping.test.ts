import { describe, expect, it } from "vitest";
import {
  byNewestFirst,
  entryToItem,
  episodeMonth,
  feedItemId,
  formatEpisodeDuration,
  formatEpisodeSubtitle,
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_TITLE_MAX_LENGTH,
  sectionRoom,
} from "./feedEpisodeMapping";
import type { FeedEntryDTO } from "./subprofileFeeds.api";

function entry(overrides: Partial<FeedEntryDTO> = {}): FeedEntryDTO {
  return {
    id: "feed-1:ep-14",
    feedId: "feed-1",
    status: "pending",
    itemId: null,
    createdAt: "2026-09-22T08:00:00.000Z",
    guid: "ep-14",
    title: "The second coming out",
    description: "Kai on telling their parents twice.",
    link: "https://latebloomers.example/episodes/ep-14",
    publishedAt: "2026-09-21T06:00:00.000Z",
    durationSeconds: 2880,
    season: 2,
    episode: 14,
    ...overrides,
  };
}

describe("formatEpisodeDuration", () => {
  it("writes minutes under an hour", () => {
    expect(formatEpisodeDuration(2880)).toBe("48 min");
  });

  it("writes hours and minutes from an hour up", () => {
    expect(formatEpisodeDuration(4320)).toBe("1 h 12 min");
  });

  it("drops the minutes on a whole hour", () => {
    expect(formatEpisodeDuration(7200)).toBe("2 h");
  });

  it("rounds to the nearest minute and never reads 0 min", () => {
    expect(formatEpisodeDuration(95)).toBe("2 min");
    expect(formatEpisodeDuration(20)).toBe("1 min");
  });

  it("returns null without a usable duration", () => {
    expect(formatEpisodeDuration(null)).toBeNull();
    expect(formatEpisodeDuration(0)).toBeNull();
    expect(formatEpisodeDuration(Number.NaN)).toBeNull();
  });
});

describe("formatEpisodeSubtitle", () => {
  it("joins season and episode", () => {
    expect(formatEpisodeSubtitle(2, 14)).toBe("S2 · E14");
  });

  it("writes the episode alone when there is no season", () => {
    expect(formatEpisodeSubtitle(null, 14)).toBe("E14");
  });

  it("is null without an episode number, season or not", () => {
    expect(formatEpisodeSubtitle(null, null)).toBeNull();
    expect(formatEpisodeSubtitle(2, null)).toBeNull();
  });
});

describe("episodeMonth", () => {
  it("returns the editor's yyyy-mm month in UTC", () => {
    expect(episodeMonth("2026-09-21T06:00:00.000Z")).toBe("2026-09");
    expect(episodeMonth("2026-01-31T23:30:00.000Z")).toBe("2026-01");
  });

  it("is null for a missing or unreadable date", () => {
    expect(episodeMonth(null)).toBeNull();
    expect(episodeMonth("not a date")).toBeNull();
  });
});

describe("entryToItem", () => {
  const now = "2026-10-01T10:00:00.000Z";

  it("maps an episode to the item the server would write", () => {
    expect(entryToItem(entry(), "episodes", now)).toEqual({
      id: feedItemId("feed-1:ep-14"),
      section: "episodes",
      createdAt: now,
      title: "The second coming out",
      subtitle: "S2 · E14",
      description: "Kai on telling their parents twice.",
      url: "https://latebloomers.example/episodes/ep-14",
      imageUrl: null,
      date: "2026-09",
      meta: "48 min",
      tags: [],
      isFeatured: false,
      collaborators: [],
    });
  });

  it("leaves out what the feed did not give", () => {
    const item = entryToItem(
      entry({
        season: null,
        episode: null,
        description: null,
        publishedAt: null,
        durationSeconds: null,
      }),
      "episodes",
      now,
    );
    expect(item).toMatchObject({
      subtitle: null,
      description: null,
      date: null,
      meta: null,
    });
  });

  it("drops a link that is not a web address", () => {
    expect(
      entryToItem(entry({ link: "javascript:alert(1)" }), "episodes", now).url,
    ).toBeNull();
    expect(entryToItem(entry({ link: null }), "episodes", now).url).toBeNull();
  });

  it("truncates a long title and description", () => {
    const item = entryToItem(
      entry({
        title: "t".repeat(ITEM_TITLE_MAX_LENGTH + 40),
        description: "d".repeat(ITEM_DESCRIPTION_MAX_LENGTH + 40),
      }),
      "episodes",
      now,
    );
    expect(item.title).toHaveLength(ITEM_TITLE_MAX_LENGTH);
    expect(item.description).toHaveLength(ITEM_DESCRIPTION_MAX_LENGTH);
  });
});

describe("byNewestFirst", () => {
  it("sorts by date, newest first, undated last", () => {
    const undated = { publishedAt: null };
    const older = { publishedAt: "2026-01-01T00:00:00.000Z" };
    const newer = { publishedAt: "2026-06-01T00:00:00.000Z" };
    expect([undated, older, newer].sort(byNewestFirst)).toEqual([
      newer,
      older,
      undated,
    ]);
  });
});

describe("sectionRoom", () => {
  it("counts what is left before the 100-item cap", () => {
    expect(sectionRoom(0)).toBe(100);
    expect(sectionRoom(97)).toBe(3);
    expect(sectionRoom(100)).toBe(0);
    expect(sectionRoom(140)).toBe(0);
  });
});
