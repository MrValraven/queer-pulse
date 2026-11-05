import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SubprofileDTO } from "./api/subprofiles.api";
import { useHeldKindChange } from "./useHeldKindChange";

/**
 * The hold-then-release contract behind the Type field: a saved change waits
 * for the counted exits, applies once, and still applies when the field
 * unmounts before the exits arrive.
 */

const SAVED = { id: "persona-1", kind: "dj" } as SubprofileDTO;

function renderHeldChange() {
  const applyKindChange = vi.fn();
  const rendered = renderHook(() => useHeldKindChange(applyKindChange));
  return { ...rendered, applyKindChange };
}

describe("useHeldKindChange", () => {
  it("applies once after the counted releases", () => {
    const { result, applyKindChange } = renderHeldChange();
    act(() => result.current.hold(SAVED, 2));
    act(() => result.current.release());
    expect(applyKindChange).not.toHaveBeenCalled();
    act(() => result.current.release());
    expect(applyKindChange).toHaveBeenCalledTimes(1);
    expect(applyKindChange).toHaveBeenCalledWith(SAVED);
  });

  it("applies on unmount when the releases never come", () => {
    const { result, applyKindChange, unmount } = renderHeldChange();
    act(() => result.current.hold(SAVED, 2));
    act(() => result.current.release());
    unmount();
    expect(applyKindChange).toHaveBeenCalledTimes(1);
    expect(applyKindChange).toHaveBeenCalledWith(SAVED);
  });

  it("never applies twice", () => {
    const { result, applyKindChange, unmount } = renderHeldChange();
    act(() => result.current.hold(SAVED, 1));
    act(() => result.current.release());
    act(() => result.current.release());
    unmount();
    expect(applyKindChange).toHaveBeenCalledTimes(1);
  });

  it("does nothing on release or unmount with no change held", () => {
    const { result, applyKindChange, unmount } = renderHeldChange();
    act(() => result.current.release());
    unmount();
    expect(applyKindChange).not.toHaveBeenCalled();
  });
});
