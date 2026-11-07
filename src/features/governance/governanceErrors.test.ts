import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { governanceCause, governanceErrorText } from "./governanceErrors";

const restricted = () =>
  new ApiError(403, "Your account is restricted", {
    code: "ACCOUNT_RESTRICTED",
  });

describe("governanceCause: proposal rules", () => {
  it.each([
    [
      400,
      "Voting is closed for this proposal",
      "governance:error.votingClosed",
    ],
    [
      400,
      "Voting has not opened for this proposal yet",
      "governance:error.votingNotOpen",
    ],
    [
      403,
      "You cannot vote on a proposal about yourself",
      "governance:error.voteOnSelf",
    ],
    [404, "Proposal not found", "governance:error.proposalGone"],
    [
      400,
      "This proposal is not gathering co-signatures",
      "governance:error.notGathering",
    ],
    [
      400,
      "The co-signature window for this motion has closed",
      "governance:error.windowClosed",
    ],
    [
      403,
      "The member who filed a motion cannot withdraw their own founding signature",
      "governance:error.founderSignature",
    ],
    [
      429,
      "You already have 3 motions gathering co-signatures. Wait for one of them to be screened, rejected, or to lapse before filing another.",
      "governance:error.motionCap",
    ],
  ])("reads %i %j as %s", (status, message, key) => {
    expect(governanceCause(new ApiError(status, message))).toEqual({ key });
  });
});

describe("governanceCause: shared fallbacks", () => {
  it("names a moderation restriction on the guarded routes", () => {
    expect(governanceCause(restricted())).toEqual({
      key: "shared:apiError.accountRestricted",
    });
  });

  it("names an inactive membership", () => {
    expect(
      governanceCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toEqual({ key: "shared:apiError.notActive" });
  });

  it("keeps a plain throttle 429 on the shared rate-limit line", () => {
    expect(
      governanceCause(
        new ApiError(429, "ThrottlerException: Too Many Requests"),
      ),
    ).toEqual({ key: "shared:apiError.reasonRateLimited" });
  });

  it("falls back to the status line for other refusals", () => {
    expect(
      governanceCause(new ApiError(400, "title must be a string")),
    ).toEqual({ key: "shared:apiError.reasonInvalid" });
    expect(governanceCause(new ApiError(401, "Unauthorized"))).toEqual({
      key: "shared:apiError.signedOut",
    });
    expect(governanceCause(new ApiError(500, "boom"))).toEqual({
      key: "shared:apiError.serverFault",
    });
    expect(governanceCause(new ApiError(408, "Request timed out"))).toEqual({
      key: "shared:apiError.timedOut",
    });
  });

  it("names the lost connection for a non-ApiError", () => {
    expect(governanceCause(new TypeError("Failed to fetch"))).toEqual({
      key: "shared:apiError.noConnection",
    });
  });
});

describe("governanceErrorText", () => {
  it("resolves the key through t", () => {
    expect(
      governanceErrorText(
        (key) => `text:${key}`,
        new ApiError(400, "Voting is closed for this proposal"),
      ),
    ).toBe("text:governance:error.votingClosed");
  });
});
