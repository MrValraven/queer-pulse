import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  VjAttachPayload,
  VjAttachRole,
  VjClockSample,
  VjStageFrame,
  VjStageRestore,
} from "../../../shared/contracts/vj";
import {
  createVjStageState,
  VJ_CONTRACT_VERSION,
  VJ_LIMITS,
} from "../../../shared/contracts/vj";
import type { VjServerFrame } from "../realtime/vjFrames";
import type { VjConnectionState } from "../realtime/vjTransport";
import { createVjDemoChannelHub, type VjDemoMessage } from "./vjDemoChannel";
import type { VjDemoLockSeam } from "./vjDemoHosting";
import type { VjDemoLibraryLookup } from "./vjDemoStore";
import { VjDemoTransport } from "./vjDemoTransport";

const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIENT_ID = "11111111-1111-4111-8111-111111111111";
const SCREEN_ID = "22222222-2222-4222-8222-22222222222a";
const SCREEN_B_ID = "22222222-2222-4222-8222-22222222222b";
const UNKNOWN_CLIP = "00000000-0000-4000-8000-0000000000ff";
/** How far each tab's local clock runs ahead of the fake server clock. */
const LOCAL_AHEAD_MS = 40;

const PACK_CLIP_IDS = [CLIP_GRID, CLIP_HAZE];

/** The clip ids of PACK_WARM among the listed ones. */
function clipsInPack(packId: string, clipIds: string[]): Set<string> {
  if (packId !== PACK_WARM) return new Set<string>();
  return new Set(clipIds.filter((clipId) => PACK_CLIP_IDS.includes(clipId)));
}

const library: VjDemoLibraryLookup = {
  hasPack: (packId) => packId === PACK_WARM,
  hasClip: (clipId) => PACK_CLIP_IDS.includes(clipId),
  isClipInPack: (packId, clipId) => clipsInPack(packId, [clipId]).size > 0,
  readPackForStage: (packId) =>
    packId === PACK_WARM ? { eventId: null } : null,
  existingClipIds: (clipIds) =>
    new Set(clipIds.filter((clipId) => PACK_CLIP_IDS.includes(clipId))),
  clipIdsInPack: clipsInPack,
  readPackClipForAdvance: (packId, clipId) =>
    clipsInPack(packId, [clipId]).size > 0 ? { isFavorite: false } : null,
  readSceneLook: () => null,
  readSetlist: () => null,
  readSetlistFollow: () => null,
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
  screenId?: string;
  buildAttachPayload?: () => VjAttachPayload;
  lock?: VjDemoLockSeam;
}) {
  const frames: VjServerFrame[] = [];
  const connections: VjConnectionState[] = [];
  const samples: VjClockSample[] = [];
  const transport = new VjDemoTransport({
    role: options.role,
    tabId: options.tabId,
    buildAttachPayload:
      options.buildAttachPayload ??
      (() =>
        options.role === "screen"
          ? {
              role: "screen",
              contractVersion: VJ_CONTRACT_VERSION,
              screenId: options.screenId ?? SCREEN_ID,
              restoreState: null,
            }
          : { role: "remote", contractVersion: VJ_CONTRACT_VERSION }),
    onFrame: (frame) => frames.push(frame),
    onConnection: (connection) => connections.push(connection),
    onClockSample: (sample) => samples.push(sample),
    channelFactory: () => hub.open(),
    lock: options.lock ?? lockQueue.seam,
    library,
    localNow: () => Date.now() + LOCAL_AHEAD_MS,
  });
  transport.connect();
  openTransports.push(transport);
  const stageFrames = (): VjStageFrame[] =>
    frames.flatMap((frame) =>
      frame.event === "stage:state" ? [frame.payload] : [],
    );
  const lastConnection = () => connections[connections.length - 1];
  return {
    transport,
    frames,
    connections,
    samples,
    stageFrames,
    lastConnection,
  };
}

