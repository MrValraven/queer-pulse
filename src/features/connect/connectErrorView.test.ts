import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { describeConnectError } from "./connectErrorView";

describe("describeConnectError: inline causes", () => {
  it("names a lost connection for an error that is not an ApiError", () => {
    expect(describeConnectError(new TypeError("Failed to fetch"))).toEqual({
      mode: "inline",
      messageKey: "shared:apiError.noConnection",
      messageValues: undefined,
    });
  });

  it("names a moderation restriction", () => {
    expect(
      describeConnectError(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toMatchObject({
      mode: "inline",
      messageKey: "shared:apiError.accountRestricted",
    });
  });

  it("names a server fault, a signed-out session and an unlisted status", () => {
    expect(describeConnectError(new ApiError(500, "x"))).toMatchObject({
      messageKey: "shared:apiError.serverFault",
    });
    expect(describeConnectError(new ApiError(401, "x"))).toMatchObject({
      messageKey: "shared:apiError.signedOut",
    });
    expect(describeConnectError(new ApiError(418, "x"))).toEqual({
      mode: "inline",
      messageKey: "shared:apiError.refused",
      messageValues: { status: 418 },
    });
  });

  it("keeps the connect form's own rate limit line for a 429", () => {
    expect(describeConnectError(new ApiError(429, "x"))).toEqual({
      mode: "inline",
      messageKey: "connect:form.rateLimitError",
    });
  });

  it("keeps a coded cap inline with its own line", () => {
    expect(
      describeConnectError(
        new ApiError(429, "x", { code: "CONNECTION_REQUEST_DAILY_LIMIT" }),
      ),
    ).toEqual({ mode: "inline", messageKey: "connect:form.dailyLimitError" });
  });

  it("keeps the business panels", () => {
    expect(
      describeConnectError(
        new ApiError(
          403,
          "This member requires an introduction from a mutual connection",
        ),
      ),
    ).toMatchObject({ mode: "panel" });
  });
});

describe("describeConnectError: blocks and unavailable members", () => {
  it("shows the not-available panel for a 404 without naming a block", () => {
    expect(describeConnectError(new ApiError(404, "Member not found"))).toEqual(
      {
        mode: "panel",
        titleKey: "connect:notice.cannotConnect.title",
        bodyKey: "connect:notice.cannotConnect.body",
        icon: "held",
      },
    );
  });

  it("names the requester's own block by its code", () => {
    expect(
      describeConnectError(
        new ApiError(409, "x", { code: "UNBLOCK_TO_CONTACT" }),
      ),
    ).toMatchObject({
      mode: "panel",
      titleKey: "connect:notice.youBlocked.title",
    });
  });

  it("keeps the message match for a backend that sends no code", () => {
    expect(
      describeConnectError(
        new ApiError(409, "Unblock this member before sending a request"),
      ),
    ).toMatchObject({ titleKey: "connect:notice.youBlocked.title" });
  });

  it("keeps a decline hold masked as already pending", () => {
    expect(
      describeConnectError(new ApiError(409, "A request is already pending")),
    ).toMatchObject({ titleKey: "connect:notice.alreadyPending.title" });
  });
});
