import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  accountStepUpErrorCopy,
  cancelDeletionErrorCopy,
  deleteUploadErrorCopy,
  dsarSubmitErrorCopy,
  exportStartErrorCopy,
  pushDeviceRemoveErrorCopy,
  sessionRevokeErrorCopy,
  settingWriteErrorCopy,
} from "./settingsActionErrors";

const offline = new TypeError("Failed to fetch");

describe("settingWriteErrorCopy", () => {
  it("names the shared causes", () => {
    expect(settingWriteErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(settingWriteErrorCopy(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(settingWriteErrorCopy(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(settingWriteErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(settingWriteErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(settingWriteErrorCopy(new ApiError(408, "x")).key).toBe(
      "shared:apiError.timedOut",
    );
  });
});

describe("accountStepUpErrorCopy", () => {
  it("reads a 401 as an expired confirmation", () => {
    expect(
      accountStepUpErrorCopy(
        new ApiError(401, "Recent re-authentication required"),
      ).key,
    ).toBe("settings:accountAction.error.reauthExpired");
  });

  it("tells the two 409 sentences apart", () => {
    expect(
      accountStepUpErrorCopy(
        new ApiError(
          409,
          "You’re the only remaining admin. Promote another member to admin before deactivating or deleting your account.",
        ),
      ).key,
    ).toBe("settings:accountAction.error.onlyAdmin");
    expect(
      accountStepUpErrorCopy(
        new ApiError(409, "A deletion request is already scheduled"),
      ).key,
    ).toBe("settings:accountAction.error.deletionAlreadyScheduled");
  });

  it("falls back to the shared conflict line for a reworded 409", () => {
    expect(
      accountStepUpErrorCopy(new ApiError(409, "Something else")).key,
    ).toBe("shared:apiError.reasonConflict");
  });

  it("falls back to the shared causes", () => {
    expect(accountStepUpErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(accountStepUpErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(accountStepUpErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
  });
});

describe("cancelDeletionErrorCopy", () => {
  it("names nothing pending and an erasure already running", () => {
    expect(cancelDeletionErrorCopy(new ApiError(404, "No pending")).key).toBe(
      "settings:accountAction.error.noPendingDeletion",
    );
    expect(cancelDeletionErrorCopy(new ApiError(409, "Processing")).key).toBe(
      "settings:accountAction.error.deletionProcessing",
    );
  });

  it("falls back to the shared causes", () => {
    expect(cancelDeletionErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(cancelDeletionErrorCopy(new ApiError(502, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("exportStartErrorCopy and dsarSubmitErrorCopy", () => {
  it("name the hourly throttle and the expired confirmation", () => {
    expect(exportStartErrorCopy(new ApiError(429, "x")).key).toBe(
      "settings:accountAction.error.exportRateLimited",
    );
    expect(dsarSubmitErrorCopy(new ApiError(429, "x")).key).toBe(
      "settings:accountAction.error.dsarRateLimited",
    );
    expect(exportStartErrorCopy(new ApiError(401, "x")).key).toBe(
      "settings:accountAction.error.reauthExpired",
    );
    expect(dsarSubmitErrorCopy(new ApiError(401, "x")).key).toBe(
      "settings:accountAction.error.reauthExpired",
    );
  });

  it("keep the restriction line ahead of the status lines", () => {
    const restricted = new ApiError(403, "Restricted", {
      code: "ACCOUNT_RESTRICTED",
    });
    expect(exportStartErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(dsarSubmitErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("fall back to the shared causes", () => {
    expect(exportStartErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(dsarSubmitErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(dsarSubmitErrorCopy(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
  });
});

describe("sessionRevokeErrorCopy and pushDeviceRemoveErrorCopy", () => {
  it("name a session or device that is already gone", () => {
    expect(sessionRevokeErrorCopy(new ApiError(404, "x")).key).toBe(
      "settings:sessions.error.notFound",
    );
    expect(pushDeviceRemoveErrorCopy(new ApiError(404, "x")).key).toBe(
      "settings:pushDevices.error.notFound",
    );
  });

  it("fall back to the shared causes", () => {
    expect(sessionRevokeErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(pushDeviceRemoveErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(pushDeviceRemoveErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("deleteUploadErrorCopy", () => {
  it("names a foreign upload, one still in use and a degraded check", () => {
    expect(deleteUploadErrorCopy(new ApiError(403, "Not yours")).key).toBe(
      "settings:uploads.delete.error.notYours",
    );
    expect(deleteUploadErrorCopy(new ApiError(409, "Still used")).key).toBe(
      "settings:uploads.delete.error.stillUsed",
    );
    expect(deleteUploadErrorCopy(new ApiError(503, "Degraded")).key).toBe(
      "settings:uploads.delete.error.unverified",
    );
  });

  it("falls back to the shared causes", () => {
    expect(deleteUploadErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(deleteUploadErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});
