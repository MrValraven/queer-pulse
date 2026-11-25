import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { SHARED_CAUSE_KEY } from "../../../shared/api/causeErrorKey";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPairingClaim,
  type QuizshowPairingStart,
} from "../../../shared/contracts/quizshow";
import {
  claimPairing,
  startHelperPairing,
  startScreenPairing,
} from "../api/quizshowPairing.api";
import {
  QUIZSHOW_PAIRING_FAILURE_KEYS,
  QUIZSHOW_PAIRING_MAX_BACKOFF_MS,
  QUIZSHOW_PAIRING_POLL_KEYS,
  useQuizshowDevicePairing,
} from "./useQuizshowDevicePairing";

vi.mock("../api/quizshowPairing.api", () => ({
  startScreenPairing: vi.fn(),
  startHelperPairing: vi.fn(),
  claimPairing: vi.fn(),
}));

const startScreenPairingMock = vi.mocked(startScreenPairing);
const startHelperPairingMock = vi.mocked(startHelperPairing);
const claimPairingMock = vi.mocked(claimPairing);

const POLL_MS = QUIZSHOW_LIMITS.pairingPollMs;
const START_AT = 1_700_000_000_000;

const PAIRING_START: QuizshowPairingStart = {
  pairingId: "0f6c2a8e-3b1d-4c5a-9e7f-1a2b3c4d5e6f",
  pairingCode: "472935",
  pollToken: "p".repeat(43),
  expiresAt: START_AT + QUIZSHOW_LIMITS.pairingCodeTtlMs,
};

const WAITING: QuizshowPairingClaim = {
  status: "waiting",
  expiresAt: START_AT + QUIZSHOW_LIMITS.pairingCodeTtlMs,
};

const PAIRED: QuizshowPairingClaim = {
  status: "paired",
  deviceTicket: "header.payload.signature",
  sessionId: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  kind: "event",
  eventSlug: "pride-brunch-jun",
  gameId: null,
};

let visibilityState: DocumentVisibilityState = "visible";
let isOnline = true;

function setVisibility(next: DocumentVisibilityState) {
  visibilityState = next;
  document.dispatchEvent(new Event("visibilitychange"));
}

/** Lets resolved API promises reach the hook, then moves the clock. */
async function advance(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

function renderPairing(kind: "screen" | "helper" = "screen") {
  return renderHook(() => useQuizshowDevicePairing(kind));
}

/** Fake clock, a visible online tab, and API answers that wait by default. */
function installPairingFakes() {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.setSystemTime(START_AT);
    visibilityState = "visible";
    isOnline = true;
    vi.spyOn(document, "visibilityState", "get").mockImplementation(
      () => visibilityState,
    );
    vi.spyOn(navigator, "onLine", "get").mockImplementation(() => isOnline);
    startScreenPairingMock.mockResolvedValue(PAIRING_START);
    startHelperPairingMock.mockResolvedValue(PAIRING_START);
    claimPairingMock.mockResolvedValue(WAITING);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    startScreenPairingMock.mockReset();
    startHelperPairingMock.mockReset();
    claimPairingMock.mockReset();
  });
}

