import type { ReactElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { createVjStageState } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import type { VjCommandOutcome } from "../live/vjStageCommands";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import { VjEffectsSheet } from "./VjEffectsSheet";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

const OK_OUTCOME: VjCommandOutcome = { ok: true, revision: 3, isNoop: false };
const GIF_SPEED_NOTE = "The live clip is a GIF, so it plays at its own speed";

/** A fake runner: a mock to assert on, typed as the runner's generic `run`. */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome));
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

describe("VjEffectsSheet", () => {
  it("sends the speed and each effect switch", async () => {
    const run = createRun();
    renderInStage(
      <VjEffectsSheet
        state={createVjStageState("show-effects", 0)}
        liveClipMediaKind="video"
        run={run}
        isPending={() => false}
        isBlocked={false}
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole("dialog", { name: "Effects" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1x" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await clickAndSettle(screen.getByRole("button", { name: "1.5x" }));
    expect(run).toHaveBeenLastCalledWith("setEffects", { speed: 1.5 });

    await clickAndSettle(
      screen.getByRole("switch", { name: "Black and white" }),
    );
    expect(run).toHaveBeenLastCalledWith("setEffects", { isMonochrome: true });

    await clickAndSettle(screen.getByRole("switch", { name: "Mirror" }));
    expect(run).toHaveBeenLastCalledWith("setEffects", { isMirrored: true });

    await clickAndSettle(screen.getByRole("switch", { name: "Hue cycle" }));
    expect(run).toHaveBeenLastCalledWith("setEffects", { isHueCycling: true });
    expect(run).toHaveBeenCalledTimes(4);
  });

  it("turns an effect off from its switch and holds the controls while one is in flight", async () => {
    const state = createVjStageState("show-effects-off", 0);
    const run = createRun();
    const view = renderInStage(
      <VjEffectsSheet
        state={{ ...state, effects: { ...state.effects, isMirrored: true } }}
        liveClipMediaKind={null}
        run={run}
        isPending={() => false}
        isBlocked={false}
        onClose={() => {}}
      />,
    );
    const mirrorSwitch = screen.getByRole("switch", { name: "Mirror" });
    expect(mirrorSwitch).toHaveAttribute("aria-checked", "true");
    await clickAndSettle(mirrorSwitch);
    expect(run).toHaveBeenLastCalledWith("setEffects", { isMirrored: false });

    view.rerender(
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjEffectsSheet
            state={state}
            liveClipMediaKind={null}
            run={run}
            isPending={(name) => name === "setEffects"}
            isBlocked={false}
            onClose={() => {}}
          />
        </LazyMotion>
      </TestProviders>,
    );
    const heldSwitch = screen.getByRole("switch", { name: "Hue cycle" });
    expect(heldSwitch).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(heldSwitch);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("says the live GIF keeps its own speed", () => {
    const state = createVjStageState("show-gif", 0);
    const gifView = renderInStage(
      <VjEffectsSheet
        state={state}
        liveClipMediaKind="gif"
        run={createRun()}
        isPending={() => false}
        isBlocked={false}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText(GIF_SPEED_NOTE)).toBeInTheDocument();
    gifView.unmount();

    renderInStage(
      <VjEffectsSheet
        state={state}
        liveClipMediaKind="video"
        run={createRun()}
        isPending={() => false}
        isBlocked={false}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByText(GIF_SPEED_NOTE)).not.toBeInTheDocument();
  });
});
