import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  resetDeskLetterShortcutsForTests,
  setDeskLetterShortcutsEnabled,
  useDeskLetterShortcutsEnabled,
} from "./deskLetterShortcuts";

const STORAGE_KEY = "qp:magazine:desk-letter-shortcuts";

afterEach(() => {
  resetDeskLetterShortcutsForTests();
  localStorage.removeItem(STORAGE_KEY);
});

describe("deskLetterShortcuts", () => {
  it("starts with the shortcuts on", () => {
    const { result } = renderHook(() => useDeskLetterShortcutsEnabled());
    expect(result.current).toBe(true);
  });

  it("turning them off re-renders readers and persists the choice", () => {
    const { result } = renderHook(() => useDeskLetterShortcutsEnabled());

    act(() => setDeskLetterShortcutsEnabled(false));

    expect(result.current).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("off");
  });

  it("turning them back on stores the on value", () => {
    act(() => setDeskLetterShortcutsEnabled(false));
    act(() => setDeskLetterShortcutsEnabled(true));

    expect(localStorage.getItem(STORAGE_KEY)).toBe("on");
  });
});
