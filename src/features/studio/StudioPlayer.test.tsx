import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioPlayer } from "./StudioPlayer";
import {
  StudioPlayerClockContext,
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";

vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));

function playerValue(
  overrides: Partial<StudioPlayerValue> = {},
): StudioPlayerValue {
  const item = {
    trackId: "t1",
    title: "Tide",
    durationSeconds: 200,
    trackHref: "/studio/track?id=t1",
    releaseId: "r1",
    releaseTitle: "Salt water",
    coverUrl: null,
    tint: "coral" as const,
    artistId: "p1",
    artistName: "NIGHTFORM",
    artistHref: "/studio/artist?id=p1",
  };
  return {
    queue: [item],
    currentIndex: 0,
    status: "playing",
    currentItem: item,
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
    isCurrentRelease: () => true,
    isCurrentTrack: () => true,
    ...overrides,
  };
}

function renderBar(value: StudioPlayerValue) {
  return render(
    <TestProviders>
      <StudioPlayerContext.Provider value={value}>
        <StudioPlayerClockContext.Provider
          value={{ currentTime: 20, duration: 200 }}
        >
          <StudioPlayer />
        </StudioPlayerClockContext.Provider>
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
}

describe("StudioPlayer bar", () => {
  it("steps the seek slider five seconds per arrow key", async () => {
    const value = playerValue();
    renderBar(value);
    const slider = await screen.findByRole("slider");
    // The studio catalog loads lazily, so wait for the resolved value text.
    await waitFor(() =>
      expect(slider).toHaveAttribute("aria-valuetext", "0:20 of 3:20"),
    );
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(value.seek).toHaveBeenLastCalledWith(25);
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(value.seek).toHaveBeenLastCalledWith(15);
  });

  it("links the title to the track and the artist to their page", async () => {
    renderBar(playerValue());
    expect(await screen.findByRole("link", { name: "Tide" })).toHaveAttribute(
      "href",
      "/studio/track?id=t1",
    );
    expect(screen.getByRole("link", { name: "NIGHTFORM" })).toHaveAttribute(
      "href",
      "/studio/artist?id=p1",
    );
  });

  it("offers Retry when a track cannot play", async () => {
    const value = playerValue({ status: "error" });
    renderBar(value);
    fireEvent.click(await screen.findByRole("button", { name: /retry/i }));
    expect(value.retry).toHaveBeenCalled();
  });

  it("shows no money line outside the demo", async () => {
    renderBar(playerValue());
    await screen.findByRole("slider");
    expect(screen.queryByText(/paying/i)).not.toBeInTheDocument();
  });
});
