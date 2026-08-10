import { describe, expect, it } from "vitest";
import { isViewingTarget } from "./pushFocus";

describe("isViewingTarget", () => {
  it("matches when the focused window is on the exact same conversation", () => {
    expect(
      isViewingTarget(
        "https://app.example.com/messages?c=conv-1",
        "/messages?c=conv-1",
      ),
    ).toBe(true);
  });

  it("does not match a different conversation on the same page", () => {
    expect(
      isViewingTarget(
        "https://app.example.com/messages?c=conv-2",
        "/messages?c=conv-1",
      ),
    ).toBe(false);
  });

  it("does not match the bare conversation list (no conversation open)", () => {
    expect(
      isViewingTarget("https://app.example.com/messages", "/messages?c=conv-1"),
    ).toBe(false);
  });

  it("does not match a different page entirely", () => {
    expect(
      isViewingTarget("https://app.example.com/feed", "/messages?c=conv-1"),
    ).toBe(false);
  });

  it("does not match across a different origin", () => {
    expect(
      isViewingTarget(
        "https://evil.example/messages?c=conv-1",
        "/messages?c=conv-1",
      ),
    ).toBe(false);
  });

  it("resolves an absolute data URL the same way as a relative path", () => {
    expect(
      isViewingTarget(
        "https://app.example.com/messages?c=conv-1",
        "https://app.example.com/messages?c=conv-1",
      ),
    ).toBe(true);
  });

  it("returns false rather than throwing on a malformed client URL", () => {
    expect(isViewingTarget("not-a-url", "/messages?c=conv-1")).toBe(false);
  });

  it("returns false when either argument is empty", () => {
    expect(isViewingTarget("", "/messages?c=conv-1")).toBe(false);
    expect(isViewingTarget("https://app.example.com/messages", "")).toBe(false);
  });
});
