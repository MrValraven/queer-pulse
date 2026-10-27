import { describe, expect, it } from "vitest";
import { studioReleasePath, studioTrackPath } from "../studioPaths";
import { toArtistStatsView } from "./studio.adapters";
import type {
  StudioArtistRefDTO,
  StudioArtistStatsDTO,
  StudioCountDTO,
} from "./studio.types";
import {
  isRecentMilestone,
  placementsPageOf,
  toDashboardStatsView,
  toFollowerGrowthViews,
  toMilestoneCardView,
  toMilestoneView,
  toMilestoneViews,
  toNextReleaseView,
  toPlacementView,
  toReleaseHealthView,
} from "./studioDashboard.adapters";
import type {
  StudioMilestoneDTO,
  StudioPlacementDTO,
} from "./studioDashboard.types";

const artistRefDto: StudioArtistRefDTO = {
  id: "persona-mariana",
  handle: "",
  name: "Mariana Sol",
  kind: "musician",
  avatarUrl: null,
};

const cardDto = {
  id: "release-7",
  title: "Cartas",
  type: "single" as const,
  coverUrl: "https://files.example/cartas.webp",
  releasedOn: "2026-03-01",
  trackCount: 1,
  totalDurationSeconds: 200,
  artist: artistRefDto,
  publishedAt: "2026-03-01T10:00:00.000Z",
  genre: "fado",
  mood: null,
  scene: null,
};

const growthWeekStarts = [
  "2026-08-03",
  "2026-08-10",
  "2026-08-17",
  "2026-08-24",
  "2026-08-31",
  "2026-09-07",
  "2026-09-14",
  "2026-09-21",
  "2026-09-28",
  "2026-10-05",
  "2026-10-12",
  "2026-10-19",
];

const statsDto: StudioArtistStatsDTO = {
  subprofileId: "persona-mariana",
  followerCount: 40,
  releases: [
    {
      release: { ...cardDto, status: "published" },
      saves: { value: 12, isBelowThreshold: false },
      playlistInclusions: { value: null, isBelowThreshold: true },
      tracks: [
        {
          track: {
            id: "track-7",
            position: 1,
            title: "Cartas",
            durationSeconds: 200,
            isExplicit: false,
            hasAudio: true,
          },
          saves: { value: 9, isBelowThreshold: false },
          playlistInclusions: { value: 0, isBelowThreshold: false },
        },
      ],
      health: [
        { key: "cover", isDone: true, isOptional: false },
        { key: "lyrics", isDone: false, isOptional: true },
      ],
    },
  ],
  followerGrowth: growthWeekStarts.map((weekStart, index) => ({
    weekStart,
    newFollowers: index,
  })),
  nextRelease: {
    releaseId: "release-9",
    title: "Maré alta",
    publishAt: "2026-11-02T18:00:00.000Z",
    reminders: { value: 6, isBelowThreshold: false },
  },
};

const placementDto: StudioPlacementDTO = {
  playlist: {
    id: "playlist-1",
    name: "Kitchen tapes",
    credit: {
      persona: null,
      member: {
        id: "member-1",
        slug: "tiago",
        displayName: "Tiago Costa",
        avatarUrl: null,
      },
    },
    coverUrls: ["https://files.example/cartas.webp"],
    trackCount: 8,
    totalDurationSeconds: 1600,
    updatedAt: "2026-10-10T10:00:00.000Z",
    isOwner: false,
    visibility: null,
  },
  tracks: ["Cais", "Cartas", "Maré", "Lume", "Rua", "Varanda"].map(
    (title, index) => ({
      id: `track-${index + 1}`,
      title,
      releaseId: "release-7",
    }),
  ),
  trackCount: 6,
  latestAddedAt: "2026-10-20T08:15:30.000Z",
};

const followersMilestone: StudioMilestoneDTO = {
  id: "milestone-1",
  kind: "followers",
  threshold: 100,
  track: null,
  reachedAt: "2026-10-18T09:00:00.000Z",
};

