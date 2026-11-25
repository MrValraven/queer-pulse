import type { Socket } from "socket.io-client";
import {
  mintSocketTicket,
  readLastRefreshSettlement,
  refreshSession,
  type RefreshOutcome,
} from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import {
  QUIZSHOW_LIMITS,
  type QuizshowAttachRole,
  type QuizshowErrorCode,
  type QuizshowExceptionFrame,
  type QuizshowTimePong,
  type QuizshowWsTransportCode,
} from "../../../shared/contracts/quizshow";
import { logWarn } from "../../../shared/observability/logger";
import {
  QUIZSHOW_ACK_TIMEOUT_MS,
  QUIZSHOW_CLOCK_PING_COUNT,
  QUIZSHOW_CLOCK_PING_GAP_MS,
  QUIZSHOW_CLOCK_RESYNC_MS,
  QUIZSHOW_CLOCK_SAMPLES_KEPT,
  QUIZSHOW_REAUTH_ACK_TIMEOUT_MS,
  QUIZSHOW_REAUTH_LEAD_MS,
  QUIZSHOW_REAUTH_MIN_DELAY_MS,
  QUIZSHOW_REAUTH_RATE_LIMITED_RETRY_MS,
  QUIZSHOW_RECONNECT_BASE_DELAY_MS,
  QUIZSHOW_RECONNECT_MAX_DELAY_MS,
  QUIZSHOW_TICKET_MINT_RETRY_MS,
} from "../quizshow.constants";
import type {
  QuizshowClientAction,
  QuizshowConnectionStatus,
  QuizshowRetryCause,
} from "./quizshowClientStore";
import {
  estimateClockOffset,
  serverNow,
  type QuizshowClockSample,
} from "./quizshowClock";
import {
  QUIZSHOW_SERVER_FRAME_NAMES,
  type QuizshowAckFor,
  type QuizshowClientFrameName,
  type QuizshowClientPayload,
  type QuizshowServerFrame,
} from "./quizshowFrames";

/** A frame that went out while disconnected, or whose ack never came back in time. */
export class QuizshowSendTimeoutError extends Error {
  constructor(frameName: string) {
    super(`quizshow: ${frameName} got no ack`);
    this.name = "QuizshowSendTimeoutError";
  }
}

type QuizshowIoFactory = (url: string, options: object) => Socket;

export interface QuizshowSocketClientOptions {
  sessionId: string;
  role: QuizshowAttachRole;
  onAction: (action: QuizshowClientAction) => void;
  onClockOffset: (offsetMs: number) => void;
  /** Test seam; defaults to `() => import("socket.io-client").then((module) => module.io)`. */
  loadIo?: () => Promise<QuizshowIoFactory>;
  now?: () => number;
  /** The store cursor's phase id, which the wake resync compares with the
   *  `session:ping` ack (contract 6.6). Absent: only a ping timeout forces a reconnect. */
  currentPhaseId?: () => string | null;
  /**
   * A paired device's ticket (contract 6.5). Role `screen`: sent in the
   * handshake `auth`, and the member reauth stays off (a TV may be signed
   * out). Role `host`: a helper's ticket, sent in the attach payload; the
   * member reauth runs as for any member.
   */
  deviceTicket?: string | null;
}

type RefusalCode = QuizshowErrorCode | QuizshowWsTransportCode;

/** The transport codes the connection banner names while it retries (item 42). */
const RETRY_TRANSPORT_CODES: readonly QuizshowWsTransportCode[] = [
  "UNAUTHORIZED",
  "RATE_LIMITED",
  "SERVER_ERROR",
];

/** Drop codes that say the access cookie lapsed: only these reconnect through a
 *  session refresh. Every other drop reconnects with backoff alone (contract 13). */
const REFRESH_TRANSPORT_CODES: readonly QuizshowWsTransportCode[] = [
  "UNAUTHORIZED",
  "TOKEN_EXPIRED",
];

