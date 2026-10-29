import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioLoadState } from "../api/studioLoadState";
import {
  toPlaylistView,
  type StudioPlaylistView,
  type StudioReleaseView,
  type StudioTrackView,
} from "../api/studio.adapters";
import type { StudioPlaylistDTO } from "../api/studio.types";
import {
  createStudioPlayerValue,
  queueItem,
  releaseViewFixture,
  renderWithPlayer,
  trackFixture,
} from "../player/ui/studioPlayerTestHarness";
import { StudioShareCard } from "./StudioShareCard";

function loadState(overrides: Partial<StudioLoadState> = {}): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    retry: () => {},
    ...overrides,
  };
}

const mocks = vi.hoisted(() => ({
  access: {
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [] as unknown[],
  },
  hideExplicit: false,
  track: null as StudioTrackView | null,
  trackState: null as StudioLoadState | null,
  release: null as StudioReleaseView | null,
  releaseState: null as StudioLoadState | null,
  playlist: null as StudioPlaylistView | null,
  playlistState: null as StudioLoadState | null,
  useStudioTrack: vi.fn(),
}));

vi.mock("../api/useStudioAccess", () => ({
  useStudioAccess: () => mocks.access,
}));
vi.mock("../api/useStudioPlaybackPreferences", () => ({
  useStudioHideExplicit: () => mocks.hideExplicit,
}));
vi.mock("../api/useStudioTrack", () => ({
  useStudioTrack: (id: string) => {
    mocks.useStudioTrack(id);
    return { track: mocks.track, loadState: mocks.trackState };
  },
}));
vi.mock("../api/useStudioRelease", () => ({
  useStudioRelease: () => ({
    release: mocks.release,
    loadState: mocks.releaseState,
  }),
}));
vi.mock("../api/useStudioPlaylist", () => ({
  useStudioPlaylist: () => ({
    playlist: mocks.playlist,
    loadState: mocks.playlistState,
  }),
}));

const PLAYLIST_RELEASE = {
  id: "r1",
  title: "Salt water",
  type: "ep" as const,
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 2,
  totalDurationSeconds: 400,
  artist: {
    id: "p1",
    handle: "nightform",
    name: "NIGHTFORM",
    kind: "musician" as const,
    avatarUrl: null,
  },
  genre: null,
  genres: [],
  publishedAt: "2026-04-12T10:00:00.000Z",
  mood: null,
  scene: null,
};

/** "Kitchen tapes" by Tiago: Tide then Pier, both playable. */
function playlistFixture(
  overrides: Partial<StudioPlaylistDTO> = {},
): StudioPlaylistView {
  const entry = (trackId: string, position: number, title: string) => ({
    entryId: `e${position}`,
    position,
    addedAt: "2026-10-01T10:00:00.000Z",
    isAvailable: true,
    track: {
      id: trackId,
      position,
      title,
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
      release: PLAYLIST_RELEASE,
    },
  });
  return toPlaylistView({
    id: "pl1",
    name: "Kitchen tapes",
    credit: {
      persona: null,
      member: {
        id: "m1",
        slug: "tiago",
        displayName: "Tiago",
        avatarUrl: null,
      },
    },
    coverUrls: [],
    trackCount: 2,
    totalDurationSeconds: 400,
    updatedAt: "2026-10-10T10:00:00.000Z",
    isOwner: false,
    visibility: "public",
    description: null,
    creditSubprofileId: null,
    entries: [entry("t1", 1, "Tide"), entry("t2", 2, "Pier")],
    ...overrides,
  });
}

const TRACK_TARGET = { kind: "track" as const, id: "t1", startAtSeconds: 83 };
const RELEASE_TARGET = {
  kind: "release" as const,
  id: "r1",
  startAtSeconds: null,
};
const PLAYLIST_TARGET = {
  kind: "playlist" as const,
  id: "pl1",
  startAtSeconds: null,
};

beforeEach(() => {
  mocks.access = {
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [],
  };
  mocks.hideExplicit = false;
  mocks.track = trackFixture();
  mocks.trackState = loadState();
  mocks.release = releaseViewFixture();
  mocks.releaseState = loadState();
  mocks.playlist = playlistFixture();
  mocks.playlistState = loadState();
  mocks.useStudioTrack.mockClear();
});

