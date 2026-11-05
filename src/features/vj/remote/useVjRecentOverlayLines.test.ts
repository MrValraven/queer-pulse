import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY } from "../vj.constants";
import { useVjRecentOverlayLines } from "./useVjRecentOverlayLines";

function storedLines(): unknown {
  const raw = window.localStorage.getItem(VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

describe("useVjRecentOverlayLines", () => {
  beforeEach(() => {
    window.localStorage.removeItem(VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps 10 lines, newest first, without repeats", () => {
    const { result } = renderHook(() => useVjRecentOverlayLines());
    act(() => {
      for (let lineNumber = 1; lineNumber <= 12; lineNumber += 1) {
        result.current.remember(`Line ${lineNumber}`);
      }
    });
    expect(result.current.lines).toHaveLength(10);
    expect(result.current.lines[0]).toBe("Line 12");
    expect(result.current.lines.at(-1)).toBe("Line 3");

    act(() => {
      result.current.remember("  Line 7  ");
    });
    expect(result.current.lines).toHaveLength(10);
    expect(result.current.lines[0]).toBe("Line 7");
    expect(result.current.lines[1]).toBe("Line 12");
    expect(new Set(result.current.lines).size).toBe(10);
    expect(storedLines()).toEqual(result.current.lines);

    const { result: reloaded } = renderHook(() => useVjRecentOverlayLines());
    expect(reloaded.current.lines).toEqual(result.current.lines);
  });

  it("ignores a blank line", () => {
    const { result } = renderHook(() => useVjRecentOverlayLines());
    act(() => {
      result.current.remember("   ");
    });
    expect(result.current.lines).toEqual([]);
  });

  it("survives blocked storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    const { result } = renderHook(() => useVjRecentOverlayLines());
    expect(result.current.lines).toEqual([]);
    act(() => {
      result.current.remember("Doors at ten");
    });
    expect(result.current.lines).toEqual(["Doors at ten"]);
    act(() => {
      result.current.clear();
    });
    expect(result.current.lines).toEqual([]);
  });

  it("reads past a saved value that is not a list of lines", () => {
    window.localStorage.setItem(VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY, "{oops");
    const { result } = renderHook(() => useVjRecentOverlayLines());
    expect(result.current.lines).toEqual([]);
  });

  it("clears the lines", () => {
    const { result } = renderHook(() => useVjRecentOverlayLines());
    act(() => {
      result.current.remember("Welcome in");
      result.current.remember("Last call");
    });
    expect(storedLines()).toEqual(["Last call", "Welcome in"]);
    act(() => {
      result.current.clear();
    });
    expect(result.current.lines).toEqual([]);
    expect(storedLines()).toBeNull();
  });
});
