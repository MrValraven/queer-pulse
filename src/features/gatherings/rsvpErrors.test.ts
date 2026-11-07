import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";
import {
  rsvpDetailsSaveErrorMessage,
  rsvpErrorMessage,
  rsvpInviteSendErrorMessage,
} from "./rsvpErrors";

const echoKey: TFunction = (key, options) =>
  options ? `${key} ${JSON.stringify(options)}` : key;
const offline = new TypeError("Failed to fetch");

describe("rsvpErrorMessage", () => {
  it.each([
    ["Event is not open for RSVPs", "gatherings:rsvpControl.notOpenToast"],
    ["This event has already happened", "gatherings:rsvpControl.endedToast"],
    ["This event is full", "gatherings:rsvpControl.fullToast"],
    [
      "The host is always going to their own event",
      "gatherings:actionError.hostAlwaysGoing",
    ],
    ["RSVPs for this event have closed", "gatherings:rsvpControl.closedToast"],
  ])("names the 400 %j", (sentence, key) => {
    expect(rsvpErrorMessage(new ApiError(400, sentence), echoKey, "pt")).toBe(
      key,
    );
  });

  it("says the host removed you for a plain 403", () => {
    expect(
      rsvpErrorMessage(
        new ApiError(403, "The host has removed you from this event"),
        echoKey,
        "en",
      ),
    ).toBe("gatherings:rsvpControl.refusedToast");
  });

  it("names a restriction instead of a host removal for the coded 403", () => {
    expect(
      rsvpErrorMessage(
        new ApiError(403, "Restricted", { code: "ACCOUNT_RESTRICTED" }),
        echoKey,
        "en",
      ),
    ).toBe("shared:apiError.accountRestricted");
  });

  it("says the event is gone for a 404", () => {
    expect(
      rsvpErrorMessage(new ApiError(404, "Event not found"), echoKey, "en"),
    ).toBe("gatherings:rsvpControl.goneToast");
  });

  it("gives an English reader the server's sentence for an unknown 400", () => {
    expect(
      rsvpErrorMessage(new ApiError(400, "Something specific"), echoKey, "en"),
    ).toBe("Something specific");
  });

  it("gives another language the shared invalid-details line for an unknown 400", () => {
    expect(
      rsvpErrorMessage(new ApiError(400, "Something specific"), echoKey, "pt"),
    ).toBe("shared:apiError.reasonInvalid");
  });

  it("falls back to the shared lines", () => {
    expect(rsvpErrorMessage(offline, echoKey, "en")).toBe(
      "shared:apiError.noConnection",
    );
    expect(rsvpErrorMessage(new ApiError(429, "x"), echoKey, "en")).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(rsvpErrorMessage(new ApiError(502, "x"), echoKey, "en")).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("rsvpDetailsSaveErrorMessage", () => {
  it("names the guest cap, the seats left and a missing RSVP", () => {
    expect(
      rsvpDetailsSaveErrorMessage(
        new ApiError(400, "You can bring up to 3 people on one RSVP"),
        echoKey,
      ),
    ).toBe('gatherings:rsvpInvites.capToast {"max":3}');
    expect(
      rsvpDetailsSaveErrorMessage(
        new ApiError(400, "There is not enough room left for that many guests"),
        echoKey,
      ),
    ).toBe("gatherings:rsvpDetails.notEnoughRoomToast");
    expect(
      rsvpDetailsSaveErrorMessage(
        new ApiError(404, "You do not have an active RSVP to this event"),
        echoKey,
      ),
    ).toBe("gatherings:rsvpDetails.noActiveRsvpToast");
  });

  it("falls back to the shared lines", () => {
    expect(rsvpDetailsSaveErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
  });
});

describe("rsvpInviteSendErrorMessage", () => {
  it("names an unpublished or finished event and a member without an RSVP", () => {
    expect(
      rsvpInviteSendErrorMessage(
        new ApiError(400, "Only a published event can send invites"),
        echoKey,
      ),
    ).toBe("gatherings:actionError.notPublished");
    expect(
      rsvpInviteSendErrorMessage(
        new ApiError(400, "This event has already happened"),
        echoKey,
      ),
    ).toBe("gatherings:rsvpControl.endedToast");
    expect(
      rsvpInviteSendErrorMessage(
        new ApiError(403, "RSVP going or maybe to invite your connections"),
        echoKey,
      ),
    ).toBe("gatherings:rsvpInvites.needRsvpToast");
  });

  it("names the cutoff and falls back to the shared lines", () => {
    expect(
      rsvpInviteSendErrorMessage(
        new ApiError(400, "RSVPs for this event have closed"),
        echoKey,
      ),
    ).toBe("gatherings:rsvpControl.closedToast");
    expect(rsvpInviteSendErrorMessage(new ApiError(429, "x"), echoKey)).toBe(
      "shared:apiError.reasonRateLimited",
    );
  });
});