describe("useQuizshowDevicePairing: code, polls and expiry", () => {
  installPairingFakes();

  it("shows the code, polls every pairingPollMs and hands over the claim once paired", async () => {
    const { result } = renderPairing();
    expect(result.current.status).toBe("starting");
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("showing");
    expect(result.current.pairingCode).toBe("472935");
    expect(result.current.expiresAt).toBe(
      START_AT + QUIZSHOW_LIMITS.pairingCodeTtlMs,
    );
    expect(claimPairingMock).not.toHaveBeenCalled();

    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);
    expect(claimPairingMock).toHaveBeenCalledWith(
      PAIRING_START.pairingId,
      PAIRING_START.pollToken,
      expect.any(AbortSignal),
    );
    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(2);

    claimPairingMock.mockResolvedValueOnce(PAIRED);
    await advance(POLL_MS);
    expect(result.current.status).toBe("paired");
    expect(result.current.claim).toEqual(PAIRED);

    await advance(POLL_MS * 5);
    expect(claimPairingMock).toHaveBeenCalledTimes(3);
  });

  it("starts a helper pairing for the helper kind", async () => {
    renderPairing("helper");
    await advance(0);
    expect(startHelperPairingMock).toHaveBeenCalledTimes(1);
    expect(startScreenPairingMock).not.toHaveBeenCalled();
  });

  it("never polls while the tab is hidden and polls at once when it shows again", async () => {
    renderPairing();
    await advance(0);
    act(() => setVisibility("hidden"));
    await advance(POLL_MS * 4);
    expect(claimPairingMock).not.toHaveBeenCalled();

    await act(async () => {
      setVisibility("visible");
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(claimPairingMock).toHaveBeenCalledTimes(1);
  });

  it("runs a last claim when the code's time runs out and asks for a new code at once", async () => {
    const { result } = renderPairing();
    await advance(0);
    startScreenPairingMock.mockResolvedValueOnce({
      ...PAIRING_START,
      pairingCode: "883322",
    });
    await advance(QUIZSHOW_LIMITS.pairingCodeTtlMs);
    // One claim every poll, the last one at the end of the code's time itself.
    expect(claimPairingMock).toHaveBeenCalledTimes(
      QUIZSHOW_LIMITS.pairingCodeTtlMs / POLL_MS,
    );
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("showing");
    expect(result.current.pairingCode).toBe("883322");
  });

  it("hands over a paired claim the server replays after the local time ran out", async () => {
    const { result } = renderPairing();
    await advance(0);
    // Every poll waits until the last one, at the end of the code's time, which comes back paired.
    let claimCount = 0;
    const claimsUntilTtl = QUIZSHOW_LIMITS.pairingCodeTtlMs / POLL_MS;
    claimPairingMock.mockImplementation(() => {
      claimCount += 1;
      return Promise.resolve(claimCount >= claimsUntilTtl ? PAIRED : WAITING);
    });
    await advance(QUIZSHOW_LIMITS.pairingCodeTtlMs);
    expect(result.current.status).toBe("paired");
    expect(result.current.claim).toEqual(PAIRED);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);
  });

  it("waits for a hidden tab to show before asking for a new code", async () => {
    const { result } = renderPairing();
    await advance(0);
    act(() => setVisibility("hidden"));
    await advance(QUIZSHOW_LIMITS.pairingCodeTtlMs + POLL_MS);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);

    // Visible again: the parked last claim runs, says waiting, and a new code is asked for.
    await act(async () => {
      setVisibility("visible");
      await vi.advanceTimersByTimeAsync(0);
    });
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("showing");
  });

  it("treats a 404 claim as an expired code and asks for a new one by itself", async () => {
    claimPairingMock.mockRejectedValueOnce(
      new ApiError(404, "Not Found", { code: "quizshow_pairing_not_found" }),
    );
    const { result } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("showing");
  });
});

