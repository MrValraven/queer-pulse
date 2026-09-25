import { Link } from "react-router-dom";
import { ImageSlot, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { FILTERS } from "./housing.data";
import { AffirmingBaselineBadge } from "./AffirmingBaseline";
import type { HousingListing } from "./housingListings";
import styles from "./HousingPage.module.css";

/** The compact listing card in the housing map's floating panel: the photo,
 * type, affirming badge, title, neighbourhood, beds and price of the browse
 * card, sized for the narrow column with the photo inset like the directory's
 * map card. The whole card links to the listing. */
export function HousingMapCard({ listing }: { listing: HousingListing }) {
  const { t } = useTranslation();
  const typeLabelKey =
    FILTERS.find((filterOption) => filterOption.value === listing.type)
      ?.labelKey ?? "economy:housing.filter.all";

  return (
    <Link to={`${routes.housing}/${listing.slug}`} className={styles.mapCard}>
      <ImageSlot
        tint={listing.tint}
        src={listing.image}
        height={120}
        radius={14}
        placeholder={t("economy:housing.listing.photoAlt", {
          hood: listing.hood,
        })}
      />
      <div className={styles.mapCardBody}>
        <div className={styles.cardBadges}>
          <span
            className={styles.type}
            style={{ background: listing.typeColor, color: listing.typeText }}
          >
            {t(typeLabelKey)}
          </span>
          <AffirmingBaselineBadge />
        </div>
        <div className={styles.mapCardTitle}>{listing.title}</div>
        <div className={styles.details}>
          <span className={styles.detail}>{listing.hood}</span>
          {listing.beds && (
            <span className={styles.detail}>{listing.beds}</span>
          )}
        </div>
        <div className={styles.mapCardPrice}>
          {listing.price} <span>/ {listing.period}</span>
        </div>
      </div>
    </Link>
  );
}

/** Mirrors `HousingMapCard` while the listings load. */
export function HousingMapCardSkeleton() {
  return (
    <div className={styles.mapCard} aria-hidden>
      <SkeletonLine width="100%" height={120} style={{ borderRadius: 14 }} />
      <div className={styles.mapCardBody}>
        <div className={styles.cardBadges}>
          <SkeletonLine width={88} height={20} style={{ borderRadius: 6 }} />
          <SkeletonLine width={96} height={20} style={{ borderRadius: 999 }} />
        </div>
        <SkeletonLine width="80%" height={17} />
        <SkeletonLine width="55%" height={13} />
        <SkeletonLine width={90} height={17} />
      </div>
    </div>
  );
}
