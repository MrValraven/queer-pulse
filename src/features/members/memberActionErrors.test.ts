import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  badgeVisibilityErrorCopy,
  boardCloseErrorCopy,
  boardRenewErrorCopy,
  boardRespondErrorCopy,
  claimPerkErrorCopy,
  hideFromErrorCopy,
  quickEditListingErrorCopy,
  unhideFromErrorCopy,
} from "./memberActionErrors";

const offline = new TypeError("Failed to fetch");
const restricted = new ApiError(403, "Restricted", {
  code: "ACCOUNT_RESTRICTED",
});

describe("claimPerkErrorCopy", () => {
  it("names a perk above the member's level by its code", () => {
    expect(
      claimPerkErrorCopy(
        new ApiError(403, "Level too low", { code: "PERK_LEVEL_NOT_REACHED" }),
      ).key,
    ).toBe("members:perks.claim.error.levelNotReached");
  });

  it("falls back to the shared causes", () => {
    expect(claimPerkErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(claimPerkErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(claimPerkErrorCopy(new ApiError(404, "x")).key).toBe(
      "shared:apiError.notFound",
    );
    expect(claimPerkErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("badgeVisibilityErrorCopy", () => {
  it("names a badge that is not earned", () => {
    expect(badgeVisibilityErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:badges.drawer.visibilityError.notEarned",
    );
  });

  it("falls back to the shared causes", () => {
    expect(badgeVisibilityErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(badgeVisibilityErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
  });
});

describe("hideFromErrorCopy and unhideFromErrorCopy", () => {
  it("name hiding from yourself, a missing member and a profile not hidden", () => {
    expect(hideFromErrorCopy(new ApiError(400, "x")).key).toBe(
      "members:profile.whoSeesWhat.hiddenFrom.error.self",
    );
    expect(hideFromErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:profile.whoSeesWhat.hiddenFrom.error.notFound",
    );
    expect(unhideFromErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:profile.whoSeesWhat.hiddenFrom.error.notHidden",
    );
  });

  it("fall back to the shared causes", () => {
    expect(hideFromErrorCopy(offline).key).toBe("shared:apiError.noConnection");
    expect(unhideFromErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(hideFromErrorCopy(new ApiError(409, "x")).key).toBe(
      "shared:apiError.reasonConflict",
    );
  });
});

describe("quickEditListingErrorCopy", () => {
  it("names rejected details and a listing the member no longer manages", () => {
    expect(quickEditListingErrorCopy(new ApiError(400, "x")).key).toBe(
      "members:places.quickEdit.error.invalid",
    );
    expect(quickEditListingErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:places.quickEdit.error.notFound",
    );
  });

  it("falls back to the shared causes", () => {
    expect(quickEditListingErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(quickEditListingErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(quickEditListingErrorCopy(new ApiError(403, "x")).key).toBe(
      "shared:apiError.forbidden",
    );
    expect(quickEditListingErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
  });
});

describe("board action errors", () => {
  it("names a board that is closed to the viewer and a post that is gone", () => {
    expect(boardRespondErrorCopy(new ApiError(403, "x")).key).toBe(
      "members:content.board.error.notOpen",
    );
    expect(boardRespondErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:content.board.error.postGone",
    );
    expect(boardCloseErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:content.board.error.postGone",
    );
  });

  it("tells a closed post from the renew limit by the 409 sentence", () => {
    expect(
      boardRenewErrorCopy(
        new ApiError(
          409,
          "This post is closed. Reopen it from the board editor.",
        ),
      ).key,
    ).toBe("members:content.board.error.postClosed");
    expect(
      boardRenewErrorCopy(
        new ApiError(
          409,
          "This post has been renewed as many times as it can be.",
        ),
      ).key,
    ).toBe("members:content.board.renewLimitReached");
    expect(boardRenewErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:content.board.error.postGone",
    );
  });

  it("falls back to the shared causes", () => {
    expect(boardRespondErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(boardCloseErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(boardRenewErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(boardRespondErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
  });
});
