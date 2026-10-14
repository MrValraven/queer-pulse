import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_DEFAULT_PLAYLIST_ID } from "../studioCollection.data";
import type { StudioArtistView } from "./studio.adapters";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { resetDemoPlaylists } from "./studioDemoPlaylists";
import { studioKeys } from "./studioQueryKeys";
import { patchStudioArtistFollow } from "./useStudioArtist";
import { useStudioArtistStats } from "./useStudioArtistStats";
import { useStudioFollowedArtists } from "./useStudioFollowedArtists";
import { useStudioGenres } from "./useStudioGenres";
import {
  resetStudioLibrarySeedForTests,
  useStudioLibrarySaves,
} from "./useStudioLibrarySaves";
import { useStudioMyPlaylists } from "./useStudioMyPlaylists";
import { useStudioPlaylist } from "./useStudioPlaylist";
import { useStudioTrackPlaylists } from "./useStudioTrackPlaylists";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

beforeEach(() => {
  resetDemoPlaylists();
  resetStudioLibrarySeedForTests();
});

describe("Studio v2 read hooks (demo)", () => {
  it("lists the genres that have releases", async () => {
    const { result } = renderHook(() => useStudioGenres(), { wrapper });
    await waitFor(() =>
      expect(result.current.genres).toEqual([
        "fado",
        "electronic",
        "folk",
        "spoken-word",
      ]),
    );
  });

  it("opens the demo's default playlist from an id-less link", async () => {
    const { result } = renderHook(() => useStudioPlaylist(null), { wrapper });
    await waitFor(() =>
      expect(result.current.playlist?.id).toBe(DEMO_DEFAULT_PLAYLIST_ID),
    );
  });

  it("answers an unseen playlist with the not-found state", async () => {
    const { result } = renderHook(
      () => useStudioPlaylist("someone-elses-private"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.loadState.isNotFound).toBe(true));
  });

  it("lists only the member's own playlists", async () => {
    const { result } = renderHook(() => useStudioMyPlaylists(), { wrapper });
    await waitFor(() =>
      expect(result.current.playlists.length).toBeGreaterThan(0),
    );
    expect(result.current.playlists.every((card) => card.isOwner)).toBe(true);
  });

  it("lists public playlists holding a track", async () => {
    const { result } = renderHook(
      () => useStudioTrackPlaylists("demo-track-home-2-01"),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.playlists.length).toBeGreaterThan(0),
    );
    expect(
      result.current.playlists.every((card) => card.visibility === null),
    ).toBe(true);
  });

  it("reads stats for the owner's persona and 404s for anyone else's", async () => {
    const owned = renderHook(
      () => useStudioArtistStats(DEMO_ARTIST_MARIANA.id),
      { wrapper },
    );
    await waitFor(() =>
      expect(owned.result.current.stats?.releases.length).toBeGreaterThan(0),
    );
    const other = renderHook(() => useStudioArtistStats("sp-diogo-nightform"), {
      wrapper,
    });
    await waitFor(() =>
      expect(other.result.current.loadState.isNotFound).toBe(true),
    );
  });

  it("keeps only musicians and DJs among followed personas", async () => {
    const { result } = renderHook(() => useStudioFollowedArtists(), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.artists.map((artist) => artist.name)).toContain(
        "NIGHTFORM",
      ),
    );
    expect(
      result.current.artists.every(
        (artist) => artist.kind === "musician" || artist.kind === "dj",
      ),
    ).toBe(true);
  });

  it("seeds the demo library into Saved and returns only the asked kind", () => {
    const { result } = renderHook(
      () => useStudioLibrarySaves("studio_release"),
      { wrapper },
    );
    expect(result.current.map((item) => item.title)).toContain(
      "Cidade dos santos",
    );
    expect(result.current.every((item) => item.kind === "studio_release")).toBe(
      true,
    );
  });

  it("clears older seed flags and reseeds the current fixture", () => {
    window.localStorage.setItem("qp-demo-studio-library-seeded", "1");
    window.localStorage.setItem("qp.demo.studioLibrarySeeded.v1", "1");
    window.localStorage.setItem("qp.demo.studioLibrarySeeded.v2", "1");
    const { result } = renderHook(
      () => useStudioLibrarySaves("studio_release"),
      { wrapper },
    );
    expect(result.current.map((item) => item.title)).toContain(
      "Cidade dos santos",
    );
    expect(
      window.localStorage.getItem("qp-demo-studio-library-seeded"),
    ).toBeNull();
    expect(
      window.localStorage.getItem("qp.demo.studioLibrarySeeded.v1"),
    ).toBeNull();
    expect(
      window.localStorage.getItem("qp.demo.studioLibrarySeeded.v2"),
    ).toBeNull();
    expect(window.localStorage.getItem("qp.demo.studioLibrarySeeded.v3")).toBe(
      "1",
    );
  });

  it("seeds the demo liked songs, the withdrawn one included", () => {
    const { result } = renderHook(() => useStudioLibrarySaves("studio_track"), {
      wrapper,
    });
    expect(result.current.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "studio_track:demo-track-home-1-01",
        "studio_track:demo-track-withdrawn-01",
      ]),
    );
    expect(
      result.current.find(
        (item) => item.id === "studio_track:demo-track-withdrawn-01",
      ),
    ).toMatchObject({
      availability: "unavailable",
      unavailableReason: "withdrawn",
    });
  });
});

describe("patchStudioArtistFollow", () => {
  it("writes the follow result into the cached artist view", () => {
    const queryClient = new QueryClient();
    const key = studioKeys.artist(true, "sp-1");
    queryClient.setQueryData(key, {
      followerCount: 4,
      isFollowing: false,
    });
    patchStudioArtistFollow(queryClient, true, "sp-1", {
      followerCount: 5,
      viewerFollowing: true,
    });
    expect(queryClient.getQueryData<StudioArtistView>(key)).toMatchObject({
      followerCount: 5,
      isFollowing: true,
    });
  });
});
