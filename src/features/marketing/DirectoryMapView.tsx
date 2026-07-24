import { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { type LocalPlace } from "./localPlaces";
import { type Venue } from "./map.data";
import { type VenueMarkerData } from "./venueMarker";
import { LisbonMap } from "./LisbonMap";
import { LocalPlaceCard } from "./LocalPlaceCard";
import s from "./localMap.module.css";

/** Adapt a coords-having LocalPlace to the map's marker shape. Venue pins keep their venue-type icon; business pins use their category icon. */
function localPlaceToMarker(place: LocalPlace): VenueMarkerData {
  const coords = place.coords!;
  return {
    id: place.id,
    name: place.name,
    type: place.kind === "venue" ? (place.source as Venue).type : place.category,
    address: place.neighbourhood,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

function VenueCardSkeleton() {
  return (
    <div className={s.vc} aria-hidden>
      <div className={s.vcHead}>
        <SkeletonLine
          width={38}
          height={38}
          style={{ borderRadius: 10, flex: "none" }}
        />
        <div className={s.vcInfo}>
          <SkeletonLine width="60%" height={15} />
          <SkeletonLine width="40%" height={12} style={{ marginTop: 5 }} />
        </div>
        <SkeletonLine
          width={54}
          height={20}
          style={{ borderRadius: 6, flex: "none" }}
        />
      </div>
      <div className={s.vcVibes}>
        <SkeletonLine width={48} height={18} style={{ borderRadius: 6 }} />
        <SkeletonLine width={62} height={18} style={{ borderRadius: 6 }} />
      </div>
    </div>
  );
}

/** The unified map view: Lisbon map of coords-having places + a parish-grouped sidebar of mixed cards. Filtering happens upstream in the shell. */
export function DirectoryMapView({
  places,
  loading,
}: {
  places: LocalPlace[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  const [selectedFreguesia, setSelectedFreguesia] = useState<string | null>(
    null,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [been, setBeen] = useState<Record<string, number>>({});

  const mappable = useMemo(
    () => places.filter((place) => place.coords !== null),
    [places],
  );
  const markers = useMemo(() => mappable.map(localPlaceToMarker), [mappable]);

  const counts = useMemo(() => {
    const byFreguesia: Record<string, number> = {};
    mappable.forEach((place) => {
      byFreguesia[place.freguesia] = (byFreguesia[place.freguesia] ?? 0) + 1;
    });
    return byFreguesia;
  }, [mappable]);

  const items = useMemo(
    () =>
      selectedFreguesia
        ? mappable.filter((place) => place.freguesia === selectedFreguesia)
        : mappable,
    [mappable, selectedFreguesia],
  );

  const groups = useMemo(() => {
    if (selectedFreguesia) return null;
    const grouped: { freguesia: string; places: LocalPlace[] }[] = [];
    items.forEach((place) => {
      let group = grouped.find((entry) => entry.freguesia === place.freguesia);
      if (!group) {
        group = { freguesia: place.freguesia, places: [] };
        grouped.push(group);
      }
      group.places.push(place);
    });
    return grouped;
  }, [items, selectedFreguesia]);

  function selectFreguesia(name: string | null) {
    setSelectedFreguesia(name);
    setExpandedId(null);
  }
  function selectPlace(placeId: string) {
    setExpandedId(placeId);
  }
  function toggleExpand(placeId: string) {
    setExpandedId((current) => (current === placeId ? null : placeId));
  }
  function markBeen(placeId: string, currentBeen: number) {
    setBeen((current) => ({ ...current, [placeId]: currentBeen + 1 }));
  }

  const renderCard = (place: LocalPlace, index: number) => (
    <LocalPlaceCard
      key={place.id}
      place={place}
      index={index}
      expandedId={expandedId}
      been={been}
      onToggleExpand={toggleExpand}
      onMarkBeen={markBeen}
    />
  );

  return (
    <div className="wrap">
      <div className={s.body}>
        <LisbonMap
          venues={markers}
          freguesia={selectedFreguesia}
          selectedVenueId={expandedId}
          counts={counts}
          onSelectFreguesia={selectFreguesia}
          onSelectVenue={selectPlace}
        />

        <aside className={s.sidebar}>
          <div className={s.sbTop}>
            <div>
              <div className={s.sbHeading}>
                {selectedFreguesia ?? t("marketing:map.sidebar.allVenues")}
              </div>
              <div className={s.sbCount}>
                <Translation
                  i18nKey="marketing:map.sidebar.venueCount"
                  values={{ count: items.length }}
                  components={{ b: <b /> }}
                />
              </div>
            </div>
            {selectedFreguesia && (
              <button
                type="button"
                className={s.clear}
                onClick={() => selectFreguesia(null)}
              >
                <FiX /> {t("marketing:map.sidebar.clear")}
              </button>
            )}
          </div>

          {!loading && items.length === 0 && (
            <div className={s.empty}>{t("marketing:map.sidebar.empty")}</div>
          )}

          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <VenueCardSkeleton key={index} />
              ))
            : groups
              ? groups.map((group) => (
                  <div key={group.freguesia}>
                    <div className={s.groupHead}>{group.freguesia}</div>
                    {group.places.map(renderCard)}
                  </div>
                ))
              : items.map(renderCard)}
        </aside>
      </div>
    </div>
  );
}
