import { describe, expect, it } from "vitest";
import type {
  VjScreenClipStatus,
  VjScreenStatus,
} from "../../../../shared/contracts/vj";
import {
  vjPackReadinessOf,
  vjShouldConfirmPackSwitch,
  type VjPackReadiness,
} from "./vjPackReadiness";

const ACTIVE_PACK = { id: "pack-active", clipCount: 2 };
const OTHER_PACK = { id: "pack-other", clipCount: 5 };
const ACTIVE_CLIP_IDS = ["clip-1", "clip-2"];

function readyClip(clipId: string): VjScreenClipStatus {
  return { clipId, state: "ready", progress: 1, failure: null };
}

function loadingClip(clipId: string, progress: number): VjScreenClipStatus {
  return { clipId, state: "loading", progress, failure: null };
}

function screenWith(
  screenId: string,
  clips: VjScreenClipStatus[],
  overrides: Partial<VjScreenStatus> = {},
): VjScreenStatus {
  return {
    screenId,
    number: 1,
    isConnected: true,
    isLead: false,
    isFullscreen: false,
    connectedAt: 1,
    lastSeenAt: 1,
    preload: { packId: ACTIVE_PACK.id, clips },
    health: null,
    nextClipId: null,
    mic: null,
    ...overrides,
  };
}

describe("vjPackReadinessOf", () => {
  it("no connected screen reads noScreens", () => {
    const offlineScreen = screenWith("screen-1", [], {
      isConnected: false,
    });
    expect(vjPackReadinessOf([], ACTIVE_PACK, ACTIVE_CLIP_IDS)).toEqual({
      kind: "noScreens",
    });
    expect(
      vjPackReadinessOf([offlineScreen], ACTIVE_PACK, ACTIVE_CLIP_IDS),
    ).toEqual({ kind: "noScreens" });
  });

  it("every clip ready reads ready", () => {
    const screen = screenWith("screen-1", [
      readyClip("clip-1"),
      readyClip("clip-2"),
    ]);
    expect(vjPackReadinessOf([screen], ACTIVE_PACK, ACTIVE_CLIP_IDS)).toEqual({
      kind: "ready",
      readyCount: 2,
      totalCount: 2,
    });
  });

  it("the slowest screen wins", () => {
    const fastScreen = screenWith("screen-1", [
      readyClip("clip-1"),
      readyClip("clip-2"),
    ]);
    const slowScreen = screenWith("screen-2", [
      readyClip("clip-1"),
      loadingClip("clip-2", 0.4),
    ]);
    expect(
      vjPackReadinessOf([fastScreen, slowScreen], ACTIVE_PACK, ACTIVE_CLIP_IDS),
    ).toEqual({ kind: "partial", readyCount: 1, totalCount: 2 });
  });

  it("a connected screen still on another pack holds the count at zero", () => {
    const readyScreen = screenWith("screen-1", [
      readyClip("clip-1"),
      readyClip("clip-2"),
    ]);
    const behindScreen = screenWith("screen-2", [], {
      preload: { packId: OTHER_PACK.id, clips: [] },
    });
    expect(
      vjPackReadinessOf(
        [readyScreen, behindScreen],
        ACTIVE_PACK,
        ACTIVE_CLIP_IDS,
      ),
    ).toEqual({ kind: "partial", readyCount: 0, totalCount: 2 });
  });

  it("ignores a disconnected screen", () => {
    const readyScreen = screenWith("screen-1", [
      readyClip("clip-1"),
      readyClip("clip-2"),
    ]);
    const offlineScreen = screenWith("screen-2", [], { isConnected: false });
    expect(
      vjPackReadinessOf(
        [readyScreen, offlineScreen],
        ACTIVE_PACK,
        ACTIVE_CLIP_IDS,
      ).kind,
    ).toBe("ready");
  });

  it("another pack reads notPreloaded while screens are connected", () => {
    const screen = screenWith("screen-1", [
      readyClip("clip-1"),
      readyClip("clip-2"),
    ]);
    expect(vjPackReadinessOf([screen], OTHER_PACK, null)).toEqual({
      kind: "notPreloaded",
      totalCount: 5,
    });
  });
});

describe("vjShouldConfirmPackSwitch", () => {
  const partial: VjPackReadiness = {
    kind: "partial",
    readyCount: 1,
    totalCount: 2,
  };
  const notPreloaded: VjPackReadiness = { kind: "notPreloaded", totalCount: 5 };
  const ready: VjPackReadiness = {
    kind: "ready",
    readyCount: 2,
    totalCount: 2,
  };

  it("asks before switching to a pack that is not fully preloaded", () => {
    expect(vjShouldConfirmPackSwitch(partial, false)).toBe(true);
    expect(vjShouldConfirmPackSwitch(notPreloaded, false)).toBe(true);
  });

  it("switches straight to a ready pack or with no screens", () => {
    expect(vjShouldConfirmPackSwitch(ready, false)).toBe(false);
    expect(vjShouldConfirmPackSwitch({ kind: "noScreens" }, false)).toBe(false);
  });

  it("the active pack never asks to confirm", () => {
    expect(vjShouldConfirmPackSwitch(partial, true)).toBe(false);
    expect(vjShouldConfirmPackSwitch(notPreloaded, true)).toBe(false);
  });
});
