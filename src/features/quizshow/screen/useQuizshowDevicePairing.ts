import { useCallback, useEffect, useReducer, useRef } from "react";
import { ApiError } from "../../../shared/api/client";
import { causeErrorKey } from "../../../shared/api/causeErrorKey";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPairedDeviceKind,
  type QuizshowPairingClaim,
} from "../../../shared/contracts/quizshow";
import {
  claimPairing,
  startHelperPairing,
  startScreenPairing,
} from "../api/quizshowPairing.api";
import { quizshowErrorCodeOf } from "../api/quizshowErrors";
import type { QuizshowPairedClaim } from "./quizshowDeviceTicket";

export type QuizshowDevicePairingStatus =
  "starting" | "showing" | "paired" | "expired" | "failed";

export interface QuizshowDevicePairing {
  status: QuizshowDevicePairingStatus;
  pairingCode: string | null;
  /** When the code stops working, on this device's clock (epoch ms). */
  expiresAt: number | null;
  claim: QuizshowPairedClaim | null;
  /**
   * Names why the start failed (status `failed`), or, while the code still
   * shows, why the last poll failed (a busy network, offline, a slow server);
   * null otherwise.
   */
  failureKey: string | null;
  /** True once the code's local time is up and the last claim is on its way: a new code is moments away. */
  isCodeTimeUp: boolean;
  restart: () => void;
}

export const QUIZSHOW_PAIRING_FAILURE_KEYS = {
  rateLimited: "quizshow:tv.failed.rateLimited",
  offline: "quizshow:tv.failed.offline",
  server: "quizshow:tv.failed.server",
  notAvailable: "quizshow:tv.failed.notAvailable",
  codeGone: "quizshow:tv.failed.codeGone",
} as const;

/** The quiet lines under a code that still works while its polls fail. */
export const QUIZSHOW_PAIRING_POLL_KEYS = {
  rateLimited: "quizshow:tv.pollSlow",
  offline: "quizshow:tv.pollOffline",
  server: "quizshow:tv.pollServer",
} as const;

/** The longest wait between two claim polls after failures (a 429 doubles the wait up to this). */
export const QUIZSHOW_PAIRING_MAX_BACKOFF_MS = 30_000;

function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * The cause behind a failed pairing call. A 429, or the 503 the server sends
 * when every code is taken, reads as rate limited; a request that never
 * reached the server, a timeout or a 5xx says the server did not answer; a
 * 404 on the start says Pulse Live is not open on this server. Any other
 * answer keeps the shared line for its status (a signed-out helper, say).
 */
export function pairingFailureKeyOf(error: unknown): string {
  if (isDeviceOffline()) return QUIZSHOW_PAIRING_FAILURE_KEYS.offline;
  if (!(error instanceof ApiError)) return QUIZSHOW_PAIRING_FAILURE_KEYS.server;
  if (
    error.status === 429 ||
    quizshowErrorCodeOf(error) === "quizshow_pairing_rate_limited"
  ) {
    return QUIZSHOW_PAIRING_FAILURE_KEYS.rateLimited;
  }
  if (error.status >= 500 || error.status === 408) {
    return QUIZSHOW_PAIRING_FAILURE_KEYS.server;
  }
  return causeErrorKey(error, {
    404: QUIZSHOW_PAIRING_FAILURE_KEYS.notAvailable,
  }).key;
}

/**
 * The cause behind a failed claim poll while the code still works: a 429
 * (several TVs behind one venue network), an offline device, or a server that
 * did not answer.
 */
export function pairingPollFailureKeyOf(error: unknown): string {
  if (isDeviceOffline()) return QUIZSHOW_PAIRING_POLL_KEYS.offline;
  if (
    error instanceof ApiError &&
    (error.status === 429 ||
      quizshowErrorCodeOf(error) === "quizshow_pairing_rate_limited")
  ) {
    return QUIZSHOW_PAIRING_POLL_KEYS.rateLimited;
  }
  return QUIZSHOW_PAIRING_POLL_KEYS.server;
}

/** Claim answers that say the code is gone: unknown or wrong (404), or a request the server turned down. */
const CODE_LOST_STATUSES: ReadonlySet<number> = new Set([400, 401, 403, 404]);

function isCodeLostError(error: unknown): error is ApiError {
  return error instanceof ApiError && CODE_LOST_STATUSES.has(error.status);
}

