import { useState } from "react";
import { Button, Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioTrackView } from "../../api/studio.adapters";
import type { StudioQueueItem } from "../studioPlayerContext";
import { CREDITS_PREVIEW_COUNT } from "./studioSidePanelSections.data";
import { useNowPlayingTrackDetail } from "./useNowPlayingTrackDetail";
import styles from "./StudioNowPlaying.module.css";
import sectionStyles from "./StudioSidePanelSections.module.css";

type StudioTrackCredit = StudioTrackView["credits"][number];

/** The credits as a list of role and name pairs. `visibleCount` keeps the
 *  first ones; left out, every credit shows. */
function CreditRows({
  credits,
  visibleCount,
  className,
}: {
  credits: StudioTrackCredit[];
  visibleCount?: number;
  className?: string;
}) {
  const shown =
    visibleCount === undefined ? credits : credits.slice(0, visibleCount);
  return (
    <dl className={[styles.credits, className].filter(Boolean).join(" ")}>
      {shown.map((credit, index) => (
        <div
          key={`${credit.role}-${credit.name}-${index}`}
          className={styles.credit}
        >
          <dt>{credit.role}</dt>
          <dd>{credit.name}</dd>
        </div>
      ))}
    </dl>
  );
}

function EmptyNote({ textKey }: { textKey: string }) {
  const { t } = useTranslation();
  return <p className={styles.empty}>{t(textKey)}</p>;
}

/** The Credits pane's body: every credit, a loading line while the detail
 *  reads and an empty line when the track has none. */
export function StudioNowPlayingCredits({ trackId }: { trackId: string }) {
  const { track, isLoading } = useNowPlayingTrackDetail(trackId);
  if (isLoading)
    return <EmptyNote textKey="studio:nowPlaying.creditsLoading" />;
  if (!track || track.credits.length === 0)
    return <EmptyNote textKey="studio:nowPlaying.noCredits" />;
  return <CreditRows credits={track.credits} />;
}

/** The side panel's credits for a public track: the first few, with the
 *  rest opening in place from Show all credits in the head row. The section
 *  folds away while the detail reads, when the read fails and when the
 *  track has no credits. The open list closes again on the next track. */
function SidePanelTrackCredits({ trackId }: { trackId: string }) {
  const { t } = useTranslation();
  const { track, isLoading } = useNowPlayingTrackDetail(trackId);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const credits = track && track.id === trackId ? track.credits : [];
  const hasCredits = !isLoading && credits.length > 0;
  const hasMore = credits.length > CREDITS_PREVIEW_COUNT;
  const isExpanded = expandedTrackId === trackId;
  return (
    <Collapse isOpen={hasCredits}>
      <section className={sectionStyles.section}>
        <div className={sectionStyles.sectionHead}>
          <h3 className={sectionStyles.sectionTitle}>
            {t("studio:nowPlaying.tab.credits")}
          </h3>
          <Collapse isOpen={hasMore} className={sectionStyles.sectionAction}>
            <Button
              variant="quiet"
              size="sm"
              className={sectionStyles.sectionLink}
              aria-expanded={isExpanded}
              onClick={() => setExpandedTrackId(isExpanded ? null : trackId)}
            >
              {t(
                isExpanded
                  ? "studio:sidePanel.showFewerCredits"
                  : "studio:sidePanel.showAllCredits",
              )}
            </Button>
          </Collapse>
        </div>
        <CreditRows credits={credits} visibleCount={CREDITS_PREVIEW_COUNT} />
        <Collapse isOpen={hasMore && isExpanded}>
          <CreditRows
            credits={credits.slice(CREDITS_PREVIEW_COUNT)}
            className={sectionStyles.moreCredits}
          />
        </Collapse>
      </section>
    </Collapse>
  );
}

/** Credits in the side panel's Now playing view. A private preview's detail
 *  needs its token, so a preview leaves the section out and never reads it. */
export function StudioSidePanelCredits({ item }: { item: StudioQueueItem }) {
  const isPreview = Boolean(item.previewToken);
  return (
    <Collapse isOpen={!isPreview}>
      {isPreview ? null : <SidePanelTrackCredits trackId={item.trackId} />}
    </Collapse>
  );
}
