import { useEffect, useRef } from "react";
import { useDirectoryPlace } from "../../marketing/api/useDirectory";
import type { GatheringForm } from "../useGatheringForm";

export interface VenueAddress {
  /** The linked listing's trimmed street address, or "" when there is none. */
  venueAddress: string;
  /** True while the linked listing's detail is still in flight. */
  isLoading: boolean;
}

/**
 * The street address of a directory listing, read by slug.
 *
 * Reads the listing's detail because the picker's whole-catalog list carries
 * an empty address in live mode. Trusts the detail only once it names the
 * same slug, so a previous listing's address never stands in for a new one.
 */
export function useListingAddress(slug: string | undefined): VenueAddress {
  const { place, isLoading } = useDirectoryPlace(slug);
  const venueAddress =
    slug !== undefined && place?.slug === slug ? place.address.trim() : "";
  return { venueAddress, isLoading };
}

/**
 * The street address of the venue the host linked from the local directory,
 * written into the form's address as soon as it resolves.
 *
 * Resolves through `useListingAddress`. Remembers what it filled in, so when
 * the host unlinks the venue (or links a different one) an address that still
 * matches the old listing is cleared and never sticks to the new venue.
 */
export function useVenueAddress(form: GatheringForm): VenueAddress {
  const linkedSlug = form.venueListing?.slug;
  const { venueAddress, isLoading } = useListingAddress(linkedSlug);
  const autoFilledRef = useRef<{ slug: string; address: string } | null>(null);
  const { address, setAddress } = form;

  useEffect(() => {
    if (venueAddress && linkedSlug !== undefined) {
      autoFilledRef.current = { slug: linkedSlug, address: venueAddress };
      if (address !== venueAddress) setAddress(venueAddress);
      return;
    }
    const autoFilled = autoFilledRef.current;
    if (autoFilled && autoFilled.slug !== linkedSlug) {
      autoFilledRef.current = null;
      if (address === autoFilled.address) setAddress("");
    }
  }, [venueAddress, linkedSlug, address, setAddress]);

  return { venueAddress, isLoading };
}
