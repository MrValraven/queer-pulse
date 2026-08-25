import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { MagazineSectionTile } from "./api/useMagazineSections";
import styles from "./MagazineSectionsPage.module.css";

function SectionCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width="55%" height={21} />
      <SkeletonLine width="35%" height={13} style={{ marginTop: 12 }} />
    </div>
  );
}

/**
 * The tile grid for `MagazineSectionsPage` (CNT-20) — one card per section,
 * linking to that section's filtered article list
 * (`${routes.magazineSections}/:section`, encoded so a name with a space
 * like "Last word" round-trips through the URL). Split out of the page
 * component purely to keep each file small and focused, per this repo's
 * component-decomposition convention.
 */
export function MagazineSectionGrid({
  sections,
  isLoading,
}: {
  sections: MagazineSectionTile[];
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SectionCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {sections.map((section) => (
        <Link
          key={section.id}
          to={`${routes.magazineSections}/${encodeURIComponent(section.name)}`}
          className={styles.card}
        >
          <span className={styles.cardName}>{section.name}</span>
          {section.articleCount !== null && (
            <span className={styles.cardCount}>
              {t("magazine:sections.articleCount", {
                count: section.articleCount,
              })}
            </span>
          )}
          <span className={styles.cardArrow} aria-hidden>
            <FiArrowRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
