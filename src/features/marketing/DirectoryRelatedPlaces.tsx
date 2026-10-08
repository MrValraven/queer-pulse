import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlaces } from "./api/useDirectory";
import { LocalBusinessCard } from "./LocalBusinessCard";
import { categoryLabel } from "./localCategories";
import { type DirectoryPlace } from "./directoryPlaces";
import { relatedPlacesFor } from "./relatedPlaces";
import s from "./DirectorySpacePage.module.css";

const MAX_RELATED = 4;

/**
 * "More like this" — a full-width row of related places below the two-column
 * detail grid, so a visitor who came in from search or a share link can keep
 * exploring the directory instead of dead-ending here.
 *
 * Reads the whole directory via `useDirectoryPlaces()` (already dual-mode)
 * and filters client-side: same category first, same neighbourhood ("hood")
 * sorted to the front, up to `MAX_RELATED`. Falls back to same-hood-any-
 * category when there are too few same-category peers, and renders nothing
 * at all when even that turns up empty — never an awkward empty section.
 */
export function DirectoryRelatedPlaces({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const places = useDirectoryPlaces();

  const shortlist = relatedPlacesFor(place, places).slice(0, MAX_RELATED);
  if (shortlist.length < 1) return null;

  const categoryText = categoryLabel(t, place.cat);

  return (
    <section className={s.related}>
      <h2 className={s.relatedTitle}>
        {t(
          place.online
            ? "marketing:directory.detail.relatedTitleOnline"
            : "marketing:directory.detail.relatedTitle",
          {
            category: categoryText,
          },
        )}
      </h2>
      <div className={s.relatedGrid}>
        {shortlist.map((relatedPlace, index) => (
          <LocalBusinessCard
            key={relatedPlace.slug}
            place={relatedPlace}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
