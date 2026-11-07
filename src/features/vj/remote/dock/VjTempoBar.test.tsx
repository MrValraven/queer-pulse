import type { ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjScreenStatus, VjTempo } from "../../../../shared/contracts/vj";
import { ReducedMotionContext } from "../../../../app/providers/motionPrefs";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalog } from "../../../../test/awaitCatalog";
import { PointerEventStub } from "../../../../test/pointerEventStub";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import { VjTempoBar, type VjTempoBarProps } from "./VjTempoBar";

const DOWNBEAT_AT = 1_000_000;
/** 120 BPM: one beat every 500 ms. */
const BEAT_MS = 500;

const TEMPO: VjTempo = {
  bpm: 120,
  downbeatAt: DOWNBEAT_AT,
  quantize: "off",
  source: "manual",
};

const ACKED: VjCommandOutcome = {
  ok: true,
  revision: 8,
  isNoop: false,
  applyAt: null,
};

const LEAD_MIC: VjScreenStatus["mic"] = {
  level: 0.5,
  detectedBpm: 121,
  confidence: 0.9,
};

function clockAt(serverMs: number, isSynced = true): VjRemoteClock {
  return {
    serverNow: () => serverMs,
    toLocalTime: (time) => time,
    isSynced,
  };
}

let frameCallbacks: FrameRequestCallback[] = [];

function runOneFrame() {
  const callbacks = frameCallbacks;
  frameCallbacks = [];
  act(() => {
    for (const callback of callbacks) callback(0);
  });
}

