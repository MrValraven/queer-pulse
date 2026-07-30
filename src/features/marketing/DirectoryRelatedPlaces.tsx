import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlaces } from "./api/useDirectory";
import { LocalBusinessCard } from "./LocalBusinessCard";
import { CAT_LABEL_KEYS } from "./directorySpace.data";
import { type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/** Below this many same-category matches, broaden to same-hood (any category) too. */
const MIN_SAME_CATEGORY = 2;
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

  const sameCategory = places.filter(
    (candidate) =>
      candidate.slug !== place.slug && candidate.cat === place.cat,
  );

  // Too few peers in the same category to fill a row — widen the pool to
  // the same neighbourhood regardless of category, de-duped against what
  // we already have.
  let pool = sameCategory;
  if (sameCategory.length < MIN_SAME_CATEGORY) {
    const sameHood = places.filter(
      (candidate) =>
        candidate.slug !== place.slug && candidate.hood === place.hood,
    );
    pool = [...sameCategory];
    for (const candidate of sameHood) {
      if (!pool.some((existing) => existing.slug === candidate.slug)) {
        pool.push(candidate);
      }
    }
  }

  // Same-hood matches surface first (most locally relevant), stable sort
  // otherwise preserves the directory's own ordering.
  const sorted = [...pool].sort((a, b) => {
    const aSameHood = a.hood === place.hood ? 0 : 1;
    const bSameHood = b.hood === place.hood ? 0 : 1;
    return aSameHood - bSameHood;
  });

  const shortlist = sorted.slice(0, MAX_RELATED);
  if (shortlist.length < 1) return null;

  const categoryLabelKey = CAT_LABEL_KEYS[place.cat];
  const categoryLabel = categoryLabelKey ? t(categoryLabelKey) : place.cat;

  return (
    <section className={s.related}>
      <h2 className={s.relatedTitle}>
        {t("marketing:directory.detail.relatedTitle", {
          category: categoryLabel,
        })}
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
