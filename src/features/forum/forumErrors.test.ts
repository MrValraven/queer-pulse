import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  FORUM_CODE_OVERRIDES,
  forumCause,
  forumErrorText,
  replyCause,
  replyErrorText,
} from "./forumErrors";
import {
  FUNDING_ERROR_MESSAGE_KEYS,
  FUNDING_ERROR_MESSAGE_VALUES,
} from "./funding/fundingErrors";

const restricted = () =>
  new ApiError(403, "Your account is restricted", {
    code: "ACCOUNT_RESTRICTED",
  });

describe("forumCause: funding refusals", () => {
  it.each(Object.entries(FUNDING_ERROR_MESSAGE_KEYS))(
    "maps %s to %s and carries the host tokens",
    (code, key) => {
      expect(FORUM_CODE_OVERRIDES[code]).toBe(key);
      expect(forumCause(new ApiError(400, "Bad", { code }))).toEqual({
        key,
        values: { ...FUNDING_ERROR_MESSAGE_VALUES },
      });
    },
  );
});

describe("forumCause: refusals worded only as a sentence", () => {
  it.each([
    [403, "This thread is locked", "forum:locked.replyBlockedToast"],
    [
      403,
      "This thread has closed to new replies",
      "forum:error.closedByAuthor",
    ],
    [
      403,
      "Only members of this community can reply in its threads",
      "forum:error.notCommunityMember",
    ],
    [403, "Only roster members can do that", "forum:error.notCommunityMember"],
    [400, "Cannot reply to a deleted post", "forum:error.replyToDeleted"],
    [404, "Parent post not found", "forum:error.replyToDeleted"],
    [404, "Community not found", "forum:error.communityGone"],
    [404, "Thread not found", "forum:error.threadGone"],
    [404, "Post not found", "forum:error.postGone"],
    [409, "Could not allocate a unique thread slug", "forum:error.slugBusy"],
    [
      403,
      "A thread can only be moved to another category in its first 24 hours. Ask a moderator to move it.",
      "forum:error.moveWindowClosed",
    ],
    [
      400,
      "No member with that handle to credit as co-author",
      "forum:error.coAuthorUnknown",
    ],
    [
      400,
      "You are already credited on this thread, so you cannot be its co-author",
      "forum:error.coAuthorSelf",
    ],
    [403, "This poll has closed", "forum:poll.voteFailedClosed"],
    [400, "This poll takes exactly one answer", "forum:poll.errorSingleChoice"],
    [400, "Pick at least one option", "forum:poll.errorNoChoice"],
    [404, "This thread has no poll", "forum:poll.errorOptionGone"],
    [404, "That option is not on this poll", "forum:poll.errorOptionGone"],
    [400, "A deleted post cannot be the answer", "forum:answer.errorDeleted"],
  ])("reads %i %j as %s", (status, message, key) => {
    expect(forumCause(new ApiError(status, message)).key).toBe(key);
  });
});

describe("forumCause: shared fallbacks", () => {
  it("names a moderation restriction, not a locked thread", () => {
    expect(forumCause(restricted()).key).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("names an inactive membership", () => {
    expect(
      forumCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ).key,
    ).toBe("shared:apiError.notActive");
  });

  it("falls back to the status line for an unmatched refusal", () => {
    expect(forumCause(new ApiError(403, "Other")).key).toBe(
      "shared:apiError.forbidden",
    );
    expect(forumCause(new ApiError(429, "Too Many Requests")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(forumCause(new ApiError(400, "title must be longer")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(forumCause(new ApiError(500, "boom")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(forumCause(new ApiError(401, "Unauthorized")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(forumCause(new ApiError(408, "Request timed out")).key).toBe(
      "shared:apiError.timedOut",
    );
  });

  it("names the lost connection for a non-ApiError", () => {
    expect(forumCause(new TypeError("Failed to fetch")).key).toBe(
      "shared:apiError.noConnection",
    );
  });

  it("lets a caller add its own status line", () => {
    expect(
      forumCause(new ApiError(409, "x"), { 409: "forum:toast.pinCapReached" })
        .key,
    ).toBe("forum:toast.pinCapReached");
  });
});

describe("forumErrorText", () => {
  it("resolves the key through t with the values", () => {
    const calls: Array<[string, unknown]> = [];
    const text = forumErrorText(
      (key, options) => {
        calls.push([key, options]);
        return `text:${key}`;
      },
      new ApiError(418, "teapot"),
    );
    expect(text).toBe("text:shared:apiError.refused");
    expect(calls[0]?.[0]).toBe("shared:apiError.refused");
    expect(calls[0]?.[1]).toMatchObject({ status: 418 });
  });
});

describe("replyCause", () => {
  it("tells a restricted account apart from a locked thread", () => {
    expect(replyCause(restricted(), true).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(replyCause(restricted(), false).key).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("names a not-active member", () => {
    expect(
      replyCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
        false,
      ).key,
    ).toBe("shared:apiError.notActive");
  });

  it("gives only a real locked-thread 403 the locked line", () => {
    expect(
      replyCause(new ApiError(403, "This thread is locked"), false).key,
    ).toBe("forum:locked.replyBlockedToast");
  });

  it("gives the not-a-member 403 its own line", () => {
    expect(
      replyCause(
        new ApiError(
          403,
          "Only members of this community can reply in its threads",
        ),
        false,
      ).key,
    ).toBe("forum:error.notCommunityMember");
  });

  it("keeps the locked line for an unrecognised 403 on a thread known to be locked", () => {
    expect(replyCause(new ApiError(403, "Nope"), true).key).toBe(
      "forum:locked.replyBlockedToast",
    );
    expect(replyCause(new ApiError(403, "Nope"), false).key).toBe(
      "shared:apiError.forbidden",
    );
  });

  it("names a reply to a deleted post", () => {
    expect(
      replyCause(new ApiError(400, "Cannot reply to a deleted post"), false)
        .key,
    ).toBe("forum:error.replyToDeleted");
  });

  it("keeps a funding refusal on its own sentence", () => {
    expect(
      replyCause(
        new ApiError(400, "Bad", { code: "funding_payment_details_in_body" }),
        false,
      ).key,
    ).toBe("forum:funding.error.paymentDetails");
  });

  it("renders through replyErrorText", () => {
    expect(
      replyErrorText(
        (key) => `text:${key}`,
        new TypeError("Failed to fetch"),
        false,
      ),
    ).toBe("text:shared:apiError.noConnection");
  });
});
