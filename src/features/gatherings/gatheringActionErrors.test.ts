import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";
import {
  actionCauseCopy,
  causeFallbackMessage,
  hostToolErrorCopy,
  hostToolErrorMessage,
  inviteRequestErrorMessage,
  inviteWithdrawErrorMessage,
  photoAttachErrorMessage,
  photoRemoveErrorMessage,
  rsvpCancelErrorMessage,
  sentenceCauseKey,
  sharePlansErrorMessage,
  type SentenceCause,
} from "./gatheringActionErrors";

/** Echoes the key (and values) so a test reads which catalog line was chosen. */
const echoKey: TFunction = (key, options) =>
  options ? `${key} ${JSON.stringify(options)}` : key;

const offline = new TypeError("Failed to fetch");

describe("sentenceCauseKey", () => {
  const causes: readonly SentenceCause[] = [
    { status: 400, sentence: "Write something", key: "x:empty" },
  ];

  it("matches the status and a fragment of the sentence, ignoring case", () => {
    expect(
      sentenceCauseKey(new ApiError(400, "WRITE SOMETHING to send"), causes),
    ).toBe("x:empty");
  });

  it("does not match another status or another sentence", () => {
    expect(sentenceCauseKey(new ApiError(409, "Write something"), causes)).toBe(
      null,
    );
    expect(sentenceCauseKey(new ApiError(400, "Nope"), causes)).toBe(null);
  });

  it("never matches a value that is not an ApiError", () => {
    expect(sentenceCauseKey(offline, causes)).toBe(null);
  });
});

describe("actionCauseCopy", () => {
  it("falls back to the shared cause with the given overrides", () => {
    expect(
      actionCauseCopy(new ApiError(404, "Event not found"), [], {
        404: "x:gone",
      }),
    ).toEqual({ key: "x:gone" });
    expect(actionCauseCopy(new ApiError(500, "boom"), [])).toEqual({
      key: "shared:apiError.serverFault",
    });
  });
});

