import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toReleaseView } from "./api/studio.adapters";
import type { StudioReleaseDTO } from "./api/studio.types";
import {
  createStudioPlayerValue,
  releaseViewFixture,
  renderWithPlayer,
} from "./player/ui/studioPlayerTestHarness";
import { StudioAlbumHeroActions } from "./StudioAlbumHeroActions";
import { StudioTrackChapters } from "./player/ui/StudioTrackChapters";
import { StudioEpisodeCard } from "./StudioEpisodeCard";

vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => true,
}));

const show: StudioReleaseDTO = {
  id: "show-1",
  title: "Late Bloomers",
  type: "podcast",
  coverUrl: null,
  releasedOn: "2026-09-01",
  trackCount: 1,
  totalDurationSeconds: 1800,
  artist: {
    id: "p1",
    handle: "late-bloomers",
    name: "Late Bloomers",
    kind: "podcaster",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  genres: [],
  mood: null,
  scene: null,
  status: "published",
  publishedAt: "2026-09-01T10:00:00.000Z",
  tracks: [
    {
      id: "e1",
      position: 1,
      title: "Pilot",
      durationSeconds: 1800,
      isExplicit: true,
      hasAudio: true,
      publishedAt: "2026-09-01T10:00:00.000Z",
    },
  ],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
};

function heroRelease(isSecondTrackExplicit: boolean) {
  return releaseViewFixture({
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
        isExplicit: isSecondTrackExplicit,
        hasAudio: true,
      },
    ],
  });
}

describe("release level note (spec 7)", () => {
  it("says why Play is disabled when every playable track is hidden", () => {
    renderWithPlayer(
      <StudioAlbumHeroActions
        release={heroRelease(true)}
        onTip={vi.fn()}
        onReport={vi.fn()}
      />,
    );
    expect(screen.getByText(/hidden by your settings/i)).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /^play /i })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("stays silent when one playable track is not explicit", () => {
    renderWithPlayer(
      <StudioAlbumHeroActions
        release={heroRelease(false)}
        onTip={vi.fn()}
        onReport={vi.fn()}
      />,
    );
    expect(screen.queryByText(/hidden by your settings/i)).toBeNull();
    expect(
      screen
        .getByRole("button", { name: /^play /i })
        .hasAttribute("aria-disabled"),
    ).toBe(false);
  });
});

describe("explicit gaps closed", () => {
  it("keeps a hidden explicit episode card from playing and says why", () => {
    const release = toReleaseView(show);
    const player = createStudioPlayerValue({ currentItem: null });
    const track = release.tracks[0];
    if (!track) throw new Error("fixture track missing");
    renderWithPlayer(<StudioEpisodeCard episode={{ track, release }} />, {
      player,
    });
    fireEvent.click(screen.getByRole("button"));
    expect(player.playTracks).not.toHaveBeenCalled();
    expect(player.playRelease).not.toHaveBeenCalled();
    expect(screen.getByText(/hidden by your settings/i)).toBeTruthy();
  });

  it("keeps a hidden explicit track's chapters from playing", () => {
    const player = createStudioPlayerValue({ currentItem: null });
    renderWithPlayer(
      <StudioTrackChapters
        track={{
          id: "t1",
          title: "Mix",
          releaseId: "r1",
          isExplicit: true,
          hasAudio: true,
          chapters: [
            {
              startSeconds: 0,
              timeLabel: "0:00",
              title: "Opening",
              artist: null,
            },
          ],
        }}
      />,
      { player },
    );
    fireEvent.click(screen.getByText("Opening"));
    expect(player.playRelease).not.toHaveBeenCalled();
  });
});
