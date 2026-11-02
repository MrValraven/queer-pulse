import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { DIRECTORY_PARTNER_REFUSAL_REASONS } from "../marketing/api/directoryPartners.api";
import {
  DIRECTORY_PARTNER_ERROR_VALUES,
  DIRECTORY_PARTNER_FAILURE_KEY,
  DIRECTORY_PARTNER_PUBLIC_STATE_KEY,
  DIRECTORY_PARTNER_REFUSAL_KEY,
  directoryPartnerErrorKeyOf,
} from "./adminDirectoryPartners.model";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("directoryPartnerErrorKeyOf", () => {
  it.each(DIRECTORY_PARTNER_REFUSAL_REASONS)(
    "names the cause for %s",
    (reason) => {
      expect(
        directoryPartnerErrorKeyOf(new ApiError(409, "Conflict", { reason })),
      ).toBe(`admin:directoryPartners.error.${reason}`);
    },
  );

  it("reads the reason from the full refusal body", () => {
    const refusal = new ApiError(409, "Conflict", {
      statusCode: 409,
      error: "Conflict",
      message: "Conflict",
      reason: "already_partner",
    });
    expect(directoryPartnerErrorKeyOf(refusal)).toBe(
      "admin:directoryPartners.error.already_partner",
    );
  });

  it("gives each refusal its own key", () => {
    expect(new Set(Object.values(DIRECTORY_PARTNER_REFUSAL_KEY)).size).toBe(8);
  });

  it("gives each failure its own key", () => {
    const failureKeys = Object.values(DIRECTORY_PARTNER_FAILURE_KEY);
    expect(new Set(failureKeys).size).toBe(failureKeys.length);
  });

  it("names the server for a 500 with no reason", () => {
    expect(directoryPartnerErrorKeyOf(new ApiError(500, "Internal"))).toBe(
      "admin:directoryPartners.failure.server",
    );
  });

  it("names missing admin access for a 403 with no reason", () => {
    expect(directoryPartnerErrorKeyOf(new ApiError(403, "Forbidden"))).toBe(
      "admin:directoryPartners.failure.forbidden",
    );
  });

  it("names an unreachable server for a fetch TypeError while online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    expect(directoryPartnerErrorKeyOf(new TypeError("Failed to fetch"))).toBe(
      "admin:directoryPartners.failure.unreachable",
    );
  });

  it("names the lost connection for a fetch TypeError while offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(directoryPartnerErrorKeyOf(new TypeError("Failed to fetch"))).toBe(
      "admin:directoryPartners.failure.offline",
    );
  });

  it("ignores an unknown reason string and falls back to the status", () => {
    expect(
      directoryPartnerErrorKeyOf(
        new ApiError(409, "Conflict", { reason: "made_up" }),
      ),
    ).toBe("admin:directoryPartners.failure.unknown");
  });

  it("reads the reason field only and skips the message", () => {
    expect(
      directoryPartnerErrorKeyOf(
        new ApiError(409, "already_partner", { message: "already_partner" }),
      ),
    ).toBe("admin:directoryPartners.failure.unknown");
  });
});

describe("partner model constants", () => {
  it("has a not-showing line for every hidden state", () => {
    expect(Object.keys(DIRECTORY_PARTNER_PUBLIC_STATE_KEY).sort()).toEqual([
      "adult_only",
      "closed_for_good",
      "hidden_by_owner",
      "moderated",
      "not_live",
    ]);
  });

  it("quotes the row limit and the note limit", () => {
    expect(DIRECTORY_PARTNER_ERROR_VALUES).toEqual({ max: 12, noteMax: 140 });
  });
});
