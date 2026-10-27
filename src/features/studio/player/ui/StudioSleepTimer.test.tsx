import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  StudioSleepTimerChip,
  StudioSleepTimerOptions,
} from "./StudioSleepTimer";
import { remainingSeconds } from "./studioSleepTimerLabel";
import {
  createStudioPlayerValue,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

afterEach(() => vi.useRealTimers());

describe("remainingSeconds", () => {
  it("rounds up and never goes below zero", () => {
    expect(remainingSeconds({ kind: "minutes", endsAt: 10_500 }, 1_000)).toBe(
      10,
    );
    expect(remainingSeconds({ kind: "minutes", endsAt: 1_000 }, 5_000)).toBe(0);
    expect(remainingSeconds({ kind: "endOfTrack" }, 0)).toBeNull();
  });
});

describe("StudioSleepTimerChip", () => {
  it("shows the time left and turns the timer off when pressed", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(0);
    const player = createStudioPlayerValue({
      sleepTimer: { kind: "minutes", endsAt: 90_000 },
    });
    renderWithPlayer(<StudioSleepTimerChip />, { player });
    const chip = await screen.findByRole("button", {
      name: "Turn off the sleep timer, 1:30 left",
    });
    expect(chip).toHaveTextContent("1:30 left");
    fireEvent.click(chip);
    expect(player.cancelSleepTimer).toHaveBeenCalled();
  });

  it("restarts its clock when a new timer replaces the old one", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(0);
    const { rerenderWith } = renderWithPlayer(<StudioSleepTimerChip />, {
      player: createStudioPlayerValue({
        sleepTimer: { kind: "minutes", endsAt: 90_000 },
      }),
    });
    expect(
      await screen.findByRole("button", {
        name: "Turn off the sleep timer, 1:30 left",
      }),
    ).toBeInTheDocument();
    vi.setSystemTime(600_000);
    rerenderWith({
      player: createStudioPlayerValue({
        sleepTimer: { kind: "minutes", endsAt: 600_000 + 1_800_000 },
      }),
    });
    expect(
      screen.getByRole("button", {
        name: "Turn off the sleep timer, 30:00 left",
      }),
    ).toHaveTextContent("30:00 left");
  });

  it("names the end-of-track timer by its visible text", async () => {
    renderWithPlayer(<StudioSleepTimerChip />, {
      player: createStudioPlayerValue({ sleepTimer: { kind: "endOfTrack" } }),
    });
    const chip = await screen.findByRole("button", {
      name: "Stops after this track",
    });
    expect(chip).toHaveAccessibleDescription(
      "Turn off the sleep timer set for the end of this track",
    );
  });
});

describe("StudioSleepTimerChip focus", () => {
  it("moves focus to a neighbouring control when the chip cancels the timer", async () => {
    const player = createStudioPlayerValue({
      sleepTimer: { kind: "endOfTrack" },
    });
    renderWithPlayer(
      <div>
        <StudioSleepTimerChip />
        <button type="button">Cast</button>
      </div>,
      { player },
    );
    const chip = await screen.findByRole("button", {
      name: "Stops after this track",
    });
    chip.focus();
    fireEvent.click(chip);
    expect(player.cancelSleepTimer).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cast" })).toHaveFocus();
  });
});

describe("StudioSleepTimerOptions", () => {
  it("starts the chosen timer", async () => {
    const onChosen = vi.fn();
    const { player } = renderWithPlayer(
      <StudioSleepTimerOptions onChosen={onChosen} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "30 minutes" }));
    expect(player.startSleepTimer).toHaveBeenCalledWith({
      kind: "minutes",
      minutes: 30,
    });
    fireEvent.click(screen.getByRole("button", { name: "End of track" }));
    expect(player.startSleepTimer).toHaveBeenLastCalledWith({
      kind: "endOfTrack",
    });
    expect(onChosen).toHaveBeenCalledTimes(2);
    expect(
      screen.queryByRole("button", { name: "Turn off the timer" }),
    ).toBeNull();
  });

  it("offers Turn off the timer while one runs", async () => {
    const player = createStudioPlayerValue({
      sleepTimer: { kind: "endOfTrack" },
    });
    renderWithPlayer(<StudioSleepTimerOptions onChosen={vi.fn()} />, {
      player,
    });
    // The running choice reads as pressed; the others do not.
    expect(
      await screen.findByRole("button", { name: "End of track" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "30 minutes" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Turn off the timer" }),
    );
    expect(player.cancelSleepTimer).toHaveBeenCalled();
  });
});