/** How many codes in a row may be lost well before their time is up before the attempt stops. */
const MAX_EARLY_CODE_LOSSES = 2;

/** The cause behind codes lost early: a 404 says the codes keep going; a 400, 401 or 403 keeps the shared line for its own reason (a refused security check, say). */
export function pairingCodeLostKeyOf(error: ApiError): string {
  if (error.status === 404) return QUIZSHOW_PAIRING_FAILURE_KEYS.codeGone;
  return causeErrorKey(error).key;
}

interface PairingState {
  attempt: number;
  status: QuizshowDevicePairingStatus;
  pairingCode: string | null;
  expiresAt: number | null;
  claim: QuizshowPairedClaim | null;
  failureKey: string | null;
  isCodeTimeUp: boolean;
}

type PairingAction =
  | { type: "restart" }
  | { type: "showing"; pairingCode: string; expiresAt: number }
  | { type: "polled" }
  | { type: "codeTimeUp" }
  | { type: "pollFailed"; failureKey: string }
  | { type: "paired"; claim: QuizshowPairedClaim }
  | { type: "expired" }
  | { type: "failed"; failureKey: string };

const INITIAL_STATE: PairingState = {
  attempt: 0,
  status: "starting",
  pairingCode: null,
  expiresAt: null,
  claim: null,
  failureKey: null,
  isCodeTimeUp: false,
};

function reducePairing(
  state: PairingState,
  action: PairingAction,
): PairingState {
  switch (action.type) {
    case "restart":
      return { ...INITIAL_STATE, attempt: state.attempt + 1 };
    case "showing":
      return {
        ...state,
        status: "showing",
        pairingCode: action.pairingCode,
        expiresAt: action.expiresAt,
        failureKey: null,
      };
    case "polled":
      return state.failureKey === null ? state : { ...state, failureKey: null };
    case "codeTimeUp":
      return { ...state, isCodeTimeUp: true };
    case "pollFailed":
      return { ...state, failureKey: action.failureKey };
    case "paired":
      return {
        ...state,
        status: "paired",
        claim: action.claim,
        failureKey: null,
      };
    case "expired":
      return {
        ...state,
        status: "expired",
        pairingCode: null,
        failureKey: null,
      };
    case "failed":
      return {
        ...state,
        status: "failed",
        pairingCode: null,
        failureKey: action.failureKey,
      };
    default:
      return state;
  }
}

/** The wait before the next claim after a failed one: doubles from two polls up to the cap. */
export function nextPairingBackoffMs(previousMs: number): number {
  const doubledMs = Math.max(QUIZSHOW_LIMITS.pairingPollMs * 2, previousMs * 2);
  return Math.min(doubledMs, QUIZSHOW_PAIRING_MAX_BACKOFF_MS);
}

function isTabVisible(): boolean {
  return document.visibilityState !== "hidden";
}

/** Start failures that heal by themselves: the device or the server comes back, or the rate limit lifts. */
const RETRYABLE_START_FAILURE_KEYS: ReadonlySet<string> = new Set([
  QUIZSHOW_PAIRING_FAILURE_KEYS.offline,
  QUIZSHOW_PAIRING_FAILURE_KEYS.server,
  QUIZSHOW_PAIRING_FAILURE_KEYS.rateLimited,
]);

/**
 * The wait before a failed start tries again by itself: the poll backoff
 * (doubling from two polls up to 30 s), twice as long for a rate limit.
 */
export function pairingStartRetryMs(
  previousMs: number,
  failureKey: string,
): { nextBackoffMs: number; delayMs: number } {
  const nextBackoffMs = nextPairingBackoffMs(previousMs);
  const isRateLimited =
    failureKey === QUIZSHOW_PAIRING_FAILURE_KEYS.rateLimited;
  return {
    nextBackoffMs,
    delayMs: isRateLimited ? nextBackoffMs * 2 : nextBackoffMs,
  };
}

/**
 * One pairing attempt: start, show, poll, and end in `paired`, `expired` or
 * `failed`. Returns its disposer. Only one claim is ever in flight: the next
 * poll is scheduled from the previous one's answer, and the wake-ups (tab
 * visible again, back online, the code's time running out) poll only when
 * nothing is in flight. When the local TTL ends it runs one last claim (or
 * waits for the one in flight), because the server replays a paired claim
 * until its own expiry: `waiting` or 404 then reads as expired. An expired
 * code restarts at once while the tab is visible, else when it shows again.
 * A code lost well before its time (a 404, 400, 401 or 403 claim) restarts
 * too, but the second such loss in a row stops in `failed` with the cause, so
 * a server that keeps losing codes never turns into a start loop.
 * `earlyCodeLosses` carries that count across attempts.
 */
