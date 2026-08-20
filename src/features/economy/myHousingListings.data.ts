import type { HousingListingDTO } from "./api/housingListing.api";

/**
 * The row shape `MyHousingListingsPage` renders AND the edit modal seeds its
 * form from — deliberately its own type rather than the shared `HousingListing`
 * display model (which powers the public gallery/lightbox/map and carries
 * fields irrelevant to self-management, like the lister ref/verification/
 * location-privacy state). Its editable fields are exactly the ones
 * `ListSpaceFields`/`useListSpaceForm` already expose on create — the edit
 * flow reuses that same field set (HSG-9: no need for anything richer).
 */
export interface MyHousingListingRow {
  ref: string;
  slug: string;
  status: HousingListingDTO["status"];
  /** Owner "found a place" signal (HSG-1), or null while still looking. */
  filledAt: string | null;
  /** TTL (HSG-3). */
  expiresAt: string;
  expired: boolean;
  createdAt: string;

  // Editable fields — mirrors `CreateHousingListingBody` (the create form's
  // request shape) so the edit form can seed from, and submit back to, the
  // same fields.
  type: HousingListingDTO["type"];
  title: string;
  city: string;
  area: string;
  rentEuros: number;
  bedrooms?: number;
  billsIncluded: boolean;
  accessibilityInfo: string;
  listerKind: "member" | "agent";
  virtualTourUrl?: string;
}

/** Demo fixture: three listings covering the states the page needs to render
 * (live, filled, and expired-and-unattended) so the feature screenshots and
 * demos cleanly with no backend. */
export const DEMO_MY_HOUSING_LISTINGS: MyHousingListingRow[] = [
  {
    ref: "QPH-2026-0142",
    slug: "sunny-room-arroios-flatshare",
    status: "live",
    filledAt: null,
    expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    expired: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    type: "room",
    title: "Sunny room in a queer flatshare",
    city: "Lisbon",
    area: "Arroios",
    rentEuros: 650,
    bedrooms: 1,
    billsIncluded: true,
    accessibilityInfo: "Third floor, no lift.",
    listerKind: "member",
  },
  {
    ref: "QPH-2026-0098",
    slug: "studio-anjos-short-let",
    status: "live",
    filledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    expired: false,
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    type: "studio",
    title: "Studio near Anjos, short-let friendly",
    city: "Lisbon",
    area: "Anjos",
    rentEuros: 900,
    bedrooms: 0,
    billsIncluded: false,
    accessibilityInfo: "Ground floor, step-free entrance.",
    listerKind: "member",
  },
  {
    ref: "QPH-2025-0311",
    slug: "sublet-graca-2-months",
    status: "live",
    filledAt: null,
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expired: true,
    createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    type: "sublet",
    title: "2-month sublet in Graça",
    city: "Lisbon",
    area: "Graça",
    rentEuros: 700,
    bedrooms: 1,
    billsIncluded: true,
    accessibilityInfo: "Lift in the building.",
    listerKind: "agent",
  },
];
