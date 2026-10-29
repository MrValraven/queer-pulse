import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  LISTING_PHOTO_FRAMING_ERROR_KEYS,
  listingPhotoFramingErrorOf,
  updateAdminListingPhotoFraming,
  updateListingPhotoFraming,
} from "./listingPhotoFraming.api";

/** `apiPatch` is mocked so each save can be asserted by the path it sends to. */
const apiPatchMock = vi.hoisted(() => vi.fn());

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  apiPatch: apiPatchMock,
}));

const body = {
  photos: [
    {
      image: "https://cdn.example/a.jpg",
      framing: { focusX: 0.25, focusY: 0.75, zoom: 2 },
    },
  ],
};

describe("the photo framing saves", () => {
  beforeEach(() => {
    apiPatchMock.mockReset();
    apiPatchMock.mockResolvedValue({ photoGallery: [] });
  });

  it("sends the member save to PATCH /listings/:ref/photo-framing", async () => {
    await updateListingPhotoFraming("QPL-2026-0007", body);
    expect(apiPatchMock).toHaveBeenCalledWith(
      "/listings/QPL-2026-0007/photo-framing",
      body,
      undefined,
      expect.any(Function),
    );
  });

  it("sends the admin save to PATCH /admin/listings/:ref/photo-framing", async () => {
    await updateAdminListingPhotoFraming("QPL-2026-0007", body);
    expect(apiPatchMock).toHaveBeenCalledWith(
      "/admin/listings/QPL-2026-0007/photo-framing",
      body,
      undefined,
      expect.any(Function),
    );
  });

  it("encodes the listing ref in the path", async () => {
    await updateListingPhotoFraming("a b/c", body);
    expect(apiPatchMock.mock.calls[0]?.[0]).toBe(
      "/listings/a%20b%2Fc/photo-framing",
    );
  });

  it("accepts a body with a photoGallery array and rejects one without", async () => {
    await updateListingPhotoFraming("QPL-2026-0007", body);
    const validate = apiPatchMock.mock.calls[0]?.[3] as (
      data: unknown,
    ) => unknown;
    expect(validate({ photoGallery: [] })).toEqual({ photoGallery: [] });
    expect(() => validate({})).toThrow(/photoGallery/);
    expect(() => validate(null)).toThrow(/photoGallery/);
  });
});

describe("listingPhotoFramingErrorOf", () => {
  it.each([
    [
      new ApiError(404, "x", { message: "x", code: "LISTING_NOT_FOUND" }),
      false,
      "notFound",
    ],
    [new ApiError(404, "x"), false, "notFound"],
    [
      new ApiError(403, "x", { message: "x", code: "LISTING_NOT_MANAGER" }),
      false,
      "notManager",
    ],
    [new ApiError(403, "x"), true, "notAdmin"],
    [
      new ApiError(403, "x", { message: "x", code: "ACCOUNT_RESTRICTED" }),
      false,
      "restricted",
    ],
    [
      new ApiError(403, "x", { message: "x", code: "ACCOUNT_RESTRICTED" }),
      true,
      "restricted",
    ],
    [
      new ApiError(409, "x", { message: "x", code: "LISTING_NOT_LIVE" }),
      false,
      "notLive",
    ],
    [
      new ApiError(400, "x", { message: "x", code: "PHOTO_NOT_IN_GALLERY" }),
      false,
      "photoNotInGallery",
    ],
    [new ApiError(400, "x"), false, "invalid"],
    [new ApiError(401, "x"), false, "signedOut"],
    [new ApiError(429, "x"), false, "rateLimited"],
    [new ApiError(408, "x"), false, "unreachable"],
    [new TypeError("Failed to fetch"), false, "unreachable"],
    [new ApiError(503, "x"), false, "server"],
    [new ApiError(418, "x"), false, "refused"],
    [new ApiError(403, "x"), false, "refused"],
    [new ApiError(409, "x"), false, "refused"],
  ])("names %s as the %s reason", (error, asAdmin, reason) => {
    expect(
      listingPhotoFramingErrorOf(error, { asAdmin, isOffline: false }).reason,
    ).toBe(reason);
  });

  it("reports offline first whenever the browser has lost its network", () => {
    expect(
      listingPhotoFramingErrorOf(new ApiError(500, "x"), {
        asAdmin: false,
        isOffline: true,
      }).reason,
    ).toBe("offline");
  });

  it("keeps the HTTP status for the refused copy", () => {
    expect(
      listingPhotoFramingErrorOf(new ApiError(418, "x"), {
        asAdmin: false,
        isOffline: false,
      }).status,
    ).toBe(418);
  });

  it("gives every reason a catalog key under directory.detail.reposition.error", () => {
    for (const key of Object.values(LISTING_PHOTO_FRAMING_ERROR_KEYS))
      expect(key).toMatch(
        /^marketing:directory\.detail\.reposition\.error\.[a-zA-Z]+$/,
      );
  });
});