/** A paired TV's ticket stopped verifying: refresh cannot fix a ticket, so the
 *  screen ends refused and shows the pairing code again (contract 4.4). */
const DEVICE_TICKET_FAILURE_CODES: readonly QuizshowWsTransportCode[] = [
  "TOKEN_EXPIRED",
  "UNAUTHORIZED",
];

/**
 * Which reauth a timer runs: the one scheduled before the connection expires,
 * the retry after a first failed ticket mint, or the one more try after a
 * reauth ack timeout or a second failed mint. After the last retry the
 * server's drop and the reconnect path take over.
 */
type QuizshowReauthAttempt = "scheduled" | "mintRetry" | "lastRetry";

/** Exception codes that end this client for good. `UNAUTHORIZED` (an expired
 *  access cookie at the handshake) and `TOKEN_EXPIRED` wait for the server's
 *  drop, whose reconnect path refreshes the session first; a refresh the server
 *  rejects ends refused with `UNAUTHORIZED`. The rest wait for the drop and
 *  reconnect with backoff. */
const REFUSING_EXCEPTION_CODES: readonly QuizshowWsTransportCode[] = [
  "SESSION_REVOKED",
  "FORBIDDEN",
  "NOT_FOUND",
  "PLATFORM_LOCKED",
];

const loadSocketIo = (): Promise<QuizshowIoFactory> =>
  import("socket.io-client").then((module) => module.io);

function isTimePong(value: unknown): value is QuizshowTimePong {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.clientSentAt === "number" &&
    typeof candidate.serverReceivedAt === "number" &&
    typeof candidate.serverSentAt === "number"
  );
}

function exceptionCodeOf(value: unknown): QuizshowWsTransportCode | null {
  if (typeof value !== "object" || value === null) return null;
  const code = (value as Partial<QuizshowExceptionFrame>).code;
  return typeof code === "string" ? code : null;
}

/** The code a `connect_error` carries, on the error or on its `data` (a handshake middleware refusal). */
function connectErrorCodeOf(error: unknown): QuizshowWsTransportCode | null {
  if (typeof error !== "object" || error === null) return null;
  return (
    exceptionCodeOf((error as { data?: unknown }).data) ??
    exceptionCodeOf(error)
  );
}

function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Why a retry happens, for the banner: offline first, else a named transport code, else null. */
function retryCauseOf(
  transportCode: QuizshowWsTransportCode | null,
): QuizshowRetryCause | null {
  if (isDeviceOffline()) return "offline";
  if (transportCode === null) return null;
  // An expired access token reconnects through the same refresh as UNAUTHORIZED.
  if (transportCode === "TOKEN_EXPIRED") return "UNAUTHORIZED";
  return RETRY_TRANSPORT_CODES.includes(transportCode)
    ? (transportCode as QuizshowRetryCause)
    : null;
}

/** The outcome of a refresh that settled at or after `startedAt`; null when none did. */
function refreshOutcomeSince(startedAt: number): RefreshOutcome | null {
  const settlement = readLastRefreshSettlement();
  return settlement !== null && settlement.settledAt >= startedAt
    ? settlement.outcome
    : null;
}

/** Only the server rejecting the refresh with 401 or 403 says the session is gone. */
function isSessionRejected(outcome: RefreshOutcome | null): boolean {
  return (
    outcome?.kind === "rejected" &&
    (outcome.status === 401 || outcome.status === 403)
  );
}

/** Why a refresh that said nothing about the session is tried again, for the banner. */
function refreshRetryCauseOf(
  outcome: RefreshOutcome | null,
): QuizshowRetryCause {
  if (isDeviceOffline()) return "offline";
  if (outcome?.kind === "rejected" && outcome.status === 429) {
    return "RATE_LIMITED";
  }
  if (outcome?.kind === "rejected" && outcome.status >= 500) {
    return "SERVER_ERROR";
  }
  return "UNAUTHORIZED";
}

