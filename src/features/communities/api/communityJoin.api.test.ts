import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  getCommunityRules,
  isInviteRequiredResult,
  isRequestedResult,
  joinOutcomeOf,
  joinRefusalFor,
} from "./communityJoin.api";

/**
 * The join refusals are read off the error body's `code` alone, so each case
 * builds the `ApiError` the shared client would throw for that response.
 * `apiGet` is mocked (the real `ApiError` class is kept) so the rules read can
 * be asserted by the path it asks for.
 */
const apiGetMock = vi.hoisted(() => vi.fn());

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  apiGet: apiGetMock,
}));

describe("joinRefusalFor", () => {
  it("joinRefusalFor reads COMMUNITY_FROZEN with its reason", () => {
    const error = new ApiError(403, "This community is frozen", {
      code: "COMMUNITY_FROZEN",
      frozenReason: "emergency_report",
    });

    expect(joinRefusalFor(error)).toEqual({
      kind: "frozen",
      frozenReason: "emergency_report",
    });
  });

  it("joinRefusalFor reads COMMUNITY_FROZEN with no reason as null", () => {
    const error = new ApiError(403, "This community is frozen", {
      code: "COMMUNITY_FROZEN",
      frozenReason: null,
    });

    expect(joinRefusalFor(error)).toEqual({
      kind: "frozen",
      frozenReason: null,
    });
  });

  it("joinRefusalFor reads COMMUNITY_JOIN_REQUEST_PENDING", () => {
    const error = new ApiError(409, "Request already pending", {
      code: "COMMUNITY_JOIN_REQUEST_PENDING",
    });

    expect(joinRefusalFor(error)).toEqual({ kind: "alreadyPending" });
  });

  it("joinRefusalFor reads PARENT_MEMBERSHIP_REQUIRED", () => {
    const error = new ApiError(403, "Join the parent first", {
      code: "PARENT_MEMBERSHIP_REQUIRED",
    });

    expect(joinRefusalFor(error)).toEqual({ kind: "parentRequired" });
  });

  it("joinRefusalFor answers null for an uncoded 400", () => {
    const error = new ApiError(400, "note must be shorter", {
      message: ["note must be shorter"],
    });

    expect(joinRefusalFor(error)).toBeNull();
  });
});

describe("joinOutcomeOf", () => {
  it("joinOutcomeOf reads each of the three outcomes", () => {
    expect(
      joinOutcomeOf({ outcome: "joined", role: "member", request: null }),
    ).toBe("joined");
    expect(
      joinOutcomeOf({ outcome: "requested", role: null, request: null }),
    ).toBe("requested");
    expect(
      joinOutcomeOf({ outcome: "invite_required", role: null, request: null }),
    ).toBe("invite_required");
  });

  it("joinOutcomeOf answers null for a value with no known outcome", () => {
    expect(joinOutcomeOf(null)).toBeNull();
    expect(joinOutcomeOf(undefined)).toBeNull();
    expect(joinOutcomeOf({})).toBeNull();
    expect(joinOutcomeOf({ outcome: "admitted" })).toBeNull();
    expect(joinOutcomeOf("joined")).toBeNull();
  });

  it("isInviteRequiredResult recognises an invite_required outcome", () => {
    expect(
      isInviteRequiredResult({
        outcome: "invite_required",
        role: null,
        request: null,
      }),
    ).toBe(true);
    expect(isInviteRequiredResult(null)).toBe(false);
  });
});

describe("isRequestedResult", () => {
  it("isRequestedResult recognises a requested outcome", () => {
    expect(
      isRequestedResult({ outcome: "requested", role: null, request: null }),
    ).toBe(true);
    expect(
      isRequestedResult({ outcome: "joined", role: "member", request: null }),
    ).toBe(false);
    expect(isRequestedResult(null)).toBe(false);
    expect(isRequestedResult(undefined)).toBe(false);
  });
});

describe("getCommunityRules", () => {
  it("getCommunityRules reads the rules route", async () => {
    apiGetMock.mockResolvedValue({
      rules: [],
      rulesVersion: 1,
      rulesAcceptedVersion: null,
    });

    await getCommunityRules("queer-youth");

    expect(apiGetMock).toHaveBeenCalledWith("/communities/queer-youth/rules");
  });
});
