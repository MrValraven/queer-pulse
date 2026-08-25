import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { VerificationLevel } from "./verification.api";

export interface HousingListingDTO {
  ref: string;
  slug: string;
  status: "review" | "question" | "live";
  lister: MemberRefDTO | null;
  /** The lister's real identity-verification level (honest badge). */
  listerVerificationLevel: VerificationLevel;
  /** Whether the backend derived this listing as verified (id-verified lister +
   * live + low risk). Never self-asserted. */
  listingVerified: boolean;
  /** Stable machine reason behind `listingVerified` (granting condition or first
   * failing gate) — powers an honest tooltip. */
  listingVerifiedReason: string;
  createdAt: string;
  /** Owner "found a place / no longer looking" signal (HSG-1), or null while
   * still looking. Set by the owner or by the daily expiry sweep. */
  filledAt: string | null;
  /** TTL (HSG-3) — auto-computed at create time, resettable via `extend`. */
  expiresAt: string;
  /** Server-computed `expiresAt < now` — no client clock-skew guesswork. */
  expired: boolean;
  type: "sublet" | "room" | "short" | "studio";
  title: string;
  blurb: string;
  city: string;
  area: string;
  rentEuros: number;
  /** Bedroom count (0 = studio), or null when the lister didn't set it. */
  bedrooms: number | null;
  billsIncluded: boolean;
  /** Always `true`: the backend forces it on every housing listing, because
   *  being LGBTQ+ affirming is the mandatory baseline for every home here.
   *  Deliberately NOT rendered as a per-listing chip or offered as a filter,
   *  which would read as something a listing could lack. See
   *  `AffirmingBaselineBadge` for the norm statement that replaced it. */
  lgbtqFriendly: boolean;
  /** Transparency (P2.6): step-free/lift/access line every listing carries. */
  accessibilityInfo: string;
  /** Member vs agent/broker disclosure — surfaced as a badge, never a bar. */
  listerKind: "member" | "agent";
  availableFrom: string | null;
  minStayMonths: number | null;
  description: string;
  features: string[];
  idealFor: string[];
  gallery: string[];
  /** Optional 360°/virtual-tour link (https), or null when none. */
  virtualTourUrl: string | null;

  // Location (address privacy). `approx*` is the neighbourhood-centroid pin,
  // always present when the area is known. `precise*` + `addressLine` are the
  // exact home, sent by the backend ONLY once you're the owner or a connected
  // member; otherwise null. `locationPrecision` says which you hold.
  approxLatitude: number | null;
  approxLongitude: number | null;
  preciseLatitude: number | null;
  preciseLongitude: number | null;
  addressLine: string | null;
  locationPrecision: "area" | "exact";
}

/** The full directory-browse filter set — mirrors the backend's
 * `BrowseHousingListingsQuery`. `type` is the type chip; the rest come from the
 * filter bar. Also the shape a saved search stores. */
export interface HousingListingFilters {
  type?: string;
  area?: string;
  /** Neighbourhood multi-select. When non-empty this is the area filter; the
   * legacy single `area` above stays for older saved searches. */
  areas?: string[];
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  billsIncluded?: boolean;
  hasAccessibilityInfo?: boolean;
  verifiedOnly?: boolean;
  /** Move-in-by date (YYYY-MM-DD): listings available on/before it, plus those
   * with no set date. */
  availableBy?: string;
  page?: number;
}

export interface CreateHousingListingBody {
  type: HousingListingDTO["type"];
  title: string;
  city: string;
  area?: string;
  rentEuros: number;
  bedrooms?: number;
  blurb?: string;
  description?: string;
  billsIncluded?: boolean;
  /** Vestigial: the create form no longer asks, and the backend forces `true`
   *  regardless. Kept only so an older client's body still type-checks. */
  lgbtqFriendly?: boolean;
  /** Required on create (P2.6): step-free access, lift, etc. */
  accessibilityInfo: string;
  /** Omitted → member. Agents are labelled, not barred. */
  listerKind?: "member" | "agent";
  /** Optional 360°/virtual-tour link (https). */
  virtualTourUrl?: string;
}

export async function getHousingListings(
  filters: HousingListingFilters = {},
): Promise<ItemsPage<HousingListingDTO>> {
  const query = new URLSearchParams();
  if (filters.type && filters.type !== "all") query.set("type", filters.type);
  if (filters.area) query.set("area", filters.area);
  if (filters.areas?.length) {
    for (const area of filters.areas) query.append("areas", area);
  }
  if (filters.priceMin !== undefined)
    query.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined)
    query.set("priceMax", String(filters.priceMax));
  if (filters.bedroomsMin !== undefined)
    query.set("bedroomsMin", String(filters.bedroomsMin));
  if (filters.billsIncluded) query.set("billsIncluded", "true");
  if (filters.hasAccessibilityInfo) query.set("hasAccessibilityInfo", "true");
  if (filters.verifiedOnly) query.set("verifiedOnly", "true");
  if (filters.availableBy) query.set("availableBy", filters.availableBy);
  if (filters.page) query.set("page", String(filters.page));
  const qs = query.toString();
  const res = await apiGet<HousingListingDTO[] | ItemsPage<HousingListingDTO>>(
    `/housing-directory${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const getHousingListing = (slug: string) =>
  apiGet<HousingListingDTO>(`/housing-directory/${slug}`);

export const createHousingListing = (body: CreateHousingListingBody) =>
  apiPost<HousingListingDTO>("/housing-listings", body);

export const sendHousingEnquiry = (ref: string, body: { body: string }) =>
  apiPost<{ conversationId: string }>(
    `/housing-listings/${ref}/enquiries`,
    body,
  );

/** PATCH /housing-listings/:ref body — reuses the create form's shape (see
 * `useListSpaceForm`/`ListSpaceFields`) for the edit flow; every field
 * optional, only present fields are applied. */
export type UpdateHousingListingBody = Partial<CreateHousingListingBody>;

/** GET /housing-listings/mine (paginated) — the member's own listings,
 * including filled ones (still shown to the owner, withheld from public
 * browse). Owner-gated (HSG-1). */
export async function getMyHousingListings(
  page = 1,
): Promise<ItemsPage<HousingListingDTO>> {
  const res = await apiGet<HousingListingDTO[] | ItemsPage<HousingListingDTO>>(
    `/housing-listings/mine?page=${page}`,
  );
  return toItemsPage(res);
}

export const getMyHousingListing = (ref: string) =>
  apiGet<HousingListingDTO>(`/housing-listings/${ref}`);

export const updateHousingListing = (
  ref: string,
  body: UpdateHousingListingBody,
) => apiPatch<HousingListingDTO>(`/housing-listings/${ref}`, body);

export const deleteHousingListing = (ref: string) =>
  apiDelete<void>(`/housing-listings/${ref}`);

export const markHousingListingFilled = (ref: string) =>
  apiPatch<HousingListingDTO>(`/housing-listings/${ref}/mark-filled`);

export const markHousingListingAvailable = (ref: string) =>
  apiPatch<HousingListingDTO>(`/housing-listings/${ref}/mark-available`);

export const extendHousingListing = (ref: string) =>
  apiPatch<HousingListingDTO>(`/housing-listings/${ref}/extend`);
