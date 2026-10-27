import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioReleaseDTO } from "./studio.types";
import { studioErrorCodeOf } from "./studio.api";
import {
  DEMO_DRAFT_RELEASE_ID,
  DEMO_OWNER_RELEASES,
  DEMO_RELEASES,
  DEMO_SCHEDULED_RELEASE_ID,
} from "./studioDemo.data";
import {
  demoFollowerGrowth,
  demoNextReleaseOf,
  demoReleaseHealthOf,
  demoStudioArtistMilestones,
  demoStudioArtistPlacements,
  demoStudioMilestoneCard,
} from "./studioDemoDashboard";
import {
  DEMO_DAILY_PLAYS,
  DEMO_MILESTONE_FOLLOWERS_1000_ID,
  DEMO_TRACK_PLAYS,
} from "./studioDemoDashboard.data";
import {
  demoStudioArtistPlays,
  demoStudioTopSupporters,
  demoTrackPlaysOf,
} from "./studioDemoDashboardPlays";
import { DEMO_FORMAT_RELEASES } from "./studioDemoFormats.data";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
  DEMO_DEFAULT_RELEASE_ID,
} from "./studioDemoMe.data";
import { demoArtistFollowerCount } from "./studioDemoCards";
import { demoArtistPlacements } from "./studioDemoPlaylists";
import { demoStudioArtistStats } from "./studioDemoStats";

const allReleases = [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES];

function releaseById(releaseId: string): StudioReleaseDTO {
  const found = allReleases.find((release) => release.id === releaseId);
  if (!found) throw new Error(`No demo release ${releaseId}`);
  return found;
}

function aPodcastRelease(): StudioReleaseDTO {
  const found = [...allReleases, ...DEMO_FORMAT_RELEASES].find(
    (release) => release.type === "podcast",
  );
  if (!found) throw new Error("No demo podcast release");
  return found;
}

function scheduled(releaseId: string, publishAt: string): StudioReleaseDTO {
  return {
    ...releaseById(DEMO_SCHEDULED_RELEASE_ID),
    id: releaseId,
    status: "scheduled",
    publishAt,
  };
}