describe("hostToolErrorMessage", () => {
  it.each([
    ["Only a published event can send invites", "notPublished"],
    ["Write something to send", "announceEmpty"],
    ["That member is not on the waitlist", "notOnWaitlist"],
    ["The event is at capacity", "atCapacity"],
    ["You cannot bar yourself", "cannotBanYourself"],
    ["The host cannot be barred from their own event", "cannotBanHost"],
    ["Remove them as a co-host first, then bar them", "cannotBanCohost"],
    ["The host is always going to their own event", "hostSeatHeld"],
  ])("names the 400 %j", (sentence, keySuffix) => {
    expect(hostToolErrorMessage(new ApiError(400, sentence), echoKey)).toBe(
      `gatherings:actionError.${keySuffix}`,
    );
  });

  it("names a non-organiser for the 403", () => {
    expect(
      hostToolErrorMessage(
        new ApiError(403, "Only the host or a co-host can do that"),
        echoKey,
      ),
    ).toBe("gatherings:actionError.hostOnly");
  });

  it("keeps a restriction and an inactive membership ahead of the 403 line", () => {
    expect(
      hostToolErrorCopy(
        new ApiError(403, "Restricted", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toEqual({ key: "shared:apiError.accountRestricted" });
    expect(
      hostToolErrorCopy(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toEqual({ key: "shared:apiError.notActive" });
  });

  it("falls back to the shared lines", () => {
    expect(hostToolErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(hostToolErrorMessage(new ApiError(429, "Too Many"), echoKey)).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(
      hostToolErrorMessage(new ApiError(404, "Event not found"), echoKey),
    ).toBe("shared:apiError.notFound");
    expect(hostToolErrorMessage(new ApiError(503, "down"), echoKey)).toBe(
      "shared:apiError.serverFault",
    );
    expect(hostToolErrorMessage(new ApiError(418, "teapot"), echoKey)).toBe(
      'shared:apiError.refused {"status":418}',
    );
  });
});

describe("inviteRequestErrorMessage", () => {
  it("names a request that was already answered for the 409", () => {
    expect(
      inviteRequestErrorMessage(
        new ApiError(409, "This request can no longer be approved"),
        echoKey,
      ),
    ).toBe("gatherings:actionError.requestNotOpen");
  });

  it("keeps the host-only 403 and the shared fallbacks", () => {
    expect(inviteRequestErrorMessage(new ApiError(403, "x"), echoKey)).toBe(
      "gatherings:actionError.hostOnly",
    );
    expect(inviteRequestErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
  });
});

describe("rsvpCancelErrorMessage", () => {
  it("says the host cannot cancel the seat they always hold", () => {
    expect(
      rsvpCancelErrorMessage(
        new ApiError(400, "The host is always going to their own event"),
        echoKey,
      ),
    ).toBe("gatherings:actionError.hostAlwaysGoing");
  });

  it("says the event is gone for a 404", () => {
    expect(
      rsvpCancelErrorMessage(new ApiError(404, "Event not found"), echoKey),
    ).toBe("gatherings:rsvpControl.goneToast");
  });

  it("falls back to the shared lines", () => {
    expect(rsvpCancelErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(rsvpCancelErrorMessage(new ApiError(500, "x"), echoKey)).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("inviteWithdrawErrorMessage", () => {
  it("says the invite is no longer open for the 409", () => {
    expect(
      inviteWithdrawErrorMessage(
        new ApiError(409, "This invite is no longer open"),
        echoKey,
      ),
    ).toBe("gatherings:rsvpInvites.withdrawNotOpenToast");
  });

  it("falls back to the shared lines", () => {
    expect(inviteWithdrawErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(inviteWithdrawErrorMessage(new ApiError(404, "x"), echoKey)).toBe(
      "shared:apiError.notFound",
    );
  });
});

describe("sharePlansErrorMessage", () => {
  it("names a missing connection by its machine code", () => {
    expect(
      sharePlansErrorMessage(
        new ApiError(
          403,
          "You can only start a conversation with accepted connections",
          {
            code: "CONVERSATION_REQUIRES_CONNECTION",
          },
        ),
        echoKey,
      ),
    ).toBe("gatherings:sharePlans.errorNotConnected");
  });

  it("names a refused conversation for the uncoded 403", () => {
    expect(
      sharePlansErrorMessage(
        new ApiError(403, "You cannot start a conversation with this member"),
        echoKey,
      ),
    ).toBe("gatherings:sharePlans.errorCannotMessage");
  });

  it("keeps a restriction ahead of the 403 line and falls back to the shared lines", () => {
    expect(
      sharePlansErrorMessage(
        new ApiError(403, "Restricted", { code: "ACCOUNT_RESTRICTED" }),
        echoKey,
      ),
    ).toBe("shared:apiError.accountRestricted");
    expect(sharePlansErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(sharePlansErrorMessage(new ApiError(429, "x"), echoKey)).toBe(
      "shared:apiError.reasonRateLimited",
    );
  });
});

describe("photo errors", () => {
  it("names who may remove a photo, and a photo already gone", () => {
    expect(
      photoRemoveErrorMessage(
        new ApiError(403, "You cannot remove this photo"),
        echoKey,
      ),
    ).toBe("gatherings:photos.removeNotAllowed");
    expect(
      photoRemoveErrorMessage(new ApiError(404, "Photo not found"), echoKey),
    ).toBe("gatherings:photos.removeGone");
    expect(photoRemoveErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
  });

  it("names who may add a photo, and a photo that cannot be attached", () => {
    expect(
      photoAttachErrorMessage(
        new ApiError(403, "Only organizers can add event photos"),
        echoKey,
      ),
    ).toBe("gatherings:photos.attachHostOnly");
    expect(
      photoAttachErrorMessage(
        new ApiError(409, "This photo is already attached to another event"),
        echoKey,
      ),
    ).toBe("gatherings:photos.attachConflict");
    expect(photoAttachErrorMessage(new ApiError(500, "x"), echoKey)).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("causeFallbackMessage", () => {
  it("names the shared cause", () => {
    expect(causeFallbackMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(causeFallbackMessage(new ApiError(408, "x"), echoKey)).toBe(
      "shared:apiError.timedOut",
    );
  });
});
