import type {
  HousingListingDecisionDTO,
  HousingListingDTO,
} from "./api/housingListing.api";

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
  /**
   * The moderator's last decision on this listing, and the reason they wrote.
   * Owner-visible: it is how a lister learns their home needs changes, was
   * refused, or was pulled. Null while nothing has been decided.
   */
  decision: HousingListingDecisionDTO | null;
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
  blurb: string;
  description: string;
  availableFrom: string | null;
  minStayMonths: number | null;
  features: string[];
  idealFor: string[];
  /** Already-resolved photo URLs. Re-sent verbatim on save: the backend
   * normalises its own `/files/<key>` URL back to the storage key. */
  gallery: string[];
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
    decision: {
      status: "live",
      reason: null,
      at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    },
    blurb: "A bright double room in a four-person queer flatshare.",
    description:
      "The room faces east, so it gets the morning sun. Two of us work from home, one is a nurse on shifts, and we keep the flat calm. Metro is a six-minute walk.",
    availableFrom: null,
    minStayMonths: 6,
    features: ["Furnished", "Natural light", "Washing machine"],
    idealFor: ["Long stays", "A quiet household"],
    gallery: [],
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
    decision: null,
    blurb: "A small studio a few minutes from Anjos metro.",
    description:
      "Everything in one room, with a separate bathroom and a kitchenette along one wall. Good for a short stay while you find something longer.",
    availableFrom: null,
    minStayMonths: 1,
    features: ["Furnished", "Air conditioning"],
    idealFor: ["Short stays", "Someone new to Lisbon"],
    gallery: [],
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
    decision: {
      status: "question",
      reason:
        "Could you add a photo of the kitchen and say whether the rent includes water? Once that is in, this is good to go.",
      at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    blurb: "Two-month sublet in Graça while the tenant is away.",
    description:
      "A one-bedroom flat on the fourth floor with a lift, furnished, on a quiet street above the tram line.",
    availableFrom: null,
    minStayMonths: 2,
    features: ["Furnished", "Lift", "Quiet street"],
    idealFor: ["Short stays"],
    gallery: [],
  },
];