describe("useQuizshowDevicePairing: failures and clean-up", () => {
  installPairingFakes();

  it("keeps the code on a 429 claim with the quiet busy-network line and backs off", async () => {
    claimPairingMock.mockRejectedValueOnce(
      new ApiError(429, "Too Many Requests", {
        code: "quizshow_pairing_rate_limited",
      }),
    );
    const { result } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    expect(result.current.status).toBe("showing");
    expect(result.current.pairingCode).toBe("472935");
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_POLL_KEYS.rateLimited,
    );

    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);
    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.failureKey).toBeNull();
  });

  it("keeps the code on a 5xx or offline poll and names that cause", async () => {
    claimPairingMock.mockRejectedValueOnce(
      new ApiError(503, "Service Unavailable"),
    );
    const { result } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    expect(result.current.status).toBe("showing");
    expect(result.current.pairingCode).toBe("472935");
    expect(result.current.failureKey).toBe(QUIZSHOW_PAIRING_POLL_KEYS.server);

    isOnline = false;
    claimPairingMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await advance(POLL_MS * 2);
    expect(result.current.status).toBe("showing");
    expect(result.current.failureKey).toBe(QUIZSHOW_PAIRING_POLL_KEYS.offline);
  });

  it("doubles the wait after each failed poll and caps it at 30 s", async () => {
    claimPairingMock.mockRejectedValue(
      new ApiError(429, "Too Many Requests", {
        code: "quizshow_pairing_rate_limited",
      }),
    );
    renderPairing();
    await advance(0);
    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);
    const expectedWaits = [4_000, 8_000, 16_000, 30_000, 30_000];
    for (const [waitIndex, waitMs] of expectedWaits.entries()) {
      await advance(waitMs - 1);
      expect(claimPairingMock).toHaveBeenCalledTimes(waitIndex + 1);
      await advance(1);
      expect(claimPairingMock).toHaveBeenCalledTimes(waitIndex + 2);
    }
    expect(QUIZSHOW_PAIRING_MAX_BACKOFF_MS).toBe(30_000);
  });

  it("never sends a second claim while a slow one is still on its way", async () => {
    let resolveSlowClaim: (claim: QuizshowPairingClaim) => void = () =>
      undefined;
    claimPairingMock.mockImplementationOnce(
      () =>
        new Promise<QuizshowPairingClaim>((resolve) => {
          resolveSlowClaim = resolve;
        }),
    );
    renderPairing();
    await advance(0);
    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);

    // Neither time, coming back online nor showing the tab again starts another.
    await advance(POLL_MS * 4);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      setVisibility("visible");
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(claimPairingMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSlowClaim(WAITING);
      await vi.advanceTimersByTimeAsync(0);
    });
    await advance(POLL_MS - 1);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(claimPairingMock).toHaveBeenCalledTimes(2);
  });

  it("polls at once when the device comes back online", async () => {
    claimPairingMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    renderPairing();
    await advance(0);
    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(claimPairingMock).toHaveBeenCalledTimes(2);
  });

  it("fails a start with the rate-limited cause", async () => {
    startScreenPairingMock.mockRejectedValueOnce(
      new ApiError(429, "Too Many Requests", {
        code: "quizshow_pairing_rate_limited",
      }),
    );
    const { result } = renderPairing();
    await advance(0);
    expect(result.current.status).toBe("failed");
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_FAILURE_KEYS.rateLimited,
    );
  });

  it("fails a start with the offline cause when the device is offline", async () => {
    isOnline = false;
    startScreenPairingMock.mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );
    const { result } = renderPairing();
    await advance(0);
    expect(result.current.status).toBe("failed");
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_FAILURE_KEYS.offline,
    );
  });

  it("fails a start with the server cause on a 5xx or an unreached server", async () => {
    startScreenPairingMock.mockRejectedValueOnce(
      new ApiError(500, "Internal Server Error"),
    );
    const { result } = renderPairing();
    await advance(0);
    expect(result.current.status).toBe("failed");
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_FAILURE_KEYS.server,
    );

    startScreenPairingMock.mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );
    act(() => result.current.restart());
    await advance(0);
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_FAILURE_KEYS.server,
    );
  });

  it("aborts a start still on its way on unmount", async () => {
    let startSignal: AbortSignal | undefined;
    startScreenPairingMock.mockImplementationOnce((signal) => {
      startSignal = signal;
      return new Promise<QuizshowPairingStart>(() => undefined);
    });
    const { unmount } = renderPairing();
    await advance(0);
    expect(startSignal?.aborted).toBe(false);
    unmount();
    expect(startSignal?.aborted).toBe(true);
  });

  it("stops its timers and aborts the in-flight poll on unmount", async () => {
    let pollSignal: AbortSignal | undefined;
    claimPairingMock.mockImplementation((_pairingId, _pollToken, signal) => {
      pollSignal = signal;
      return new Promise<QuizshowPairingClaim>(() => undefined);
    });
    const { unmount } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);
    expect(pollSignal?.aborted).toBe(false);

    unmount();
    expect(pollSignal?.aborted).toBe(true);
    await advance(QUIZSHOW_LIMITS.pairingCodeTtlMs);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);
  });

  it("makes no call while disabled", async () => {
    const { result } = renderHook(() =>
      useQuizshowDevicePairing("screen", { isEnabled: false }),
    );
    await advance(POLL_MS * 3);
    expect(startScreenPairingMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("starting");
  });
});