function Providers({
  children,
  isReducedMotion,
}: {
  children: ReactNode;
  isReducedMotion: boolean;
}) {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <LazyMotion features={domMax}>{children}</LazyMotion>
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

async function renderBar(
  overrides: Partial<VjTempoBarProps> = {},
  isReducedMotion = false,
) {
  const dispatch = vi.fn<VjTempoBarProps["dispatch"]>();
  const setTempo = vi.fn<VjTempoBarProps["setTempo"]>(() =>
    Promise.resolve(ACKED),
  );
  const props: VjTempoBarProps = {
    tempo: TEMPO,
    clock: clockAt(DOWNBEAT_AT + 2 * BEAT_MS + 10),
    leadMic: LEAD_MIC,
    isBlocked: false,
    dispatch,
    setTempo,
    ...overrides,
  };
  const view = render(
    <Providers isReducedMotion={isReducedMotion}>
      <VjTempoBar {...props} />
    </Providers>,
  );
  await awaitCatalog("vj");
  const rerenderWith = (patch: Partial<VjTempoBarProps>) =>
    view.rerender(
      <Providers isReducedMotion={isReducedMotion}>
        <VjTempoBar {...props} {...patch} />
      </Providers>,
    );
  return { ...view, dispatch, setTempo, rerenderWith };
}

function openBpmPopover() {
  fireEvent.click(
    screen.getByRole("button", { name: "Change the tempo, now 120 BPM" }),
  );
  return screen.getByRole("dialog");
}

beforeEach(() => {
  frameCallbacks = [];
  vi.stubGlobal("PointerEvent", PointerEventStub);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VjTempoBar", () => {
  it("shows the BPM", async () => {
    await renderBar();
    const readout = screen.getByRole("button", {
      name: "Change the tempo, now 120 BPM",
    });
    expect(readout.textContent).toBe("BPM120");
    expect(document.querySelector("[data-vj-tempo-bar]")).not.toBeNull();
  });

  it("each tap dispatches tapTempo", async () => {
    const { dispatch } = await renderBar();
    const tap = screen.getByRole("button", { name: "Tap tempo" });
    for (let tapIndex = 0; tapIndex < 3; tapIndex += 1) {
      fireEvent.pointerDown(tap, { pointerId: 1, button: 0 });
      fireEvent.click(tap, { detail: 1 });
    }
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenCalledWith({ kind: "tapTempo" }, "press");
  });

  it("a keyboard tap dispatches tapTempo once", async () => {
    const { dispatch } = await renderBar();
    fireEvent.click(screen.getByRole("button", { name: "Tap tempo" }), {
      detail: 0,
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ kind: "tapTempo" }, "press");
  });

  it("the 1 button dispatches downbeat", async () => {
    const { dispatch } = await renderBar();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Set the first beat of the bar to now",
      }),
    );
    expect(dispatch).toHaveBeenCalledWith({ kind: "downbeat" }, "press");
  });

  it("quantize cycles off, beat, bar", async () => {
    const { dispatch, rerenderWith } = await renderBar();
    fireEvent.click(
      screen.getByRole("button", { name: "Quantize: Off. Tap to change" }),
    );
    expect(dispatch).toHaveBeenLastCalledWith(
      { kind: "cycleQuantize" },
      "press",
    );
    rerenderWith({ tempo: { ...TEMPO, quantize: "beat" } });
    const beatChip = screen.getByRole("button", {
      name: "Quantize: Beat. Tap to change",
    });
    expect(beatChip.getAttribute("data-quantize")).toBe("beat");
    rerenderWith({ tempo: { ...TEMPO, quantize: "bar" } });
    expect(
      screen.getByRole("button", { name: "Quantize: Bar. Tap to change" }),
    ).not.toBeNull();
  });

  it("blocked taps, 1 and quantize dispatch nothing", async () => {
    const { dispatch } = await renderBar({ isBlocked: true });
    fireEvent.pointerDown(screen.getByRole("button", { name: "Tap tempo" }), {
      pointerId: 1,
      button: 0,
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Set the first beat of the bar to now",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Quantize: Off. Tap to change" }),
    );
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("plus sends one BPM more", async () => {
    const { setTempo } = await renderBar();
    openBpmPopover();
    fireEvent.click(screen.getByRole("button", { name: "Faster by 1 BPM" }));
    expect(setTempo).toHaveBeenCalledWith({ bpm: 121 });
  });

  it("double tempo clamps to 200 BPM", async () => {
    const { setTempo } = await renderBar({ tempo: { ...TEMPO, bpm: 150 } });
    fireEvent.click(
      screen.getByRole("button", { name: "Change the tempo, now 150 BPM" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Double tempo" }));
    expect(setTempo).toHaveBeenCalledWith({ bpm: 200 });
  });

  it("out of range input names the range and sends nothing", async () => {
    const { setTempo } = await renderBar();
    openBpmPopover();
    const field = screen.getByLabelText("BPM");
    fireEvent.change(field, { target: { value: "240" } });
    fireEvent.click(screen.getByRole("button", { name: "Set tempo" }));
    expect(setTempo).not.toHaveBeenCalled();
    expect(field.getAttribute("aria-invalid")).toBe("true");
    await waitFor(() => {
      expect(
        screen.getByText("Pick a tempo from 60 to 200 BPM"),
      ).not.toBeNull();
    });
  });

  it("a typed BPM in range sends it", async () => {
    const { setTempo } = await renderBar();
    openBpmPopover();
    fireEvent.change(screen.getByLabelText("BPM"), {
      target: { value: "128,5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Set tempo" }));
    expect(setTempo).toHaveBeenCalledWith({ bpm: 128.5 });
  });

  it("follow the mic is aria-disabled while the lead's mic is off", async () => {
    const { setTempo } = await renderBar({ leadMic: null });
    openBpmPopover();
    const follow = screen.getByRole("button", {
      name: "Follow the lead screen's mic",
    });
    expect(follow.getAttribute("aria-disabled")).toBe("true");
    const descriptionId = follow.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(descriptionId)?.textContent).toBe(
      "Turn on the mic on the lead screen first",
    );
    fireEvent.click(follow);
    expect(setTempo).not.toHaveBeenCalled();
  });

  it("follow the mic sends a mic tempo source", async () => {
    const { setTempo } = await renderBar();
    openBpmPopover();
    fireEvent.click(
      screen.getByRole("button", { name: "Follow the lead screen's mic" }),
    );
    expect(setTempo).toHaveBeenCalledWith({ source: "mic" });
  });

  it("beat dots read hollow until the clock syncs", async () => {
    const { rerenderWith } = await renderBar({
      clock: clockAt(DOWNBEAT_AT, false),
    });
    const dots = document.querySelector("[data-vj-beat-dots]");
    expect(dots?.getAttribute("data-synced")).toBe("false");
    expect(
      screen.getByRole("img", { name: "Syncing the clock with the screens" }),
    ).not.toBeNull();
    rerenderWith({ clock: clockAt(DOWNBEAT_AT + 2 * BEAT_MS + 10) });
    expect(dots?.getAttribute("data-synced")).toBe("true");
  });

  it("lights the dot of the current beat on the synced clock", async () => {
    await renderBar();
    runOneFrame();
    const dots = document.querySelector("[data-vj-beat-dots]");
    expect(dots?.getAttribute("data-beat")).toBe("2");
  });

  it("under reduced motion the dots hold still and the beat number shows", async () => {
    await renderBar({}, true);
    runOneFrame();
    const dots = document.querySelector("[data-vj-beat-dots]");
    expect(dots?.querySelectorAll("[data-vj-beat-dot]")).toHaveLength(0);
    expect(dots?.textContent).toBe("3");
  });

  it("shows the mic badge for a mic tempo", async () => {
    const { rerenderWith } = await renderBar();
    expect(document.querySelector("[data-vj-mic-badge]")).toBeNull();
    rerenderWith({ tempo: { ...TEMPO, source: "mic" } });
    expect(
      screen.getByRole("img", { name: "From the screen's microphone" }),
    ).not.toBeNull();
  });
});
