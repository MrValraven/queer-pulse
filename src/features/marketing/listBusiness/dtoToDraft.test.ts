import { describe, expect, it } from "vitest";
import { emptyHours, hoursForPayload } from "./listBusiness.data";
import { dtoToDraft } from "./dtoToDraft";
import type { ListingDTO } from "./api/listings.api";

// Minimal DTO factory — only fields dtoToDraft reads plus the server-only extras it must drop.
function makeDto(overrides: Partial<ListingDTO> = {}): ListingDTO {
  return {
    ref: "QPL-2026-0007",
    slug: "atelier-pulso",
    status: "live",
    submittedBy: {
      slug: "ines",
      firstName: "Inês",
      lastName: "",
    },
    createdAt: "2026-07-01T00:00:00.000Z",
    operatingState: {
      state: "open",
      note: null,
      setAt: null,
      movedToAddress: null,
    },
    movedToListingId: null,
    detailsConfirmedAt: null,
    path: "claim",
    name: "Atelier Pulso",
    cats: ["Studio"],
    hood: "Arroios",
    badge: "owned",
    evidence: "",
    price: "",
    blurb: "A queer art studio",
    tagline: "",
    whatItIs: [],
    tags: [],
    goodFor: [],
    langs: [],
    online: false,
    address: "Rua X 1",
    geocoded: true,
    latitude: 38.7167,
    longitude: -9.149,
    hours: {},
    hoursNote: "",
    social: { instagram: "", website: "", email: "", phone: "" },
    photos: { wide: null, d1: null, d2: null, vibe: null },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    rel: "own",
    ownerName: "Inês",
    ownerRole: "Founder",
    ownerBio: "",
    visibility: "public",
    linkToProfile: true,
    contactEmail: "",
    consentOuting: true,
    consentGuide: true,
    queerOwnedVerified: false,
    ...overrides,
  };
}

describe("dtoToDraft", () => {
  it("keeps latitude/longitude and copies draft fields", () => {
    const draft = dtoToDraft(makeDto());
    expect(draft.name).toBe("Atelier Pulso");
    expect(draft.latitude).toBe(38.7167);
    expect(draft.longitude).toBe(-9.149);
    expect(draft.consentOuting).toBe(true);
  });

  it("coerces null photos to empty strings", () => {
    const draft = dtoToDraft(makeDto());
    expect(draft.photos).toEqual({ wide: "", d1: "", d2: "", vibe: "" });
  });

  it("drops server-only fields (no ref/status/slug/submittedBy/createdAt)", () => {
    const draft = dtoToDraft(makeDto()) as unknown as Record<string, unknown>;
    expect(draft.ref).toBeUndefined();
    expect(draft.status).toBeUndefined();
    expect(draft.slug).toBeUndefined();
    expect(draft.submittedBy).toBeUndefined();
    expect(draft.createdAt).toBeUndefined();
  });
});

describe("hoursForPayload", () => {
  it("empties a closed day's intervals, which the API rejects otherwise", () => {
    const payload = hoursForPayload({
      ...emptyHours(),
      Mon: { open: false, intervals: [{ from: "09:00", to: "18:00" }] },
    });
    expect(payload.Mon).toEqual({ open: false, intervals: [] });
  });

  it("leaves an open day's intervals alone", () => {
    const payload = hoursForPayload({
      ...emptyHours(),
      Fri: { open: true, intervals: [{ from: "18:00", to: "02:00" }] },
    });
    expect(payload.Fri).toEqual({
      open: true,
      intervals: [{ from: "18:00", to: "02:00" }],
    });
  });

  it("empties every closed day a blank draft starts with", () => {
    const payload = hoursForPayload(emptyHours());
    for (const day of Object.values(payload)) {
      expect(day.intervals).toEqual([]);
    }
  });
});
