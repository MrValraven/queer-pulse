import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  createInviteErrorCopy,
  invitePrivateNoteErrorCopy,
  onboardingSaveErrorCopy,
  requestInviteErrorCopy,
  resendInviteErrorCopy,
  revokeInviteErrorCopy,
} from "./authActionErrors";

const offline = new TypeError("Failed to fetch");
const restricted = new ApiError(403, "Restricted", {
  code: "ACCOUNT_RESTRICTED",
});
const notActive = new ApiError(403, "Active membership required", {
  code: "ACTIVE_MEMBERSHIP_REQUIRED",
});

describe("requestInviteErrorCopy", () => {
  it("names the closed requests, the cooldown, rejected details and the throttle", () => {
    expect(
      requestInviteErrorCopy(
        new ApiError(403, "Closed", { code: "JOIN_REQUESTS_CLOSED" }),
      ),
    ).toEqual({ key: "auth:requestInvite.closedError" });
    expect(
      requestInviteErrorCopy(
        new ApiError(403, "Wait", { code: "REAPPLICATION_COOLDOWN" }),
      ),
    ).toEqual({ key: "auth:requestInvite.cooldownError" });
    expect(requestInviteErrorCopy(new ApiError(400, "Bad"))).toEqual({
      key: "auth:requestInvite.error.invalid",
    });
    expect(requestInviteErrorCopy(new ApiError(429, "Slow"))).toEqual({
      key: "auth:requestInvite.rateLimitedError",
    });
  });

  it("falls back to the shared causes", () => {
    expect(requestInviteErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(requestInviteErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(requestInviteErrorCopy(new ApiError(408, "x")).key).toBe(
      "shared:apiError.timedOut",
    );
    expect(requestInviteErrorCopy(new ApiError(403, "x")).key).toBe(
      "shared:apiError.forbidden",
    );
  });
});

describe("createInviteErrorCopy", () => {
  it("names the quota, invalid details and the throttle", () => {
    expect(
      createInviteErrorCopy(
        new ApiError(403, "Quota", { code: "INVITE_QUOTA_EXCEEDED" }),
      ).key,
    ).toBe("auth:invite.link.error.quota");
    expect(
      createInviteErrorCopy(new ApiError(400, "email must be an email")).key,
    ).toBe("auth:invite.link.error.invalid");
    expect(createInviteErrorCopy(new ApiError(429, "Too many")).key).toBe(
      "auth:invite.link.error.rateLimited",
    );
  });

  it("names a restricted account and an inactive membership ahead of status lines", () => {
    expect(createInviteErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(createInviteErrorCopy(notActive).key).toBe(
      "shared:apiError.notActive",
    );
  });

  it("falls back to the shared causes", () => {
    expect(createInviteErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(createInviteErrorCopy(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(createInviteErrorCopy(new ApiError(503, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("revokeInviteErrorCopy", () => {
  it("names a missing invite and one that can no longer be revoked", () => {
    expect(
      revokeInviteErrorCopy(new ApiError(404, "Invite not found")).key,
    ).toBe("auth:invite.sentList.resendError.notFound");
    expect(revokeInviteErrorCopy(new ApiError(409, "Accepted")).key).toBe(
      "auth:invite.sentList.revokeError.notRevocable",
    );
  });

  it("falls back to the shared causes", () => {
    expect(revokeInviteErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(revokeInviteErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(revokeInviteErrorCopy(notActive).key).toBe(
      "shared:apiError.notActive",
    );
    expect(revokeInviteErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("resendInviteErrorCopy", () => {
  it("keeps the paused, not-yours, not-found and not-resendable lines", () => {
    expect(
      resendInviteErrorCopy(
        new ApiError(403, "Paused", { code: "INVITE_ACCESS_DISABLED" }),
      ).key,
    ).toBe("auth:invite.sentList.resendError.paused");
    expect(resendInviteErrorCopy(new ApiError(403, "Nope")).key).toBe(
      "auth:invite.sentList.resendError.notYours",
    );
    expect(resendInviteErrorCopy(new ApiError(404, "x")).key).toBe(
      "auth:invite.sentList.resendError.notFound",
    );
    expect(resendInviteErrorCopy(new ApiError(409, "x")).key).toBe(
      "auth:invite.sentList.resendError.notResendable",
    );
  });

  it("names a restriction, an inactive membership, a throttle and a lost connection", () => {
    expect(resendInviteErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(resendInviteErrorCopy(notActive).key).toBe(
      "shared:apiError.notActive",
    );
    expect(resendInviteErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(resendInviteErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
  });
});

describe("invitePrivateNoteErrorCopy", () => {
  it("names a note that is too long and an invite that is gone", () => {
    expect(invitePrivateNoteErrorCopy(new ApiError(400, "x")).key).toBe(
      "auth:invite.sentList.privateNote.error.tooLong",
    );
    expect(invitePrivateNoteErrorCopy(new ApiError(404, "x")).key).toBe(
      "auth:invite.sentList.resendError.notFound",
    );
  });

  it("falls back to the shared causes", () => {
    expect(invitePrivateNoteErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(invitePrivateNoteErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(invitePrivateNoteErrorCopy(new ApiError(502, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("onboardingSaveErrorCopy", () => {
  it("names a missing profile", () => {
    expect(
      onboardingSaveErrorCopy(new ApiError(404, "Profile not found")),
    ).toEqual({
      key: "auth:onboarding.saveError.noProfile",
    });
  });

  it("falls back to the shared causes", () => {
    expect(onboardingSaveErrorCopy(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(onboardingSaveErrorCopy(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(onboardingSaveErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(onboardingSaveErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});