describe("useQuizshowDevicePairing: a failed start tries again", () => {
  installPairingFakes();

  it("tries a failed start again by itself after a growing wait", async () => {
    startScreenPairingMock
      .mockRejectedValueOnce(new ApiError(500, "Internal Server Error"))
      .mockRejectedValueOnce(new ApiError(503, "Service Unavailable"));
    const { result } = renderPairing();
    await advance(0);
    expect(result.current.status).toBe("failed");
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);

    await advance(POLL_MS * 2 - 1);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("failed");

    await advance(POLL_MS * 4 - 1);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    await advance(1);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(3);
    expect(result.current.status).toBe("showing");
  });

  it("waits twice as long before trying a rate-limited start again", async () => {
    startScreenPairingMock.mockRejectedValueOnce(
      new ApiError(429, "Too Many Requests"),
    );
    renderPairing();
    await advance(0);
    await advance(POLL_MS * 4 - 1);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
  });

  it("tries a failed start again at once when the device comes back online", async () => {
    isOnline = false;
    startScreenPairingMock.mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );
    const { result } = renderPairing();
    await advance(0);
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_FAILURE_KEYS.offline,
    );

    isOnline = true;
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("showing");
  });

  it("holds a start retry while the tab is hidden and tries when it shows", async () => {
    startScreenPairingMock.mockRejectedValueOnce(
      new ApiError(500, "Internal Server Error"),
    );
    renderPairing();
    await advance(0);
    setVisibility("hidden");
    await advance(POLL_MS * 2);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      setVisibility("visible");
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
  });

  it("never retries a start that failed for a reason that will not heal", async () => {
    startScreenPairingMock.mockRejectedValueOnce(
      new ApiError(404, "Not Found"),
    );
    const { result } = renderPairing();
    await advance(0);
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_FAILURE_KEYS.notAvailable,
    );
    await advance(QUIZSHOW_PAIRING_MAX_BACKOFF_MS * 2);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("failed");
  });
});

describe("useQuizshowDevicePairing: lost codes and the end of a code's time", () => {
  installPairingFakes();

  it("stops in failed when two codes in a row are lost well before their time", async () => {
    claimPairingMock.mockRejectedValue(
      new ApiError(404, "Not Found", { code: "quizshow_pairing_not_found" }),
    );
    const { result } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    await advance(POLL_MS);
    expect(result.current.status).toBe("failed");
    expect(result.current.failureKey).toBe(
      QUIZSHOW_PAIRING_FAILURE_KEYS.codeGone,
    );

    await advance(POLL_MS * 5);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
  });

  it("treats a 400, 401 or 403 claim as a lost code and names its own cause", async () => {
    claimPairingMock
      .mockRejectedValueOnce(new ApiError(401, "Unauthorized"))
      .mockRejectedValueOnce(
        new ApiError(403, "Forbidden", { code: "CSRF_REJECTED" }),
      );
    const { result } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("showing");
    await advance(POLL_MS);
    expect(result.current.status).toBe("failed");
    expect(result.current.failureKey).toBe(SHARED_CAUSE_KEY.securityCheck);
  });

  it("counts lost codes only in a row: a waiting claim in between starts the count again", async () => {
    claimPairingMock
      .mockRejectedValueOnce(new ApiError(404, "Not Found"))
      .mockResolvedValueOnce(WAITING)
      .mockRejectedValueOnce(new ApiError(404, "Not Found"));
    const { result } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    await advance(0);
    await advance(POLL_MS);
    await advance(POLL_MS);
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(3);
    expect(result.current.status).toBe("showing");
  });

  it("marks the code's time as up while its last claim is still to come", async () => {
    const { result } = renderPairing();
    await advance(0);
    expect(result.current.isCodeTimeUp).toBe(false);
    act(() => setVisibility("hidden"));
    await advance(QUIZSHOW_LIMITS.pairingCodeTtlMs);
    expect(result.current.status).toBe("showing");
    expect(result.current.isCodeTimeUp).toBe(true);
  });

  it("restarts on visible when a claim says the code is gone while the tab is hidden", async () => {
    let rejectClaim: (error: unknown) => void = () => undefined;
    claimPairingMock.mockImplementationOnce(
      () =>
        new Promise<QuizshowPairingClaim>((_resolve, reject) => {
          rejectClaim = reject;
        }),
    );
    const { result } = renderPairing();
    await advance(0);
    await advance(POLL_MS);
    expect(claimPairingMock).toHaveBeenCalledTimes(1);

    act(() => setVisibility("hidden"));
    await act(async () => {
      rejectClaim(new ApiError(404, "Not Found"));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.status).toBe("expired");
    await advance(POLL_MS * 3);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      setVisibility("visible");
      await vi.advanceTimersByTimeAsync(0);
    });
    await advance(0);
    expect(startScreenPairingMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("showing");
  });
});