describe("studio demo dashboard", () => {
  it("gives 12 Monday weeks ending on the current week", () => {
    const weeks = demoFollowerGrowth(
      DEMO_ARTIST_MARIANA.id,
      new Date("2026-10-28T10:00:00.000Z"),
    );
    expect(weeks).toHaveLength(12);
    expect(weeks.at(-1)?.weekStart).toBe("2026-10-26");
    expect(weeks[0]?.weekStart).toBe("2026-08-10");
    expect(
      weeks.some((week) => week.newFollowers > 0 && week.newFollowers < 5),
    ).toBe(true);
  });

  it("gives Late Bloomers its own growth series, within its follower total", () => {
    const marianaWeeks = demoFollowerGrowth(DEMO_ARTIST_MARIANA.id);
    const bloomersWeeks = demoFollowerGrowth(DEMO_ARTIST_LATE_BLOOMERS.id);
    expect(bloomersWeeks).toHaveLength(12);
    expect(bloomersWeeks.map((week) => week.newFollowers)).not.toEqual(
      marianaWeeks.map((week) => week.newFollowers),
    );
    const total = bloomersWeeks.reduce(
      (sum, week) => sum + week.newFollowers,
      0,
    );
    expect(total).toBeLessThanOrEqual(
      demoArtistFollowerCount(DEMO_ARTIST_LATE_BLOOMERS.id),
    );
    expect(
      demoStudioArtistStats(DEMO_ARTIST_LATE_BLOOMERS.id).followerGrowth,
    ).toEqual(bloomersWeeks);
  });

  it("builds the checklist the contract's way", () => {
    const cidade = demoReleaseHealthOf(releaseById(DEMO_DEFAULT_RELEASE_ID));
    expect(cidade.map((item) => item.key)).toEqual([
      "cover",
      "description",
      "genreAndMood",
      "creditsOnEveryTrack",
      "lyrics",
      "buyLink",
    ]);
    expect(cidade.find((item) => item.key === "lyrics")).toEqual({
      key: "lyrics",
      isDone: false,
      isOptional: true,
    });
    expect(
      demoReleaseHealthOf(releaseById("demo-release-taken-down-bairro")),
    ).toEqual([]);
    expect(
      demoReleaseHealthOf(aPodcastRelease()).map((item) => item.key),
    ).toEqual(["cover", "description"]);
  });

  it("adds the version note to a published release with unnoted changes only", () => {
    expect(
      demoReleaseHealthOf({
        ...releaseById(DEMO_DEFAULT_RELEASE_ID),
        hasUnnotedChanges: true,
      }).at(-1),
    ).toEqual({ key: "versionNote", isDone: false, isOptional: false });
    expect(
      demoReleaseHealthOf({
        ...releaseById(DEMO_DRAFT_RELEASE_ID),
        hasUnnotedChanges: true,
      }).map((item) => item.key),
    ).not.toContain("versionNote");
  });

  it("gives a draft a checklist, and a release with no tracks open credits and lyrics", () => {
    expect(
      demoReleaseHealthOf(releaseById(DEMO_DRAFT_RELEASE_ID)).length,
    ).toBeGreaterThan(0);
    const empty = demoReleaseHealthOf({
      ...releaseById(DEMO_DRAFT_RELEASE_ID),
      tracks: [],
    });
    expect(
      empty
        .filter(
          (item) => item.key === "creditsOnEveryTrack" || item.key === "lyrics",
        )
        .map((item) => item.isDone),
    ).toEqual([false, false]);
  });

  it("picks the earliest scheduled release, ties by id", () => {
    const publishAt = "2026-11-02T18:00:00.000Z";
    expect(
      demoNextReleaseOf([
        scheduled("b", publishAt),
        scheduled("a", publishAt),
        scheduled("c", "2026-12-01T18:00:00.000Z"),
      ])?.releaseId,
    ).toBe("a");
    expect(demoNextReleaseOf([])).toBeNull();
  });

  it("pages Mariana's placements newest first with an opaque cursor", () => {
    const first = demoStudioArtistPlacements(DEMO_ARTIST_MARIANA.id, null);
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).not.toBeNull();
    const second = demoStudioArtistPlacements(
      DEMO_ARTIST_MARIANA.id,
      first.nextCursor,
    );
    expect(
      second.items[0]!.latestAddedAt <= first.items[1]!.latestAddedAt,
    ).toBe(true);
    expect(
      demoStudioArtistPlacements(DEMO_ARTIST_MARIANA.id, "garbage").items,
    ).toEqual(first.items);
  });

  it("lists distinct tracks, at most five per placement, and counts them all", () => {
    for (const placement of demoArtistPlacements(DEMO_ARTIST_MARIANA.id)) {
      const ids = placement.tracks.map((track) => track.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(placement.tracks.length).toBeLessThanOrEqual(5);
      expect(placement.trackCount).toBeGreaterThanOrEqual(
        placement.tracks.length,
      );
      expect(placement.latestAddedAt).toMatch(/\.\d{3}Z$/);
    }
  });

  it("answers milestones newest first for an owned persona and 404 for any other", () => {
    const { items } = demoStudioArtistMilestones(DEMO_ARTIST_MARIANA.id);
    expect(items[0]?.id).toBe(DEMO_MILESTONE_FOLLOWERS_1000_ID);
    expect(items.map((item) => item.kind)).toContain("first_placement");
    expect(() => demoStudioArtistMilestones("sp-diogo-nightform")).toThrow(
      ApiError,
    );
    const bloomers = demoStudioArtistMilestones(DEMO_ARTIST_LATE_BLOOMERS.id);
    expect(bloomers.items.map((item) => [item.kind, item.threshold])).toEqual([
      ["followers", 25],
      ["followers", 10],
    ]);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    expect(
      bloomers.items.every((item) => Date.parse(item.reachedAt) < sevenDaysAgo),
    ).toBe(true);
    expect(demoStudioMilestoneCard(bloomers.items[0]!.id).artist.id).toBe(
      DEMO_ARTIST_LATE_BLOOMERS.id,
    );
  });

  it("reads a milestone card and refuses an unknown id with the contract code", () => {
    expect(
      demoStudioMilestoneCard(DEMO_MILESTONE_FOLLOWERS_1000_ID).artist.id,
    ).toBe(DEMO_ARTIST_MARIANA.id);
    try {
      demoStudioMilestoneCard("demo-milestone-unknown");
      expect.unreachable();
    } catch (error) {
      expect(studioErrorCodeOf(error)).toBe("studio_milestone_not_found");
    }
  });

  it("adds the dashboard fields to Mariana's stats", () => {
    const stats = demoStudioArtistStats(DEMO_ARTIST_MARIANA.id);
    expect(stats.followerGrowth).toHaveLength(12);
    expect(stats.nextRelease?.releaseId).toBe(DEMO_SCHEDULED_RELEASE_ID);
    expect(stats.nextRelease?.reminders).toEqual({
      value: 12,
      isBelowThreshold: false,
    });
    expect(stats.releases.every((row) => Array.isArray(row.health))).toBe(true);
  });
});

