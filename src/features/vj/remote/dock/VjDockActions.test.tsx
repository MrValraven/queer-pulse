import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { VjActionDispatch } from "../input/vjRemoteAction";
import { VjDockActions, type VjDockActionsProps } from "./VjDockActions";

function renderActions(overrides: Partial<VjDockActionsProps> = {}) {
  const dispatch = vi.fn<VjActionDispatch>();
  const onTurnOnCueMode = vi.fn();
  const onOpenMore = vi.fn();
  const props: VjDockActionsProps = {
    isBlackout: false,
    isBlackoutPending: false,
    isCueMode: false,
    armedClipTitle: null,
    isBlocked: false,
    dispatch,
    onTurnOnCueMode,
    onOpenMore,
    ...overrides,
  };
  const view = render(
    <TestProviders>
      <VjDockActions {...props} />
    </TestProviders>,
  );
  return { ...view, dispatch, onTurnOnCueMode, onOpenMore };
}

/** Holds cue mode in local state, the way the page wires `useVjCueMode`. */
function CueHarness({ armedClipTitle }: { armedClipTitle: string | null }) {
  const [isCueMode, setIsCueMode] = useState(false);
  return (
    <VjDockActions
      isBlackout={false}
      isBlackoutPending={false}
      isCueMode={isCueMode}
      armedClipTitle={armedClipTitle}
      isBlocked={false}
      dispatch={vi.fn()}
      onTurnOnCueMode={() => setIsCueMode(true)}
      onOpenMore={vi.fn()}
    />
  );
}

describe("VjDockActions", () => {
  it("Blackout dispatches blackout and shows pressed", () => {
    const { dispatch, rerender } = renderActions();
    const blackout = screen.getByRole("button", { name: "Blackout" });
    expect(blackout).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(blackout);
    expect(dispatch).toHaveBeenCalledWith({ kind: "blackout" }, "press");

    rerender(
      <TestProviders>
        <VjDockActions
          isBlackout
          isBlackoutPending
          isCueMode={false}
          armedClipTitle={null}
          isBlocked={false}
          dispatch={dispatch}
          onTurnOnCueMode={vi.fn()}
          onOpenMore={vi.fn()}
        />
      </TestProviders>,
    );
    const pressedBlackout = screen.getByRole("button", { name: "Blackout" });
    expect(pressedBlackout).toHaveAttribute("aria-pressed", "true");
    expect(pressedBlackout).toHaveAttribute("aria-busy", "true");
  });

  it("Reset look dispatches resetLook", () => {
    const { dispatch } = renderActions();
    fireEvent.click(screen.getByRole("button", { name: "Reset look" }));
    expect(dispatch).toHaveBeenCalledWith({ kind: "resetLook" }, "press");
  });

  it("Reset look marks itself done while the confirmation shows", () => {
    renderActions({ isResetDone: true });
    expect(screen.getByRole("button", { name: "Reset look" })).toHaveAttribute(
      "data-done",
      "true",
    );
  });

  it("Cue turns cue mode on and becomes Go", async () => {
    render(
      <TestProviders>
        <CueHarness armedClipTitle={null} />
      </TestProviders>,
    );
    const cue = screen.getByRole("button", { name: "Turn on cue mode" });
    cue.focus();
    fireEvent.click(cue);

    const go = await screen.findByRole("button", { name: "Go" });
    expect(go).toHaveAttribute("data-vj-dock-action", "go");
    // The slot keeps one button, so focus stays where the operator left it.
    expect(go).toHaveFocus();
  });

  it("Go is aria-disabled and says Tap a clip to cue it with nothing armed", () => {
    const { dispatch } = renderActions({ isCueMode: true });
    const go = screen.getByRole("button", { name: "Go" });
    expect(go).toHaveAttribute("aria-disabled", "true");
    expect(go).toHaveAccessibleDescription("Tap a clip to cue it");

    fireEvent.click(go);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("Go dispatches go with a clip armed", () => {
    const { dispatch } = renderActions({
      isCueMode: true,
      armedClipTitle: "Glitter rain",
    });
    const go = screen.getByRole("button", {
      name: "Show Glitter rain on the screen",
    });
    expect(go).not.toHaveAttribute("aria-disabled");

    fireEvent.click(go);
    expect(dispatch).toHaveBeenCalledWith({ kind: "go" }, "press");
  });

  it("More opens the more sheet", () => {
    const { onOpenMore } = renderActions();
    const more = screen.getByRole("button", { name: "More controls" });
    expect(more).toHaveAttribute("aria-haspopup", "dialog");

    fireEvent.click(more);
    expect(onOpenMore).toHaveBeenCalledTimes(1);
  });

  it("blocked actions send nothing", () => {
    const { dispatch } = renderActions({
      isBlocked: true,
      isCueMode: true,
      armedClipTitle: "Glitter rain",
    });
    const blackout = screen.getByRole("button", { name: "Blackout" });
    const resetLook = screen.getByRole("button", { name: "Reset look" });
    const go = screen.getByRole("button", {
      name: "Show Glitter rain on the screen",
    });
    for (const button of [blackout, resetLook, go]) {
      expect(button).toHaveAttribute("aria-disabled", "true");
      fireEvent.click(button);
    }
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("blocked actions point at the reason the page names", () => {
    render(
      <TestProviders>
        <p id="vj-blocked-reason">You are offline</p>
        <VjDockActions
          isBlackout={false}
          isBlackoutPending={false}
          isCueMode={false}
          armedClipTitle={null}
          isBlocked
          blockedReasonId="vj-blocked-reason"
          dispatch={vi.fn()}
          onTurnOnCueMode={vi.fn()}
          onOpenMore={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      screen.getByRole("button", { name: "Blackout" }),
    ).toHaveAccessibleDescription("You are offline");
  });
});
