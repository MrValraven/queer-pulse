import { describe, expect, it } from "vitest";
import { isPrivateObservabilityUrl } from "./sentry";

describe("email code sign-in observability", () => {
  it("treats every email-code route as private", () => {
    const routes = [
      "https://api.queerpulse.com/auth/email-code/request",
      "https://api.queerpulse.com/auth/email-code/verify",
      "https://api.queerpulse.com/auth/email-code/reauth/request",
      "https://api.queerpulse.com/auth/email-code/reauth/verify",
    ];
    for (const route of routes) {
      expect(isPrivateObservabilityUrl(route)).toBe(true);
    }
  });

  it("leaves the sign-in page itself alone", () => {
    expect(
      isPrivateObservabilityUrl("https://queerpulse.com/auth/sign-in"),
    ).toBe(false);
  });
});
