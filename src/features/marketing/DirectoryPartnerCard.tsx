import { type FocusEvent } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { routes } from "../../app/routeMap";
import { categoryLabel } from "./localCategories";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  hasMeetingPoint,
  listingKindOf,
  mobileCardAreaLine,
  normalizeMobileDetails,
} from "./listBusiness/listingMobile.data";
import styles from "./DirectoryPartnerCard.module.css";

/** The thumb's side in CSS pixels; the stylesheet's card height is built
 *  around it. */
const THUMB_SIZE = 64;

type Translate = ReturnType<typeof useTranslation>["t"];

/**
 * Where the business is, the way the directory card's meta row says it: an
 * online-only business reads "Online" or "Online · {city}", an out-and-about
 * one its meeting point or the area it works, and a place its neighbourhood.
 */
function partnerAreaOf(t: Translate, place: DirectoryPlace): string {
  const kind = listingKindOf(place);
  if (kind === "online") {
    const city = place.city?.trim() ?? "";
    return city
      ? t("marketing:directory.card.onlineIn", { city })
      : t("marketing:directory.card.online");
  }
  if (kind === "mobile") {
    const areaLine = mobileCardAreaLine({
      hood: place.hood,
      isAtMeetingPoint: hasMeetingPoint(place),
      details: normalizeMobileDetails(place.mobileDetails),
    });
    return t(areaLine.key, areaLine.values);
  }
  return place.hood.trim();
}

/**
 * Brings a partner card fully into view when the keyboard lands on it, the
 * way LocalBusinessCard does: the browser treats a card cut by the rail's
 * edge as already visible and leaves it half hidden. Only the card's own
 * keyboard focus counts.
 */
function handleKeyboardFocus(event: FocusEvent<HTMLElement>) {
  const card = event.currentTarget;
  const isCardItself = event.target === card;
  if (!isCardItself || !card.matches(":focus-visible")) return;
  // One frame later: WebKit drops a scroll asked for inside the focus event
  // itself, while it is still revealing the focused element.
  requestAnimationFrame(() => {
    card.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
    });
  });
}

/**
 * One partner in the "Businesses we partner with" rail: a compact link to the
 * listing with a square thumb (the cover photo, or the business's initials on
 * its tint), the name, the category and area, and the admin's note. The name
 * and the meta keep to one line and the note to two, so the card has one
 * fixed height at any width and the rail never changes the height of the
 * results above the grid.
 */
export function DirectoryPartnerCard({
  place,
  note,
}: {
  place: DirectoryPlace;
  /** The admin's note. A blank note leaves the line out. */
  note: string | null;
}) {
  const { t } = useTranslation();
  const area = partnerAreaOf(t, place);
  const trimmedNote = note?.trim() ?? "";

  return (
    <Link
      to={`${routes.directory}/${place.slug}`}
      className={styles.card}
      onFocus={handleKeyboardFocus}
    >
      {/* Decorative: the name beside it is the card's name, read once. */}
      <span aria-hidden="true">
        <ImageSlot
          src={place.photos?.wide ?? undefined}
          tint={place.tint}
          initials={place.av}
          width={THUMB_SIZE}
          height={THUMB_SIZE}
          radius={10}
          focus={place.photoFocus}
        />
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{place.name}</span>
        <span className={styles.meta}>
          <span className={styles.category}>{categoryLabel(t, place.cat)}</span>
          {area !== "" && <span className={styles.area}>{area}</span>}
        </span>
        {trimmedNote !== "" && (
          <span className={styles.note} data-partner-note>
            <FiHeart aria-hidden className={styles.noteIcon} />
            <span className={styles.noteText}>{trimmedNote}</span>
          </span>
        )}
      </span>
    </Link>
  );
}
