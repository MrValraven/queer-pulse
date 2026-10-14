import { fireEvent, screen, waitFor } from "@testing-library/react";
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

/** The chip's own live region; the app's toast region is a status too. */
function sleepStatus(): HTMLElement {
  const region = screen
    .getAllByRole("status")
    .find((element) => !element.closest("[data-toast-region]"));
  if (!region) throw new Error("The sleep timer status region is missing");
  return region;
}

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

  it("announces each change once and stays quiet between changes", async () => {
    const { rerenderWith } = renderWithPlayer(<StudioSleepTimerChip />);
    const region = sleepStatus();
    expect(region).toBeEmptyDOMElement();
    // Collected in the callback: jsdom delivers records at the microtask
    // checkpoint, so takeRecords() after an await would come back empty.
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((list) => {
      records.push(...list);
    });
    observer.observe(region, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    rerenderWith({
      player: createStudioPlayerValue({ sleepTimer: { kind: "endOfTrack" } }),
    });
    await waitFor(() =>
      expect(region).toHaveTextContent(
        "Playback stops at the end of this track",
      ),
    );
    await waitFor(() => expect(records).toHaveLength(1));
    records.length = 0;
    // Equal timers in fresh objects are no change.
    rerenderWith({
      player: createStudioPlayerValue({ sleepTimer: { kind: "endOfTrack" } }),
    });
    rerenderWith({
      player: createStudioPlayerValue({ sleepTimer: { kind: "endOfTrack" } }),
    });
    // Let any pending records reach the callback before counting.
    await Promise.resolve();
    records.push(...observer.takeRecords());
    expect(records).toHaveLength(0);
    rerenderWith({ player: createStudioPlayerValue({ sleepTimer: null }) });
    await waitFor(() => expect(region).toHaveTextContent("Sleep timer off"));
    await waitFor(() => expect(records).toHaveLength(1));
    observer.disconnect();
  });

  it("stays silent when another chip announces", async () => {
    const { rerenderWith } = renderWithPlayer(
      <StudioSleepTimerChip announces={false} />,
    );
    rerenderWith({
      player: createStudioPlayerValue({ sleepTimer: { kind: "endOfTrack" } }),
    });
    expect(
      await screen.findByRole("button", { name: "Stops after this track" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("status")
        .every((element) => element.closest("[data-toast-region]")),
    ).toBe(true);
    expect(
      screen.queryByText("Playback stops at the end of this track"),
    ).toBeNull();
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
    fireEvent.click(
      await screen.findByRole("button", { name: "Turn off the timer" }),
    );
    expect(player.cancelSleepTimer).toHaveBeenCalled();
  });
});