describe("StudioShareCard", () => {
  it("shows the teaser without a grant and reads nothing", async () => {
    mocks.access = {
      status: "denied",
      hasAccess: false,
      isPending: false,
      uploadablePersonas: [],
    };
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />);
    expect(
      await screen.findByText(/From QueerPulse Studio/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Tide")).toBeNull();
    expect(screen.queryByRole("button", { name: /Play/ })).toBeNull();
    expect(mocks.useStudioTrack).not.toHaveBeenCalled();
  });

  it("says a withdrawn release was withdrawn and nothing more", async () => {
    mocks.track = null;
    mocks.trackState = loadState({ isWithdrawn: true });
    const view = renderWithPlayer(
      <StudioShareCard target={TRACK_TARGET} surface="chat" />,
    );
    expect(
      await screen.findByText("This release was withdrawn"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(view.container.querySelector("img")).toBeNull();
  });

  it("says Not available for a 404", async () => {
    mocks.track = null;
    mocks.trackState = loadState({ isNotFound: true });
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />);
    expect(await screen.findByText("Not available")).toBeInTheDocument();
  });

  it("plays inside the click without leaving the chat", async () => {
    const player = createStudioPlayerValue({ currentItem: null });
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />, {
      player,
    });
    const playButton = await screen.findByRole("button", { name: "Play Tide" });
    const link = screen.getByRole("link", { name: "Open Tide in Studio" });
    expect(link.contains(playButton)).toBe(false);
    expect(link).toHaveAttribute("href", "/studio/track?id=t1&t=83");
    fireEvent.click(playButton);
    // No await between the click and this line: the call is synchronous.
    expect(player.playRelease).toHaveBeenCalledWith("r1", "t1", 83);
  });

  it("pauses the track that is playing", async () => {
    // isCurrentTrack follows currentItem in the harness value.
    const player = createStudioPlayerValue({
      currentItem: queueItem({ trackId: "t1" }),
    });
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />, {
      player,
    });
    fireEvent.click(await screen.findByRole("button", { name: "Pause Tide" }));
    expect(player.togglePlay).toHaveBeenCalled();
    expect(player.playRelease).not.toHaveBeenCalled();
  });

  it("disables play on an explicit track while hide explicit is on, and says why", async () => {
    mocks.hideExplicit = true;
    mocks.track = trackFixture({ isExplicit: true });
    const player = createStudioPlayerValue({ currentItem: null });
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />, {
      player,
    });
    const playButton = await screen.findByRole("button", { name: "Play Tide" });
    expect(playButton).toHaveAttribute("aria-disabled", "true");
    expect(playButton).toHaveAccessibleDescription("Hidden by your settings");
    fireEvent.click(playButton);
    expect(player.playRelease).not.toHaveBeenCalled();
  });

  it("lets a hidden track that is already playing be paused", async () => {
    mocks.hideExplicit = true;
    mocks.track = trackFixture({ isExplicit: true });
    const player = createStudioPlayerValue({
      currentItem: queueItem({ trackId: "t1", isExplicit: true }),
    });
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />, {
      player,
    });
    const pauseButton = await screen.findByRole("button", {
      name: "Pause Tide",
    });
    expect(pauseButton).not.toHaveAttribute("aria-disabled");
    fireEvent.click(pauseButton);
    expect(player.togglePlay).toHaveBeenCalled();
  });

  it("plays a shared playlist's tracks and opens its page", async () => {
    const player = createStudioPlayerValue({ currentItem: null });
    renderWithPlayer(
      <StudioShareCard target={PLAYLIST_TARGET} surface="post" />,
      { player },
    );
    expect(await screen.findByText("By Tiago")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open Kitchen tapes in Studio" }),
    ).toHaveAttribute("href", "/studio/collection?id=pl1");
    fireEvent.click(screen.getByRole("button", { name: "Play Kitchen tapes" }));
    expect(player.playTracks).toHaveBeenCalledWith([
      expect.objectContaining({ trackId: "t1" }),
      expect.objectContaining({ trackId: "t2" }),
    ]);
  });

  it("shows a scheduled release's date behind a calendar icon with no play", async () => {
    mocks.release = releaseViewFixture({
      status: "scheduled",
      publishAt: "2030-01-01T10:00:00.000Z",
    });
    renderWithPlayer(
      <StudioShareCard target={RELEASE_TARGET} surface="post" />,
    );
    const dateLine = await screen.findByText(/^Out /);
    expect(dateLine).toBeInTheDocument();
    expect(dateLine.querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Play/ })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Open Salt water in Studio" }),
    ).toBeInTheDocument();
  });

  it("queues only the audible tracks of a release with hidden ones", async () => {
    mocks.hideExplicit = true;
    mocks.release = releaseViewFixture({
      tracks: [
        {
          id: "t1",
          position: 1,
          title: "Tide",
          durationSeconds: 200,
          isExplicit: true,
          hasAudio: true,
        },
        {
          id: "t2",
          position: 2,
          title: "Pier",
          durationSeconds: 200,
          isExplicit: false,
          hasAudio: true,
        },
      ],
    });
    const player = createStudioPlayerValue({ currentItem: null });
    renderWithPlayer(
      <StudioShareCard target={RELEASE_TARGET} surface="chat" />,
      { player },
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Play Salt water" }),
    );
    expect(player.playTracks).toHaveBeenCalledWith([
      expect.objectContaining({ trackId: "t2" }),
    ]);
  });

  it("keeps one frame while the state changes", async () => {
    mocks.track = null;
    mocks.trackState = loadState({ isLoading: true });
    // Nothing playing, so the loaded card reads "Play Tide".
    const player = createStudioPlayerValue({ currentItem: null });
    const view = renderWithPlayer(
      <StudioShareCard target={TRACK_TARGET} surface="chat" />,
      { player },
    );
    const frameWhileLoading = view.container.querySelector(
      "[data-studio-share-frame]",
    );
    expect(frameWhileLoading).not.toBeNull();
    mocks.track = trackFixture();
    mocks.trackState = loadState();
    view.rerenderWith({});
    await screen.findByRole("button", { name: "Play Tide" });
    expect(view.container.querySelector("[data-studio-share-frame]")).toBe(
      frameWhileLoading,
    );
    mocks.track = null;
    mocks.trackState = loadState({ isNotFound: true });
    view.rerenderWith({});
    await screen.findByText("Not available");
    expect(view.container.querySelector("[data-studio-share-frame]")).toBe(
      frameWhileLoading,
    );
  });

  it("offers Remove Studio link in the composer", async () => {
    const onRemove = vi.fn();
    renderWithPlayer(
      <StudioShareCard
        target={TRACK_TARGET}
        surface="composer"
        onRemove={onRemove}
      />,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove Studio link" }),
    );
    expect(onRemove).toHaveBeenCalled();
  });
});

