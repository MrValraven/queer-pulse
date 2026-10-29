import { useId, useRef } from "react";
import { routes } from "../../app/routeMap";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { useStudioListeningSummary } from "./api/useStudioListening";
import { StudioListeningPausedBanner } from "./StudioListeningPausedBanner";
import { StudioListeningTopArtists } from "./StudioListeningTopArtists";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioMeSectionHead } from "./StudioMeSectionHead";
import { StudioLine } from "./StudioSkeletons";
import summaryStyles from "./StudioListeningSummary.module.css";
import styles from "./StudioMeTopArtists.module.css";

const SKELETON_ROW_COUNT = 4;
const MAX_TOP_ARTISTS = 6;

function StudioMeTopArtistsSkeleton() {
  return (
    <div className={summaryStyles.skeleton} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className={summaryStyles.skeletonRow}>
          <StudioLine width={40} height={40} />
          <div className={summaryStyles.skeletonText}>
            <StudioLine width="45%" height={14} />
            <StudioLine width="30%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The "You" page's top artists: the member's most played artists over the
 * last 4 weeks (no range picker), capped at six, with a link to the full
 * listening page. It follows the pausable history exactly as Listening does:
 * a banner offers to resume while rows still show, and an empty list says
 * new plays stay out of it. Each state mounts through its own Collapse.
 */
export function StudioMeTopArtists() {
  const { t } = useTranslation();
  const { summary, loadState } = useStudioListeningSummary("4w");
  const { isOn, isAwaitingRow } = useStudioListeningHistorySwitch();
  const isHistoryPaused = !isOn && !isAwaitingRow;
  const headingId = useId();
  const seeAllRef = useRef<HTMLAnchorElement>(null);
  const topArtists = (summary?.topArtists ?? []).slice(0, MAX_TOP_ARTISTS);
  const hasRows = summary !== null && topArtists.length > 0;
  const isEmpty = summary !== null && topArtists.length === 0;
  const emptyKey = isHistoryPaused
    ? "studio:listening.top.pausedEmpty"
    : "studio:listening.top.empty";
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <StudioMeSectionHead
        id={headingId}
        title={t("studio:me.topArtists.heading")}
        seeAllHref={routes.studioListening}
        seeAllLabel={t("studio:me.topArtists.seeAll")}
        seeAllRef={seeAllRef}
      >
        <p className={styles.range}>{t("studio:me.topArtists.range")}</p>
      </StudioMeSectionHead>
      <Collapse isOpen={summary === null && loadState.isLoading}>
        <StudioMeTopArtistsSkeleton />
      </Collapse>
      <Collapse isOpen={summary === null && loadState.isError}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.listening"
        />
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <p className={summaryStyles.empty}>{t(emptyKey)}</p>
      </Collapse>
      <Collapse isOpen={hasRows}>
        <StudioListeningPausedBanner
          onResumed={() => seeAllRef.current?.focus()}
        />
        <StudioListeningTopArtists
          artists={topArtists}
          labelledBy={headingId}
        />
      </Collapse>
    </section>
  );
}
