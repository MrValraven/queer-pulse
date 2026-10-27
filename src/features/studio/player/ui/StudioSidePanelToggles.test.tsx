import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioPlayerSurfaceValue } from "../studioPlayerSurface";
import { StudioSidePanelToggles } from "./StudioSidePanelToggles";
import {
  STUDIO_NOW_PLAYING_BUTTON_ID,
  STUDIO_QUEUE_BUTTON_ID,
} from "./studioQueueMoves";
import {
  createSurfaceValue,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

const surfaceHolder = vi.hoisted(() => ({
  current: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("../studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceHolder.current,
}));

beforeEach(() => {
  surfaceHolder.current = createSurfaceValue();
});

describe("StudioSidePanelToggles", () => {
  it("places Now playing just before the queue toggle", () => {
    renderWithPlayer(<StudioSidePanelToggles />);
    const labels = screen
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"));
    expect(labels).toEqual(["Show Now playing", "Show the queue"]);
  });

  it("flips the Now playing label and pressed state with the view", () => {
    surfaceHolder.current = createSurfaceValue({
      sidePanel: "nowPlaying",
      sidePanelPlacement: "docked",
    });
    renderWithPlayer(<StudioSidePanelToggles />);
    expect(
      screen.getByRole("button", { name: "Hide Now playing" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Show the queue" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles each view from its own button", () => {
    const toggleSidePanel = vi.fn();
    const toggleQueuePanel = vi.fn();
    surfaceHolder.current = createSurfaceValue({
      toggleSidePanel,
      toggleQueuePanel,
    });
    renderWithPlayer(<StudioSidePanelToggles />);
    fireEvent.click(screen.getByRole("button", { name: "Show Now playing" }));
    expect(toggleSidePanel).toHaveBeenCalledWith("nowPlaying");
    fireEvent.click(screen.getByRole("button", { name: "Show the queue" }));
    expect(toggleQueuePanel).toHaveBeenCalledTimes(1);
  });

  it("gives the buttons the ids focus returns to", () => {
    renderWithPlayer(<StudioSidePanelToggles />);
    expect(
      screen.getByRole("button", { name: "Show Now playing" }),
    ).toHaveAttribute("id", STUDIO_NOW_PLAYING_BUTTON_ID);
    expect(
      screen.getByRole("button", { name: "Show the queue" }),
    ).toHaveAttribute("id", STUDIO_QUEUE_BUTTON_ID);
  });
});
