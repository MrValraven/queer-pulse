// The demo VJ server runner: the pure stage reducer plus its timers and the
// demo channel. One demo tab (the Web Lock holder) runs it at a time.

import { apiErrorCode } from "../../../shared/api/causeErrorKey";
import {
  VJ_LIBRARY_CHANGE_KINDS,
  type VjLibraryChange,
} from "../../../shared/contracts/vj";
import {
  VJ_DEMO_HEARTBEAT_MS,
  VJ_DEMO_SCREENS_UPDATE_THROTTLE_MS,
  VJ_DEMO_SILENCE_MS,
} from "../vj.constants";
import {
  createVjDemoUuid,
  type VjDemoChannel,
  type VjDemoMessage,
} from "./vjDemoChannel";
import {
  createVjDemoStage,
  reduceVjDemoStage,
  type VjDemoOutgoing,
  type VjDemoStageEvent,
} from "./vjDemoStage";
import {
  answerVjDemoLiveRequest,
  createVjDemoStoppedTabs,
  isVjDemoLiveRequest,
  refuseVjDemoStoppedAttach,
  syncVjDemoAttachedAt,
  type VjDemoLiveHost,
} from "./vjDemoLive";
import type { VjDemoSetlistLoopingWrite } from "./vjDemoSceneCommands";
import { readVjRecord } from "./vjDemoStageCommands";
import type { VjDemoLibraryLookup } from "./vjDemoStore";
import { demoUpdateVjSetlist } from "./vjDemoStoreSetlists";
import { createVjDemoStageTimers } from "./vjDemoTimers";

export interface VjDemoServerOptions {
  channel: VjDemoChannel;
  library: VjDemoLibraryLookup;
  /** Saves Loop for `stage:setlistSetLooping`; the demo store's PATCH by default. */
  writeSetlistLooping?: VjDemoSetlistLoopingWrite;
  now?: () => number;
  newEpoch?: () => string;
  serverId?: string;
  /**
   * Called after this server stopped because it heard another server with a
   * lower serverId (two tabs won the election at once); the lower id keeps
   * hosting, so every client settles on one server.
   */
  onYield?: () => void;
}

/** Saves Loop through the demo store's PATCH (sequences contract 5.6): a
 *  missing set list refuses vj_setlist_not_found, any other failure
 *  vj_server_error. The write posts `setlist_updated`, which every tab's
 *  library and this stage hear. */
export const writeVjDemoSetlistLooping: VjDemoSetlistLoopingWrite = (
  setlistId,
  isLooping,
) => {
  try {
    demoUpdateVjSetlist(setlistId, { isLooping });
    return null;
  } catch (error) {
    return apiErrorCode(error) === "VJ_SETLIST_NOT_FOUND"
      ? "vj_setlist_not_found"
      : "vj_server_error";
  }
};

/** How often offline screens older than the retention are dropped. */
const VJ_DEMO_PRUNE_INTERVAL_MS = 60_000;

/** A v2 id field: a string as sent, anything else null. */
function readIdOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** A v2 id list: the strings of an array, anything else empty. */
function readIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function readLibraryChange(payload: unknown): VjLibraryChange | null {
  const record = readVjRecord(payload);
  const { kind, packId, clipId, packIds } = record;
  const kinds: readonly unknown[] = VJ_LIBRARY_CHANGE_KINDS;
  if (!kinds.includes(kind)) return null;
  const isIdOrNull = (value: unknown) =>
    value === null || typeof value === "string";
  if (!isIdOrNull(packId) || !isIdOrNull(clipId)) return null;
  if (!Array.isArray(packIds)) return null;
  return {
    kind: kind as VjLibraryChange["kind"],
    packId: typeof packId === "string" ? packId : null,
    clipId: typeof clipId === "string" ? clipId : null,
    packIds: readIdList(packIds),
    sceneId: readIdOrNull(record.sceneId),
    setlistId: readIdOrNull(record.setlistId),
    setlistIds: readIdList(record.setlistIds),
    eventId: readIdOrNull(record.eventId),
  };
}

