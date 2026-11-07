// The demo VJ transport: VjTransport over the demo channel, with the stage
// server hosted by whichever demo VJ tab holds the Web Lock. Behaves like the
// live socket for useVjStage: every ack is a clock sample, the clock:sync
// schedule runs from each new host (the demo's connect), and frames keep
// their applyAt as the server sent them.

import {
  VJ_SERVER_FRAME_NAMES,
  type VjAttachRole,
  type VjAttachSuccess,
} from "../../../shared/contracts/vj";
import {
  createVjClockSyncSchedule,
  vjClockSampleOf,
  vjLocalNow,
  type VjClockSyncSchedule,
} from "../realtime/vjClockSync";
import type {
  VjAckFor,
  VjClientFrameName,
  VjClientPayload,
  VjScreenStatusPayload,
  VjServerFrame,
} from "../realtime/vjFrames";
import {
  INITIAL_VJ_CONNECTION,
  VjSendError,
  type VjConnectionRefusal,
  type VjConnectionState,
  type VjTransport,
  type VjTransportOptions,
} from "../realtime/vjTransport";
import {
  VJ_ACK_TIMEOUT_MS,
  VJ_DEMO_HEARTBEAT_MS,
  VJ_DEMO_SILENCE_MS,
} from "../vj.constants";
import {
  createVjDemoUuid,
  openVjDemoChannel,
  VJ_DEMO_TAB_ID,
  type VjDemoChannel,
  type VjDemoMessage,
} from "./vjDemoChannel";
import { defaultVjDemoLock, type VjDemoLockSeam } from "./vjDemoHosting";
import { startVjDemoServer } from "./vjDemoServer";
import { readVjRecord } from "./vjDemoStageCommands";
import { vjDemoLibraryLookup, type VjDemoLibraryLookup } from "./vjDemoStore";

export interface VjDemoTransportOptions extends VjTransportOptions {
  channelFactory?: () => VjDemoChannel;
  lock?: VjDemoLockSeam;
  library?: VjDemoLibraryLookup;
  tabId?: string;
  now?: () => number;
  /** Test seam for clock samples; defaults to `vjLocalNow`. */
  localNow?: () => number;
}

interface VjPendingAck {
  /** Runs synchronously, so a frame right behind the ack sees its effect. */
  settle(ack: unknown): void;
  fail(error: VjSendError): void;
  frameName: string;
  timer: ReturnType<typeof setTimeout>;
}

/** Every server frame but `exception`, as the live socket forwards them
 *  (stage:state, screen:role, screens:update, library:changed and
 *  screen:identify). */
const FORWARDED_FRAME_NAMES: ReadonlySet<string> = new Set<string>(
  VJ_SERVER_FRAME_NAMES.filter((frameName) => frameName !== "exception"),
);

export class VjDemoTransport implements VjTransport {
  private readonly options: VjDemoTransportOptions;
  private readonly tabId: string;
  private readonly role: VjAttachRole;
  private readonly localNow: () => number;
  private readonly clockSync: VjClockSyncSchedule;
  private readonly pending = new Map<string, VjPendingAck>();
  private channel: VjDemoChannel | null = null;
  private serverChannel: VjDemoChannel | null = null;
  private server: { stop(): void } | null = null;
  private releaseLock: (() => void) | null = null;
  private unsubscribe: (() => void) | null = null;
  private aliveTimer: ReturnType<typeof setInterval> | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private serverId: string | null = null;
  private connection: VjConnectionState = INITIAL_VJ_CONNECTION;
  private isAttached = false;
  private isAttaching = false;
  /** The attach in flight; an older one that settles late is ignored. */
  private attachToken: object | null = null;
  private isStarted = false;
  private isDisposed = false;
  private isRefused = false;

  constructor(options: VjDemoTransportOptions) {
    this.options = options;
    this.tabId = options.tabId ?? VJ_DEMO_TAB_ID;
    this.role = options.role;
    this.localNow = options.localNow ?? vjLocalNow;
    this.clockSync = createVjClockSyncSchedule(() => this.sendClockSync());
  }

  connect(): void {
    if (this.isStarted || this.isDisposed) return;
    this.isStarted = true;
    const openChannel = this.options.channelFactory ?? openVjDemoChannel;
    const channel = openChannel();
    this.channel = channel;
    this.unsubscribe = channel.subscribe((message) =>
      this.handleMessage(message),
    );
    this.report({ status: "connecting", refusal: null, attach: null });
    this.postAlive();
    this.aliveTimer = setInterval(() => this.postAlive(), VJ_DEMO_HEARTBEAT_MS);
    this.armSilence();
    const lock = this.options.lock ?? defaultVjDemoLock();
    this.releaseLock = lock.request(() => this.host(openChannel, lock));
  }

