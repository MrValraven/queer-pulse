import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VjTempo, VjTransition } from "../../../../shared/contracts/vj";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalogUnderFakeTimers } from "../../../../test/awaitCatalogUnderFakeTimers";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { VjTransitionRow, type VjTransitionRowProps } from "./VjTransitionRow";

vi.mock("../rules/vjHaptics", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../rules/vjHaptics")>()),
  vibrateVj: vi.fn(() => true),
}));

/** 120 BPM: one beat every 500 ms. */
const TEMPO: VjTempo = {
  bpm: 120,
  downbeatAt: 1_000_000,
  quantize: "off",
  source: "manual",
};

const FADE_MS: VjTransition = {
  mode: "fade",
  length: { unit: "ms", value: 800 },
};

const FADE_BEATS: VjTransition = {
  mode: "fade",
  length: { unit: "beats", value: 4 },
};

const ACKED: VjCommandOutcome = {
  ok: true,
  revision: 8,
  isNoop: false,
  applyAt: null,
};

async function renderRow(overrides: Partial<VjTransitionRowProps> = {}) {
  const setTransition = vi.fn<VjTransitionRowProps["setTransition"]>(() =>
    Promise.resolve(ACKED),
  );
  const setSpeed = vi.fn<VjTransitionRowProps["setSpeed"]>(() =>
    Promise.resolve(ACKED),
  );
  const onNeedFlashConsent =
    vi.fn<VjTransitionRowProps["onNeedFlashConsent"]>();
  const onRefused = vi.fn<NonNullable<VjTransitionRowProps["onRefused"]>>();
  const props: VjTransitionRowProps = {
    transition: FADE_MS,
    tempo: TEMPO,
    speed: 1,
    liveMediaKind: "video",
    isBlocked: false,
    stateRevision: 7,
    hasFlashConsent: false,
    onNeedFlashConsent,
    setTransition,
    setSpeed,
    onRefused,
    ...overrides,
  };
  const wrap = (rowProps: VjTransitionRowProps) => (
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjTransitionRow {...rowProps} />
      </LazyMotion>
    </TestProviders>
  );
  const view = render(wrap(props));
  await awaitCatalogUnderFakeTimers("vj");
  const rerenderWith = (patch: Partial<VjTransitionRowProps>) =>
    view.rerender(wrap({ ...props, ...patch }));
  return {
    ...view,
    setTransition,
    setSpeed,
    onNeedFlashConsent,
    onRefused,
    rerenderWith,
  };
}

function openPicker(modeLabel = "Fade") {
  fireEvent.click(
    screen.getByRole("button", { name: `Transition: ${modeLabel}. Change it` }),
  );
  return screen.getByRole("dialog");
}

function describedByIdsOf(element: Element): string[] {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter((id) => id !== "");
}

