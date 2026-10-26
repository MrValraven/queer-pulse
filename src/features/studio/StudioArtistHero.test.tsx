import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toArtistView, type StudioArtistView } from "./api/studio.adapters";
import { studioKeys } from "./api/studioQueryKeys";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { StudioArtistHero } from "./StudioArtistHero";

vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));

const artistRef = {
  id: "sp-diogo-nightform",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};
const card = (
  id: string,
  type: "single" | "album",
  releasedOn: string,
  publishedAt: string,
) => ({
  id,
  title: id,
  type,
  coverUrl: null,
  releasedOn,
  trackCount: 1,
  totalDurationSeconds: 60,
  artist: artistRef,
  publishedAt,
  genre: null,
  mood: null,
  scene: null,
});

// Published newest first by the server; the member-entered dates disagree.
const artist = toArtistView({
  artist: {
    ...artistRef,
    bio: null,
    city: null,
    coverUrl: null,
    studioHero: null,
  },
  releases: [
    card("r-newest-single", "single", "2019-01-01", "2026-10-01T10:00:00.000Z"),
    card("r-older-album", "album", "2026-09-30", "2026-05-01T10:00:00.000Z"),
  ],
  ownerReleases: null,
  followerCount: 4,
  isFollowing: false,
  playlists: [],
});

function renderHero(view: StudioArtistView, queryClient = new QueryClient()) {
  const playReleases = vi.fn(() => Promise.resolve());
  const player = {
    ...createStudioPlayerTestValue(),
    status: "idle",
    radio: null,
    currentItem: null,
    hasPrevious: false,
    hasNext: false,
    playRelease: vi.fn(() => Promise.resolve()),
    playReleases,
    playTracks: vi.fn(() => Promise.resolve()),
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn(),
    retry: vi.fn(),
    stop: vi.fn(),
    isCurrentRelease: () => false,
    isCurrentTrack: () => false,
  } satisfies StudioPlayerValue;
  render(
    <TestProviders queryClient={queryClient}>
      <StudioPlayerContext.Provider value={player}>
        <StudioArtistHero artist={view} onTip={vi.fn()} />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return { playReleases };
}

describe("StudioArtistHero", () => {
  it("plays every release in the server's order", () => {
    const { playReleases } = renderHero(artist);
    fireEvent.click(screen.getByRole("button", { name: /play all/i }));
    expect(playReleases).toHaveBeenCalledWith([
      "r-newest-single",
      "r-older-album",
    ]);
  });

  it("shows the follower count and follows for real, updating the cached artist", async () => {
    const queryClient = new QueryClient();
    const key = studioKeys.artist(true, artist.artist.id);
    queryClient.setQueryData(key, artist);
    renderHero(artist, queryClient);
    expect(screen.getByText(/4 followers/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /follow/i }));
    await waitFor(() =>
      expect(queryClient.getQueryData<StudioArtistView>(key)?.isFollowing).toBe(
        true,
      ),
    );
  });

  it("invalidates the library's followed artists after a follow", async () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    renderHero(artist, queryClient);
    fireEvent.click(screen.getByRole("button", { name: /follow/i }));
    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: studioKeys.followedArtists(true),
      }),
    );
  });

  it("offers no Follow to the persona's owner", () => {
    renderHero({ ...artist, isOwner: true, ownerReleases: [] });
    expect(
      screen.queryByRole("button", { name: /^follow/i }),
    ).not.toBeInTheDocument();
  });
});