  send<Name extends VjClientFrameName>(
    name: Name,
    payload: VjClientPayload<Name>,
  ): Promise<VjAckFor<Name>> {
    if (!this.isAttached || this.isDisposed) {
      return Promise.reject(new VjSendError(name, "disconnected"));
    }
    return new Promise<VjAckFor<Name>>((resolve, reject) => {
      this.request(name, payload, {
        settle: (ack) => {
          if (readVjRecord(ack).code === "vj_not_attached") this.markDetached();
          resolve(ack as VjAckFor<Name>);
        },
        fail: reject,
      });
    });
  }

  sendScreenStatus(payload: VjScreenStatusPayload): void {
    if (!this.isAttached) return;
    this.post({ name: "screen:status", payload });
  }

  dispose(): void {
    if (this.isDisposed) return;
    this.post({ name: "demo:bye", payload: null });
    this.isDisposed = true;
    this.isAttached = false;
    this.stopClient();
    this.server?.stop();
    this.server = null;
    this.releaseLock?.();
    this.releaseLock = null;
    this.serverChannel?.close();
    this.serverChannel = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.channel?.close();
    this.channel = null;
  }

  private host(openChannel: () => VjDemoChannel, lock: VjDemoLockSeam): void {
    if (this.isDisposed || this.server !== null) return;
    this.serverChannel = openChannel();
    this.server = startVjDemoServer({
      channel: this.serverChannel,
      library: this.options.library ?? vjDemoLibraryLookup,
      now: this.options.now,
      onYield: () => this.yieldHosting(openChannel, lock),
    });
  }

  /** Another tab hosts too and keeps it: step down and wait for the lock again. */
  private yieldHosting(
    openChannel: () => VjDemoChannel,
    lock: VjDemoLockSeam,
  ): void {
    this.server = null;
    this.serverChannel?.close();
    this.serverChannel = null;
    this.releaseLock?.();
    this.releaseLock = this.isDisposed
      ? null
      : lock.request(() => this.host(openChannel, lock));
  }

  private post(message: Omit<VjDemoMessage, "direction" | "tabId">): void {
    if (this.isDisposed) return;
    this.channel?.post({
      direction: "toServer",
      tabId: this.tabId,
      ...message,
    });
  }

  private postAlive(): void {
    this.post({ name: "demo:clientAlive", payload: null });
  }

  private report(connection: VjConnectionState): void {
    this.connection = connection;
    this.options.onConnection(connection);
  }

  /**
   * Every acked frame goes through here: reads the local clock before the
   * post and when the ack arrives, and reports the sample before the ack
   * settles. Refusals carry serverNow too (C 7.2), so they sample as well.
   */
  private request(
    name: string,
    payload: unknown,
    handlers: Pick<VjPendingAck, "settle" | "fail">,
  ): void {
    const requestId = createVjDemoUuid();
    const sentAt = this.localNow();
    const timer = setTimeout(() => {
      this.pending.delete(requestId);
      handlers.fail(new VjSendError(name, "timeout"));
    }, VJ_ACK_TIMEOUT_MS);
    const settle = (ack: unknown) => {
      const sample = vjClockSampleOf(sentAt, this.localNow(), ack);
      if (sample !== null && !this.isDisposed) {
        this.options.onClockSample?.(sample);
      }
      handlers.settle(ack);
    };
    this.pending.set(requestId, {
      settle,
      fail: handlers.fail,
      frameName: name,
      timer,
    });
    this.post({ name, payload, requestId });
  }

  /**
   * One `clock:sync` of the C 7.3 schedule, answered before attach too. A
   * timeout or a failed ack is dropped quietly: the next send retries.
   */
  private sendClockSync(): void {
    if (this.isDisposed || this.isRefused) return;
    this.request(
      "clock:sync",
      {},
      { settle: () => undefined, fail: () => undefined },
    );
  }

  private attach(): void {
    if (
      this.isAttaching ||
      this.isAttached ||
      this.isRefused ||
      this.isDisposed
    )
      return;
    this.isAttaching = true;
    const token = {};
    this.attachToken = token;
    this.request("vj:attach", this.options.buildAttachPayload(), {
      settle: (ack) => {
        if (token === this.attachToken) this.settleAttach(ack);
      },
      fail: () => {
        // No ack in time: the next heartbeat tries again.
        if (token === this.attachToken) this.isAttaching = false;
      },
    });
  }

