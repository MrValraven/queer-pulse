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

/** SEC-47: a search key holds what the member typed, flag or no flag. */
describe("handleQueryError with a search query key", () => {
  it("reports [private] for a key whose root names a search", () => {
    const failure = new ApiError(500, "boom");
    handleQueryError(failure, {
      queryKey: ["rosterSearch", "community-slug", "Lua", false, "en"],
      meta: { silentError: true },
    });
    expect(logError).toHaveBeenCalledWith(failure, { queryKey: "[private]" });
  });

  it("redacts search-text properties in a key that is not flagged", () => {
    const failure = new ApiError(500, "boom");
    handleQueryError(failure, {
      queryKey: ["members", false, { q: "Lua", Query: "Lua", page: 2 }],
      meta: { silentError: true },
    });
    expect(logError).toHaveBeenCalledWith(failure, {
      queryKey: [
        "members",
        false,
        { q: "[private]", Query: "[private]", page: 2 },
      ],
    });
  });

  it("still logs the key of a query that is no search", () => {
    const failure = new ApiError(500, "boom");
    handleQueryError(failure, {
      queryKey: ["roster", "community-slug"],
      meta: { silentError: true },
    });
    expect(logError).toHaveBeenCalledWith(failure, {
      queryKey: ["roster", "community-slug"],
    });
  });
});
