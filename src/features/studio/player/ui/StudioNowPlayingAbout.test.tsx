import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { toArtistView, type StudioArtistView } from "../../api/studio.adapters";
import { DEMO_ARTIST_MARIANA } from "../../api/studioDemoMe.data";
import type { StudioNowPlayingArtistState } from "../useStudioNowPlayingArtist";
import { StudioNowPlayingAbout } from "./StudioNowPlayingAbout";
import { queueItem } from "./studioPlayerTestHarness";

// The live Follow (SubprofileFollow) is the one under test here.
vi.mock("../../useStudioShowcase", () => ({ useStudioShowcase: () => false }));

const BIO = "Late-night synths from the river\nSecond line\nThird line\nFourth";

function artistView(
  overrides: {
    id?: string;
    coverUrl?: string | null;
    kind?: "musician" | "podcaster";
  } = {},
): StudioArtistView {
  return toArtistView({
    artist: {
      id: overrides.id ?? "p1",
      handle: "nightform",
      name: "NIGHTFORM",
      kind: overrides.kind ?? "musician",
      avatarUrl: "/files/avatar-nightform.jpg",
      bio: BIO,
      city: "Porto",
      coverUrl:
        overrides.coverUrl === undefined
          ? "/files/cover-nightform.jpg"
          : overrides.coverUrl,
      studioHero: null,
    },
    releases: [],
    ownerReleases: null,
    followerCount: 12,
    isFollowing: false,
    playlists: [],
  });
}

function aboutTree(
  artistState: StudioNowPlayingArtistState,
  isEpisode = false,
) {
  return (
    <TestProviders>
      <StudioNowPlayingAbout
        item={queueItem({ artistId: "p1", isEpisode })}
        artistState={artistState}
      />
    </TestProviders>
  );
}

function renderAbout(
  artistState: StudioNowPlayingArtistState,
  isEpisode = false,
) {
  return render(aboutTree(artistState, isEpisode));
}

const LOADING: StudioNowPlayingArtistState = {
  status: "loading",
  artist: null,
};

describe("StudioNowPlayingAbout", () => {
  it("shows the cover photo, name, kind, city, followers, bio and Open artist page", () => {
    const artist = artistView();
    const { container } = renderAbout({ status: "ready", artist });
    expect(
      screen.getByRole("heading", { name: "About the artist" }),
    ).toBeInTheDocument();
    expect(screen.getByText("NIGHTFORM")).toBeInTheDocument();
    expect(screen.getByText("Musician · Porto")).toBeInTheDocument();
    expect(screen.getByText("12 followers")).toBeInTheDocument();
    expect(screen.getByText(/Late-night synths/)).toBeInTheDocument();
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/files/cover-nightform.jpg",
    );
    expect(
      screen.getByRole("link", { name: "Open artist page" }),
    ).toHaveAttribute("href", artist.artist.href);
    expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
  });

  it("uses the avatar when the persona has no cover photo", () => {
    const { container } = renderAbout({
      status: "ready",
      artist: artistView({ coverUrl: null }),
    });
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/files/avatar-nightform.jpg",
    );
  });

  it("clamps the bio to three lines with Read more", () => {
    renderAbout({ status: "ready", artist: artistView() });
    const bio = screen.getByText(/Late-night synths/);
    expect(bio.style.getPropertyValue("--expandable-text-lines")).toBe("3");
    expect(bio).toHaveAttribute("data-clamped");
  });

  it("hides Follow on the member's own persona", () => {
    renderAbout({
      status: "ready",
      artist: { ...artistView(), isOwner: true, ownerReleases: [] },
    });
    expect(
      screen.queryByRole("button", { name: /follow/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("NIGHTFORM")).toBeInTheDocument();
  });

  it("hides Follow on a persona the member uploads for", () => {
    renderAbout({
      status: "ready",
      artist: artistView({ id: DEMO_ARTIST_MARIANA.id }),
    });
    expect(
      screen.queryByRole("button", { name: /follow/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("NIGHTFORM")).toBeInTheDocument();
  });

  it("labels an episode's card About the show with Open show page", () => {
    renderAbout(
      { status: "ready", artist: artistView({ kind: "podcaster" }) },
      true,
    );
    expect(
      screen.getByRole("heading", { name: "About the show" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open show page" }),
    ).toBeInTheDocument();
  });

  it("shows the eyebrow as the card's heading", () => {
    renderAbout({ status: "ready", artist: artistView() });
    const eyebrow = screen.getByRole("heading", { name: "About the artist" });
    expect(eyebrow.tagName).toBe("H3");
    expect(eyebrow.querySelector("em")).toBeNull();
  });

  it("keeps a skeleton of the card's height while the artist loads", () => {
    const { container } = renderAbout(LOADING);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).not.toBeNull();
    // Four text lines, three bio lines, Read more and the two action pills.
    expect(skeleton?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(10);
    expect(
      skeleton?.querySelectorAll('[data-skeleton-bio] [aria-hidden="true"]'),
    ).toHaveLength(3);
    expect(
      skeleton?.querySelector('[data-skeleton-read-more] [aria-hidden="true"]'),
    ).not.toBeNull();
    expect(screen.getByText("Loading the artist")).toHaveClass(
      "visuallyHidden",
    );
    expect(
      screen.queryByRole("heading", { name: "About the artist" }),
    ).not.toBeInTheDocument();
  });

  it("folds away on a failed read", () => {
    const { container } = renderAbout({ status: "failed", artist: null });
    expect(
      screen.queryByRole("heading", { name: "About the artist" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
  });
});
