import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePitchTriageState } from "./usePitchTriageState";

describe("usePitchTriageState", () => {
  it("opens on the given pitch and clears any earlier answered ids", () => {
    const { result } = renderHook(() => usePitchTriageState());

    act(() => result.current.recordAnswered("pitch-1"));
    expect(result.current.answeredPitchIds).toEqual(["pitch-1"]);

    act(() => result.current.open("pitch-2"));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.initialPitchId).toBe("pitch-2");
    expect(result.current.answeredPitchIds).toEqual([]);
  });

  it("resets isOpen, initialPitchId and answeredPitchIds on close", () => {
    const { result } = renderHook(() => usePitchTriageState());

    act(() => result.current.open("pitch-2"));
    act(() => result.current.recordAnswered("pitch-2"));
    act(() => result.current.close());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.initialPitchId).toBeNull();
    expect(result.current.answeredPitchIds).toEqual([]);
  });

  it("calls the onClose callback so a stale pitch selection is cleared with it", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => usePitchTriageState(onClose));

    act(() => result.current.open());
    expect(onClose).not.toHaveBeenCalled();

    act(() => result.current.close());

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
