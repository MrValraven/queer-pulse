import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioTrackView } from "../../api/studio.adapters";
import { StudioReleaseChapters } from "./StudioReleaseChapters";
import { StudioTrackChapters } from "./StudioTrackChapters";
import {
  createClock,
  createStudioPlayerValue,
  queueItem,
  releaseViewFixture,
  renderWithPlayer,
  trackFixture,
} from "./studioPlayerTestHarness";

const trackHolder = vi.hoisted(() => ({
  current: null as StudioTrackView | null,
}));
vi.mock("../../api/useStudioTrack", () => ({
  useStudioTrack: () => ({ track: trackHolder.current }),
}));

const CHAPTERS = [
  { startSeconds: 0, title: "Opening", artist: null },
  { startSeconds: 750, title: "Second part", artist: "Guest" },
];
const mixTrack = () => trackFixture({ chapters: CHAPTERS });

beforeEach(() => {
  trackHolder.current = mixTrack();
});

describe("StudioTrackChapters", () => {
  it("starts the track at a chapter when it is not playing", async () => {
    const player = createStudioPlayerValue({
      currentItem: null,
      status: "idle",
    });
    renderWithPlayer(<StudioTrackChapters track={mixTrack()} />, { player });
    expect(
      await screen.findByRole("heading", { name: "Tracklist" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /12:30.*Second part/ }));
    expect(player.playRelease).toHaveBeenCalledWith("r1", "t1", 750);
  });

  it("seeks within the current track and marks the current chapter", async () => {
    const player = createStudioPlayerValue({
      currentItem: queueItem({ trackId: "t1" }),
    });
    renderWithPlayer(<StudioTrackChapters track={mixTrack()} />, {
      player,
      clock: createClock({ currentChapterIndex: 1 }),
    });
    const second = await screen.findByRole("button", { name: /Second part/ });
    expect(second).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: /Opening/ }));
    expect(player.seek).toHaveBeenCalledWith(0);
  });

  it("hides the heading visually when asked and keeps it for screen readers", async () => {
    renderWithPlayer(
      <StudioTrackChapters track={mixTrack()} isHeadingHidden />,
    );
    const heading = await screen.findByRole("heading", { name: "Tracklist" });
    expect(heading).toHaveClass("visuallyHidden");
  });

  it("renders nothing for a track without chapters", () => {
    const { container } = renderWithPlayer(
      <StudioTrackChapters track={trackFixture()} />,
    );
    expect(container.querySelector("section")).toBeNull();
  });
});

describe("StudioReleaseChapters", () => {
  it("lists a mix's chapters", async () => {
    renderWithPlayer(
      <StudioReleaseChapters
        release={releaseViewFixture({
          type: "mix",
          tracks: [
            {
              id: "t1",
              position: 1,
              title: "Tide",
              durationSeconds: 3600,
              isExplicit: false,
              hasAudio: true,
            },
          ],
        })}
      />,
    );
    expect(
      await screen.findByRole("heading", { name: "Tracklist" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Second part/ }),
    ).toBeInTheDocument();
  });

  it("stays away from albums and EPs", () => {
    const { container } = renderWithPlayer(
      <StudioReleaseChapters release={releaseViewFixture()} />,
    );
    expect(container.querySelector("section")).toBeNull();
  });
});
