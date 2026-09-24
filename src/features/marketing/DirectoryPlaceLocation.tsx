import { FiCheck, FiCopy, FiGlobe, FiNavigation } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button } from "../../shared/components/ui";
import { useClipboard } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isPlaceGone, type DirectoryPlace } from "./directoryPlaces";
import { directionsHref, placeCoordinates } from "./businessCoords";
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

/** The address cell: the street line, the neighbourhood and city under it,
 *  then the two things a visitor does with an address: get directions to it,
 *  or copy it to paste somewhere else. The venue's name is left out, since the
 *  page heading already says it. */
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

  // Some listings arrive with no real street address: often the venue name
  // repeated into the field. Show the street line only when it is something
  // other than the name.
  const address = place.address?.trim() ?? "";
  const hasStreet =
    address !== "" && address.toLowerCase() !== place.name.trim().toLowerCase();

  // Neighbourhood and city complete the address, each only when the street
  // line doesn't already carry it (demo addresses end in "· Graça").
  const lowerStreet = hasStreet ? address.toLowerCase() : "";
  const areaParts = [place.hood, place.city ?? "Lisbon"].filter(
    (part): part is string =>
      !!part?.trim() && !lowerStreet.includes(part.trim().toLowerCase()),
  );
  const fullAddress = [hasStreet ? address : null, ...areaParts]
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
      {areaParts.length > 0 && (
        <span className={s.addrArea}>{areaParts.join(" · ")}</span>
      )}
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
