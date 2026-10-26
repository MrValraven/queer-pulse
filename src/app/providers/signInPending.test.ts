import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PREPARING_KEY,
  completeEmailCodeSignIn,
  consumeSignInPending,
  markSignInPending,
} from "./signInPending";

const originalLocation = window.location;

afterEach(() => {
  window.sessionStorage.removeItem(PREPARING_KEY);
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("signInPending", () => {
  it("marks then consumes the pending flag once", () => {
    markSignInPending();
    expect(consumeSignInPending()).toBe(true);
    expect(consumeSignInPending()).toBe(false);
  });

  it("completeEmailCodeSignIn marks pending and assigns the redirect", () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, assign },
    });

    completeEmailCodeSignIn("https://queerpulse.com/feed");

    expect(window.sessionStorage.getItem("qp.auth.preparing")).toBe("1");
    expect(assign).toHaveBeenCalledWith("https://queerpulse.com/feed");
  });
});
