import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { vouchErrorMessageKey } from "./vouchErrorMessageKey";

// PRD-425: the vouch modal used to map every failure to one "try again"
// message. `VouchService.createVouch` throws distinct failures the client can
// tell apart by status, two machine-readable codes, and one message-text
// check for the guard that carries neither. This locks the mapping in place.
describe("vouchErrorMessageKey", () => {
  it("maps a 409 to the already-vouched key", () => {
    expect(
      vouchErrorMessageKey(
        new ApiError(409, "You have already vouched for this member"),
      ),
    ).toBe("members:vouch.modal.error.alreadyVouched");
  });

  it("maps a 404 to the unavailable key", () => {
    expect(vouchErrorMessageKey(new ApiError(404, "Member not found"))).toBe(
      "members:vouch.modal.error.unavailable",
    );
  });

  it("maps a 403 with the VOUCH_DAILY_LIMIT code to the daily-cap key", () => {
    expect(
      vouchErrorMessageKey(
        new ApiError(
          403,
          "You can vouch for up to 20 members per day. Try again tomorrow.",
          { code: "VOUCH_DAILY_LIMIT" },
        ),
      ),
    ).toBe("members:vouch.modal.error.dailyCap");
  });

  it("falls back to the 'per day' text for the daily cap when the backend sends no code yet", () => {
    expect(
      vouchErrorMessageKey(
        new ApiError(
          403,
          "You can vouch for up to 20 members per day. Try again tomorrow.",
        ),
      ),
    ).toBe("members:vouch.modal.error.dailyCap");
  });

  it("maps a 403 with the ACCOUNT_RESTRICTED code to the shared restricted-account key, ahead of every other check", () => {
    expect(
      vouchErrorMessageKey(
        new ApiError(
          403,
          "This action is unavailable while a moderation restriction is in effect.",
          { code: "ACCOUNT_RESTRICTED" },
        ),
      ),
    ).toBe("shared:apiError.accountRestricted");
  });

  it("maps ActiveMemberGuard's uncoded 403 for the voucher's own inactive membership to the generic key", () => {
    expect(
      vouchErrorMessageKey(new ApiError(403, "Active membership required")),
    ).toBe("members:vouch.modal.error");
  });

  it("maps any other 403 to the blocked key", () => {
    expect(
      vouchErrorMessageKey(
        new ApiError(403, "You cannot vouch for this member"),
      ),
    ).toBe("members:vouch.modal.error.blocked");
  });

  it("falls back to the generic message for a non-ApiError failure", () => {
    expect(vouchErrorMessageKey(new Error("network down"))).toBe(
      "members:vouch.modal.error",
    );
  });

  it("falls back to the generic message for an unrecognised status", () => {
    expect(vouchErrorMessageKey(new ApiError(500, "Server error"))).toBe(
      "members:vouch.modal.error",
    );
  });
});
