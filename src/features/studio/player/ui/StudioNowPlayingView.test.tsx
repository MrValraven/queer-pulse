import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toArtistView, type StudioArtistView } from "../../api/studio.adapters";
import type { StudioLoadState } from "../../api/studioLoadState";
import type { StudioSceneEventView } from "../../api/studioDiscovery.adapters";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import type { StudioNowPlayingArtistState } from "../useStudioNowPlayingArtist";
import { StudioNowPlayingView } from "./StudioNowPlayingView";
import {
  createStudioPlayerValue,
  queueItem,
  queueView,
  renderWithPlayer,
  trackFixture,
} from "./studioPlayerTestHarness";

/** What the artist hook answers for the playing item. */
const artistHolder = vi.hoisted(() => {
  const holder: { state: StudioNowPlayingArtistState } = {
    state: { status: "loading", artist: null },
  };
  return holder;
});
vi.mock("../useStudioNowPlayingArtist", () => ({
  useStudioNowPlayingArtist: () => artistHolder.state,
}));

/** The track's detail, with one credit, for the header and Credits. */
vi.mock("../../api/useStudioTrack", () => ({
  useStudioTrack: () => {
    const loadState: StudioLoadState = {
      isLoading: false,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      retry: () => undefined,
    };
    return { track: trackFixture(), loadState };
  },
}));

const EVENT: StudioSceneEventView = {
  slug: "river-night",
  title: "River night",
  startAt: "2026-11-01T21:00:00.000Z",
  endAt: null,
  timezone: "Europe/Lisbon",
  isOnline: false,
  coverImageUrl: null,
  placeName: "Porto",
  href: "/events/river-night",
};
vi.mock("../../api/useStudioArtistEvents", () => ({
  useStudioArtistEvents: (artistId: string) => (artistId ? [EVENT] : []),
}));

const ARTIST_REF = {
  id: "p1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};

/** NIGHTFORM with one other release and a Bandcamp link. */
function artistView(): StudioArtistView {
  return {
    ...toArtistView({
      artist: {
        ...ARTIST_REF,
        bio: null,
        city: null,
        coverUrl: null,
        studioHero: null,
      },
      releases: [
        {
          id: "r2",
          title: "Low tide",
          type: "album",
          coverUrl: null,
          releasedOn: "2025-03-01",
          trackCount: 1,
          totalDurationSeconds: 60,
          artist: ARTIST_REF,
          publishedAt: "2025-03-01T10:00:00.000Z",
          genre: null,
          mood: null,
          scene: null,
        },
      ],
      ownerReleases: null,
      followerCount: 0,
      isFollowing: false,
      playlists: [],
    }),
    supportLinks: [
      {
        platform: "bandcamp",
        platformLabel: "Bandcamp",
        handleLabel: "nightform",
        href: "https://nightform.bandcamp.com",
      },
    ],
  };
}

const NEXT_ITEM = queueItem({ trackId: "t9", title: "Harbour" });

/** The view for whatever is playing, as the side panel mounts it. */
function ViewOfCurrent({ onOpenQueue }: { onOpenQueue: () => void }) {
  const { currentItem } = useStudioPlayer();
  return currentItem ? (
    <StudioNowPlayingView item={currentItem} onOpenQueue={onOpenQueue} />
  ) : null;
}

function playerPlaying(current: StudioQueueItem) {
  return createStudioPlayerValue({
    currentItem: current,
    queue: queueView({ current, userItems: [NEXT_ITEM] }),
  });
}

function renderView(current: StudioQueueItem = queueItem()) {
  const onOpenQueue = vi.fn();
  const rendered = renderWithPlayer(
    <ViewOfCurrent onOpenQueue={onOpenQueue} />,
    { player: playerPlaying(current) },
  );
  return { ...rendered, onOpenQueue };
}

function sectionHeadings(): string[] {
  return screen
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent ?? "");
}

beforeEach(() => {
  artistHolder.state = { status: "ready", artist: artistView() };
});

describe("StudioNowPlayingView", () => {
  it("orders track, About, Credits, Next in queue, events, support and more releases", () => {
    renderView();
    const expected = [
      "About the artist",
      "Credits",
      "Next in queue",
      "Upcoming events",
      "Support NIGHTFORM",
      "More from NIGHTFORM",
    ];
    const headings = sectionHeadings();
    const positions = expected.map((name) => headings.indexOf(name));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    const trackTitle = screen.getByRole("link", { name: "Tide" });
    const about = screen.getByRole("heading", { name: "About the artist" });
    expect(
      trackTitle.compareDocumentPosition(about) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("titles the events in the panel one level under their section", () => {
    renderView();
    expect(
      screen.getByRole("heading", { level: 4, name: "River night" }),
    ).toBeInTheDocument();
  });

  it("leaves Credits out for a private preview", () => {
    renderView(queueItem({ previewToken: "pv-1" }));
    expect(screen.queryByRole("heading", { name: "Credits" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Next in queue" }),
    ).toBeInTheDocument();
  });

  it("keeps every other section when the artist read fails", () => {
    artistHolder.state = { status: "failed", artist: null };
    renderView();
    expect(
      screen.queryByRole("heading", { name: "About the artist" }),
    ).toBeNull();
    expect(screen.queryByText("Loading the artist")).toBeNull();
    expect(screen.getByRole("link", { name: "Tide" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Next in queue" }),
    ).toBeInTheDocument();
  });

  it("crossfades to the new track when the track changes", async () => {
    const { rerenderWith } = renderView();
    expect(screen.getByRole("link", { name: "Tide" })).toBeInTheDocument();
    const nextTrack = queueItem({ trackId: "t2", title: "Pier" });
    rerenderWith({ player: playerPlaying(nextTrack) });
    expect(
      await screen.findByRole("link", { name: "Pier" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Tide" })).toBeNull(),
    );
  });

  it("switches to the queue from Open queue", () => {
    const { onOpenQueue } = renderView();
    fireEvent.click(screen.getByRole("button", { name: "Open queue" }));
    expect(onOpenQueue).toHaveBeenCalledTimes(1);
  });
});
