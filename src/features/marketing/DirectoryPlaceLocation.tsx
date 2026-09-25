import { FiCheck, FiCopy, FiGlobe, FiNavigation } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button } from "../../shared/components/ui";
import { useClipboard } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isPlaceGone, type DirectoryPlace } from "./directoryPlaces";
import { directionsHref, placeCoordinates } from "./businessCoords";
import { placeAreaParts, placeStreetLine } from "./placeArea";
import { LocationMiniMap } from "./LocationMiniMap";
import { DirectoryMapPlaceholder } from "./DirectoryMapPlaceholder";
import s from "./DirectorySpacePage.module.css";

/**
 * The two halves of a listing's location, kept as separate components because
 * the visit card places them in separate grid rows: the map runs flush across
 * the card's top edge with no padding of its own, while the address sits
 * inside the padded details area below it.
 *
 * Both are small enough to share a file (see component-decomposition's
 * "several small components per file" allowance).
 */

/** The map cell: the real basemap when the place has a pin, otherwise the
 *  decorative placeholder. Fills whatever cell the card gives it. */
export function DirectoryPlaceMap({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Live listings carry their pin on the DTO; demo places have it hand-placed
  // in BUSINESS_COORDS by slug (same fallback order as localPlaces.ts). When
  // neither exists (location-less listings) we keep the decorative placeholder.
  const coords = placeCoordinates(place, demoMode);

  return (
    <div className={s.visitMap}>
      {coords ? (
        <LocationMiniMap
          latitude={coords.latitude}
          longitude={coords.longitude}
          ariaLabel={t("marketing:directory.detail.mapAria", {
            name: place.name,
          })}
        />
      ) : (
        <DirectoryMapPlaceholder />
      )}
    </div>
  );
}

/** The address cell: the street line, then the two things a visitor does with
 *  an address: get directions to it, or copy it to paste somewhere else. The
 *  neighbourhood and city head the section as its subline, and the venue's
 *  name is left out, since the page heading already says it. */
export function DirectoryPlaceAddress({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { copy, copied: isAddressCopied } = useClipboard();

  // The venue is permanently closed or has moved: the map and the address stay
  // (this is where it WAS, and that is worth recording), but the address is
  // relabelled so nobody reads it as somewhere to go today, and "Take me
  // there" goes with it, as the header's Directions action does in
  // `DirectoryActionBar`.
  const isFormerAddress = isPlaceGone(place);

  const address = placeStreetLine(place);
  const hasStreet = address !== "";

  // The copied address still carries the area, so it pastes complete.
  const fullAddress = [hasStreet ? address : null, ...placeAreaParts(place)]
    .filter(Boolean)
    .join(", ");

  // Directions need somewhere to point: the pin, or failing that a street.
  const canGetDirections =
    !isFormerAddress && (hasStreet || !!placeCoordinates(place, demoMode));

  return (
    <div className={s.addr}>
      {isFormerAddress && (
        <span className={s.formerAddressTag}>
          {t("marketing:directory.detail.formerAddress")}
        </span>
      )}
      {hasStreet && <span className={s.addrStreet}>{address}</span>}
      {(canGetDirections || hasStreet) && (
        <div className={s.addrActions}>
          {canGetDirections && (
            <Button
              variant="ghost"
              size="sm"
              href={directionsHref(place, demoMode)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiNavigation aria-hidden />
              {t("marketing:directory.detail.takeMeThere")}
            </Button>
          )}
          {hasStreet && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void copy(fullAddress)}
            >
              {isAddressCopied ? (
                <FiCheck aria-hidden />
              ) : (
                <FiCopy aria-hidden />
              )}
              <span aria-live="polite">
                {isAddressCopied
                  ? t("marketing:directory.detail.addressCopied")
                  : t("marketing:directory.detail.copyAddress")}
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** The stand-in for both of the above when a business has no premises at all. */
export function DirectoryPlaceOnline({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();

  return (
    <div className={s.onlinePlace}>
      <FiGlobe aria-hidden />
      <div>
        <strong className={s.addrName}>{place.name}</strong>
        <span>{t("marketing:directory.detail.onlineBusiness")}</span>
      </div>
    </div>
  );
}
