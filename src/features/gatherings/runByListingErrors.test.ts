import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { isRefusedRunByListingError } from "./runByListingErrors";

describe("isRefusedRunByListingError", () => {
  it("reads the 400 for a listing that cannot take the link", () => {
    expect(
      isRefusedRunByListingError(new ApiError(400, "Run by listing not found")),
    ).toBe(true);
  });

  it("reads the 403 for an organiser who does not run the business", () => {
    const error = new ApiError(
      403,
      "Only someone who runs this business can name it as running a gathering.",
      { statusCode: 403, error: "Forbidden", code: "RUN_BY_NOT_MANAGER" },
    );
    expect(isRefusedRunByListingError(error)).toBe(true);
  });

  it("leaves every other failure to the generic handling", () => {
    expect(
      isRefusedRunByListingError(new ApiError(400, "Venue listing not found")),
    ).toBe(false);
    expect(
      isRefusedRunByListingError(
        new ApiError(403, "Forbidden", { code: "OTHER" }),
      ),
    ).toBe(false);
    expect(
      isRefusedRunByListingError(new Error("Run by listing not found")),
    ).toBe(false);
  });
});
