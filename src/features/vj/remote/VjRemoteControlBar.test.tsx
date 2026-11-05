import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import type {
  VjCommandOutcome,
  VjStageCommands,
  VjStageController,
} from "../live/useVjStage";
import { INITIAL_VJ_CONNECTION } from "../realtime/vjTransport";
import { useVjCommandRunner } from "./useVjCommandRunner";
import { VjRemoteControlBar, type VjRemoteSheet } from "./VjRemoteControlBar";

const css = readFileSync("src/features/vj/remote/VjRemote.module.css", "utf8");

const EPOCH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const START_MS = 1_800_000_000_000;

function okOutcome(revision = 2): Promise<VjCommandOutcome> {
  return Promise.resolve({ ok: true, revision, isNoop: false });
}

function stateWith(changes: Partial<VjStageState> = {}): VjStageState {
  return { ...createVjStageState(EPOCH, 0), revision: 1, ...changes };
}

function createCommands() {
  return {
    setPack: vi.fn<VjStageCommands["setPack"]>(() => okOutcome()),
    goClip: vi.fn<VjStageCommands["goClip"]>(() => okOutcome()),
    setTransition: vi.fn<VjStageCommands["setTransition"]>(() => okOutcome()),
    setOverlay: vi.fn<VjStageCommands["setOverlay"]>(() => okOutcome()),
    setEffects: vi.fn<VjStageCommands["setEffects"]>(() => okOutcome()),
    setStrobe: vi.fn<VjStageCommands["setStrobe"]>(() => okOutcome()),
    setShuffle: vi.fn<VjStageCommands["setShuffle"]>(() => okOutcome()),
  };
}

function createController(
  state: VjStageState,
  commands: VjStageCommands,
): VjStageController {
  return {
    isDemo: false,
    connection: { ...INITIAL_VJ_CONNECTION, status: "attached" },
    isConnected: true,
    state,
    lastCause: null,
    lastSourceClientId: null,
    clientId: "remote-client",
    screens: [],
    isLead: false,
    refusal: null,
    commands,
    advance: () => okOutcome(),
    sendStatus: () => undefined,
    subscribeLibrary: () => () => undefined,
  };
}

function BarHarness({
  controller,
  onOpenSheet,
}: {
  controller: VjStageController;
  onOpenSheet: (sheet: VjRemoteSheet) => void;
}) {
  const { run, isPending } = useVjCommandRunner(controller);
  return (
    <VjRemoteControlBar
      state={controller.state}
      isBlocked={false}
      run={run}
      isPending={isPending}
      onOpenSheet={onOpenSheet}
      onHeightChange={() => undefined}
    />
  );
}

