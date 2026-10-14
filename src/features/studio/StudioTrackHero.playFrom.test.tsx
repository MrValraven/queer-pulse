import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioTrackHero } from "./StudioTrackHero";
import {
  createStudioPlayerValue,
  renderWithPlayer,
  trackFixture,
} from "./player/ui/studioPlayerTestHarness";

const idle = () =>
  createStudioPlayerValue({ currentItem: null, status: "idle" });

describe("StudioTrackHero with a timestamp", () => {
  it("offers Play from and starts the release queue there when pressed", async () => {
    const player = idle();
    renderWithPlayer(
      <StudioTrackHero track={trackFixture()} onTip={vi.fn()} />,
      {
        player,
        initialEntries: ["/studio/track?id=t1&t=83"],
      },
    );
    const play = await screen.findByRole("button", {
      name: "Play Tide from 1:23",
    });
    expect(screen.getByText("Play from 1:23")).toBeInTheDocument();
    expect(player.playRelease).not.toHaveBeenCalled();
    fireEvent.click(play);
    expect(player.playRelease).toHaveBeenCalledWith("r1", "t1", 83);
  });

  it("clamps a time past the end", async () => {
    renderWithPlayer(
      <StudioTrackHero track={trackFixture()} onTip={vi.fn()} />,
      {
        player: idle(),
        initialEntries: ["/studio/track?id=t1&t=99999"],
      },
    );
    expect(
      await screen.findByRole("button", { name: "Play Tide from 3:19" }),
    ).toBeInTheDocument();
  });

  it("keeps the plain play button without a timestamp", async () => {
    renderWithPlayer(
      <StudioTrackHero track={trackFixture()} onTip={vi.fn()} />,
      {
        player: idle(),
        initialEntries: ["/studio/track?id=t1"],
      },
    );
    expect(
      await screen.findByRole("button", { name: "Play Tide" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Play from/)).toBeNull();
  });

  it("drops the start time once this track is the current one", async () => {
    const { player } = renderWithPlayer(
      <StudioTrackHero track={trackFixture()} onTip={vi.fn()} />,
      { initialEntries: ["/studio/track?id=t1&t=83"] },
    );
    const pause = await screen.findByRole("button", { name: "Pause Tide" });
    expect(screen.queryByText(/Play from/)).toBeNull();
    fireEvent.click(pause);
    expect(player.togglePlay).toHaveBeenCalled();
    expect(player.playRelease).not.toHaveBeenCalled();
  });
});