describe("toReleaseHealthView", () => {
  it("keeps the contract order and drops unknown and repeated keys", () => {
    const view = toReleaseHealthView(
      [
        { key: "lyrics", isDone: false, isOptional: true },
        { key: "sparkles", isDone: false, isOptional: false },
        { key: "cover", isDone: true, isOptional: false },
        { key: "cover", isDone: false, isOptional: false },
      ],
      "album",
    );
    expect(view.items.map((item) => item.key)).toEqual(["cover", "lyrics"]);
    expect(view.items[0]?.isDone).toBe(true);
  });
  it("counts done items over every item", () => {
    const view = toReleaseHealthView(
      [
        { key: "cover", isDone: true, isOptional: false },
        { key: "description", isDone: true, isOptional: false },
        { key: "genreAndMood", isDone: true, isOptional: false },
        { key: "creditsOnEveryTrack", isDone: true, isOptional: false },
        { key: "buyLink", isDone: false, isOptional: true },
      ],
      "album",
    );
    expect([view.doneCount, view.totalCount, view.hasOpenItems]).toEqual([
      4,
      5,
      true,
    ]);
  });
  it("marks lyrics and the buy link optional whatever the flag says", () => {
    const view = toReleaseHealthView(
      [
        { key: "lyrics", isDone: false, isOptional: false },
        { key: "cover", isDone: false, isOptional: true },
      ],
      "album",
    );
    expect(view.items.map((item) => [item.key, item.isOptional])).toEqual([
      ["cover", false],
      ["lyrics", true],
    ]);
  });
  it("reads a missing checklist as an empty one", () => {
    expect(toReleaseHealthView(undefined, "album")).toEqual({
      items: [],
      doneCount: 0,
      totalCount: 0,
      hasOpenItems: false,
    });
  });
  it("leaves genre and mood off a podcast, which has no such field", () => {
    const view = toReleaseHealthView(
      [
        { key: "cover", isDone: true, isOptional: false },
        { key: "genreAndMood", isDone: false, isOptional: false },
      ],
      "podcast",
    );
    expect(view.items.map((item) => item.key)).toEqual(["cover"]);
    expect(view.hasOpenItems).toBe(false);
  });
  it("keeps a podcast checklist to the cover and the description", () => {
    const view = toReleaseHealthView(
      [
        { key: "cover", isDone: true, isOptional: false },
        { key: "description", isDone: false, isOptional: false },
        { key: "creditsOnEveryTrack", isDone: false, isOptional: false },
        { key: "lyrics", isDone: false, isOptional: true },
      ],
      "podcast",
    );
    expect(view.items.map((item) => item.key)).toEqual([
      "cover",
      "description",
    ]);
  });
});

describe("toFollowerGrowthViews", () => {
  it("reads weeks at UTC midnight and marks the last one current", () => {
    const views = toFollowerGrowthViews([
      { weekStart: "2026-10-12", newFollowers: 3 },
      { weekStart: "2026-10-19", newFollowers: 9 },
    ]);
    expect(views[0]?.weekStart.toISOString()).toBe("2026-10-12T00:00:00.000Z");
    expect(views.map((week) => week.isCurrentWeek)).toEqual([false, true]);
    expect(views[0]?.newFollowers).toBe(3);
    expect(views[0]?.weekKey).toBe("2026-10-12");
  });
  it("reads a negative, fractional or missing count as a whole number from 0", () => {
    const views = toFollowerGrowthViews([
      { weekStart: "2026-10-05", newFollowers: -2 },
      { weekStart: "2026-10-12", newFollowers: 3.7 },
      { weekStart: "2026-10-19", newFollowers: Number.NaN },
    ]);
    expect(views.map((week) => week.newFollowers)).toEqual([0, 3, 0]);
  });
  it("drops a week it cannot read and reads a missing series as none", () => {
    expect(
      toFollowerGrowthViews([{ weekStart: "soon", newFollowers: 4 }]),
    ).toEqual([]);
    expect(toFollowerGrowthViews(undefined)).toEqual([]);
  });
});

describe("toNextReleaseView", () => {
  it("floors the reminder count and links the release", () => {
    const view = toNextReleaseView({
      releaseId: "r1",
      title: "Maré alta",
      publishAt: "2026-11-02T18:00:00.000Z",
      reminders: { value: 3, isBelowThreshold: false },
    });
    expect(view?.reminders).toEqual({ value: null, isBelowThreshold: true });
    expect(view?.href).toBe(studioReleasePath("r1"));
    expect(view?.publishAt.toISOString()).toBe("2026-11-02T18:00:00.000Z");
  });
  it("reads null, a missing field and an unreadable date as no next release", () => {
    const reminders = { value: 0, isBelowThreshold: false };
    expect(toNextReleaseView(null)).toBeNull();
    expect(toNextReleaseView(undefined)).toBeNull();
    expect(
      toNextReleaseView({
        releaseId: "r1",
        title: "x",
        publishAt: "later",
        reminders,
      }),
    ).toBeNull();
  });
});

describe("toDashboardStatsView", () => {
  it("keeps every Your numbers field and adds the dashboard ones", () => {
    const view = toDashboardStatsView(statsDto);
    expect(view.followerCount).toBe(statsDto.followerCount);
    expect(view.subprofileId).toBe(statsDto.subprofileId);
    expect(view.releases[0]?.saves).toEqual(
      toArtistStatsView(statsDto).releases[0]?.saves,
    );
    expect(view.releases[0]?.health.totalCount).toBe(2);
    expect(view.followerGrowth).toHaveLength(12);
    expect(view.nextRelease?.title).toBe("Maré alta");
  });
  it("renders a server that predates the dashboard fields as today", () => {
    const { followerGrowth: _growth, nextRelease: _next, ...older } = statsDto;
    const view = toDashboardStatsView({
      ...older,
      releases: older.releases.map(({ health: _health, ...row }) => row),
    });
    expect(view.followerGrowth).toEqual([]);
    expect(view.nextRelease).toBeNull();
    expect(view.releases[0]?.health.hasOpenItems).toBe(false);
  });
});

