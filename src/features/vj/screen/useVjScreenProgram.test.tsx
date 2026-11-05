import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjShuffle,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjCommandOutcome } from "../live/useVjStage";
import { VJ_LEAD_ADVANCE_FALLBACK_MS } from "../vj.constants";
import {
  useVjScreenProgram,
  type VjScreenProgramInput,
} from "./useVjScreenProgram";

const READY_CLIP_IDS = ["clip-1", "clip-2", "clip-3", "clip-4"];
const SECONDS_SHUFFLE: VjShuffle = {
  isOn: true,
  intervalKind: "seconds",
  intervalValue: 8,
  bpm: 120,
};
const INTERVAL_MS = 8000;

/** A small linear congruential generator, so every run picks the same order. */
function seededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % 4294967296;
    return current / 4294967296;
  };
}

function stageState(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState("epoch-1", 0),
    activePackId: "pack-1",
    liveClipId: "clip-1",
    clipSequence: 1,
    revision: 1,
    shuffle: SECONDS_SHUFFLE,
    ...changes,
  };
}

const OK_OUTCOME: VjCommandOutcome = { ok: true, revision: 2, isNoop: false };

function renderProgram(changes: Partial<VjScreenProgramInput> = {}) {
  const advance = vi.fn<VjScreenProgramInput["advance"]>(() =>
    Promise.resolve(OK_OUTCOME),
  );
  const initialProps: VjScreenProgramInput = {
    state: stageState(),
    isConnected: true,
    isLead: true,
    readyClipIds: READY_CLIP_IDS,
    advance,
    random: seededRandom(7),
    ...changes,
  };
  const view = renderHook(
    (props: VjScreenProgramInput) => useVjScreenProgram(props),
    { initialProps },
  );
  let currentProps = initialProps;
  const update = (next: Partial<VjScreenProgramInput>): void => {
    currentProps = { ...currentProps, ...next };
    view.rerender(currentProps);
  };
  return { ...view, advance: vi.mocked(initialProps.advance), update };
}

