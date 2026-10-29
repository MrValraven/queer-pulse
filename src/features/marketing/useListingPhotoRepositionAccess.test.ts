import { describe, expect, it } from "vitest";
import {
  repositionAccessFor,
  type RepositionAccessInput,
} from "./useListingPhotoRepositionAccess";

const base: RepositionAccessInput = {
  isPreview: false,
  hasPhotos: true,
  isDemoMode: false,
  isSignedIn: true,
  ownerRef: undefined,
  role: null,
  placeRef: "QPL-1",
  slug: "a-farinha",
};

describe("repositionAccessFor", () => {
  it("hides the control in the read-only preview, even for an admin in demo", () => {
    expect(
      repositionAccessFor({
        ...base,
        isPreview: true,
        role: "admin",
        isDemoMode: true,
      }),
    ).toBeNull();
  });

  it("hides the control when the listing has zero real photos", () => {
    expect(
      repositionAccessFor({ ...base, hasPhotos: false, ownerRef: "QPL-1" }),
    ).toBeNull();
  });

  it("gives the demo member the control on fixture places with photos", () => {
    expect(
      repositionAccessFor({ ...base, isDemoMode: true, placeRef: undefined }),
    ).toEqual({ ref: null, slug: "a-farinha", asAdmin: false });
  });

  it("hides the control from a signed-out visitor on the demo deploy", () => {
    expect(
      repositionAccessFor({
        ...base,
        isDemoMode: true,
        isSignedIn: false,
        placeRef: undefined,
      }),
    ).toBeNull();
  });

  it("sends an owner or co-manager through the member route", () => {
    expect(repositionAccessFor({ ...base, ownerRef: "QPL-1" })).toEqual({
      ref: "QPL-1",
      slug: "a-farinha",
      asAdmin: false,
    });
  });

  it("sends an admin who manages nothing here through the admin route", () => {
    expect(repositionAccessFor({ ...base, role: "admin" })).toEqual({
      ref: "QPL-1",
      slug: "a-farinha",
      asAdmin: true,
    });
  });

  it("prefers the member route for an admin who also manages the listing", () => {
    expect(
      repositionAccessFor({ ...base, role: "admin", ownerRef: "QPL-1" })
        ?.asAdmin,
    ).toBe(false);
  });

  it("hides the control from moderators, members and signed-out visitors", () => {
    for (const role of ["moderator", "member", null] as const) {
      expect(repositionAccessFor({ ...base, role })).toBeNull();
    }
  });

  it("hides the admin control when the place lacks a ref to address", () => {
    expect(
      repositionAccessFor({ ...base, role: "admin", placeRef: null }),
    ).toBeNull();
  });
});
