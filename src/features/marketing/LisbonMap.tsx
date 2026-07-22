import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useLisbonMap } from "./useLisbonMap";
import { TYPE_LABEL_KEYS, type Venue } from "./map.data";
import type { MarkerLabels } from "./venueMarker";
import s from "./MapPage.module.css";

interface LisbonMapProps {
  venues: Venue[];
  freguesia: string | null;
  selectedVenueId: string | null;
  counts: Record<string, number>;
  onSelectFreguesia: (name: string | null) => void;
  onSelectVenue: (venueId: string) => void;
}

export function LisbonMap({
  venues,
  freguesia,
  selectedVenueId,
  counts,
  onSelectFreguesia,
  onSelectVenue,
}: LisbonMapProps) {
  const { t } = useTranslation();
  const markerLabels = useMemo<MarkerLabels>(
    () => ({
      venuePin: (name, type) => {
        const typeKey = TYPE_LABEL_KEYS[type];
        const localizedType = typeKey ? t(typeKey) : type;
        return t("marketing:map.pinAria", { name, type: localizedType });
      },
      cluster: (count) => t("marketing:map.clusterAria", { count }),
    }),
    [t],
  );

  const { containerRef, failed } = useLisbonMap({
    venues,
    selectedFreguesia: freguesia,
    selectedVenueId,
    counts,
    markerLabels,
    onSelectFreguesia,
    onSelectVenue,
  });

  return (
    <div className={s.mapPanel}>
      <div ref={containerRef} className={s.mapCanvas} aria-hidden={failed} />
      {failed && (
        <div className={s.mapError} role="status">
          {t("marketing:map.mapError")}
        </div>
      )}
    </div>
  );
}