describe("StudioShareCard layout", () => {
  it("renders a notice outside any paragraph, so post body rules leave it alone", async () => {
    mocks.track = null;
    mocks.trackState = loadState({ isWithdrawn: true });
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="post" />);
    const notice = await screen.findByText("This release was withdrawn");
    expect(notice.tagName).toBe("SPAN");
    expect(notice.closest("p")).toBeNull();
  });

  it("keeps the eyebrow label in its own span beside the icon", async () => {
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />);
    const label = await screen.findByText("Studio track");
    expect(label.tagName).toBe("SPAN");
    expect(label.querySelector("svg")).toBeNull();
    expect(label.parentElement?.querySelector("svg")).not.toBeNull();
  });

  it("reads artist and release under a track from a longer release", async () => {
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />);
    expect(
      await screen.findByText("NIGHTFORM · Salt water"),
    ).toBeInTheDocument();
  });

  it("reads the artist alone under a single that shares the release title", async () => {
    mocks.track = trackFixture({ title: "Salt water" });
    renderWithPlayer(<StudioShareCard target={TRACK_TARGET} surface="chat" />);
    expect(await screen.findByText("NIGHTFORM")).toBeInTheDocument();
    expect(screen.queryByText(/NIGHTFORM · /)).toBeNull();
  });
});
