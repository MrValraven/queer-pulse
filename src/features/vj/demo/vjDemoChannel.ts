/**
 * The demo VJ channel: every demo tab of this origin talks over one
 * BroadcastChannel (contract 8.6, plan gap 4). A browser without
 * BroadcastChannel, or one that refuses to open it, gets an in-memory hub
 * shared by every channel this tab opens, so the tab's own server and client
 * still talk and demo mode works in that single tab.
 */
import type { VjAttachRole } from "../../../shared/contracts/vj";
import { VJ_DEMO_CHANNEL_NAME } from "../vj.constants";
import { createVjUuid } from "../live/vjUuid";

export interface VjDemoMessage {
  direction: "toServer" | "toClients";
  name: string;
  payload: unknown;
  tabId: string;
  requestId?: string | null;
  targetTabId?: string | null;
  targetRole?: VjAttachRole | null;
}

export interface VjDemoChannel {
  post(message: VjDemoMessage): void;
  subscribe(listener: (message: VjDemoMessage) => void): () => void;
  close(): void;
}

type VjDemoListener = (message: VjDemoMessage) => void;

/** A random v4 uuid; the shared helper carries the plain http fallback. */
export const createVjDemoUuid: () => string = createVjUuid;

/** This page load's id on the demo channel. */
export const VJ_DEMO_TAB_ID: string = createVjDemoUuid();

/** Whether a received value has the demo message shape. */
export function isVjDemoMessage(value: unknown): value is VjDemoMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.direction === "toServer" ||
      candidate.direction === "toClients") &&
    typeof candidate.name === "string" &&
    typeof candidate.tabId === "string"
  );
}

/** A copy of a message the way a structured clone would hand it over. */
function cloneVjDemoMessage(message: VjDemoMessage): VjDemoMessage {
  if (typeof structuredClone === "function") {
    return structuredClone(message);
  }
  return JSON.parse(JSON.stringify(message)) as VjDemoMessage;
}

let tabVjDemoHub: { open(): VjDemoChannel } | null = null;

/** The one in-memory hub of this page load, for a browser without BroadcastChannel. */
function openTabLocalVjDemoChannel(): VjDemoChannel {
  tabVjDemoHub ??= createVjDemoChannelHub();
  return tabVjDemoHub.open();
}

function openBroadcastChannel(): BroadcastChannel | null {
  try {
    if (typeof BroadcastChannel !== "function") {
      return null;
    }
    return new BroadcastChannel(VJ_DEMO_CHANNEL_NAME);
  } catch {
    return null;
  }
}

/** Opens the demo channel over BroadcastChannel. */
export function openVjDemoChannel(): VjDemoChannel {
  const broadcastChannel = openBroadcastChannel();
  if (broadcastChannel === null) {
    return openTabLocalVjDemoChannel();
  }
  const listeners = new Set<VjDemoListener>();
  let isClosed = false;
  const handleMessage = (event: MessageEvent<unknown>) => {
    if (isClosed || !isVjDemoMessage(event.data)) {
      return;
    }
    const message = event.data;
    for (const listener of [...listeners]) {
      listener(message);
    }
  };
  broadcastChannel.addEventListener("message", handleMessage);
  return {
    post(message) {
      if (isClosed) {
        return;
      }
      try {
        broadcastChannel.postMessage(message);
      } catch {
        // A payload the browser cannot clone, or a channel it already closed.
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    close() {
      if (isClosed) {
        return;
      }
      isClosed = true;
      listeners.clear();
      broadcastChannel.removeEventListener("message", handleMessage);
      try {
        broadcastChannel.close();
      } catch {
        // Closing twice or after the page unloads is harmless.
      }
    },
  };
}

interface VjDemoHubMember {
  isOpen: boolean;
  listeners: Set<VjDemoListener>;
}

/** Test seam: an in-memory hub that delivers each post to every other open
 *  channel of the hub, asynchronously and as a copy, like BroadcastChannel. */
export function createVjDemoChannelHub(): { open(): VjDemoChannel } {
  const members = new Set<VjDemoHubMember>();
  return {
    open() {
      const member: VjDemoHubMember = { isOpen: true, listeners: new Set() };
      members.add(member);
      return {
        post(message) {
          if (!member.isOpen) {
            return;
          }
          const receivers = [...members].filter(
            (candidate) => candidate !== member,
          );
          const copy = cloneVjDemoMessage(message);
          queueMicrotask(() => {
            for (const receiver of receivers) {
              if (!receiver.isOpen) {
                continue;
              }
              for (const listener of [...receiver.listeners]) {
                listener(cloneVjDemoMessage(copy));
              }
            }
          });
        },
        subscribe(listener) {
          member.listeners.add(listener);
          return () => {
            member.listeners.delete(listener);
          };
        },
        close() {
          member.isOpen = false;
          member.listeners.clear();
          members.delete(member);
        },
      };
    },
  };
}
