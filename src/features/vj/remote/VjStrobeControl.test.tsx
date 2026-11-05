import type { ReactElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import {
  createVjStageState,
  type VjEffects,
} from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import type { VjCommandOutcome } from "../live/vjStageCommands";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import { VjStrobeControl } from "./VjStrobeControl";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

const OK_OUTCOME: VjCommandOutcome = { ok: true, revision: 2, isNoop: false };
const STROBE_WARNING =
  "Flashing light can trigger seizures in people with photosensitive epilepsy. Check the space before you start it";

/** A fake runner: a mock to assert on, typed as the runner's generic `run`. */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome));
}

function effectsOf(patch: Partial<VjEffects> = {}): VjEffects {
  return { ...createVjStageState("stage-epoch", 0).effects, ...patch };
}

function renderInStage(ui: ReactElement) {
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

describe("VjStrobeControl", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("asks for a second tap with the seizure warning the first time in a show", async () => {
    const run = createRun();
    renderInStage(
      <VjStrobeControl
        effects={effectsOf()}
        stageEpoch="show-first-tap"
        run={run}
        isBlocked={false}
      />,
    );
    expect(screen.queryByText(STROBE_WARNING)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start strobe" }));
    expect(run).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(STROBE_WARNING);
    await clickAndSettle(
      screen.getByRole("button", { name: "Start strobe now" }),
    );
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith("setStrobe", true);
  });

  it("starts with one tap later in the same show", async () => {
    const firstRun = createRun();
    const firstRender = renderInStage(
      <VjStrobeControl
        effects={effectsOf()}
        stageEpoch="show-same"
        run={firstRun}
        isBlocked={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start strobe" }));
    await clickAndSettle(
      await screen.findByRole("button", { name: "Start strobe now" }),
    );
    expect(firstRun).toHaveBeenCalledWith("setStrobe", true);
    firstRender.unmount();

    const laterRun = createRun();
    renderInStage(
      <VjStrobeControl
        effects={effectsOf()}
        stageEpoch="show-same"
        run={laterRun}
        isBlocked={false}
      />,
    );
    await clickAndSettle(screen.getByRole("button", { name: "Start strobe" }));
    expect(laterRun).toHaveBeenCalledTimes(1);
    expect(laterRun).toHaveBeenCalledWith("setStrobe", true);
    expect(screen.queryByText(STROBE_WARNING)).not.toBeInTheDocument();
  });

  it("asks again in a new show", async () => {
    const run = createRun();
    const view = renderInStage(
      <VjStrobeControl
        effects={effectsOf()}
        stageEpoch="show-before-restart"
        run={run}
        isBlocked={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start strobe" }));
    await clickAndSettle(
      await screen.findByRole("button", { name: "Start strobe now" }),
    );
    expect(run).toHaveBeenCalledTimes(1);
    view.unmount();

    const runInNewShow = createRun();
    renderInStage(
      <VjStrobeControl
        effects={effectsOf()}
        stageEpoch="show-after-restart"
        run={runInNewShow}
        isBlocked={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start strobe" }));
    expect(runInNewShow).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(STROBE_WARNING);
  });

  it("counts down the seconds left from when it started and announces only the start and the end", () => {
    vi.useFakeTimers({
      toFake: ["Date", "setInterval", "clearInterval"],
    });
    const startedAt = new Date("2026-11-05T22:00:00Z").getTime();
    vi.setSystemTime(startedAt + 3000);
    renderInStage(
      <VjStrobeControl
        effects={effectsOf({ isStrobing: true, strobeStartedAt: startedAt })}
        stageEpoch="show-countdown"
        run={createRun()}
        isBlocked={false}
      />,
    );
    const announcement = screen.getByRole("status");
    expect(announcement).toHaveTextContent("7 s left");
    expect(screen.getAllByText("7 s left")).toHaveLength(2);
    act(() => {
      vi.advanceTimersByTime(4250);
    });
    expect(screen.getByText("3 s left")).toBeInTheDocument();
    expect(announcement).toHaveTextContent("7 s left");
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(announcement).toHaveTextContent("0 s left");
    expect(screen.getAllByText("0 s left")).toHaveLength(2);
  });

  it("stops the strobe", async () => {
    const run = createRun();
    renderInStage(
      <VjStrobeControl
        effects={effectsOf({ isStrobing: true, strobeStartedAt: Date.now() })}
        stageEpoch="show-stop"
        run={run}
        isBlocked={false}
      />,
    );
    await clickAndSettle(screen.getByRole("button", { name: "Stop strobe" }));
    expect(run).toHaveBeenCalledWith("setStrobe", false);
  });

  it("sends nothing while the remote cannot reach the stage", () => {
    const run = createRun();
    renderInStage(
      <VjStrobeControl
        effects={effectsOf()}
        stageEpoch="show-blocked"
        run={run}
        isBlocked
      />,
    );
    const startButton = screen.getByRole("button", { name: "Start strobe" });
    expect(startButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(startButton);
    expect(run).not.toHaveBeenCalled();
    expect(screen.queryByText(STROBE_WARNING)).not.toBeInTheDocument();
  });

  it("names a refused strobe", async () => {
    const run = createRun({
      ok: false,
      code: "vj_rate_limited",
      errorKey: "vj:error.socket.rateLimited",
    });
    renderInStage(
      <VjStrobeControl
        effects={effectsOf({ isStrobing: true, strobeStartedAt: Date.now() })}
        stageEpoch="show-refused"
        run={run}
        isBlocked={false}
      />,
    );
    await clickAndSettle(screen.getByRole("button", { name: "Stop strobe" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That was a lot of taps at once. Wait a second, then tap again",
    );
  });
});
