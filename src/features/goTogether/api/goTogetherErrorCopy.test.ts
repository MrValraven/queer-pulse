import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  GO_TOGETHER_REFUSED_KEY,
  goTogetherCauseKey,
} from "./goTogetherErrorCopy";

describe("goTogetherCauseKey", () => {
  it("names a lost connection for an error that is not an ApiError", () => {
    expect(goTogetherCauseKey(new TypeError("Failed to fetch"))).toBe(
      "shared:apiError.noConnection",
    );
  });

  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [401, "shared:apiError.signedOut"],
    [403, "shared:apiError.forbidden"],
    [404, "shared:apiError.notFound"],
    [408, "shared:apiError.timedOut"],
    [409, "shared:apiError.reasonConflict"],
    [413, "shared:apiError.reasonTooLarge"],
    [429, "shared:apiError.reasonRateLimited"],
    [500, "shared:apiError.serverFault"],
  ])("maps status %i to its shared line", (status, key) => {
    expect(goTogetherCauseKey(new ApiError(status, "x"))).toBe(key);
  });

  it("names a restriction and an inactive membership", () => {
    expect(
      goTogetherCauseKey(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toBe("shared:apiError.accountRestricted");
    expect(
      goTogetherCauseKey(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toBe("shared:apiError.notActive");
  });

  it("uses the status-free refused line for a status with no line of its own", () => {
    expect(goTogetherCauseKey(new ApiError(418, "x"))).toBe(
      GO_TOGETHER_REFUSED_KEY,
    );
  });
});
