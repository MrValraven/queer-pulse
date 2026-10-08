import { describe, expect, it } from "vitest";
import { eventKeys } from "../api/eventKeys";
import { parseGuestPreviewRole, resolveGuestPreviewRole } from "./guestPreview";

describe("parseGuestPreviewRole", () => {
  it.each(["member", "going", "waitlisted"] as const)("reads %s", (role) => {
    expect(parseGuestPreviewRole(role)).toBe(role);
  });

  it.each(["host", "", "GOING", null])("reads %p as no preview", (value) => {
    expect(parseGuestPreviewRole(value)).toBeNull();
  });
});

describe("guest preview query keys", () => {
  it("never share a prefix with the host's real detail or lineup", () => {
    const preview = eventKeys.detailPreview("party", "going", false);
    const lineupPreview = eventKeys.lineupPreview("party", "going", false);
    expect(preview[0]).not.toBe(eventKeys.detailRoot[0]);
    expect(lineupPreview[0]).not.toBe(eventKeys.lineupRoot[0]);
  });

  it("keeps each perspective apart", () => {
    expect(eventKeys.detailPreview("party", "member", false)).not.toEqual(
      eventKeys.detailPreview("party", "going", false),
    );
  });
});

describe("resolveGuestPreviewRole", () => {
  it("previews for an organiser in live mode", () => {
    expect(
      resolveGuestPreviewRole({
        isDemoMode: false,
        isViewerOrganizer: true,
        requestedViewAs: "going",
      }),
    ).toBe("going");
  });

  it("ignores the param for a non-organiser", () => {
    expect(
      resolveGuestPreviewRole({
        isDemoMode: false,
        isViewerOrganizer: false,
        requestedViewAs: "going",
      }),
    ).toBeNull();
  });

  it("ignores the param in demo mode", () => {
    expect(
      resolveGuestPreviewRole({
        isDemoMode: true,
        isViewerOrganizer: true,
        requestedViewAs: "going",
      }),
    ).toBeNull();
  });

  it("ignores an unknown value", () => {
    expect(
      resolveGuestPreviewRole({
        isDemoMode: false,
        isViewerOrganizer: true,
        requestedViewAs: "host",
      }),
    ).toBeNull();
  });

  it("ignores a missing value", () => {
    expect(
      resolveGuestPreviewRole({
        isDemoMode: false,
        isViewerOrganizer: true,
        requestedViewAs: null,
      }),
    ).toBeNull();
  });
});
