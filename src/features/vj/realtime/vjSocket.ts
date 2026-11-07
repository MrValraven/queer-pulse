import type { Socket } from "socket.io-client";
import {
  mintSocketTicket,
  readLastRefreshSettlement,
  refreshSession,
} from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import {
  VJ_SERVER_FRAME_NAMES,
  type VjAck,
  type VjAttachSuccess,
  type VjExceptionFrame,
  type VjReauthAck,
  type VjServerFrameName,
  type VjSocketErrorCode,
} from "../../../shared/contracts/vj";
import { logWarn } from "../../../shared/observability/logger";
import {
  VJ_ACK_TIMEOUT_MS,
  VJ_REAUTH_ACK_TIMEOUT_MS,
  VJ_REAUTH_LEAD_MS,
  VJ_REAUTH_MIN_DELAY_MS,
  VJ_REAUTH_RATE_LIMITED_RETRY_MS,
  VJ_RECONNECT_BASE_DELAY_MS,
  VJ_RECONNECT_MAX_DELAY_MS,
  VJ_TICKET_MINT_RETRY_MS,
} from "../vj.constants";
import {
  createVjClockSyncSchedule,
  vjClockSampleOf,
  vjLocalNow,
  type VjClockSyncSchedule,
} from "./vjClockSync";
import type {
  VjAckFor,
  VjClientFrameName,
  VjClientPayload,
  VjScreenStatusPayload,
  VjServerFrame,
} from "./vjFrames";
import {
  VjSendError,
  type VjConnectionRefusal,
  type VjConnectionStatus,
  type VjTransport,
  type VjTransportOptions,
} from "./vjTransport";

type VjIoFactory = (url: string, options: object) => Socket;

export interface VjSocketClientOptions extends VjTransportOptions {
  /** Test seam; defaults to `() => import("socket.io-client").then((module) => module.io)`. */
  loadIo?: () => Promise<VjIoFactory>;
  now?: () => number;
  /** Test seam for clock samples; defaults to `vjLocalNow`. */
  localNow?: () => number;
}

/**
 * Which reauth a timer runs: the one scheduled before the connection expires,
 * the retry after a first failed ticket mint, or the one more try after a
 * reauth ack timeout or a second failed mint. After the last retry the
 * server's drop and the reconnect path take over.
 */
type VjReauthAttempt = "scheduled" | "mintRetry" | "lastRetry";

type VjForwardedFrameName = Exclude<VjServerFrameName, "exception">;

const FORWARDED_FRAME_NAMES: readonly VjForwardedFrameName[] =
  VJ_SERVER_FRAME_NAMES.filter(
    (frameName): frameName is VjForwardedFrameName => frameName !== "exception",
  );

/** Attach refusals that mean "try again later": drop, back off, reconnect. */
const RETRYABLE_ATTACH_CODES: readonly VjSocketErrorCode[] = [
  "vj_rate_limited",
  "vj_server_error",
];

const loadSocketIo = (): Promise<VjIoFactory> =>
  import("socket.io-client").then((module) => module.io);

/**
 * The refusal an `exception` frame ends this client with, or null for the
 * codes that wait for the server's drop.
 */
function exceptionRefusalOf(
  frame: Partial<VjExceptionFrame>,
): VjConnectionRefusal | null {
  if (frame.code === "FORBIDDEN") return "not_admin";
  if (frame.code === "SESSION_REVOKED") return "session_revoked";
  if (frame.code === "PLATFORM_LOCKED") return "platform_locked";
  const isReplaced = frame.domainCode === "vj_screen_replaced";
  if (frame.code === "BAD_REQUEST" && isReplaced) return "screen_replaced";
  return null;
}

function attachRefusalOf(code: VjSocketErrorCode): VjConnectionRefusal {
  if (code === "vj_not_admin") return "not_admin";
  // A cached page that predates the server's contract (C 7.1): only a reload helps.
  if (code === "vj_client_outdated") return "client_outdated";
  return "server_error";
}

function ackFailureCodeOf(ack: VjAck<object> | VjReauthAck): string | null {
  return ack.ok ? null : ack.code;
}

