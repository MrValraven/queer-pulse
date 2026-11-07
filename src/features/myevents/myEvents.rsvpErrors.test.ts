import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";
import {
  acceptInviteErrorMessage,
  isInviteNoLongerOpenError,
  myEventsActionErrorMessage,
  rsvpDetailsSaveErrorMessage,
} from "./myEvents.rsvpErrors";

const echoKey: TFunction = (key, options) =>
  options ? `${key} ${JSON.stringify(options)}` : key;
const offline = new TypeError("Failed to fetch");

describe("acceptInviteErrorMessage", () => {
  it("says the event was cancelled for that 409, ahead of the generic 409", () => {
    expect(
      acceptInviteErrorMessage(
        new ApiError(409, "This event has been cancelled"),
        echoKey,
      ),
    ).toBe("myevents:acceptModal.eventCancelledToast");
  });

  it("says the invite is no longer open for any other 409", () => {
    expect(
      acceptInviteErrorMessage(
        new ApiError(409, "This invite has already been answered"),
        echoKey,
      ),
    ).toBe("myevents:acceptModal.noLongerOpenToast");
    expect(
      isInviteNoLongerOpenError(
        new ApiError(409, "This event has been cancelled"),
      ),
    ).toBe(true);
  });

  it("names the other known refusals", () => {
    expect(
      acceptInviteErrorMessage(
        new ApiError(403, "This invite is not addressed to you"),
        echoKey,
      ),
    ).toBe("myevents:acceptModal.notYoursToast");
    expect(
      acceptInviteErrorMessage(
        new ApiError(400, "Choose who can see you are going"),
        echoKey,
      ),
    ).toBe("myevents:acceptModal.chooseVisibilityToast");
    expect(
      acceptInviteErrorMessage(
        new ApiError(400, "This event is full"),
        echoKey,
      ),
    ).toBe("myevents:acceptModal.fullToast");
    expect(
      acceptInviteErrorMessage(
        new ApiError(400, "RSVPs for this event have closed"),
        echoKey,
      ),
    ).toBe("myevents:rsvpModal.closedToast");
  });

  it("falls back to the shared cause lines", () => {
    expect(acceptInviteErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(
      acceptInviteErrorMessage(new ApiError(404, "Invite not found"), echoKey),
    ).toBe("shared:apiError.notFound");
    expect(acceptInviteErrorMessage(new ApiError(500, "x"), echoKey)).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("rsvpDetailsSaveErrorMessage", () => {
  it("says the cutoff and the cap in My Events' own copy", () => {
    expect(
      rsvpDetailsSaveErrorMessage(
        new ApiError(400, "RSVPs for this event have closed"),
        echoKey,
      ),
    ).toBe("myevents:rsvpModal.closedToast");
    expect(
      rsvpDetailsSaveErrorMessage(
        new ApiError(400, "You can bring up to 3 people on one RSVP"),
        echoKey,
      ),
    ).toBe('gatherings:rsvpInvites.capToast {"max":3}');
  });

  it("falls back to the event page's refusals and the shared lines", () => {
    expect(
      rsvpDetailsSaveErrorMessage(
        new ApiError(404, "You do not have an active RSVP to this event"),
        echoKey,
      ),
    ).toBe("gatherings:rsvpDetails.noActiveRsvpToast");
    expect(rsvpDetailsSaveErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
  });
});

describe("myEventsActionErrorMessage", () => {
  it("names the shared cause", () => {
    expect(myEventsActionErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(myEventsActionErrorMessage(new ApiError(401, "x"), echoKey)).toBe(
      "shared:apiError.signedOut",
    );
    expect(myEventsActionErrorMessage(new ApiError(418, "x"), echoKey)).toBe(
      'shared:apiError.refused {"status":418}',
    );
  });
});