function isFinishedEnd(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) return false;
  return (payload as { status?: unknown }).status === "finished";
}

/**
 * One `/quizshow` socket for one session in one role. Forwards every server
 * frame to `onAction`, attaches again on every (re)connect so the server
 * replays `session:state`, keeps the connection alive past the access token
 * with `session:reauth`, and keeps the clock offset fresh with `time:ping`.
 * Answers the gateway's `time:probe`, resyncs on wake with `session:ping`,
 * and carries a paired device's ticket (contract 6.3, 6.5, 6.6).
 * Logs codes and ids only.
 */
export class QuizshowSocketClient {
  private readonly options: QuizshowSocketClientOptions;
  private readonly now: () => number;
  private socket: Socket | null = null;
  private isLoading = false;
  private isDisposed = false;
  private isRefused = false;
  private hasEnded = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reauthTimer: ReturnType<typeof setTimeout> | null = null;
  private clockResyncTimer: ReturnType<typeof setTimeout> | null = null;
  private clockPingTimers: ReturnType<typeof setTimeout>[] = [];
  private clockSamples: QuizshowClockSample[] = [];
  /** The latest offset sent to `onClockOffset`; 0 until the first pong. */
  private clockOffsetMs = 0;
  private hasClockOffset = false;
  /** Whether an offset already existed when this clock round started; such a round waits for its samples. */
  private hasRoundBaseline = false;
  /** Server epoch ms the pending scheduled reauth works back from; null for a retry. */
  private reauthExpiresAt: number | null = null;
  /** Client time the pending reauth timer fires at. */
  private reauthFiresAt: number | null = null;
  /** Server epoch ms the connection expires at, from the attach or the latest reauth ack. */
  private connectionExpiresAt: number | null = null;
  /** The ticket the socket carries; null for a member socket. */
  private readonly deviceTicket: string | null;
  /** A paired TV: the ticket rides the handshake and no member reauth runs. */
  private readonly isDeviceSocket: boolean;
  /** Set while a finished session keeps the socket open for `session:rematch` (contract 6.17). */
  private rematchWindowTimer: ReturnType<typeof setTimeout> | null = null;
  private isWakePingInFlight = false;
  private hasWakeListeners = false;
  /** True from a successful attach until the next disconnect; the wake ping waits for it. */
  private isSocketAttached = false;
  /** The latest `exception` code since the last attach, for the retry cause (item 42). */
  private lastTransportCode: QuizshowWsTransportCode | null = null;

  constructor(options: QuizshowSocketClientOptions) {
    this.options = options;
    this.now = options.now ?? (() => Date.now());
    this.deviceTicket = options.deviceTicket ?? null;
    this.isDeviceSocket =
      options.role === "screen" && this.deviceTicket !== null;
  }

  connect(): void {
    if (this.isDisposed || this.isLoading || this.socket !== null) return;
    this.isLoading = true;
    this.addWakeListeners();
    this.setStatus("connecting", null);
    const loadIo = this.options.loadIo ?? loadSocketIo;
    void loadIo().then(
      (io) => {
        this.isLoading = false;
        if (this.isDisposed) return;
        const socket = io(`${API_BASE_URL}/quizshow`, {
          withCredentials: true,
          transports: ["websocket"],
          ...(this.isDeviceSocket
            ? { auth: { deviceTicket: this.deviceTicket } }
            : {}),
        });
        this.socket = socket;
        this.registerHandlers(socket);
      },
      () => {
        this.isLoading = false;
        if (this.isDisposed) return;
        logWarn("quizshow: socket client failed to load");
        this.refuse("SERVER_ERROR");
      },
    );
  }

  async send<Name extends QuizshowClientFrameName>(
    name: Name,
    payload: QuizshowClientPayload<Name>,
  ): Promise<QuizshowAckFor<Name>> {
    const socket = this.socket;
    if (this.isDisposed || socket === null || !socket.connected) {
      throw new QuizshowSendTimeoutError(name);
    }
    try {
      return (await socket
        .timeout(QUIZSHOW_ACK_TIMEOUT_MS)
        .emitWithAck(name, payload)) as QuizshowAckFor<Name>;
    } catch {
      throw new QuizshowSendTimeoutError(name);
    }
  }

