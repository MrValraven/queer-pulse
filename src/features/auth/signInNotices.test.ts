import { describe, expect, it } from "vitest";
import { noticeForAuthError } from "./signInNotices";

const echoKey = (key: string) => key;

describe("noticeForAuthError (PRD-503)", () => {
  it.each([
    ["invalid_state", "auth:signIn.notice.invalidState.title"],
    ["admin_policy_enforced", "auth:signIn.notice.adminPolicy.title"],
    ["server_error", "auth:signIn.notice.googleServerError.title"],
    ["temporarily_unavailable", "auth:signIn.notice.googleUnavailable.title"],
    ["invalid_request", "auth:signIn.notice.googleSetup.title"],
    ["unauthorized_client", "auth:signIn.notice.googleSetup.title"],
    ["oauth_failed", "auth:signIn.notice.oauthFailed.title"],
    ["access_denied", "auth:signIn.notice.accessDenied.title"],
  ])("gives %s its own notice", (code, titleKey) => {
    expect(noticeForAuthError(code, echoKey).title).toBe(titleKey);
  });

  it("keeps an unknown code on the general notice", () => {
    expect(noticeForAuthError("something_new", echoKey).title).toBe(
      "auth:signIn.notice.oauthFailed.title",
    );
  });

  it("tells our own timed-out attempt apart from a Google failure", () => {
    const ownTimeout = noticeForAuthError("invalid_state", echoKey);
    const googleFailure = noticeForAuthError("server_error", echoKey);

    expect(ownTimeout.body).not.toBe(googleFailure.body);
  });
});
