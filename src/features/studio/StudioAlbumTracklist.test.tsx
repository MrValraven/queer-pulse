import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toReleaseView } from "./api/studio.adapters";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { StudioAlbumTracklist } from "./StudioAlbumTracklist";

const playback = vi.hoisted(() => ({ hideExplicit: false }));
vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => playback.hideExplicit,
}));

const release = toReleaseView({
  id: "r1",
  title: "Salt water",
  type: "ep",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 3,
  totalDurationSeconds: 400,
  artist: {
    id: "p1",
    handle: "nightform",
    name: "NIGHTFORM",
    kind: "musician",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  mood: null,
  scene: null,
  status: "published",
  publishedAt: null,
  tracks: [
    {
      id: "t1",
      position: 1,
      title: "Tide",
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
    },
    {
      id: "t2",
      position: 2,
      title: "Pier",
      durationSeconds: 200,
      isExplicit: true,
      hasAudio: true,
    },
    {
      id: "t3",
      position: 3,
      title: "Pending",
      durationSeconds: null,
      isExplicit: false,
      hasAudio: false,
    },
  ],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
});

function renderTracklist(
  overrides: Partial<StudioPlayerValue> = {},
  tracklistRelease = release,
) {
  const value: StudioPlayerValue = {
    ...createStudioPlayerTestValue(),
    status: "idle",
    radio: null,
    currentItem: null,
    hasPrevious: false,
    hasNext: false,
    playRelease: vi.fn(() => Promise.resolve()),
    playReleases: vi.fn(() => Promise.resolve()),
    playTracks: vi.fn(() => Promise.resolve()),
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn(),
    retry: vi.fn(),
    stop: vi.fn(),
    isCurrentRelease: () => false,
    isCurrentTrack: () => false,
    ...overrides,
  };
  render(
    <TestProviders>
      <StudioPlayerContext.Provider value={value}>
        <StudioAlbumTracklist release={tracklistRelease} />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return value;
}

describe("StudioAlbumTracklist", () => {
  it("plays the row that was pressed, inside its release", async () => {
    const value = renderTracklist();
    fireEvent.click(await screen.findByRole("button", { name: /play pier/i }));
    expect(value.playRelease).toHaveBeenCalledWith("r1", "t2");
  });

  it("marks the playing row with aria-current and pauses it in place", async () => {
    const value = renderTracklist({
      status: "playing",
      isCurrentTrack: (trackId) => trackId === "t1",
      isCurrentRelease: () => true,
    });
    const rows = await screen.findAllByRole("listitem");
    expect(rows[0]).toHaveAttribute("aria-current", "true");
    expect(rows[1]).not.toHaveAttribute("aria-current");
    fireEvent.click(
      within(rows[0]!).getByRole("button", { name: /pause tide/i }),
    );
    expect(value.togglePlay).toHaveBeenCalled();
    expect(value.playRelease).not.toHaveBeenCalled();
  });

  it("links each title to its track page and holds back a track still processing", async () => {
    renderTracklist();
    expect(await screen.findByRole("link", { name: "Tide" })).toHaveAttribute(
      "href",
      "/studio/track?id=t1",
    );
    expect(
      screen.getByRole("button", { name: /play pending/i }),
    ).toHaveAttribute("aria-disabled", "true");
  });
});

describe("StudioAlbumTracklist: add to playlist", () => {
  it("offers Add to playlist on each row of a published release, disabled when there is no audio", () => {
    renderTracklist();
    expect(
      screen.getByRole("button", { name: "Add Tide to a playlist" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Pending to a playlist" }),
    ).toHaveAttribute("aria-disabled", "true");
  });
});

describe("StudioAlbumTracklist: like", () => {
  it("offers a heart on each playable row of a published release", () => {
    renderTracklist();
    const heart = screen.getByRole("button", { name: "Like Tide" });
    expect(heart).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Like Pier" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Like Pending" })).toBeNull();
  });

  it("leaves the heart off a preview read through its private link", () => {
    renderTracklist({}, { ...release, isPreview: true });
    expect(screen.queryByRole("button", { name: /^like /i })).toBeNull();
  });
});

describe("StudioAlbumTracklist: hidden explicit tracks", () => {
  afterEach(() => {
    playback.hideExplicit = false;
  });

  it("greys an explicit track with no play button while it is hidden", async () => {
    playback.hideExplicit = true;
    renderTracklist();
    expect(
      await screen.findByText("Hidden by your settings"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /play pier/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /play tide/i }),
    ).toBeInTheDocument();
  });

  it("brings the play button back when the setting is off", async () => {
    renderTracklist();
    expect(
      await screen.findByRole("button", { name: /play pier/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Hidden by your settings"),
    ).not.toBeInTheDocument();
  });
});
