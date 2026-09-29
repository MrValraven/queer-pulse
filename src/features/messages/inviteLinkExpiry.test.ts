import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import { inviteLinkExpiryLabel } from "./inviteLinkExpiry";

/** Returns the key with any params appended as JSON, so each assertion
 *  checks exactly which key and count were resolved. */
const identityT: TFunction = (key, options) =>
  options && Object.keys(options).length > 0
    ? `${key}:${JSON.stringify(options)}`
    : key;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const NOW_MS = Date.parse("2026-09-29T12:00:00.000Z");
const isoIn = (offsetMs: number) => new Date(NOW_MS + offsetMs).toISOString();

describe("inviteLinkExpiryLabel (PRD-400)", () => {
  it("reads a link reset a moment ago as 7 days", () => {
    expect(
      inviteLinkExpiryLabel(isoIn(7 * DAY_MS - 5000), NOW_MS, identityT),
    ).toEqual({
      text: 'messages:group.inviteLink.expiresInDays:{"count":7}',
      isExpired: false,
    });
  });

  it("rounds whole days to the nearest", () => {
    expect(
      inviteLinkExpiryLabel(isoIn(6 * DAY_MS + 3 * HOUR_MS), NOW_MS, identityT)
        ?.text,
    ).toBe('messages:group.inviteLink.expiresInDays:{"count":6}');
    expect(inviteLinkExpiryLabel(isoIn(DAY_MS), NOW_MS, identityT)?.text).toBe(
      'messages:group.inviteLink.expiresInDays:{"count":1}',
    );
  });

  it("switches to hours under a day", () => {
    expect(
      inviteLinkExpiryLabel(
        isoIn(5 * HOUR_MS + 10 * 60 * 1000),
        NOW_MS,
        identityT,
      )?.text,
    ).toBe('messages:group.inviteLink.expiresInHours:{"count":5}');
    expect(
      inviteLinkExpiryLabel(isoIn(DAY_MS - 1000), NOW_MS, identityT)?.text,
    ).toBe('messages:group.inviteLink.expiresInHours:{"count":24}');
  });

  it("says under an hour for the final hour", () => {
    expect(
      inviteLinkExpiryLabel(isoIn(20 * 60 * 1000), NOW_MS, identityT),
    ).toEqual({
      text: "messages:group.inviteLink.expiresSoon",
      isExpired: false,
    });
  });

  it("marks a link at or past its instant as expired", () => {
    expect(inviteLinkExpiryLabel(isoIn(0), NOW_MS, identityT)).toEqual({
      text: "messages:group.inviteLink.expired",
      isExpired: true,
    });
    expect(
      inviteLinkExpiryLabel(isoIn(-3 * DAY_MS), NOW_MS, identityT)?.isExpired,
    ).toBe(true);
  });

  it("shows no line without a usable expiry", () => {
    expect(inviteLinkExpiryLabel(null, NOW_MS, identityT)).toBeNull();
    expect(inviteLinkExpiryLabel(undefined, NOW_MS, identityT)).toBeNull();
    expect(inviteLinkExpiryLabel("not-a-date", NOW_MS, identityT)).toBeNull();
  });
});