/** Records every message on the hub, both directions. */
function spyOnHub() {
  const messages: VjDemoMessage[] = [];
  const channel = hub.open();
  channel.subscribe((message) => messages.push(message));
  const sentBy = (tabId: string, name: string) =>
    messages.filter(
      (message) =>
        message.direction === "toServer" &&
        message.tabId === tabId &&
        message.name === name,
    );
  const ackOf = (requestId: string | null | undefined) =>
    messages.find(
      (message) => message.name === "ack" && message.requestId === requestId,
    );
  return { messages, sentBy, ackOf, close: () => channel.close() };
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
    expect(ack).toEqual({
      ok: true,
      revision: 1,
      isNoop: false,
      applyAt: null,
      serverNow: Date.now(),
    });
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
        contractVersion: VJ_CONTRACT_VERSION,
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

describe("VjDemoTransport v2", () => {
  it("answers clock:sync before attach and reports a sample", async () => {
    const spy = spyOnHub();
    const startedAt = Date.now();
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush();
    const syncs = spy.sentBy("remote-tab", "clock:sync");
    const attaches = spy.sentBy("remote-tab", "vj:attach");
    expect(syncs).toHaveLength(1);
    expect(attaches).toHaveLength(1);
    const [sync] = syncs;
    const [attach] = attaches;
    if (sync === undefined || attach === undefined) {
      throw new Error("expected one clock:sync and one vj:attach message");
    }
    const syncIndex = spy.messages.indexOf(sync);
    expect(syncIndex).toBeLessThan(spy.messages.indexOf(attach));
    expect(spy.ackOf(sync.requestId)?.payload).toEqual({
      ok: true,
      serverNow: startedAt,
    });
    expect(remote.samples[0]).toEqual({
      sentAt: startedAt + LOCAL_AHEAD_MS,
      receivedAt: startedAt + LOCAL_AHEAD_MS,
      serverNow: startedAt,
    });
    // The clock:sync answer and the attach ack: one sample each.
    expect(remote.samples).toHaveLength(2);
    spy.close();
  });

  it("reports a sample for every command ack", async () => {
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush();
    expect(remote.lastConnection()?.status).toBe("attached");
    const samplesBefore = remote.samples.length;
    const accepted = await remote.transport.send("stage:goClip", {
      clipId: CLIP_GRID,
      clientId: CLIENT_ID,
      commandSequence: 1,
    });
    expect(accepted.ok).toBe(true);
    const refused = await remote.transport.send("stage:goClip", {
      clipId: UNKNOWN_CLIP,
      clientId: CLIENT_ID,
      commandSequence: 2,
    });
    expect(refused).toMatchObject({ ok: false, serverNow: Date.now() });
    expect(remote.samples).toHaveLength(samplesBefore + 2);
    expect(remote.samples.at(-1)).toEqual({
      sentAt: Date.now() + LOCAL_AHEAD_MS,
      receivedAt: Date.now() + LOCAL_AHEAD_MS,
      serverNow: Date.now(),
    });
  });

  it("runs the clock sync burst, then one every 30 s", async () => {
    const spy = spyOnHub();
    openTab({ tabId: "remote-tab", role: "remote" });
    await flush();
    expect(spy.sentBy("remote-tab", "clock:sync")).toHaveLength(1);
    await flush(1_000);
    // Five sends 250 ms apart; the same host's later heartbeats restart nothing.
    expect(spy.sentBy("remote-tab", "clock:sync")).toHaveLength(5);
    await flush(29_000);
    expect(spy.sentBy("remote-tab", "clock:sync")).toHaveLength(5);
    await flush(1_000);
    expect(spy.sentBy("remote-tab", "clock:sync")).toHaveLength(6);
    spy.close();
  });

  it("forwards screen:identify to the named tab only", async () => {
    const screenA = openTab({ tabId: "screen-a", role: "screen" });
    const screenB = openTab({
      tabId: "screen-b",
      role: "screen",
      screenId: SCREEN_B_ID,
    });
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush(1_000);
    expect(screenB.lastConnection()?.status).toBe("attached");
    const screenBNumber = screenB.lastConnection()?.attach?.screenNumber;
    const ack = await remote.transport.send("screen:identify", {
      screenId: SCREEN_B_ID,
    });
    expect(ack).toMatchObject({ ok: true, identifiedCount: 1 });
    await flush();
    const identifyFramesOf = (frames: VjServerFrame[]) =>
      frames.filter((frame) => frame.event === "screen:identify");
    expect(identifyFramesOf(screenB.frames)).toEqual([
      {
        event: "screen:identify",
        payload: {
          number: screenBNumber,
          durationMs: VJ_LIMITS.identifyDurationMs,
        },
      },
    ]);
    expect(identifyFramesOf(screenA.frames)).toEqual([]);
    expect(identifyFramesOf(remote.frames)).toEqual([]);
  });

  it("a frame keeps its applyAt end to end", async () => {
    const screen = openTab({ tabId: "screen-tab", role: "screen" });
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush(1_000);
    const tempoAck = await remote.transport.send("stage:setTempo", {
      quantize: "beat",
      clientId: CLIENT_ID,
      commandSequence: 1,
    });
    expect(tempoAck.ok).toBe(true);
    const clipAck = await remote.transport.send("stage:goClip", {
      clipId: CLIP_GRID,
      clientId: CLIENT_ID,
      commandSequence: 2,
    });
    await flush();
    const applyAt = clipAck.ok ? clipAck.applyAt : null;
    expect(applyAt).toBeGreaterThan(Date.now());
    expect(screen.stageFrames().at(-1)).toMatchObject({
      cause: "command",
      applyAt,
      state: { liveClipId: CLIP_GRID },
    });
    expect(remote.stageFrames().at(-1)?.applyAt).toBe(applyAt);
  });

  it("attach success carries screenNumber", async () => {
    const screen = openTab({ tabId: "screen-tab", role: "screen" });
    const remote = openTab({ tabId: "remote-tab", role: "remote" });
    await flush(1_000);
    const attach = screen.lastConnection()?.attach;
    expect(attach).toMatchObject({
      role: "screen",
      isRestored: false,
      isLead: true,
      screenNumber: 1,
    });
    // The ack's ok and serverNow stay out of the attach the hook reads.
    expect(Object.keys(attach ?? {}).sort()).toEqual([
      "connectionExpiresAt",
      "isLead",
      "isRestored",
      "role",
      "screenNumber",
      "stageEpoch",
    ]);
    expect(remote.lastConnection()?.attach).toMatchObject({
      role: "remote",
      isLead: null,
      screenNumber: null,
    });
  });

  it("refuses an outdated client and stops talking to the stage", async () => {
    const spy = spyOnHub();
    const remote = openTab({
      tabId: "remote-tab",
      role: "remote",
      buildAttachPayload: () => ({ role: "remote", contractVersion: 1 }),
    });
    await flush();
    expect(remote.lastConnection()).toEqual({
      status: "refused",
      refusal: "client_outdated",
      attach: null,
    });
    // The clock:sync answer and the refused attach ack both sample.
    expect(remote.samples).toHaveLength(2);
    const syncCount = spy.sentBy("remote-tab", "clock:sync").length;
    const attachCount = spy.sentBy("remote-tab", "vj:attach").length;
    await flush(60_000);
    expect(spy.sentBy("remote-tab", "clock:sync")).toHaveLength(syncCount);
    expect(spy.sentBy("remote-tab", "vj:attach")).toHaveLength(attachCount);
    expect(remote.lastConnection()?.status).toBe("refused");
    spy.close();
  });
});
