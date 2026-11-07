import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  feedMuteCause,
  feedReactionCause,
  feedReplyCause,
  feedThreadReactionCause,
} from "./feedErrorCopy";

const OFFLINE = new TypeError("Failed to fetch");

describe("feedReplyCause", () => {
  it("explains a community the member cannot write in for a 403", () => {
    expect(
      feedReplyCause(new ApiError(403, "Only roster members can do that")),
    ).toEqual({ key: "feed:action.replyForbidden" });
  });

  it("says the post is gone for a 404", () => {
    expect(feedReplyCause(new ApiError(404, "x"))).toEqual({
      key: "feed:action.postGone",
    });
  });

  it("names a moderation restriction before the community line", () => {
    expect(
      feedReplyCause(new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" })),
    ).toEqual({ key: "shared:apiError.accountRestricted" });
  });

  it("names an inactive membership before the community line", () => {
    expect(
      feedReplyCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toEqual({ key: "shared:apiError.notActive" });
  });

  it("falls back to the shared causes", () => {
    expect(feedReplyCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(feedReplyCause(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(feedReplyCause(new ApiError(502, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(feedReplyCause(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(feedReplyCause(OFFLINE).key).toBe("shared:apiError.noConnection");
  });
});

describe("feedReactionCause", () => {
  it("explains a community the member cannot react in for a 403", () => {
    expect(feedReactionCause(new ApiError(403, "x"))).toEqual({
      key: "feed:action.reactionForbidden",
    });
  });

  it("says the post is gone for a 404", () => {
    expect(feedReactionCause(new ApiError(404, "x"))).toEqual({
      key: "feed:action.postGone",
    });
  });

  it("falls back to the shared causes", () => {
    expect(feedReactionCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(feedReactionCause(OFFLINE).key).toBe("shared:apiError.noConnection");
  });
});

describe("feedMuteCause", () => {
  it("says the source is gone for a 404", () => {
    expect(feedMuteCause(new ApiError(404, "x"))).toEqual({
      key: "feed:mute.sourceGone",
    });
  });

  it("falls back to the shared causes", () => {
    expect(feedMuteCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(feedMuteCause(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(feedMuteCause(OFFLINE).key).toBe("shared:apiError.noConnection");
  });
});

describe("feedThreadReactionCause", () => {
  it("says the thread is gone for a 404", () => {
    expect(feedThreadReactionCause(new ApiError(404, "x"))).toEqual({
      key: "feed:action.postGone",
    });
  });

  it("leaves a 403 to the shared no-access line", () => {
    expect(feedThreadReactionCause(new ApiError(403, "x")).key).toBe(
      "shared:apiError.forbidden",
    );
  });

  it("falls back to the shared causes", () => {
    expect(feedThreadReactionCause(new TypeError("Failed to fetch")).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(feedThreadReactionCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
  });
});
