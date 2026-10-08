import { apiGet } from "../../../../shared/api/client";
import type { ListingKind } from "../listingMobile.data";

/** A mobile listing's public meeting point. */
export interface ManagedListingMeetingPoint {
  address: string;
  hood: string;
  latitude: number;
  longitude: number;
}

/**
 * One listing the signed-in member owns or co-manages, as
 * `GET /listings/managed` returns it: live listings only, sorted by name.
 * Feeds the gathering form's "Run by one of your businesses".
 */
export interface ManagedListingItem {
  /** The listing's uuid, the identifier `runByListingId` takes (contract
   *  amendment A1 in the frontend plan). */
  id: string;
  ref: string;
  slug: string;
  name: string;
  kind: ListingKind;
  /** Set only for a mobile listing with both coordinates. */
  meetingPoint: ManagedListingMeetingPoint | null;
}

export function getManagedListings(): Promise<ManagedListingItem[]> {
  return apiGet<ManagedListingItem[]>("/listings/managed");
}