/** Turns a toServer message into a stage event, or null for liveness only. */
function eventOf(message: VjDemoMessage): VjDemoStageEvent | null {
  const { name, payload, tabId } = message;
  if (name === "demo:clientAlive") return null;
  if (name === "demo:bye") return { kind: "detach", tabId };
  if (name === "vj:attach") return { kind: "attach", tabId, payload };
  if (name === "library:changed") {
    const change = readLibraryChange(payload);
    return change === null ? null : { kind: "library", change };
  }
  return { kind: "frame", tabId, name, payload };
}

/** Starts the demo server on `channel`; `stop()` clears every timer and unsubscribes. */
export function startVjDemoServer(options: VjDemoServerOptions): {
  stop(): void;
} {
  const { channel, library } = options;
  const writeSetlistLooping =
    options.writeSetlistLooping ?? writeVjDemoSetlistLooping;
  const now = options.now ?? Date.now;
  const serverId = options.serverId ?? createVjDemoUuid();
  const epoch = (options.newEpoch ?? createVjDemoUuid)();
  let stage = createVjDemoStage(epoch, now());
  const lastHeardAt = new Map<string, number>();
  // When each attached tab's attach landed, for Live connections.
  const attachedAt = new Map<string, number>();
  let screensUpdateTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingScreensUpdate: VjDemoOutgoing | null = null;
  let isStopped = false;
  let lastHeartbeatAt = Number.NEGATIVE_INFINITY;
  // Contract 7.14 and sequences 5.7: the strobe cap, overlay auto-hide,
  // countdown hold and step timer, each armed for its server time; a fire
  // reduces its stage event, which syncs the timers again.
  const timers = createVjDemoStageTimers(now, (kind) => dispatch({ kind }));

  const post = (message: Omit<VjDemoMessage, "direction" | "tabId">) => {
    if (isStopped) return;
    channel.post({ direction: "toClients", tabId: serverId, ...message });
  };

  const postOutgoing = (frame: VjDemoOutgoing) => {
    post({
      name: frame.name,
      payload: frame.payload,
      targetTabId: frame.targetTabId,
      targetRole: frame.targetRole,
    });
  };

  const flushScreensUpdate = () => {
    screensUpdateTimer = null;
    if (pendingScreensUpdate !== null) postOutgoing(pendingScreensUpdate);
    pendingScreensUpdate = null;
  };

  // Contract 6.7: a 250 ms trailing throttle on screens:update to the remotes.
  const queueScreensUpdate = (frame: VjDemoOutgoing) => {
    pendingScreensUpdate = frame;
    screensUpdateTimer ??= setTimeout(
      flushScreensUpdate,
      VJ_DEMO_SCREENS_UPDATE_THROTTLE_MS,
    );
  };

  const dispatch = (
    event: VjDemoStageEvent,
    reply?: { requestId: string; tabId: string },
  ) => {
    if (isStopped) return;
    const result = reduceVjDemoStage(stage, event, {
      now: now(),
      library,
      writeSetlistLooping,
    });
    stage = result.stage;
    syncVjDemoAttachedAt(attachedAt, stage.attached, now());
    if (result.ack !== null && reply !== undefined) {
      post({
        name: "ack",
        payload: result.ack,
        requestId: reply.requestId,
        targetTabId: reply.tabId,
      });
    }
    for (const frame of result.outgoing) {
      const isRemotesUpdate =
        frame.name === "screens:update" &&
        frame.targetTabId === null &&
        frame.targetRole === "remote";
      if (isRemotesUpdate) queueScreensUpdate(frame);
      else postOutgoing(frame);
    }
    timers.sync(stage.state);
    // A step read that failed tries again later (sequences 5.7).
    if (result.setlistTimerRetryAt !== undefined) {
      timers.retry("setlistTimer", result.setlistTimerRetryAt);
    }
  };

  // Live connections in the VJ library: list and stop (vjDemoLive.ts).
  const liveHost: VjDemoLiveHost = {
    stage: () => stage,
    attachedAt,
    heardTabIds: () => [...lastHeardAt.keys()],
    stoppedTabs: createVjDemoStoppedTabs(),
    now,
    post,
    detach: (tabId) => {
      lastHeardAt.delete(tabId);
      dispatch({ kind: "detach", tabId });
    },
    dropStage: () => {
      stage = createVjDemoStage(createVjDemoUuid(), now());
      attachedAt.clear();
      lastHeardAt.clear();
      if (screensUpdateTimer !== null) clearTimeout(screensUpdateTimer);
      screensUpdateTimer = null;
      pendingScreensUpdate = null;
      // A new stageEpoch starts with fresh timers and no fired memory.
      timers.clear();
      timers.sync(stage.state);
    },
  };

  const isLowerServerHeartbeat = (message: VjDemoMessage) => {
    if (message.name !== "demo:heartbeat") return false;
    const otherServerId = readVjRecord(message.payload).serverId;
    return typeof otherServerId === "string" && otherServerId < serverId;
  };

  const unsubscribe = channel.subscribe((message) => {
    if (message.direction === "toClients") {
      if (isLowerServerHeartbeat(message)) {
        stop();
        options.onYield?.();
      }
      return;
    }
    if (isVjDemoLiveRequest(message)) {
      answerVjDemoLiveRequest(message, liveHost);
      return;
    }
    if (refuseVjDemoStoppedAttach(message, liveHost)) return;
    lastHeardAt.set(message.tabId, now());
    // A throttled timer lands before the frame that follows it in time.
    timers.fireOverdue();
    // A hidden hosting tab's interval may run once a minute; channel messages
    // are never throttled, so the clients' own traffic keeps the heartbeat
    // going and no client drops to reconnecting.
    if (now() - lastHeartbeatAt >= VJ_DEMO_HEARTBEAT_MS) sendHeartbeat();
    const event = eventOf(message);
    if (event === null) return;
    const requestId = message.requestId ?? null;
    dispatch(
      event,
      requestId === null ? undefined : { requestId, tabId: message.tabId },
    );
  });

  // A tab that went quiet (closed without a bye, or frozen) is detached.
  const detachSilentTabs = () => {
    for (const tabId of Object.keys(stage.attached)) {
      const heardAt = lastHeardAt.get(tabId) ?? 0;
      if (now() - heardAt > VJ_DEMO_SILENCE_MS) {
        lastHeardAt.delete(tabId);
        dispatch({ kind: "detach", tabId });
      }
    }
  };

  function sendHeartbeat() {
    lastHeartbeatAt = now();
    post({ name: "demo:heartbeat", payload: { serverId } });
  }
  const heartbeatTimer = setInterval(() => {
    timers.fireOverdue();
    sendHeartbeat();
    detachSilentTabs();
  }, VJ_DEMO_HEARTBEAT_MS);
  const pruneTimer = setInterval(
    () => dispatch({ kind: "pruneOffline" }),
    VJ_DEMO_PRUNE_INTERVAL_MS,
  );
  sendHeartbeat();

  // A hidden hosting tab's timeouts are throttled; back in view, anything
  // overdue fires at once.
  const hostDocument = typeof document === "undefined" ? null : document;
  const handleVisibilityChange = () => {
    if (hostDocument?.visibilityState === "visible") timers.fireOverdue();
  };
  hostDocument?.addEventListener("visibilitychange", handleVisibilityChange);

  function stop() {
    if (isStopped) return;
    isStopped = true;
    unsubscribe();
    clearInterval(heartbeatTimer);
    clearInterval(pruneTimer);
    timers.clear();
    hostDocument?.removeEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
    if (screensUpdateTimer !== null) clearTimeout(screensUpdateTimer);
    screensUpdateTimer = null;
    pendingScreensUpdate = null;
  }

  return { stop };
}
