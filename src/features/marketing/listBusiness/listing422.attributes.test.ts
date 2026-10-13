import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";
import { ANCHOR } from "./listBusiness.data";
import { resolveListing422 } from "./listing422";

const t: TFunction = (key) => key;
const english = { t, language: "en" };

function routed(message: string) {
  return resolveListing422(
    new ApiError(400, "Bad Request", { message: [message] }),
    english,
  );
}

describe("resolveListing422 for the attribute fields", () => {
  it("routes the attribute checks to the picker on the story step", () => {
    for (const message of [
      'Unknown listing attributes: "rooftop-pool". Pick from GET /directory/attributes.',
      'Attribute "dj-nights" is not offered to this listing.',
    ]) {
      expect(routed(message), message).toMatchObject({
        step: 2,
        anchor: ANCHOR.attributes,
        message,
      });
    }
  });

  it("routes the highlight checks to the highlights", () => {
    for (const message of [
      'Highlight "live-music" is not one of this listing\'s attributes.',
      '"sexual-health-prep" cannot be a highlight.',
    ]) {
      expect(routed(message)?.anchor, message).toBe(ANCHOR.highlights);
    }
  });

  it("routes a practice outside its scope to the practices", () => {
    expect(
      routed('Practice "named-contact" is not offered to this listing.'),
    ).toMatchObject({ step: 2, anchor: ANCHOR.inclusionPractices });
  });

  it("routes both policy link errors to the link field", () => {
    for (const message of [
      "saferSpacePolicyUrl is required when safer-space-policy is set.",
      "saferSpacePolicyUrl must be at most 300 characters once https:// is added.",
    ]) {
      expect(routed(message), message).toMatchObject({
        step: 2,
        anchor: ANCHOR.saferSpacePolicyUrl,
      });
    }
  });

  it("routes the free-before time and the practical fields to the practical step", () => {
    for (const message of [
      "coverFreeBefore is required when coverPolicy is freeBefore.",
      "coverFreeBefore must be a 24-hour time such as 23:00",
    ]) {
      expect(routed(message), message).toMatchObject({
        step: 3,
        anchor: ANCHOR.coverFreeBefore,
      });
    }
    expect(
      routed(
        "entryMode must be one of the following values: walkIn, bookingRecommended, appointmentOnly, membersOnly",
      ),
    ).toMatchObject({ step: 3, anchor: ANCHOR.entryMode });
    expect(routed("issuesNifInvoices must be a boolean value")).toMatchObject({
      step: 3,
      anchor: ANCHOR.nifInvoices,
    });
  });

  it("routes a check run on each item of a list by the property after its opening words", () => {
    expect(
      routed(
        "each value in payments must be one of the following values: card, mbway, multibanco, cash",
      ),
    ).toMatchObject({ step: 3, anchor: ANCHOR.waysToPay });
    expect(
      routed("each value in langs must be one of the following values: pt, en"),
    ).toMatchObject({ step: 2, anchor: ANCHOR.langs });
    expect(
      routed(
        "each value in attributes must be shorter than or equal to 40 characters",
      ),
    ).toMatchObject({ step: 2, anchor: ANCHOR.attributes });
    expect(
      routed(
        "each value in inclusionPractices must be one of the following values: chosen-name",
      ),
    ).toMatchObject({ step: 2, anchor: ANCHOR.inclusionPractices });
  });

  it("routes the list size checks and the other languages by their property", () => {
    expect(
      routed("highlights must contain no more than 3 elements"),
    ).toMatchObject({ step: 2, anchor: ANCHOR.highlights });
    expect(
      routed("langsOther must be shorter than or equal to 80 characters"),
    ).toMatchObject({ step: 2, anchor: ANCHOR.langsOther });
  });

  it("routes a rule sentence sent as one plain string, the way the service throws it", () => {
    const error = new ApiError(400, "Bad Request", {
      message: 'Attribute "dj-nights" is not offered to this listing.',
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 2,
      anchor: ANCHOR.attributes,
      message: 'Attribute "dj-nights" is not offered to this listing.',
    });
  });

  it("keeps the online payments on their own field", () => {
    expect(
      routed("onlineDetails.payments must contain no more than 6 elements"),
    ).toMatchObject({ step: 3, anchor: ANCHOR.payments });
  });
});
