import { describe, expect, it } from "vitest";
import { routes } from "../../app/routeMap";
import {
  LISTING_CORRECTION_TOPIC,
  contactInquiryRouting,
  listingCorrectionContactPath,
  listingRefFromParam,
} from "./contactPrefill";

describe("contactPrefill (PRD-434)", () => {
  it("builds the contact route with the correction topic and the ref", () => {
    const path = listingCorrectionContactPath("QPL-2026-0007");
    const [pathname, query] = path.split("?");
    const params = new URLSearchParams(query);
    expect(pathname).toBe(routes.contact);
    expect(params.get("topic")).toBe(LISTING_CORRECTION_TOPIC);
    expect(params.get("ref")).toBe("QPL-2026-0007");
  });

  it("reads back a well-formed ref, trimmed", () => {
    expect(listingRefFromParam(" QPL-2026-0007 ")).toBe("QPL-2026-0007");
  });

  it("ignores a missing, empty or malformed ref", () => {
    expect(listingRefFromParam(null)).toBeUndefined();
    expect(listingRefFromParam("")).toBeUndefined();
    expect(listingRefFromParam("<script>")).toBeUndefined();
    expect(listingRefFromParam("QPL 2026 0007")).toBeUndefined();
  });

  it("files a listing correction as its own kind, with the ref", () => {
    expect(
      contactInquiryRouting(LISTING_CORRECTION_TOPIC, "QPL-2026-0007"),
    ).toEqual({ kind: "listing_correction", listingRef: "QPL-2026-0007" });
  });

  it("files a listing correction without a ref when the link carried none", () => {
    expect(contactInquiryRouting(LISTING_CORRECTION_TOPIC, undefined)).toEqual({
      kind: "listing_correction",
    });
  });

  it("files every other topic as a plain contact message, ref or not", () => {
    expect(contactInquiryRouting("safety", "QPL-2026-0007")).toEqual({
      kind: "contact",
    });
    expect(contactInquiryRouting("general", undefined)).toEqual({
      kind: "contact",
    });
  });
});
