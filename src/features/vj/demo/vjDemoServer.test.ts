import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VJ_DEMO_HEARTBEAT_MS } from "../vj.constants";
import { createVjDemoChannelHub, type VjDemoMessage } from "./vjDemoChannel";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import { startVjDemoServer } from "./vjDemoServer";

const emptyLibrary: VjDemoLibraryLookup = {
  hasPack: () => false,
  hasClip: () => false,
  isClipInPack: () => false,
  readPackForStage: () => null,
  existingClipIds: () => new Set(),
  clipIdsInPack: () => new Set(),
  readPackClipForAdvance: () => null,
  readSceneLook: () => null,
  readSetlistItem: () => null,
  setlistItemCount: () => null,
};

/** The hub delivers on microtasks; a client post and the server's answer take two hops. */
async function flushChannel(): Promise<void> {
  for (let hop = 0; hop < 5; hop += 1) await Promise.resolve();
}

function clientAlive(): VjDemoMessage {
  return {
    direction: "toServer",
    name: "demo:clientAlive",
    payload: null,
    tabId: "client-tab",
  };
}

describe("startVjDemoServer heartbeat", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the heartbeat going from client traffic while its interval is throttled", async () => {
    const hub = createVjDemoChannelHub();
    const client = hub.open();
    const heartbeats: VjDemoMessage[] = [];
    client.subscribe((message) => {
      if (message.name === "demo:heartbeat") heartbeats.push(message);
    });
    let nowMs = 10_000;
    const server = startVjDemoServer({
      channel: hub.open(),
      library: emptyLibrary,
      now: () => nowMs,
      serverId: "server-a",
      newEpoch: () => "epoch-a",
    });
    await flushChannel();
    expect(heartbeats).toHaveLength(1);

    // The interval never fires here, as in a hidden tab throttled to once a minute.
    nowMs += VJ_DEMO_HEARTBEAT_MS - 1;
    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(1);

    nowMs += 1;
    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(2);
    expect(heartbeats[1]?.payload).toEqual({ serverId: "server-a" });

    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(2);

    server.stop();
    nowMs += VJ_DEMO_HEARTBEAT_MS * 5;
    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(2);
  });
});
