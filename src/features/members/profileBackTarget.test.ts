import { describe, expect, it } from "vitest";
import { backLabelKeyFor, profileBackTarget } from "./profileBackTarget";
import type { NavEntry } from "../../app/navHistory";

const from = (pathname: string, search = ""): NavEntry => ({
  pathname,
  search,
  key: "k1",
});

const PROFILE = "/members/ana";

describe("profileBackTarget", () => {
  it("falls back to the directory when there is no previous entry", () => {
    // A shared link, a refresh, or a push notification: nothing came before.
    expect(profileBackTarget(null, PROFILE)).toEqual({
      mode: "link",
      to: "/members",
      labelKey: "profile.backToRoom",
    });
  });

  it("walks history back to the page the visitor came from", () => {
    expect(profileBackTarget(from("/communities/casa-trans"), PROFILE)).toEqual(
      {
        mode: "history",
        to: "/communities/casa-trans",
        labelKey: "profile.backTo.community",
      },
    );
  });

  it("keeps the origin's query string in the href", () => {
    // The href is what an open-in-new-tab reaches, so a filtered directory
    // must come back filtered.
    expect(
      profileBackTarget(from("/members", "?identity=trans"), PROFILE).to,
    ).toBe("/members?identity=trans");
  });

  it("falls back rather than offering a dead link to this same page", () => {
    expect(profileBackTarget(from(PROFILE), PROFILE).mode).toBe("link");
  });

  it("never offers an auth or system screen as a way back", () => {
    // Sign-in redirects the visitor onward; going "back" to it would bounce
    // them straight out of the profile they just landed on.
    expect(profileBackTarget(from("/auth/sign-in"), PROFILE).mode).toBe("link");
    expect(
      profileBackTarget(from("/system/account-locked"), PROFILE).mode,
    ).toBe("link");
  });
});

describe("backLabelKeyFor", () => {
  it("names the members directory the room, as it always has", () => {
    expect(backLabelKeyFor("/members")).toBe("profile.backToRoom");
  });

  it("does not call another member's profile the room", () => {
    // "/members/rui" and "/members/rui/design" are a profile and a persona,
    // not the roster.
    expect(backLabelKeyFor("/members/rui")).toBe("profile.backTo.generic");
    expect(backLabelKeyFor("/members/rui/design")).toBe(
      "profile.backTo.generic",
    );
  });

  it("distinguishes a section root from one item inside it", () => {
    expect(backLabelKeyFor("/forum")).toBe("profile.backTo.forum");
    expect(backLabelKeyFor("/forum/thread/pride-2026")).toBe(
      "profile.backTo.thread",
    );
    expect(backLabelKeyFor("/gatherings")).toBe("profile.backTo.gatherings");
    expect(backLabelKeyFor("/gatherings/supper-club")).toBe(
      "profile.backTo.gathering",
    );
  });

  it("matches on whole segments, never a shared string prefix", () => {
    expect(backLabelKeyFor("/events")).toBe("profile.backTo.events");
    expect(backLabelKeyFor("/eventsomething")).toBe("profile.backTo.generic");
  });

  it("names the homepage", () => {
    expect(backLabelKeyFor("/")).toBe("profile.backTo.home");
  });

  it("stays generic for anything unmapped", () => {
    expect(backLabelKeyFor("/account/badges")).toBe("profile.backTo.generic");
  });
});
