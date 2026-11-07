import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VjMix } from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalogUnderFakeTimers } from "../../../../../test/awaitCatalogUnderFakeTimers";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VjCrossfader } from "../../kit/VjCrossfader";
import {
  useVjCrossfaderSend,
  type UseVjCrossfaderSendOptions,
  type VjMixPatch,
} from "./useVjCrossfaderSend";

const MIX: VjMix = {
  clipId: "c0000000-0000-4000-8000-000000000001",
  amount: 0,
  blendMode: "normal",
};

function okOutcome(revision: number): VjCommandOutcome {
  return { ok: true, revision, isNoop: false, applyAt: null };
}

function createSetMix(revision = 7) {
  return vi.fn<(patch: VjMixPatch) => Promise<VjCommandOutcome>>(() =>
    Promise.resolve(okOutcome(revision)),
  );
}

/** The fader wired the way the sheet and the split dock wire it. */
function CrossfaderHarness(props: {
  setMix: UseVjCrossfaderSendOptions["setMix"];
}) {
  const send = useVjCrossfaderSend({
    mix: MIX,
    stateRevision: 6,
    isBlocked: false,
    setMix: props.setMix,
  });
  return (
    <VjCrossfader
      value={send.value}
      onChange={send.change}
      onRelease={send.release}
      isBlocked={false}
      hasMixClip
    />
  );
}

async function renderHarness(setMix: UseVjCrossfaderSendOptions["setMix"]) {
  render(
    <TestProviders>
      <CrossfaderHarness setMix={setMix} />
    </TestProviders>,
  );
  await awaitCatalogUnderFakeTimers("vj");
  return screen.getByRole("slider", { name: "Crossfader" });
}

/** Pins the clock the fader's send throttle reads. */
function setNow(milliseconds: number) {
  vi.spyOn(performance, "now").mockReturnValue(milliseconds);
}

describe("useVjCrossfaderSend", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("sends at most one amount per 50 ms while dragging", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const setMix = createSetMix();
    const slider = await renderHarness(setMix);
    setNow(1000);
    fireEvent.change(slider, { target: { value: "10" } });
    setNow(1020);
    fireEvent.change(slider, { target: { value: "20" } });
    setNow(1040);
    fireEvent.change(slider, { target: { value: "30" } });
    expect(setMix).toHaveBeenCalledTimes(1);
    expect(setMix).toHaveBeenLastCalledWith({ amount: 0.1 });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(setMix).toHaveBeenCalledTimes(2);
    expect(setMix).toHaveBeenLastCalledWith({ amount: 0.3 });
  });

  it("sends the final amount on release", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const setMix = createSetMix();
    const slider = await renderHarness(setMix);
    setNow(1000);
    fireEvent.change(slider, { target: { value: "40" } });
    setNow(1010);
    fireEvent.change(slider, { target: { value: "65" } });
    fireEvent.pointerUp(slider);
    expect(setMix).toHaveBeenCalledTimes(2);
    expect(setMix).toHaveBeenLastCalledWith({ amount: 0.65 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(setMix).toHaveBeenCalledTimes(2);
  });

  it("sends each value the fader hands it at once, rounded to 0.01", () => {
    const setMix = createSetMix();
    const { result } = renderHook(() =>
      useVjCrossfaderSend({
        mix: MIX,
        stateRevision: 6,
        isBlocked: false,
        setMix,
      }),
    );
    act(() => {
      result.current.change(0.2);
      result.current.change(0.304);
    });
    expect(setMix).toHaveBeenCalledTimes(2);
    expect(setMix).toHaveBeenLastCalledWith({ amount: 0.3 });
  });

  it("holds the dragged value until the revision lands", async () => {
    const setMix = createSetMix(7);
    const { result, rerender } = renderHook(
      (props: { amount: number; stateRevision: number }) =>
        useVjCrossfaderSend({
          mix: { ...MIX, amount: props.amount },
          stateRevision: props.stateRevision,
          isBlocked: false,
          setMix,
        }),
      { initialProps: { amount: 0, stateRevision: 6 } },
    );
    act(() => {
      result.current.change(0.4);
      result.current.release();
    });
    await act(() => Promise.resolve());
    expect(result.current.value).toBe(0.4);
    // An older state lands first: the fader keeps the dragged amount.
    rerender({ amount: 0, stateRevision: 6 });
    expect(result.current.value).toBe(0.4);
    rerender({ amount: 0.4, stateRevision: 7 });
    expect(result.current.value).toBe(0.4);
    // The draft is gone: a later stage amount shows as is.
    rerender({ amount: 0.55, stateRevision: 8 });
    expect(result.current.value).toBe(0.55);
  });

  it("sends nothing while blocked", () => {
    const setMix = createSetMix();
    const { result } = renderHook(() =>
      useVjCrossfaderSend({
        mix: MIX,
        stateRevision: 6,
        isBlocked: true,
        setMix,
      }),
    );
    act(() => {
      result.current.change(0.5);
      result.current.release();
    });
    expect(setMix).not.toHaveBeenCalled();
    expect(result.current.value).toBe(0);
  });
});