  dispose(): void {
    this.isDisposed = true;
    this.removeWakeListeners();
    this.clearConnectionTimers();
    this.clearRematchWindowTimer();
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.disconnect();
    this.socket = null;
  }

  private registerHandlers(socket: Socket): void {
    for (const eventName of QUIZSHOW_SERVER_FRAME_NAMES) {
      socket.on(eventName, (payload: unknown) => {
        if (this.isDisposed || socket !== this.socket) return;
        this.options.onAction({
          event: eventName,
          payload,
        } as QuizshowServerFrame);
        this.handleClosingFrame(socket, eventName, payload);
      });
    }
    socket.on("time:pong", (pong: unknown) => this.handlePong(socket, pong));
    // The gateway measures round trips itself (contract 6.3): answer at once;
    // the probe never reaches the store.
    socket.on(
      "time:probe",
      (_probe: unknown, ack?: (reply: Record<string, never>) => void) => {
        ack?.({});
      },
    );
    socket.on("exception", (frame: unknown) =>
      this.handleException(socket, frame),
    );
    socket.on("connect", () => {
      if (!this.isCurrentSocket(socket)) return;
      void this.attach(socket);
    });
    // socket.io keeps its own backoff; the status shows the UI a failed connect.
    socket.on("connect_error", (error: unknown) => {
      if (!this.isCurrentSocket(socket)) return;
      this.setStatus(
        "reconnecting",
        null,
        retryCauseOf(connectErrorCodeOf(error)),
      );
    });
    socket.on("disconnect", (reason: string) =>
      this.handleDisconnect(socket, reason),
    );
  }

  /**
   * A finished session keeps a member socket in the old session's rooms for
   * `session:rematch` (contract 6.17); the rematch closes it. An abandoned
   * session, a removal, an unpairing and every end on a paired TV close it now.
   */
  private handleClosingFrame(
    socket: Socket,
    eventName: QuizshowServerFrame["event"],
    payload: unknown,
  ): void {
    if (eventName === "session:end") {
      this.end(socket, isFinishedEnd(payload) && !this.isDeviceSocket);
      return;
    }
    if (eventName === "player:removed" || eventName === "device:unpaired") {
      this.end(socket, false);
      return;
    }
    if (eventName === "session:rematch" && this.hasEnded) {
      this.closeEndedSocket(socket);
    }
  }

  private async attach(socket: Socket): Promise<void> {
    let ack: QuizshowAckFor<"quizshow:attach">;
    try {
      ack = (await socket
        .timeout(QUIZSHOW_ACK_TIMEOUT_MS)
        .emitWithAck("quizshow:attach", {
          sessionId: this.options.sessionId,
          as: this.options.role,
          // A helper's ticket rides the attach (contract 4.4); a TV's rides the handshake.
          ...(this.options.role === "host" && this.deviceTicket !== null
            ? { deviceTicket: this.deviceTicket }
            : {}),
        })) as QuizshowAckFor<"quizshow:attach">;
    } catch {
      if (!this.isLiveSocket(socket)) return;
      logWarn("quizshow: attach ack timed out", {
        sessionId: this.options.sessionId,
      });
      socket.disconnect();
      this.scheduleReconnect(socket, false);
      return;
    }
    if (!this.isLiveSocket(socket)) return;
    if (!ack.ok) {
      logWarn("quizshow: attach refused", {
        sessionId: this.options.sessionId,
        code: ack.code,
      });
      this.refuse(ack.code);
      socket.disconnect();
      return;
    }
    this.reconnectAttempt = 0;
    this.lastTransportCode = null;
    this.isSocketAttached = true;
    // A paired TV has no member session to mint a ticket from; its device ticket lasts the night.
    if (!this.isDeviceSocket) {
      this.scheduleReauthBefore(socket, ack.connectionExpiresAt);
    }
    this.startClockRound(socket);
  }