describe("placements", () => {
  it("shows at most five titles and counts the rest", () => {
    const view = toPlacementView({ ...placementDto, trackCount: 8 });
    expect(view.tracks).toHaveLength(5);
    expect(view.hiddenTrackCount).toBe(3);
    expect(view.tracks[0]?.href).toBe(
      studioTrackPath(placementDto.tracks[0]!.id),
    );
    expect(
      toPlacementView({ ...placementDto, trackCount: 2 }).hiddenTrackCount,
    ).toBe(0);
  });
  it("keeps millisecond precision on the last addition", () => {
    expect(
      toPlacementView({
        ...placementDto,
        latestAddedAt: "2026-10-20T08:15:30.123Z",
      }).latestAddedAt.getMilliseconds(),
    ).toBe(123);
  });
  it("turns the contract page into a Studio page", () => {
    expect(placementsPageOf({ items: [], nextCursor: "c2" }).pageInfo).toEqual({
      nextCursor: "c2",
      hasMore: true,
    });
    expect(placementsPageOf({ items: [], nextCursor: null }).pageInfo).toEqual({
      nextCursor: null,
      hasMore: false,
    });
  });
});

describe("milestones", () => {
  it("drops unknown kinds and unreadable dates", () => {
    const views = toMilestoneViews({
      items: [
        { ...followersMilestone, kind: "listeners" },
        { ...followersMilestone, reachedAt: "yesterday" },
        followersMilestone,
      ],
    });
    expect(views.map((view) => view.id)).toEqual([followersMilestone.id]);
  });
  it("keeps a track on track_plays only, and drops track_plays without one", () => {
    expect(
      toMilestoneView({
        ...followersMilestone,
        track: { id: "t1", title: "Cais" },
      })?.track,
    ).toBeNull();
    expect(
      toMilestoneView({
        ...followersMilestone,
        kind: "track_plays",
        track: null,
      }),
    ).toBeNull();
    expect(
      toMilestoneView({
        ...followersMilestone,
        kind: "track_plays",
        track: { id: "t1", title: "Cais" },
      })?.track,
    ).toEqual({ id: "t1", title: "Cais" });
  });
  it("calls a milestone new for seven days", () => {
    const milestone = toMilestoneView({
      ...followersMilestone,
      reachedAt: "2026-10-20T12:00:00.000Z",
    })!;
    expect(
      isRecentMilestone(milestone, new Date("2026-10-27T11:59:00.000Z")),
    ).toBe(true);
    expect(
      isRecentMilestone(milestone, new Date("2026-10-27T12:01:00.000Z")),
    ).toBe(false);
    expect(
      isRecentMilestone(milestone, new Date("2026-10-19T00:00:00.000Z")),
    ).toBe(true);
  });
  it("reads a card with an unknown kind as unavailable", () => {
    expect(
      toMilestoneCardView({
        milestone: { ...followersMilestone, kind: "listeners" },
        artist: artistRefDto,
      }),
    ).toBeNull();
    expect(
      toMilestoneCardView({
        milestone: followersMilestone,
        artist: artistRefDto,
      })?.artist.name,
    ).toBe(artistRefDto.name);
  });
});

/** Every release and track row of `dto` carrying the given plays, on both
 *  the all-time and the 28-day count. */
function withPlays(
  dto: StudioArtistStatsDTO,
  plays: { release: StudioCountDTO; track: StudioCountDTO },
): StudioArtistStatsDTO {
  return {
    ...dto,
    releases: dto.releases.map((row) => ({
      ...row,
      plays: plays.release,
      plays28d: plays.release,
      tracks: row.tracks.map((trackRow) => ({
        ...trackRow,
        plays: plays.track,
        plays28d: plays.track,
      })),
    })),
  };
}

describe("plays on the stats", () => {
  it("carries floored plays on each release and track", () => {
    const view = toDashboardStatsView(
      withPlays(statsDto, {
        release: { value: 3, isBelowThreshold: false },
        track: { value: 40, isBelowThreshold: false },
      }),
    );
    expect(view.hasPlays).toBe(true);
    expect(view.releases[0]?.plays).toEqual({
      value: null,
      isBelowThreshold: true,
    });
    expect(view.releases[0]?.tracks[0]?.plays).toEqual({
      value: 40,
      isBelowThreshold: false,
    });
  });
  it("reads a server that predates plays as no plays", () => {
    const view = toDashboardStatsView(statsDto);
    expect(view.hasPlays).toBe(false);
    expect(view.releases[0]?.plays).toEqual({
      value: 0,
      isBelowThreshold: false,
    });
  });
  it("mounts the plays surfaces for a persona with no releases", () => {
    expect(toDashboardStatsView({ ...statsDto, releases: [] }).hasPlays).toBe(
      true,
    );
  });
});
