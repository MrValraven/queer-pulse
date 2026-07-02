import { FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import {
  Avatar,
  EmptyState,
  FadeIn,
  ImageSlot,
  SkeletonLine,
} from "../../shared/components/ui";
import type { HOUSING_LISTINGS } from "./housingListings";
import styles from "./HousingPage.module.css";

type Listing = (typeof HOUSING_LISTINGS)[number];

function ListingSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width="100%" height={150} style={{ borderRadius: 0 }} />
      <div className={styles.cardBody}>
        <SkeletonLine width={88} height={20} style={{ borderRadius: 6 }} />
        <SkeletonLine width="80%" height={19} style={{ marginTop: 4 }} />
        <SkeletonLine width="60%" height={13} style={{ marginTop: 4 }} />
        <SkeletonLine width="95%" height={13} style={{ marginTop: 4 }} />
        <div className={styles.foot}>
          <SkeletonLine width={70} height={20} />
          <SkeletonLine width={90} height={13} />
        </div>
      </div>
    </div>
  );
}

export function HousingListingGrid({
  loading,
  visible,
  onClearFilter,
}: {
  loading: boolean;
  visible: Listing[];
  onClearFilter: () => void;
}) {
  return (
    <div className={styles.grid}>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <ListingSkeleton key={i} />)
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<FiHome />}
          title="No listings of this kind right now"
          description="Nothing's posted in this category at the moment. Clear the filter to see every space the community has open — new listings go up often."
          action={{ label: "Clear filters", onClick: onClearFilter }}
        />
      ) : (
        visible.map((listing, i) => (
          <FadeIn key={listing.title} delay={Math.min(i, 8) * 60}>
            <Link
              to={`${routes.housing}/${listing.slug}`}
              className={styles.card}
            >
              <ImageSlot
                tint={listing.tint}
                src={listing.image}
                height={150}
                radius={0}
                placeholder={`Photo · ${listing.hood}`}
              />
              <div className={styles.cardBody}>
                <span
                  className={styles.type}
                  style={{
                    background: listing.typeColor,
                    color: listing.typeText,
                  }}
                >
                  {listing.typeLabel}
                </span>
                <div className={styles.cardTitle}>{listing.title}</div>
                <div className={styles.details}>
                  <span className={styles.detail}>{listing.hood}</span>
                  <span className={styles.detail}>{listing.beds}</span>
                  <span className={styles.detail}>From {listing.avail}</span>
                </div>
                <p className={styles.cardDesc}>{listing.desc}</p>
                <div className={styles.foot}>
                  <div className={styles.price}>
                    {listing.price} <span>/ {listing.period}</span>
                  </div>
                  <div className={styles.poster}>
                    <Avatar
                      initials={listing.poster.initials}
                      tint={listing.poster.tint}
                      size={26}
                    />
                    {listing.poster.name}
                  </div>
                </div>
              </div>
            </Link>
          </FadeIn>
        ))
      )}
    </div>
  );
}
