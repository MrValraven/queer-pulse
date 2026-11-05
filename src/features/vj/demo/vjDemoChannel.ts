/**
 * The demo VJ channel: every demo tab of this origin talks over one
 * BroadcastChannel (contract 8.6, plan gap 4). A browser without
 * BroadcastChannel, or one that refuses to open it, gets a silent channel so
 * demo mode still renders in a single tab.
 */
import type { VjAttachRole } from "../../../shared/contracts/vj";
import { VJ_DEMO_CHANNEL_NAME } from "../vj.constants";

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

const UUID_BYTE_COUNT = 16;

/** A random v4 uuid. Falls back to getRandomValues where randomUUID is
 *  missing (a demo served over plain http on a LAN address). */
export function createVjDemoUuid(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(UUID_BYTE_COUNT));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

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

function createSilentVjDemoChannel(): VjDemoChannel {
  return {
    post: () => undefined,
    subscribe: () => () => undefined,
    close: () => undefined,
  };
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
    return createSilentVjDemoChannel();
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
