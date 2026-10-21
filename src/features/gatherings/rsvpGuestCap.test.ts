import { describe, expect, it } from "vitest";
import {
  MAX_RSVP_GUESTS,
  guestStepperMax,
  remainingInviteSlots,
} from "./rsvpGuestCap";

describe("MAX_RSVP_GUESTS", () => {
  it("matches the backend cap of 3", () => {
    expect(MAX_RSVP_GUESTS).toBe(3);
  });
});

describe("guestStepperMax", () => {
  it("offers the whole cap with nothing saved and no open invites", () => {
    expect(
      guestStepperMax({
        savedGuestCount: 0,
        openInviteCount: 0,
        isRaiseClosed: false,
      }),
    ).toBe(3);
  });

  it("takes open invites out of the cap", () => {
    expect(
      guestStepperMax({
        savedGuestCount: 0,
        openInviteCount: 2,
        isRaiseClosed: false,
      }),
    ).toBe(1);
  });

  it("keeps a saved count that open invites would otherwise squeeze", () => {
    expect(
      guestStepperMax({
        savedGuestCount: 2,
        openInviteCount: 2,
        isRaiseClosed: false,
      }),
    ).toBe(2);
  });

  it("keeps a saved count above the cap", () => {
    expect(
      guestStepperMax({
        savedGuestCount: 5,
        openInviteCount: 0,
        isRaiseClosed: false,
      }),
    ).toBe(5);
  });

  it("caps at the saved count once raising has closed", () => {
    expect(
      guestStepperMax({
        savedGuestCount: 1,
        openInviteCount: 0,
        isRaiseClosed: true,
      }),
    ).toBe(1);
  });

  it("offers no guests when open invites fill the cap", () => {
    expect(
      guestStepperMax({
        savedGuestCount: 0,
        openInviteCount: 3,
        isRaiseClosed: false,
      }),
    ).toBe(0);
  });
});

describe("remainingInviteSlots", () => {
  it("leaves the whole cap with no guests and no open invites", () => {
    expect(
      remainingInviteSlots({
        savedGuestCount: 0,
        currentGuestCount: 0,
        openInviteCount: 0,
      }),
    ).toBe(3);
  });

  it("reads the larger of the saved and current guest counts", () => {
    expect(
      remainingInviteSlots({
        savedGuestCount: 3,
        currentGuestCount: 1,
        openInviteCount: 0,
      }),
    ).toBe(0);
  });

  it("counts guests and open invites together", () => {
    expect(
      remainingInviteSlots({
        savedGuestCount: 1,
        currentGuestCount: 2,
        openInviteCount: 1,
      }),
    ).toBe(0);
  });

  it("never goes below 0", () => {
    expect(
      remainingInviteSlots({
        savedGuestCount: 5,
        currentGuestCount: 5,
        openInviteCount: 2,
      }),
    ).toBe(0);
  });
});
