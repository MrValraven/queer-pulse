import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";
import { PosterAwareImageSlot } from "../../shared/components/ui/PosterAwareImageSlot";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { categoryLabel } from "./localCategories";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  handleKeyboardFocus,
  partnerAreaOf,
} from "./directoryPartnerCard.utils";
import styles from "./DirectoryPartnerSpotlightCard.module.css";

/**
 * The partner's picture panel. The place's tint always paints underneath as
 * a deep gradient with the initials set large, so a place with no photo
 * still reads as a finished cover, and a photo that is loading or broken
 * leaves that cover showing. A photo fills the panel; a logo or a poster
 * shows whole over its own blurred backdrop (PosterAwareImageSlot).
 */
function SpotlightMedia({ place }: { place: DirectoryPlace }) {
  const photoSource = place.photos?.wide ?? undefined;
  const hasPhoto = Boolean(photoSource);

  return (
    // Decorative: the name beside it is the card's name, read once.
    <span className={styles.media} data-tint={place.tint} aria-hidden="true">
      <span className={styles.mediaZoom}>
        <span className={styles.monogramRing}>
          <span className={styles.monogram}>{place.av}</span>
        </span>
        {hasPhoto && (
          <PosterAwareImageSlot
            src={photoSource}
            tint={place.tint}
            focus={place.photoFocus}
            width="100%"
            height="100%"
            radius={0}
            placeholder=""
            className={styles.photo}
          />
        )}
      </span>
    </span>
  );
}

/**
 * One partner in the "Businesses we partner with" rail, as a wide feature
 * card: a full-height picture panel on the left and, on a warm paper side,
 * the "Partner" eyebrow, the name, the category and area, the admin's note
 * beside a coral rule, and a round arrow that fills coral on hover. The
 * whole card is one link to the listing. Every line is clamped, so the card
 * fills the rail's fixed box at any width without changing its height. A
 * narrow card hides the eyebrow, lets the name take two lines and, when
 * there is a note, drops the arrow (the CSS module's container query).
 */
export function DirectoryPartnerSpotlightCard({
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
  const hasNote = trimmedNote !== "";

  return (
    <Link
      to={`${routes.directory}/${place.slug}`}
      className={styles.card}
      data-tint={place.tint}
      onFocus={handleKeyboardFocus}
    >
      <SpotlightMedia place={place} />
      <span className={styles.content}>
        {/* Decorative: the row's title already says these are partners, so
            the link's name starts with the business name. */}
        <span className={styles.eyebrow} aria-hidden="true">
          <LuSparkles aria-hidden className={styles.eyebrowIcon} />
          {t("marketing:directory.partners.badge")}
        </span>
        <span className={styles.heading}>
          <span className={styles.name}>{place.name}</span>
          <span className={styles.meta}>
            <span className={styles.category}>
              {categoryLabel(t, place.cat)}
            </span>
            {area !== "" && <span className={styles.area}>{area}</span>}
          </span>
        </span>
        <span className={styles.footer}>
          {hasNote ? (
            <span className={styles.note} data-partner-note>
              <span className={styles.noteText}>{trimmedNote}</span>
            </span>
          ) : (
            <span className={styles.ctaLabel}>
              {t("marketing:directory.partners.cta")}
            </span>
          )}
          <span className={styles.cta} aria-hidden="true">
            <FiArrowUpRight className={styles.ctaIcon} />
          </span>
        </span>
      </span>
    </Link>
  );
}