  /** The wait before reauth for a connection that expires at `expiresAt` on the server's clock. */
  private reauthDelayBefore(expiresAt: number): number {
    return Math.max(
      expiresAt -
        QUIZSHOW_REAUTH_LEAD_MS -
        serverNow(this.now(), this.clockOffsetMs),
      QUIZSHOW_REAUTH_MIN_DELAY_MS,
    );
  }

  private scheduleReauthBefore(socket: Socket, expiresAt: number): void {
    this.connectionExpiresAt = expiresAt;
    this.scheduleReauth(
      socket,
      this.reauthDelayBefore(expiresAt),
      "scheduled",
      expiresAt,
    );
  }

  private scheduleReauth(
    socket: Socket,
    delayMs: number,
    attempt: QuizshowReauthAttempt = "scheduled",
    expiresAt: number | null = null,
  ): void {
    if (this.reauthTimer !== null) clearTimeout(this.reauthTimer);
    const waitMs = Math.max(delayMs, 0);
    this.reauthExpiresAt = expiresAt;
    this.reauthFiresAt = this.now() + waitMs;
    this.reauthTimer = setTimeout(() => {
      this.reauthTimer = null;
      this.reauthExpiresAt = null;
      this.reauthFiresAt = null;
      void this.performReauth(socket, attempt);
    }, waitMs);
  }

  /**
   * A new clock offset can bring the scheduled reauth forward: the first
   * attach is timed before any pong came back. It only ever moves earlier.
   */
  private bringReauthForward(socket: Socket): void {
    const { reauthExpiresAt, reauthFiresAt } = this;
    if (
      this.reauthTimer === null ||
      reauthExpiresAt === null ||
      reauthFiresAt === null
    ) {
      return;
    }
    const delayMs = this.reauthDelayBefore(reauthExpiresAt);
    if (this.now() + delayMs < reauthFiresAt) {
      this.scheduleReauth(socket, delayMs, "scheduled", reauthExpiresAt);
    }
  }

  /** Mints a ticket and sends `session:reauth`, as the chat client's proactive reauth does. */
  private async performReauth(
    socket: Socket,
    attempt: QuizshowReauthAttempt,
  ): Promise<void> {
    if (!this.isReauthSocket(socket)) return;
    let ticket: string;
    try {
      ticket = (await mintSocketTicket()).ticket;
    } catch {
      if (!this.isReauthSocket(socket)) return;
      logWarn("quizshow: socket ticket mint failed");
      if (attempt === "scheduled") {
        this.scheduleReauth(socket, QUIZSHOW_TICKET_MINT_RETRY_MS, "mintRetry");
      } else if (attempt === "mintRetry") {
        this.scheduleReauth(socket, QUIZSHOW_REAUTH_MIN_DELAY_MS, "lastRetry");
      }
      return;
    }
    if (!this.isReauthSocket(socket)) return;
    let ack: QuizshowAckFor<"session:reauth">;
    try {
      ack = (await socket
        .timeout(QUIZSHOW_REAUTH_ACK_TIMEOUT_MS)
        .emitWithAck("session:reauth", {
          ticket,
        })) as QuizshowAckFor<"session:reauth">;
    } catch {
      if (!this.isReauthSocket(socket)) return;
      logWarn("quizshow: session:reauth ack timed out");
      if (attempt !== "lastRetry") {
        this.scheduleReauth(socket, QUIZSHOW_REAUTH_MIN_DELAY_MS, "lastRetry");
      }
      return;
    }
    if (!this.isReauthSocket(socket)) return;
    if (ack.ok) {
      const nextExpiresAt = ack.exp * 1000;
      // A helper's ticket caps the connection (contract 6.5): a reauth that
      // cannot move the expiry later would only fire again at once, so the
      // server's drop at the ceiling and the reconnect path take over.
      const isExpiryCapped =
        this.connectionExpiresAt !== null &&
        nextExpiresAt <= this.connectionExpiresAt;
      if (isExpiryCapped) return;
      this.scheduleReauthBefore(socket, nextExpiresAt);
      return;
    }
    // The reauth bucket answers with the transport code, outside QuizshowErrorCode.
    const failureCode: string = ack.code;
    if (failureCode === "RATE_LIMITED") {
      this.scheduleReauth(socket, QUIZSHOW_REAUTH_RATE_LIMITED_RETRY_MS);
      return;
    }
    // Every other refusal is followed by the server's drop, which the reconnect path handles.
    logWarn("quizshow: session:reauth refused", { code: failureCode });
  }

