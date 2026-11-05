import { afterEach, describe, expect, it, vi } from "vitest";

// Route logging through a mock so the reported context can be read back
// without touching the real Sentry bridge or the console.
vi.mock("../observability/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
}));

import { ApiError } from "./client";
import { logError } from "../observability/logger";
import { handleQueryError, setQueryErrorDemoMode } from "./errorHandling";

afterEach(() => {
  setQueryErrorDemoMode(false);
  vi.mocked(logError).mockClear();
});

describe("handleQueryError with a private query key", () => {
  it("logs the error with the key replaced by [private]", () => {
    const failure = new ApiError(500, "boom");
    handleQueryError(failure, {
      queryKey: ["admin", "leads", "list", { q: "Lua Marques" }],
      meta: { silentError: true, isPrivateQueryKey: true },
    });
    expect(logError).toHaveBeenCalledWith(failure, { queryKey: "[private]" });
  });

  it("still logs the key of a query that is not private", () => {
    const failure = new ApiError(500, "boom");
    handleQueryError(failure, {
      queryKey: ["jobs", { page: 2 }],
      meta: { silentError: true },
    });
    expect(logError).toHaveBeenCalledWith(failure, {
      queryKey: ["jobs", { page: 2 }],
    });
  });
});