function renderBar(state: VjStageState = stateWith()) {
  const commands = createCommands();
  const onOpenSheet = vi.fn<(sheet: VjRemoteSheet) => void>();
  const harnessFor = (nextState: VjStageState) => (
    <BarHarness
      controller={createController(nextState, commands)}
      onOpenSheet={onOpenSheet}
    />
  );
  const view = render(harnessFor(state), { wrapper: TestProviders });
  const rerenderWith = (nextState: VjStageState) =>
    view.rerender(harnessFor(nextState));
  return { commands, onOpenSheet, view, rerenderWith };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("VjRemoteControlBar", () => {
  it("switches between fade and cut", async () => {
    const { commands } = renderBar(
      stateWith({ transition: { mode: "fade", fadeMs: 800 } }),
    );
    const fadeButton = await screen.findByRole("button", { name: "Fade" });
    const cutButton = screen.getByRole("button", { name: "Cut" });
    expect(fadeButton).toHaveAttribute("aria-pressed", "true");
    expect(cutButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(fadeButton);
    expect(commands.setTransition).not.toHaveBeenCalled();

    fireEvent.click(cutButton);
    expect(commands.setTransition).toHaveBeenCalledTimes(1);
    expect(commands.setTransition).toHaveBeenCalledWith({ mode: "cut" });
  });

  it("sends at most one fade length per 100 ms while dragging and the final value on release", async () => {
    const { commands } = renderBar(
      stateWith({ transition: { mode: "fade", fadeMs: 800 } }),
    );
    const slider = await screen.findByRole("slider", { name: "Fade length" });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(START_MS);

    fireEvent.pointerDown(slider);
    fireEvent.change(slider, { target: { value: "900" } });
    vi.setSystemTime(START_MS + 30);
    fireEvent.change(slider, { target: { value: "1000" } });
    vi.setSystemTime(START_MS + 60);
    fireEvent.change(slider, { target: { value: "1100" } });
    vi.setSystemTime(START_MS + 120);
    fireEvent.change(slider, { target: { value: "1200" } });
    vi.setSystemTime(START_MS + 150);
    fireEvent.change(slider, { target: { value: "1300" } });

    expect(commands.setTransition.mock.calls.map(([patch]) => patch)).toEqual([
      { fadeMs: 900 },
      { fadeMs: 1200 },
    ]);

    await act(async () => {
      fireEvent.pointerUp(slider);
      await Promise.resolve();
    });

    expect(commands.setTransition.mock.calls.map(([patch]) => patch)).toEqual([
      { fadeMs: 900 },
      { fadeMs: 1200 },
      { fadeMs: 1300 },
    ]);
    expect(slider).toHaveValue("1300");
    expect(screen.getByText("1.3 s")).toBeInTheDocument();
  });

  it("toggles blackout", async () => {
    const { commands, rerenderWith } = renderBar();
    const blackout = await screen.findByRole("button", { name: "Blackout" });
    expect(blackout).toHaveAttribute("aria-pressed", "false");

    await act(async () => {
      fireEvent.click(blackout);
      await Promise.resolve();
    });
    expect(commands.setEffects).toHaveBeenLastCalledWith({ isBlackout: true });

    rerenderWith(
      stateWith({
        revision: 2,
        effects: { ...stateWith().effects, isBlackout: true },
      }),
    );
    const pressedBlackout = screen.getByRole("button", { name: "Blackout" });
    expect(pressedBlackout).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      fireEvent.click(pressedBlackout);
      await Promise.resolve();
    });
    expect(commands.setEffects).toHaveBeenLastCalledWith({
      isBlackout: false,
    });
  });

  it("holds a control while its command is in flight", async () => {
    const { commands } = renderBar();
    let settle: (outcome: VjCommandOutcome) => void = () => undefined;
    commands.setEffects.mockImplementation(
      () =>
        new Promise<VjCommandOutcome>((resolve) => {
          settle = resolve;
        }),
    );
    const blackout = await screen.findByRole("button", { name: "Blackout" });
    expect(blackout).toHaveAttribute("aria-disabled", "false");

    fireEvent.click(blackout);
    expect(blackout).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(blackout);
    expect(commands.setEffects).toHaveBeenCalledTimes(1);

    await act(async () => {
      settle({ ok: true, revision: 2, isNoop: false });
      await Promise.resolve();
    });
    expect(blackout).toHaveAttribute("aria-disabled", "false");
  });

  it("keeps fade and cut available while the fade slider sends", async () => {
    const { commands } = renderBar(
      stateWith({ transition: { mode: "fade", fadeMs: 800 } }),
    );
    let settleSlider: (outcome: VjCommandOutcome) => void = () => undefined;
    commands.setTransition.mockImplementationOnce(
      () =>
        new Promise<VjCommandOutcome>((resolve) => {
          settleSlider = resolve;
        }),
    );
    const slider = await screen.findByRole("slider", { name: "Fade length" });
    const cutButton = screen.getByRole("button", { name: "Cut" });

    fireEvent.pointerDown(slider);
    fireEvent.change(slider, { target: { value: "1500" } });
    expect(commands.setTransition).toHaveBeenCalledWith({ fadeMs: 1500 });
    expect(cutButton).toHaveAttribute("aria-disabled", "false");
    expect(screen.getByRole("button", { name: "Fade" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );

    await act(async () => {
      settleSlider({ ok: true, revision: 2, isNoop: false });
      await Promise.resolve();
    });
    expect(cutButton).toHaveAttribute("aria-disabled", "false");
  });

  it("holds fade and cut while a mode change waits for its ack", async () => {
    const { commands } = renderBar(
      stateWith({ transition: { mode: "fade", fadeMs: 800 } }),
    );
    let settleMode: (outcome: VjCommandOutcome) => void = () => undefined;
    commands.setTransition.mockImplementationOnce(
      () =>
        new Promise<VjCommandOutcome>((resolve) => {
          settleMode = resolve;
        }),
    );
    const cutButton = await screen.findByRole("button", { name: "Cut" });

    fireEvent.click(cutButton);
    expect(cutButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(cutButton);
    expect(commands.setTransition).toHaveBeenCalledTimes(1);

    await act(async () => {
      settleMode({ ok: true, revision: 2, isNoop: false });
      await Promise.resolve();
    });
    expect(cutButton).toHaveAttribute("aria-disabled", "false");
  });

  it("draws the status line inside the bar", async () => {
    const commands = createCommands();
    const controller = createController(stateWith(), commands);
    function StatusHarness() {
      const { run, isPending } = useVjCommandRunner(controller);
      return (
        <VjRemoteControlBar
          state={controller.state}
          isBlocked={false}
          run={run}
          isPending={isPending}
          onOpenSheet={() => undefined}
          onHeightChange={() => undefined}
          statusLine={<p data-testid="status-slot" />}
        />
      );
    }
    render(<StatusHarness />, { wrapper: TestProviders });

    const slot = await screen.findByTestId("status-slot");
    expect(slot.closest("[data-vj-remote-bar]")).not.toBeNull();
  });

  it("portals to the body above the consent banner", async () => {
    const { view, onOpenSheet } = renderBar();
    await screen.findByRole("button", { name: "Blackout" });
    const bar = document.querySelector("[data-vj-remote-bar]");

    expect(bar).not.toBeNull();
    expect(bar?.parentElement).toBe(document.body);
    expect(view.container.contains(bar)).toBe(false);
    expect(bar).toHaveAttribute("data-theme", "dark");
    expect(css).toMatch(
      /\.bar\s*\{[^}]*position:\s*fixed;[^}]*bottom:\s*var\(--consent-inset,\s*0px\);/,
    );
    expect(css).toMatch(
      /\.bar\s*\{[^}]*padding-bottom:\s*max\(var\(--gap-sm\),\s*var\(--bottom-inset\)\);/,
    );
    expect(css).toMatch(/\.bar\s*\{[^}]*z-index:\s*var\(--z-nav\);/);

    fireEvent.click(screen.getByRole("button", { name: "Effects" }));
    expect(onOpenSheet).toHaveBeenCalledWith("effects");
  });
});
