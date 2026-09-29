import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Pitch } from "../data/desk.data";
import type { usePitchMutations } from "../api/usePitchMutations";
import {
  DECIDED_HOLD_MS,
  usePitchTriageActions,
} from "./usePitchTriageActions";

/**
 * The inbox list is mocked so each case controls whether a decided pitch
 * leaves it (live, after the refetch) or stays (demo's static list), and
 * reduced motion is on so a decision commits at once, with no fade timer.
 */
let listedPitches: Pitch[] = [];

vi.mock("../api/usePitches", () => ({
  usePitches: () => ({ pitches: listedPitches }),
}));

vi.mock("../../../shared/hooks", () => ({
  usePrefersReducedMotion: () => true,
}));

function makePitch(id: string): Pitch {
  return { id } as Pitch;
}

function renderTriage(mutateAsync: ReturnType<typeof vi.fn>) {
  const pitchMutations = {
    triage: { mutateAsync },
  } as unknown as ReturnType<typeof usePitchMutations>;
  return renderHook(() =>
    usePitchTriageActions({
      pitchMutations,
      selectedPitchIds: [],
      clearSelectedPitchIds: () => undefined,
    }),
  );
}

/** Lets the settled request's `.then` callbacks run. */
async function flushRequest(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  listedPitches = [makePitch("pitch-1"), makePitch("pitch-2")];
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePitchTriageActions double-decision guard", () => {
  it("ignores a second y on the same pitch while the first is landing", async () => {
    const mutateAsync = vi.fn(() => Promise.resolve({ id: "pitch-1" }));
    const { result } = renderTriage(mutateAsync);

    act(() => result.current.maybe("pitch-1"));
    act(() => result.current.maybe("pitch-1"));
    await flushRequest();
    // The request has landed but the list still shows the pitch: the gap
    // before the refetch, where a second verdict used to slip through.
    act(() => result.current.maybe("pitch-1"));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("releases the pitch as soon as it leaves the inbox list", async () => {
    const mutateAsync = vi.fn(() => Promise.resolve({ id: "pitch-1" }));
    const { result, rerender } = renderTriage(mutateAsync);

    act(() => result.current.maybe("pitch-1"));
    await flushRequest();
    listedPitches = [makePitch("pitch-2")];
    rerender();
    act(() => result.current.maybe("pitch-1"));

    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });

  it("with a static list (demo), releases the pitch after the hold", async () => {
    vi.useFakeTimers();
    const mutateAsync = vi.fn(() => Promise.resolve({ id: "pitch-1" }));
    const { result } = renderTriage(mutateAsync);

    act(() => result.current.maybe("pitch-1"));
    await flushRequest();
    act(() => {
      vi.advanceTimersByTime(DECIDED_HOLD_MS - 1);
    });
    act(() => result.current.pass("pitch-1"));
    expect(mutateAsync).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    act(() => result.current.pass("pitch-1"));
    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });

  it("releases the pitch at once when the request fails", async () => {
    const mutateAsync = vi.fn(() => Promise.reject(new Error("offline")));
    const { result } = renderTriage(mutateAsync);

    act(() => result.current.maybe("pitch-1"));
    await flushRequest();
    act(() => result.current.maybe("pitch-1"));

    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });

  it("a decision on another pitch is never held back", () => {
    const mutateAsync = vi.fn(() => Promise.resolve({ id: "any" }));
    const { result } = renderTriage(mutateAsync);

    act(() => result.current.maybe("pitch-1"));
    act(() => result.current.pass("pitch-2"));

    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });

  it("clears its hold timers on unmount", async () => {
    vi.useFakeTimers();
    const mutateAsync = vi.fn(() => Promise.resolve({ id: "pitch-1" }));
    const { result, unmount } = renderTriage(mutateAsync);

    act(() => result.current.maybe("pitch-1"));
    await flushRequest();
    const timerCountWhileHeld = vi.getTimerCount();
    unmount();

    // The hold timer is gone (other timers React keeps are not counted on).
    expect(vi.getTimerCount()).toBeLessThan(timerCountWhileHeld);
  });
});
