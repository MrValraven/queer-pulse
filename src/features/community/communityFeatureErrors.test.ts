import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  nominationCause,
  nominationErrorText,
  readingGroupJoinErrorText,
  readingGroupProposalErrorText,
} from "./communityFeatureErrors";

const echo = (key: string) => `text:${key}`;
const restricted = () =>
  new ApiError(403, "Your account is restricted", {
    code: "ACCOUNT_RESTRICTED",
  });

describe("nominationCause", () => {
  it("names a self-nomination", () => {
    expect(
      nominationCause(new ApiError(400, "You cannot nominate yourself")),
    ).toEqual({ key: "community:changemakers.nominate.errorSelf" });
  });

  it("names an unknown member", () => {
    expect(
      nominationCause(new ApiError(400, "That member could not be found")),
    ).toEqual({ key: "community:changemakers.nominate.errorMemberGone" });
  });

  it("names a moderation restriction and an inactive membership", () => {
    expect(nominationCause(restricted())).toEqual({
      key: "shared:apiError.accountRestricted",
    });
    expect(
      nominationCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toEqual({ key: "shared:apiError.notActive" });
  });

  it("falls back to the status line, then to no connection", () => {
    expect(nominationCause(new ApiError(400, "reason must be longer"))).toEqual(
      { key: "shared:apiError.reasonInvalid" },
    );
    expect(nominationCause(new ApiError(429, "Too Many Requests"))).toEqual({
      key: "shared:apiError.reasonRateLimited",
    });
    expect(nominationCause(new ApiError(500, "boom"))).toEqual({
      key: "shared:apiError.serverFault",
    });
    expect(nominationCause(new TypeError("Failed to fetch"))).toEqual({
      key: "shared:apiError.noConnection",
    });
  });

  it("renders through nominationErrorText", () => {
    expect(
      nominationErrorText(
        echo,
        new ApiError(400, "You cannot nominate yourself"),
      ),
    ).toBe("text:community:changemakers.nominate.errorSelf");
  });
});

describe("readingGroupJoinErrorText", () => {
  it("reads the communities table for a coded refusal", () => {
    expect(
      readingGroupJoinErrorText(
        echo,
        new ApiError(403, "x", { code: "BANNED_FROM_COMMUNITY" }),
      ),
    ).toBe("text:communities:error.banned");
    expect(
      readingGroupJoinErrorText(
        echo,
        new ApiError(403, "x", { code: "COMMUNITY_FROZEN" }),
      ),
    ).toBe("text:communities:error.frozen");
  });

  it("names a group that is gone and a join that is already pending", () => {
    expect(
      readingGroupJoinErrorText(echo, new ApiError(404, "Community not found")),
    ).toBe("text:communities:error.communityGone");
    expect(
      readingGroupJoinErrorText(
        echo,
        new ApiError(409, "A join request is already pending", {
          code: "COMMUNITY_JOIN_REQUEST_PENDING",
        }),
      ),
    ).toBe("text:communities:error.requestPending");
  });

  it("falls back to the shared lines", () => {
    expect(readingGroupJoinErrorText(echo, restricted())).toBe(
      "text:shared:apiError.accountRestricted",
    );
    expect(
      readingGroupJoinErrorText(echo, new TypeError("Failed to fetch")),
    ).toBe("text:shared:apiError.noConnection");
  });
});

describe("readingGroupProposalErrorText", () => {
  it("uses the shared lines only", () => {
    expect(readingGroupProposalErrorText(echo, restricted())).toBe(
      "text:shared:apiError.accountRestricted",
    );
    expect(
      readingGroupProposalErrorText(
        echo,
        new ApiError(429, "Too Many Requests"),
      ),
    ).toBe("text:shared:apiError.reasonRateLimited");
    expect(readingGroupProposalErrorText(echo, new ApiError(400, "bad"))).toBe(
      "text:shared:apiError.reasonInvalid",
    );
    expect(readingGroupProposalErrorText(echo, new ApiError(503, "x"))).toBe(
      "text:shared:apiError.serverFault",
    );
    expect(
      readingGroupProposalErrorText(echo, new TypeError("Failed to fetch")),
    ).toBe("text:shared:apiError.noConnection");
  });
});
