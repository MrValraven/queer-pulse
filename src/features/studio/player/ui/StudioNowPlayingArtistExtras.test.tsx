import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { toArtistView, type StudioArtistView } from "../../api/studio.adapters";
import type { StudioSceneEventView } from "../../api/studioDiscovery.adapters";
import type { StudioNowPlayingArtistState } from "../useStudioNowPlayingArtist";
import { StudioNowPlayingArtistExtras } from "./StudioNowPlayingArtistExtras";
import { queueItem } from "./studioPlayerTestHarness";

const eventsHolder: {
  events: StudioSceneEventView[];
  requestedIds: string[];
} = { events: [], requestedIds: [] };

vi.mock("../../api/useStudioArtistEvents", () => ({
  useStudioArtistEvents: (subprofileId: string) => {
    eventsHolder.requestedIds.push(subprofileId);
    return subprofileId === "" ? [] : eventsHolder.events;
  },
}));

function eventView(index: number): StudioSceneEventView {
  return {
    slug: `event-${index}`,
    title: `River night ${index}`,
    startAt: `2026-11-0${index}T21:00:00.000Z`,
    endAt: null,
    timezone: "Europe/Lisbon",
    isOnline: false,
    coverImageUrl: null,
    placeName: "Porto",
    href: `/events/event-${index}`,
  };
}

const artistRef = {
  id: "p1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};

function releaseCard(id: string, type: "album" | "single" = "album") {
  return {
    id,
    title: `Release ${id}`,
    type,
    coverUrl: null,
    releasedOn: "2025-03-01",
    trackCount: 1,
    totalDurationSeconds: 60,
    artist: artistRef,
    publishedAt: "2025-03-01T10:00:00.000Z",
    genre: null,
    genres: [],
    mood: null,
    scene: null,
  };
}

function artistView(
  overrides: Partial<StudioArtistView> = {},
  releaseIds: string[] = [],
): StudioArtistView {
  return {
    ...toArtistView({
      artist: {
        ...artistRef,
        bio: null,
        city: null,
        coverUrl: null,
        studioHero: null,
      },
      releases: releaseIds.map((id) => releaseCard(id)),
      ownerReleases: null,
      followerCount: 0,
      isFollowing: false,
      playlists: [],
    }),
    ...overrides,
  };
}

const SUPPORT_LINKS = [
  {
    platform: "bandcamp",
    platformLabel: "Bandcamp",
    handleLabel: "nightform",
    href: "https://nightform.bandcamp.com",
  },
];

function renderExtras(artistState: StudioNowPlayingArtistState) {
  return render(
    <TestProviders>
      <StudioNowPlayingArtistExtras
        item={queueItem({ artistId: "p1", releaseId: "r-playing" })}
        artistState={artistState}
      />
    </TestProviders>,
  );
}

beforeEach(() => {
  eventsHolder.events = [];
  eventsHolder.requestedIds = [];
});

describe("StudioNowPlayingArtistExtras", () => {
  it("shows up to two events with See all to the artist page", () => {
    eventsHolder.events = [1, 2, 3, 4].map(eventView);
    const artist = artistView();
    renderExtras({ status: "ready", artist });
    expect(screen.getByText("River night 1")).toBeInTheDocument();
    expect(screen.getByText("River night 2")).toBeInTheDocument();
    expect(screen.queryByText("River night 3")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See all events with NIGHTFORM" }),
    ).toHaveAttribute("href", artist.artist.href);
  });

  it("heads each section with plain text and its action in the same row", () => {
    eventsHolder.events = [1].map(eventView);
    renderExtras({
      status: "ready",
      artist: artistView({ supportLinks: SUPPORT_LINKS }, ["r2"]),
    });
    const eventsHeading = screen.getByRole("heading", {
      level: 3,
      name: "Upcoming events",
    });
    const moreHeading = screen.getByRole("heading", {
      level: 3,
      name: "More from NIGHTFORM",
    });
    for (const heading of [eventsHeading, moreHeading]) {
      expect(heading.querySelector("em")).toBeNull();
    }
    expect(
      within(eventsHeading.parentElement as HTMLElement).getByRole("link", {
        name: "See all events with NIGHTFORM",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 4, name: "River night 1" }),
    ).toBeInTheDocument();
  });

  it("folds the events section when there are none", () => {
    renderExtras({ status: "ready", artist: artistView() });
    expect(
      screen.queryByRole("link", { name: /see all events/i }),
    ).not.toBeInTheDocument();
  });

  it("lists the support links under Support {name}", () => {
    renderExtras({
      status: "ready",
      artist: artistView({ supportLinks: SUPPORT_LINKS }),
    });
    expect(
      screen.getByRole("heading", { name: "Support NIGHTFORM" }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", {
      name: "Where to support NIGHTFORM",
    });
    expect(within(list).getByText("Bandcamp")).toBeInTheDocument();
  });

  it("folds support when the artist has no links, owner included", () => {
    renderExtras({
      status: "ready",
      artist: artistView({ isOwner: true, ownerReleases: [] }),
    });
    expect(
      screen.queryByRole("heading", { name: "Support NIGHTFORM" }),
    ).not.toBeInTheDocument();
  });

  it("shows up to four other releases and leaves out the one playing", () => {
    renderExtras({
      status: "ready",
      artist: artistView({}, ["r-playing", "r2", "r3", "r4", "r5", "r6"]),
    });
    const heading = screen.getByRole("heading", { name: /more from/i });
    expect(heading).toBeInTheDocument();
    const rows = screen.getAllByRole("link", { name: /^Release r/ });
    expect(rows).toHaveLength(4);
    expect(screen.queryByText("Release r-playing")).not.toBeInTheDocument();
    expect(rows[0]).toHaveTextContent("Album · 2025");
  });

  it("renders nothing until the artist is ready", () => {
    eventsHolder.events = [1, 2].map(eventView);
    renderExtras({ status: "loading", artist: null });
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(eventsHolder.requestedIds.every((id) => id === "")).toBe(true);
  });
});