async function advanceTime(milliseconds: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useVjScreenProgram", () => {
  it("the lead asks the server and switches only on the echo", async () => {
    const { result, advance, update } = renderProgram();
    expect(result.current).toEqual({
      displayedClipId: "clip-1",
      isLocal: false,
    });

    await advanceTime(INTERVAL_MS);
    expect(advance).toHaveBeenCalledTimes(1);
    const expectedClipSequence = advance.mock.calls[0]?.[0];
    const pickedClipId = advance.mock.calls[0]?.[1];
    expect(expectedClipSequence).toBe(1);
    expect(pickedClipId).not.toBe("clip-1");
    expect(READY_CLIP_IDS).toContain(pickedClipId);
    expect(result.current.displayedClipId).toBe("clip-1");

    update({
      state: stageState({
        clipSequence: 2,
        revision: 2,
        liveClipId: pickedClipId ?? null,
      }),
    });
    expect(result.current).toEqual({
      displayedClipId: pickedClipId,
      isLocal: false,
    });
  });

  it("falls back to switching locally when the echo is 2 s late", async () => {
    const { result, advance } = renderProgram();
    await advanceTime(INTERVAL_MS);
    const pickedClipId = advance.mock.calls[0]?.[1];

    await advanceTime(VJ_LEAD_ADVANCE_FALLBACK_MS - 1);
    expect(result.current.displayedClipId).toBe("clip-1");

    await advanceTime(1);
    expect(result.current).toEqual({
      displayedClipId: pickedClipId,
      isLocal: true,
    });

    // Still the connected lead: the next pick is reported again with the
    // clipSequence it holds, and switches locally once more with no echo.
    await advanceTime(INTERVAL_MS);
    expect(advance).toHaveBeenCalledTimes(2);
    expect(advance.mock.calls[1]?.[0]).toBe(1);
    expect(result.current.displayedClipId).toBe(pickedClipId);
    await advanceTime(VJ_LEAD_ADVANCE_FALLBACK_MS);
    expect(result.current.displayedClipId).not.toBe(pickedClipId);
    expect(result.current.isLocal).toBe(true);
  });

  it("switches locally at once when the report never left the page", async () => {
    const advance = vi.fn<VjScreenProgramInput["advance"]>(() =>
      Promise.resolve({ ok: false, code: "timeout", errorKey: null }),
    );
    const { result } = renderProgram({ advance });
    await advanceTime(INTERVAL_MS);
    expect(result.current.isLocal).toBe(true);
    expect(result.current.displayedClipId).toBe(advance.mock.calls[0]?.[1]);
  });

  it("a lead in local mode returns to the stage on the next applied stage:state", async () => {
    const advance = vi.fn<VjScreenProgramInput["advance"]>(() =>
      Promise.resolve({ ok: false, code: "failed", errorKey: null }),
    );
    const { result, update } = renderProgram({ advance });
    await advanceTime(INTERVAL_MS);
    expect(result.current.isLocal).toBe(true);
    expect(result.current.displayedClipId).not.toBe("clip-1");

    // Same clipSequence and live clip, newer revision (an overlay change).
    update({
      state: stageState({
        revision: 2,
        overlay: { text: "Hello", style: "big", isVisible: true },
      }),
    });
    expect(result.current).toEqual({
      displayedClipId: "clip-1",
      isLocal: false,
    });
  });

  it("a follower never runs the clock while connected", async () => {
    const { result, advance } = renderProgram({ isLead: false });
    await advanceTime(INTERVAL_MS * 4);
    expect(advance).not.toHaveBeenCalled();
    expect(result.current).toEqual({
      displayedClipId: "clip-1",
      isLocal: false,
    });
  });

  it("keeps shuffling locally while the socket is down and snaps to the stage on reattach", async () => {
    const { result, advance, update } = renderProgram({ isLead: false });
    update({ isConnected: false });

    await advanceTime(INTERVAL_MS);
    const firstLocalClipId = result.current.displayedClipId;
    expect(firstLocalClipId).not.toBe("clip-1");
    expect(result.current.isLocal).toBe(true);

    await advanceTime(INTERVAL_MS);
    expect(result.current.displayedClipId).not.toBe(firstLocalClipId);
    expect(advance).not.toHaveBeenCalled();

    // Reattached with the same stage state: the screen snaps back to it.
    update({ isConnected: true });
    expect(result.current).toEqual({
      displayedClipId: "clip-1",
      isLocal: false,
    });
    await advanceTime(INTERVAL_MS * 2);
    expect(result.current.displayedClipId).toBe("clip-1");
  });

  it("a manual tap restarts the interval from that moment", async () => {
    const { advance, update } = renderProgram();
    await advanceTime(3000);
    update({
      state: stageState({ clipSequence: 2, revision: 2, liveClipId: "clip-3" }),
    });

    await advanceTime(INTERVAL_MS - 1);
    expect(advance).not.toHaveBeenCalled();
    await advanceTime(1);
    expect(advance).toHaveBeenCalledTimes(1);
    expect(advance.mock.calls[0]?.[0]).toBe(2);
  });

  it("re-arms after a stale clip sequence ack snaps the state", async () => {
    const advance = vi.fn<VjScreenProgramInput["advance"]>(() =>
      Promise.resolve({
        ok: false,
        code: "vj_stale_clip_sequence",
        errorKey: null,
      }),
    );
    const { result, update } = renderProgram({ advance });
    await advanceTime(INTERVAL_MS);
    expect(advance).toHaveBeenCalledTimes(1);
    expect(result.current.isLocal).toBe(false);

    // The hook snapped to the ack's state (its lastCause reads null then).
    update({
      state: stageState({ clipSequence: 5, revision: 6, liveClipId: "clip-4" }),
    });
    expect(result.current.displayedClipId).toBe("clip-4");
    await advanceTime(VJ_LEAD_ADVANCE_FALLBACK_MS);
    expect(result.current).toEqual({
      displayedClipId: "clip-4",
      isLocal: false,
    });

    await advanceTime(INTERVAL_MS);
    expect(advance).toHaveBeenCalledTimes(2);
    expect(advance.mock.calls[1]?.[0]).toBe(5);
  });

  it("draws only from ready clips of the active pack and holds when none are ready", async () => {
    const { result, update } = renderProgram({
      isConnected: false,
      readyClipIds: [],
    });
    await advanceTime(INTERVAL_MS * 2);
    expect(result.current).toEqual({
      displayedClipId: "clip-1",
      isLocal: false,
    });

    update({ readyClipIds: ["clip-3"] });
    await advanceTime(INTERVAL_MS);
    expect(result.current).toEqual({
      displayedClipId: "clip-3",
      isLocal: true,
    });
  });

  it("does not run the clock with no active pack", async () => {
    const { result } = renderProgram({
      isConnected: false,
      state: stageState({ activePackId: null }),
    });
    await advanceTime(INTERVAL_MS * 2);
    expect(result.current.displayedClipId).toBe("clip-1");
  });

  it("spaces beats by the tempo", async () => {
    const { result } = renderProgram({
      isConnected: false,
      state: stageState({
        shuffle: {
          isOn: true,
          intervalKind: "beats",
          intervalValue: 8,
          bpm: 120,
        },
      }),
    });
    await advanceTime(3999);
    expect(result.current.displayedClipId).toBe("clip-1");
    await advanceTime(1);
    expect(result.current.displayedClipId).not.toBe("clip-1");
  });

  it("stops when shuffle goes off", async () => {
    const { result, update } = renderProgram({ isConnected: false });
    await advanceTime(INTERVAL_MS);
    const shownClipId = result.current.displayedClipId;
    expect(shownClipId).not.toBe("clip-1");

    update({
      state: stageState({ shuffle: { ...SECONDS_SHUFFLE, isOn: false } }),
    });
    const afterOffClipId = result.current.displayedClipId;
    await advanceTime(INTERVAL_MS * 3);
    expect(result.current.displayedClipId).toBe(afterOffClipId);
  });
});

describe("useVjScreenProgram lead in local mode", () => {
  it("a connected lead in local mode reports its next pick with the held clipSequence and reconverges on the echo", async () => {
    const advance = vi
      .fn<VjScreenProgramInput["advance"]>()
      .mockResolvedValueOnce({ ok: false, code: "failed", errorKey: null })
      .mockResolvedValue(OK_OUTCOME);
    const { result, update } = renderProgram({ advance });
    await advanceTime(INTERVAL_MS);
    const localClipId = advance.mock.calls[0]?.[1];
    expect(result.current).toEqual({
      displayedClipId: localClipId,
      isLocal: true,
    });

    await advanceTime(INTERVAL_MS);
    expect(advance).toHaveBeenCalledTimes(2);
    expect(advance.mock.calls[1]?.[0]).toBe(1);
    const reportedClipId = advance.mock.calls[1]?.[1];
    expect(reportedClipId).not.toBe(localClipId);
    // Waiting for the echo: the local pick stays on screen.
    expect(result.current.displayedClipId).toBe(localClipId);

    update({
      state: stageState({
        clipSequence: 2,
        revision: 2,
        liveClipId: reportedClipId ?? null,
      }),
    });
    expect(result.current).toEqual({
      displayedClipId: reportedClipId,
      isLocal: false,
    });
    await advanceTime(VJ_LEAD_ADVANCE_FALLBACK_MS);
    expect(result.current).toEqual({
      displayedClipId: reportedClipId,
      isLocal: false,
    });
  });
});
