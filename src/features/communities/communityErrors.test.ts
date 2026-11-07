import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  COMMUNITY_CODE_OVERRIDES,
  communityCause,
  communityErrorText,
  isAccountLevelCause,
} from "./communityErrors";

const restricted = () =>
  new ApiError(403, "Your account is restricted", {
    code: "ACCOUNT_RESTRICTED",
  });

describe("communityCause: coded refusals", () => {
  it.each(Object.entries(COMMUNITY_CODE_OVERRIDES))(
    "maps the %s code to %s",
    (code, key) => {
      expect(communityCause(new ApiError(403, "x", { code }))).toEqual({ key });
    },
  );
});

describe("communityCause: refusals worded only as a sentence", () => {
  it.each([
    [403, "This community has been archived", "communities:error.archived"],
    [
      409,
      "This community has been archived. It is read-only.",
      "communities:error.archived",
    ],
    [
      409,
      "An archived community cannot be edited. Unarchive it first.",
      "communities:error.archived",
    ],
    [
      403,
      "This community is frozen while moderators review recent reports",
      "communities:error.frozen",
    ],
    [
      409,
      "This space is paused because its parent community is paused",
      "communities:error.parentPaused",
    ],
    [
      409,
      "This community was frozen by moderation. It can be unfrozen once its open reports have been resolved.",
      "communities:error.frozenByModeration",
    ],
    [403, "Only roster members can do that", "communities:error.notOnRoster"],
    [
      409,
      "You are already a member of this community.",
      "communities:error.alreadyMember",
    ],
    [400, "The owner cannot be removed", "communities:error.ownerCannotLeave"],
    [
      400,
      "The owner's role cannot be changed",
      "communities:error.ownerRoleFixed",
    ],
    [
      400,
      "The owner’s role cannot be changed",
      "communities:error.ownerRoleFixed",
    ],
    [403, "You cannot change your own role", "communities:error.ownRoleFixed"],
    [400, "You already own this community", "communities:error.alreadyOwner"],
    [
      400,
      "That member already owns this community",
      "communities:error.alreadyOwner",
    ],
    [
      400,
      "Ownership cannot be transferred to the house account",
      "communities:error.houseAccountOwner",
    ],
    [
      400,
      "A space cannot be publicly listed",
      "communities:error.cannotBeListed",
    ],
    [
      400,
      "A community can only be publicly listed while its access tier is public or request. Change the tier first, or leave it unlisted.",
      "communities:error.cannotBeListed",
    ],
    [
      403,
      "Only the owner can remove a co-owner",
      "communities:error.needsHigherRole",
    ],
    [
      403,
      "Only an owner or co-owner can remove a moderator",
      "communities:error.needsHigherRole",
    ],
    [
      403,
      "Only the owner can change a co-owner's role",
      "communities:error.needsHigherRole",
    ],
    [
      403,
      "Only the owner can appoint a co-owner",
      "communities:error.needsHigherRole",
    ],
    [
      403,
      "Only an owner or co-owner can change a moderator's role",
      "communities:error.needsHigherRole",
    ],
    [
      403,
      "Only an owner or co-owner can change who can see or join this community",
      "communities:error.needsHigherRole",
    ],
    [403, "Only the owner can do that", "communities:error.ownerOnly"],
    [
      403,
      "Only the owner or a moderator can do that",
      "communities:error.needsStaffRole",
    ],
    [
      403,
      "Only an owner or mod can freeze a community",
      "communities:error.needsStaffRole",
    ],
    [
      403,
      "Only an owner or mod can unfreeze a community",
      "communities:error.needsStaffRole",
    ],
    [
      403,
      "Only a community owner/mod can post an announcement",
      "communities:error.announcementStaffOnly",
    ],
    [404, "Community not found", "communities:error.communityGone"],
    [404, "Post not found", "communities:error.postGone"],
    [404, "Reply not found", "communities:error.postGone"],
    [404, "Member not found", "communities:error.memberGone"],
    [404, "Invitation not found", "communities:error.inviteGone"],
    [
      409,
      "This invitation has already been answered",
      "communities:error.inviteAnswered",
    ],
    [
      400,
      "This offer has already been answered",
      "communities:error.offerAnswered",
    ],
    [409, "Join request already resolved", "communities:error.requestResolved"],
    [
      422,
      "This community requires a vouch from a current member before this applicant can be admitted",
      "communities:error.needsVouch",
    ],
    [404, "No ban found for that member", "communities:error.banGone"],
    [
      400,
      "That rule is outside this community's current rules",
      "communities:error.banRuleStale",
    ],
    [
      409,
      "A community's resource shelf holds at most 12 entries. Remove one before adding another.",
      "communities:error.shelfFull",
    ],
    [
      429,
      "You can file one owner review a day. Please try again tomorrow.",
      "communities:error.ownerReviewDaily",
    ],
    [
      409,
      "This community already has an open owner review",
      "communities:error.ownerReviewOpen",
    ],
  ])("reads %i %j as %s", (status, message, key) => {
    expect(communityCause(new ApiError(status, message))).toEqual({ key });
  });
});

describe("communityCause: shared fallbacks", () => {
  it("names the moderation restriction ahead of a sentence", () => {
    expect(communityCause(restricted())).toEqual({
      key: "shared:apiError.accountRestricted",
    });
  });

  it("names the inactive membership", () => {
    expect(
      communityCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toEqual({ key: "shared:apiError.notActive" });
  });

  it("falls back to the shared status line for an unknown refusal", () => {
    expect(communityCause(new ApiError(403, "Something else"))).toEqual({
      key: "shared:apiError.forbidden",
    });
    expect(communityCause(new ApiError(429, "Too Many Requests"))).toEqual({
      key: "shared:apiError.reasonRateLimited",
    });
    expect(communityCause(new ApiError(503, "Unavailable"))).toEqual({
      key: "shared:apiError.serverFault",
    });
    expect(communityCause(new ApiError(401, "Unauthorized"))).toEqual({
      key: "shared:apiError.signedOut",
    });
    expect(communityCause(new ApiError(408, "Request timed out"))).toEqual({
      key: "shared:apiError.timedOut",
    });
  });

  it("names the lost connection for a non-ApiError", () => {
    expect(communityCause(new TypeError("Failed to fetch"))).toEqual({
      key: "shared:apiError.noConnection",
    });
  });

  it("lets a caller add a status line without losing the table", () => {
    const extra = { 404: "communities:error.requestResolved" };
    expect(
      communityCause(new ApiError(404, "No open space request"), extra),
    ).toEqual({ key: "communities:error.requestResolved" });
    expect(
      communityCause(new ApiError(404, "Community not found"), extra),
    ).toEqual({ key: "communities:error.communityGone" });
  });
});

describe("communityErrorText", () => {
  it("resolves the key with the values through t", () => {
    const calls: Array<[string, unknown]> = [];
    const text = communityErrorText(
      (key, options) => {
        calls.push([key, options]);
        return `text:${key}`;
      },
      new ApiError(418, "teapot"),
    );
    expect(text).toBe("text:shared:apiError.refused");
    expect(calls).toEqual([["shared:apiError.refused", { status: 418 }]]);
  });
});

describe("isAccountLevelCause", () => {
  it("is true for a restriction and an inactive membership only", () => {
    expect(isAccountLevelCause(restricted())).toBe(true);
    expect(
      isAccountLevelCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toBe(true);
    expect(isAccountLevelCause(new ApiError(403, "Nope"))).toBe(false);
    expect(isAccountLevelCause(new TypeError("Failed to fetch"))).toBe(false);
  });
});