/** Every aria-disabled control in the row, the picker and the speed popover. */
function disabledControlsIn(container: Element): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[aria-disabled="true"]'),
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("VjTransitionRow", () => {
  it("picking iris sends the mode", async () => {
    const { setTransition } = await renderRow();
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "Iris" }));
    expect(setTransition).toHaveBeenCalledWith({ mode: "iris" });
    expect(document.querySelector("[data-vj-transition-row]")).not.toBeNull();
  });

  it("picking dip to white asks for flash consent first", async () => {
    const { setTransition, onNeedFlashConsent } = await renderRow();
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "Dip to white" }));
    expect(setTransition).not.toHaveBeenCalled();
    expect(onNeedFlashConsent).toHaveBeenCalledTimes(1);
    const [anchor, onConsented, transitionMode] =
      onNeedFlashConsent.mock.calls[0] ?? [];
    expect(transitionMode).toBe("dipWhite");
    expect(anchor).toBe(
      screen.getByRole("button", { name: "Transition: Fade. Change it" }),
    );
    act(() => onConsented?.());
    expect(setTransition).toHaveBeenCalledWith({ mode: "dipWhite" });
  });

  it("with consent given, dip to white sends at once", async () => {
    const { setTransition, onNeedFlashConsent } = await renderRow({
      hasFlashConsent: true,
    });
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "Dip to white" }));
    expect(onNeedFlashConsent).not.toHaveBeenCalled();
    expect(setTransition).toHaveBeenCalledWith({ mode: "dipWhite" });
  });

  it("a refused mode rolls back and names the reason", async () => {
    const { setTransition, onRefused } = await renderRow();
    setTransition.mockResolvedValueOnce({
      ok: false,
      code: "vj_transition_mode_invalid",
      errorKey: "vj:error.socket.transitionModeInvalid",
    });
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "Iris" }));
    expect(
      screen.getByRole("button", { name: "Transition: Iris. Change it" }),
    ).not.toBeNull();
    await waitFor(() => {
      expect(onRefused).toHaveBeenCalledWith(
        expect.objectContaining({
          errorKey: "vj:error.socket.transitionModeInvalid",
        }),
        "mode",
      );
    });
    // The rollback is a state update from the refused send's continuation,
    // so its render lands on a later task than the onRefused call.
    expect(
      await screen.findByRole("button", {
        name: "Transition: Fade. Change it",
      }),
    ).not.toBeNull();
  });

  it("beat chips send a beats length", async () => {
    const { setTransition } = await renderRow({ transition: FADE_BEATS });
    const fourBeats = screen.getByRole("button", { name: "4 beats" });
    expect(fourBeats.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "8 beats" }));
    expect(setTransition).toHaveBeenCalledWith({
      length: { unit: "beats", value: 8 },
    });
  });

  it("the ms slider throttles and sends the final value", async () => {
    vi.useFakeTimers();
    const { setTransition } = await renderRow();
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "1000" } });
    fireEvent.change(slider, { target: { value: "1100" } });
    fireEvent.change(slider, { target: { value: "1200" } });
    expect(setTransition).toHaveBeenCalledTimes(1);
    expect(setTransition).toHaveBeenLastCalledWith({
      length: { unit: "ms", value: 1000 },
    });
    fireEvent.pointerUp(slider);
    expect(setTransition).toHaveBeenCalledTimes(2);
    expect(setTransition).toHaveBeenLastCalledWith({
      length: { unit: "ms", value: 1200 },
    });
  });

  it("switching units converts at the stage tempo", async () => {
    const msRow = await renderRow();
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "Beats" }));
    // 800 ms at 120 BPM is 1.6 beats; the nearest count is 2.
    expect(msRow.setTransition).toHaveBeenLastCalledWith({
      length: { unit: "beats", value: 2 },
    });
    msRow.unmount();

    const beatsRow = await renderRow({ transition: FADE_BEATS });
    openPicker();
    fireEvent.click(screen.getByRole("button", { name: "Seconds" }));
    // 4 beats at 120 BPM is 2000 ms.
    expect(beatsRow.setTransition).toHaveBeenLastCalledWith({
      length: { unit: "ms", value: 2000 },
    });
  });

  it("cut hides the length control", async () => {
    const { rerenderWith } = await renderRow({ transition: FADE_BEATS });
    expect(document.querySelector("[data-vj-length]")).not.toBeNull();
    rerenderWith({
      transition: { ...FADE_BEATS, mode: "cut" },
      stateRevision: 9,
    });
    await waitFor(() => {
      expect(document.querySelector("[data-vj-length]")).toBeNull();
    });
  });

  it("the speed popover sends 4x", async () => {
    const { setSpeed } = await renderRow();
    fireEvent.click(
      screen.getByRole("button", { name: "Clip speed, 1x. Change it" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "4x" }));
    expect(setSpeed).toHaveBeenCalledWith(4);
  });

  it("the speed popover notes that a live GIF keeps its own speed", async () => {
    await renderRow({ liveMediaKind: "gif" });
    fireEvent.click(
      screen.getByRole("button", { name: "Clip speed, 1x. Change it" }),
    );
    expect(
      screen.getByText("The live clip is a GIF, so it plays at its own speed"),
    ).not.toBeNull();
  });

  it("a blocked row points each disabled control at the reason line", async () => {
    const blocked = { isBlocked: true, blockedReasonId: "status-line" };
    const beatsRow = await renderRow({ ...blocked, transition: FADE_BEATS });
    const row = document.querySelector("[data-vj-transition-row]");
    if (row === null) throw new Error("transition row not rendered");
    const beatChips = disabledControlsIn(row);
    expect(beatChips).toHaveLength(5);
    for (const chip of beatChips) {
      expect(describedByIdsOf(chip)).toContain("status-line");
    }

    const picker = openPicker();
    const pickerControls = disabledControlsIn(picker);
    // Eleven transitions and the two units.
    expect(pickerControls).toHaveLength(13);
    for (const control of pickerControls) {
      expect(describedByIdsOf(control)).toContain("status-line");
    }
    beatsRow.unmount();

    await renderRow(blocked);
    expect(describedByIdsOf(screen.getByRole("slider"))).toEqual([
      "status-line",
    ]);
    fireEvent.click(
      screen.getByRole("button", { name: "Clip speed, 1x. Change it" }),
    );
    const speedOptions = disabledControlsIn(screen.getByRole("dialog"));
    expect(speedOptions).toHaveLength(6);
    for (const option of speedOptions) {
      expect(describedByIdsOf(option)).toEqual(["status-line"]);
    }
  });

  it("an open row names no reason on its controls", async () => {
    await renderRow({ transition: FADE_BEATS, blockedReasonId: "status-line" });
    const picker = openPicker();
    const controls = [
      ...screen.getAllByRole("button", { name: /beats?$/ }),
      ...Array.from(picker.querySelectorAll("button")),
    ];
    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) {
      expect(describedByIdsOf(control)).not.toContain("status-line");
    }
  });
});
