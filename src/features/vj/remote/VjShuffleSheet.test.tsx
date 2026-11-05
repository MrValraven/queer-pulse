import type { ReactElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import {
  createVjStageState,
  type VjShuffle,
} from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import type { VjCommandOutcome } from "../live/vjStageCommands";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import { VjShuffleSheet } from "./VjShuffleSheet";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

const OK_OUTCOME: VjCommandOutcome = { ok: true, revision: 5, isNoop: false };
const DEFAULT_SHUFFLE: VjShuffle = createVjStageState(
  "show-shuffle",
  0,
).shuffle;

/** A fake runner: a mock to assert on, typed as the runner's generic `run`. */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome));
}

function renderShuffleSheet(run: VjRun, shuffle: VjShuffle = DEFAULT_SHUFFLE) {
  const ui: ReactElement = (
    <VjShuffleSheet
      shuffle={shuffle}
      run={run}
      isBlocked={false}
      onClose={() => {}}
    />
  );
  return render(
    <TestProviders>
      <LazyMotion features={domMax}>{ui}</LazyMotion>
    </TestProviders>,
  );
}

/** Clicks, then lets the command's promise settle inside act. */
async function clickAndSettle(element: HTMLElement) {
  fireEvent.click(element);
  await act(() => Promise.resolve());
}

/** Leaves the field, then lets any command's promise settle inside act. */
async function blurAndSettle(element: HTMLElement) {
  fireEvent.blur(element);
  await act(() => Promise.resolve());
}

describe("VjShuffleSheet", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts shuffle with an interval in seconds", async () => {
    const run = createRun();
    renderShuffleSheet(run);
    fireEvent.change(screen.getByRole("slider", { name: "Seconds" }), {
      target: { value: "12" },
    });
    expect(screen.getByText("12 seconds")).toBeInTheDocument();
    await clickAndSettle(screen.getByRole("button", { name: "Start shuffle" }));
    expect(run).toHaveBeenCalledWith("setShuffle", {
      isOn: true,
      intervalKind: "seconds",
      intervalValue: 12,
    });
  });

  it("stops shuffle", async () => {
    const run = createRun();
    renderShuffleSheet(run, { ...DEFAULT_SHUFFLE, isOn: true });
    expect(screen.getByText("Shuffle is on")).toBeInTheDocument();
    await clickAndSettle(screen.getByRole("button", { name: "Stop shuffle" }));
    expect(run).toHaveBeenCalledWith("setShuffle", { isOn: false });
  });

  it("switches to beats and shows the interval in seconds at this tempo", async () => {
    const run = createRun();
    renderShuffleSheet(run);
    await clickAndSettle(screen.getByRole("button", { name: "Beats" }));
    expect(run).toHaveBeenLastCalledWith("setShuffle", {
      intervalKind: "beats",
      intervalValue: 8,
    });
    expect(
      await screen.findByText("8 beats at 124 BPM is 3.9 s"),
    ).toBeInTheDocument();

    await clickAndSettle(screen.getByRole("button", { name: "16 beats" }));
    expect(run).toHaveBeenLastCalledWith("setShuffle", {
      intervalKind: "beats",
      intervalValue: 16,
    });
    expect(
      screen.getByText("16 beats at 124 BPM is 7.7 s"),
    ).toBeInTheDocument();
  });

  it("sends the tapped tempo", async () => {
    let currentTime = 10_000;
    vi.spyOn(Date, "now").mockImplementation(() => currentTime);
    const run = createRun();
    renderShuffleSheet(run);
    const tapButton = screen.getByRole("button", { name: "Tap tempo" });

    fireEvent.click(tapButton);
    currentTime += 500;
    fireEvent.click(tapButton);
    expect(run).not.toHaveBeenCalled();

    currentTime += 500;
    await clickAndSettle(tapButton);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenLastCalledWith("setShuffle", { bpm: 120 });
    expect(screen.getByRole("textbox", { name: "BPM" })).toHaveValue("120");

    currentTime += 100;
    fireEvent.click(tapButton);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("puts the picker back after a refused interval and sends the same choice again", async () => {
    const run = createRun();
    run.mockResolvedValueOnce({
      ok: false,
      code: "vj_rate_limited",
      errorKey: "vj:error.socket.rateLimited",
    });
    renderShuffleSheet(run);
    await clickAndSettle(screen.getByRole("button", { name: "Beats" }));
    expect(run).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That was a lot of taps at once. Wait a second, then tap again",
    );
    expect(screen.getByRole("button", { name: "Beats" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Seconds" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await clickAndSettle(screen.getByRole("button", { name: "Beats" }));
    expect(run).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenLastCalledWith("setShuffle", {
      intervalKind: "beats",
      intervalValue: 8,
    });
  });

  it("sends nothing from the slider once the remote cannot reach the stage", () => {
    const run = createRun();
    const sheetWith = (isBlocked: boolean) => (
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjShuffleSheet
            shuffle={DEFAULT_SHUFFLE}
            run={run}
            isBlocked={isBlocked}
            onClose={() => {}}
          />
        </LazyMotion>
      </TestProviders>
    );
    const view = render(sheetWith(false));
    const slider = screen.getByRole("slider", { name: "Seconds" });
    fireEvent.change(slider, { target: { value: "20" } });
    expect(screen.getByText("20 seconds")).toBeInTheDocument();
    view.rerender(sheetWith(true));
    fireEvent.pointerUp(slider);
    fireEvent.keyUp(slider);
    fireEvent.blur(slider);
    expect(run).not.toHaveBeenCalled();
  });

  it("refuses a tempo outside 60 to 200 with the reason", async () => {
    const run = createRun();
    renderShuffleSheet(run);
    const tempoInput = screen.getByRole("textbox", { name: "BPM" });
    fireEvent.change(tempoInput, { target: { value: "250" } });
    fireEvent.blur(tempoInput);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Pick a tempo from 60 to 200 BPM",
    );
    expect(run).not.toHaveBeenCalled();

    fireEvent.change(tempoInput, { target: { value: "128,44" } });
    await blurAndSettle(tempoInput);
    expect(run).toHaveBeenCalledWith("setShuffle", { bpm: 128.4 });
    expect(tempoInput).toHaveValue("128.4");
  });
});