/**
 * One `/vj` socket in one role (screen or remote). Forwards the stage, role,
 * screens and library frames to `onFrame`, attaches again on every
 * (re)connect with a fresh `buildAttachPayload()`, keeps the connection alive
 * past the access token with `session:reauth`, and refreshes the session
 * after a server drop. Times every acked emit and runs the `clock:sync`
 * schedule from each connect, handing every sample to `onClockSample`
 * (C 7.2, 7.3). Logs codes and frame names only.
 */
export class VjSocketClient implements VjTransport {
  private readonly options: VjSocketClientOptions;
  private readonly now: () => number;
  private readonly localNow: () => number;
  private readonly clockSync: VjClockSyncSchedule;
  private socket: Socket | null = null;
  private isLoading = false;
  private isDisposed = false;
  private isRefused = false;
  private isAttached = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reauthTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: VjSocketClientOptions) {
    this.options = options;
    this.now = options.now ?? (() => Date.now());
    this.localNow = options.localNow ?? vjLocalNow;
    this.clockSync = createVjClockSyncSchedule(() => this.sendClockSync());
  }

  connect(): void {
    if (this.isDisposed || this.isLoading || this.socket !== null) return;
    this.isLoading = true;
    this.setStatus("connecting", null);
    const loadIo = this.options.loadIo ?? loadSocketIo;
    void loadIo().then(
      (io) => {
        this.isLoading = false;
        if (this.isDisposed) return;
        const socket = io(`${API_BASE_URL}/vj`, {
          withCredentials: true,
          transports: ["websocket"],
        });
        this.socket = socket;
        this.registerHandlers(socket);
      },
      () => {
        this.isLoading = false;
        if (this.isDisposed) return;
        logWarn("vj: socket client failed to load");
        this.refuse("server_error");
      },
    );
  }

  async send<Name extends VjClientFrameName>(
    name: Name,
    payload: VjClientPayload<Name>,
  ): Promise<VjAckFor<Name>> {
    const socket = this.socket;
    if (!this.isAttached || socket === null || !socket.connected) {
      throw new VjSendError(name, "disconnected");
    }
    let ack: VjAckFor<Name>;
    try {
      ack = await this.emitTimed(socket, name, payload, VJ_ACK_TIMEOUT_MS);
    } catch {
      logWarn("vj: frame ack timed out", { frame: name });
      throw new VjSendError(name, "timeout");
    }
    const failureCode = ackFailureCodeOf(ack);
    if (failureCode !== null) {
      logWarn("vj: frame refused", { frame: name, code: failureCode });
    }
    return ack;
  }

  sendScreenStatus(payload: VjScreenStatusPayload): void {
    const socket = this.socket;
    if (!this.isAttached || socket === null || !socket.connected) return;
    socket.emit("screen:status", payload);
  }

  dispose(): void {
    this.isDisposed = true;
    this.isAttached = false;
    this.clockSync.stop();
    this.clearReauthTimer();
    this.clearReconnectTimer();
    this.socket?.disconnect();
    this.socket = null;
  }

  /**
   * Every acked emit goes through here: reads the local clock before the emit
   * and when the ack arrives, and reports the sample when the ack carries
   * serverNow. Failed acks carry it too (C 7.2), so refusals sample as well.
   * Rejects when no ack comes within `timeoutMs`.
   */
  private async emitTimed<Name extends VjClientFrameName>(
    socket: Socket,
    name: Name,
    payload: VjClientPayload<Name>,
    timeoutMs: number,
  ): Promise<VjAckFor<Name>> {
    const sentAt = this.localNow();
    const ack = (await socket
      .timeout(timeoutMs)
      .emitWithAck(name, payload)) as VjAckFor<Name>;
    const receivedAt = this.localNow();
    const sample = vjClockSampleOf(sentAt, receivedAt, ack);
    if (sample !== null && !this.isDisposed) {
      this.options.onClockSample?.(sample);
    }
    return ack;
  }

  /**
   * One `clock:sync` of the C 7.3 schedule, allowed before attach. A timeout
   * or a failed ack is dropped quietly: the next send retries.
   */
  private sendClockSync(): void {
    const socket = this.socket;
    if (socket === null || !this.isLiveSocket(socket)) return;
    this.emitTimed(socket, "clock:sync", {}, VJ_ACK_TIMEOUT_MS).catch(
      () => undefined,
    );
  }

  private registerHandlers(socket: Socket): void {
    for (const frameName of FORWARDED_FRAME_NAMES) {
      socket.on(frameName, (payload: unknown) => {
        if (this.isDisposed || socket !== this.socket) return;
        this.options.onFrame({ event: frameName, payload } as VjServerFrame);
      });
    }
    socket.on("exception", (frame: unknown) =>
      this.handleException(socket, frame),
    );
    socket.on("connect", () => {
      if (!this.isCurrentSocket(socket)) return;
      // C 7.3 allows clock:sync before attach, so the clock is warm by the first stage frame.
      this.clockSync.start();
      void this.attach(socket);
    });
    // socket.io keeps its own backoff; the status tells the UI a connect failed.
    socket.on("connect_error", () => {
      if (!this.isCurrentSocket(socket)) return;
      this.setStatus("reconnecting", null);
    });
    socket.on("disconnect", (reason: string) =>
      this.handleDisconnect(socket, reason),
    );
  }

  private async attach(socket: Socket): Promise<void> {
    let ack: VjAckFor<"vj:attach">;
    try {
      ack = await this.emitTimed(
        socket,
        "vj:attach",
        this.options.buildAttachPayload(),
        VJ_ACK_TIMEOUT_MS,
      );
    } catch {
      if (!this.isLiveSocket(socket)) return;
      logWarn("vj: attach ack timed out", { frame: "vj:attach" });
      this.dropAndReconnect(socket);
      return;
    }
    if (!this.isLiveSocket(socket)) return;
    if (!ack.ok) {
      this.handleAttachRefused(socket, ack.code);
      return;
    }
    this.isAttached = true;
    this.reconnectAttempt = 0;
    this.scheduleReauthBefore(socket, ack.connectionExpiresAt);
    const { ok: _ok, serverNow: _serverNow, ...attach } = ack;
    this.setStatus("attached", null, attach);
  }

  private handleAttachRefused(socket: Socket, code: VjSocketErrorCode): void {
    logWarn("vj: attach refused", { code });
    if (RETRYABLE_ATTACH_CODES.includes(code)) {
      this.dropAndReconnect(socket);
      return;
    }
    this.refuse(attachRefusalOf(code));
    socket.disconnect();
  }

  /**
   * Drops this connection (its "disconnect" handler reports `reconnecting`)
   * and connects again after the backoff, with no session refresh.
   */
  private dropAndReconnect(socket: Socket): void {
    socket.disconnect();
    this.scheduleReconnect(socket, false);
  }

  private scheduleReauthBefore(socket: Socket, expiresAt: number): void {
    const delayMs = Math.max(
      expiresAt - VJ_REAUTH_LEAD_MS - this.now(),
      VJ_REAUTH_MIN_DELAY_MS,
    );
    this.scheduleReauth(socket, delayMs, "scheduled");
  }

  private scheduleReauth(
    socket: Socket,
    delayMs: number,
    attempt: VjReauthAttempt,
  ): void {
    this.clearReauthTimer();
    this.reauthTimer = setTimeout(
      () => {
        this.reauthTimer = null;
        void this.performReauth(socket, attempt);
      },
      Math.max(delayMs, 0),
    );
  }

  /** Mints a ticket and sends `session:reauth`, as the quizshow client does. */
  private async performReauth(
    socket: Socket,
    attempt: VjReauthAttempt,
  ): Promise<void> {
    if (!this.isLiveSocket(socket)) return;
    let ticket: string;
    try {
      ticket = (await mintSocketTicket()).ticket;
    } catch {
      if (!this.isLiveSocket(socket)) return;
      logWarn("vj: socket ticket mint failed");
      if (attempt === "scheduled") {
        this.scheduleReauth(socket, VJ_TICKET_MINT_RETRY_MS, "mintRetry");
      } else if (attempt === "mintRetry") {
        this.scheduleReauth(socket, VJ_REAUTH_MIN_DELAY_MS, "lastRetry");
      }
      return;
    }
    if (!this.isLiveSocket(socket)) return;
    let ack: VjAckFor<"session:reauth">;
    try {
      ack = await this.emitTimed(
        socket,
        "session:reauth",
        { ticket },
        VJ_REAUTH_ACK_TIMEOUT_MS,
      );
    } catch {
      if (!this.isLiveSocket(socket)) return;
      logWarn("vj: session reauth ack timed out", { frame: "session:reauth" });
      if (attempt !== "lastRetry") {
        this.scheduleReauth(socket, VJ_REAUTH_MIN_DELAY_MS, "lastRetry");
      }
      return;
    }
    if (!this.isLiveSocket(socket)) return;
    this.handleReauthAck(socket, ack);
  }

  private handleReauthAck(
    socket: Socket,
    ack: VjAckFor<"session:reauth">,
  ): void {
    if (ack.ok) {
      this.scheduleReauthBefore(socket, ack.exp * 1000);
      return;
    }
    // VjReauthAck answers with transport codes, outside VjSocketErrorCode (C 7.2).
    const failureCode = ack.code;
    logWarn("vj: session reauth refused", { code: failureCode });
    if (failureCode === "RATE_LIMITED") {
      this.scheduleReauth(socket, VJ_REAUTH_RATE_LIMITED_RETRY_MS, "scheduled");
      return;
    }
    if (failureCode === "FORBIDDEN") {
      this.refuse("not_admin");
      socket.disconnect();
    }
    // Every other refusal is followed by the server's drop, which the reconnect path handles.
  }

  private handleException(socket: Socket, frame: unknown): void {
    if (this.isDisposed || this.isRefused || socket !== this.socket) return;
    if (typeof frame !== "object" || frame === null) return;
    const exception = frame as Partial<VjExceptionFrame>;
    if (typeof exception.code !== "string") return;
    logWarn("vj: gateway exception", { code: exception.code });
    const refusal = exceptionRefusalOf(exception);
    if (refusal === null) return;
    this.refuse(refusal);
    socket.disconnect();
  }

  private handleDisconnect(socket: Socket, reason: string): void {
    if (this.isDisposed || socket !== this.socket) return;
    this.isAttached = false;
    this.clockSync.stop();
    this.clearReauthTimer();
    if (this.isRefused) return;
    this.setStatus("reconnecting", null);
    // socket.io reconnects on its own after every other reason.
    if (reason === "io server disconnect") this.scheduleReconnect(socket, true);
  }

  /** Backs off, refreshes the session cookie when asked, then reconnects. */
  private scheduleReconnect(
    socket: Socket,
    shouldRefreshSession: boolean,
  ): void {
    this.clearReconnectTimer();
    const delayMs = Math.min(
      VJ_RECONNECT_MAX_DELAY_MS,
      VJ_RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isCurrentSocket(socket)) return;
      if (!shouldRefreshSession) {
        socket.connect();
        return;
      }
      void this.refreshThenReconnect(socket);
    }, delayMs);
  }

  /**
   * A refresh that failed for the network or the cross-tab lock keeps
   * retrying with backoff, so a projector stays up offline; a refresh the
   * server rejected ends refused with `unauthorized`.
   */
  private async refreshThenReconnect(socket: Socket): Promise<void> {
    const isRefreshed = await refreshSession().catch(() => false);
    if (!this.isCurrentSocket(socket)) return;
    if (isRefreshed) {
      socket.connect();
      return;
    }
    const outcomeKind = readLastRefreshSettlement()?.outcome.kind ?? null;
    logWarn("vj: session refresh failed", { code: outcomeKind });
    if (outcomeKind === "networkFailed" || outcomeKind === "lockTimedOut") {
      this.setStatus("reconnecting", null);
      this.scheduleReconnect(socket, true);
      return;
    }
    this.refuse("unauthorized");
  }

  private refuse(refusal: VjConnectionRefusal): void {
    this.isRefused = true;
    this.isAttached = false;
    this.clockSync.stop();
    this.clearReauthTimer();
    this.clearReconnectTimer();
    this.setStatus("refused", refusal);
  }

  private setStatus(
    status: VjConnectionStatus,
    refusal: VjConnectionRefusal | null,
    attach: VjAttachSuccess | null = null,
  ): void {
    if (this.isDisposed) return;
    this.options.onConnection({ status, refusal, attach });
  }

  private isCurrentSocket(socket: Socket): boolean {
    return !this.isDisposed && !this.isRefused && socket === this.socket;
  }

  private isLiveSocket(socket: Socket): boolean {
    return this.isCurrentSocket(socket) && socket.connected;
  }

  private clearReauthTimer(): void {
    if (this.reauthTimer !== null) clearTimeout(this.reauthTimer);
    this.reauthTimer = null;
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}
