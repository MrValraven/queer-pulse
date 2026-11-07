import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjScreenStatus,
} from "../../../shared/contracts/vj";
import { VJ_SCREEN_OFFLINE_RETENTION_MS } from "../vj.constants";
import {
  pruneOfflineVjDemoScreens,
  screensUpdateTo,
  type VjDemoScreenEntry,
} from "./vjDemoScreens";

const SCREEN_ONLINE = "22222222-2222-4222-8222-22222222222a";
const SCREEN_OFFLINE = "22222222-2222-4222-8222-22222222222b";
const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";

/** A screen entry that reported health and a mic while its tab was open. */
function entryOf(
  screenId: string,
  number: number,
  connection: { tabId: string | null; disconnectedAt: number | null },
): VjDemoScreenEntry {
  const isConnected = connection.tabId !== null;
  return {
    screenId,
    tabId: connection.tabId,
    number,
    connectedAt: isConnected ? 10 : null,
    connectionOrder: number,
    disconnectedAt: connection.disconnectedAt,
    lastSeenAt: 20,
    isFullscreen: true,
    preload: { packId: null, clips: [] },
    health: {
      renderer: "webgl2",
      fps: 59.9,
      droppedFrames: 3,
      cacheBytes: 1024,
      isEffectLoadHigh: false,
    },
    nextClipId: null,
    mic: { level: 0.42, bpm: 128, confidence: 0.9, beatAt: 15 },
  };
}

function statusesOf(screens: VjDemoScreenEntry[]): VjScreenStatus[] {
  const state = createVjStageState(STAGE_EPOCH, 0);
  const frame = screensUpdateTo({ screens, state }, { role: "remote" });
  return (frame.payload as { screens: VjScreenStatus[] }).screens;
}

describe("screensUpdateTo meters", () => {
  it("relays null health and mic for an offline screen and leaves its stored entry alone", () => {
    const offline = entryOf(SCREEN_OFFLINE, 2, {
      tabId: null,
      disconnectedAt: 30,
    });
    const screens = [
      entryOf(SCREEN_ONLINE, 1, { tabId: "tab-a", disconnectedAt: null }),
      offline,
    ];
    const [onlineStatus, offlineStatus] = statusesOf(screens);
    expect(onlineStatus).toMatchObject({
      screenId: SCREEN_ONLINE,
      isConnected: true,
      health: { renderer: "webgl2", fps: 59.9 },
      mic: { level: 0.42, detectedBpm: 128, confidence: 0.9 },
    });
    expect(offlineStatus).toMatchObject({
      screenId: SCREEN_OFFLINE,
      isConnected: false,
      health: null,
      mic: null,
    });
    expect(offline.health).not.toBeNull();
    expect(offline.mic).not.toBeNull();
  });
});

describe("pruneOfflineVjDemoScreens", () => {
  const DISCONNECTED_AT = 1_000;

  it("drops a screen offline past retention and keeps one inside it", () => {
    const screens = [
      entryOf(SCREEN_ONLINE, 1, { tabId: "tab-a", disconnectedAt: null }),
      entryOf(SCREEN_OFFLINE, 2, {
        tabId: null,
        disconnectedAt: DISCONNECTED_AT,
      }),
    ];
    const atRetention = DISCONNECTED_AT + VJ_SCREEN_OFFLINE_RETENTION_MS;
    expect(pruneOfflineVjDemoScreens(screens, atRetention)).toBe(screens);
    const pastRetention = pruneOfflineVjDemoScreens(screens, atRetention + 1);
    expect(pastRetention.map((entry) => entry.screenId)).toEqual([
      SCREEN_ONLINE,
    ]);
  });
});
