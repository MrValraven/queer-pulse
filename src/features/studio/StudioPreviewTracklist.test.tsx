import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type {
  StudioReleaseView,
  StudioTrackRowView,
} from "./api/studio.adapters";
import type { StudioQueueTrack } from "./player/studioPlayerContext";
import { StudioPreviewTracklist } from "./StudioPreviewTracklist";

const playTracks = vi.hoisted(() =>
  vi.fn<(queue: StudioQueueTrack[], startId: string) => void>(),
);

vi.mock("./player/studioPlayerContext", () => ({
  useStudioPlayer: () => ({
    isCurrentTrack: () => false,
    status: "idle",
    togglePlay: vi.fn(),
    playTracks,
  }),
}));

vi.mock("./api/useStudioPlaybackPreferences", () => ({
  useStudioHideExplicit: () => false,
  useStudioPlaybackRow: () => undefined,
}));

function episodeRow(id: string, position: number): StudioTrackRowView {
  return {
    id,
    position,
    title: `Episode ${position}`,
    durationSeconds: 600,
    durationLabel: "10:00",
    isExplicit: false,
    hasAudio: true,
    href: `/studio/track?id=${id}`,
    savedId: id,
    publishedAt: "2026-10-01T10:00:00Z",
    isDraft: false,
  };
}

function showRelease(): StudioReleaseView {
  return {
    id: "show-1",
    title: "Late bloomers",
    type: "podcast",
    isShow: true,
    isOwner: true,
    coverUrl: null,
    tint: "#333333",
    artist: { id: "artist-1", name: "Host", href: "/studio/artist?id=1" },
    tracks: [episodeRow("episode-1", 1), episodeRow("episode-2", 2)],
  } as unknown as StudioReleaseView;
}

describe("StudioPreviewTracklist", () => {
  it("starts the pressed row's own episode on a show preview", async () => {
    playTracks.mockClear();
    render(
      <TestProviders>
        <StudioPreviewTracklist release={showRelease()} previewToken="tok" />
      </TestProviders>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Episode 1/ }));
    expect(playTracks).toHaveBeenCalledTimes(1);
    const [queue, startId] = playTracks.mock.calls[0] ?? [[], ""];
    expect(startId).toBe("episode-1");
    expect(queue).toHaveLength(1);
    expect(queue[0]?.trackId).toBe("episode-1");
    expect(queue[0]?.previewToken).toBe("tok");
  });
});