  /** Five pings, QUIZSHOW_CLOCK_PING_GAP_MS apart, then a new round every QUIZSHOW_CLOCK_RESYNC_MS. */
  private startClockRound(socket: Socket): void {
    this.clearClockTimers();
    this.clockSamples = [];
    this.hasRoundBaseline = this.hasClockOffset;
    for (
      let pingIndex = 0;
      pingIndex < QUIZSHOW_CLOCK_PING_COUNT;
      pingIndex += 1
    ) {
      const pingTimer = setTimeout(() => {
        if (!this.isLiveSocket(socket)) return;
        socket.emit("time:ping", { clientSentAt: this.now() });
      }, pingIndex * QUIZSHOW_CLOCK_PING_GAP_MS);
      this.clockPingTimers.push(pingTimer);
    }
    this.clockResyncTimer = setTimeout(() => {
      this.clockResyncTimer = null;
      if (this.isLiveSocket(socket)) this.startClockRound(socket);
    }, QUIZSHOW_CLOCK_RESYNC_MS);
  }

  /**
   * The first round reports every pong. Every later round keeps the
   * previous offset until it holds QUIZSHOW_CLOCK_SAMPLES_KEPT samples, so one
   * slow pong after a resync or a reconnect never moves the countdowns.
   */
  private handlePong(socket: Socket, pong: unknown): void {
    if (this.isDisposed || socket !== this.socket || !isTimePong(pong)) return;
    this.clockSamples.push({
      clientSentAt: pong.clientSentAt,
      serverReceivedAt: pong.serverReceivedAt,
      serverSentAt: pong.serverSentAt,
      clientReceivedAt: this.now(),
    });
    if (
      this.hasRoundBaseline &&
      this.clockSamples.length < QUIZSHOW_CLOCK_SAMPLES_KEPT
    ) {
      return;
    }
    this.clockOffsetMs = estimateClockOffset(this.clockSamples);
    this.hasClockOffset = true;
    this.options.onClockOffset(this.clockOffsetMs);
    this.bringReauthForward(socket);
  }

  private handleException(socket: Socket, frame: unknown): void {
    if (this.isDisposed || this.hasEnded || socket !== this.socket) return;
    const code = exceptionCodeOf(frame);
    if (code === null) return;
    logWarn("quizshow: gateway exception", { code });
    this.lastTransportCode = code;
    if (this.isDeviceSocket && DEVICE_TICKET_FAILURE_CODES.includes(code)) {
      this.refuse("quizshow_device_ticket_expired");
      socket.disconnect();
      return;
    }
    if (!REFUSING_EXCEPTION_CODES.includes(code)) return;
    this.refuse(code);
    socket.disconnect();
  }

