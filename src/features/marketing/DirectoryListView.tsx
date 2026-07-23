import { useState } from "react";
import { Reveal, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { type LocalPlace } from "./localPlaces";
import { type DirectoryPlace } from "./directoryPlaces";
import { type Venue } from "./map.data";
import { LocalBusinessCard } from "./LocalBusinessCard";
import { LocalVenueCard } from "./LocalVenueCard";
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
            places.map((place, index) => {
              if (place.kind === "business") {
                return (
                  <LocalBusinessCard
                    key={place.id}
                    place={place.source as DirectoryPlace}
                    index={index}
                  />
                );
              }
              const venue = place.source as Venue;
              return (
                <LocalVenueCard
                  key={place.id}
                  venue={venue}
                  index={index}
                  isExpanded={expandedId === venue.id}
                  beenCount={been[venue.id] ?? venue.beenHere}
                  marked={been[venue.id] !== undefined}
                  onToggle={() =>
                    setExpandedId(expandedId === venue.id ? null : venue.id)
                  }
                  onMarkBeen={() =>
                    setBeen((current) => ({
                      ...current,
                      [venue.id]: venue.beenHere + 1,
                    }))
                  }
                />
              );
            })}
        </div>
      </div>
    </section>
  );
}
