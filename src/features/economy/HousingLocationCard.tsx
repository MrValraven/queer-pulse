import { lazy, Suspense } from "react";
import { FiInfo, FiLock, FiMapPin } from "react-icons/fi";
import { MapLoading } from "../marketing/MapLoading";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingLocation } from "./housingListings";
import s from "./housingLocationMap.module.css";

// maplibre is heavy — keep it off the entry chunk. The map only mounts on a
// listing detail page, so lazy-loading here defers the whole basemap library
// until someone actually opens a listing.
const HousingLocationMap = lazy(() =>
  import("./HousingLocationMap").then((module) => ({
    default: module.HousingLocationMap,
  })),
);

interface HousingLocationCardProps {
  location: HousingLocation;
  /** The listing title, woven into the map's screen-reader label. */
  title: string;
  /**
   * True when the reader IS the lister. `isUnlocked` cannot say this: it is
   * equally true for the owner, for a connected member and for an accepted
   * viewing, so the unlocked note told an owner "you're connected" about
   * themselves. Defaults to false, which is the right answer for every reader
   * whose standing we cannot establish.
   */
  isOwnListing?: boolean;
}

/**
 * The "Where it is" block on a housing listing, in the three states the reader
 * can actually be in:
 *
 *  1. LOCKED. You are a stranger to this lister: an approximate neighbourhood
 *     pin, and a note that the exact address is shared once you connect.
 *  2. UNLOCKED WITH AN ADDRESS. You own the listing, you and the lister are
 *     connected, or they accepted your viewing: the address, on the precise
 *     pin when the address geocoded, on the neighbourhood pin when it did not
 *     (ENG-469: the address still shows, with a note saying what the pin is).
 *  3. UNLOCKED WITH NO ADDRESS ON FILE. You passed the gate, but the lister
 *     never typed a street address, so there is nothing precise to show.
 *
 * State 3 used to fall into state 1's copy, which told a member who had already
 * connected (or already been accepted for a viewing) that the address would
 * appear "once you and the person are connected". That re-made a promise they
 * had already kept, and pointed them at the wrong party: the gap is the
 * lister's blank field. `precision` alone cannot separate 1 from 3 (both are
 * `"area"`), which is what `isUnlocked` is for.
 *
 * States 2 and 3 each split again on `isOwnListing`, because their copy was
 * written for the connected reader and read as a lie to the OWNER: it told them
 * they were "connected" to themselves, and told them "this lister has not added
 * an address" about their own blank field. `isUnlocked` cannot separate the two
 * (it is true for the owner, the connected member and the accepted viewing
 * alike), so ownership is resolved by the caller. For everyone else the note
 * names the relationship the backend says opened the gate (DES-419).
 */
export function HousingLocationCard({
  location,
  title,
  isOwnListing = false,
}: HousingLocationCardProps) {
  const { t } = useTranslation();
  const exact = location.precision === "exact";
  // ENG-469: the address shows to anyone through the gate, whatever pin we
  // hold. A failed geocode leaves an unlocked reader with the area pin, and
  // keying this on `exact` used to hide an address they were entitled to.
  const hasAddress = location.isUnlocked && Boolean(location.addressLine);
  // Passed the gate, but there is no address behind it. Keyed on the address
  // rather than on `precision`, so a row that somehow holds coordinates with no
  // address line (a legacy row whose point was set out of band) lands here too
  // instead of falling back into the locked copy.
  const isUnlockedWithoutAddress = location.isUnlocked && !location.addressLine;

  // The exact view prefers the precise point; otherwise (and as a fallback if a
  // precise point is somehow missing) we show the approximate centroid.
  const latitude = exact ? location.preciseLatitude : location.approxLatitude;
  const longitude = exact
    ? location.preciseLongitude
    : location.approxLongitude;

  // No coordinates at all (unknown area, no geocode): skip the map rather than
  // render an empty frame, but still tell the reader where — or that the exact
  // address arrives after connecting. Bundling the pair narrows both to `number`.
  const point =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;

  return (
    <div>
      {point && (
        <div className={s.mapShell}>
          <Suspense fallback={<MapLoading ready={false} />}>
            <HousingLocationMap
              latitude={point.latitude}
              longitude={point.longitude}
              precision={location.precision}
              ariaLabel={t(
                exact
                  ? "economy:housingListing.location.mapExactAria"
                  : "economy:housingListing.location.mapAreaAria",
                { title },
              )}
            />
          </Suspense>
        </div>
      )}

      {hasAddress ? (
        <div className={s.address}>
          <span className={s.addressLabel}>
            {t("economy:housingListing.location.addressLabel")}
          </span>
          <span className={s.addressValue}>{location.addressLine}</span>
        </div>
      ) : isUnlockedWithoutAddress ? (
        <p className={s.note}>
          <FiMapPin className={s.noteIcon} aria-hidden />
          {/* Same correction as the exact note below: "this lister has not
              added one, ask them for it" points an owner at themselves. Theirs
              is a blank field they can go and fill in. */}
          {t(
            isOwnListing
              ? "economy:housingListing.location.ownNoAddressNote"
              : "economy:housingListing.location.noAddressOnFileNote",
          )}
        </p>
      ) : (
        <p className={s.note}>
          <FiLock className={s.noteIcon} aria-hidden />
          {t("economy:housingListing.location.approxNote")}
        </p>
      )}

      {hasAddress && (
        <p className={s.note}>
          <FiMapPin className={s.noteIcon} aria-hidden />
          {t(relationshipNoteKey(location, isOwnListing))}
        </p>
      )}

      {hasAddress && !exact && (
        <p className={s.note}>
          <FiInfo className={s.noteIcon} aria-hidden />
          {t("economy:housingListing.location.areaPinNote")}
        </p>
      )}
    </div>
  );
}

/**
 * The line under an unlocked address, naming the relationship that opened it
 * (DES-419). An owner is told they are reading back their own address: the
 * app must never claim a connection that does not exist. A backend that does
 * not say which relationship it was gets the neutral "you have access" line.
 */
function relationshipNoteKey(
  location: HousingLocation,
  isOwnListing: boolean,
): string {
  if (isOwnListing || location.unlockedVia === "owner") {
    return "economy:housingListing.location.ownExactNote";
  }
  switch (location.unlockedVia) {
    case "viewing":
      return "economy:housingListing.location.viewingExactNote";
    case "connection":
      return "economy:housingListing.location.exactNote";
    default:
      return "economy:housingListing.location.unlockedExactNote";
  }
}
