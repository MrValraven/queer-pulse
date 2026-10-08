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
import type { PinStyle } from "./pins/pinStyle";
import type { TFunction } from "../../shared/i18n/types";
import s from "./localMap.module.css";

// A pin type's localized name: a venue type or a unified category, or
// undefined when it is neither (the housing map's neighbourhood pins).
function localizedTypeLabel(type: string, t: TFunction): string | undefined {
  const typeKey = TYPE_LABEL_KEYS[type] ?? LOCAL_CATEGORY_LABEL_KEYS[type];
  return typeKey ? t(typeKey) : undefined;
}

interface LisbonMapProps {
  venues: VenueMarkerData[];
  freguesia: string | null;
  selectedVenueId: string | null;
  focusedVenueId: string | null;
  /** The venue whose list card is hovered; its pin grows and lights up. */
  hoveredVenueId?: string | null;
  counts: Record<string, number>;
  onSelectFreguesia: (name: string) => void;
  onSelectVenue: (venueId: string) => void;
  /** The list panel floating over the map; the camera keeps clear of it. */
  panelRef?: RefObject<HTMLElement | null>;
  /** The map edge that panel covers right now, or null when it sits outside. */
  panelEdge?: MapPanelEdge | null;
  /** A panel floating along the map's top edge; the camera keeps pins and
   *  fits clear of it (see useLisbonMap). */
  topPanel?: HTMLElement | null;
  /** Full screen state and switch. When given, a button joins the zoom
   *  controls. `redrawHandleRef` receives the map's synchronous redraw (see
   *  useLisbonMap); `toggleButtonRef` receives that button, so focus can
   *  return to it after leaving full screen. */
  fullscreen?: {
    isFullscreen: boolean;
    onToggle: () => void;
    redrawHandleRef?: RefObject<(() => void) | null>;
    toggleButtonRef?: RefObject<HTMLButtonElement | null>;
  };
  /** Aria label builders for the pins and clusters. Replaces the directory's
   *  venue wording when given. */
  markerLabels?: MarkerLabels;
  /** Where the parish names sit against their label points (see
   *  useLisbonMap). "top" leaves room above each point for a pin. */
  parishLabelAnchor?: "center" | "top";
  /** Which pin style the markers draw in: the directory passes "portrait",
   *  the housing map keeps the default "teardrop". Read once, when the map
   *  loads. */
  pinStyle?: PinStyle;
  /** Parishes to shade apart from the selection (see useLisbonMap). */
  highlightedFreguesias?: readonly string[];
}

export function LisbonMap({
  venues,
  freguesia,
  selectedVenueId,
  focusedVenueId,
  hoveredVenueId = null,
  counts,
  onSelectFreguesia,
  onSelectVenue,
  panelRef,
  panelEdge = null,
  topPanel = null,
  fullscreen,
  markerLabels: customMarkerLabels,
  parishLabelAnchor,
  pinStyle = "teardrop",
  highlightedFreguesias,
}: LisbonMapProps) {
  const { t } = useTranslation();
  const meetingPointLabel = t("marketing:map.pin.meetingPoint");
  const defaultMarkerLabels = useMemo<MarkerLabels>(
    () => ({
      venuePin: (name, type) => {
        const localizedType = localizedTypeLabel(type, t) ?? type;
        return t("marketing:map.pinAria", { name, type: localizedType });
      },
      cluster: (count) => t("marketing:map.clusterAria", { count }),
    }),
    [t],
  );
  const markerLabels = customMarkerLabels ?? defaultMarkerLabels;
  // The callout on a selected pin names its category. Callers that already
  // know the label keep theirs; the rest get the same wording the aria label
  // uses, and a type with no label simply shows none. The labelled list is
  // keyed on the label TEXT alone, leaving `t` out: `t` changes identity
  // whenever any catalog namespace finishes loading, and each new venues
  // array makes the map regroup and refresh every pin for no visible change.
  const categoryLabelByType = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const venue of venues) {
      const label = localizedTypeLabel(venue.type, t);
      if (label) labels[venue.type] = label;
    }
    return labels;
  }, [venues, t]);
  const categoryLabelSignature = JSON.stringify(categoryLabelByType);
  const labelledVenues = useMemo(() => {
    const labels = JSON.parse(categoryLabelSignature) as Record<string, string>;
    return venues.map((venue) => {
      const withCategory =
        venue.categoryLabel !== undefined
          ? venue
          : { ...venue, categoryLabel: labels[venue.type] };
      // A meeting point is a public spot, never premises: the pin says so
      // on a second label line.
      return venue.isMeetingPoint
        ? { ...withCategory, secondaryLabel: meetingPointLabel }
        : withCategory;
    });
  }, [venues, categoryLabelSignature, meetingPointLabel]);

  const { containerRef, failed, ready, fullscreenControlHost } = useLisbonMap({
    venues: labelledVenues,
    selectedFreguesia: freguesia,
    selectedVenueId,
    focusedVenueId,
    hoveredVenueId,
    counts,
    markerLabels,
    onSelectFreguesia,
    onSelectVenue,
    panelRef,
    panelEdge,
    topPanel,
    hasFullscreenControl: fullscreen !== undefined,
    redrawHandleRef: fullscreen?.redrawHandleRef,
    parishLabelAnchor,
    pinStyle,
    highlightedFreguesias,
  });

  const fullscreenButtonRef = fullscreen?.toggleButtonRef;
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
            ref={fullscreenButtonRef}
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
