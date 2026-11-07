import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VJ_EFFECT_IDS } from "../../../../shared/contracts/vj";
import {
  VJ_REMOTE_CUE_MODE_STORAGE_KEY,
  VJ_REMOTE_DOCK_PADS_STORAGE_KEY,
} from "../../vj.constants";
import { VJ_DOCK_PADS_MAX } from "../rules/vjDockPads";
import { useVjCueMode } from "./useVjCueMode";
import { useVjDockPads } from "./useVjDockPads";
import { useVjFlashConsent } from "./useVjFlashConsent";
import { useVjRemoteLayout } from "./useVjRemoteLayout";

interface FakeViewport {
  width: number;
  height: number;
  isStandalone: boolean;
}

/** Evaluates the simple media features the remote's queries use against a fake viewport. */
function matchesFeature(feature: string, viewport: FakeViewport): boolean {
  const [name, rawValue] = feature
    .replace(/[()]/g, "")
    .split(":")
    .map((part) => part.trim());
  const pixels = Number.parseFloat(rawValue ?? "");
  if (name === "min-width") return viewport.width >= pixels;
  if (name === "max-height") return viewport.height <= pixels;
  if (name === "orientation") {
    const orientation =
      viewport.width > viewport.height ? "landscape" : "portrait";
    return orientation === rawValue;
  }
  if (name === "display-mode") {
    return rawValue === (viewport.isStandalone ? "standalone" : "browser");
  }
  return false;
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`no element at index ${index}`);
  return item;
}

function matchesQuery(query: string, viewport: FakeViewport): boolean {
  return query
    .split(",")
    .some((alternative) =>
      alternative
        .split(" and ")
        .every((feature) => matchesFeature(feature.trim(), viewport)),
    );
}

function stubViewport(viewport: FakeViewport) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matchesQuery(query, viewport),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

beforeEach(() => {
  window.localStorage.removeItem(VJ_REMOTE_DOCK_PADS_STORAGE_KEY);
  window.localStorage.removeItem(VJ_REMOTE_CUE_MODE_STORAGE_KEY);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useVjRemoteLayout", () => {
  it("keeps the phone layout on a 390 px phone", () => {
    stubViewport({ width: 390, height: 844, isStandalone: false });
    const { result } = renderHook(() => useVjRemoteLayout());
    expect(result.current).toEqual({
      layout: "phone",
      isCompactStrips: false,
    });
  });

  it("split layout from 900 px wide", () => {
    stubViewport({ width: 900, height: 1200, isStandalone: false });
    const { result } = renderHook(() => useVjRemoteLayout());
    expect(result.current.layout).toBe("split");
  });

  it("split layout in landscape from 700 px", () => {
    stubViewport({ width: 720, height: 540, isStandalone: false });
    const { result } = renderHook(() => useVjRemoteLayout());
    expect(result.current.layout).toBe("split");
  });

  it("compact strips in an installed app", () => {
    stubViewport({ width: 390, height: 844, isStandalone: true });
    const { result } = renderHook(() => useVjRemoteLayout());
    expect(result.current).toEqual({ layout: "phone", isCompactStrips: true });
  });
});

