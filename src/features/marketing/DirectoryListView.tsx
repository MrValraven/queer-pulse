import { useEffect, useState } from "react";
import { FiMapPin, FiSearch } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  SkeletonLine,
  Sending,
} from "../../shared/components/ui";
import { useIncrementalList } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type LocalPlace } from "./localPlaces";
import { LocalPlaceCard } from "./LocalPlaceCard";
import s from "./DirectoryPage.module.css";

function DirectoryCardSkeleton() {
  // Mirrors the real .card: hero photo, name + rating, category/hood, desc, tag pills, foot.
  return (
    <div className={s.card} aria-hidden>
      <SkeletonLine width="100%" height={168} style={{ borderRadius: 14 }} />
      <div className={s.nameRow}>
        <SkeletonLine width="55%" height={19} />
        <SkeletonLine width={48} height={12} />
      </div>
      <div className={s.metaRow}>
        <SkeletonLine width={70} height={16} style={{ borderRadius: 6 }} />
        <SkeletonLine width={60} height={12.5} />
      </div>
      <div>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="85%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.pillsRow}>
        <SkeletonLine width={70} height={20} style={{ borderRadius: 999 }} />
        <SkeletonLine width={40} height={20} style={{ borderRadius: 999 }} />
        <SkeletonLine width={90} height={20} style={{ borderRadius: 999 }} />
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
  distanceById,
  total,
  loading,
  isError = false,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  hasMoreFromServer = false,
  isLoadingMoreFromServer = false,
  onLoadMoreFromServer,
}: {
  places: LocalPlace[];
  /** Metres from the member to each place that has real coordinates, keyed by
   *  `LocalPlace.id`. `null` whenever "use my location" is off; a place absent
   *  from the map simply shows no walking time, because inventing one would be
   *  the single most misleading thing this grid could do. */
  distanceById?: ReadonlyMap<string, number> | null;
  total: number;
  loading: boolean;
  /** True when the directory read failed (DES-25). Rendered as its own state,
   *  so an outage never reads as "no places listed yet". */
  isError?: boolean;
  /** Re-run the failed read, wired to the error state's retry. */
  onRetry?: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  /** True when the backend has more pages beyond what's already loaded into
   *  `places` (gap-audit HSG-5) — distinct from `hasMore` below, which is
   *  purely about revealing more of what's ALREADY loaded. */
  hasMoreFromServer?: boolean;
  /** True while the next server page is in flight. */
  isLoadingMoreFromServer?: boolean;
  /** Fetch the next server page. */
  onLoadMoreFromServer?: () => void;
}) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [been, setBeen] = useState<Record<string, number>>({});

  // `places` is whatever's been fetched from the server SO FAR (paginated —
  // see `useLocalPlaces`), filtered client-side — mounting every loaded card
  // at once would still mean the grid's live DOM node count grows 1:1 with
  // however much has loaded. Window it the same way MemberDirectoryFilterPage
  // windows its grid: a capped initial slice grown via an IntersectionObserver
  // sentinel, resetting whenever the filtered set's identity changes (a new
  // search/category/vibe result).
  const {
    visible: placesWindowed,
    sentinelRef,
    hasMore,
  } = useIncrementalList(places, { initial: 24, step: 24 });

  // Once every already-loaded place has been revealed locally, pull the next
  // server page (if any) so scrolling to the end of the list keeps growing it
  // instead of dead-ending at whatever page happened to load first.
  useEffect(() => {
    if (hasMore) return;
    if (!hasMoreFromServer || isLoadingMoreFromServer) return;
    onLoadMoreFromServer?.();
  }, [
    hasMore,
    hasMoreFromServer,
    isLoadingMoreFromServer,
    onLoadMoreFromServer,
  ]);

  function toggleExpand(placeId: string) {
    setExpandedId((current) => (current === placeId ? null : placeId));
  }
  function markBeen(placeId: string, currentBeen: number) {
    setBeen((current) => ({ ...current, [placeId]: currentBeen + 1 }));
  }

  // Three distinct states below: the read failed, nothing is listed yet, and
  // the filters matched nothing. The second offers "list a business" and the
  // third offers Clear filters as the primary escape hatch.
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
        ) : isError ? (
          <LoadErrorState
            onRetry={onRetry}
            title={
              <Translation
                i18nKey="marketing:directory.loadError.title"
                components={{ em: <em /> }}
              />
            }
            description={t("marketing:directory.loadError.body")}
          />
        ) : places.length === 0 ? (
          emptyState
        ) : (
          <>
            <div className={s.grid}>
              {placesWindowed.map((place, index) => (
                <LocalPlaceCard
                  key={place.id}
                  place={place}
                  distanceMetres={distanceById?.get(place.id)}
                  index={index}
                  expandedId={expandedId}
                  been={been}
                  onToggleExpand={toggleExpand}
                  onMarkBeen={markBeen}
                />
              ))}
            </div>
            {hasMore && (
              <div
                ref={sentinelRef}
                className={s.sentinel}
                aria-hidden="true"
              />
            )}
            {!hasMore && isLoadingMoreFromServer && (
              <div className={s.loadingMore} aria-live="polite">
                <Sending label={t("marketing:directory.loadingMore")} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
