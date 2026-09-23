import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, type RefObject } from "react";
import { createPortal } from "react-dom";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useLisbonMap, type MapPanelEdge } from "./useLisbonMap";
import { MapLoading } from "./MapLoading";
import { TYPE_LABEL_KEYS } from "./map.data";
import { LOCAL_CATEGORY_LABEL_KEYS } from "./localCategories";
import type { MarkerLabels, VenueMarkerData } from "./venueMarker";
import s from "./localMap.module.css";

interface LisbonMapProps {
  venues: VenueMarkerData[];
  freguesia: string | null;
  selectedVenueId: string | null;
  focusedVenueId: string | null;
  counts: Record<string, number>;
  onSelectFreguesia: (name: string) => void;
  onSelectVenue: (venueId: string) => void;
  /** The list panel floating over the map; the camera keeps clear of it. */
  panelRef?: RefObject<HTMLElement | null>;
  /** The map edge that panel covers right now, or null when it sits outside. */
  panelEdge?: MapPanelEdge | null;
  /** Full screen state and switch. When given, a button joins the zoom
   *  controls. */
  fullscreen?: { isFullscreen: boolean; onToggle: () => void };
}

export function LisbonMap({
  venues,
  freguesia,
  selectedVenueId,
  focusedVenueId,
  counts,
  onSelectFreguesia,
  onSelectVenue,
  panelRef,
  panelEdge = null,
  fullscreen,
}: LisbonMapProps) {
  const { t } = useTranslation();
  const markerLabels = useMemo<MarkerLabels>(
    () => ({
      venuePin: (name, type) => {
        const typeKey =
          TYPE_LABEL_KEYS[type] ?? LOCAL_CATEGORY_LABEL_KEYS[type];
        const localizedType = typeKey ? t(typeKey) : type;
        return t("marketing:map.pinAria", { name, type: localizedType });
      },
      cluster: (count) => t("marketing:map.clusterAria", { count }),
    }),
    [t],
  );

  const { containerRef, failed, ready, fullscreenControlHost } = useLisbonMap({
    venues,
    selectedFreguesia: freguesia,
    selectedVenueId,
    focusedVenueId,
    counts,
    markerLabels,
    onSelectFreguesia,
    onSelectVenue,
    panelRef,
    panelEdge,
    hasFullscreenControl: fullscreen !== undefined,
  });

  const fullscreenLabel = fullscreen?.isFullscreen
    ? t("marketing:map.fullscreen.exit")
    : t("marketing:map.fullscreen.enter");

  return (
    <div className={s.stageMap}>
      <div
        ref={containerRef}
        className={s.stageMapCanvas}
        aria-hidden={failed}
      />
      {!failed && <MapLoading ready={ready} />}
      {failed && (
        <div className={s.mapError} role="status">
          {t("marketing:map.mapError")}
        </div>
      )}
      {/* The control slot lives inside maplibre's own control corner, so the
          button inherits the zoom group's chrome and stacking. */}
      {fullscreen &&
        fullscreenControlHost &&
        createPortal(
          <button
            type="button"
            className={s.fullscreenButton}
            onClick={fullscreen.onToggle}
            aria-label={fullscreenLabel}
            title={fullscreenLabel}
          >
            {fullscreen.isFullscreen ? (
              <FiMinimize2 aria-hidden size={15} />
            ) : (
              <FiMaximize2 aria-hidden size={15} />
            )}
          </button>,
          fullscreenControlHost,
        )}
    </div>
  );
}
