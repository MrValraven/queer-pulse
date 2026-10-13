import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseCardView } from "./api/studio.adapters";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { StudioReleaseCard } from "./StudioReleaseCard";

const release = toReleaseCardView({
  id: "r1",
  title: "Salt water",
  type: "ep",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 2,
  totalDurationSeconds: 400,
  artist: {
    id: "p1",
    handle: "nightform",
    name: "NIGHTFORM",
    kind: "musician",
    avatarUrl: null,
  },
});

function renderCard(playRelease = vi.fn(() => Promise.resolve())) {
  const value = {
    queue: [],
    currentIndex: 0,
    status: "idle",
    currentItem: null,
    hasPrevious: false,
    hasNext: false,
    playRelease,
    playReleases: vi.fn(() => Promise.resolve()),
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
    <TestProviders>
      <StudioPlayerContext.Provider value={value}>
        <StudioReleaseCard release={release} />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return playRelease;
}

describe("StudioReleaseCard", () => {
  it("plays this card's release from a real button that sits outside every link", async () => {
    const playRelease = renderCard();
    const playButton = await screen.findByRole("button", {
      name: /salt water/i,
    });
    expect(playButton.tagName).toBe("BUTTON");
    expect(playButton.closest("a")).toBeNull();
    fireEvent.click(playButton);
    expect(playRelease).toHaveBeenCalledWith("r1");
  });

  it("links the title to this release's own page", async () => {
    renderCard();
    expect(
      await screen.findByRole("link", { name: "Salt water" }),
    ).toHaveAttribute("href", "/studio/album?id=r1");
  });
});
