import { describe, expect, it } from "vitest";
import { ApiError } from "./client";
import { reasonFor, describeError } from "./errorMessage";

describe("reasonFor", () => {
  it("returns null for auth-owned and empty-state statuses", () => {
    expect(reasonFor(new ApiError(401, "Not authenticated"))).toBeNull();
    expect(reasonFor(new ApiError(404, "Not Found"))).toBeNull();
  });

  it("returns null for a PLATFORM_LOCKED 503", () => {
    expect(
      reasonFor(new ApiError(503, "Locked", { code: "PLATFORM_LOCKED" })),
    ).toBeNull();
  });

  it("never leaks 5xx internals", () => {
    expect(reasonFor(new ApiError(500, "Cannot read property x of undefined"))).toBeNull();
    expect(reasonFor(new ApiError(502, "Bad Gateway"))).toBeNull();
  });

  it("surfaces a real 4xx reason", () => {
    expect(reasonFor(new ApiError(409, "That name is taken"))).toBe("That name is taken");
    expect(reasonFor(new ApiError(422, "Bio is too long"))).toBe("Bio is too long");
    expect(reasonFor(new ApiError(403, "You are blocked from this community"))).toBe(
      "You are blocked from this community",
    );
  });

  it("suppresses a bare HTTP status word as no reason", () => {
    expect(reasonFor(new ApiError(400, "Bad Request"))).toBeNull();
    expect(reasonFor(new ApiError(403, "Forbidden"))).toBeNull();
    expect(reasonFor(new ApiError(409, "Conflict"))).toBeNull();
    expect(reasonFor(new ApiError(422, "Unprocessable Entity"))).toBeNull();
  });

  it("returns null for every non-ApiError input (only ApiError carries a shown reason)", () => {
    expect(reasonFor(new Error("The upload was too large"))).toBeNull();
    expect(reasonFor(new TypeError("Failed to fetch"))).toBeNull();
    expect(reasonFor(new SyntaxError("Unexpected token '<'"))).toBeNull();
    expect(reasonFor(new Error("Conflict"))).toBeNull();
    expect(reasonFor(new Error(""))).toBeNull();
    expect(reasonFor("just a string")).toBeNull();
    expect(reasonFor(null)).toBeNull();
    expect(reasonFor(undefined)).toBeNull();
  });
});

describe("describeError", () => {
  it("frames the reason when there is one", () => {
    expect(describeError("Couldn't save that co-op", new ApiError(409, "That name is taken"))).toBe(
      "Couldn't save that co-op — that name is taken.",
    );
  });

  it("trims a single trailing period on the reason", () => {
    expect(describeError("Couldn't save", new ApiError(422, "Bio is too long."))).toBe(
      "Couldn't save — Bio is too long.",
    );
  });

  it("falls back to please-try-again with no reason", () => {
    expect(describeError("Couldn't save that co-op", new TypeError("Failed to fetch"))).toBe(
      "Couldn't save that co-op — please try again.",
    );
    expect(describeError("Couldn't save that co-op", new ApiError(500, "boom"))).toBe(
      "Couldn't save that co-op — please try again.",
    );
  });
});
