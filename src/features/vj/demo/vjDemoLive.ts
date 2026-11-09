// Live connections in demo mode: the demo server answers a list and a stop
// over the demo channel, the way admin/vj/live answers them live. A stopped
// client gets the same `vj_stopped` exception a live socket gets. The demo
// holds one stage, the demo member's own; a connection id is the client's
// tab id.

import type {
  VjLiveConnectionDTO,
  VjLiveDTO,
  VjLiveStoppedDTO,
} from "../../../shared/contracts/vj";
import {
  createVjDemoUuid,
  openVjDemoChannel,
  VJ_DEMO_TAB_ID,
  type VjDemoChannel,
  type VjDemoMessage,
} from "./vjDemoChannel";
import { leadOf, type VjDemoStage } from "./vjDemoScreens";
import { readVjRecord } from "./vjDemoStageCommands";
import { vjDemoWriter } from "./vjDemoStorePersistence";
import { vjRefusal } from "./vjDemoRules";

/** The list request; its ack carries the connections. */
export const VJ_DEMO_LIVE_LIST = "demo:liveList";
/** The stop request; payload `{ connectionId }` stops one, and a payload with
 *  no `connectionId` (the library sends `{}`) stops every one. */
export const VJ_DEMO_LIVE_STOP = "demo:liveStop";

/** How many stopped tab ids the demo server remembers, and for how long: a
 *  late attach from a stopped tab within that time is refused as stopped. A
 *  reload gets a fresh tab id, so it never meets this memory. */
const VJ_DEMO_STOPPED_TAB_LIMIT = 64;
const VJ_DEMO_STOPPED_TAB_TTL_MS = 60_000;

/** The same message the live gateway sends with `vj_stopped`. */
const VJ_STOPPED_MESSAGE = "Stopped from the VJ library";

/** How long the library waits for the hosting tab; the host answers at once,
 *  so a miss means no demo screen or remote is open. */
const VJ_DEMO_LIVE_ANSWER_MS = 1_000;

const NOTHING_CONNECTED: VjLiveDTO = { stages: [], idleStageCount: 0 };
const NOTHING_STOPPED: VjLiveStoppedDTO = {
  stoppedScreenCount: 0,
  stoppedRemoteCount: 0,
};

export function isVjDemoLiveRequest(message: VjDemoMessage): boolean {
  return (
    message.name === VJ_DEMO_LIVE_LIST || message.name === VJ_DEMO_LIVE_STOP
  );
}

/** Keeps `attachedAt` in step with the stage: a tab that just attached starts
 *  its clock now, a tab that left is forgotten. */
export function syncVjDemoAttachedAt(
  attachedAt: Map<string, number>,
  attached: VjDemoStage["attached"],
  now: number,
): void {
  for (const tabId of Object.keys(attached)) {
    if (!attachedAt.has(tabId)) attachedAt.set(tabId, now);
  }
  for (const tabId of [...attachedAt.keys()]) {
    if (!(tabId in attached)) attachedAt.delete(tabId);
  }
}

/** Screens by number, then remotes by the time their attach landed. */
export function vjDemoLiveConnectionsOf(
  stage: VjDemoStage,
  attachedAt: ReadonlyMap<string, number>,
  now: number,
): VjLiveConnectionDTO[] {
  const lead = leadOf(stage.screens);
  const screens = stage.screens
    .filter((entry) => entry.tabId !== null && entry.tabId in stage.attached)
    .sort((left, right) => left.number - right.number)
    .map((entry): VjLiveConnectionDTO => ({
      connectionId: entry.tabId ?? "",
      role: "screen",
      screenNumber: entry.number,
      isLead: lead?.screenId === entry.screenId,
      connectedAt: new Date(entry.connectedAt ?? now).toISOString(),
      isFullscreen: entry.isFullscreen,
      renderer: entry.health?.renderer ?? null,
    }));
  const remotes = Object.entries(stage.attached)
    .filter(([, role]) => role === "remote")
    .map(([tabId]) => ({ tabId, since: attachedAt.get(tabId) ?? now }))
    .sort((left, right) => left.since - right.since)
    .map(({ tabId, since }): VjLiveConnectionDTO => ({
      connectionId: tabId,
      role: "remote",
      screenNumber: null,
      isLead: false,
      connectedAt: new Date(since).toISOString(),
      isFullscreen: null,
      renderer: null,
    }));
  return [...screens, ...remotes];
}