describe("Part 2 plays and supporters", () => {
  const now = new Date("2026-10-27T10:00:00.000Z");
  it("adds up: the days, the tracks' 28 days and the 28-day total agree, and the tracks make the all-time total", () => {
    const sumDays = DEMO_DAILY_PLAYS.reduce((sum, value) => sum + value, 0);
    const trackIds = Object.keys(DEMO_TRACK_PLAYS);
    expect(
      trackIds.reduce((sum, id) => sum + demoTrackPlaysOf(id).plays28d, 0),
    ).toBe(sumDays);
    const plays = demoStudioArtistPlays(DEMO_ARTIST_MARIANA.id, now);
    expect(plays.total28d).toEqual({ value: sumDays, isBelowThreshold: false });
    expect(plays.total.value).toBe(
      trackIds.reduce((sum, id) => sum + demoTrackPlaysOf(id).plays, 0),
    );
    for (const id of trackIds)
      expect(demoTrackPlaysOf(id).plays28d).toBeLessThanOrEqual(
        demoTrackPlaysOf(id).plays,
      );
  });
  it("gives 28 UTC days ending today, a real zero and a withheld day among them", () => {
    const { days } = demoStudioArtistPlays(
      DEMO_ARTIST_MARIANA.id,
      new Date("2026-10-27T10:00:00.000Z"),
    );
    expect(days).toHaveLength(28);
    expect(days.at(-1)?.day).toBe("2026-10-27");
    expect(days[0]?.day).toBe("2026-09-30");
    expect(days.some((day) => day.plays.value === 0)).toBe(true);
    expect(days.some((day) => day.plays.isBelowThreshold)).toBe(true);
  });
  it("writes play milestones only where the totals passed them", () => {
    const { items } = demoStudioArtistMilestones(DEMO_ARTIST_MARIANA.id);
    const total =
      demoStudioArtistPlays(DEMO_ARTIST_MARIANA.id, now).total.value ?? 0;
    expect(total).toBeGreaterThanOrEqual(1000);
    expect(
      items.some(
        (item) => item.kind === "artist_plays" && item.threshold === 1000,
      ),
    ).toBe(true);
    const trackMilestones = items.filter((row) => row.kind === "track_plays");
    expect(trackMilestones.length).toBeGreaterThan(0);
    expect(
      trackMilestones.map(
        (item) =>
          demoTrackPlaysOf(item.track?.id ?? "").plays >= item.threshold,
      ),
    ).not.toContain(false);
  });
  it("carries plays on every stats row, and zeros for Late Bloomers", () => {
    const stats = demoStudioArtistStats(DEMO_ARTIST_MARIANA.id);
    expect(
      stats.releases.every(
        (row) => row.plays !== undefined && row.plays28d !== undefined,
      ),
    ).toBe(true);
    expect(
      demoStudioArtistStats(DEMO_ARTIST_LATE_BLOOMERS.id).releases.every(
        (row) => row.plays?.value === 0,
      ),
    ).toBe(true);
    expect(
      demoStudioArtistPlays(DEMO_ARTIST_LATE_BLOOMERS.id, now).total,
    ).toEqual({ value: 0, isBelowThreshold: false });
  });
  it("ranks Mariana's supporters, none for Late Bloomers, and 404 for any other persona", () => {
    const first = demoStudioTopSupporters(DEMO_ARTIST_MARIANA.id).items[0]
      ?.identity;
    expect(
      first?.kind === "persona"
        ? first.persona.name
        : first?.member.displayName,
    ).toBe("Vanda Diesel");
    expect(demoStudioTopSupporters(DEMO_ARTIST_LATE_BLOOMERS.id)).toEqual({
      items: [],
      optedInCount: { value: 0, isBelowThreshold: false },
    });
    expect(() => demoStudioTopSupporters("sp-diogo-nightform")).toThrow(
      ApiError,
    );
    expect(() => demoStudioArtistPlays("sp-diogo-nightform")).toThrow(ApiError);
  });
});
