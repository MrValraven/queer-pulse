import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioCastButton } from "./StudioCastButton";
import {
  StudioRepeatButton,
  StudioShuffleButton,
  StudioTransport,
} from "./StudioPlayerControls";
import { StudioVolumeControl } from "./StudioVolumeControl";
import {
  createStudioPlayerValue,
  queueItem,
  queueView,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

const MUTED_AT_80 = {
  volume: 0.8,
  isMuted: true,
  crossfadeSeconds: 0,
  isLoudnessEven: true,
};

describe("player controls", () => {
  it("toggles shuffle and shows its state", async () => {
    const player = createStudioPlayerValue({
      queue: queueView({ isShuffled: true }),
    });
    renderWithPlayer(<StudioShuffleButton />, { player });
    const shuffle = await screen.findByRole("button", { name: "Shuffle" });
    expect(shuffle).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(shuffle);
    expect(player.toggleShuffle).toHaveBeenCalled();
  });

  it("names the repeat mode and cycles it", async () => {
    const player = createStudioPlayerValue({
      queue: queueView({ repeat: "one" }),
    });
    renderWithPlayer(<StudioRepeatButton />, { player });
    fireEvent.click(
      await screen.findByRole("button", { name: "Repeat: this track" }),
    );
    expect(player.cycleRepeat).toHaveBeenCalled();
  });

  it("keeps Next focusable but inert at the end of the queue", async () => {
    const player = createStudioPlayerValue({ hasNext: false });
    renderWithPlayer(<StudioTransport size="bar" />, { player });
    const next = await screen.findByRole("button", { name: "Next track" });
    expect(next).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(next);
    expect(player.next).not.toHaveBeenCalled();
  });

  it("plays the next track when there is one", async () => {
    const player = createStudioPlayerValue({ hasNext: true });
    renderWithPlayer(<StudioTransport size="bar" />, { player });
    const next = await screen.findByRole("button", { name: "Next track" });
    expect(next).not.toHaveAttribute("aria-disabled");
    fireEvent.click(next);
    expect(player.next).toHaveBeenCalledTimes(1);
  });

  it("hands focus from Previous to Skip back when an episode follows the music", async () => {
    const { rerenderWith } = renderWithPlayer(<StudioTransport size="bar" />, {
      player: createStudioPlayerValue({ currentItem: queueItem() }),
    });
    const previous = await screen.findByRole("button", {
      name: "Previous track",
    });
    previous.focus();
    expect(previous).toHaveFocus();
    rerenderWith({
      player: createStudioPlayerValue({
        currentItem: queueItem({ trackId: "e1", isEpisode: true }),
      }),
    });
    const skipBack = screen.getByRole("button", { name: "Skip back 15 s" });
    expect(skipBack).toHaveFocus();
    // While it fades, the leaving button is inert; once gone, it is gone.
    const isLeavingInert = previous.isConnected
      ? previous.closest("[data-slot-item]")?.hasAttribute("inert") === true
      : true;
    expect(isLeavingInert).toBe(true);
  });

  it("leaves focus where it is when the swap happens elsewhere", async () => {
    const { rerenderWith } = renderWithPlayer(<StudioTransport size="bar" />, {
      player: createStudioPlayerValue({ currentItem: queueItem() }),
    });
    const pauseButton = await screen.findByRole("button", { name: "Pause" });
    pauseButton.focus();
    rerenderWith({
      player: createStudioPlayerValue({
        currentItem: queueItem({ trackId: "e1", isEpisode: true }),
      }),
    });
    expect(screen.getByRole("button", { name: "Pause" })).toHaveFocus();
  });

  it("shows Cast only while a device is reachable", async () => {
    const { rerenderWith } = renderWithPlayer(<StudioCastButton />);
    expect(screen.queryByRole("button", { name: /another device/ })).toBeNull();
    const player = createStudioPlayerValue({
      remote: { isAvailable: true, isConnected: true },
    });
    rerenderWith({ player });
    const cast = await screen.findByRole("button", {
      name: "Playing on another device",
    });
    expect(cast).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(cast);
    expect(player.promptRemotePlayback).toHaveBeenCalled();
  });

  it("sets the volume and unmutes when the slider moves up", async () => {
    const player = createStudioPlayerValue({ preferences: MUTED_AT_80 });
    renderWithPlayer(<StudioVolumeControl />, { player });
    expect(
      await screen.findByRole("button", { name: "Unmute" }),
    ).toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: "Volume" });
    expect(slider).toHaveValue("0");
    fireEvent.change(slider, { target: { value: "30" } });
    // setVolume unmutes by itself; a toggle after it would mute again.
    expect(player.setVolume).toHaveBeenCalledWith(0.3);
    expect(player.toggleMute).not.toHaveBeenCalled();
  });

  it("unmutes at the remembered level when a key nudges the muted slider", async () => {
    const player = createStudioPlayerValue({ preferences: MUTED_AT_80 });
    renderWithPlayer(<StudioVolumeControl />, { player });
    const slider = await screen.findByRole("slider", { name: "Volume" });
    fireEvent.change(slider, { target: { value: "1" } });
    expect(player.setVolume).toHaveBeenCalledWith(0.8);
    expect(player.toggleMute).not.toHaveBeenCalled();
  });

  it("sets the level directly while unmuted", async () => {
    const player = createStudioPlayerValue({
      preferences: { ...MUTED_AT_80, isMuted: false },
    });
    renderWithPlayer(<StudioVolumeControl />, { player });
    const slider = await screen.findByRole("slider", { name: "Volume" });
    expect(slider).toHaveValue("80");
    fireEvent.change(slider, { target: { value: "45" } });
    expect(player.setVolume).toHaveBeenCalledWith(0.45);
    expect(player.toggleMute).not.toHaveBeenCalled();
  });
});
