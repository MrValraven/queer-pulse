import type { Socket } from "socket.io-client";
import { mintSocketTicket, refreshSession } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import type {
  QuizshowAttachRole,
  QuizshowErrorCode,
  QuizshowExceptionFrame,
  QuizshowTimePong,
  QuizshowWsTransportCode,
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
}

type RefusalCode = QuizshowErrorCode | QuizshowWsTransportCode;

/**
 * Which reauth a timer runs: the one scheduled before the connection expires,
 * the retry after a first failed ticket mint, or the one more try after a
 * reauth ack timeout or a second failed mint. After the last retry the
 * server's drop and the reconnect path take over.
 */
type QuizshowReauthAttempt = "scheduled" | "mintRetry" | "lastRetry";

/** Exception codes that end this client for good. `UNAUTHORIZED` (an expired
 *  access cookie at the handshake), `TOKEN_EXPIRED` and the rest wait for the
 *  server's drop, whose reconnect path refreshes the session first; a failed
 *  refresh ends refused with `UNAUTHORIZED`. */
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

/**
 * One `/quizshow` socket for one session in one role. Forwards every server
 * frame to `onAction`, attaches again on every (re)connect so the server
 * replays `session:state`, keeps the connection alive past the access token
 * with `session:reauth`, and keeps the clock offset fresh with `time:ping`.
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

  constructor(options: QuizshowSocketClientOptions) {
    this.options = options;
    this.now = options.now ?? (() => Date.now());
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
        const socket = io(`${API_BASE_URL}/quizshow`, {
          withCredentials: true,
          transports: ["websocket"],
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
    this.clearConnectionTimers();
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
        if (eventName === "session:end" || eventName === "player:removed") {
          this.end(socket);
        }
      });
    }
    socket.on("time:pong", (pong: unknown) => this.handlePong(socket, pong));
    socket.on("exception", (frame: unknown) =>
      this.handleException(socket, frame),
    );
    socket.on("connect", () => {
      if (!this.isCurrentSocket(socket)) return;
      void this.attach(socket);
    });
    // socket.io keeps its own backoff; the status shows the UI a failed connect.
    socket.on("connect_error", () => {
      if (!this.isCurrentSocket(socket)) return;
      this.setStatus("reconnecting", null);
    });
    socket.on("disconnect", (reason: string) =>
      this.handleDisconnect(socket, reason),
    );
  }

  private async attach(socket: Socket): Promise<void> {
    let ack: QuizshowAckFor<"quizshow:attach">;
    try {
      ack = (await socket
        .timeout(QUIZSHOW_ACK_TIMEOUT_MS)
        .emitWithAck("quizshow:attach", {
          sessionId: this.options.sessionId,
          as: this.options.role,
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
    this.scheduleReauthBefore(socket, ack.connectionExpiresAt);
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
    if (!this.isLiveSocket(socket)) return;
    let ticket: string;
    try {
      ticket = (await mintSocketTicket()).ticket;
    } catch {
      if (!this.isLiveSocket(socket)) return;
      logWarn("quizshow: socket ticket mint failed");
      if (attempt === "scheduled") {
        this.scheduleReauth(socket, QUIZSHOW_TICKET_MINT_RETRY_MS, "mintRetry");
      } else if (attempt === "mintRetry") {
        this.scheduleReauth(socket, QUIZSHOW_REAUTH_MIN_DELAY_MS, "lastRetry");
      }
      return;
    }
    if (!this.isLiveSocket(socket)) return;
    let ack: QuizshowAckFor<"session:reauth">;
    try {
      ack = (await socket
        .timeout(QUIZSHOW_REAUTH_ACK_TIMEOUT_MS)
        .emitWithAck("session:reauth", {
          ticket,
        })) as QuizshowAckFor<"session:reauth">;
    } catch {
      if (!this.isLiveSocket(socket)) return;
      logWarn("quizshow: session:reauth ack timed out");
      if (attempt !== "lastRetry") {
        this.scheduleReauth(socket, QUIZSHOW_REAUTH_MIN_DELAY_MS, "lastRetry");
      }
      return;
    }
    if (!this.isLiveSocket(socket)) return;
    if (ack.ok) {
      this.scheduleReauthBefore(socket, ack.exp * 1000);
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
    if (!REFUSING_EXCEPTION_CODES.includes(code)) return;
    this.refuse(code);
    socket.disconnect();
  }

  private handleDisconnect(socket: Socket, reason: string): void {
    if (this.isDisposed || socket !== this.socket) return;
    this.clearConnectionTimers();
    if (this.isRefused || this.hasEnded) return;
    this.setStatus("reconnecting", null);
    // socket.io reconnects on its own after every other reason.
    if (reason === "io server disconnect") this.scheduleReconnect(socket, true);
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
      void refreshSession()
        .catch(() => false)
        .then((isRefreshed) => {
          if (!this.isCurrentSocket(socket)) return;
          if (!isRefreshed) {
            this.refuse("UNAUTHORIZED");
            return;
          }
          socket.connect();
        });
    }, delayMs);
  }

  /** The session ended for this client: it stays disconnected with every timer cleared and sends no status after "ended". */
  private end(socket: Socket): void {
    this.hasEnded = true;
    this.clearConnectionTimers();
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    socket.disconnect();
  }

  private refuse(code: RefusalCode): void {
    this.isRefused = true;
    this.clearConnectionTimers();
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.setStatus("refused", code);
  }

  private setStatus(
    status: QuizshowConnectionStatus,
    refusalCode: RefusalCode | null,
  ): void {
    if (this.isDisposed) return;
    this.options.onAction({
      event: "local:status",
      payload: { status, refusalCode },
    });
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

  private clearClockTimers(): void {
    for (const pingTimer of this.clockPingTimers) clearTimeout(pingTimer);
    this.clockPingTimers = [];
    if (this.clockResyncTimer !== null) clearTimeout(this.clockResyncTimer);
    this.clockResyncTimer = null;
  }

  private clearConnectionTimers(): void {
    if (this.reauthTimer !== null) clearTimeout(this.reauthTimer);
    this.reauthTimer = null;
    this.reauthExpiresAt = null;
    this.reauthFiresAt = null;
    this.clearClockTimers();
  }
}
