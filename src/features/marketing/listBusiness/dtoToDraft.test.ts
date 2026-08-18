import { describe, expect, it } from "vitest";
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
    path: "claim",
    verify: "",
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
    notify: [],
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
