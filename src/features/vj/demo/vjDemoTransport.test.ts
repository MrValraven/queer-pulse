import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  VjAttachPayload,
  VjAttachRole,
  VjStageFrame,
  VjStageRestore,
} from "../../../shared/contracts/vj";
import { createVjStageState } from "../../../shared/contracts/vj";
import type { VjServerFrame } from "../realtime/vjFrames";
import type { VjConnectionState } from "../realtime/vjTransport";
import { createVjDemoChannelHub } from "./vjDemoChannel";
import type { VjDemoLockSeam } from "./vjDemoHosting";
import type { VjDemoLibraryLookup } from "./vjDemoStore";
import { VjDemoTransport } from "./vjDemoTransport";

const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIENT_ID = "11111111-1111-4111-8111-111111111111";
const SCREEN_ID = "22222222-2222-4222-8222-22222222222a";

const library: VjDemoLibraryLookup = {
  hasPack: (packId) => packId === PACK_WARM,
  hasClip: (clipId) => clipId === CLIP_GRID || clipId === CLIP_HAZE,
  isClipInPack: (packId, clipId) =>
    packId === PACK_WARM && (clipId === CLIP_GRID || clipId === CLIP_HAZE),
};

/** A Web Lock stand-in: the first request is granted at once, later ones wait for grantNext. */
function createFakeLockQueue() {
  const waiting: Array<() => void> = [];
  let isHeld = false;
  const seam: VjDemoLockSeam = {
    request(onGranted) {
      let isActive = true;
      let isHolder = false;
      const grant = () => {
        if (!isActive) return;
        isHeld = true;
        isHolder = true;
        onGranted();
      };
      if (isHeld) waiting.push(grant);
      else grant();
      return () => {
        isActive = false;
        if (isHolder) isHeld = false;
      };
    },
  };
  return {
    seam,
    grantNext() {
      if (isHeld) return;
      waiting.shift()?.();
    },
  };
}

let hub = createVjDemoChannelHub();
let lockQueue = createFakeLockQueue();
const openTransports: VjDemoTransport[] = [];

function openTab(options: {
  tabId: string;
  role: VjAttachRole;
  buildAttachPayload?: () => VjAttachPayload;
  lock?: VjDemoLockSeam;
}) {
  const frames: VjServerFrame[] = [];
  const connections: VjConnectionState[] = [];
  const transport = new VjDemoTransport({
    role: options.role,
    tabId: options.tabId,
    buildAttachPayload:
      options.buildAttachPayload ??
      (() =>
        options.role === "screen"
          ? { role: "screen", screenId: SCREEN_ID, restoreState: null }
          : { role: "remote" }),
    onFrame: (frame) => frames.push(frame),
    onConnection: (connection) => connections.push(connection),
    channelFactory: () => hub.open(),
    lock: options.lock ?? lockQueue.seam,
    library,
  });
  transport.connect();
  openTransports.push(transport);
  const stageFrames = (): VjStageFrame[] =>
    frames.flatMap((frame) =>
      frame.event === "stage:state" ? [frame.payload] : [],
    );
  const lastConnection = () => connections[connections.length - 1];
  return { transport, frames, connections, stageFrames, lastConnection };
}

/** Advances fake time, then lets the hub's queued deliveries run. A tab that
 *  opens after the host hears its first heartbeat within VJ_DEMO_HEARTBEAT_MS. */
async function flush(milliseconds = 0) {
  await vi.advanceTimersByTimeAsync(milliseconds);
  for (let round = 0; round < 20; round += 1) await Promise.resolve();
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
    ],
  });
  hub = createVjDemoChannelHub();
  lockQueue = createFakeLockQueue();
});

afterEach(() => {
  for (const transport of openTransports.splice(0)) transport.dispose();
  vi.useRealTimers();
});

