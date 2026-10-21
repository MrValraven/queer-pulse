import { describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import { gatheringPath } from "../../gatherings/data";
import { manageGatheringPath } from "../../gatherings/gatheringPaths";
import { gatheringInviteSourceHref } from "./gatheringInviteHrefs";

describe("member invite hrefs", () => {
  it("event_invite opens My Events", () => {
    expect(
      gatheringInviteSourceHref({ source: "event_invite", eventSlug: "x" }),
    ).toBe(routes.myEvents);
  });

  it("member_invite_request opens Manage on Attendees", () => {
    expect(
      gatheringInviteSourceHref({
        source: "member_invite_request",
        eventSlug: "x",
      }),
    ).toBe(manageGatheringPath("x", "attendees"));
  });

  it("member_invite_reply opens the event", () => {
    expect(
      gatheringInviteSourceHref({
        source: "member_invite_reply",
        eventSlug: "x",
      }),
    ).toBe(gatheringPath("x"));
  });

  it("a missing eventSlug builds no link", () => {
    expect(
      gatheringInviteSourceHref({ source: "member_invite_request" }),
    ).toBeUndefined();
    expect(
      gatheringInviteSourceHref({ source: "member_invite_reply" }),
    ).toBeUndefined();
  });
});