/** The tab ids a stop reached, kept a short while (bounded and expiring). */
export interface VjDemoStoppedTabs {
  remember(tabIds: Iterable<string>, now: number): void;
  has(tabId: string, now: number): boolean;
}

export function createVjDemoStoppedTabs(): VjDemoStoppedTabs {
  // Insertion order is age order: the oldest entry comes first.
  const stoppedAt = new Map<string, number>();
  const forgetExpired = (now: number) => {
    for (const [tabId, at] of stoppedAt) {
      if (now - at < VJ_DEMO_STOPPED_TAB_TTL_MS) break;
      stoppedAt.delete(tabId);
    }
  };
  return {
    remember(tabIds, now) {
      for (const tabId of tabIds) {
        stoppedAt.delete(tabId);
        stoppedAt.set(tabId, now);
      }
      forgetExpired(now);
      for (const tabId of stoppedAt.keys()) {
        if (stoppedAt.size <= VJ_DEMO_STOPPED_TAB_LIMIT) break;
        stoppedAt.delete(tabId);
      }
    },
    has(tabId, now) {
      forgetExpired(now);
      return stoppedAt.has(tabId);
    },
  };
}

/** What the demo server needs from its runner to answer. */
export interface VjDemoLiveHost {
  stage(): VjDemoStage;
  attachedAt: ReadonlyMap<string, number>;
  /** Every client tab heard from lately, attached or still attaching. */
  heardTabIds(): string[];
  stoppedTabs: VjDemoStoppedTabs;
  now(): number;
  post(message: Omit<VjDemoMessage, "direction" | "tabId">): void;
  /** Runs the normal detach: lead handover and screens:update to remotes. */
  detach(tabId: string): void;
  /** Drops the stage and its timers; the next attach starts a fresh one. */
  dropStage(): void;
}

function stoppedException(): unknown {
  return {
    status: "error",
    code: "BAD_REQUEST",
    message: VJ_STOPPED_MESSAGE,
    domainCode: "vj_stopped",
  };
}

function stopOne(connectionId: unknown, host: VjDemoLiveHost): unknown {
  const role =
    typeof connectionId === "string"
      ? host.stage().attached[connectionId]
      : undefined;
  if (typeof connectionId !== "string" || role === undefined) {
    return { ok: false, code: "VJ_CONNECTION_NOT_FOUND" };
  }
  host.post({
    name: "exception",
    payload: stoppedException(),
    targetTabId: connectionId,
  });
  host.stoppedTabs.remember([connectionId], host.now());
  host.detach(connectionId);
  return {
    ok: true,
    stoppedScreenCount: role === "screen" ? 1 : 0,
    stoppedRemoteCount: role === "remote" ? 1 : 0,
  };
}

/** Every client tab hears the stop, attached or still attaching. The library
 *  tab that asked is left out of the stopped memory, so it can open a screen
 *  or remote right after. */
function stopEverything(host: VjDemoLiveHost, requesterTabId: string): unknown {
  const attached = host.stage().attached;
  const roles = Object.values(attached);
  const stoppedTabIds = new Set([
    ...Object.keys(attached),
    ...host.heardTabIds(),
  ]);
  stoppedTabIds.delete(requesterTabId);
  host.post({ name: "exception", payload: stoppedException() });
  host.stoppedTabs.remember(stoppedTabIds, host.now());
  host.dropStage();
  return {
    ok: true,
    stoppedScreenCount: roles.filter((role) => role === "screen").length,
    stoppedRemoteCount: roles.filter((role) => role === "remote").length,
  };
}

function answerOf(message: VjDemoMessage, host: VjDemoLiveHost): unknown {
  const stage = host.stage();
  if (message.name === VJ_DEMO_LIVE_LIST) {
    const connections = vjDemoLiveConnectionsOf(
      stage,
      host.attachedAt,
      host.now(),
    );
    const isHoldingIdleStage =
      connections.length === 0 &&
      (stage.state.revision > 0 || stage.screens.length > 0);
    return { ok: true, connections, isHoldingIdleStage };
  }
  const { connectionId } = readVjRecord(message.payload);
  return connectionId === undefined
    ? stopEverything(host, message.tabId)
    : stopOne(connectionId, host);
}