describe("VjDemoTransport", () => {
  it("shows two tabs the same revision after a remote command", async () => {
    const screen = openTab({ tabId: "screen-tab", role: "screen" });
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush(1_000);
    expect(screen.lastConnection()?.status).toBe("attached");
    expect(remote.lastConnection()?.status).toBe("attached");
    const ack = await remote.transport.send("stage:goClip", {
      clipId: CLIP_GRID,
      clientId: CLIENT_ID,
      commandSequence: 1,
    });
    expect(ack).toEqual({ ok: true, revision: 1, isNoop: false });
    await flush();
    const onScreen = screen.stageFrames().at(-1);
    const onRemote = remote.stageFrames().at(-1);
    expect(onScreen?.state.revision).toBe(1);
    expect(onRemote?.state.revision).toBe(1);
    expect(onScreen?.state.stageEpoch).toBe(onRemote?.state.stageEpoch);
    expect(onRemote).toMatchObject({
      cause: "command",
      sourceClientId: CLIENT_ID,
    });
  });

  it("routes screens:update to remotes only", async () => {
    const screen = openTab({ tabId: "screen-tab", role: "screen" });
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush(1_300);
    expect(
      screen.frames.some((frame) => frame.event === "screens:update"),
    ).toBe(false);
    const updates = remote.frames.filter(
      (frame) => frame.event === "screens:update",
    );
    expect(updates.length).toBeGreaterThan(0);
    expect(updates.at(-1)?.payload).toMatchObject({
      screens: [
        { screenId: SCREEN_ID, number: 1, isConnected: true, isLead: true },
      ],
    });
  });

  it("says the server is gone after the silence", async () => {
    const host = openTab({ tabId: "host-tab", role: "screen" });
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush(1_000);
    const firstEpoch = remote.lastConnection()?.attach?.stageEpoch;
    expect(remote.lastConnection()?.status).toBe("attached");
    host.transport.dispose();
    await flush(3_600);
    expect(remote.lastConnection()?.status).toBe("reconnecting");
    lockQueue.grantNext();
    await flush();
    expect(remote.lastConnection()?.status).toBe("attached");
    expect(remote.lastConnection()?.attach?.stageEpoch).not.toBe(firstEpoch);
  });

  it("a second tab takes over hosting and the screen restores the stage", async () => {
    const host = openTab({ tabId: "host-tab", role: "remote" });
    await flush();
    await host.transport.send("stage:setPack", {
      packId: PACK_WARM,
      clientId: CLIENT_ID,
      commandSequence: 1,
    });
    const restoreState: VjStageRestore = {
      ...createVjStageState("44444444-4444-4444-8444-444444444444", 0),
      revision: 5,
      activePackId: PACK_WARM,
      liveClipId: CLIP_HAZE,
    };
    const screen = openTab({
      tabId: "screen-tab",
      role: "screen",
      buildAttachPayload: () => ({
        role: "screen",
        screenId: SCREEN_ID,
        restoreState,
      }),
    });
    await flush(1_000);
    expect(screen.stageFrames().at(-1)).toMatchObject({
      cause: "attach",
      state: { revision: 1, liveClipId: null },
    });
    host.transport.dispose();
    lockQueue.grantNext();
    await flush();
    expect(screen.lastConnection()).toMatchObject({
      status: "attached",
      attach: { isRestored: true, isLead: true },
    });
    expect(screen.stageFrames().at(-1)).toMatchObject({
      cause: "restore",
      state: {
        revision: 1,
        clipSequence: 1,
        activePackId: PACK_WARM,
        liveClipId: CLIP_HAZE,
      },
    });
    expect(
      screen.connections.some(
        (connection) => connection.status === "reconnecting",
      ),
    ).toBe(true);
  });

  it("rejects a send before attach", async () => {
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await expect(
      remote.transport.send("stage:goClip", {
        clipId: CLIP_GRID,
        clientId: CLIENT_ID,
        commandSequence: 1,
      }),
    ).rejects.toMatchObject({ name: "VjSendError", reason: "disconnected" });
  });

  it("answers screen offline when no screen is open", async () => {
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush();
    expect(remote.lastConnection()?.status).toBe("attached");
    const update = remote.frames.find(
      (frame) => frame.event === "screens:update",
    );
    expect(update?.payload).toEqual({ screens: [] });
  });

  it("keeps one host when two tabs win the election at once", async () => {
    // The heartbeat election without Web Locks can grant two tabs together.
    const grantFirstRequest = (): VjDemoLockSeam => {
      let hasGranted = false;
      return {
        request(onGranted) {
          if (!hasGranted) {
            hasGranted = true;
            onGranted();
          }
          return () => undefined;
        },
      };
    };
    const heartbeats: Array<{ serverId: unknown; at: number }> = [];
    const spy = hub.open();
    spy.subscribe((message) => {
      if (message.name !== "demo:heartbeat") return;
      const { serverId } = message.payload as { serverId: unknown };
      heartbeats.push({ serverId, at: Date.now() });
    });
    const screen = openTab({
      tabId: "screen-tab",
      role: "screen",
      lock: grantFirstRequest(),
    });
    const remote = openTab({
      tabId: "remote-tab",
      role: "remote",
      lock: grantFirstRequest(),
    });
    await flush(3_000);
    const startedAt = Date.now();
    await flush(3_000);
    const lateServerIds = new Set(
      heartbeats
        .filter((heartbeat) => heartbeat.at > startedAt)
        .map((heartbeat) => heartbeat.serverId),
    );
    expect(lateServerIds.size).toBe(1);
    expect(screen.lastConnection()?.status).toBe("attached");
    expect(remote.lastConnection()?.status).toBe("attached");
    expect(screen.lastConnection()?.attach?.stageEpoch).toBe(
      remote.lastConnection()?.attach?.stageEpoch,
    );
    spy.close();
  });
});
