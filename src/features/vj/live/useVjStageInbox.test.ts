import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  type VjStageFrame,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { upgradeVjStageFrame, useVjStageInbox } from "./useVjStageInbox";

/** A frame whose state comes from a backend older than sequences: no setlistPlayback. */
function olderBackendFrame(): VjStageFrame {
  const { setlistPlayback: _setlistPlayback, ...olderState } =
    createVjStageState("stage-older", 1_000);
  return {
    state: olderState as unknown as VjStageState,
    cause: "command",
    sourceClientId: null,
    applyAt: null,
  };
}

describe("upgradeVjStageFrame", () => {
  it("fills setlistPlayback on a state from an older backend", () => {
    const upgraded = upgradeVjStageFrame(olderBackendFrame());
    expect(upgraded.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
    expect(upgraded.state.stageEpoch).toBe("stage-older");
    expect(upgraded.cause).toBe("command");
  });

  it("answers a current frame as it came", () => {
    const currentFrame: VjStageFrame = {
      state: createVjStageState("stage-current", 1_000),
      cause: "command",
      sourceClientId: null,
      applyAt: null,
    };
    expect(upgradeVjStageFrame(currentFrame)).toBe(currentFrame);
  });

  it("answers a frame whose state is not an object as it came", () => {
    const brokenFrame = {
      ...olderBackendFrame(),
      state: null,
    } as unknown as VjStageFrame;
    expect(() => upgradeVjStageFrame(brokenFrame)).not.toThrow();
    expect(upgradeVjStageFrame(brokenFrame)).toBe(brokenFrame);
  });
});

describe("useVjStageInbox", () => {
  it("hands a stage:state frame from an older backend on upgraded", () => {
    const onStageFrame = vi.fn<(frame: VjStageFrame) => void>();
    const { result } = renderHook(() => useVjStageInbox(onStageFrame));
    result.current.handleFrame({
      event: "stage:state",
      payload: olderBackendFrame(),
    });
    expect(onStageFrame).toHaveBeenCalledTimes(1);
    const [handedFrame] = onStageFrame.mock.calls[0] ?? [];
    expect(handedFrame?.state.setlistPlayback).toEqual(
      createVjSetlistPlayback(false),
    );
  });

  it("hands a restore frame from an older backend on upgraded", () => {
    const onStageFrame = vi.fn<(frame: VjStageFrame) => void>();
    const { result } = renderHook(() => useVjStageInbox(onStageFrame));
    result.current.handleFrame({
      event: "stage:state",
      payload: { ...olderBackendFrame(), cause: "restore" },
    });
    const [handedFrame] = onStageFrame.mock.calls[0] ?? [];
    expect(handedFrame?.cause).toBe("restore");
    expect(handedFrame?.state.setlistPlayback.status).toBe("manual");
  });
});