  private settleAttach(ack: unknown): void {
    this.isAttaching = false;
    this.attachToken = null;
    const record = readVjRecord(ack);
    if (record.ok === true) {
      const success = record as unknown as VjAttachSuccess;
      const attach: VjAttachSuccess = {
        role: success.role,
        connectionExpiresAt: success.connectionExpiresAt,
        stageEpoch: success.stageEpoch,
        isRestored: success.isRestored,
        isLead: success.isLead,
        screenNumber: success.screenNumber,
      };
      this.isAttached = true;
      this.report({ status: "attached", refusal: null, attach });
      return;
    }
    if (record.code === "vj_client_outdated") {
      // A page that predates the stage's contract (C 7.1): only a reload helps.
      this.refuse("client_outdated");
    } else if (record.code === "vj_screen_id_invalid") {
      this.refuse("server_error");
    } else if (record.code === "vj_already_attached") {
      // The server kept an attach whose ack was lost: leave, then attach again.
      this.post({ name: "demo:bye", payload: null });
      this.attach();
    }
  }

  private refuse(refusal: VjConnectionRefusal): void {
    this.isRefused = true;
    this.isAttached = false;
    this.stopClient();
    this.report({ status: "refused", refusal, attach: null });
  }

  /** Stops talking as a client; a hosted server keeps running for the other tabs. */
  private stopClient(): void {
    this.clockSync.stop();
    if (this.aliveTimer !== null) clearInterval(this.aliveTimer);
    this.aliveTimer = null;
    if (this.silenceTimer !== null) clearTimeout(this.silenceTimer);
    this.silenceTimer = null;
    for (const [requestId, pendingAck] of this.pending) {
      clearTimeout(pendingAck.timer);
      this.pending.delete(requestId);
      pendingAck.fail(new VjSendError(pendingAck.frameName, "disconnected"));
    }
  }

  private markDetached(): void {
    this.isAttached = false;
    if (this.connection.status !== "reconnecting" && !this.isRefused) {
      this.report({ status: "reconnecting", refusal: null, attach: null });
    }
  }

  private armSilence(): void {
    if (this.silenceTimer !== null) clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => {
      this.silenceTimer = null;
      // No heartbeat for VJ_DEMO_SILENCE_MS: the hosting tab is gone, as a
      // live disconnect; the next host's first heartbeat starts the sync again.
      this.serverId = null;
      this.clockSync.stop();
      this.markDetached();
      this.armSilence();
    }, VJ_DEMO_SILENCE_MS);
  }

  private handleHeartbeat(payload: unknown): void {
    this.armSilence();
    const { serverId } = readVjRecord(payload);
    if (typeof serverId !== "string") return;
    if (serverId !== this.serverId) {
      const hasKnownServer = this.serverId !== null || this.isAttached;
      this.serverId = serverId;
      // A new host holds a new stage, as after a backend restart.
      if (hasKnownServer) this.markDetached();
      this.isAttached = false;
      this.isAttaching = false;
      this.attachToken = null;
      // The demo's connect: C 7.3 allows clock:sync before attach, so the
      // clock is warm by the first stage frame.
      this.clockSync.start();
    }
    this.attach();
  }

  private handleException(payload: unknown): void {
    const { domainCode } = readVjRecord(payload);
    if (domainCode === "vj_screen_replaced") this.refuse("screen_replaced");
    else if (domainCode === "vj_not_admin") this.refuse("not_admin");
  }

  private handleMessage(message: VjDemoMessage): void {
    if (this.isDisposed || message.direction !== "toClients") return;
    const { targetTabId, targetRole } = message;
    const isForOtherTab =
      typeof targetTabId === "string" && targetTabId !== this.tabId;
    const isForOtherRole =
      typeof targetRole === "string" && targetRole !== this.role;
    if (isForOtherTab || isForOtherRole) return;
    if (this.isRefused) return;
    if (message.name === "demo:heartbeat") {
      this.handleHeartbeat(message.payload);
      return;
    }
    if (message.name === "ack") {
      const pendingAck = this.pending.get(message.requestId ?? "");
      if (pendingAck === undefined) return;
      this.pending.delete(message.requestId ?? "");
      clearTimeout(pendingAck.timer);
      pendingAck.settle(message.payload);
      return;
    }
    if (message.name === "exception") {
      this.handleException(message.payload);
      return;
    }
    if (this.isAttached && FORWARDED_FRAME_NAMES.has(message.name)) {
      this.options.onFrame({
        event: message.name,
        payload: message.payload,
      } as VjServerFrame);
    }
  }
}
