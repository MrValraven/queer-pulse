import { describe, expect, it } from "vitest";
import { reauthErrorKey, reauthErrorMessage } from "./reauthErrorMessage";

describe("reauthErrorKey (PRD-502)", () => {
  it.each([
    ["access_denied", "settings:reauth.completion.cancelled"],
    ["invalid_state", "settings:reauth.completion.timedOut"],
    ["reauth_session_expired", "settings:reauth.completion.sessionExpired"],
    ["reauth_account_mismatch", "settings:reauth.completion.wrongAccount"],
    ["admin_policy_enforced", "settings:reauth.completion.adminPolicy"],
    ["server_error", "settings:reauth.completion.googleServerError"],
    ["temporarily_unavailable", "settings:reauth.completion.googleUnavailable"],
    ["no_email", "settings:reauth.completion.noEmail"],
    ["email_unverified", "settings:reauth.completion.emailUnverified"],
    ["unauthorized_client", "settings:reauth.completion.googleSetup"],
  ])("names the cause behind %s", (code, key) => {
    expect(reauthErrorKey(code)).toBe(key);
  });

  it.each(["oauth_failed", "reauth_failed", "constructor", "", "<script>"])(
    "uses the general line for %j",
    (code) => {
      expect(reauthErrorKey(code)).toBe("settings:reauth.completion.failed");
    },
  );

  it("translates the key it picked", () => {
    expect(reauthErrorMessage("access_denied", (key) => `t(${key})`)).toBe(
      "t(settings:reauth.completion.cancelled)",
    );
  });
});