describe("useVjDockPads", () => {
  it("dock pads persist and refuse a thirteenth", () => {
    window.localStorage.setItem(
      VJ_REMOTE_DOCK_PADS_STORAGE_KEY,
      JSON.stringify(VJ_EFFECT_IDS.slice(0, VJ_DOCK_PADS_MAX - 1)),
    );
    const { result, unmount } = renderHook(() => useVjDockPads());
    const twelfthEffect = at(VJ_EFFECT_IDS, VJ_DOCK_PADS_MAX - 1);
    const thirteenthEffect = at(VJ_EFFECT_IDS, VJ_DOCK_PADS_MAX);

    let addResult: string = "";
    act(() => {
      addResult = result.current.add(twelfthEffect);
    });
    expect(addResult).toBe("added");
    expect(result.current.pads).toHaveLength(VJ_DOCK_PADS_MAX);

    act(() => {
      addResult = result.current.add(thirteenthEffect);
    });
    expect(addResult).toBe("full");
    expect(result.current.pads).not.toContain(thirteenthEffect);

    act(() => {
      result.current.move(twelfthEffect, -1);
    });
    act(() => {
      result.current.remove(at(VJ_EFFECT_IDS, 0));
    });
    unmount();

    const stored: unknown = JSON.parse(
      window.localStorage.getItem(VJ_REMOTE_DOCK_PADS_STORAGE_KEY) ?? "null",
    );
    const expectedPads = [
      ...VJ_EFFECT_IDS.slice(1, VJ_DOCK_PADS_MAX - 2),
      twelfthEffect,
      VJ_EFFECT_IDS[VJ_DOCK_PADS_MAX - 2],
    ];
    expect(stored).toEqual(expectedPads);

    const { result: reloaded } = renderHook(() => useVjDockPads());
    expect(reloaded.current.pads).toEqual(expectedPads);
  });

  it("a garbage dock value reads the first 8 catalog effects", () => {
    window.localStorage.setItem(VJ_REMOTE_DOCK_PADS_STORAGE_KEY, "{garbage");
    const { result } = renderHook(() => useVjDockPads());
    expect(result.current.pads).toEqual(VJ_EFFECT_IDS.slice(0, 8));
  });

  it("drops unknown ids from a stored list", () => {
    window.localStorage.setItem(
      VJ_REMOTE_DOCK_PADS_STORAGE_KEY,
      JSON.stringify(["invert", "sparkles", 4, "vhs"]),
    );
    const { result } = renderHook(() => useVjDockPads());
    expect(result.current.pads).toEqual(["invert", "vhs"]);
  });
});

describe("useVjCueMode", () => {
  it("cue mode persists and arming clears when it turns off", () => {
    const { result, unmount } = renderHook(() => useVjCueMode());
    expect(result.current.isCueMode).toBe(false);

    act(() => result.current.setCueMode(true));
    act(() => result.current.arm("clip-7"));
    expect(result.current.armedClipId).toBe("clip-7");
    expect(window.localStorage.getItem(VJ_REMOTE_CUE_MODE_STORAGE_KEY)).toBe(
      "true",
    );

    unmount();
    const { result: reloaded } = renderHook(() => useVjCueMode());
    expect(reloaded.current.isCueMode).toBe(true);
    expect(reloaded.current.armedClipId).toBeNull();

    act(() => reloaded.current.arm("clip-9"));
    act(() => reloaded.current.setCueMode(false));
    expect(reloaded.current.armedClipId).toBeNull();
    act(() => reloaded.current.setCueMode(true));
    expect(reloaded.current.armedClipId).toBeNull();
  });

  it("a bad stored cue value reads as off", () => {
    window.localStorage.setItem(VJ_REMOTE_CUE_MODE_STORAGE_KEY, '"yes"');
    const { result } = renderHook(() => useVjCueMode());
    expect(result.current.isCueMode).toBe(false);
  });
});

describe("useVjFlashConsent", () => {
  it("flash consent is per stage epoch", () => {
    const initialProps: { stageEpoch: string | null } = {
      stageEpoch: "flash-epoch-a",
    };
    const { result, rerender } = renderHook(
      ({ stageEpoch }: { stageEpoch: string | null }) =>
        useVjFlashConsent(stageEpoch),
      { initialProps },
    );
    expect(result.current.hasConsented).toBe(false);

    act(() => result.current.consent());
    expect(result.current.hasConsented).toBe(true);

    rerender({ stageEpoch: "flash-epoch-b" });
    expect(result.current.hasConsented).toBe(false);

    rerender({ stageEpoch: "flash-epoch-a" });
    expect(result.current.hasConsented).toBe(true);

    rerender({ stageEpoch: null });
    act(() => result.current.consent());
    expect(result.current.hasConsented).toBe(false);
  });
});
