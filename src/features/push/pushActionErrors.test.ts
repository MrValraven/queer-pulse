import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { pushEnableErrorCopy, pushTestErrorCopy } from "./pushActionErrors";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pushEnableErrorCopy", () => {
  it("classifies a registration failure from our servers", () => {
    expect(pushEnableErrorCopy(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(
      pushEnableErrorCopy(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ).key,
    ).toBe("shared:apiError.notActive");
    expect(pushEnableErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(pushEnableErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(pushEnableErrorCopy(new ApiError(408, "x")).key).toBe(
      "shared:apiError.timedOut",
    );
  });

  it("names a browser-side failure when the browser is online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    expect(
      pushEnableErrorCopy(new DOMException("blocked", "AbortError")).key,
    ).toBe("settings:notifications.phonePush.error.browser");
  });

  it("names the lost connection when the browser is offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(
      pushEnableErrorCopy(new DOMException("blocked", "AbortError")).key,
    ).toBe("shared:apiError.noConnection");
  });
});

describe("pushTestErrorCopy", () => {
  it("classifies the failure", () => {
    expect(pushTestErrorCopy(new TypeError("Failed to fetch")).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(pushTestErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(pushTestErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});
