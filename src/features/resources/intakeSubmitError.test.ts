import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { intakeFailureToast } from "./intakeSubmitError";

/** Echoes the key (and any values) so the test reads which line was chosen. */
function echoTranslate(
  key: string,
  options?: Record<string, string | number | undefined>,
): string {
  return options && Object.keys(options).length > 0
    ? `${key}|${JSON.stringify(options)}`
    : key;
}

describe("intakeFailureToast", () => {
  it("always uses the shared intake title", () => {
    expect(
      intakeFailureToast(new ApiError(400, "x"), echoTranslate).title,
    ).toBe("shared:intake.errorTitle");
  });

  it("names the lost connection for a fetch failure", () => {
    expect(
      intakeFailureToast(new TypeError("Failed to fetch"), echoTranslate)
        .detail,
    ).toBe("shared:apiError.noConnection");
  });

  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [401, "shared:apiError.signedOut"],
    [429, "shared:apiError.reasonRateLimited"],
    [500, "shared:apiError.serverFault"],
    [503, "shared:apiError.serverFault"],
  ])("maps %i to its shared cause", (status, key) => {
    expect(
      intakeFailureToast(new ApiError(status, "x"), echoTranslate).detail,
    ).toBe(key);
  });

  it("names a restricted account", () => {
    const restricted = new ApiError(403, "Restricted", {
      code: "ACCOUNT_RESTRICTED",
    });
    expect(intakeFailureToast(restricted, echoTranslate).detail).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("passes the status to the refused line", () => {
    expect(
      intakeFailureToast(new ApiError(418, "x"), echoTranslate).detail,
    ).toBe('shared:apiError.refused|{"status":418}');
  });
});
