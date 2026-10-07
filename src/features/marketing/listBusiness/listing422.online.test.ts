import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";
import { ANCHOR } from "./listBusiness.data";
import { resolveListing422 } from "./listing422";

const t: TFunction = (key) => key;
const english = { t, language: "en" };

describe("resolveListing422 for online listings", () => {
  it("routes a missing main link to the main link on the practical step", () => {
    const error = new ApiError(400, "Bad Request", {
      message: ["onlineDetails.mainLink is required"],
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 3,
      anchor: ANCHOR.mainLink,
      message: "onlineDetails.mainLink is required",
    });
  });

  it("routes an online sub-field by its second path segment", () => {
    const error = new ApiError(400, "Bad Request", {
      message: [
        "onlineDetails.pickupNote must be shorter than or equal to 140 characters",
      ],
    });
    expect(resolveListing422(error, english)?.anchor).toBe(ANCHOR.pickupNote);
  });

  it("routes the claim-path delivery rule to how people get it", () => {
    const error = new ApiError(400, "Bad Request", {
      message:
        "Claiming a listing requires a way people get it (a delivery option or a session format).",
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 3,
      anchor: ANCHOR.fulfilment,
    });
  });

  it("routes a category the kind does not offer to the categories", () => {
    const error = new ApiError(400, "Bad Request", {
      message: 'Category "nightlife" is not offered to online listings',
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 1,
      anchor: ANCHOR.cats,
    });
  });

  it("routes adult_terms_required to the acknowledgement with its own copy", () => {
    for (const data of [
      // The shape the backend sends (coordinator decision d); the other two
      // keep the routing safe if a pipe ever flattens it.
      {
        statusCode: 400,
        error: "Bad Request",
        code: "adult_terms_required",
        message: "Accept the 18+ terms",
      },
      { message: "adult_terms_required" },
      { message: ["adult_terms_required"] },
    ]) {
      expect(
        resolveListing422(new ApiError(400, "Bad Request", data), english),
      ).toMatchObject({
        step: 1,
        anchor: ANCHOR.adultTerms,
        message: "marketing:listBusiness.server.adultTermsRequired",
      });
    }
  });

  it("routes a shop item to the priced list", () => {
    const error = new ApiError(400, "Bad Request", {
      message: [
        "shopItems.0.name must be shorter than or equal to 60 characters",
      ],
    });
    expect(resolveListing422(error, english)?.anchor).toBe(ANCHOR.services);
  });

  it("routes the online answer to step 0 on a create and to the toggle on an edit", () => {
    const error = new ApiError(400, "Bad Request", {
      message: ["online must be a boolean value"],
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 0,
      anchor: ANCHOR.whereFound,
    });
    expect(resolveListing422(error, english, { isEdit: true })).toMatchObject({
      step: 1,
      anchor: ANCHOR.online,
    });
  });

  it("routes unknown tags to the tag field on the story step", () => {
    const error = new ApiError(400, "Bad Request", {
      message:
        'Unknown listing tags: "Ships worldwide". Pick tags from GET /directory/tags.',
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 2,
      anchor: ANCHOR.tags,
      message:
        'Unknown listing tags: "Ships worldwide". Pick tags from GET /directory/tags.',
    });
  });
});
