import { skipToken, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { geocodeAddress } from "../marketing/listBusiness/api/listings.api";
import type { GatheringDetail } from "./data";
import {
  gatheringAddressToPin,
  gatheringMapPoint,
  type GatheringMapPoint,
} from "./gatheringLocation";

export interface GatheringMapPointState {
  /** What the map draws, or null when there is no map (or it is still
   *  locating the address; see `isLocatingAddress`). */
  mapPoint: GatheringMapPoint | null;
  /** True while the address the viewer holds is being geocoded. The Where
   *  panel holds the map frame in its loader meanwhile, so the map opens on
   *  the pin and never jumps there from the neighbourhood blob. */
  isLocatingAddress: boolean;
}

/**
 * The Where panel's map point, with the street address geocoded when the
 * viewer holds it (see the PRIVACY note in `gatheringLocation.ts`).
 *
 * `isMapShown` is false wherever the map never mounts (a phone), so the
 * request only fires for a viewer who will see the pin. Demo mode has no
 * backend, so it never geocodes and keeps the neighbourhood blob. A failed
 * lookup falls back to that blob quietly: the address and "Take me there"
 * still sit beside it, so nothing the viewer needs is missing.
 */
export function useGatheringMapPoint(
  gathering: GatheringDetail,
  isMapShown: boolean,
): GatheringMapPointState {
  const { demoMode } = useDemoMode();
  const addressToGeocode =
    isMapShown && !demoMode ? gatheringAddressToPin(gathering) : null;
  const shouldGeocode = addressToGeocode !== null;

  const geocodeQuery = useQuery({
    queryKey: ["geocode-address", addressToGeocode],
    queryFn:
      addressToGeocode === null
        ? skipToken
        : () => geocodeAddress(addressToGeocode),
    // An address resolves to the same point for the whole visit, and an
    // address the geocoder cannot place will not start resolving on a retry.
    staleTime: Infinity,
    retry: false,
    // The blob is the fallback, so a failure is no news for the viewer.
    meta: { silentError: true },
  });

  if (!isMapShown) return { mapPoint: null, isLocatingAddress: false };
  if (shouldGeocode && geocodeQuery.isPending) {
    return { mapPoint: null, isLocatingAddress: true };
  }
  const addressPoint =
    shouldGeocode && geocodeQuery.data
      ? {
          latitude: geocodeQuery.data.latitude,
          longitude: geocodeQuery.data.longitude,
        }
      : null;
  return {
    mapPoint: gatheringMapPoint(gathering, addressPoint),
    isLocatingAddress: false,
  };
}
