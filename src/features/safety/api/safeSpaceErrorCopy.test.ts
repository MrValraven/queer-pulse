import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  safeSpaceFlagCause,
  safeSpaceFlagWithdrawCause,
  safeSpaceNominationCause,
  safeSpaceVouchCause,
} from "./safeSpaceErrorCopy";

const OFFLINE = new TypeError("Failed to fetch");
const RESTRICTED = new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" });

describe("safeSpaceVouchCause", () => {
  it.each([
    [400, "safety:vouchModal.error.notVouchable"],
    [404, "safety:spaces.error.gone"],
    [409, "safety:vouchModal.error.alreadyVouched"],
  ])("names status %i", (status, key) => {
    expect(safeSpaceVouchCause(new ApiError(status, "x"))).toEqual({ key });
  });

  it("falls back to the shared causes", () => {
    expect(safeSpaceVouchCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(safeSpaceVouchCause(RESTRICTED).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(safeSpaceVouchCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(safeSpaceVouchCause(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(safeSpaceVouchCause(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
  });
});

describe("safeSpaceFlagCause", () => {
  it.each([
    [400, "safety:flag.error.notFlaggable"],
    [404, "safety:spaces.error.gone"],
    [429, "safety:flag.error.rateLimited"],
  ])("names status %i", (status, key) => {
    expect(safeSpaceFlagCause(new ApiError(status, "x"))).toEqual({ key });
  });

  it("names a restriction ahead of the status lines", () => {
    expect(safeSpaceFlagCause(RESTRICTED).key).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("falls back to the shared causes", () => {
    expect(safeSpaceFlagCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(safeSpaceFlagCause(new ApiError(503, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("safeSpaceFlagWithdrawCause", () => {
  it("says no open flag is left for a 404", () => {
    expect(safeSpaceFlagWithdrawCause(new ApiError(404, "x"))).toEqual({
      key: "safety:flag.error.nothingToWithdraw",
    });
  });

  it("falls back to the shared causes", () => {
    expect(safeSpaceFlagWithdrawCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(safeSpaceFlagWithdrawCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
  });
});

describe("safeSpaceNominationCause", () => {
  it("names the nomination throttle for a 429", () => {
    expect(safeSpaceNominationCause(new ApiError(429, "x"))).toEqual({
      key: "safety:spaces.nominate.error.rateLimited",
    });
  });

  it("falls back to the shared causes", () => {
    expect(safeSpaceNominationCause(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(safeSpaceNominationCause(new ApiError(409, "x")).key).toBe(
      "shared:apiError.reasonConflict",
    );
    expect(safeSpaceNominationCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(safeSpaceNominationCause(RESTRICTED).key).toBe(
      "shared:apiError.accountRestricted",
    );
  });
});