function runPairingAttempt(
  kind: QuizshowPairedDeviceKind,
  dispatch: (action: PairingAction) => void,
  earlyCodeLosses: { count: number },
  startRetry: { backoffMs: number },
): () => void {
  const abortController = new AbortController();
  let isStopped = false;
  let isClaimInFlight = false;
  let isPollParked = false;
  let isPastTtl = false;
  let isRestartWaiting = false;
  let isStartRetryPending = false;
  let backoffMs = 0;
  let startRetryTimer: ReturnType<typeof setTimeout> | null = null;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let expiryTimer: ReturnType<typeof setTimeout> | null = null;
  let credentials: { pairingId: string; pollToken: string } | null = null;

  function clearTimers() {
    if (pollTimer !== null) clearTimeout(pollTimer);
    if (expiryTimer !== null) clearTimeout(expiryTimer);
    pollTimer = null;
    expiryTimer = null;
  }

  function finish(action: PairingAction) {
    isStopped = true;
    clearTimers();
    abortController.abort();
    dispatch(action);
  }

  function expire() {
    finish({ type: "expired" });
    if (isTabVisible()) dispatch({ type: "restart" });
    else isRestartWaiting = true;
  }

  function schedulePoll(delayMs: number) {
    if (pollTimer !== null) clearTimeout(pollTimer);
    pollTimer = setTimeout(runPoll, delayMs);
  }

  function handleClaim(claim: QuizshowPairingClaim) {
    isClaimInFlight = false;
    if (isStopped) return;
    if (claim.status === "paired") {
      earlyCodeLosses.count = 0;
      finish({ type: "paired", claim });
      return;
    }
    if (isPastTtl) {
      expire();
      return;
    }
    earlyCodeLosses.count = 0;
    backoffMs = 0;
    dispatch({ type: "polled" });
    schedulePoll(QUIZSHOW_LIMITS.pairingPollMs);
  }

  function handleClaimFailure(error: unknown) {
    isClaimInFlight = false;
    if (isStopped) return;
    if (isCodeLostError(error)) {
      if (isPastTtl) {
        earlyCodeLosses.count = 0;
        expire();
        return;
      }
      earlyCodeLosses.count += 1;
      if (earlyCodeLosses.count >= MAX_EARLY_CODE_LOSSES) {
        earlyCodeLosses.count = 0;
        finish({ type: "failed", failureKey: pairingCodeLostKeyOf(error) });
        return;
      }
      expire();
      return;
    }
    backoffMs = nextPairingBackoffMs(backoffMs);
    dispatch({
      type: "pollFailed",
      failureKey: pairingPollFailureKeyOf(error),
    });
    schedulePoll(backoffMs);
  }

  function runPoll() {
    pollTimer = null;
    if (isStopped || credentials === null || isClaimInFlight) return;
    if (!isTabVisible()) {
      isPollParked = true;
      return;
    }
    isPollParked = false;
    isClaimInFlight = true;
    const { pairingId, pollToken } = credentials;
    claimPairing(pairingId, pollToken, abortController.signal).then(
      handleClaim,
      handleClaimFailure,
    );
  }

  /** A wake-up polls now, unless a claim is already on its way. */
  function pollNow() {
    if (isStopped || credentials === null || isClaimInFlight) return;
    if (pollTimer !== null) clearTimeout(pollTimer);
    runPoll();
  }

  function handleTtlEnd() {
    expiryTimer = null;
    isPastTtl = true;
    dispatch({ type: "codeTimeUp" });
    pollNow();
  }

  /** A failed start that may heal tries again now, when the tab shows. */
  function retryStart() {
    if (!isStartRetryPending) return;
    if (startRetryTimer !== null) clearTimeout(startRetryTimer);
    startRetryTimer = null;
    if (!isTabVisible()) return;
    isStartRetryPending = false;
    dispatch({ type: "restart" });
  }

  function scheduleStartRetry(failureKey: string) {
    if (!RETRYABLE_START_FAILURE_KEYS.has(failureKey)) return;
    const { nextBackoffMs, delayMs } = pairingStartRetryMs(
      startRetry.backoffMs,
      failureKey,
    );
    startRetry.backoffMs = nextBackoffMs;
    isStartRetryPending = true;
    startRetryTimer = setTimeout(retryStart, delayMs);
  }

  function handleOnline() {
    if (isStartRetryPending) {
      retryStart();
      return;
    }
    pollNow();
  }

  function handleVisibilityChange() {
    if (!isTabVisible()) return;
    if (isStartRetryPending) {
      retryStart();
      return;
    }
    if (isRestartWaiting) {
      isRestartWaiting = false;
      dispatch({ type: "restart" });
      return;
    }
    if (isPollParked) pollNow();
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("online", handleOnline);
  const startPairing =
    kind === "screen" ? startScreenPairing : startHelperPairing;
  startPairing(abortController.signal).then(
    (started) => {
      if (isStopped) return;
      startRetry.backoffMs = 0;
      credentials = {
        pairingId: started.pairingId,
        pollToken: started.pollToken,
      };
      // The server's expiresAt is on its own clock; a TV's clock may drift, so count the TTL here.
      const ttlMs = QUIZSHOW_LIMITS.pairingCodeTtlMs;
      dispatch({
        type: "showing",
        pairingCode: started.pairingCode,
        expiresAt: Date.now() + ttlMs,
      });
      expiryTimer = setTimeout(handleTtlEnd, ttlMs);
      schedulePoll(QUIZSHOW_LIMITS.pairingPollMs);
    },
    (error: unknown) => {
      if (isStopped) return;
      const failureKey = pairingFailureKeyOf(error);
      finish({ type: "failed", failureKey });
      scheduleStartRetry(failureKey);
    },
  );

  return () => {
    isStopped = true;
    isRestartWaiting = false;
    isStartRetryPending = false;
    clearTimers();
    if (startRetryTimer !== null) clearTimeout(startRetryTimer);
    abortController.abort();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("online", handleOnline);
  };
}

/**
 * Pairs this device as a TV screen or a helper remote (contract 6.5). It asks
 * for a code, shows it, and polls the claim every `pairingPollMs` while the
 * tab is visible (a hidden tab parks the poll until it shows again; coming
 * back online polls at once). It moves to `paired` with the claim; to
 * `expired` when the code's time is up and a last claim says so, or a claim
 * says the code is gone (404, 400, 401, 403), and then asks for a new code by
 * itself while the tab is visible; and to `failed` when the start itself
 * fails or two codes in a row are lost early, with `failureKey` naming why
 * (`restart` tries again). A failed claim (429, offline, a server
 * fault) keeps the code: `failureKey` names the cause, and it backs off
 * (doubling up to 30 s) and keeps polling, so TVs sharing one venue network
 * never lose a valid code. Timers, the start and an in-flight poll stop on
 * unmount. A start that fails because the device is offline, the server did
 * not answer or the rate limit hit tries again by itself after a growing wait
 * (`pairingStartRetryMs`), at once when the device comes back online, and when
 * a hidden tab shows again. With `isEnabled` false (demo) it makes no call and
 * stays `starting`.
 */
export function useQuizshowDevicePairing(
  kind: QuizshowPairedDeviceKind,
  options: { isEnabled?: boolean } = {},
): QuizshowDevicePairing {
  const { isEnabled = true } = options;
  const [state, dispatch] = useReducer(reducePairing, INITIAL_STATE);
  const { attempt } = state;
  /** Codes lost early in a row, across the attempts an automatic restart starts. */
  const earlyCodeLossesRef = useRef({ count: 0 });
  /** The growing wait between automatic retries of a failed start, across attempts. */
  const startRetryRef = useRef({ backoffMs: 0 });

  useEffect(() => {
    if (!isEnabled) return undefined;
    return runPairingAttempt(
      kind,
      dispatch,
      earlyCodeLossesRef.current,
      startRetryRef.current,
    );
  }, [attempt, isEnabled, kind]);

  const restart = useCallback(() => {
    earlyCodeLossesRef.current.count = 0;
    startRetryRef.current.backoffMs = 0;
    dispatch({ type: "restart" });
  }, []);

  return {
    status: state.status,
    pairingCode: state.pairingCode,
    expiresAt: state.expiresAt,
    claim: state.claim,
    failureKey: state.failureKey,
    isCodeTimeUp: state.isCodeTimeUp,
    restart,
  };
}