  private handleDisconnect(socket: Socket, reason: string): void {
    if (this.isDisposed || socket !== this.socket) return;
    this.isSocketAttached = false;
    this.clearConnectionTimers();
    // An exception names the cause only of the server drop that follows it.
    const transportCode =
      reason === "io server disconnect" ? this.lastTransportCode : null;
    this.lastTransportCode = null;
    if (this.hasEnded) {
      // The server dropped a socket held open for the rematch: it stays down.
      this.closeEndedSocket(socket);
      return;
    }
    if (this.isRefused) return;
    this.setStatus("reconnecting", null, retryCauseOf(transportCode));
    // socket.io reconnects on its own after every other reason. Only an
    // expired or refused access cookie refreshes first; a paired TV has no
    // member session to refresh, so it reconnects straight away.
    if (reason === "io server disconnect") {
      const shouldRefreshSession =
        !this.isDeviceSocket &&
        transportCode !== null &&
        REFRESH_TRANSPORT_CODES.includes(transportCode);
      this.scheduleReconnect(socket, shouldRefreshSession);
    }
  }

  /** Backs off, refreshes the session cookie when asked, then reconnects. */
  private scheduleReconnect(
    socket: Socket,
    shouldRefreshSession: boolean,
  ): void {
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    const delayMs = Math.min(
      QUIZSHOW_RECONNECT_MAX_DELAY_MS,
      QUIZSHOW_RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isCurrentSocket(socket)) return;
      if (!shouldRefreshSession) {
        socket.connect();
        return;
      }
      void this.refreshThenConnect(socket);
    }, delayMs);
  }

  /**
   * Refreshes the session, then reconnects. Only a refresh the server
   * rejected with 401 or 403 ends refused; a network fault, a 5xx, a 429 or
   * an abandoned cross-tab lock says nothing about the session, so the
   * refresh is tried again with backoff.
   */
  private async refreshThenConnect(socket: Socket): Promise<void> {
    const refreshStartedAt = Date.now();
    const isRefreshed = await refreshSession().catch(() => false);
    if (!this.isCurrentSocket(socket)) return;
    if (isRefreshed) {
      socket.connect();
      return;
    }
    const outcome = refreshOutcomeSince(refreshStartedAt);
    if (isSessionRejected(outcome)) {
      this.refuse("UNAUTHORIZED");
      return;
    }
    logWarn("quizshow: session refresh failed, retrying", {
      outcome: outcome?.kind ?? "unknown",
    });
    this.setStatus("reconnecting", null, refreshRetryCauseOf(outcome));
    this.scheduleReconnect(socket, true);
  }

  /**
   * The session ended for this client: the reconnect and clock timers are
   * cleared and no status follows "ended". `shouldStayOpen` keeps the socket
   * connected until `session:rematch`, `dispose`, `rematchWindowMs` or the
   * server's own drop (contract 6.17). The held socket keeps its
   * `session:reauth` schedule, so the access token's expiry cannot drop it
   * inside the window; every other end clears the reauth too.
   */
  private end(socket: Socket, shouldStayOpen: boolean): void {
    this.hasEnded = true;
    this.clearClockTimers();
    this.clearRematchWindowTimer();
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    if (!shouldStayOpen || !socket.connected) {
      this.clearReauthTimer();
      this.removeWakeListeners();
      socket.disconnect();
      return;
    }
    this.rematchWindowTimer = setTimeout(() => {
      this.rematchWindowTimer = null;
      this.closeEndedSocket(socket, true);
    }, QUIZSHOW_LIMITS.rematchWindowMs);
  }

  /**
   * Closes a socket an end kept open: the reauth stops, the wake listeners
   * go, and disconnecting also stops socket.io's own reconnect.
   * The window timer passes `wasHeldOpen`, since it clears its own handle first.
   */
  private closeEndedSocket(
    socket: Socket,
    wasHeldOpen = this.rematchWindowTimer !== null,
  ): void {
    this.clearRematchWindowTimer();
    this.clearReauthTimer();
    this.removeWakeListeners();
    if (wasHeldOpen && socket === this.socket) socket.disconnect();
  }

  private clearRematchWindowTimer(): void {
    if (this.rematchWindowTimer !== null) clearTimeout(this.rematchWindowTimer);
    this.rematchWindowTimer = null;
  }

  private refuse(code: RefusalCode): void {
    this.isRefused = true;
    this.removeWakeListeners();
    this.clearConnectionTimers();
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.setStatus("refused", code);
  }

  /** Every status names its retry cause, null outside a retry, so the store never keeps a stale one. */
  private setStatus(
    status: QuizshowConnectionStatus,
    refusalCode: RefusalCode | null,
    retryCause: QuizshowRetryCause | null = null,
  ): void {
    if (this.isDisposed) return;
    this.options.onAction({
      event: "local:status",
      payload: { status, refusalCode, retryCause },
    });
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") void this.resyncAfterWake();
  };

  private readonly handleOnline = (): void => {
    void this.resyncAfterWake();
  };

  private addWakeListeners(): void {
    if (this.hasWakeListeners || typeof window === "undefined") return;
    this.hasWakeListeners = true;
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("online", this.handleOnline);
  }

  private removeWakeListeners(): void {
    if (!this.hasWakeListeners) return;
    this.hasWakeListeners = false;
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    window.removeEventListener("online", this.handleOnline);
  }

  /**
   * Resync on wake (contract 6.6): a woken or back-online device checks it is
   * still in step with an acked `session:ping`. A timeout, or a phase the
   * store does not hold, reconnects, and the reattach replays `session:state`.
   * A device that is down connects at once, unless a reconnect is already
   * scheduled (that path may refresh the session first). Skipped until the
   * socket is attached, and after a refusal or an end.
   */
  private async resyncAfterWake(): Promise<void> {
    const socket = this.socket;
    if (socket === null || !this.isCurrentSocket(socket)) return;
    if (!socket.connected) {
      if (this.reconnectTimer === null) socket.connect();
      return;
    }
    // Before the attach ack the attach itself replays `session:state`.
    if (!this.isSocketAttached || this.isWakePingInFlight) return;
    this.isWakePingInFlight = true;
    let isInStep: boolean;
    try {
      const ack = (await socket
        .timeout(QUIZSHOW_LIMITS.sessionPingTimeoutMs)
        .emitWithAck("session:ping", {})) as QuizshowAckFor<"session:ping">;
      const expectedPhaseId = this.options.currentPhaseId?.();
      isInStep =
        ack.ok &&
        (expectedPhaseId === undefined || ack.phaseId === expectedPhaseId);
    } catch {
      isInStep = false;
    } finally {
      this.isWakePingInFlight = false;
    }
    if (isInStep || !this.isLiveSocket(socket)) return;
    logWarn("quizshow: wake resync reconnects", {
      sessionId: this.options.sessionId,
    });
    socket.disconnect();
    socket.connect();
  }

  private isCurrentSocket(socket: Socket): boolean {
    return (
      !this.isDisposed &&
      !this.isRefused &&
      !this.hasEnded &&
      socket === this.socket
    );
  }

  private isLiveSocket(socket: Socket): boolean {
    return this.isCurrentSocket(socket) && socket.connected;
  }

  /** A live socket, or one a finished session holds open for the rematch: both keep their reauth. */
  private isReauthSocket(socket: Socket): boolean {
    if (this.isLiveSocket(socket)) return true;
    const isHeldForRematch = this.hasEnded && this.rematchWindowTimer !== null;
    return (
      isHeldForRematch &&
      !this.isDisposed &&
      !this.isRefused &&
      socket === this.socket &&
      socket.connected
    );
  }

  private clearClockTimers(): void {
    for (const pingTimer of this.clockPingTimers) clearTimeout(pingTimer);
    this.clockPingTimers = [];
    if (this.clockResyncTimer !== null) clearTimeout(this.clockResyncTimer);
    this.clockResyncTimer = null;
  }

  private clearReauthTimer(): void {
    if (this.reauthTimer !== null) clearTimeout(this.reauthTimer);
    this.reauthTimer = null;
    this.reauthExpiresAt = null;
    this.reauthFiresAt = null;
  }

  private clearConnectionTimers(): void {
    this.clearReauthTimer();
    this.clearClockTimers();
  }
}
