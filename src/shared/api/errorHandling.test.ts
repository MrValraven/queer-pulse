import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Route logging through a mock so we can assert "logs always" without touching
// the real Sentry bridge / console.
vi.mock("../observability/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
}));

import { ApiError } from "./client";
import { logError } from "../observability/logger";
import {
  handleMutationError,
  handleQueryError,
  setQueryErrorDemoMode,
  setQueryErrorToastEmitter,
} from "./errorHandling";

const query = { queryKey: ["jobs"] };
const mutation = { options: { mutationKey: ["applyToJob"] } };

let emit: ReturnType<typeof vi.fn>;

beforeEach(() => {
  emit = vi.fn();
  setQueryErrorToastEmitter(emit);
  setQueryErrorDemoMode(false);
});

afterEach(() => {
  setQueryErrorToastEmitter(null);
  setQueryErrorDemoMode(false);
  vi.mocked(logError).mockClear();
});

describe("handleQueryError", () => {
  it("logs every failure, with the query key as context", () => {
    handleQueryError(new ApiError(500, "boom"), query);
    expect(logError).toHaveBeenCalledWith(expect.any(ApiError), {
      queryKey: ["jobs"],
    });
  });

  it("toasts an unexpected 5xx", () => {
    handleQueryError(new ApiError(503, "down"), query);
    expect(emit).toHaveBeenCalledWith(
      "Something went wrong on our end. Please try again.",
      "error",
      6000,
    );
  });

  it("stays silent for a <500 ApiError (pages own those states)", () => {
    handleQueryError(new ApiError(404, "nope"), query);
    handleQueryError(new ApiError(401, "unauth"), query);
    handleQueryError(new ApiError(403, "forbidden"), query);
    expect(emit).not.toHaveBeenCalled();
  });

  it("stays silent for a PLATFORM_LOCKED 503 (the lock provider owns that screen)", () => {
    // ToastProvider sits ABOVE PlatformLockProvider, so its viewport renders
    // over the maintenance screen. Without this carve-out a lockdown starting
    // mid-session stacks red server-error toasts on top of the calm
    // explanation that exists precisely to replace them.
    handleQueryError(
      new ApiError(503, "Locked", {
        code: "PLATFORM_LOCKED",
        message: "Back soon.",
      }),
      query,
    );
    expect(emit).not.toHaveBeenCalled();
    // Still logged — silence is a presentation decision, not an observability one.
    expect(logError).toHaveBeenCalledOnce();
  });

  it("still toasts a plain 503 that is not a platform lockdown", () => {
    handleQueryError(
      new ApiError(503, "down", { code: "SOMETHING_ELSE" }),
      query,
    );
    expect(emit).toHaveBeenCalledWith(
      "Something went wrong on our end. Please try again.",
      "error",
      6000,
    );
  });

  it("respects meta.silentError (a fail-soft query must not toast)", () => {
    handleQueryError(new ApiError(500, "boom"), {
      queryKey: ["platform-status", false],
      meta: { silentError: true },
    });
    expect(emit).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledOnce();
  });

  it("toasts a generic message for a non-Api (network) error", () => {
    handleQueryError(new TypeError("Failed to fetch"), query);
    expect(emit).toHaveBeenCalledWith(
      "Something went wrong. Please try again.",
      "error",
      6000,
    );
  });

  it("is silent in demo mode even for a 5xx", () => {
    setQueryErrorDemoMode(true);
    handleQueryError(new ApiError(500, "boom"), query);
    expect(emit).not.toHaveBeenCalled();
    // …but it still logs.
    expect(logError).toHaveBeenCalledOnce();
  });

  it("no-ops safely when no emitter is wired", () => {
    setQueryErrorToastEmitter(null);
    expect(() =>
      handleQueryError(new ApiError(500, "boom"), query),
    ).not.toThrow();
  });
});

describe("handleMutationError", () => {
  it("logs with the mutation key", () => {
    handleMutationError(
      new ApiError(500, "boom"),
      undefined,
      undefined,
      mutation,
    );
    expect(logError).toHaveBeenCalledWith(expect.any(ApiError), {
      mutationKey: ["applyToJob"],
    });
  });

  it("always surfaces a failed write — a 403 becomes an access message", () => {
    handleMutationError(
      new ApiError(403, "forbidden"),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).toHaveBeenCalledWith(
      "You don't have access to that.",
      "error",
      6000,
    );
  });

  it("stays silent for a 401 (auth refresh owns it)", () => {
    handleMutationError(
      new ApiError(401, "unauth"),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it("stays silent for a PLATFORM_LOCKED 503 (the lock provider owns that screen)", () => {
    handleMutationError(
      new ApiError(503, "Locked", { code: "PLATFORM_LOCKED", message: null }),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it("is silent in demo mode", () => {
    setQueryErrorDemoMode(true);
    handleMutationError(
      new ApiError(500, "boom"),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it("surfaces a specific 4xx reason to the mutation toast", () => {
    handleMutationError(
      new ApiError(409, "That name is taken"),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith("That name is taken", "error", 6000);
  });

  it("falls back to the generic 4xx string for a bare status word", () => {
    handleMutationError(
      new ApiError(400, "Bad Request"),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith("Something went wrong.", "error", 6000);
  });

  it("surfaces a specific 403 reason instead of the access generic", () => {
    handleMutationError(
      new ApiError(403, "You are blocked from this community"),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      "You are blocked from this community",
      "error",
      6000,
    );
  });
});
