import { describe, expect, it } from "vitest";
import type {
  VjScreenClipStatus,
  VjScreenStatus,
} from "../../../shared/contracts/vj";
import { resolveEntry } from "../../../shared/i18n/translate";
import { vj as englishVjCatalog } from "../../../shared/i18n/catalogs/en/vj";
import {
  summariseVjScreens,
  vjClipReadinessOf,
  vjScreensSummaryKey,
} from "./vjScreensSummary";

const PACK_ID = "pack-1";
const CLIP_ID = "clip-1";

function screenWith(
  overrides: Partial<VjScreenStatus> & { clips?: VjScreenClipStatus[] },
): VjScreenStatus {
  const { clips, ...screenOverrides } = overrides;
  return {
    screenId: "screen-1",
    number: 1,
    isConnected: true,
    isLead: false,
    isFullscreen: false,
    connectedAt: 1,
    lastSeenAt: 1,
    preload: { packId: PACK_ID, clips: clips ?? [] },
    ...screenOverrides,
  };
}

function clipStatus(
  overrides: Partial<VjScreenClipStatus>,
): VjScreenClipStatus {
  return {
    clipId: CLIP_ID,
    state: "ready",
    progress: 1,
    failure: null,
    ...overrides,
  };
}

function englishLine(summaryKey: {
  key: string;
  values: Record<string, number>;
}): string | undefined {
  const path = summaryKey.key.slice("vj:".length);
  return resolveEntry(englishVjCatalog, path, "en", summaryKey.values);
}

describe("vjScreensSummary", () => {
  it("says no screen open for an empty list", () => {
    expect(summariseVjScreens([])).toEqual({ kind: "none" });
    expect(vjScreensSummaryKey({ kind: "none" })).toEqual({
      key: "vj:remote.screens.none",
      values: {},
    });
  });

  it("counts live screens", () => {
    const screens = [
      screenWith({ screenId: "screen-1" }),
      screenWith({ screenId: "screen-2", isConnected: false }),
      screenWith({ screenId: "screen-3" }),
    ];
    expect(summariseVjScreens(screens)).toEqual({
      kind: "live",
      liveCount: 2,
      totalCount: 3,
    });
  });

  it("says offline when every screen dropped", () => {
    const screens = [
      screenWith({ screenId: "screen-1", isConnected: false }),
      screenWith({ screenId: "screen-2", isConnected: false }),
    ];
    expect(summariseVjScreens(screens)).toEqual({
      kind: "offline",
      totalCount: 2,
    });
  });

  it("reads a clip as ready only when every connected screen has it", () => {
    const readyScreen = screenWith({
      screenId: "screen-1",
      clips: [clipStatus({})],
    });
    const loadingScreen = screenWith({
      screenId: "screen-2",
      clips: [clipStatus({ state: "loading", progress: 0.5 })],
    });
    const droppedScreen = screenWith({
      screenId: "screen-3",
      isConnected: false,
      clips: [clipStatus({ state: "queued", progress: 0 })],
    });
    expect(
      vjClipReadinessOf([readyScreen, droppedScreen], PACK_ID, CLIP_ID),
    ).toEqual({ state: "ready", progress: 1, failure: null });
    expect(
      vjClipReadinessOf([readyScreen, loadingScreen], PACK_ID, CLIP_ID).state,
    ).toBe("loading");
  });

  it("takes the lowest progress while loading", () => {
    const screens = [
      screenWith({
        screenId: "screen-1",
        clips: [clipStatus({ state: "loading", progress: 0.8 })],
      }),
      screenWith({
        screenId: "screen-2",
        clips: [clipStatus({ state: "loading", progress: 0.3 })],
      }),
      screenWith({ screenId: "screen-3", clips: [clipStatus({})] }),
    ];
    expect(vjClipReadinessOf(screens, PACK_ID, CLIP_ID)).toEqual({
      state: "loading",
      progress: 0.3,
      failure: null,
    });
  });

  it("names the first failure", () => {
    const screens = [
      screenWith({ screenId: "screen-1", clips: [clipStatus({})] }),
      screenWith({
        screenId: "screen-2",
        clips: [
          clipStatus({ state: "failed", progress: 0, failure: "url_expired" }),
        ],
      }),
      screenWith({
        screenId: "screen-3",
        clips: [
          clipStatus({ state: "failed", progress: 0, failure: "storage_full" }),
        ],
      }),
    ];
    expect(vjClipReadinessOf(screens, PACK_ID, CLIP_ID)).toEqual({
      state: "failed",
      progress: 0,
      failure: "url_expired",
    });
  });

  it("reads unknown when no connected screen covers the pack", () => {
    const screens = [
      screenWith({
        screenId: "screen-1",
        preload: { packId: "pack-2", clips: [] },
      }),
      screenWith({
        screenId: "screen-2",
        isConnected: false,
        clips: [clipStatus({})],
      }),
    ];
    expect(vjClipReadinessOf(screens, PACK_ID, CLIP_ID)).toEqual({
      state: "unknown",
      progress: 0,
      failure: null,
    });
    expect(vjClipReadinessOf([], PACK_ID, CLIP_ID).state).toBe("unknown");
  });

  it("reads a clip a covering screen has not listed yet as queued", () => {
    const screens = [screenWith({ screenId: "screen-1", clips: [] })];
    expect(vjClipReadinessOf(screens, PACK_ID, CLIP_ID)).toEqual({
      state: "queued",
      progress: 0,
      failure: null,
    });
  });

  it("picks the singular and plural keys", () => {
    const oneLive = vjScreensSummaryKey({
      kind: "live",
      liveCount: 1,
      totalCount: 1,
    });
    expect(oneLive).toEqual({
      key: "vj:remote.screens.live",
      values: { count: 1 },
    });
    expect(englishLine(oneLive)).toBe("1 screen live");

    const twoLive = vjScreensSummaryKey({
      kind: "live",
      liveCount: 2,
      totalCount: 2,
    });
    expect(englishLine(twoLive)).toBe("2 screens live");

    const partial = vjScreensSummaryKey({
      kind: "live",
      liveCount: 1,
      totalCount: 3,
    });
    expect(partial).toEqual({
      key: "vj:remote.screens.partial",
      values: { live: 1, total: 3 },
    });
    expect(englishLine(partial)).toBe("1 of 3 screens live");

    const oneOffline = vjScreensSummaryKey({ kind: "offline", totalCount: 1 });
    expect(oneOffline).toEqual({
      key: "vj:remote.screens.offline",
      values: { count: 1 },
    });
    expect(englishLine(oneOffline)).toBe("Screen offline");
    expect(
      englishLine(vjScreensSummaryKey({ kind: "offline", totalCount: 2 })),
    ).toBe("Screens offline");
  });
});
