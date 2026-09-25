import { describe, expect, it } from "vitest";
import { inAppPathForHref, isPlainLeftClick } from "./inAppLinks";

describe("inAppPathForHref", () => {
  it("returns the route for a QueerPulse link, query and hash included", () => {
    expect(
      inAppPathForHref("https://queerpulse.com/communities/x?tab=posts#top"),
    ).toBe("/communities/x?tab=posts#top");
    expect(inAppPathForHref("https://www.queerpulse.com/messages")).toBe(
      "/messages",
    );
  });

  it("treats the host the app is served from as QueerPulse", () => {
    expect(inAppPathForHref(`${window.location.origin}/gatherings`)).toBe(
      "/gatherings",
    );
  });

  it("returns null for an external, malformed or static-file link", () => {
    expect(inAppPathForHref("https://example.com/communities")).toBeNull();
    expect(inAppPathForHref("not a url")).toBeNull();
    expect(inAppPathForHref("https://queerpulse.com/robots.txt")).toBeNull();
  });

  it("returns null for a QueerPulse host carrying credentials", () => {
    expect(inAppPathForHref("https://user@queerpulse.com/messages")).toBeNull();
  });
});

describe("isPlainLeftClick", () => {
  const plainClick = {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  };

  it("accepts a primary-button click with no modifier", () => {
    expect(isPlainLeftClick(plainClick)).toBe(true);
  });

  it("rejects a modified click or a non-primary button", () => {
    expect(isPlainLeftClick({ ...plainClick, metaKey: true })).toBe(false);
    expect(isPlainLeftClick({ ...plainClick, ctrlKey: true })).toBe(false);
    expect(isPlainLeftClick({ ...plainClick, shiftKey: true })).toBe(false);
    expect(isPlainLeftClick({ ...plainClick, altKey: true })).toBe(false);
    expect(isPlainLeftClick({ ...plainClick, button: 1 })).toBe(false);
  });
});
