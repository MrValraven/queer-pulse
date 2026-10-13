import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";
import { ANCHOR } from "./listBusiness.data";
import { resolveListing422 } from "./listing422";

const t: TFunction = (key) => key;
const english = { t, language: "en" };

describe("resolveListing422 for the cover photo", () => {
  it("routes a refused cover to the cover slot", () => {
    const error = new ApiError(422, "Unprocessable Entity", {
      errors: [
        {
          property: "coverPhoto.image",
          message: "coverPhoto.image must be an image reference",
        },
      ],
    });
    expect(resolveListing422(error, english)).toEqual(
      expect.objectContaining({
        step: 4,
        anchor: ANCHOR.cover,
        photoSlots: ["cover"],
      }),
    );
  });

  it("routes the class-validator sentence the same way", () => {
    const error = new ApiError(400, "Bad Request", {
      message: ["coverPhoto.image must be an image reference"],
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 4,
      anchor: ANCHOR.cover,
      message: "coverPhoto.image must be an image reference",
      photoSlots: ["cover"],
    });
  });

  it("marks the cover and a gallery slot when the server refuses both", () => {
    const error = new ApiError(400, "Bad Request", {
      message: [
        "coverPhoto.image must be an image reference",
        "photos.wide must be an image reference",
      ],
    });
    expect(resolveListing422(error, english)?.photoSlots).toEqual([
      "cover",
      "wide",
    ]);
  });

  it("routes cover alt text to the cover without marking the photo", () => {
    const error = new ApiError(400, "Bad Request", {
      message: [
        "coverPhoto.alt must be shorter than or equal to 100 characters",
      ],
    });
    expect(resolveListing422(error, english)).toMatchObject({
      step: 4,
      anchor: ANCHOR.cover,
      photoSlots: [],
    });
  });
});
