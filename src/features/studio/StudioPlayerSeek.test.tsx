import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioPlayerSeek } from "./StudioPlayerSeek";
import {
  createStudioPlayerValue,
  renderWithPlayer,
} from "./player/ui/studioPlayerTestHarness";

afterEach(() => vi.restoreAllMocks());

const chapter = (startSeconds: number) => ({
  startSeconds,
  title: `Part at ${startSeconds}`,
  artist: null,
  timeLabel: "0:00",
});

describe("StudioPlayerSeek", () => {
  it("keeps the plain slider when the track has no peaks", async () => {
    const onSeek = vi.fn();
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={onSeek} />,
    );
    const slider = await screen.findByRole("slider");
    expect(container.querySelector("svg")).toBeNull();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onSeek).toHaveBeenLastCalledWith(25);
  });

  it("lays the same slider over the waveform", async () => {
    const onSeek = vi.fn();
    const player = createStudioPlayerValue({
      currentWaveform: Array.from({ length: 200 }, () => 0.5),
    });
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={onSeek} />,
      { player },
    );
    const slider = await screen.findByRole("slider");
    await waitFor(() =>
      expect(slider).toHaveAttribute("aria-valuetext", "0:20 of 3:20"),
    );
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    const onWindowKey = vi.fn();
    window.addEventListener("keydown", onWindowKey);
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onSeek).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onSeek).toHaveBeenLastCalledWith(15);
    // The shortcuts hook ignores range inputs, so a focused slider seeks once.
    expect(onWindowKey).not.toHaveBeenCalled();
    window.removeEventListener("keydown", onWindowKey);
  });

  it("draws one tick per chapter after the first", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 300,
      height: 32,
      top: 0,
      left: 0,
      right: 300,
      bottom: 32,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const player = createStudioPlayerValue({
      currentWaveform: Array.from({ length: 200 }, () => 0.5),
      currentChapters: [chapter(0), chapter(60), chapter(120)],
    });
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={vi.fn()} />,
      { player },
    );
    expect(container.querySelectorAll("[data-chapter-tick]")).toHaveLength(2);
  });
});
