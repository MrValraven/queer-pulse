import { useState } from "react";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type LocalPlace } from "./localPlaces";
import { LocalPlaceCard } from "./LocalPlaceCard";
import s from "./DirectoryPage.module.css";

function DirectoryCardSkeleton() {
  // Mirrors the real .card: top row (44px avatar + badge), name, cat, hood, desc, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.top}>
        <SkeletonLine width={44} height={44} style={{ borderRadius: 12 }} />
        <SkeletonLine width={84} height={18} style={{ borderRadius: 6 }} />
      </div>
      <div>
        <SkeletonLine width="65%" height={19} />
        <SkeletonLine width="40%" height={12} style={{ marginTop: 6 }} />
        <SkeletonLine width="50%" height={12.5} style={{ marginTop: 6 }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="85%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.foot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
      </div>
    </div>
  );
}

/** The unified Local list: business cards + venue cards, sharing one grid. */
export function DirectoryListView({
  places,
  total,
  loading,
  hasActiveFilters,
  onClearFilters,
}: {
  places: LocalPlace[];
  total: number;
  loading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [been, setBeen] = useState<Record<string, number>>({});

  function toggleExpand(placeId: string) {
    setExpandedId((current) => (current === placeId ? null : placeId));
  }
  function markBeen(placeId: string, currentBeen: number) {
    setBeen((current) => ({ ...current, [placeId]: currentBeen + 1 }));
  }

  // Two distinct empties: nothing listed yet vs. filtered down to nothing.
  // The second offers Clear filters as the primary escape hatch.
  const listBusinessAction = {
    label: t("marketing:directory.submitStrip.cta"),
    to: routes.listBusiness,
  };
  const emptyState =
    hasActiveFilters && total > 0 ? (
      <EmptyState
        icon={<FiSearch />}
        title={t("marketing:directory.empty.title")}
        description={t("marketing:directory.empty.body")}
        action={{
          label: t("marketing:directory.clearFilters"),
          onClick: onClearFilters,
        }}
        secondaryAction={listBusinessAction}
      />
    ) : (
      <EmptyState
        icon={<FiMapPin />}
        title={t("marketing:directory.noListings.title")}
        description={t("marketing:directory.noListings.body")}
        action={listBusinessAction}
      />
    );

  return (
    <section className={s.content}>
      <div className="wrap">
        {loading ? (
          <div className={s.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <DirectoryCardSkeleton key={index} />
            ))}
          </div>
        ) : places.length === 0 ? (
          emptyState
        ) : (
          <div className={s.grid}>
            {places.map((place, index) => (
              <LocalPlaceCard
                key={place.id}
                place={place}
                index={index}
                expandedId={expandedId}
                been={been}
                onToggleExpand={toggleExpand}
                onMarkBeen={markBeen}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
