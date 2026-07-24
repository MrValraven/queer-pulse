import { useState } from "react";
import { Reveal, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
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

/** The unified Local list: business cards + venue cards, sharing one grid + count. */
export function DirectoryListView({
  places,
  total,
  loading,
}: {
  places: LocalPlace[];
  total: number;
  loading: boolean;
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

  return (
    <section className={s.content}>
      <div className="wrap">
        <Reveal className={s.count}>
          {loading ? (
            <>{t("marketing:directory.loading")}</>
          ) : (
            <Translation
              i18nKey="marketing:directory.count"
              components={{ b: <b /> }}
              values={{ shown: places.length, total }}
            />
          )}
        </Reveal>
        <div className={s.grid}>
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <DirectoryCardSkeleton key={index} />
            ))}
          {!loading && places.length === 0 && (
            <div className={s.empty}>
              {t(
                total === 0
                  ? "marketing:directory.noListings"
                  : "marketing:directory.empty",
              )}
            </div>
          )}
          {!loading &&
            places.map((place, index) => (
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
      </div>
    </section>
  );
}
