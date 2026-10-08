import type { ReactNode } from "react";
import { FiNavigation } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import type { GatheringDetail } from "./data";
import {
  gatheringDirectionsHref,
  gatheringMapPoint,
  gatheringPlaceParts,
} from "./gatheringLocation";
import { GatheringWhereMap } from "./GatheringWhereMap";
import styles from "./GatheringDetailPanels.module.css";

// The gathering page's own mobile cutover (`@media (--mobile)` in
// GatheringPage.module.css): at and below it the page is one column.
const MOBILE_QUERY = mediaMax("mobile");

/**
 * The body of the Where panel: the rows, closed by "Take me there", and on a
 * desktop a map beside them. The map only mounts at the page's desktop width,
 * so a phone never downloads the basemap; below it the rows read as they
 * always have. An online gathering, or one with nowhere to draw, keeps the
 * single column and gets no button.
 */
export function GatheringWhereLayout({
  gathering,
  children,
}: {
  gathering: GatheringDetail;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const mapPoint = isMobile ? null : gatheringMapPoint(gathering);
  const directionsHref = gatheringDirectionsHref(gathering);
  const { venueName, neighbourhood } = gatheringPlaceParts(gathering);

  const info = (
    <>
      {children}
      {directionsHref && (
        <Button
          className={styles.whereDirections}
          variant="soft"
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiNavigation aria-hidden />
          {t("gatherings:gathering.where.takeMeThere")}
        </Button>
      )}
    </>
  );

  if (!mapPoint) return <div className={styles.whereInfo}>{info}</div>;

  return (
    <div className={styles.whereSplit}>
      <div className={styles.whereGrid}>
        <GatheringWhereMap
          point={mapPoint}
          ariaLabel={
            mapPoint.precision === "exact"
              ? t("gatherings:gathering.where.mapAriaExact", {
                  name: venueName,
                })
              : t("gatherings:gathering.where.mapAriaArea", {
                  area: neighbourhood,
                })
          }
        />
        <div className={styles.whereInfo}>{info}</div>
      </div>
    </div>
  );
}
