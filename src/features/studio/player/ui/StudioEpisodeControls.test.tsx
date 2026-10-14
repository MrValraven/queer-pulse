import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../../../test/studioPlayerTestValue";
import { StudioPlayerSurfaceProvider } from "../StudioPlayerSurfaceProvider";
import {
  clearStudioEpisodeMemory,
  readEpisodeSpeed,
} from "../studioEpisodeMemory";
import {
  StudioPlayerClockContext,
  StudioPlayerContext,
  type StudioQueueItem,
} from "../studioPlayerContext";
import { DEMO_EPISODE_MEMBER_ID } from "../useStudioEpisodeMemory";
import { StudioMiniPlayer } from "./StudioMiniPlayer";
import { StudioTransport } from "./StudioPlayerControls";
import { StudioPlayerMorePanel } from "./StudioPlayerMorePanel";
import { StudioSpeedSetting } from "./StudioSpeedSetting";

afterEach(() => clearStudioEpisodeMemory());

function itemOf(isEpisode: boolean): StudioQueueItem {
  return {
    queueEntryId: "q1",
    trackId: "t1",
    title: "Pilot",
    durationSeconds: 1800,
    trackHref: "/studio/track?id=t1",
    releaseId: "r1",
    releaseTitle: "Late Bloomers",
    coverUrl: null,
    tint: "jade",
    artistId: "p1",
    artistName: "Late Bloomers",
    artistHref: "/studio/artist?id=p1",
    isExplicit: false,
    isEpisode,
  };
}

function renderWithPlayer(ui: ReactElement, isEpisode: boolean) {
  const seek = vi.fn();
  const player = { ...createStudioPlayerTestValue(itemOf(isEpisode)), seek };
  render(
    <TestProviders>
      <StudioPlayerContext.Provider value={player}>
        <StudioPlayerClockContext.Provider
          value={{
            currentTime: 100,
            duration: 1800,
            currentChapterIndex: null,
            currentLyricIndex: null,
          }}
        >
          {/* The mini player opens Now playing through the surface. */}
          <StudioPlayerSurfaceProvider hasQueue>
            {ui}
          </StudioPlayerSurfaceProvider>
        </StudioPlayerClockContext.Provider>
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return seek;
}

describe("episode controls", () => {
  it("swaps previous and next for skip 15/30 on an episode", () => {
    const seek = renderWithPlayer(<StudioTransport size="bar" />, true);
    expect(screen.queryByRole("button", { name: "Previous track" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Skip back 15 s" }));
    expect(seek).toHaveBeenLastCalledWith(85);
    fireEvent.click(screen.getByRole("button", { name: "Skip forward 30 s" }));
    expect(seek).toHaveBeenLastCalledWith(130);
  });

  it("keeps previous and next for music", () => {
    renderWithPlayer(<StudioTransport size="bar" />, false);
    expect(
      screen.getByRole("button", { name: "Previous track" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip back 15 s" })).toBeNull();
  });

  it("puts the skips in the phone mini player for an episode", () => {
    renderWithPlayer(<StudioMiniPlayer item={itemOf(true)} />, true);
    expect(
      screen.getByRole("button", { name: "Skip back 15 s" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Skip forward 30 s" }),
    ).toBeInTheDocument();
  });

  it("chooses a speed and keeps it", () => {
    renderWithPlayer(<StudioSpeedSetting />, true);
    expect(
      screen.getByRole("radiogroup", { name: "Speed" }),
    ).toBeInTheDocument();
    const faster = screen.getByRole("radio", { name: "1.5x" });
    expect(screen.getByRole("radio", { name: "1x" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.click(faster);
    expect(faster).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "1x" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(readEpisodeSpeed(DEMO_EPISODE_MEMBER_ID)).toBe(1.5);
    expect(screen.getByRole("radio", { name: "0.8x" })).toBeInTheDocument();
  });

  it("moves the speed with the arrow keys", () => {
    renderWithPlayer(<StudioSpeedSetting />, true);
    const normal = screen.getByRole("radio", { name: "1x" });
    expect(normal).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "2x" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    fireEvent.keyDown(normal, { key: "ArrowRight" });
    const next = screen.getByRole("radio", { name: "1.25x" });
    expect(next).toHaveAttribute("aria-checked", "true");
    expect(next).toHaveFocus();
    expect(readEpisodeSpeed(DEMO_EPISODE_MEMBER_ID)).toBe(1.25);
  });

  it("shows Speed in the overflow menu only for an episode", async () => {
    renderWithPlayer(<StudioPlayerMorePanel placement="up" />, true);
    fireEvent.click(
      screen.getByRole("button", { name: "More player options" }),
    );
    expect(
      await screen.findByRole("radiogroup", { name: "Speed" }),
    ).toBeInTheDocument();
    cleanup();
    renderWithPlayer(<StudioPlayerMorePanel placement="up" />, false);
    fireEvent.click(
      screen.getByRole("button", { name: "More player options" }),
    );
    expect(
      await screen.findByRole("switch", { name: "Even out loudness" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Speed" })).toBeNull();
  });
});