/** An attach from a tab a stop reached a moment ago (sent before the stop
 *  landed there) gets the same `vj_stopped` exception, so it never lands on
 *  the fresh stage. True when it was refused; the caller drops it. */
export function refuseVjDemoStoppedAttach(
  message: VjDemoMessage,
  host: VjDemoLiveHost,
): boolean {
  if (message.name !== "vj:attach") return false;
  if (!host.stoppedTabs.has(message.tabId, host.now())) return false;
  host.post({
    name: "exception",
    payload: stoppedException(),
    targetTabId: message.tabId,
  });
  return true;
}

/** Answers one list or stop request with an ack to the asking tab. */
export function answerVjDemoLiveRequest(
  message: VjDemoMessage,
  host: VjDemoLiveHost,
): void {
  const answer = answerOf(message, host);
  if (typeof message.requestId !== "string") return;
  host.post({
    name: "ack",
    payload: answer,
    requestId: message.requestId,
    targetTabId: message.tabId,
  });
}

/** Asks the hosting tab; null when no host answers in time. */
function askVjDemoHost(
  name: string,
  payload: unknown,
  openChannel: () => VjDemoChannel,
): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    const channel = openChannel();
    const requestId = createVjDemoUuid();
    const finish = (answer: Record<string, unknown> | null) => {
      clearTimeout(timer);
      unsubscribe();
      channel.close();
      resolve(answer);
    };
    const timer = setTimeout(() => finish(null), VJ_DEMO_LIVE_ANSWER_MS);
    const unsubscribe = channel.subscribe((message) => {
      const isOurAck =
        message.direction === "toClients" &&
        message.name === "ack" &&
        message.requestId === requestId;
      if (isOurAck) finish(readVjRecord(message.payload));
    });
    channel.post({
      direction: "toServer",
      name,
      payload,
      tabId: VJ_DEMO_TAB_ID,
      requestId,
      targetTabId: null,
    });
  });
}

/** The demo GET admin/vj/live: nothing connected while no demo VJ tab is open. */
export async function demoGetVjLive(
  openChannel: () => VjDemoChannel = openVjDemoChannel,
): Promise<VjLiveDTO> {
  const answer = await askVjDemoHost(VJ_DEMO_LIVE_LIST, null, openChannel);
  if (answer === null || answer.ok !== true) return NOTHING_CONNECTED;
  const connections = Array.isArray(answer.connections)
    ? (answer.connections as VjLiveConnectionDTO[])
    : [];
  const idleStageCount = answer.isHoldingIdleStage === true ? 1 : 0;
  if (connections.length === 0) return { stages: [], idleStageCount };
  return {
    stages: [{ owner: vjDemoWriter(), isOwnStage: true, connections }],
    idleStageCount,
  };
}

function stoppedOf(answer: Record<string, unknown>): VjLiveStoppedDTO {
  const countOf = (value: unknown) => (typeof value === "number" ? value : 0);
  return {
    stoppedScreenCount: countOf(answer.stoppedScreenCount),
    stoppedRemoteCount: countOf(answer.stoppedRemoteCount),
  };
}

/** The demo POST admin/vj/live/stop. */
export async function demoStopVjLive(
  openChannel: () => VjDemoChannel = openVjDemoChannel,
): Promise<VjLiveStoppedDTO> {
  const answer = await askVjDemoHost(VJ_DEMO_LIVE_STOP, {}, openChannel);
  return answer === null ? NOTHING_STOPPED : stoppedOf(answer);
}

/** The demo POST admin/vj/live/connections/:id/stop. A connection no host
 *  holds answers VJ_CONNECTION_NOT_FOUND, as live. */
export async function demoStopVjLiveConnection(
  connectionId: string,
  openChannel: () => VjDemoChannel = openVjDemoChannel,
): Promise<VjLiveStoppedDTO> {
  const answer = await askVjDemoHost(
    VJ_DEMO_LIVE_STOP,
    { connectionId },
    openChannel,
  );
  if (answer === null || answer.ok !== true) {
    throw vjRefusal("VJ_CONNECTION_NOT_FOUND");
  }
  return stoppedOf(answer);
}
